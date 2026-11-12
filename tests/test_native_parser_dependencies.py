from pathlib import Path
import subprocess
import sys
import unittest

class NativeParserDependencies(unittest.TestCase):
    def test_native_gym_tables_can_be_checked_without_optional_geometry_converter_packages(self):
        root=Path(__file__).resolve().parents[1]
        code="""import importlib.util, sys
sys.path.insert(0, 'tools')
spec=importlib.util.spec_from_file_location('pure_native_gym', 'tools/extract-league-gym.py')
module=importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
assert callable(module.native_track) and callable(module.pattern_tracks) and callable(module.rows)
assert 'numpy' not in sys.modules and 'PIL' not in sys.modules
"""
        result=subprocess.run([sys.executable,'-S','-c',code],cwd=root,text=True,capture_output=True,timeout=15)
        self.assertEqual(result.returncode,0,result.stderr)

if __name__=='__main__':unittest.main()
