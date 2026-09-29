"""Compares paragraph texts of a generated docx against its template (same tokenization as paramap.py)."""
import sys, re, zipfile
def paras(path):
    x = zipfile.ZipFile(path).read('word/document.xml').decode('utf8')
    out = []
    for m in re.finditer(r'<w:p(?:\s[^>]*[^/>])?>.*?</w:p>|<w:p(?:\s[^>]*)?/>', x, re.S):
        t = ''.join(re.findall(r'<w:t[^>]*>([^<]*)</w:t>', m.group(0)))
        strike = '<w:strike/>' in m.group(0)
        out.append((re.sub(r'[\s　]+', ' ', t).strip(), strike))
    return out, x
tpl, _ = paras(sys.argv[1]); gen, xml = paras(sys.argv[2])
print(f'template paras={len(tpl)} generated paras={len(gen)}')
for i, (g, s) in enumerate(gen):
    t = tpl[i] if i < len(tpl) else ('<none>', False)
    if g != t[0] or s != t[1]:
        print(f'  [{i}] {"STRIKE " if s else ""}{t[0][:30]!r} -> {g[:100]!r}')
try:
    from lxml import etree
    etree.fromstring(xml.encode('utf8'))
    print('  XML OK')
except Exception as e:
    print('  XML ERROR', e)
    line, col = e.position
    ls = xml.split('\n')[line-1]
    print('   context:', ls[max(0,col-400):col+100])
