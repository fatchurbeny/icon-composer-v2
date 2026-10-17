#!/usr/bin/env python3
"""Merender artboard Claude Design (docs/design/artboards/*.dc.html) menjadi PNG acuan
di docs/design/reference/ tanpa runtime Claude Design. Runtime mini di bawah hanya mendukung
fitur format yang dipakai artboard ini: {{hole}}, <sc-for>, <sc-if>, <helmet>, renderVals().
Pakai: python3 scripts/render-artboards.py [--fonts <folder berisi InstrumentSans-*.ttf, GeistMono-Regular.ttf>]
Butuh: pip install playwright; Chromium (PLAYWRIGHT_BROWSERS_PATH)."""
import asyncio, json, os, re, sys, threading, http.server, functools
from playwright.async_api import async_playwright
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
S=os.path.join(ROOT,'docs','design')
PROJ=os.path.join(S,'artboards')
OUT=os.path.join(S,'reference')
F=sys.argv[sys.argv.index('--fonts')+1] if '--fonts' in sys.argv else None
FONTCSS=("@import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600&family=Geist+Mono:wght@400;500&display=swap');" if not F else
  "@font-face{font-family:'Instrument Sans';font-weight:400;src:url(/_fonts/InstrumentSans-Regular.ttf)}@font-face{font-family:'Instrument Sans';font-weight:500 700;src:url(/_fonts/InstrumentSans-Bold.ttf)}@font-face{font-family:'Geist Mono';src:url(/_fonts/GeistMono-Regular.ttf)}")
bm={k:os.path.normpath(os.path.join(PROJ,v)) for k,v in json.load(open(os.path.join(PROJ,'blob-map.json'))).items()}
RUNTIME=r'''
window.__render = function(xdc, src, st){
  class DCLogic { constructor(p){ this.props=p||{}; this.state={}; } setState(s){ Object.assign(this.state,s); } forceUpdate(){} }
  const C = new Function('DCLogic', src + '\n;return Component;')(DCLogic);
  const inst = new C({}); Object.assign(inst.state, st||{}); const vals = inst.renderVals();
  const get=(sc,p)=>{ p=p.trim(); if(p==='true')return true; if(p==='false')return false; if(/^-?\d+(\.\d+)?$/.test(p))return +p; return p.split('.').reduce((o,k)=>o==null?undefined:o[k],sc); };
  const HOLE=/\{\{\s*([^}]+?)\s*\}\}/g;
  const interp=(s,sc)=>{ const m=s.match(/^\s*\{\{\s*([^}]+?)\s*\}\}\s*$/); if(m) return get(sc,m[1]); return s.replace(HOLE,(_,p)=>{ const v=get(sc,p); return v==null?'':String(v); }); };
  const proc=(n,sc,out)=>{
    if(n.nodeType===3){ out.appendChild(document.createTextNode(interp(n.textContent,sc))); return; }
    if(n.nodeType!==1) return;
    const t=n.localName;
    if(t==='helmet'){ n.childNodes.forEach(c=>{ if(c.nodeType===1 && c.localName!=='link') document.head.appendChild(c.cloneNode(true)); }); return; }
    if(t==='sc-for'){ const list=interp(n.getAttribute('list'),sc)||[]; const as=n.getAttribute('as')||'item'; list.forEach((it,i)=>{ const s2=Object.create(sc); s2[as]=it; s2.$index=i; n.childNodes.forEach(c=>proc(c,s2,out)); }); return; }
    if(t==='sc-if'){ if(interp(n.getAttribute('value'),sc)) n.childNodes.forEach(c=>proc(c,sc,out)); return; }
    const el=document.createElementNS(n.namespaceURI, n.localName);
    for(const a of n.attributes){ if(/^on/i.test(a.name)||a.name.startsWith('hint-')) continue; let v=interp(a.value,sc); if(v===false||v==null) continue; if(v===true) v=''; if(a.name==='checked'&&v==='false') continue; el.setAttribute(a.name,String(v)); }
    const kids = n.localName==='template' ? n.content.childNodes : n.childNodes;
    kids.forEach(c=>proc(c,sc,el)); out.appendChild(el);
  };
  const tpl=document.createElement('template'); tpl.innerHTML=xdc;
  tpl.content.childNodes.forEach(c=>proc(c,vals,document.getElementById('root')));
};'''
async def main():
    srv=http.server.ThreadingHTTPServer(('127.0.0.1',8765),functools.partial(http.server.SimpleHTTPRequestHandler,directory=S)); threading.Thread(target=srv.serve_forever,daemon=True).start()
    async with async_playwright() as p:
        b=await p.chromium.launch()
        for name,st,suf in [('Main',{},''),('Main',{'tab':'lapisan'},'-tab-lapisan'),('Main',{'tab':'pustaka'},'-tab-pustaka'),('Main',{'tab':'pool'},'-tab-pool'),('Edit',{},''),('Builder',{},''),('Tinjau',{},''),('Kombinasi',{},''),('Kombinasi',{'shape':'isi'},'-bentuk-isi')]:
            txt=open(f'{PROJ}/{name}.dc.html').read()
            xdc=re.search(r'<x-dc>(.*)</x-dc>',txt,re.S).group(1)
            src=re.search(r'<script type="text/x-dc"[^>]*>(.*?)</script>',txt,re.S).group(1)
            pg=await b.new_page(viewport={'width':1600,'height':1000})
            errs=[]; pg.on('pageerror',lambda e: errs.append(str(e)))
            html=f'<!doctype html><html><head><meta charset="utf-8"><style>{FONTCSS}</style></head><body style="margin:0"><div id="root"></div><script>{RUNTIME}</script></body></html>'
            open(os.path.join(S,'_render.html'),'w').write(html)
            async def blob(route):
                bid=route.request.url.rsplit('/',1)[-1]
                await route.fulfill(path=bm[bid], content_type='image/svg+xml') if bid in bm else await route.abort()
            await pg.route('**/_blob/*', blob)
            if F: await pg.route('**/_fonts/*', lambda r: r.fulfill(path=os.path.join(F, r.request.url.rsplit('/',1)[-1])))
            await pg.goto('http://127.0.0.1:8765/_render.html')
            
            await pg.evaluate('([x,s,t])=>window.__render(x,s,t)',[xdc,src,st]); await pg.wait_for_timeout(700)
            out=f'{OUT}/artboard-{name.lower()}{suf}-1600x1000.png'
            await pg.screenshot(path=out); print(name, suf, errs[:2]); await pg.close()
        await b.close()
    os.remove(os.path.join(S,'_render.html'))
asyncio.run(main())
