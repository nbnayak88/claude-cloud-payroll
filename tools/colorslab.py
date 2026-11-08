"""ColorsLab-108 country gradients -> per-workbook theme CSS.

Source registry: tools/colorslab-108.json (copied from nbnayak88/colorslab-108, data/palettes.json,
commit 8681b04). Rules applied: exactly two stops, 110deg, start 0% -> end 100%, dark ink text on the
gradient (checked against BOTH stops), accessible deep colours for text/buttons, blue CTA.
Palettes are a design proposal, not official flag colours.
"""
import colorsys, json, pathlib

REG = json.loads((pathlib.Path(__file__).parent / 'colorslab-108.json').read_text())
ALIAS = {'Turkey': 'Türkiye', 'Czech Republic': 'Czechia'}
PAL = {p['name']: p for p in REG['countryPalettes']}
ARCTIC = ('#329ED8', '#D7F1FF')  # ColorsLab sample "Arctic dashboard", used for the hub hero
SOURCE = 'ColorsLab-108 v%s (%s)' % (REG['version'], REG['updated'])


def palette(country):
    return PAL[ALIAS.get(country, country)]


def _rgb(h):
    h = h.lstrip('#')
    return tuple(int(h[i:i + 2], 16) / 255 for i in (0, 2, 4))


def _hex(rgb):
    return '#%02X%02X%02X' % tuple(round(max(0, min(1, v)) * 255) for v in rgb)


def lum(h):
    f = lambda v: v / 12.92 if v <= .03928 else ((v + .055) / 1.055) ** 2.4
    r, g, b = map(f, _rgb(h))
    return .2126 * r + .7152 * g + .0722 * b


def contrast(a, b):
    x, y = sorted((lum(a), lum(b)), reverse=True)
    return (x + .05) / (y + .05)


def mix(a, b, t):  # t of a over b
    return _hex(tuple(p * t + q * (1 - t) for p, q in zip(_rgb(a), _rgb(b))))


def darken_to(h, bg, ratio):
    hh, l, s = colorsys.rgb_to_hls(*_rgb(h))
    while contrast(_hex(colorsys.hls_to_rgb(hh, l, s)), bg) < ratio and l > .05:
        l -= .01
    return _hex(colorsys.hls_to_rgb(hh, l, s))


INKS = ['#172B4D', '#10223C', '#0A1A2E']


def theme(country):
    p = palette(country)
    a, b = p['start'].upper(), p['end'].upper()
    ink = next((i for i in INKS if min(contrast(i, a), contrast(i, b)) >= 4.5), None)
    assert ink, (country, a, b)
    accent = darken_to(a, '#FFFFFF', 5.5)
    mid = darken_to(a, '#FFFFFF', 6.5)
    deep = darken_to(a, '#FFFFFF', 10)
    pale = mix(b, '#FFFFFF', .55)
    assert contrast(accent, pale) >= 4.5, (country, accent, pale)
    t1, t2 = mix(a, '#FFFFFF', .16), mix(b, '#FFFFFF', .7)  # soft header / page tints (two stops)
    return dict(start=a, end=b, ink=ink, accent=accent, mid=mid, deep=deep, pale=pale, t1=t1, t2=t2,
                hero_contrast=round(min(contrast(ink, a), contrast(ink, b)), 2))


G = 'linear-gradient(110deg,var(--gradient-start) 0%%,var(--gradient-end) 100%%)'


def css(country):
    t = theme(country)
    return (
        '/*ColorsLab-108 country gradient (proposal, not flag colours)*/'
        ':root{--gradient-start:%(start)s;--gradient-end:%(end)s;--ink:%(ink)s;--deep:%(deep)s;--mid:%(mid)s;'
        '--bright:%(end)s;--accent:%(accent)s;--pale:%(pale)s}'
        'body:not(.dark){background:linear-gradient(110deg,%(t2)s 0%%,#FFFFFF 100%%)}'
        'body:not(.dark) header{background:linear-gradient(110deg,%(t1)s 0%%,%(t2)s 100%%)}'
        '.hero{background:' + G + '!important;color:var(--ink)}'
        '.hero:after{border-color:#17294D26}.hero h1,.hero p,.hero-foot{color:var(--ink)}'
        '.hero .label{color:var(--ink);opacity:.85}.hero-foot{border-top-color:#17294D33}'
        '.hero .applied{color:var(--ink);border-color:#17294D55;background:#FFFFFF80}'
        '.hero .pill{color:var(--ink);border-color:#17294D40;background:#FFFFFF70}'
        '.btn.primary{background:#1263B4;border-color:#1263B4;color:#fff}.btn.primary:hover{background:#0E4F92;border-color:#0E4F92}'
        '.btn:focus-visible,button:focus-visible,a:focus-visible,input:focus-visible,textarea:focus-visible,select:focus-visible{outline:3px solid #1263B4;outline-offset:2px}'
        '@media(prefers-reduced-motion:reduce){*{transition:none!important;animation:none!important;scroll-behavior:auto!important}}'
    ) % t
