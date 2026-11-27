"""Bound storage for one genuine builder regression, without changing its work.

The builder still reads the full editable src, computes every pack, bundles all
scripts, and hashes the actual outputs. Only proven identical READONLY files in
an explicitly supplied immutable build can share storage with generated test
files. Mutable source files never share an inode with either build.
"""
from contextlib import contextmanager
import hashlib
import os
from pathlib import Path
import shutil
import stat
from unittest import mock


def _sha_file(path):
    digest = hashlib.sha256()
    with Path(path).open('rb') as stream:
        while block := stream.read(1024 * 1024):
            digest.update(block)
    return digest.hexdigest()


def _readonly(path):
    value = Path(path).stat()
    if os.name == 'nt':
        return bool(value.st_file_attributes & stat.FILE_ATTRIBUTE_READONLY)
    return not bool(value.st_mode & 0o222)


def _regular(path):
    path = Path(path)
    if not path.is_file() or path.is_symlink() or getattr(path, 'is_junction', lambda: False)():
        return False
    value = path.stat(follow_symlinks=False)
    return not bool(getattr(value, 'st_file_attributes', 0) & 0x400)


def _unlink_generated_file(path):
    """Unlink ONE validated entry; never clear attributes shared by hardlinks."""
    path = Path(path)
    if not _regular(path):
        raise ValueError('Generated cleanup refuses linked/nonregular entry')
    if os.name != 'nt':
        path.unlink()
        return
    import ctypes
    from ctypes import wintypes
    kernel = ctypes.WinDLL('kernel32', use_last_error=True)
    kernel.CreateFileW.argtypes = [wintypes.LPCWSTR, wintypes.DWORD, wintypes.DWORD,
                                  wintypes.LPVOID, wintypes.DWORD, wintypes.DWORD, wintypes.HANDLE]
    kernel.CreateFileW.restype = wintypes.HANDLE
    kernel.SetFileInformationByHandle.argtypes = [wintypes.HANDLE, ctypes.c_int,
                                                 wintypes.LPVOID, wintypes.DWORD]
    kernel.SetFileInformationByHandle.restype = wintypes.BOOL
    kernel.CloseHandle.argtypes = [wintypes.HANDLE]
    kernel.CloseHandle.restype = wintypes.BOOL
    handle = kernel.CreateFileW(str(path), 0x10000, 7, None, 3, 0x00200000, None)
    if handle == wintypes.HANDLE(-1).value:
        raise ctypes.WinError(ctypes.get_last_error())
    try:
        # FileDispositionInfoEx: DELETE | POSIX_SEMANTICS | IGNORE_READONLY_ATTRIBUTE.
        flags = wintypes.DWORD(0x13)
        if not kernel.SetFileInformationByHandle(handle, 21, ctypes.byref(flags), ctypes.sizeof(flags)):
            raise ctypes.WinError(ctypes.get_last_error())
    finally:
        if not kernel.CloseHandle(handle):
            raise ctypes.WinError(ctypes.get_last_error())
    if path.exists():
        raise OSError('Generated file entry survived unlink')


def _readonly_entries(root):
    """Walk only a generated scope, rejecting reparse points before descent."""
    pending = [root]
    while pending:
        folder = pending.pop()
        for entry in os.scandir(folder):
            value = entry.stat(follow_symlinks=False)
            if entry.name == '.git' or entry.is_symlink() or getattr(value, 'st_file_attributes', 0) & 0x400:
                raise ValueError('Generated cleanup refuses Git/reparse entry')
            if entry.is_dir(follow_symlinks=False):
                pending.append(Path(entry.path))
            elif entry.is_file(follow_symlinks=False) and _readonly(entry.path):
                yield Path(entry.path)


