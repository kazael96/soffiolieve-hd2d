"""Export native eighth-badge effects10/49 with the shared audited receipt reader."""
import argparse
import importlib.util
from pathlib import Path

spec = importlib.util.spec_from_file_location('native_badge_export', Path(__file__).with_name('extract-quake-badge.py'))
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('rom', type=Path)
    parser.add_argument('output', type=Path)
    parser.add_argument('--apicula', type=Path, required=True)
    parser.add_argument('--work-dir', type=Path, required=True)
    args = parser.parse_args()
    report = module.export(args.rom, args.output, args.apicula, args.work_dir, badge='legend')
    print('Exported native Legend Badge effects10/49; files:', len(report['files']))
