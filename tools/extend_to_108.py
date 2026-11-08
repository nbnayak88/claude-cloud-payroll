"""Extend each country payroll workbook from 54 to 108 core sections.

Sections 55-81  Payroll Control Center detailed configuration   (spec_pcc.py)
Sections 82-108 EC -> ECP point-to-point replication steps      (spec_p2p.py)

Input : tools/base/<Country>_54.html.gz   (54 core sections + 6 learning tools)
Output: <Country>.html                    (108 core sections + 9 learning tools)
Run   : python3 tools/extend_to_108.py [Country_Name ...]   (no arguments builds every country)
Idempotent: always rebuilds from the 54-section base.
"""
from pathlib import Path
import copy, gzip, json, re, subprocess, sys

ROOT = Path(__file__).resolve().parent
REPO = ROOT.parent
sys.path.insert(0, str(ROOT))
import spec_pcc, spec_p2p, vendor_enrich as enrich, localize as L, colorslab as CL  # noqa: E402

import sys
import tools_content as TC
import sanitize_content as SC
sys.path.insert(0, str(Path(__file__).parent / 'playlab'))
import arcade_pack

CORE = 108
TOOLS = 9
NEW_CATS = ['Payroll Control Center', 'EC–ECP Replication']
REVIEWED = '8 November 2026'

