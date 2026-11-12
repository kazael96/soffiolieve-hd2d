"""Center146 native shop9, overlay21 stock index15; read-only IRBI extraction."""
from pathlib import Path
import argparse, importlib.util


def extend(rom_path, output):
    spec=importlib.util.spec_from_file_location('native_market',Path(__file__).with_name('extend-opelucid-market.py'))
    module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
    return module.extend_stock(rom_path,output,catalog='league',stock_id=9)


if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('rom');parser.add_argument('output',type=Path)
    args=parser.parse_args();extend(args.rom,args.output)
