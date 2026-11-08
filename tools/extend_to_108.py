"""Extend the India payroll workbook from 54 to 108 core sections.

Sections 55-81  Payroll Control Center detailed configuration   (spec_pcc.py)
Sections 82-108 EC -> ECP point-to-point replication steps      (spec_p2p.py)

Input : tools/base/India_54.html   (54 core sections + 6 learning tools)
Output: India.html                 (108 core sections + 8 learning tools)
Run   : python3 tools/extend_to_108.py
Idempotent: always rebuilds from the 54-section base.
"""
from pathlib import Path
import copy, json, re, subprocess, sys

ROOT = Path(__file__).resolve().parent
REPO = ROOT.parent
sys.path.insert(0, str(ROOT))
import spec_pcc, spec_p2p, vendor_enrich as enrich  # noqa: E402

import tools_content as TC

CORE = 108
TOOLS = 8
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


def module(n, spec, part_owner, prev_title):
    rows = [list(r) for r in spec['rows']]
    area, detail, ev = spec['india']
    tables = [
        dict(title='Configuration and evidence sheet', heads=['Item', 'Detail', 'Source / check'], rows=rows),
        dict(title='India learning application', heads=['Area', 'India application (fictional case)', 'Evidence to keep'], rows=[[area, detail, ev]]),
    ]
    return dict(n=n, title=spec['title'], cat=spec['cat'], what=spec['what'], why=spec['why'], steps=spec['steps'],
                tables=tables, lab=spec['lab'], owner=part_owner, evidence=EVIDENCE, sources=spec['srcs'],
                prerequisite=('Sections 1 to 54 and the India evidence boundary' if n in (55, 82) else f'Section {n-1}: {prev_title}'),
                nextstep='Record the decision, link the evidence, name the open question and confirm object names in your own release.')


def normalise(s):
    s = re.sub(r"(Search )\d+( sections \+ tools)", rf"\g<1>{CORE}\2", s)
    s = re.sub(r'(id="sidecount">0 / )\d+', rf'\g<1>{CORE}', s)
    s = re.sub(r"\b\d+ (configuration|detailed|guided|learning and design) sections", lambda m: f'{CORE} {m.group(1)} sections', s)
    s = re.sub(r'<strong>\d+</strong><span>Configuration sections</span>', f'<strong>{CORE}</strong><span>Configuration sections</span>', s)
    s = s.replace('60 sections in total', f'{CORE} core sections + {TOOLS} learning tools')
    s = s.replace(' official references', ' references').replace('Official reference links', 'Reference links')
    s = s.replace("'Integration','Governance']){const list", "'Integration','Governance'," + ','.join("'" + c + "'" for c in NEW_CATS) + "]){const list")
    return s


