#!/usr/bin/env python3
"""Construit le composant autonome. Python 3, bibliothèque standard uniquement."""
from pathlib import Path
import json

ROOT = Path(__file__).resolve().parent.parent
source = (ROOT / 'src/mecabot.js').read_text(encoding='utf-8')
for marker, filename in [('CSS', 'mecabot.css'), ('ART', 'avatar.html')]:
    needle = f"/*__MECABOT_{marker}__*/ ''"
    if source.count(needle) != 1:
        raise SystemExit(f'Marqueur invalide : {marker}')
    content = (ROOT / 'src' / filename).read_text(encoding='utf-8')
    source = source.replace(needle, json.dumps(content, ensure_ascii=False))
(ROOT / 'dist').mkdir(exist_ok=True)
target = ROOT / 'dist/mecabot.js'
target.write_text(source, encoding='utf-8')
print(f'Construit : {target.name} ({target.stat().st_size} octets)')
