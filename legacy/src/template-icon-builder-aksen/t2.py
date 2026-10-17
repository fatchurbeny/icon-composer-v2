import asyncio, json, zipfile, csv, io
from playwright.async_api import async_playwright
O='/home/claude/tib/build-aksen/out/'
LUC=open('/tmp/claude-0/luc/package/dist/umd/lucide.min.js').read()
TBJ=open('/tmp/claude-0/tab/package/tabler-nodes-outline.json').read()
JSZ=open('/opt/npm-tools/node_modules/jszip/dist/jszip.min.js').read()
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); ctx=await b.new_context(viewport={'width':1600,'height':960}, accept_downloads=True); pg=await ctx.new_page()
        errs=[]; pg.on('pageerror',lambda e: errs.append(str(e)))
        async def h(route):
            u=route.request.url
            if 'lucide' in u and 'tags' not in u: await route.fulfill(body=LUC, content_type='application/javascript')
            elif 'jszip' in u: await route.fulfill(body=JSZ, content_type='application/javascript')
            elif 'tabler-nodes' in u: await route.fulfill(body=TBJ, content_type='application/json', headers={'access-control-allow-origin':'*'})
            else: await route.abort()
        await pg.route('**/*', lambda r: h(r) if r.request.url.startswith('http') else r.continue_())
        await pg.goto('file:///home/claude/template-icon-builder-aksen.html'); await pg.wait_for_timeout(800)
        await pg.click('#loadSample'); await pg.wait_for_timeout(2500)
        await pg.click('[data-view=export]'); await pg.wait_for_timeout(400)
        await pg.fill('#exBrand','BAGtest1234'); await pg.wait_for_timeout(300)
        print(await pg.inner_text('#exSearchEx'))
        await pg.screenshot(path=O+'x3.png')
        async with pg.expect_download() as d: await pg.click('#exGo')
        dl=await d.value; await dl.save_as(O+'pack2.zip')
        z=zipfile.ZipFile(O+'pack2.zip'); r=list(csv.DictReader(io.StringIO(z.read('metadata.csv').decode('utf-8-sig'))))
        for row in r[:3]: print(row['title_en'],'|',row['title_id'],'|',row['search'],'|',row['keywords_en'][:80])
        print(json.loads(z.read('manifest-final.json'))['pack'])
        await pg.reload(); await pg.wait_for_timeout(1200); await pg.click('[data-view=export]'); await pg.wait_for_timeout(300)
        print('brand persisted', await pg.input_value('#exBrand'))
        async with pg.expect_download() as d: await pg.click('#skillBtn')
        dl=await d.value; await dl.save_as(O+'skill2.zip')
        print('errs', errs); await b.close()
asyncio.run(main())