@contextmanager
def immutable_build_fixture(builder, reference_site=None):
    """Scope library patches OUTSIDE this test's outer build_staging context.

    If SOFFIOLIEVE_TEST_SITE is absent, preserve the original behavior exactly.
    An explicit reference_site exists solely for small helper contract tests.
    """
    selected = reference_site if reference_site is not None else os.environ.get('SOFFIOLIEVE_TEST_SITE')
    stats = {'enabled': bool(selected), 'linkedCopies': 0, 'linkedPacks': 0, 'detachedWrites': 0}
    if not selected:
        yield stats
        return
    reference = Path(selected).absolute()
    if not reference.is_dir() or reference.resolve() != reference:
        raise ValueError('Immutable fixture reference must be a real directory')
    source = (builder.ROOT / 'src').resolve()
    if reference == source or source in reference.parents or reference in source.parents:
        raise ValueError('Immutable reference cannot be editable source')
    original_staging = builder.build_staging
    original_copy, original_write = shutil.copyfile, Path.write_bytes
    owned = []
    peers = set()

    def generated(path):
        path = Path(path).absolute()
        if not any(root == path or root in path.parents for root in owned):
            return False
        if path.resolve() != path:
            raise ValueError('Fixture destination resolves outside generated scope')
        return True

    def peer_for(relative, expected, size, mutable_source=None):
        peer = reference / relative
        if not _regular(peer) or peer.resolve() != peer or not _readonly(peer) or peer.stat().st_size != size:
            return None
        if mutable_source is not None and os.path.samefile(mutable_source, peer):
            raise ValueError('Editable source shares immutable reference inode')
        if _sha_file(peer) != expected:
            return None
        return peer

    def detach(path):
        if path.exists() and (_readonly(path) or path.stat().st_nlink > 1):
            _unlink_generated_file(path)
            stats['detachedWrites'] += 1

    def link(peer, destination):
        detach(destination)
        if destination.exists():
            # A private writable old output may also be replaced by the proven link.
            _unlink_generated_file(destination)
        os.link(peer, destination)
        if not os.path.samefile(peer, destination) or not _readonly(peer) or not _readonly(destination):
            raise AssertionError('Immutable fixture hardlink identity failed')
        peers.add(peer)

    def copy(src, dst, *args, **kwargs):
        src, dst = Path(src).absolute(), Path(dst).absolute()
        if generated(dst) and source in src.parents and _regular(src):
            expected = _sha_file(src)
            peer = peer_for(src.relative_to(source), expected, src.stat().st_size, src)
            if peer is not None:
                link(peer, dst)
                stats['linkedCopies'] += 1
                return str(dst)
        if generated(dst):
            detach(dst)
        return original_copy(src, dst, *args, **kwargs)

    def write_bytes(dst, raw):
        dst = Path(dst).absolute()
        if generated(dst) and dst.name.endswith('-pack.bin'):
            root = next(root for root in reversed(owned) if root in dst.parents)
            relative = dst.relative_to(root)
            if 'assets' in relative.parts:
                relative = Path(*relative.parts[relative.parts.index('assets'):])
                expected = hashlib.sha256(raw).hexdigest()
                peer = peer_for(relative, expected, len(raw))
                if peer is not None:
                    link(peer, dst)
                    stats['linkedPacks'] += 1
                    return len(raw)
        if generated(dst):
            detach(dst)
        return original_write(dst, raw)

    @contextmanager
    def staging(*args, **kwargs):
        with original_staging(*args, **kwargs) as folder:
            root = Path(folder).absolute()
            if root.resolve() != root or not root.is_dir() or reference == root or reference in root.parents \
                    or root in reference.parents or root == source or root in source.parents or source in root.parents:
                raise ValueError('Fixture staging must be a separate generated directory')
            owned.append(root)
            try:
                yield folder
            finally:
                # Published inner output can now be under the outer test stage.
                # Remove readonly names before the ORIGINAL staging rmtree runs.
                try:
                    if root.exists():
                        for entry in _readonly_entries(root):
                            _unlink_generated_file(entry)
                finally:
                    owned.remove(root)

    try:
        with mock.patch.object(builder, 'build_staging', staging), \
                mock.patch.object(shutil, 'copyfile', copy), \
                mock.patch.object(Path, 'write_bytes', write_bytes):
            yield stats
    finally:
        if owned:
            raise AssertionError('Immutable fixture escaped its staging lifetime')
        for peer in peers:
            if not peer.exists() or not _readonly(peer):
                raise AssertionError('Immutable reference readonly peer was changed')
