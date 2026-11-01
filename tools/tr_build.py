"""Builds src/js/0001-tr.js from tools/tr/table.tsv.
table.tsv lines: korean<TAB>english<TAB>japanese<TAB>chinese  (newlines inside text written as \\n).
Korean strings found in the code or page that have no row yet are listed as missing, and appended to
tools/tr/missing.tsv with empty translations so they can be filled in.
Usage: python tools/tr_build.py"""
import glob, json, os, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from i18n_wrap import spans, H

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BS = chr(92); NL = chr(10); TAB = chr(9)


def unescape(s):
    out = []; i = 0
    while i < len(s):
        c = s[i]
        if c == BS and i + 1 < len(s):
            n = s[i + 1]; out.append({'n': NL, 't': TAB}.get(n, n)); i += 2; continue
        out.append(c); i += 1
    return ''.join(out)


def code_strings():
    seen = set(); rows = []
    for f in sorted(glob.glob(os.path.join(ROOT, 'src', 'js', '*.js'))):
        b = os.path.basename(f)
        if 'debug' in b or b.startswith('00'): continue
        src = open(f, encoding='utf-8').read()
        for q, a, e in spans(src):
            s = src[a + 1:e - 1]
            if q == '`' or not H.search(s) or s in seen: continue
            seen.add(s); rows.append(unescape(s))
    return rows


def page_strings():
    h = open(os.path.join(ROOT, 'src', 'page.html'), encoding='utf-8').read()
    h = re.sub('<style.*?</style>', '', h, flags=re.S); h = re.sub('<script.*?</script>', '', h, flags=re.S)
    out = []
    for m in re.finditer('>([^<>]+)<', h):
        t = ' '.join(m.group(1).split())
        if H.search(t) and t not in out: out.append(t)
    for m in re.finditer('(?:aria-label|title|placeholder|alt)="([^"]+)"', h):
        if H.search(m.group(1)) and m.group(1) not in out: out.append(m.group(1))
    return out


enc = lambda s: s.replace(BS, BS + BS).replace(NL, BS + 'n').replace(TAB, ' ')
dec = lambda s: re.sub(re.escape(BS) + '(.)', lambda m: NL if m.group(1) == 'n' else m.group(1), s)


def load_table(path):
    d = {}
    if not os.path.exists(path): return d
    for line in open(path, encoding='utf-8'):
        line = line.rstrip(NL).rstrip(chr(13))
        if not line: continue
        p = line.split(TAB)
        while len(p) < 4: p.append('')
        d[dec(p[0])] = [dec(x) for x in p[1:4]]
    return d


if __name__ == '__main__':
    sys.stdout.reconfigure(encoding='utf-8')
    trdir = os.path.join(ROOT, 'tools', 'tr')
    table = load_table(os.path.join(trdir, 'table.tsv'))
    table.update({k: v for k, v in load_table(os.path.join(trdir, 'missing.tsv')).items() if any(v)})
    wanted = ['선택'] + code_strings() + page_strings()
    rows = []; miss = []
    for s in dict.fromkeys(wanted):
        t = table.get(s)
        if t and any(t): rows.append([s] + t)
        elif len(s) > 1: miss.append(s)
    with open(os.path.join(ROOT, 'src', 'js', '0001-tr.js'), 'w', encoding='utf-8', newline=NL) as w:
        w.write('/* translations: [korean, english, japanese, chinese]. Built by tools/tr_build.py from tools/tr/table.tsv */\n')
        w.write('I18N(' + json.dumps(rows, ensure_ascii=False, separators=(',', ':')).replace('],[', '],' + NL + '[') + ');' + NL)
    with open(os.path.join(trdir, 'missing.tsv'), 'w', encoding='utf-8', newline=NL) as w:
        for s in miss: w.write(enc(s) + TAB + TAB + TAB + NL)
    print('rows', len(rows), 'missing', len(miss))
    for m in miss[:30]: print('  missing:', m)
