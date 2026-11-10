import json, re, sys
V = re.compile(r'payroll|payslip|wage|net pay|gross|base pay|allowance|retro|replicat|ledger|infotype|control center|clerk|INR|India|TEST-IN|SAP\b|SuccessFactors|help\.sap|github', re.I)
ALLOW = {'HR01': r'replicat|Employee Central', 'HR07': r'.', 'HR12': r'replicat', 'HR05': r'allowance|base pay|gross', 'HR08': r'retro'}
def strs(o, path=''):
    if isinstance(o, str): yield path, o
    elif isinstance(o, dict):
        for k, v in o.items(): yield from strs(v, path + '.' + k)
    elif isinstance(o, list):
        for i, v in enumerate(o): yield from strs(v, path + '[%d]' % i)
code = sys.argv[1]; d = json.load(open('/tmp/hrjson/%s.json' % code))
al = re.compile(ALLOW.get(code, r'^$'), re.I)
bad = {}
for p, s in strs(d):
    if p.startswith('.registry') and any(x in p for x in ('.name','playerAction','winCondition')): continue
    for m in V.finditer(s):
        if al.search(m.group(0)): continue
        bad.setdefault(p.split('.')[2] if p.count('.') > 1 else p, []).append(s[:90]); break
for k, v in bad.items(): print(k, len(v), '|', v[0])
print('LEAK KEYS', len(bad))
