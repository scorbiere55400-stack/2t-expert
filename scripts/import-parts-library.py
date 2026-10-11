"""Version the complete supplied parts corpus as searchable, on-demand site data.

Run with the original ZIP. No merchant images or affiliate links are invented.
The compact index loads only in the parts view; full offers, applications and
source evidence are sharded and fetched only when a reference is opened.
"""

import collections
import gzip
import hashlib
import json
import sys
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DEST = ROOT / 'public/parts-data'
PREFIX = 'bibliotheque_pieces_2T_Expert/'


def dump(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    payload = (json.dumps(value, ensure_ascii=False, separators=(',', ':')) + '\n').encode('utf-8')
    if path.suffix == '.gz':
        with path.open('wb') as output, gzip.GzipFile(fileobj=output, mode='wb', mtime=0, compresslevel=9) as stream:
            stream.write(payload)
    else:
        path.write_bytes(payload)


def main(archive_path):
    with zipfile.ZipFile(archive_path) as archive:
        names = set(archive.namelist())
        if any(n.startswith('/') or '..' in n.split('/') for n in names):
            raise ValueError('Unsafe archive path')
        manifest = json.loads(archive.read(PREFIX + 'manifest.json'))['files']
        for name in ('base_pieces_2T_Expert.json', 'statistiques.json'):
            payload = archive.read(PREFIX + name)
            if len(payload) != manifest[name]['bytes'] or hashlib.sha256(payload).hexdigest() != manifest[name]['sha256']:
                raise ValueError(f'Invalid archive checksum: {name}')
        data = json.loads(archive.read(PREFIX + 'base_pieces_2T_Expert.json'))

    parts = data['parts']
    offers = collections.defaultdict(list)
    fitments = collections.defaultdict(list)
    machines = {m['machine_id']: m for m in data['machines']}
    catalogue_machines = {m['id'] for m in json.loads((ROOT / 'data/technical-catalog.json').read_text())['machines']}
    assert set(machines) == catalogue_machines
    assert len(parts) == 14125 and len(data['offers']) == 14125 and len(data['fitments']) == 32402
    assert len({p['part_id'] for p in parts}) == len(parts)
    for offer in data['offers']:
        offers[offer['part_id']].append(offer)
    for fitment in data['fitments']:
        fitments[fitment['part_id']].append(fitment)

    shards = collections.defaultdict(dict)
    index = []
    for part in parts:
        id = part['part_id']
        offer = offers[id][0]
        if not set(part['machine_ids']).issubset(machines):
            raise ValueError(f'Unknown model relation on {id}')
        index.append({
            'id': id, 'name': part['name'], 'ref': part['reference'],
            'maker': part['manufacturer'], 'type': part['reference_type'],
            'sellerRefs': [o['seller_reference'] for o in offers[id] if o['seller_reference']],
            'category': part['category'], 'engine': part['engine_family_mentions'],
            'machines': part['machine_ids'], 'seller': offer['seller'],
            'price': offer['price_observed'], 'currency': offer['currency'],
            'availability': offer['availability_status'],
            'dated': offer['checked_at'][:10], 'origin': part['origin'],
            'restricted': bool(part['restriction_notes']),
        })
        shards[id[6:8]][id] = {'part': part, 'offers': offers[id], 'fitments': fitments[id]}

    # The earlier Sherco 2024 microfiche is a distinct, cited corpus.
    legacy = json.loads((ROOT / 'lib/sherco-parts.json').read_text())
    assert len(legacy) == 77
    for item in legacy:
        id = item['id']
        machine_ids = ['2TE-M-0141', '2TE-M-0143']
        for machine_id in machine_ids:
            machines[machine_id]['linked_part_count'] += 1
        index.append({
            'id': id, 'name': item['name'], 'ref': item['ref'], 'sellerRefs': [], 'maker': 'Sherco',
            'type': 'origine_constructeur', 'category': item['category'],
            'engine': [], 'machines': machine_ids, 'seller': 'Sherco — microfiche 2024',
            'price': None, 'currency': None, 'availability': 'catalogue_sans_stock',
            'dated': item['checkedAt'], 'origin': 'origine', 'restricted': False,
        })
        shards['sherco'][id] = {
            'part': {'part_id': id, 'name': item['name'], 'reference': item['ref'],
                     'manufacturer': 'Sherco', 'reference_type': 'origine_constructeur',
                     'manufacturer_reference': item['ref'], 'category': item['category'],
                     'source_category': 'Microfiche 2024', 'origin': 'origine',
                     'source_ids': [], 'engine_family_mentions': [], 'restriction_notes': [],
                     'publication_status': 'reference_documentee', 'machine_ids': machine_ids,
                     'fitment_status': 'application_catalogue_a_confirmer'},
            'offers': [{'offer_id': 'SHERCO-' + id, 'part_id': id,
                        'seller': 'Sherco — microfiche 2024', 'seller_reference': item['ref'],
                        'url': item['source'] + '#page=' + str(item['page']),
                        'price_observed': None, 'currency': None, 'tax_basis': 'a_confirmer',
                        'availability_status': 'catalogue_sans_stock',
                        'availability_text': 'Référence documentaire ; aucun stock relevé.',
                        'checked_at': item['checkedAt'], 'source_id': None, 'affiliate_url': None}],
            'fitments': [{'fitment_id': 'SHERCO-FIT-' + id, 'part_id': id,
                          'machine_ids': machine_ids, 'source_brand': 'Sherco',
                          'source_model': '50 RS SM / END', 'years_text': '2024',
                          'model_code': None, 'market_text': None,
                          'evidence_level': 'catalogue_constructeur',
                          'mapping_status': 'application_catalogue_a_confirmer',
                          'installation_verified': False, 'source_id': None,
                          'source_url': item['source'] + '#page=' + str(item['page'])}],
            'catalogue_position': item['position'], 'catalogue_page': item['page'],
        }

    if DEST.exists():
        for path in DEST.rglob('*.json'):
            path.unlink()
        for path in DEST.rglob('*.json.gz'):
            path.unlink()
    for shard, records in shards.items():
        dump(DEST / 'details' / f'{shard}.json.gz', records)
    dump(DEST / 'index.json.gz', index)
    dump(DEST / 'machines.json.gz', list(machines.values()))
    dump(DEST / 'sources.json.gz', data['sources'])
    dump(DEST / 'meta.json', {
        'generated_at': data['generated_at'],
        'parts': len(index), 'imported_parts': len(parts), 'existing_sherco_parts': len(legacy),
        'offers': len(data['offers']) + len(legacy),
        'fitments': len(data['fitments']) + len(legacy),
        'sources': len(data['sources']) + 1,
        'machines': len(machines),
        'machines_with_candidates': sum(bool(m['linked_part_count']) for m in machines.values()),
        'note': 'Rattachements proposés, montage et disponibilités non garantis.',
    })
    print(f'{len(index)} indexed references, {len(shards)} detail shards; {sum(p.stat().st_size for p in DEST.rglob("*.gz"))/1e6:.1f} MB compressed')


if __name__ == '__main__':
    main(sys.argv[1])
