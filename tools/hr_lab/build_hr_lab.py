#!/usr/bin/env python3
"""Builds /hr-lab/ : a hub plus one page per HR stream, each running the 108 PlayLab games with that stream's content pack."""
from pathlib import Path
import json, re, sys, html, colorsys, copy
HERE = Path(__file__).parent; REPO = HERE.parent.parent
sys.path.insert(0, str(HERE)); sys.path.insert(0, str(REPO / 'tools'))
import os
if os.environ.get('LAB') == 'cx':
    from cxstreams import STREAMS, file_of
    LAB = dict(name='CX Streams Lab', sub='12 streams of customer experience · 108 games each', intro='The PlayLab arcade of 108 games, played across all 12 streams of customer experience and CRM. Pick a stream and play with fictional scenarios drawn from that stream.', out='cx-lab')
else:
    from streams import STREAMS, file_of
    LAB = dict(name='HR Streams Lab', sub='12 streams of HR · 108 games each', intro='The PlayLab arcade of 108 games, played across all 12 streams of HR. Pick a stream and play with fictional scenarios drawn from that stream.', out='hr-lab')
OUT = REPO / LAB['out']
ENGINE = (REPO / 'tools/playlab/arcade_engine.js').read_text()
_zam = (REPO / 'Zambia.html').read_text(encoding='utf-8')
BASE_CSS = re.search(r'<style>(.*?)</style>', _zam, re.S).group(1)
BRAND = re.search(r'<div class="brand">.*?</div>', _zam, re.S).group(0)
QUOTES_HR = 'const quotes=["Understand the person behind every record.", "Good people practices turn policy into everyday trust.", "Learn the rule, test the exception, explain the outcome.", "Good design turns understanding into dependable action.", "Build confidence one verified result at a time.", "Every question you test strengthens the design.", "Local context gives global practice its meaning.", "Evidence turns a promising idea into trusted practice.", "Small experiments reveal the strongest learning paths.", "Trace the change until the whole story makes sense.", "A thoughtful question can prevent a thousand corrections.", "Design each employee experience with dignity and care.", "Learning grows when knowledge becomes an experiment.", "Fairness is a habit practised in small decisions.", "Make every choice something you can explain.", "A clear audit trail is a gift to the next learner.", "Explore the process, challenge assumptions, validate results.", "Accuracy is built through habits of careful discovery.", "Connect policy, people and systems with purposeful practice.", "Progress begins when you make your next idea testable.", "Let every exception teach you something about the system.", "Great teams grow where people can see their next step.", "Create learning that keeps evolving with the world.", "Trust grows where results can be traced and understood.", "Practice patiently; design boldly; verify thoughtfully.", "A useful workbook teaches you to ask better questions.", "Respect for people shows up in the details.", "Hiring is the start of a promise, not the end of a task.", "Data about people deserves the most careful hands.", "Clear roles and clear feedback help everyone grow.", "Behind every number is someone counting on it.", "Listen first; the best fixes start with understanding.", "Make the next step obvious for every employee.", "Simple processes are kinder processes.", "Reward what you want to see more of.", "Skills are the currency of the future of work.", "Check the data before you trust the dashboard.", "Every handoff is a chance to make work easier.", "Learn from every exception; it shows where the system can grow.", "Small improvements, measured, add up to a great workplace."];'
QUOTES_CX = 'const quotes=["Listen first; every customer is telling you something.", "A great experience is built from many small, careful moments.", "Know the customer once, and serve them everywhere.", "Trust grows where promises and delivery match.", "Measure what matters, then act on what you learn.", "Every touchpoint is a chance to make life easier.", "Data without care is only noise; with care it becomes insight.", "Close the loop and customers remember you listened.", "Make the next step obvious, and the journey gets shorter.", "Good service feels effortless to the person receiving it.", "A clean record today prevents a confused customer tomorrow.", "Test the journey the way a customer would walk it.", "Personal means relevant, not intrusive.", "Ask one question at a time and listen to the answer.", "Retention is a promise renewed every day.", "Automate the routine so people can handle the human moments.", "Trace the problem to its source before you fix the symptom.", "Great teams share one view of the customer.", "Small improvements, measured, add up to loyalty.", "Design every message as if you would receive it yourself.", "Fairness and privacy are part of a good experience.", "A clear owner turns feedback into action.", "Speed matters, but understanding matters more.", "Evidence turns a good idea into trusted practice.", "Practice patiently; design boldly; verify thoughtfully.", "Partners succeed when the rules are clear and fair.", "Make every handoff something the customer never notices.", "Learn from every exception; it shows where the system can grow.", "Simple journeys win more customers than clever ones.", "Let the customer\'s words guide your priorities.", "Reliable operations are quiet, and customers love quiet.", "An honest answer today earns a loyal customer tomorrow.", "Connect people, data and systems with purpose.", "Explore the process, challenge assumptions, validate results.", "Build confidence one verified result at a time.", "Every question you test strengthens the design.", "Make every choice something you can explain.", "Progress begins when you make your next idea testable.", "Create learning that keeps evolving with the world.", "Understand the person behind every data field."];'
QUOTES = QUOTES_CX if os.environ.get('LAB')=='cx' else QUOTES_HR
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
    plain = ('.arc-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:12px;margin-bottom:18px}.arc-tile{border:1px solid var(--line);border-radius:14px;padding:14px;background:var(--surface);display:flex;flex-direction:column;gap:8px}.arc-tile.off{opacity:.62}.quizopt.correct{border-color:#2e8b57;background:#e9f6ee}.quizopt.wrong{border-color:#c0562f;background:#fdeee8}.table{width:100%;border-collapse:collapse}.table th,.table td{padding:8px 10px;border-bottom:1px solid var(--line);text-align:left;font-size:13px;vertical-align:top}')
    themed = (':root{--ink:%(ink)s;--deep:%(deep)s;--mid:%(mid)s;--accent:%(accent)s;--bright:%(bright)s;--pale:%(pale)s}'
      'body{background:%(pale)s}.hrhead{background:%(tint)s}.hero2{background:linear-gradient(135deg,%(deep)s,%(mid)s);color:#fff;border-radius:18px;padding:26px 28px;margin-bottom:18px}.hero2 h1{margin:0 0 6px;font-size:28px;color:#fff}.hero2 p{margin:0;color:#fff;max-width:70ch}.hero2 .kick{font-size:12px;letter-spacing:.14em;text-transform:uppercase;margin-bottom:8px;display:flex;align-items:center;gap:6px}.btn.primary{background:%(accent)s;border-color:%(accent)s;color:#fff}'
      '.streams{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 18px}.streams a{padding:6px 12px;border-radius:999px;border:1px solid var(--line);background:#fff;color:#172B4D;font-size:13px;text-decoration:none;font-weight:600}.streams a.on{background:%(accent)s;color:#fff;border-color:%(accent)s}') % t
    layout = ('header.hrhead{height:auto;min-height:66px;position:sticky;top:0;z-index:30;display:grid;padding:12px 18px}.hrwrap{max-width:1180px;margin:0 auto;padding:18px 16px 60px}.hrhead{display:grid;grid-template-columns:1fr minmax(0,620px) auto;align-items:center;gap:8px 18px;padding:12px 18px;border-bottom:1px solid var(--line)}.hrhead .title strong{display:block;font-size:16px}.hrhead .title span{font-size:12px}'
      '.brand{text-align:right}.brand img{display:block;width:132px;max-width:100%;height:auto;max-height:62px;object-fit:contain;margin-left:auto}.brand .tagline{display:none}'
      '.daily-quote{margin:0;text-align:center;font-size:13px;line-height:1.7}.daily-quote small{display:block;font-size:10px;color:var(--muted);margin-top:3px}'
      '@media(max-width:760px){.hrhead{grid-template-columns:1fr auto}.hrhead .daily-quote{grid-column:1/-1;grid-row:2;font-size:12px}.brand img{width:96px;max-height:44px}.hero2{padding:20px 18px}.hero2 h1{font-size:23px}}')
    return plain + themed + layout

