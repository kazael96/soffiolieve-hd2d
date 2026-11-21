"""Immutable, content-addressed transport storage for serialized QA servers.

Callers serialize publication with their existing renderer lease. Historical
fixture paths remain available as read-only hard links, with identical bytes.
This is transport storage, not a source-execution or visual acceptance gate.
"""
import hashlib
import os
from pathlib import Path
import stat


def publish_bundle(payload, destination, store):
    if not isinstance(payload, bytes):
        raise TypeError('Bundle payload must be exact bytes')
    destination, store = Path(destination).absolute(), Path(store).absolute()
    if destination.exists() or destination.is_symlink():
        raise FileExistsError('Preserve the existing fixture bundle')
    for path in (destination.parent, store):
        if path.resolve() != path:
            raise ValueError('Bundle paths must not traverse links')
    store.mkdir(parents=True, exist_ok=True)
    digest = hashlib.sha256(payload).hexdigest()
    blob = store / (digest + '.js')
    if blob.is_symlink():
        raise ValueError('Refusing linked cache entry')
    created = not blob.exists()
    if created:
        # Exclusive create preserves a partial file if writing fails. A future
        # caller rejects its hash instead of silently serving or overwriting it.
        with blob.open('xb') as output:
            output.write(payload)
        if hashlib.sha256(blob.read_bytes()).hexdigest() != digest:
            raise ValueError('New bundle content verification failed')
        blob.chmod(stat.S_IREAD | stat.S_IRGRP | stat.S_IROTH)
    if hashlib.sha256(blob.read_bytes()).hexdigest() != digest:
        raise ValueError('Cached bundle content verification failed')
    if blob.stat().st_mode & stat.S_IWRITE:
        raise ValueError('Cached bundle must be immutable')
    os.link(blob, destination)
    if not os.path.samefile(blob, destination):
        raise ValueError('Fixture must reference the verified immutable bundle')
    if hashlib.sha256(destination.read_bytes()).hexdigest() != digest:
        raise ValueError('Published fixture content verification failed')
    return {'sha256': digest, 'bytes': len(payload), 'created': created,
            'blob': str(blob), 'destination': str(destination),
            'hardLink': True, 'readOnly': True,
            'scope': 'Serialized QA transport only; identical logical bytes and fixture paths, not source execution or visual approval'}
