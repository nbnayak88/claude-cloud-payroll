"""Builds index.html: the hub that lists every country workbook (one file per country in the repo root).

Run after tools/extend_to_108.py:  python3 tools/build_hub.py
Country, code and edition are read from each built workbook; regions come from tools/regions.json.
"""
from pathlib import Path
import html, json, re, sys
sys.path.insert(0, str(Path(__file__).parent))
import colorslab as CL

REPO = Path(__file__).resolve().parent.parent
REG = json.loads((Path(__file__).parent / 'regions.json').read_text())
CASE = re.compile(r'<script(?: type="application/json")? id="sla-case-data">(.*?)</script>', re.S)

rows = []
for f in sorted(REPO.glob('*.html')):
    if f.name == 'index.html':
        continue
    c = json.loads(CASE.search(f.read_text(encoding='utf-8')).group(1))
    rows.append(dict(name=c['country'], code=c['code'], file=f.name, region=REG[c['country']],
                     ed='Replication edition' if c['edition'] == 'replication' else 'Payroll edition',
                     extra=c['country'] == 'Zambia'))
rows.sort(key=lambda r: r['name'].lower())
assert len(rows) == 108, len(rows)
regions = sorted({r['region'] for r in rows})

cards = ''.join(
    '<a class="card" href="%s" data-n="%s" data-r="%s"><span class="code" style="background:linear-gradient(110deg,%s 0%%,%s 100%%);color:%s">%s</span><span class="nm">%s</span>'
    '<span class="meta">%s · %s%s</span></a>' % (
        html.escape(r['file']), html.escape(r['name'].lower()), html.escape(r['region']), CL.theme(r['name'])['start'], CL.theme(r['name'])['end'], CL.theme(r['name'])['ink'], html.escape(r['code']),
        html.escape(r['name']), html.escape(r['region']), r['ed'], ' · additional' if r['extra'] else '')
    for r in rows)
chips = '<button type="button" class="chip on" data-r="">All regions <b>%d</b></button>' % len(rows) + ''.join(
    '<button type="button" class="chip" data-r="%s">%s <b>%d</b></button>' % (
        html.escape(g), html.escape(g), sum(1 for r in rows if r['region'] == g)) for g in regions)

