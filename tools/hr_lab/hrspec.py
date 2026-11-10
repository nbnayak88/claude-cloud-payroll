"""Stream lexicons for HR01-HR12 (HR07 is derived from the payroll pack) and the pack builder."""
import importlib, random
from hrgen import build

def Q(q, right, w, why):
    return (q, right, list(w), why)

def mkquiz(items):
    out = []
    for i, (q, right, w, why) in enumerate(items):
        pos = i % 4; opts = list(w); opts.insert(pos, right)
        out.append((q, opts, pos, why))
    return out

def finish(L):
    L = dict(L); L['quiz'] = mkquiz(L['quiz'])
    code = L['code']
    # entity-id aware text hooks
    tid = lambda n: 'TEST-%s-%03d' % (code, n)
    for it in L['issues']:
        it['clues'] = [c.replace('{1}', tid(1)).replace('{2}', tid(2)) for c in it['clues']]
        for k in ('sym', 'log', 'log2', 'log3'):
            it[k] = it[k].replace('{1}', tid(1)).replace('{2}', tid(2)).replace('{3}', tid(3))
    L['fields'] = [tuple(x.replace('{code}', code) if isinstance(x, str) else x for x in f) for f in L['fields']]
    return L

def spec_pack(st):
    m = importlib.import_module('hrspec_' + st['code'].lower())
    L = dict(m.L); L.update(code=st['code'], slug=st['slug'], name=st['name'], sys=st['sys'])
    return build(finish(L))
