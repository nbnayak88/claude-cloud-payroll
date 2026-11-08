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
                     ed='<span style="color:#B8902B">&#9733;</span> Gold Edition',
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
<title>Global Payroll Lab · Essentials Edition (Gold Edition) · 108 countries</title>
<meta name="description" content="Essentials Edition (Gold Edition): learning workbooks for 108 countries, 108 core sections and 9 learning tools each, including a PlayLab Arcade with 108 playable games.">
<style>
:root{--ink:#1F2A37;--muted:#5B6673;--gold:#B8902B;--gold-d:#8A6B12;--ivory:#FBF9F4;--hair:#E7E0D0;--line:#E3E7EA;--text:#1b2a33;--accent:#1263B4}
*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;font-family:system-ui,-apple-system,"Segoe UI",sans-serif;color:var(--text);line-height:1.6;background:var(--ivory)}
.serif,h1,h2{font-family:Georgia,"Times New Roman",serif}
header.top{position:sticky;top:0;z-index:20;background:rgba(251,249,244,.94);backdrop-filter:blur(6px);border-bottom:1px solid var(--hair)}
.topin{max-width:1100px;margin:0 auto;padding:12px 20px;display:grid;grid-template-columns:auto 1fr auto;gap:20px;align-items:center}
.who strong{display:block;font-family:Georgia,serif;font-size:17px;color:var(--ink);letter-spacing:.2px}.who span{font-size:11px;letter-spacing:1.6px;text-transform:uppercase;color:var(--muted)}
.daily-quote{margin:0;text-align:center;font-family:Georgia,serif;font-style:italic;font-size:14px;color:var(--ink);line-height:1.6}.daily-quote small{display:block;font-family:system-ui,sans-serif;font-style:normal;font-size:10px;letter-spacing:.6px;color:var(--muted);margin-top:3px}
.brand{text-align:right}.brand img{display:block;width:132px;height:auto;max-height:62px;object-fit:contain;margin-left:auto}.brand .tagline{display:block;font-size:10.5px;color:var(--muted);margin-top:3px}
main,footer{max-width:1100px;margin:0 auto;padding:0 20px}
.hero{margin:34px 0 26px;padding:34px 34px 28px;background:#fff;border:1px solid var(--hair);border-top:3px solid var(--gold);border-radius:6px 6px 16px 16px}
.kicker{display:inline-flex;align-items:center;gap:9px;font-size:12px;font-weight:600;letter-spacing:1.8px;text-transform:uppercase;color:var(--gold-d);margin:0 0 14px}
.kicker svg{flex:none}
h1{font-size:clamp(28px,4.2vw,42px);line-height:1.12;margin:0 0 14px;color:var(--ink);font-weight:600;letter-spacing:-.2px}
.lead{max-width:780px;margin:0 0 24px;color:#3b4652;font-size:16px}
.stats{display:flex;flex-wrap:wrap;margin:0;padding:18px 0 0;list-style:none;border-top:1px solid var(--hair)}
.stats li{flex:1 1 140px;padding:0 18px;border-left:1px solid var(--hair);font-size:13px;color:var(--muted);letter-spacing:.3px}.stats li:first-child{padding-left:0;border-left:0}
.stats b{display:block;font-family:Georgia,serif;font-size:30px;line-height:1.2;color:var(--ink);font-weight:600}
.tools{display:flex;flex-wrap:wrap;gap:12px;align-items:center;margin:8px 0 14px}
input[type=search]{flex:1 1 260px;min-width:0;padding:12px 16px;border:1px solid var(--hair);border-radius:999px;font:inherit;background:#fff}
input[type=search]:focus-visible,.chip:focus-visible,.card:focus-visible{outline:3px solid var(--accent);outline-offset:2px}
#count{font-size:13px;color:var(--muted)}
.chips{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 20px}.chip{border:1px solid var(--hair);background:#fff;border-radius:999px;padding:7px 14px;font:inherit;font-size:13.5px;cursor:pointer;color:var(--text)}
.chip b{font-weight:600;opacity:.6;margin-left:4px}.chip.on{background:var(--ink);color:#fff;border-color:var(--ink)}.chip.on b{opacity:.85}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px;margin:0 0 26px}
.card{display:grid;grid-template-columns:auto 1fr;gap:2px 12px;align-items:center;padding:13px 15px;border:1px solid var(--hair);border-radius:12px;text-decoration:none;color:inherit;background:#fff;transition:border-color .15s,box-shadow .15s}
.card:hover{border-color:var(--gold);box-shadow:0 4px 16px rgba(138,107,18,.14)}
.code{grid-row:span 2;display:grid;place-items:center;width:40px;height:40px;border-radius:10px;font-weight:700;font-size:13px;border:1px solid rgba(23,43,77,.12)}
.nm{font-weight:600;color:var(--ink)}.meta{font-size:12px;color:var(--muted)}
.none{display:none;padding:16px;border:1px dashed var(--hair);border-radius:12px}
.note{background:#fff;border:1px solid var(--hair);border-left:3px solid var(--gold);border-radius:6px 12px 12px 6px;padding:14px 18px;margin:6px 0 22px;font-size:14px;color:#3b4652}
.avg{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px;margin:10px 0 26px}.avg div{border-top:2px solid var(--gold);background:#fff;border-radius:0 0 12px 12px;padding:12px 14px;font-size:14px;color:#3b4652;border-left:1px solid var(--hair);border-right:1px solid var(--hair);border-bottom:1px solid var(--hair)}.avg strong{display:block;font-family:Georgia,serif;color:var(--ink);margin-bottom:2px;font-size:15px}
footer{padding-bottom:36px;font-size:12.5px;color:var(--muted);text-align:center}
@media(max-width:760px){.topin{grid-template-columns:1fr auto;gap:8px 14px}.daily-quote{grid-column:1/-1;grid-row:2;font-size:13px}.brand img{width:104px}.brand .tagline{display:none}.hero{padding:24px 20px 20px}.stats li{flex:1 1 45%;padding:8px 0;border-left:0}}
@media(prefers-reduced-motion:reduce){*{transition:none!important;scroll-behavior:auto!important}}
</style></head><body>
<header class="top"><div class="topin"><div class="who"><strong>Global Payroll Lab</strong><span>Essentials Edition (Gold Edition)</span></div>
<blockquote class="daily-quote"><span id="dailyQuoteText">Strong architecture makes complex responsibilities clearer.</span><small id="quoteDate">Quote of the day</small></blockquote>
__BRAND__</div></header>
<main>
<section class="hero"><p class="kicker">__MEDAL__ Essentials Edition (Gold Edition)</p>
<h1>One learning workbook for every country.</h1>
<p class="lead">Each workbook has 108 core sections, including 27 on Payroll Control Center and 27 on Employee Central to Employee Central Payroll replication, plus 9 learning tools with a PlayLab Arcade of 108 playable games.</p>
<ul class="stats"><li><b>108</b>countries</li><li><b>108</b>core sections each</li><li><b>9</b>learning tools each</li><li><b>108</b>arcade games each</li></ul></section>
<div class="tools"><label for="q" class="sr" style="position:absolute;left:-9999px">Search countries</label><input id="q" type="search" placeholder="Search a country, for example Germany or Zambia" autocomplete="off"><span id="count" aria-live="polite"></span></div>
<div class="chips" role="group" aria-label="Filter by region">__CHIPS__</div>
<div class="grid" id="grid">__CARDS__</div>
<p class="none" id="none">No country matches that search.</p>
<div class="note"><strong>Evidence boundary.</strong> The Essentials Edition (Gold Edition) uses fictional people, employers and amounts. Object names must be confirmed in your own release, rates and bands are not preloaded, and nothing here is a production approval or statutory certification. Zambia is an additional edition: it is not listed in SAP's 2H 2026 country-specifics document and was built from public authority pages, so confirm support in your own release.</div>
<div class="avg" aria-label="Reflection"><div><strong>Affirmation</strong>I can choose the right country and begin with a clear question.</div><div><strong>Visualization</strong>I picture the workbook open, one section at a time, with the evidence beside me.</div><div><strong>Gratitude</strong>I am grateful for colleagues who share what they learn.</div><div><strong>Intention</strong>Today I will open one country and finish one section.</div></div>
</main>
<footer>SuccessLabs Academy &middot; Independent learning material &middot; Fictional case data &middot; No affiliation claimed with SAP or any authority</footer>
<script>
(function(){var q=document.getElementById('q'),cards=[].slice.call(document.querySelectorAll('.card')),chips=[].slice.call(document.querySelectorAll('.chip')),none=document.getElementById('none'),count=document.getElementById('count'),reg='';
function run(){var t=q.value.trim().toLowerCase(),n=0;cards.forEach(function(c){var ok=(!t||c.dataset.n.indexOf(t)>=0)&&(!reg||c.dataset.r===reg);c.style.display=ok?'':'none';if(ok)n++});none.style.display=n?'none':'block';count.textContent=n+' of '+cards.length+' shown'}
q.addEventListener('input',run);chips.forEach(function(b){b.addEventListener('click',function(){reg=b.dataset.r;chips.forEach(function(x){x.classList.toggle('on',x===b)});run()})});run()})();__QUOTE__
</script></body></html>
"""
MEDAL = ('<svg width="22" height="22" viewBox="0 0 24 24" role="img" aria-label="Gold"><defs><linearGradient id="gm" x1="0" y1="0" x2="1" y2="1">'
         '<stop offset="0" stop-color="#F7E58B"/><stop offset=".55" stop-color="#D4AF37"/><stop offset="1" stop-color="#8A6B12"/></linearGradient></defs>'
         '<circle cx="12" cy="12" r="10.5" fill="url(#gm)" stroke="#8A6B12" stroke-width="1"/>'
         '<path d="M12 5.2l1.9 4 4.4.5-3.3 3 .9 4.4-3.9-2.2-3.9 2.2.9-4.4-3.3-3 4.4-.5z" fill="#FFF8DC" stroke="#8A6B12" stroke-width=".6" stroke-linejoin="round"/></svg>')
_src = (REPO / 'Zambia.html').read_text(encoding='utf-8')
BRAND = re.search(r'<div class="brand">.*?</div>', _src, re.S).group(0)
_q = re.search(r'const quotes=\[.*?\];', _src, re.S).group(0)
QUOTE = _q + ("function updateQuote(){const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kolkata',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());"
              "const get=t=>parts.find(p=>p.type===t).value;const date=get('year')+'-'+get('month')+'-'+get('day');"
              "const day=Math.floor(Date.UTC(+get('year'),+get('month')-1,+get('day'))/86400000);"
              "document.getElementById('dailyQuoteText').textContent='\u201c'+quotes[day%quotes.length]+'\u201d';"
              "document.getElementById('quoteDate').textContent='Quote of the day \u00b7 '+date+' \u00b7 India time';}updateQuote();setInterval(updateQuote,60000);")
(REPO / 'index.html').write_text(PAGE.replace('__CHIPS__', chips).replace('__CARDS__', cards).replace('__BRAND__', BRAND).replace('__MEDAL__', MEDAL).replace('__QUOTE__', QUOTE), encoding='utf-8')
print('hub', len(rows), 'countries', ', '.join('%s %d' % (g, sum(1 for r in rows if r['region'] == g)) for g in regions))