PAGE = """<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Employee Central Payroll workbooks · 108 countries</title>
<meta name="description" content="Learning workbooks for 108 countries: 108 core sections and 9 learning tools each, including a PlayLab Arcade with 108 playable games.">
<style>
:root{--deep:hsl(170 38% 24%);--line:#d5e3df;--text:#1b2a33;--pale:hsl(165 40% 95%);--accent:hsl(174 44% 29%)}
*{box-sizing:border-box}body{margin:0;font-family:system-ui,-apple-system,Segoe UI,sans-serif;color:var(--text);line-height:1.55;background:#fff}
header,main,footer{max-width:1100px;margin:0 auto;padding:0 20px}header{padding-top:36px}.hubhero{margin-top:22px;padding:22px 24px;border-radius:18px;background:linear-gradient(110deg,#329ED8 0%,#D7F1FF 100%);color:#172B4D}.hubhero h1,.hubhero p{color:#172B4D}.hubhero a{color:#0E4F92}
h1{font-size:clamp(26px,4vw,38px);line-height:1.15;margin:0 0 10px;color:var(--deep)}.lead{max-width:760px;margin:0 0 18px}
.stats{display:flex;flex-wrap:wrap;gap:10px;margin:0 0 20px;padding:0;list-style:none}.stats li{background:var(--pale);border:1px solid var(--line);border-radius:12px;padding:8px 14px}.stats b{display:block;font-size:22px;color:var(--deep)}
.tools{display:flex;flex-wrap:wrap;gap:12px;align-items:center;margin:8px 0 14px}
input[type=search]{flex:1 1 260px;min-width:0;padding:11px 14px;border:1px solid var(--line);border-radius:10px;font:inherit}
.chips{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 18px}.chip{border:1px solid var(--line);background:#fff;border-radius:999px;padding:7px 13px;font:inherit;font-size:14px;cursor:pointer;color:var(--text)}
.chip b{font-weight:600;opacity:.7;margin-left:4px}.chip.on{background:var(--deep);color:#fff;border-color:var(--deep)}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:12px;margin:0 0 20px}
.card{display:grid;grid-template-columns:auto 1fr;gap:2px 10px;align-items:center;padding:12px 14px;border:1px solid var(--line);border-radius:14px;text-decoration:none;color:inherit;background:#fff}
.card:hover,.card:focus-visible{border-color:var(--accent);box-shadow:0 2px 10px rgba(20,80,70,.12);outline:none}
.code{grid-row:span 2;display:grid;place-items:center;width:38px;height:38px;border-radius:10px;background:var(--pale);color:var(--deep);font-weight:700;font-size:13px;border:1px solid rgba(23,43,77,.12)}
.nm{font-weight:600}.meta{font-size:12px;opacity:.72}
.none{display:none;padding:16px;border:1px dashed var(--line);border-radius:12px}
.note{background:var(--pale);border:1px solid var(--line);border-radius:12px;padding:14px 16px;margin:6px 0 22px;font-size:14px}
.avg{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px;margin:10px 0 22px}.avg div{border:1px solid var(--line);border-radius:12px;padding:12px 14px;font-size:14px}.avg strong{display:block;color:var(--deep);margin-bottom:2px}
footer{padding-bottom:34px;font-size:13px;opacity:.8}
</style></head><body>
<header><div class="hubhero"><h1>Employee Central Payroll workbooks · 108 countries</h1>
<p class="lead">One learning workbook per country. Each has 108 core sections, including 27 on Payroll Control Center and 27 on Employee Central to Employee Central Payroll replication, plus 9 learning tools with a PlayLab Arcade of 108 playable games.</p>
<ul class="stats"><li><b>108</b>countries</li><li><b>108</b>core sections each</li><li><b>9</b>learning tools each</li><li><b>108</b>arcade games each</li></ul><p class="small">Each workbook uses its own two-colour gradient from the ColorsLab-108 registry. These are proposed design palettes, not official flag colours.</p></div></header>
<main>
<div class="tools"><label for="q" class="sr" style="position:absolute;left:-9999px">Search countries</label><input id="q" type="search" placeholder="Search a country, for example Germany or Zambia" autocomplete="off"><span id="count" aria-live="polite"></span></div>
<div class="chips" role="group" aria-label="Filter by region">__CHIPS__</div>
<div class="grid" id="grid">__CARDS__</div>
<p class="none" id="none">No country matches that search.</p>
<div class="note"><strong>Evidence boundary.</strong> Learning editions with fictional people, employers and amounts. Object names must be confirmed in your own release, rates and bands are not preloaded, and nothing here is a production approval or statutory certification. Zambia is an additional edition: it is not listed in SAP's 2H 2026 country-specifics document and was built from public authority pages, so confirm support in your own release.</div>
<div class="avg" aria-label="Reflection"><div><strong>Affirmation</strong>I can choose the right country and begin with a clear question.</div><div><strong>Visualization</strong>I picture the workbook open, one section at a time, with the evidence beside me.</div><div><strong>Gratitude</strong>I am grateful for colleagues who share what they learn.</div><div><strong>Intention</strong>Today I will open one country and finish one section.</div></div>
</main>
<footer>SuccessLabs Academy · Independent learning material · Fictional case data · No affiliation claimed with SAP or any authority</footer>
<script>
(function(){var q=document.getElementById('q'),cards=[].slice.call(document.querySelectorAll('.card')),chips=[].slice.call(document.querySelectorAll('.chip')),none=document.getElementById('none'),count=document.getElementById('count'),reg='';
function run(){var t=q.value.trim().toLowerCase(),n=0;cards.forEach(function(c){var ok=(!t||c.dataset.n.indexOf(t)>=0)&&(!reg||c.dataset.r===reg);c.style.display=ok?'':'none';if(ok)n++});none.style.display=n?'none':'block';count.textContent=n+' of '+cards.length+' shown'}
q.addEventListener('input',run);chips.forEach(function(b){b.addEventListener('click',function(){reg=b.dataset.r;chips.forEach(function(x){x.classList.toggle('on',x===b)});run()})});run()})();
</script></body></html>
"""
(REPO / 'index.html').write_text(PAGE.replace('__CHIPS__', chips).replace('__CARDS__', cards), encoding='utf-8')
print('hub', len(rows), 'countries', ', '.join('%s %d' % (g, sum(1 for r in rows if r['region'] == g)) for g in regions))
