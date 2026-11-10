#!/usr/bin/env python3
"""Builds /hr-lab/ : a hub plus one page per HR stream, each running the 108 PlayLab games with that stream's content pack."""
from pathlib import Path
import json, re, sys, html, colorsys, copy
HERE = Path(__file__).parent; REPO = HERE.parent.parent
sys.path.insert(0, str(HERE)); sys.path.insert(0, str(REPO / 'tools'))
from streams import STREAMS, file_of

OUT = REPO / 'hr-lab'
ENGINE = (REPO / 'tools/playlab/arcade_engine.js').read_text()
_zam = (REPO / 'Zambia.html').read_text(encoding='utf-8')
BASE_CSS = re.search(r'<style>(.*?)</style>', _zam, re.S).group(1)
BRAND = re.search(r'<div class="brand">.*?</div>', _zam, re.S).group(0)
QUOTES = re.search(r'const quotes=\[.*?\];', _zam, re.S).group(0)
MEDAL = re.search(r'<svg width="13".*?</svg>', _zam, re.S).group(0)

def india_arcade():
    s = (REPO / 'India.html').read_text(encoding='utf-8')
    return json.loads(re.search(r'id="workbook-data">(.*?)</script>', s, re.S).group(1))['arcade']

def hsl(h, s, l):
    r, g, b = colorsys.hls_to_rgb(h / 360, l, s); return '#%02x%02x%02x' % (round(r*255), round(g*255), round(b*255))

def theme(st):
    h = st['hue']
    return dict(ink=hsl(h, .45, .13), deep=hsl(h, .62, .24), mid=hsl(h, .62, .32), accent=hsl(h, .66, .34), bright=hsl(h, .75, .52), pale=hsl(h, .60, .96), tint=hsl(h, .55, .93))

def css(st):
    t = theme(st)
    return ('.arc-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:12px;margin-bottom:18px}.arc-tile{border:1px solid var(--line);border-radius:14px;padding:14px;background:var(--surface);display:flex;flex-direction:column;gap:8px}.arc-tile.off{opacity:.62}.quizopt.correct{border-color:#2e8b57;background:#e9f6ee}.quizopt.wrong{border-color:#c0562f;background:#fdeee8}.table{width:100%;border-collapse:collapse}.table th,.table td{padding:8px 10px;border-bottom:1px solid var(--line);text-align:left;font-size:13px;vertical-align:top}'
      + ':root{--ink:%(ink)s;--deep:%(deep)s;--mid:%(mid)s;--accent:%(accent)s;--bright:%(bright)s;--pale:%(pale)s}' % t
      + 'body{background:%(pale)s}header{background:%(tint)s !important}.hero2{background:linear-gradient(135deg,%(deep)s,%(mid)s);color:#fff;border-radius:18px;padding:26px 28px;margin-bottom:18px}.hero2 h1{margin:0 0 6px;font-size:28px;color:#fff}.hero2 p{margin:0;color:#fff;opacity:.95;max-width:70ch}.hero2 .kick{font-size:12px;letter-spacing:.14em;text-transform:uppercase;opacity:.9;margin-bottom:8px}.btn.primary{background:%(accent)s;border-color:%(accent)s;color:#fff}'
      + '.streams{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 18px}.streams a{padding:6px 12px;border-radius:999px;border:1px solid var(--line);background:#fff;color:#172B4D;font-size:13px;text-decoration:none;font-weight:600}.streams a.on{background:%(accent)s;color:#fff;border-color:%(accent)s}.hrwrap{max-width:1180px;margin:0 auto;padding:18px 16px 60px}.hrhead{display:flex;align-items:center;gap:14px;padding:12px 18px;border-bottom:1px solid var(--line)}.hrhead .title{flex:1}.hrhead .title strong{display:block}.hrhead .title span{font-size:12px}' % t)

