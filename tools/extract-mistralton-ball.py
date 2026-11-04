"""Compatibility entry point: regenerate all four reachable market ball graphics."""
from pathlib import Path
import runpy
runpy.run_path(str(Path(__file__).with_name('extract-mistralton-balls.py')),run_name='__main__')
