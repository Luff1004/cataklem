"""Print a JS file with every Korean string literal wrapped in L(...), so the build can swap languages.
Object keys and strings already inside L( are left alone. Usage: python tools/i18n_wrap.py file.js"""
import re, sys
H = re.compile('[가-힣]')
BS = chr(92); NL = chr(10); WS = ' ' + chr(9) + chr(10) + chr(13)
RX_PREV = '(,=:[!&|?{};+-*%<>~^'


def spans(src):
    out = []; i = 0; n = len(src)
    while i < n:
        c = src[i]
        if c == '/' and i + 1 < n and src[i + 1] == '/':
            j = src.find(NL, i); i = n if j < 0 else j; continue
        if c == '/' and i + 1 < n and src[i + 1] == '*':
            j = src.find('*/', i + 2); i = n if j < 0 else j + 2; continue
        if c == '/':
            k = i - 1
            while k >= 0 and src[k] in WS: k -= 1
            prev = src[k] if k >= 0 else ''
            word = re.search('([A-Za-z_$]+)$', src[max(0, k - 8):k + 1])
            if prev == '' or prev in RX_PREV or (word and word.group(1) in ('return', 'typeof', 'case')):
                j = i + 1; cls = False
                while j < n and src[j] != NL:
                    ch = src[j]
                    if ch == BS: j += 2; continue
                    if ch == '[': cls = True
                    elif ch == ']': cls = False
                    elif ch == '/' and not cls: break
                    j += 1
                i = j + 1; continue
        if c in "'\"`":
            q = c; j = i + 1
            while j < n and src[j] != q:
                if src[j] == BS: j += 2; continue
                j += 1
            out.append((q, i, j + 1)); i = j + 1; continue
        i += 1
    return out


def wrap(src):
    parts = []; last = 0
    for q, a, b in spans(src):
        body = src[a + 1:b - 1]
        if q == '`' or not H.search(body): continue
        k = a - 1
        while k >= 0 and src[k] in WS: k -= 1
        m = b
        while m < len(src) and src[m] in WS: m += 1
        if m < len(src) and src[m] == ':' and k >= 0 and src[k] in '{,': continue
        if src[max(0, a - 2):a] == 'L(': continue
        parts.append(src[last:a]); parts.append('L(' + src[a:b] + ')'); last = b
    parts.append(src[last:])
    return ''.join(parts)


if __name__ == '__main__':
    sys.stdout.reconfigure(encoding='utf-8', newline='\n')
    sys.stdout.write(wrap(open(sys.argv[1], encoding='utf-8').read()))