def quote_js():
    return QUOTES + ("function updateQuote(){const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kolkata',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());"
      "const v=Object.fromEntries(parts.map(p=>[p.type,p.value]));const day=Math.floor(Date.UTC(+v.year,+v.month-1,+v.day)/864e5);"
      "document.getElementById('dailyQuoteText').textContent='“'+quotes[day%quotes.length]+'”';document.getElementById('quoteDate').textContent='Quote of the day';}updateQuote();")

def header(st=None):
    sub = ('%s · %s' % (st['code'], st['name'])) if st else '12 streams of HR · 108 games each'
    return ('<header class="hrhead"><div class="title"><strong>HR Streams Lab</strong><span class="small muted">%s</span></div>'
            '<blockquote class="daily-quote" style="margin:0"><span id="dailyQuoteText"></span><small id="quoteDate"></small></blockquote>%s</header>' % (html.escape(sub), BRAND))

def nav(cur=None):
    return '<nav class="streams" aria-label="HR streams">' + ''.join('<a href="%s"%s>%s %s</a>' % (file_of(s), ' class="on" aria-current="page"' if s['code'] == cur else '', s['code'], html.escape(s['name'])) for s in STREAMS) + '</nav>'

def page(st, data):
    title = '%s %s · HR Streams Lab' % (st['code'], st['name'])
    return ('<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>%s</title><style>%s%s</style></head><body>' % (html.escape(title), BASE_CSS, css(st))
      + header(st) + '<main class="hrwrap" id="content">' + nav(st['code'])
      + '<section class="hero2"><p class="kick">%s · %s</p><h1>%s</h1><p>%s</p></section>' % (st['code'], html.escape(st['sys']), html.escape(st['name']), html.escape(st['tag']))
      + '<div id="arcade-root"></div><p class="small muted" style="margin-top:22px">Independent learning material · Fictional scenarios and data · No affiliation claimed with any vendor or authority.</p></main>'
      + '<script>%s</script><script>%s</script><script>var HRDATA=%s;Arcade.init(HRDATA);Arcade.view();</script></body></html>' % (ENGINE, quote_js(), json.dumps(data, ensure_ascii=False).replace('</', '<\\/')))

def hub():
    cards = ''.join('<a class="arc-tile" href="%s" style="text-decoration:none;color:inherit;border-top:4px solid %s"><span class="label muted">%s</span><strong>%s</strong><p class="small muted">%s</p><span class="small">108 games →</span></a>' % (file_of(s), theme(s)['accent'], s['code'], html.escape(s['name']), html.escape(s['tag'])) for s in STREAMS)
    return ('<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>HR Streams Lab</title><style>%s%s</style></head><body>' % (BASE_CSS, css(STREAMS[0]))
      + header() + '<main class="hrwrap" id="content"><section class="hero2"><p class="kick">%s Essentials Edition (Gold Edition)</p><h1>HR Streams Lab</h1><p>The PlayLab arcade of 108 games, played across all 12 streams of HR. Pick a stream and play with fictional scenarios drawn from that stream.</p></section>' % MEDAL
      + '<div class="arc-grid" style="grid-template-columns:repeat(auto-fill,minmax(260px,1fr))">%s</div><p class="small muted">Independent learning material · Fictional scenarios and data · A game score does not prove skills or readiness.</p></main><script>%s</script></body></html>' % (cards, quote_js()))

def build(only=None):
    from hrpack import pack_for
    OUT.mkdir(exist_ok=True)
    for st in STREAMS:
        if only and st['code'] not in only: continue
        data = pack_for(st)
        (OUT / file_of(st)).write_text(page(st, data), encoding='utf-8')
        if '--json' in sys.argv: (Path('/tmp/hrjson')).mkdir(exist_ok=True); (Path('/tmp/hrjson') / (st['code'] + '.json')).write_text(json.dumps(data, ensure_ascii=False))
        print('built', st['code'])
    (OUT / 'index.html').write_text(hub(), encoding='utf-8')

if __name__ == '__main__':
    build([a for a in sys.argv[1:] if not a.startswith('--')] or None)