SOURCES = {
 'sap-press-ecp': ('SAP Press · SAP SuccessFactors Employee Central Payroll · table of contents (chapters 3, 7–10)', 'https://www.sap-press.com/sap-successfactors-employee-central-payroll_5386/toc/4273'),
 'pcc-tech-blog': ('SAP Blogs · Technical implementation of Payroll Control Center with Employee Central Payroll', 'https://blogs.sap.com/2018/03/04/technical-implementation-of-payroll-control-center-with-employee-center-payroll/'),
 'pcc-manage-config': ('SAPinsider · The evolution of Payroll Control Center configuration (Manage Configuration)', 'https://sapinsider.org/expert-insights/a-look-at-sap-successfactors-payroll-control-center-manage-configuration/'),
 'pcc-learning-sap': ('SAP Learning · Configuring payroll processes in Payroll Control Center', 'https://learning.sap.com/courses/sap-successfactors-employee-central-payroll-for-payroll-administrators-jp/configuring-payroll-processes-in-payroll-control-center_c80b1e8b-597e-4f3e-b76e-8afc175930d4'),
 'hrh65-training': ('SAP training HRH65 · Payroll Control Center units (off-cycle, authorization, tools)', 'https://cdn.training.sap.com/cdn/course-pdf/HRH65_EN_Col42_CO_A4.pdf/G/EN/HRH65/042'),
 'kba-3190430': ('SAP KBA 3190430 · Payroll Control Center set-up for Employee Central Payroll', 'https://userapps.support.sap.com/sap/support/knowledge/en/3190430'),
 'kba-3100390': ('SAP KBA 3100390 · PCC result details and persistence', 'https://userapps.support.sap.com/sap/support/knowledge/en/3100390'),
 'kba-3595787': ('SAP KBA 3595787 · PCC process not visible under Upcoming Processes', 'https://userapps.support.sap.com/sap/support/knowledge/en/3595787'),
 'kba-2686449': ('SAP KBA 2686449 · PCC team member list shows unexpected employees', 'https://userapps.support.sap.com/sap/support/knowledge/en/2686449'),
 'ptp-blog-i': ('SAP Community · SuccessFactors EC–ECP employee data replications, part I', 'https://groups.community.sap.com:443/t5/human-capital-management-blogs-by-members/sap-successfactors-ec-ecp-employee-data-replications-part-i/bc-p/13461886'),
 'ptp-blog-ii': ('SAP Blogs · SuccessFactors EC–ECP employee data replications, part II', 'https://blogs.sap.com/2020/11/17/sap-successfactors-ec-ecp-employee-data-replications-part-ii/'),
 'ptp-time-blog': ('SAP Blogs · Replicating time data from Employee Central to ECP: an overview', 'https://blogs.sap.com/2019/07/30/replicating-time-data-from-employee-central-to-ecp-an-overview/'),
 'ptp-pos-blog': ('SAP Community · Replicating position and job titles to Employee Central Payroll', 'https://community.sap.com/t5/human-capital-management-blog-posts-by-members/replicating-position-and-job-titles-to-employee-central-payroll/ba-p/13367961'),
 'ptp-hire-blog': ('SAP Blogs · EC Payroll push replication for hire, rehire and termination cases', 'https://blogs.sap.com/2019/03/19/ec-payroll-push-replication-for-hire-rehire-and-termination-cases/'),
 'ptp-rizing': ('Rizing · H2 2022 SAP SuccessFactors (certificate-based point-to-point, replication status)', 'https://rizing.com/?p=54578'),
 'learning-ec-ecp': ('SAP Learning · Understanding EC and EC Payroll integration', 'https://learning.sap.com/courses/implementing-sap-successfactors-integration-with-employee-central-payroll/understanding-ec-and-ecp-integration-overview'),
 'kba-3013644': ('SAP KBA 3013644 · RP_HRSFEC_PTP_CONFIGURATION and data centre information', 'https://userapps.support.sap.com/sap/support/knowledge/en/3013644'),
 'kba-3135533': ('SAP KBA 3135533 · PTP time data replication: switching the replication target system', 'https://userapps.support.sap.com/sap/support/knowledge/en/3135533'),
 'kba-3548271': ('SAP KBA 3548271 · HRSFEC_PTP_CONFIG unknown property externalName_en_US', 'https://userapps.support.sap.com/sap/support/knowledge/en/3548271'),
 'kba-2546708': ('SAP KBA 2546708 · OData create for Replication Target System failed with status 400', 'https://userapps.support.sap.com/sap/support/knowledge/en/2546708'),
 'kba-3167173': ('SAP KBA 3167173 · Point-to-point replication with X.509 certificates', 'https://userapps.support.sap.com/sap/support/knowledge/en/3167173'),
 'kba-3268520': ('SAP KBA 3268520 · "Connect with User ID and Password" in HRSFEC_PTP_CONFIG', 'https://userapps.support.sap.com/sap/support/knowledge/en/3268520'),
 'kba-3259174': ('SAP KBA 3259174 · "Employee Central credentials weren’t saved"', 'https://userapps.support.sap.com/sap/support/knowledge/en/3259174'),
 'kba-3452594': ('SAP KBA 3452594 · SSSLERR_PEER_CERT_UNTRUSTED in HRSFEC_PTP_CONFIG', 'https://userapps.support.sap.com/sap/support/knowledge/en/3452594'),
 'kba-3606604': ('SAP KBA 3606604 · Replicating custom MDF objects via PTP (query segment)', 'https://userapps.support.sap.com/sap/support/knowledge/en/3606604'),
}

DATA_RE = re.compile(r'(<script type="application/json" id="workbook-data">)(.*?)(</script>)', re.S)
CASE_RE = re.compile(r'(<script(?: type="application/json")? id="sla-case-data">)(.*?)(</script>)', re.S)

EVIDENCE = ['Source and release/version recorded', 'Object names confirmed against your release before use',
            'Independent expected result written before the test', 'Observed result linked only after a real test',
            'Open questions assigned to a named owner']


