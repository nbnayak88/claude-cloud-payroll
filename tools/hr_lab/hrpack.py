"""Content packs for the HR Streams Lab. HR07 is derived from the payroll pack; the others come from stream specs."""
import copy, json, re
from pathlib import Path
REPO = Path(__file__).parent.parent.parent

def india_arcade():
    s = (REPO / 'India.html').read_text(encoding='utf-8')
    return json.loads(re.search(r'id="workbook-data">(.*?)</script>', s, re.S).group(1))['arcade']

# neutralise country specifics so the payroll stream is not tied to one country
HR07_REPL = [('TEST-IN-', 'TEST-HR-'), ('DEMO-IN-', 'DEMO-HR-'), ('POS-IN-', 'POS-HR-'), ('Asia/Kolkata', 'Region/Central'),
             ('this India workbook', 'this payroll stream'), ('the India design', 'the payroll design'), ('India operations', 'regional operations'),
             ('the India area code', 'the payroll area code'), ('IN is the India area.', 'The area code matches the payroll area.'),
             ('India case pays in INR', 'This case pays in USD'), ('India time zone', 'Payroll time zone'), ('Only India workers replicate', 'Only in-scope workers replicate'),
             ('India-specific', 'country-specific'), ('India profile', 'country profile'), ('India employee', 'country employee'), ('India payroll', 'payroll'),
             ('India learning case', 'HR stream learning case'), ('Country-Specific Data Model: India', 'Country-Specific Data Model'),
             ('Production readiness for India', 'Production readiness'), ('Income Tax Department, EPFO, ESIC', 'Tax authority, social security, statutory'),
             (' INR', ' USD'), ('"INR"', '"USD"'), ('INR ', 'USD ')]

def hr07(st):
    a = india_arcade(); t = json.dumps(a, ensure_ascii=False)
    for o, n in HR07_REPL + [('"IN"', '"US"'), ('"IND"', '"USA"'), ('"India"', '"United States"'), ('the current SAP guide', 'the current official guidance'), ('That SAP has approved the setup', 'That a vendor has approved the setup')]: t = t.replace(o, n)
    a = json.loads(t)
    p = a['pack']
    p['id'] = 'hr-streams.hr07-payroll.v1'; p['subject'] = 'HR07 Payroll'; p['cur'] = 'USD'
    bad = re.compile(r'EPFO|Form \d|SAP|tenant|country experiment|highlighted|Act /|ESI|TDS|India|statutory|authority|April 2026|ceiling|vendor|workbook|this country|section \d|2027 rate', re.I)
    p['quiz'] = [x for x in p['quiz'] if not bad.search(json.dumps(x))]
    p['sequences'] = [x for x in p['sequences'] if not bad.search(json.dumps(x))]
    p.setdefault('ui', {})
    a['source'] = 'Original fictional scenarios written for the HR Streams Lab'
    return a

def pack_for(st):
    code = st['code']
    a = hr07(st) if code == 'HR07' else None
    if a is None:
        from hrspec import spec_pack
        a = spec_pack(st)
    a['pack']['ui'] = dict(a['pack'].get('ui') or {}, resultsKey='hrlab-results-' + code)
    a['source'] = 'Original fictional scenarios written for the HR Streams Lab'
    return a