def quote_js():
    return QUOTES + ("function updateQuote(){const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kolkata',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());"
      "const v=Object.fromEntries(parts.map(p=>[p.type,p.value]));const day=Math.floor(Date.UTC(+v.year,+v.month-1,+v.day)/864e5);"
      "document.getElementById('dailyQuoteText').textContent='“'+quotes[day%quotes.length]+'”';document.getElementById('quoteDate').textContent='Quote of the day';}updateQuote();")

def header(st=None):
    sub = ('%s · %s' % (st['code'], st['name'])) if st else LAB['sub']
    return ('<header class="hrhead"><div class="title"><strong>%s</strong>' % LAB['name'] + '<span class="small muted">%s</span></div>'
            '<blockquote class="daily-quote" style="margin:0"><span id="dailyQuoteText"></span><small id="quoteDate"></small></blockquote>%s</header>' % (html.escape(sub), BRAND))

def nav(cur=None):
    return '<nav class="streams" aria-label="HR streams">' + ''.join('<a href="%s"%s>%s %s</a>' % (file_of(s), ' class="on" aria-current="page"' if s['code'] == cur else '', s['code'], html.escape(s['name'])) for s in STREAMS) + '</nav>'

def page(st, data):
    title = '%s %s · %s' % (st['code'], st['name'], LAB['name'])
    return ('<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>%s</title><style>%s%s</style></head><body>' % (html.escape(title), BASE_CSS, css(st))
      + header(st) + '<main class="hrwrap" id="content">' + nav(st['code'])
      + '<section class="hero2"><p class="kick">%s · %s</p><h1>%s</h1><p>%s</p></section>' % (st['code'], html.escape(st['sys']), html.escape(st['name']), html.escape(st['tag']))
      + '<div id="arcade-root"></div><p class="small muted" style="margin-top:22px">Independent learning material · Fictional scenarios and data · No affiliation claimed with any vendor or authority.</p></main>'
      + '<script>%s</script><script>%s</script><script>var HRDATA=%s;Arcade.init(HRDATA);Arcade.view();</script></body></html>' % (ENGINE, quote_js(), json.dumps(data, ensure_ascii=False).replace('</', '<\\/')))

def hub():
    cards = ''.join('<a class="arc-tile" href="%s" style="text-decoration:none;color:inherit;border-top:4px solid %s"><span class="label muted">%s</span><strong>%s</strong><p class="small muted">%s</p><span class="small">108 games →</span></a>' % (file_of(s), theme(s)['accent'], s['code'], html.escape(s['name']), html.escape(s['tag'])) for s in STREAMS)
    return ('<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>%s</title>' % LAB['name'] + '<style>%s%s</style></head><body>' % (BASE_CSS, css(STREAMS[0]))
      + header() + '<main class="hrwrap" id="content"><section class="hero2"><p class="kick">%s Essentials Edition (Gold Edition)</p><h1>%s</h1><p>%s</p></section>' % (MEDAL, LAB['name'], LAB['intro'])
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