def module(n, spec, part_owner, prev_title, X):
    rows = [list(r) for r in spec['rows']]
    area, detail, ev = spec['india']
    tables = [
        dict(title='Configuration and evidence sheet', heads=['Item', 'Detail', 'Source / check'], rows=rows),
        dict(title='India learning application', heads=['Area', 'India application (fictional case)', 'Evidence to keep'], rows=[[area, detail, ev]]),
    ]
    return L.obj(dict(n=n, title=spec['title'], cat=spec['cat'], what=spec['what'], why=spec['why'], steps=spec['steps'],
                tables=tables, lab=spec['lab'], owner=part_owner, evidence=EVIDENCE, sources=spec['srcs'],
                prerequisite=('Sections 1 to 54 and the India evidence boundary' if n in (55, 82) else f'Section {n-1}: {prev_title}'),
                nextstep='Record the decision, link the evidence, name the open question and confirm object names in your own release.'), X)


def normalise(s):
    s = re.sub(r"(Search )\d+( sections \+ tools)", rf"\g<1>{CORE}\2", s)
    s = re.sub(r'(id="sidecount">0 / )\d+', rf'\g<1>{CORE}', s)
    s = re.sub(r"\b\d+ (configuration|detailed|guided|learning and design) sections", lambda m: f'{CORE} {m.group(1)} sections', s)
    s = re.sub(r'<strong>\d+</strong><span>Configuration sections</span>', f'<strong>{CORE}</strong><span>Configuration sections</span>', s)
    s = s.replace('60 sections in total', f'{CORE} core sections + {TOOLS} learning tools')
    s = s.replace('six learning tools', 'nine learning tools').replace('The six tools below', 'The nine tools below')
    s = s.replace(' official references', ' references').replace('Official reference links', 'Reference links')
    s = s.replace("'Integration','Governance']){const list", "'Integration','Governance'," + ','.join("'" + c + "'" for c in NEW_CATS) + "]){const list")
    return s


ARC_CSS = ('.arc-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:12px;margin-bottom:18px}.arc-tile{border:1px solid var(--line);border-radius:14px;padding:14px;background:var(--surface);display:flex;flex-direction:column;gap:8px}.arc-tile.off{opacity:.62}.quizopt.correct{border-color:#2e8b57;background:#e9f6ee}.quizopt.wrong{border-color:#c0562f;background:#fdeee8}.table{width:100%;border-collapse:collapse}.table th,.table td{padding:8px 10px;border-bottom:1px solid var(--line);text-align:left;font-size:13px;vertical-align:top}')
ARC_ENGINE = (Path(__file__).parent / 'playlab' / 'arcade_engine.js').read_text()
PLAYER_CSS = ('@media(min-width:761px){header{grid-template-columns:auto auto auto minmax(160px,1fr) minmax(190px,240px) auto !important}}@media(max-width:760px){header{padding-top:58px !important}.focus{position:absolute;top:10px;left:12px}}.focus{flex:none;display:flex;align-items:center;gap:8px;margin-right:4px}.focus button{display:inline-flex;align-items:center;gap:6px;padding:7px 11px;font-size:13px;border-radius:999px;border:1px solid var(--line);background:var(--surface);color:var(--text);font-weight:600;cursor:pointer}'
              'span.mark{color:var(--deep)}.focus button[aria-pressed="true"]{background:var(--deep);color:#fff;border-color:var(--deep)}.focus .eq{font-size:11px;opacity:.7}@media(max-width:700px){.focus .lbl{display:none}}')
PLAYER_HTML = ('<div class="focus"><button type="button" id="focusbtn" aria-pressed="false" aria-label="Play focus music"><span id="focusicon" aria-hidden="true">\u25b6</span><span class="lbl" id="focuslbl">Focus</span></button>'
               '<audio id="focusaudio" loop preload="none" src="assets/focus-music.mp3"></audio></div>')
PLAYER_JS = ("(function(){var b=document.getElementById('focusbtn'),a=document.getElementById('focusaudio');if(!b||!a)return;"
             "function ui(on){b.setAttribute('aria-pressed',on?'true':'false');b.setAttribute('aria-label',on?'Stop focus music':'Play focus music');"
             "document.getElementById('focusicon').textContent=on?'\u25a0':'\u25b6';document.getElementById('focuslbl').textContent=on?'Stop':'Focus'}"
             "b.addEventListener('click',function(){if(a.paused){a.volume=.5;var p=a.play();if(p&&p.then)p.then(function(){ui(true)}).catch(function(){ui(false)});else ui(true)}else{a.pause();a.currentTime=0;ui(false)}});"
             "a.addEventListener('ended',function(){ui(false)})})();")


