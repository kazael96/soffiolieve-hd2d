"""Apply QA source replacements to the classic-script transport actually loaded.

This changes only a separate fixture. Source order/global script boundaries stay
identical to build-site.bundle_entries; unknown transports fail explicitly.
"""
import hashlib
import json

HEADER = '/* Generated classic-script transport; source files remain available. */\n'
PREFIX = HEADER + 'for(const [file,source] of '
SUFFIX = '){const tag=document.createElement("script");tag.textContent=source+"\\n//# sourceURL="+new URL(file,location.href).href;document.body.append(tag);tag.remove();}\n'


def rewrite(bundle, replacements):
    if not bundle.startswith(PREFIX):
        raise ValueError('Unsupported classic-script transport prefix')
    rows, end = json.JSONDecoder().raw_decode(bundle, len(PREFIX))
    if bundle[end:] != SUFFIX:
        raise ValueError('Unsupported classic-script transport suffix')
    if not isinstance(rows, list) or not rows:
        raise ValueError('Missing transported source entries')
    names = []
    for row in rows:
        if not isinstance(row, list) or len(row) != 2 or not all(isinstance(v, str) for v in row):
            raise ValueError('Invalid transported source entry')
        if row[0] in names:
            raise ValueError('Duplicate transported source: ' + row[0])
        names.append(row[0])
    if set(replacements) - set(names):
        raise ValueError('Replacement is not in transported sources: ' + ', '.join(sorted(set(replacements) - set(names))))
    proof = []
    result = []
    for name, source in rows:
        replacement = replacements.get(name, source)
        if not isinstance(replacement, str):
            raise ValueError('Replacement source must be a string')
        if name in replacements:
            proof.append({'file': name, 'previousSourceSHA256': hashlib.sha256(source.encode('utf8')).hexdigest(), 'executedSourceSHA256': hashlib.sha256(replacement.encode('utf8')).hexdigest(), 'changed': source != replacement})
        result.append([name, replacement])
    output = PREFIX + json.dumps(result, ensure_ascii=True, separators=(',', ':')) + SUFFIX
    if not replacements:
        output = bundle
    return output, {'sourceOrder': names, 'replacements': proof, 'sourceEntries': len(names), 'scope': 'Transport/source proof only. Runtime function verification and actual renderer checks are still required.'}
