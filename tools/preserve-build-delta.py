"""Preserve every build file against a complete ZIP; verify reconstruction, never delete."""
import argparse, hashlib, json, zipfile
from pathlib import Path

def sha(data):
    return hashlib.sha256(data).hexdigest()

def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('build', type=Path)
    p.add_argument('base', type=Path)
    p.add_argument('output', type=Path, help='New external report prefix')
    a = p.parse_args()
    target, base, prefix = a.build.resolve(strict=True), a.base.resolve(strict=True), a.output.resolve()
    if not target.is_dir() or (target/'.git').exists() or target.is_symlink():
        raise ValueError('Expected generated build without Git or links')
    if prefix.is_relative_to(target):
        raise ValueError('Preservation must be external to build')
    delta = prefix.with_name(prefix.name+'-delta.zip')
    manifest = prefix.with_name(prefix.name+'-complete-manifest.json')
    proof = prefix.with_name(prefix.name+'-proof.json')
    if any(f.exists() for f in [delta,manifest,proof]):
        raise ValueError('Refusing to overwrite previous preservation')
    prefix.parent.mkdir(parents=True, exist_ok=True)
    inventory, changed = {}, []
    with zipfile.ZipFile(base) as previous, zipfile.ZipFile(delta,'x',compression=zipfile.ZIP_DEFLATED,compresslevel=1) as archive:
        base_files = set(previous.namelist())
        for file in sorted(target.rglob('*')):
            if file.is_symlink() or file.is_junction() or '.git' in file.relative_to(target).parts:
                raise ValueError('Build contains link or Git directory')
            if not file.is_file():
                continue
            name = file.relative_to(target).as_posix()
            data = file.read_bytes()
            inventory[name] = sha(data)
            if name not in base_files or sha(previous.read(name)) != inventory[name]:
                archive.writestr(name,data)
                changed.append(name)
    manifest.write_text(json.dumps(inventory,sort_keys=True,indent=2)+'\n',encoding='utf8')
    with zipfile.ZipFile(base) as previous, zipfile.ZipFile(delta) as archive:
        if archive.testzip() is not None:
            raise ValueError('Delta CRC failure')
        changed = set(archive.namelist())
        for name, expected in inventory.items():
            reconstructed = archive.read(name) if name in changed else previous.read(name)
            if sha(reconstructed) != expected or sha((target/name).read_bytes()) != expected:
                raise ValueError('Reconstruction mismatch: '+name)
    result = dict(target=str(target),files=len(inventory),fullBaseArchive=str(base),fullBaseSHA256=sha(base.read_bytes()),deltaArchive=str(delta),deltaSHA256=sha(delta.read_bytes()),changedFiles=len(changed),completeManifest=str(manifest),completeManifestSHA256=sha(manifest.read_bytes()),verification='Every build file including all asset subdirectories reconstructed and SHA256 compared; complete inventory excludes removed base files',deltaBytes=delta.stat().st_size)
    proof.write_text(json.dumps(result,indent=2)+'\n',encoding='utf8')
    print(json.dumps(result))

if __name__ == '__main__':
    main()