def sanitize(d, mods):
    """No vendor, book or web references; logical worked examples with synthetic data instead."""
    for x in mods:
        if x['n'] < 55:
            continue
        t0 = x['tables'][0]
        t0['heads'] = ['Item', 'Detail']
        t0['rows'] = [[r[0], SC.DETAIL.get((x['n'], r[0]), r[1])] for r in t0['rows']]
        story, rows = SC.WE[x['n']]
        x['tables'].append(dict(title='Worked example \u00b7 synthetic case (' + story + ')',
                                heads=['Step', 'Synthetic data (fictional)', 'Expected result'], rows=[list(r) for r in rows]))
        x['sources'] = []
        x['steps'] = [SC.STEP_FIX[x['n']][1] if (x['n'] in SC.STEP_FIX and st == SC.STEP_FIX[x['n']][0]) else st for st in x['steps']]
        if x['n'] in SC.WHY_FIX:
            x['why'] = SC.WHY_FIX[x['n']]
    bad = re.compile(r'sap\.com|sap-press|sapinsider|rizing|sap\.|userapps', re.I)
    d['sources'] = [r for r in d['sources'] if not bad.search(r['url'])]
    keep = {r['ref'] for r in d['sources']}
    for x in mods:
        x['sources'] = [r for r in x['sources'] if r in keep]
    blob = json.dumps(d['modules'], ensure_ascii=False)
    for v in SC.VENDOR:
        assert v not in blob, ('vendor wording left: ' + v, [i for i, m in enumerate(d['modules'], 1) if v in json.dumps(m, ensure_ascii=False)])


