import ast
import importlib.util
import json
from pathlib import Path
import unittest
from unittest import mock


ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('league_export', ROOT / 'tools/extract-league.py')
exporter = importlib.util.module_from_spec(spec)
spec.loader.exec_module(exporter)


class LeagueExportTests(unittest.TestCase):
    def test_scope_preserves_reviewed_commands_and_refuses_partial_programs(self):
        source = exporter.build_source()
        tree = ast.parse(source)
        selected = next(ast.literal_eval(n.value) for n in tree.body
                        if isinstance(n, ast.Assign) and any(isinstance(t, ast.Name) and t.id == 'selected' for t in n.targets))
        self.assertEqual(len(selected), len(set(selected)))
        self.assertTrue({120, 121, 123, 132, 136, 146, 214, 228, 355, 364} <= set(selected))
        self.assertFalse(set(selected) & {114, 137, 140, 144, 145, *range(264, 279), 365})
        context = {'table': json.loads((ROOT / 'tools/irbi-field-commands.json').read_text(encoding='utf-8')),
                   'Path': Path, 'json': json, '__file__': str(ROOT / 'tools/extract-league.py')}
        for n in tree.body:
            if isinstance(n, ast.Expr) and isinstance(n.value, ast.Call) and isinstance(n.value.func, ast.Attribute) and isinstance(n.value.func.value, ast.Name) and n.value.func.value.id == 'table' and n.value.func.attr == 'update':
                eval(compile(ast.Expression(n.value), '<reviewed tables>', 'eval'), context)
        for opcode, name in {'57': 'MsgCloseImmediate', '140': 'CallBattleBlackout', '149': 'TrainerSetDefeated',
                             '213': 'BadgeCheck', '214': 'BadgeSet', '286': 'BadgeRegisterParty'}.items():
            self.assertEqual(context['table'][opcode]['name'], name)
        self.assertEqual(context['table']['407']['args'], ['u16', 'u16'])
        self.assertIn("raise SystemExit('Event extraction incomplete; no partial catalog exported')", source)
        self.assertNotIn('subprocess.run(', source)

    def test_converters_stay_invisible_on_windows_and_preserve_other_flags(self):
        with mock.patch.object(exporter.os, 'name', 'nt'), mock.patch.object(exporter.subprocess, 'run') as run:
            exporter._quiet_run(['apicula', 'convert'], capture_output=True, creationflags=32)
            self.assertEqual(run.call_args.kwargs['creationflags'], 32 | 0x08000000)
        with mock.patch.object(exporter.os, 'name', 'posix'), mock.patch.object(exporter.subprocess, 'run') as run:
            exporter._quiet_run(['apicula', 'convert'], capture_output=True)
            self.assertNotIn('creationflags', run.call_args.kwargs)


if __name__ == '__main__':
    unittest.main()
