"""Generator: turns a stream lexicon into a full 108-game content pack (schema identical to the payroll pack)."""
import copy, json, random, re, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent / 'playlab'))
import arcade_pack2 as AP2
from hrpack import india_arcade, HR07_REPL

def _base():
    a = india_arcade(); t = json.dumps(a, ensure_ascii=False)
    for o, n in HR07_REPL: t = t.replace(o, n)
    return json.loads(t)

_AN = {
 'RECRUITMENT': 'RECRUIT CUTE TRIM TERM MINT TUNE RUIN CITE MICE RICE NICE TIER TIRE MERIT MINER INTER UNITE TUNIC CURE CUTER METRIC MUTE RUNT TURN TUNER EMIT TIME ITEM MITRE',
 'PERFORMANCE': 'FORCE FORM FROM PRONE OPERA PEACE CORE ROPE PORE FARE FACE FARM FERN PACE CAPE CONE ONCE OCEAN CAROM PROM ROAM FORE ORCA PENCE CANOE CRANE',
 'COMPENSATION': 'CAMP COMET STOP POINT PANTS MEAT MOAN PEAT NOTE TONE OPEN PEON SCENT ASCOT COAST COAT TACO MOST MASON MINT POET SPOT POST POTS TOPS STEM ITEM SAINT STAIN PIANO NOTES',
 'COLLABORATION': 'LABOR COLOR TALON TOLL BOLT BOAT COAT COAL CLOT COIL LOAN LION LOOT ALTO TAIL TOIL BRAT CART CORAL ROBIN ORBIT ABORT TRAIL RIOT COBALT CLAN BARN BORN CARB BACON CABIN BRAIN',
}
from collections import Counter
GEN_ANAGRAM = []
for _l, _w in _AN.items():
    _L = Counter(_l); GEN_ANAGRAM.append(dict(letters=_l, words=[w for w in _w.split() if len(w) >= 3 and not (Counter(w) - _L)]))
assert all(len(x['words']) >= 10 for x in GEN_ANAGRAM)
GEN_LADDER_NOTE = None

def U(L, k): return L.get(k)

def title(w): return w.capitalize()