def learning_tools(s, d, c, mods, X):
    """Expand quiz/cards/crossword and add the Sequence Sprint and Match-Up tools."""
    import random
    rnd = random.Random(108)
    terms = TC.TERMS
    d['quiz'] = d['quiz'][:12]
    for q, opts, ans, why in TC.SCENARIOS:
        d['quiz'].append(L.obj(dict(q=q, options=opts, answer=ans, why=why), X))
    picked = terms[::2][:24]
    for i, (t, m, part) in enumerate(picked):
        pool = [x[1] for x in terms if x[2] == part and x[1] != m]
        wrong = rnd.sample(pool, 3)
        pos = i % 4
        opts = wrong[:pos] + [m] + wrong[pos:]
        d['quiz'].append(dict(q='In the %s content, what is %s?' % ('Payroll Control Center' if part == 'pcc' else 'EC-ECP replication', t),
                              options=opts, answer=pos, why='%s: %s.' % (t, m)))
    d['cards'] = d['cards'][:25] + [[t, m] for t, m, _ in terms]
    d['sequence'] = []
    for x in mods:
        if x['n'] >= 55 and len(x['steps']) >= 4 and x['n'] % 2 == 1:
            d['sequence'].append(dict(n=x['n'], title=x['title'], steps=x['steps'][:6]))
    d['match'] = [[t, m] for t, m, _ in terms]
    d['arcade'] = L.obj(arcade_pack.build(d['quiz'], d['sequence']), X)
    c['toolReflections']['arcade'] = {'Affirmation': 'I can learn by playing and still take the work seriously.', 'Visualization': 'I picture myself solving the puzzle calmly, one clear move at a time.', 'Gratitude': 'I am grateful for games that make hard ideas easy to practise.', 'Intention': 'Today I will finish one game and explain what it taught me.'}
    refl = lambda a, v, g, i: {'Affirmation': a, 'Visualization': v, 'Gratitude': g, 'Intention': i}
    c['toolReflections']['sequence'] = refl('I can explain why each payroll step comes before the next.',
        'I picture the process as a line of checkpoints, each one needing evidence before the next opens.',
        'I am grateful for colleagues who document the order of work so others can follow it.',
        'Today I will put one real process into order and write down why.')
    c['toolReflections']['match'] = refl('I can connect each object or transaction to its job.',
        'I picture a clean map where every term has its place and purpose.',
        'I am grateful for the SAP documentation that names these objects clearly.',
        'Today I will match three terms and use each in a sentence.')
    n_q, n_c = len(d['quiz']), len(d['cards'])
    js = TC.JS
    def rep(old, new, count=1):
        nonlocal s
        assert s.count(old) >= 1, old
        s = s.replace(old, new)
    rep("['notes','Sticky Notes','Capture assumptions, questions and experiments']];",
        "['notes','Sticky Notes','Capture assumptions, questions and experiments'],['sequence','Sequence Sprint','Put real process steps in the right order'],['match','Match-Up','Pair SAP objects with what they do'],['arcade','PlayLab Arcade','108 playable games from the PlayLab standard']];")
    rep("flash:'▱',notes:'▣'}", "flash:'▱',notes:'▣',sequence:'⇅',match:'⇄',arcade:'🎮'}")
    rep("'12 country and process questions'", "'%d country, process and scenario questions'" % n_q)
    rep("'25 cards to explain and retrieve'", "'%d cards to explain and retrieve'" % n_c)
    rep("'25 prompts. Predict", "'%d prompts. Predict" % n_c)
    rep("<strong>25</strong><span>Country flashcards", "<strong>%d</strong><span>Country flashcards" % n_c)
    rep("<strong>12</strong><span>Quiz questions", "<strong>%d</strong><span>Quiz questions" % n_q)
    rep("Six learning tools", "Nine learning tools")
    rep("6 learning tools", "9 learning tools")
    s = re.sub(r"Learning tool (\d) / 6", r"Learning tool \1 / 9", s)
    rep("else if(id==='game')out=game();", "else if(id==='game')out=game();else if(id==='sequence')out=sequence();else if(id==='match')out=match();else if(id==='arcade')out=arcade();")
    rep("if(active==='game')bindGame();", "if(active==='game')bindGame();if(active==='sequence')bindSequence();if(active==='match')bindMatch();if(active==='arcade'){Arcade.init(D.arcade);Arcade.view()}")
    rep("function render(id){active=id;", "function render(id){if(window.Arcade)Arcade.stop();active=id;")
    rep("function quiz(){", ARC_ENGINE + "\nfunction arcade(){return header('Learning tool 9 / 9',P.name+' PlayLab arcade','Real, finishable games from the PlayLab 108 standard, played with fictional payroll scenarios.')+'<div id=\"arcade-root\"></div>'}\n" + js + "\nfunction crosswordTerms(){return crosswordTerms0().concat(" + json.dumps(TC.EXTRA_CROSSWORD, ensure_ascii=False) + ")}\nfunction quiz(){")
    rep("function crosswordTerms(){const country", "function crosswordTerms0(){const country")
    return s


