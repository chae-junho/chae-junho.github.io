import json
import os
import re
import subprocess
import sys
import tempfile
import urllib.request
from datetime import datetime, timezone

SOURCE = os.environ.get('VISITS_SOURCE') or 'https://mapmyvisitors.com/ajax/live_hits?id=2238843&last_hit_id=1&max_hit_id=1'
BRANCH = 'data'
KEEP = 40


def fetch(url):
    request = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (compatible; visit-log-copy)'})
    with urllib.request.urlopen(request, timeout=30) as response:
        return json.loads(response.read().decode('utf-8'))


def visits(data):
    rows = []
    for hit in data['hits'][:KEEP]:
        try:
            moment = datetime.strptime(hit[6], '%Y-%m-%d %H:%M:%S').replace(tzinfo=timezone.utc)
        except (TypeError, ValueError, IndexError):
            continue
        place = hit[2] if isinstance(hit[2], str) and hit[2].strip() else None
        rows.append({'t': moment.strftime('%Y-%m-%dT%H:%M:%SZ'), 'place': place})
    rows.sort(key=lambda row: row['t'], reverse=True)
    return rows


def publish(folder, url):
    def git(*args):
        result = subprocess.run(['git', *args], cwd=folder, capture_output=True, text=True)
        if result.returncode:
            raise RuntimeError(re.sub(r'//[^/@\s]*@', '//***@', (result.stderr or result.stdout).replace(url, '***')).strip())

    git('init', '-q')
    git('symbolic-ref', 'HEAD', 'refs/heads/' + BRANCH)
    git('config', 'user.name', 'github-actions[bot]')
    git('config', 'user.email', '41898282+github-actions[bot]@users.noreply.github.com')
    git('add', 'visits.json')
    git('commit', '-q', '-m', 'update')
    git('push', '-q', '--force', url, BRANCH)


def main():
    try:
        rows = visits(fetch(SOURCE))
    except Exception as error:
        print('visit log not copied:', error)
        return 0
    if not rows:
        print('visit log is empty, nothing copied')
        return 0
    document = {'updated': datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ'), 'visits': rows}
    folder = tempfile.mkdtemp()
    with open(os.path.join(folder, 'visits.json'), 'w', encoding='utf-8') as handle:
        json.dump(document, handle, ensure_ascii=False, separators=(',', ':'))
    url = os.environ.get('PUSH_URL')
    if not url:
        print(os.path.join(folder, 'visits.json'))
        return 0
    try:
        publish(folder, url)
    except Exception as error:
        print('visit log not published:', error)
        return 1
    print('visit log published:', len(rows), 'visits')
    return 0


if __name__ == '__main__':
    sys.exit(main())
