"""Import the supplied 2T Expert photo archive without publishing unlicensed images.

Usage: python scripts/import-photo-library.py /path/to/bibliotheque_photos_2T_Expert.zip
The explicit model overrides fix a few incorrect matches in the source index.
"""

import json
import re
import sys
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PREFIX = 'outputs/bibliotheque_photos_2T_Expert/'
PHOTO_DIR = ROOT / 'public/assets/technical-library'
CORRECTIONS = {
    # The archive indexes these pictures under unrelated or grouped entries.
    'vehicules__V096_aprilia_area_51.jpg': '2TE-M-0509',
    'vehicules__V095_aprilia_sr50.jpg': '2TE-M-0506',
    'vehicules__V091_piaggio_zip.jpg': '2TE-M-0477',
    'vehicules__V127_suzuki_rgv250.jpg': '2TE-M-0718',
    'vehicules__V132_aprilia_rs125.jpg': '2TE-M-0753',
    'vehicules__V135_cagiva_mito.png': '2TE-M-0772',
}


def main(archive_path):
    machines = {m['id']: m for m in json.loads((ROOT / 'data/technical-catalog.json').read_text())['machines']}
    published = json.loads((ROOT / 'data/technical-photos.json').read_text())
    with zipfile.ZipFile(archive_path) as archive:
        names = set(archive.namelist())
        if any(n.startswith('/') or '..' in n.split('/') for n in names):
            raise ValueError('Unsafe archive path')
        entries = json.loads(archive.read(PREFIX + 'index.json'))['entries']
        if {e['id'] for e in entries} != machines.keys():
            raise ValueError('The photo archive does not match this catalogue')

        # Store editorial leads, including their rights status, without exposing
        # source image URLs or importing any unlicensed bytes into public assets.
        candidates = {}
        eligible = {}
        for entry in entries:
            leads = []
            for photo in entry['photos']:
                leads.append({key: photo.get(key) for key in
                              ('status', 'local_file', 'title', 'source', 'credit', 'license', 'license_url')})
                path = photo.get('local_file')
                license_name = photo.get('license') or ''
                if not path or not path.startswith('images/grouped/vehicules__'):
                    continue
                if not (license_name.startswith(('CC BY ', 'CC BY-SA ', 'CC0')) or license_name == 'Public domain'):
                    continue
                filename = Path(path).name
                target = CORRECTIONS.get(filename, entry['id'] if photo['status'] == 'exact_model' else None)
                if target is None or target in published:
                    continue
                if target == entry['id'] and entry['brand'].casefold() not in photo['title'].casefold():
                    continue
                if PREFIX + path not in names:
                    raise ValueError(f'Missing photo: {path}')
                eligible.setdefault(target, (path, photo))
            candidates[entry['id']] = {
                'status': entry['photo_status'],
                'photos': leads,
                'search_query': entry['search']['query'],
            }

        PHOTO_DIR.mkdir(parents=True, exist_ok=True)
        for id, (path, photo) in sorted(eligible.items()):
            filename = Path(path).name
            data = archive.read(PREFIX + path)
            if filename.lower().endswith('.jpg') and not data.startswith(b'\xff\xd8\xff'):
                raise ValueError(f'Invalid JPEG: {path}')
            if filename.lower().endswith('.png') and not data.startswith(b'\x89PNG\r\n\x1a\n'):
                raise ValueError(f'Invalid PNG: {path}')
            (PHOTO_DIR / filename).write_bytes(data)
            machine = machines[id]
            model = f"{machine['brand']} {machine['model']}"
            license_name = photo['license']
            credit = re.sub(r'\s+', ' ', photo.get('credit') or '').strip() or 'Auteur indiqué sur la source'
            if filename in CORRECTIONS or machine['model'] not in photo['title']:
                caption = f"{photo['title']} — photo illustrative de la famille {model}, version et millésime à vérifier."
            else:
                caption = f"{photo['title']} — exemplaire illustratif ; millésime et variante de la fiche à vérifier."
            published[id] = {
                'src': f'/assets/technical-library/{filename}',
                'alt': f"Photographie de {photo['title']}",
                'caption': caption,
                'source': photo['source'],
                'credit': f'Photo : {credit} · {license_name}',
                'licenseUrl': photo.get('license_url') or ('https://creativecommons.org/publicdomain/zero/1.0/' if license_name == 'CC0' else ''),
            }

        for id, photo in published.items():
            if id in candidates:
                candidates[id]['published_src'] = photo['src']

    (ROOT / 'data/technical-photos.json').write_text(json.dumps(dict(sorted(published.items())), ensure_ascii=False, indent=2) + '\n')
    (ROOT / 'data/technical-photo-candidates.json').write_text(json.dumps(candidates, ensure_ascii=False, separators=(',', ':')) + '\n')
    print(f'{len(eligible)} new photos, {len(published)} published photos total, {len(candidates)} catalogue records')


if __name__ == '__main__':
    main(sys.argv[1])