def build_country(s, out_name):
    m = DATA_RE.search(s)
    d = json.loads(m.group(2))
    assert len(d['modules']) == 54, len(d['modules'])
    cm0 = CASE_RE.search(s)
    c0 = json.loads(cm0.group(2))
    X = L.make(c0)
    app = X.app
    have = {x['ref'] for x in d['sources']}
    for ref, (title, url) in SOURCES.items():
        if ref not in have:
            d['sources'].append(dict(ref=ref, title=title, url=url))
    mods = d['modules']
    for n, spec in enumerate(spec_pcc.SECTIONS, 55):
        mods.append(module(n, spec, 'Payroll Control Center lead with payroll, security and Finance owners', mods[-1]['title'], X))
    for n, spec in enumerate(spec_p2p.SECTIONS, 82):
        mods.append(module(n, spec, 'Integration lead with Employee Central, payroll and basis owners', mods[-1]['title'], X))
    assert [x['n'] for x in mods] == list(range(1, CORE + 1))
    known = {x['ref'] for x in d['sources']}
    for x in mods:
        assert set(x['sources']) <= known, (x['n'], set(x['sources']) - known)

    # learning case data: reflections + one synthetic fixture table per new section
    cm = CASE_RE.search(s)
    c = json.loads(cm.group(2))
    recipes = enrich.MAIN_RECIPES
    for n, spec in enumerate(spec_pcc.SECTIONS + spec_p2p.SECTIONS, 55):
        cap, picture, nxt = spec['recipe']
        recipe = L.obj(('s%d' % n, cap, picture, nxt), X)
        c['reflections']['section-%d' % n] = enrich.reflection(c['country'], c['person'], recipe)
    for x in mods:
        if x['n'] >= 55:
            x['tables'] = [t for t in x['tables'] if not t.get('_slaSynthetic')] + [enrich.fixture_table(x['n'], c, app=app)]
    c['version'] = '2026-11-09-%s-108' % X.code.lower()
    d['profile']['themeName'] = 'ColorsLab-108 country gradient %s to %s' % (CL.palette(X.country)['start'], CL.palette(X.country)['end'])
    sanitize(d, mods)
    for i, x in enumerate(mods):
        if x['n'] >= 55:
            mods[i] = L.obj(x, X)
    s = learning_tools(s, d, c, mods, X)
    assert 'SAP Press' not in json.dumps(d, ensure_ascii=False)
    cm = CASE_RE.search(s)

    enc = lambda o: json.dumps(o, ensure_ascii=False, separators=(',', ':')).replace('</', r'<\/')
    s = s[:cm.start(2)] + enc(c) + s[cm.end(2):]
    m = DATA_RE.search(s)
    s = s[:m.start(2)] + enc(d) + s[m.end(2):]
    s = normalise(s)
    if not d['sources']:
        # replication editions keep no outside links: drop the "Read the country entry" button and guard the export
        s = s.replace("guide:D.sources[0].url}", "guide:(D.sources[0]||{}).url||''}")
        s = re.sub(r'<a class="btn" target="_blank" rel="noopener noreferrer" href="\'\+esc\(D\.sources\[0\]\.url\)\+\'">Read the country entry \u2197</a>', '', s)
        assert 'D.sources[0].url' not in s.replace("(D.sources[0]||{}).url", '')
    k = s.rindex('</style>')
    s = s[:k] + ARC_CSS + PLAYER_CSS + CL.css(X.country) + s[k:]
    s = s.replace('<header>', '<header>' + PLAYER_HTML, 1)
    s = s.replace('</body>', '<script>' + PLAYER_JS + '</script></body>', 1)
    if X.country != 'India':
        bad = L.leftovers([d['modules'][54:], d['quiz'][12:], d['sequence'], d['arcade']])
        assert not bad, (out_name, bad)
    (REPO / out_name).write_text(s)
    for attrs, code in re.findall(r'<script([^>]*)>(.*?)</script>', s, re.S):
        if 'application/json' in attrs:
            json.loads(code)
        elif code.strip():
            subprocess.run(['node', '--check'], input=code, text=True, capture_output=True, check=True)
    return dict(file=out_name, country=X.country, core=CORE, tools=TOOLS, bytes=len(s.encode()), sources=len(d['sources']))


def main(argv):
    only = set(argv)
    results = []
    for p in sorted((ROOT / 'base').glob('*_54.html.gz')):
        name = p.name[:-len('_54.html.gz')]
        if only and name not in only:
            continue
        res = build_country(gzip.decompress(p.read_bytes()).decode(), name + '.html')
        results.append(res)
        print(json.dumps(res), flush=True)
    print('built', len(results))


if __name__ == '__main__':
    main(sys.argv[1:])
