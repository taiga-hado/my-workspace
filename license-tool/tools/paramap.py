import zipfile,re,sys
f=sys.argv[1]
x=zipfile.ZipFile(f).read('word/document.xml').decode('utf8')
idx=0
tokens=re.finditer(r'<w:tbl>|</w:tbl>|<w:tr[ >]|</w:tr>|<w:tc>|</w:tc>|<w:p(?:\s[^>]*[^/>])?>.*?</w:p>|<w:p(?:\s[^>]*)?/>',x,re.S)
tbl=-1;tr=-1;tc=-1;depth=0
for m in tokens:
    t=m.group(0)
    if t=='<w:tbl>': depth+=1; tbl+=1; tr=-1
    elif t=='</w:tbl>': depth-=1
    elif t.startswith('<w:tr'): tr+=1; tc=-1
    elif t=='<w:tc>': tc+=1
    elif t.startswith('<w:p'):
        txt=''.join(re.findall(r'<w:t[^>]*>([^<]*)</w:t>',t))
        ctx=f'T{tbl}R{tr}C{tc}' if depth>0 else 'BODY'
        print(f'{idx:4d} {ctx:12s} {txt.strip()[:44]!r}')
        idx+=1