def learning_tools(s, d, c, mods):
    """Expand quiz/cards/crossword and add the Sequence Sprint and Match-Up tools."""
    import random
    rnd = random.Random(108)
    terms = TC.TERMS
    d['quiz'] = d['quiz'][:12]
    for q, opts, ans, why in TC.SCENARIOS:
        d['quiz'].append(dict(q=q, options=opts, answer=ans, why=why))
    picked = terms[::2][:24]
    for i, (t, m, part) in enumerate(picked):
        pool = [x[1] for x in terms if x[2] == part and x[1] != m]
        wrong = rnd.sample(pool, 3)
        pos = i % 4
        opts = wrong[:pos] + [m] + wrong[pos:]
        d['quiz'].append(dict(q='In the %s content, what is %s?' % ('Payroll Control Center' if part == 'pcc' else 'EC-ECP replication', t),
                              options=opts, answer=pos, why='%s: %s. Confirm exact names in your own release.' % (t, m)))
    d['cards'] = d['cards'][:25] + [[t, m] for t, m, _ in terms]
    d['sequence'] = []
    for x in mods:
        if x['n'] >= 55 and len(x['steps']) >= 4 and x['n'] % 2 == 1:
            d['sequence'].append(dict(n=x['n'], title=x['title'], steps=x['steps'][:6]))
    d['match'] = [[t, m] for t, m, _ in terms]
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
        "['notes','Sticky Notes','Capture assumptions, questions and experiments'],['sequence','Sequence Sprint','Put real process steps in the right order'],['match','Match-Up','Pair SAP objects with what they do']];")
    rep("flash:'▱',notes:'▣'}", "flash:'▱',notes:'▣',sequence:'⇅',match:'⇄'}")
    rep("'12 country and process questions'", "'%d country, process and scenario questions'" % n_q)
    rep("'25 cards to explain and retrieve'", "'%d cards to explain and retrieve'" % n_c)
    rep("'25 prompts. Predict", "'%d prompts. Predict" % n_c)
    rep("<strong>25</strong><span>Country flashcards", "<strong>%d</strong><span>Country flashcards" % n_c)
    rep("<strong>12</strong><span>Quiz questions", "<strong>%d</strong><span>Quiz questions" % n_q)
    rep("Six learning tools", "Eight learning tools")
    rep("6 learning tools", "8 learning tools")
    s = re.sub(r"Learning tool (\d) / 6", r"Learning tool \1 / 8", s)
    rep("else if(id==='game')out=game();", "else if(id==='game')out=game();else if(id==='sequence')out=sequence();else if(id==='match')out=match();")
    rep("if(active==='game')bindGame();", "if(active==='game')bindGame();if(active==='sequence')bindSequence();if(active==='match')bindMatch();")
    rep("function quiz(){", js + "\nfunction crosswordTerms(){return crosswordTerms0().concat(" + json.dumps(TC.EXTRA_CROSSWORD, ensure_ascii=False) + ")}\nfunction quiz(){")
    rep("function crosswordTerms(){const country", "function crosswordTerms0(){const country")
    return s


def main():
    s = (ROOT / 'base' / 'India_54.html').read_text()
    m = DATA_RE.search(s)
    d = json.loads(m.group(2))
    assert len(d['modules']) == 54, len(d['modules'])
    have = {x['ref'] for x in d['sources']}
    for ref, (title, url) in SOURCES.items():
        if ref not in have:
            d['sources'].append(dict(ref=ref, title=title, url=url))
    mods = d['modules']
    for n, spec in enumerate(spec_pcc.SECTIONS, 55):
        mods.append(module(n, spec, 'Payroll Control Center lead with payroll, security and Finance owners', mods[-1]['title']))
    for n, spec in enumerate(spec_p2p.SECTIONS, 82):
        mods.append(module(n, spec, 'Integration lead with Employee Central, payroll and basis owners', mods[-1]['title']))
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
        recipe = ('s%d' % n, cap, picture, nxt)
        c['reflections']['section-%d' % n] = enrich.reflection(c['country'], c['person'], recipe)
    for x in mods:
        if x['n'] >= 55:
            x['tables'] = [t for t in x['tables'] if not t.get('_slaSynthetic')] + [enrich.fixture_table(x['n'], c)]
    c['version'] = '2026-11-08-india-108'
    s = learning_tools(s, d, c, mods)
    cm = CASE_RE.search(s)

    enc = lambda o: json.dumps(o, ensure_ascii=False, separators=(',', ':')).replace('</', r'<\/')
    s = s[:cm.start(2)] + enc(c) + s[cm.end(2):]
    m = DATA_RE.search(s)
    s = s[:m.start(2)] + enc(d) + s[m.end(2):]
    s = normalise(s)
    (REPO / 'India.html').write_text(s)
    for attrs, code in re.findall(r'<script([^>]*)>(.*?)</script>', s, re.S):
        if 'application/json' in attrs:
            json.loads(code)
        elif code.strip():
            subprocess.run(['node', '--check'], input=code, text=True, capture_output=True, check=True)
    print(json.dumps({'file': 'India.html', 'core': CORE, 'tools': TOOLS, 'bytes': len(s.encode()), 'sources': len(d['sources'])}))


if __name__ == '__main__':
    main()