def build(L):
    a = _base(); p = a['pack']; code = L['code']; N = L['name']; E = L['ent']; u = L['unit']
    tid = lambda n: 'TEST-%s-%03d' % (code, n)
    # ---- vocabulary & words
    T = L['terms']
    p['words'] = [[w, d] for w, d in T]
    p['pairs'] = [[title(w), d] for w, d in T[:12]]
    p['hang'] = [[ph, d] for ph, d in L['phrases']]
    tf = []
    for i in range(12):
        w, d = T[i]; w2, d2 = T[(i + 5) % 16]
        tf.append(['%s: %s.' % (title(w), d), True, '%s means exactly that.' % title(w)])
        tf.append(['%s: %s.' % (title(w), d2), False, '%s actually means: %s.' % (title(w), d.lower())])
    p['tf'] = tf
    G = L['groups']
    odd = []
    for s in range(8):
        g = s % 4; g2 = (g + 1 + s // 4) % 4
        its = G[g][1][:3] + [G[g2][1][s % 5]]
        pos = (s * 3) % 4; its = its[:3]; its.insert(pos, G[g2][1][s % 5])
        odd.append(dict(items=its, odd=pos, why='%s belongs with %s; the other three are %s.' % (G[g2][1][s % 5], G[g2][0].lower(), G[g][0].lower())))
    p['odd'] = odd
    p['symbols4'] = [x.split()[0] for x in G[0][1][:4]]
    p['symbols6'] = [x.split()[0] for x in (G[0][1] + G[1][1])[:6]]
    p['triples'] = [dict(name=g, items=its[:3]) for g, its in G]
    wh = []
    for i in range(6):
        g = i % 4; g2 = (g + 1 + i // 4) % 4
        wh.append(dict(prompt='Hit the %s' % G[g][0].upper(), good=G[g][1][:5], bad=(G[g2][1][:3] + G[(g + 2) % 4][1][:2])[:5]))
    p['whack'] = wh
    # ---- quiz & jeopardy & sequences
    p['quiz'] = [dict(q=q, options=o, answer=a_, why=w) for q, o, a_, w in L['quiz']]
    p['jeopardy'] = [dict(cat=L['cats'][c], qs=[dict(q=x['q'], options=x['options'], answer=x['answer'], why=x['why']) for x in p['quiz'][c * 3:c * 3 + 3]]) for c in range(4)]
    S = L['steps']
    p['sequences'] = [dict(n=i + 1, title=t, steps=st) for i, (t, st) in enumerate(L['flows'])]
    # ---- process chain
    p['dominoes']['steps'] = S[:10]
    p['stepLabels'] = S[:8]
    p['pipeline']['nodes'] = L['nodes'][:8]
    p['graph']['nodes'] = [L['nodes'][0], L['nodes'][1], L['nodes'][2], S[1], S[2], S[5], S[6], S[7], S[8], 'Manual shortcut']
    p['graph']['rule'] = 'You cannot enter "%s" unless you have already visited "%s".' % (S[5], S[2])
    ct = p['critical']['tasks']
    for t, si in zip(ct, [0, 1, 2, 9, 3, 5, 6, 7]): t['name'] = S[si]
    p['factory']['jobs'] = [[S[i], j[1], j[2]] for i, j in zip([1, 9, 2, 7, 8], p['factory']['jobs'])]
    st = p['bottleneck']; st[0]['title'] = '%s throughput' % N; st[0]['stages'] = [[S[i], v[1]] for i, v in zip([0, 1, 2, 6, 7], st[0]['stages'])]
    st[1]['title'] = 'Go-live weekend'; st[1]['stages'] = [[n, v[1]] for n, v in zip(['Extract', 'Map', 'Load', 'Check', 'Sign off'], st[1]['stages'])]
    # ---- zones, parts, fixes
    Z = L['zones']; ZI = L['zitems']
    p['zones'] = dict(zones=Z, items=[dict(t=ZI[z][k], zone=z, why='%s belongs to %s.' % (ZI[z][k], Z[z])) for k in range(3) for z in range(4)])
    P_ = L['parts']
    p['sysmatch'] = [[n, d] for n, d in P_]
    p['arch'] = dict(slots=[[d, n] for n, d in P_[:6]], decoys=L['decoys'], note='Data flows along the top row; control and output follow on the bottom row.')
    p['blueprint'] = dict(title='%s blueprint' % N, nodes=[P_[0][0], '?', P_[2][0], '?', P_[4][0], '?'], gaps=[[1, P_[1][0]], [3, P_[3][0]], [5, P_[5][0]]], tray=[P_[1][0], P_[3][0], P_[5][0]] + L['decoys'][:2], hints=['%s.' % P_[1][1], '%s.' % P_[3][1], '%s.' % P_[5][1]])
    p['context'] = [[a1, b1] for a1, b1 in L['fixes']]
    p['icons'] = [[e, w] for e, (w, _) in zip(['👤', '📅', '✅', '🔔', '📊', '🔑', '🧪', '🧭'], T[:8])]
    p['icons'] = [[e, title(w)] for e, w in [(i[0], i[1]) for i in p['icons']]]
    # ---- approvals / risks / budget / resources
    Ent = title(E)
    p['approvals'] = dict(roles=[dict(name=n, rule=r) for n, r in [('Team member', 'Changes up to 5,000 %s' % u), ('Team lead', 'Changes from 5,001 to 50,000 %s' % u), ('Finance controller', 'Above 50,000 %s and every release to Finance' % u), ('Security administrator', 'Role and access requests')]],
      cases=[dict(text=t, role=r, why=w) for t, r, w in [
        ('An adjustment of 1,600 %s for %s.' % (u, tid(1)), 0, '1,600 is within the team member limit.'),
        ('A correction of 3,200 %s after a revision.' % u, 0, '3,200 is within the team member limit.'),
        ('A one-time item of 8,000 %s.' % u, 1, '8,000 is above the member limit and below 50,000.'),
        ('A correction of 45,000 %s for an earlier period.' % u, 1, '45,000 sits in the lead range.'),
        ('Release the monthly results to Finance.', 2, 'Every release goes to Finance.'),
        ('A new team member needs access to the %s.' % L['sys'], 3, 'Access requests go to security.'),
        ('A settlement of 120,000 %s.' % u, 2, 'Above 50,000 goes to Finance.'),
        ('Remove an old role from a former team member.', 3, 'Role changes belong to security.'),
        ('A correction of 20,000 %s.' % u, 1, '20,000 sits in the lead range.')]])
    risks = L['risks']
    for i, rk in enumerate(p['risks']['risks']): rk['name'] = risks[i]
    cn = ['%s check' % x for x in risks] + ['Combined review sweep']
    for i, c in enumerate(p['risks']['controls']): c['name'] = cn[i]
    for it, nm in zip(p['budget']['items'], ['Daily validation rules', 'Full rehearsal cycle', 'Training for two people', 'Dashboard KPIs', 'Audit trail view', 'Extra reviewer day', 'Data monitor', 'Team alert routing']): it['name'] = nm
    p['budget']['budget'] = 16000
    pn = ['Asha', 'Bala', 'Chitra', 'Dev', 'Esha']
    for pe, nm in zip(p['resources']['people'], pn): pe['name'] = nm
    for t, nm in zip(p['resources']['tasks'], [S[1], S[3], S[8], 'Update documentation']): t['name'] = nm
    for t, nm in zip(p['talent']['cands'], pn + ['Farah', 'Gopal', 'Hema']): t[0] = nm
    p['crisis']['hazards'] = L['risks'][:4]
    sq = p['monopoly']['squares']; an = iter(['Validation rule set', 'KPI dashboard', 'Data monitor', 'Alert routing', 'Rehearsal lab', 'Training room', 'Release automation', 'Audit trail view']); ev = iter(['Audit surprise', 'Leadership review', 'Go-live check'])
    for s in sq:
        if s['k'] == 'asset': s['name'] = next(an)
        elif s['k'] == 'event': s['name'] = next(ev)
        else: s['name'] = 'Start corner'
    # ---- issues -> errors / decisions / island / workflows / ladder5 / logs
    I = L['issues']
    errs = []
    gen_c = ['The user forgot a password', 'The calendar is wrong', 'A holiday was added', 'The report colour changed', 'The printer is offline', 'A meeting ran late']
    for k, it in enumerate(I[:4]):
        causes = [it['cause']] + gen_c[k:k + 3]; cause = 0
        sh = [2, 0, 3, 1][k]; causes = causes[-sh:] + causes[:-sh] if sh else causes; cause = causes.index(it['cause'])
        fixes = [it['fix'], 'Delete the record and start again', 'Switch the check off']; fx = [0, 2, 1, 0][k]
        fixes = fixes[-fx:] + fixes[:-fx] if fx else fixes
        errs.append(dict(symptom=it['sym'], clues=it['clues'], causes=causes, cause=cause, why=it['why'], fixes=fixes, fix=fixes.index(it['fix']), fixWhy='Fix the cause, then check again to prove it.'))
    p['errors'] = errs
    p['context'] = [[x['sym'].rstrip('.'), x['fix']] for x in I[:4]] + [[a1, b1] for a1, b1 in L['fixes'][:4]]
    dec = []
    for k in range(6):
        it = I[k % len(I)]; opts = [dict(t=it['fix'], pts=10 - (k % 3), why='Fixing the cause keeps the process trustworthy.'), dict(t='Ignore it and carry on', pts=-8, why='Unresolved problems come back larger.'), dict(t='Hide it from the team', pts=-10, why='Hiding the symptom helps no one.')]
        r = random.Random(900 + k); r.shuffle(opts)
        dec.append(dict(text='%s What do you do?' % it['sym'].rstrip('.') + '.', opts=opts))
    for k in range(2):
        dec.append(dict(text='A late request arrives after the cut-off for %s.' % N.lower(), opts=[dict(t='Handle it through the controlled exception route', pts=9, why='Exceptions keep the main cycle clean.'), dict(t='Edit the closed record by hand', pts=-9, why='Manual edits break the audit trail.'), dict(t='Refuse without explaining', pts=-4, why='People deserve a clear answer.')]))
    p['decisions'] = dec
    dd = p['island']['days']
    texts = [I[0]['sym'], 'The usual approver is on leave two days before sign-off.', 'A late change arrives after the cut-off.', I[1]['sym'], I[2]['sym'], 'Rescue is near. The team can finish with a review or skip it.']
    opts_t = [['Investigate now', 'Wait for the next scheduled check'], ['Pay for a temporary approver', 'Chase the approver by phone'], ['Handle it in a controlled exception', 'Force it into the main cycle'], ['Fix the cause and re-check', 'Ignore it and hope'], ['Hire a short-term specialist', 'Fix it in-house'], ['Run the final review', 'Skip the review']]
    for d, t, o in zip(dd, texts, opts_t):
        d['text'] = t
        for op, nm in zip(d['options'], o): op['t'] = nm
    wf = []
    for k in range(2):
        it = I[k]
        wf.append(dict(title='Handling: %s' % it['short'], start='n0', nodes=dict(
            n0=dict(text='%s What first?' % it['sym'], ch=[['Read the evidence before acting', 'n1'], ['Change a setting at random', 'bad']]),
            n1=dict(text='The evidence points to: %s. Next?' % it['cause'].lower(), ch=[[it['fix'], 'n2'], ['Escalate without checking', 'bad']]),
            n2=dict(text='The fix is in place. Next?', ch=[['Re-check and confirm the result', 'n3'], ['Close the case at once', 'bad']]),
            n3=dict(text='The result is confirmed. Finally?', ch=[['Record the root cause and share it', 'win'], ['Leave it undocumented', 'bad']]))))
    p['workflows'] = wf
    lad = []
    for k in range(2):
        it = I[k]; ch = it['chain']; wrong = [['A random outage', 'Bad luck', 'The weather'], ['A holiday', 'A colour change', 'A long meeting'], ['A new logo', 'A lost badge', 'A slow lift'], ['Someone was careless', 'The computer was slow', 'It was Monday']]
        lad.append(dict(symptom=it['sym'], rungs=[dict(q=['Why did this happen?', 'And why was that?', 'And why did that occur?', 'What is the root cause?'][r], opts=[ch[r]] + wrong[r], a=0) for r in range(4)]))
    p['ladder5'] = lad
    p['timeline'] = []
    for k in range(2):
        it = I[k]
        p['timeline'].append(dict(title=it['short'].capitalize(), eras=[
            dict(era='Past', q='%s What was missed earlier?' % it['sym'], opts=[it['cause'], 'A holiday', 'A colour', 'A meeting'], a=0, branch='Without finding the cause, the problem repeats.'),
            dict(era='Present', q='How do you repair it now?', opts=[it['fix'], 'Delete the record', 'Wait and see', 'Switch the check off'], a=0, branch='Without the repair the old state stays.'),
            dict(era='Future', q='How do you stop it recurring?', opts=[it['prevent'], 'Hide the field', 'Stop using the system', 'Do nothing'], a=0, branch='Without a check the next case also goes unnoticed.')]))
    # flowfix
    p['flowfix'] = [
      dict(title='Handling a failed check', nodes=[S[1], 'Check the result', '?', 'Review the finding', 'Fix the cause', '?', S[6]], broken=[dict(i=2, opts=['Raise a finding if the check fails', 'Release regardless', 'Delete the record'], a=0), dict(i=5, opts=['Run the check again', 'Publish at once', 'Close the period'], a=0)], tests=[['A failed check raises a finding', 2], ['The fix is proven by a second check', 5]]),
      dict(title='Releasing a result', nodes=['Prepare', '?', S[7], '?', 'Reconcile'], broken=[dict(i=1, opts=['Approve the result', 'Skip approval', 'Delete the result'], a=0), dict(i=3, opts=['Release to the receiver', 'Restart everything', 'Change the calendar'], a=0)], tests=[['Results are approved before publishing', 1], ['Release follows publishing', 3]])]
    # logs
    lg = []
    for k in range(2):
        it = I[k]; rel = ['WARN', it['log'], 1]
        lines = [['14:00:00', 'INFO', '%s started' % N, 0], ['14:00:30', 'INFO', 'Reading configuration', 0], ['14:01:02', 'WARN', it['log'], 1], ['14:01:20', 'INFO', 'Processing %s' % tid(1), 0], ['14:01:40', 'ERROR', it['log2'], 1], ['14:02:05', 'INFO', 'Processing %s' % tid(2), 0], ['14:02:30', 'INFO', 'Calendar loaded', 0], ['14:02:55', 'INFO', 'Summary: 3 processed, 1 skipped', 0], ['14:03:10', 'INFO', 'Dashboard refreshed', 0], ['14:03:40', 'INFO', 'Holiday list loaded', 0], ['14:04:05', 'WARN', it['log3'], 1], ['14:04:30', 'INFO', 'Notification queue empty', 0]]
        lg.append(lines)
    p['logs'] = lg
    # recon / config / integ / audit / spot / fraud / bugs
    F = L['fields']
    badrows = {1, 4, 6}
    p['recon'] = [dict(w=tid(k // 2 + 1), f=F[k][0], a=F[k][1], b=(F[k][2] if k in badrows else F[k][1])) for k in range(8)]
    p['config'] = [dict(k=F[k][0], v=(F[k][2] if k in (1, 3, 6) else F[k][1]), rule=F[k][3], bad=(k in (1, 3, 6)), why=('The value does not match the rule.' if k in (1, 3, 6) else 'Matches the rule.')) for k in range(8)] + [dict(k='Owner', v='Named', rule='Every item needs a named owner', bad=False, why='Matches.'), dict(k='Review date', v='(blank)', rule='A review date must be set', bad=True, why='A blank date means nobody will review it.'), dict(k='Audit trail', v='On', rule='The audit trail must be on', bad=False, why='Matches.'), dict(k='Test data flag', v='Off', rule='Learning data must be flagged as test data', bad=True, why='The flag is off, so the data could be mistaken for real data.')]
    p['integ'] = dict(rows=[[f, s_, ops, 0] for f, s_, ops in L['integ']], note='Each row lists the source value and the code the receiving system expects. Pick the code that matches.', right=[[f, s_, ops[0]] for f, s_, ops in L['integ']])
    p['audit'] = dict(reqs=['Approval of the monthly cycle', 'Release authorisation', 'Reconciliation of headcount', 'Access review for team members', 'Change log for configuration', 'Evidence of backup restore test'], docs=['Approval email 28 Nov', 'Release form', 'Headcount reconciliation sheet', 'Access review sheet', 'Configuration change log', 'Cafeteria menu', 'Holiday list', 'Team photo', 'Org chart', 'Training attendance', 'Release report', 'Meeting invite'], sol=[0, 1, 2, 3, 4, -1], missing=[5], note='Attach the best document to each requirement, or mark it missing when no document fits. Some documents are irrelevant.')
    ids = [tid(1), tid(2), tid(3), tid(4), tid(5)]
    pf = [(F[k][0], F[k][1]) for k in range(8)]
    pb = [(F[k][0], F[k][2] if k in (1, 5, 6) else F[k][1]) for k in range(8)]
    p['spot'] = dict(title='Two records for %s' % tid(1), a=[[k, v] for k, v in pf], b=[[k, v] for k, v in pb], diffs=[1, 5, 6])
    rows = [['T1', ids[0], '80,000', 'REF-001', 'Officer A', '2026-11-28', 0], ['T2', ids[1], '64,000', 'REF-002', 'Officer A', '2026-11-28', 0], ['T3', ids[2], '48,000', 'REF-099', 'Officer B', '2026-11-28', 1], ['T4', ids[3], '96,000', 'REF-004', 'Officer A', '2026-11-28', 0], ['T5', ids[0], '4,900', 'REF-001', 'Officer B', '2026-11-29', 1], ['T6', ids[0], '4,950', 'REF-001', 'Officer B', '2026-11-29', 1], ['T7', ids[4], '52,000', 'REF-099', 'Officer B', '2026-11-28', 1], ['T8', ids[1], '3,200', 'REF-002', 'Officer A', '2026-11-29', 0], ['T9', ids[2], '1,600', 'REF-003', 'Officer A', '2026-11-29', 0], ['T10', ids[3], '96,000', 'REF-004', 'Officer B', '2026-12-02', 1]]
    p['fraud'] = dict(rows=rows, hyps=[dict(t='Two %s share one reference, changes just under the 5,000 limit were split, and a %s who left on 20 Nov was processed again.' % (L['entp'], E), ok=True), dict(t='Everything is normal; the differences are rounding.', ok=False), dict(t='The only problem is that one officer works too fast.', ok=False)], note='Rules for this case: references are unique per %s; changes up to 5,000 need no extra approval; a %s is not processed after the end date (%s left on 20 Nov).' % (E, E, tid(4)))
    p['bugs'] = dict(title='Rule sheet', lines=[dict(t='Rule 1: total = base + extra + bonus', bug=False), dict(t='Rule 2: remainder = total + reductions', bug=True, fixes=['remainder = total − reductions', 'remainder = total × reductions', 'remainder = reductions'], fix=0), dict(t='Rule 3: overhead = base × 12%', bug=False), dict(t='Rule 4: part-time base = base × 160%', bug=True, fixes=['base × 60%', 'base − 60%', 'base ÷ 60%'], fix=0), dict(t='Rule 5: first-month share = base × days active ÷ days in month', bug=False), dict(t='Rule 6: pool = 50% of total base', bug=True, fixes=['5% of total base', '500% of total base', '0.5% of base'], fix=0), dict(t='Rule 7: a negative remainder raises an alert', bug=False), dict(t='Rule 8: release to Finance before approval', bug=True, fixes=['approve, then release', 'release twice', 'never release'], fix=0)], need=3)
    # ---- crossword / anagram / crypto / ladder / numeric skin / adventure / misc
    cw = [(w, d) for w, d in T if re.fullmatch(r'[A-Z]{4,12}', w)]
    p['crossword'] = AP2.make_crossword(cw[:16])
    p['anagram'] = GEN_ANAGRAM
    p['crypto'] = [re.sub(r'[^A-Z ]', '', ('%s BEFORE %s' % (S[1], S[5])).upper()), re.sub(r'[^A-Z ]', '', ('CHECK %s FIRST' % S[2]).upper()), re.sub(r'[^A-Z ]', '', ('%s THEN %s' % (S[6], S[7])).upper()), re.sub(r'[^A-Z ]', '', ('FIX THE CAUSE THEN %s' % S[4]).upper())]
    mans = json.dumps(p['mansion'], ensure_ascii=False).replace('ledgers', 'files').replace('Ledger page', 'File page').replace('Wage seal', '%s seal' % code).replace('payroll vault', '%s vault' % N.lower())
    p['mansion'] = json.loads(mans)
    p['treasure'] = [dict(name=n, clue=c) for n, c in [('Old Record Library', 'Where information is first written down.'), ('Skills Workshop', 'Where every capability gets its label.'), ('Connection Bridge', 'Where data crosses between two systems.'), ('Control Tower', 'Where alerts are watched.'), ('Release Dock', 'Where the final results leave for the next team.')]]
    p['rooms'] = [dict(name=z + ' hall', item=ZI[i][0] + ' key', text='A heavy door guards this hall. A panel asks a question.') for i, z in enumerate(Z)] + [dict(name=N + ' vault', item=ZI[0][1] + ' seal', text='One last lock remains. Answer to leave.')]
    # numeric skin (numbers are checked by the pack generator; only nouns change)
    p['calc'] = [
      dict(rule='Fictional case: team A has 80,000 %s, team B has 4,000 and team C has 8,000.' % u, q='What is the total?', a=92000, why='80,000 + 4,000 + 8,000.', tol=0.01),
      dict(rule='A baseline of 80,000 %s was revised to 83,200 and the correction covers 2 cycles.' % u, q='What is the total catch-up?', a=6400, why='(83,200 − 80,000) × 2.', tol=0.01),
      dict(rule='Fictional rule: share = total × days active ÷ days in month. Start on 16 Nov, November has 30 days, total 64,000.', q='What is the share for November?', a=32000.0, why='Days 16 to 30 are 15 days: 64,000 × 15 ÷ 30.', tol=0.01),
      dict(rule='Same rule. An end on 20 Nov, total 96,000, November has 30 days.', q='What is the share for November?', a=64000.0, why='Days 1 to 20 are 20 days: 96,000 × 20 ÷ 30.', tol=0.01),
      dict(rule='A total of 92,000 %s and reductions of 11,500.' % u, q='What is the remainder?', a=80500, why='92,000 − 11,500.', tol=0.01),
      dict(rule='Fictional overhead rate: 12% of the baseline. Baseline 80,000.', q='What is the overhead amount?', a=9600.0, why='80,000 × 12%.', tol=0.01),
      dict(rule='A 60% allocation is applied to a full-time baseline of 80,000.', q='What is the allocated baseline?', a=48000.0, why='80,000 × 60%.', tol=0.01),
      dict(rule='A pool is 5% of the total baseline. Baselines: 80,000, 64,000, 48,000, 96,000.', q='What is the pool?', a=14400.0, why='Total 288,000 × 5%.', tol=0.01),
      dict(rule='Eight teams each use 12,500 %s in a cycle.' % u, q='What is the total for the cycle?', a=100000, why='8 × 12,500.', tol=0.01),
      dict(rule='A budget of 90,000 %s is spent evenly over 6 cycles.' % u, q='What is spent per cycle?', a=15000.0, why='90,000 ÷ 6.', tol=0.01)]
    p['percent'] = [
      dict(rule='A baseline rose from 80,000 to 83,200 %s.' % u, q='By what percentage did it rise?', opts=['3%', '4%', '5%', '6%'], a=1, why='3,200 ÷ 80,000 = 4%.'),
      dict(rule='A total of 92,000 includes an extra of 8,000.', q='What share of the total is the extra (to 1 decimal)?', opts=['8.0%', '8.7%', '9.5%', '10.0%'], a=1, why='8,000 ÷ 92,000 ≈ 8.7%.'),
      dict(rule='An item rises from 4,000 to 4,500.', q='What is the percentage rise?', opts=['10%', '11.25%', '12.5%', '15%'], a=2, why='500 ÷ 4,000 = 12.5%.'),
      dict(rule='A total of 92,000 and reductions of 11,500.', q='Reductions are what percentage of the total?', opts=['10%', '12.5%', '15%', '20%'], a=1, why='11,500 ÷ 92,000 = 12.5%.'),
      dict(rule='A 60% allocation applies to a baseline of 80,000.', q='What is the allocated baseline?', opts=['46,000', '48,000', '50,000', '52,000'], a=1, why='80,000 × 0.6 = 48,000.'),
      dict(rule='The team grows from 4 to 5 people.', q='What is the percentage growth?', opts=['20%', '25%', '30%', '40%'], a=1, why='1 ÷ 4 = 25%.'),
      dict(rule='Overhead is 12% of a baseline of 80,000.', q='What is the amount?', opts=['8,400', '9,000', '9,600', '10,000'], a=2, why='80,000 × 0.12 = 9,600.'),
      dict(rule='A total falls from 92,000 to 78,200.', q='What is the percentage fall?', opts=['12%', '15%', '18%', '20%'], a=1, why='13,800 ÷ 92,000 = 15%.')]
    p['forecast'] = [dict(title='Headcount by month', series=[40, 42, 44, 46, 48], next=[50, 52, 54], rule='steady growth'), dict(title='Requests per week', series=[100, 110, 121, 133], next=[146, 161, 177], rule='about 10% growth'), dict(title='%s total (thousands)' % title(u), series=[800, 820, 840, 860], next=[880, 900, 920], rule='steady growth')]
    for i, b in enumerate(p['breakeven']): b['title'] = 'Service desk, month %d' % (i + 1)
    # ---- registry topics / challenges
    seen = {}
    for x in a['registry']:
        k = x['topic']
        if k not in seen: seen[k] = len(seen)
        x['topic'], x['challenge'] = L['topics'][seen[k]]
    # ---- logic puzzles: rename categories and items (structure and solutions unchanged)
    An, Ai, Bn, Bi, Cn, Ci = L['logic']
    mp = {'Pay item': An, 'Payroll area': Bn, 'Run type': Cn, 'Worker': title(E), 'Position': title(E)}
    for o, n in zip(['Bonus', 'Retro', 'Overtime', 'Allowance'], Ai): mp[o] = n
    for o, n in zip(['Monthly', 'Weekly', 'Fortnightly', 'Daily'], Bi): mp[o] = n
    for o, n in zip(['Simulation', 'Production', 'Off-cycle', 'Test'], Ci): mp[o] = n
    def ren(o):
        if isinstance(o, str):
            for i, (k, v) in enumerate(mp.items()): o = re.sub(r'(?<![A-Za-z])' + re.escape(k) + r'(?![A-Za-z])', '\x00%d\x00' % i, o)
            for i, (k, v) in enumerate(mp.items()): o = o.replace('\x00%d\x00' % i, v)
            return o
        if isinstance(o, list): return [ren(x) for x in o]
        if isinstance(o, dict): return {k: ren(v) for k, v in o.items()}
        return o
    p['logic1'] = ren(p['logic1']); p['logic2'] = ren(p['logic2'])
    for lg_ in ('logic1', 'logic2'):
        p[lg_]['items'][0] = [tid(i + 1) for i in range(len(p[lg_]['items'][0]))]
        p[lg_]['clues'] = [re.sub(r'TEST-HR-00(\d)', lambda m: tid(int(m.group(1))), c) for c in p[lg_]['clues']]
    p['id'] = 'hr-streams.%s-%s.v1' % (code.lower(), L['slug']); p['subject'] = '%s %s' % (code, N); p['cur'] = 'USD'
    p['ui'] = dict(where='stream', src=L['sys'], dst=L['dst'], dstPhrase=L['dstPhrase'], entity=title(E), verb=L['verb'], unit=L['unit'], unit1=L['unit1'], stage1=L['stages'][0], stage2=L['stages'][1], stage3=L['stages'][2])
    a['source'] = 'Original fictional scenarios written for the HR Streams Lab'
    return a
