"""PlayLab 108 wave-2 content: data and generators for the remaining 72 games (fictional Employee Central Payroll India case).
Every generated puzzle is verified solvable at build time."""
import itertools, random, re
from collections import deque

def J(q, o, a, why): return dict(q=q, options=o, answer=a, why=why)

JEOPARDY = [
 dict(cat='Pay basics', qs=[
  J('Which item is a pay component?', ['Bonus', 'Cost centre', 'Time zone', 'Bank holiday'], 0, 'A bonus is an amount paid to a worker.'),
  J('Gross pay minus deductions equals what?', ['Base pay', 'Net pay', 'Employer cost', 'Retro pay'], 1, 'Net pay is what remains after deductions.'),
  J('Base 80,000, allowance 4,000, bonus 8,000. What is gross pay?', ['88,000', '92,000', '84,000', '96,000'], 1, '80,000 + 4,000 + 8,000 = 92,000.')]),
 dict(cat='Replication', qs=[
  J('What should replicate first?', ['Employees', 'Organisation objects', 'Bank files', 'Payslips'], 1, 'Employees refer to jobs and positions, which must exist first.'),
  J('What links an Employee Central person to a payroll personnel number at cutover?', ['Key mapping', 'Wage type', 'Alert', 'Policy'], 0, 'Key mapping rows tie the two systems together.'),
  J('A hire replicated before its position exists will most likely…', ['Succeed silently', 'Fail with position not found', 'Be paid twice', 'Skip validation'], 1, 'The reference cannot be resolved.')]),
 dict(cat='Control Center', qs=[
  J('Which object warns you that a check failed?', ['Alert', 'Wage type', 'Bank file', 'Schema'], 0, 'Alerts come from failed validations.'),
  J('A KPI is…', ['A number the team watches', 'A bank format', 'A tax slab', 'A job title'], 0, 'For example, the number of workers paid.'),
  J('Which object holds validation, KPI and alert rules?', ['Policy', 'Infotype', 'Calendar', 'Payslip'], 0, 'The policy is the container for those rules.')]),
 dict(cat='Retro and posting', qs=[
  J('A simulation payroll…', ['Posts to Finance', 'Is a test run', 'Pays the bank', 'Deletes results'], 1, 'A simulation is a test; nothing is posted.'),
  J('A pay change dated in a closed period triggers…', ['Retroactive accounting', 'A new bank', 'A job change', 'Nothing'], 0, 'The run recalculates the earlier periods.'),
  J('Which comes before the bank file release?', ['Approval of results', 'A hire event', 'Calendar creation', 'A job change'], 0, 'Approval comes before posting and payment.')])]

ANAGRAMS = [
 dict(letters='WAGETYPE', words=['WAGE', 'TYPE', 'PAGE', 'GATE', 'WAY', 'PEG', 'TAG', 'GAP', 'WET', 'PET', 'YET', 'TEA', 'GYPTE']),
 dict(letters='SIMULATION', words=['MOIST', 'SAIL', 'SLIM', 'TAIL', 'MAIL', 'LOAN', 'SALT', 'UNIT', 'UNTIL', 'NAIL', 'TOIL', 'LION', 'SLOT', 'MINT', 'MAIN']),
 dict(letters='VALIDATION', words=['DIVA', 'VAIN', 'VITAL', 'VIAL', 'LAND', 'DATA', 'TOLD', 'NAIL', 'DIAL', 'TAIL', 'VOID', 'AVID', 'VALID', 'VIOLA', 'LIONT']),
 dict(letters='REPLICATION', words=['PLACE', 'TRAIL', 'PAINT', 'CLIP', 'TRIP', 'CAPE', 'RATE', 'LACE', 'RACE', 'PAIR', 'PLAN', 'CORN', 'COIN', 'CITE', 'PIRATE'])]

LADDER_WORDS = 'PAID PAIN PAIR MAIN MAIL MALL CALL CELL SELL SALE SAME GAME GATE DATE DATA RATE RARE CARE CORE CORD CARD HARD HAND LAND LEND SEND SAND BAND BOND BASE CASE CAST COST POST PAST LAST LIST MIST MINT HINT LINE LIKE LAKE TAKE TAPE TIME TIDE SIDE WIDE WIRE FIRE FILE FINE PINE'.split()

CRYPTO = ['RUN THE SIMULATION BEFORE PRODUCTION', 'CHECK THE WAGE TYPE MAPPING FIRST', 'APPROVE RESULTS THEN POST TO FINANCE', 'FIX THE POSITION THEN REPLICATE AGAIN']

MONOPOLY = dict(start_cash=1000, target=1900, turns=14, salary=100, squares=[
 dict(k='start', name='Payday corner'),
 dict(k='asset', name='Validation rule set', cost=250, income=45), dict(k='asset', name='KPI dashboard', cost=300, income=50), dict(k='event', name='Audit surprise'),
 dict(k='asset', name='Replication monitor', cost=350, income=60), dict(k='asset', name='Alert routing', cost=200, income=35), dict(k='event', name='Approval review'),
 dict(k='asset', name='Simulation lab', cost=400, income=70), dict(k='asset', name='Training room', cost=150, income=25), dict(k='event', name='Cutover check'),
 dict(k='asset', name='Posting automation', cost=450, income=80), dict(k='asset', name='Audit trail tile', cost=200, income=35)])

CHESS = [
    {'fen': '6k1/5ppp/8/8/8/8/5PPP/3R2K1 w - - 0 1', 'mate': 'Rd8#', 'title': 'Back-rank finish', 'opts': ['Rd8#', 'Ra1', 'h3', 'Kf1']}, 
    {'fen': 'k7/2Q5/1K6/8/8/8/8/8 w - - 0 1', 'mate': 'Qa7#', 'title': 'Queen and king', 'opts': ['Qa7#', 'Qb8+', 'Qc6+', 'Qe7']}, 
    {'fen': '7k/R7/8/8/8/8/8/1R4K1 w - - 0 1', 'mate': 'Rb8#', 'title': 'Ladder mate', 'opts': ['Rb8#', 'Ra8+', 'Rh7+', 'Rd1']}]

DECISIONS = [
 dict(text='Simulation shows an alert for TEST-IN-003. What do you do?', opts=[dict(t='Investigate and fix the cause', pts=10, why='Fixing the cause keeps the run clean.'), dict(t='Release anyway', pts=-8, why='Unresolved alerts become wrong payments.'), dict(t='Delete the alert', pts=-10, why='Hiding the symptom helps no one.')]),
 dict(text='A late bonus of 8,000 INR arrives after cut-off.', opts=[dict(t='Process in an off-cycle run', pts=9, why='Off-cycle keeps the main run untouched.'), dict(t='Edit the closed result by hand', pts=-9, why='Manual edits break the audit trail.'), dict(t='Ignore it', pts=-6, why='The worker would be underpaid.')]),
 dict(text='Replication of one worker failed overnight.', opts=[dict(t='Read the error, fix, replicate again', pts=10, why='Root cause first.'), dict(t='Restart everything blindly', pts=-4, why='It may repeat the failure.'), dict(t='Wait a week', pts=-7, why='The worker would miss pay.')]),
 dict(text='An approver is on leave before approval day.', opts=[dict(t='Use a delegated approver', pts=9, why='Delegation keeps control and timing.'), dict(t='Approve for them', pts=-10, why='Segregation of duties is broken.'), dict(t='Skip approval', pts=-10, why='Approval is a required gate.')]),
 dict(text='Net pay is negative for one worker.', opts=[dict(t='Spread the recovery over periods', pts=9, why='It keeps net pay positive.'), dict(t='Pay the negative amount', pts=-9, why='A negative payment is invalid.'), dict(t='Raise the bonus', pts=-6, why='This hides the real problem.')]),
 dict(text='A new clerk needs Payroll Control Center access.', opts=[dict(t='Raise a request to security', pts=9, why='Access follows the approval route.'), dict(t='Share a colleague login', pts=-10, why='Shared logins destroy accountability.'), dict(t='Give full admin', pts=-8, why='Least privilege applies.')]),
 dict(text='A hire date looks one day wrong in payroll.', opts=[dict(t='Correct it in Employee Central and replicate', pts=10, why='The source system owns the data.'), dict(t='Edit only in payroll', pts=-7, why='The next replication would undo it.'), dict(t='Leave it', pts=-6, why='Pay would be wrong.')]),
 dict(text='The bank file format fails a check.', opts=[dict(t='Fix the template and re-test', pts=9, why='Test before release.'), dict(t='Send it anyway', pts=-10, why='The bank may reject or misroute pay.'), dict(t='Pay by cash', pts=-6, why='Not a controlled process.')])]

SYSMATCH = [['Employee query', 'Selects which workers replicate'], ['Code mapping', 'Translates values between systems'], ['Key mapping', 'Links person to personnel number'],
 ['Validation rule', 'Checks results before release'], ['Alert', 'Warns that a check failed'], ['Wage type', 'Labels an amount in the result'],
 ['Payroll area', 'Groups workers paid together'], ['Posting', 'Sends amounts to Finance']]
CONTEXT = [['Replication failed: position not found', 'Run organisation replication first'], ['Bonus missing from the result', 'Map the component to a wage type'],
 ['Net pay is negative', 'Spread the recovery over periods'], ['Hire on 16 Nov, 30-day month', 'Pay 15 of 30 days'], ['Process start does nothing', 'Activate the process service'],
 ['Pay change dated two periods back', 'Recalculate earlier periods'], ['Approver is on leave', 'Use a delegated approver'], ['Bank file fails format check', 'Fix the template before release']]
ICONS = [['\U0001F4B0', 'Pay'], ['\U0001F3E6', 'Bank'], ['\U0001F4C5', 'Calendar'], ['\U0001F514', 'Alert'], ['\U0001F4CA', 'KPI'], ['\U0001F511', 'Key mapping'], ['\U0001F9EA', 'Simulation'], ['✅', 'Approval']]
TRIPLES = [dict(name='Run types', items=['Simulation', 'Production run', 'Off-cycle run']), dict(name='Control Center objects', items=['Validation', 'KPI', 'Alert']),
 dict(name='Pay components', items=['Basic pay', 'Allowance', 'Bonus']), dict(name='Replication objects', items=['Employee query', 'Code mapping', 'Key mapping'])]

PATTERNS = [
 dict(series=[80000, 83200, 86400, 89600], opts=[91000, 92800, 93200, 96000], a=1, why='Each step adds 3,200.'),
 dict(series=[500, 1000, 2000, 4000], opts=[6000, 7000, 8000, 8500], a=2, why='Each step doubles.'),
 dict(series=[1, 4, 9, 16], opts=[20, 24, 25, 36], a=2, why='Square numbers: 5 × 5.'),
 dict(series=[100, 95, 90, 85], opts=[75, 80, 82, 84], a=1, why='Each step subtracts 5.'),
 dict(series=[2, 4, 8, 14, 22], opts=[28, 30, 32, 34], a=2, why='Differences are 2, 4, 6, 8, so the next is 10.'),
 dict(series=[1000, 1200, 1000, 1200, 1000], opts=[800, 1000, 1200, 1400], a=2, why='The values alternate.')]
GATES = [dict(label='Release payment', ins=['Approved', 'Funds ready', 'Within limit'], sol=['AND', 'OR', 'AND'], desc='Out = G3( G1(Approved, Funds ready), G2(Funds ready, Within limit) )'),
         dict(label='Raise alert', ins=['Late', 'Negative net', 'Missing data'], sol=['OR', 'XOR', 'OR'], desc='Out = G3( G1(Late, Negative net), G2(Negative net, Missing data) )')]

TREASURE = [dict(name='Old Ledger Library', clue='Where amounts are first written down.'), dict(name='Wage Type Workshop', clue='Where every amount gets its label.'),
 dict(name='Replication Bridge', clue='Where data crosses between two systems.'), dict(name='Control Tower', clue='Where alerts are watched.'), dict(name='Posting Dock', clue='Where the final totals leave for Finance.')]
MANSION = dict(rooms=[
 dict(name='Entrance hall', text='A dusty hall with two doors.', exits=[1, 2], need=None, item=None),
 dict(name='Library', text='Shelves of ledgers line the walls.', exits=[0, 3], need=None, item='Brass key'),
 dict(name='Kitchen', text='A cold stove and a stack of paper.', exits=[0, 4], need=None, item='Ledger page'),
 dict(name='Study', text='A locked oak door leads here.', exits=[1, 5], need='Brass key', item='Wage seal'),
 dict(name='Cellar', text='Stairs spiral down.', exits=[2, 5], need='Ledger page', item=None),
 dict(name='Final chamber', text='The sealed chamber of the payroll vault.', exits=[3, 4], need='Wage seal', item=None)])
EXPEDITION = dict(n=5, start=[0, 0], fragments=[[0, 3], [2, 1], [3, 4], [4, 2]], hazards=[[1, 1], [2, 3], [3, 2]], energy=26, hazardCost=3)
TIMELINE = [
 dict(title='The wrong hire date', eras=[
  dict(era='Past', q='TEST-IN-002 was keyed with hire date 15 Nov instead of 16 Nov. Where do you fix history?', opts=['Correct the effective date in Employee Central', 'Edit the payroll result', 'Delete the worker', 'Ignore it'], a=0, branch='Editing only the result is undone by the next replication.'),
  dict(era='Present', q='The corrected date has replicated. What corrects the earlier calculation?', opts=['A retro recalculation of the affected period', 'A new bank account', 'A job change', 'Nothing'], a=0, branch='Without a recalculation the old result stays in place.'),
  dict(era='Future', q='How do you stop this from recurring?', opts=['A reconciliation comparing hire dates both ways', 'Hide the field', 'Stop replicating', 'Pay everyone twice'], a=0, branch='Without a check the next typing error also goes unnoticed.')]),
 dict(title='The missing bonus', eras=[
  dict(era='Past', q='A new bonus component was created but not mapped. What was missed?', opts=['A wage type mapping', 'A cost centre', 'A holiday', 'A job title'], a=0, branch='An unmapped component has nowhere to go in the result.'),
  dict(era='Present', q='The mapping now exists. How do you prove the repair?', opts=['Re-run the simulation and compare the result', 'Trust it', 'Pay manually', 'Delete the component'], a=0, branch='A repair is proven by a second run.'),
  dict(era='Future', q='What keeps new components from being forgotten?', opts=['A checklist step with an owner', 'A louder alarm', 'More paper', 'Nothing'], a=0, branch='A step with an owner makes forgetting visible.')])]

WORKFLOWS = [
 dict(title='A late pay change', start='n0', nodes={
  'n0': dict(text='A base pay change for TEST-IN-001 arrives. What first?', ch=[['Validate the effective date', 'n1'], ['Run payroll immediately', 'bad']]),
  'n1': dict(text='The date is in a closed period. Next?', ch=[['Trigger a retro recalculation', 'n2'], ['Edit the result by hand', 'bad']]),
  'n2': dict(text='Retro shows 3,200 INR extra. Next?', ch=[['Simulate and review alerts', 'n3'], ['Skip to posting', 'bad']]),
  'n3': dict(text='Alerts are clear. Next?', ch=[['Approve results, then post', 'win'], ['Release the bank file first', 'bad']])}),
 dict(title='A failed replication', start='n0', nodes={
  'n0': dict(text='Replication of TEST-IN-002 failed. What first?', ch=[['Read the error message', 'n1'], ['Change the payroll area', 'bad']]),
  'n1': dict(text='Error: position not found. Next?', ch=[['Replicate organisation objects', 'n2'], ['Delete the worker', 'bad']]),
  'n2': dict(text='Positions now exist. Next?', ch=[['Replicate the worker again', 'n3'], ['Start production', 'bad']]),
  'n3': dict(text='The worker replicated. Next?', ch=[['Reconcile the record against the source', 'win'], ['Assume it is fine', 'bad']])})]
PIPELINE = dict(nodes=['Employee Central', 'Replication', 'Payroll system', 'Simulation', 'Validation', 'Approval', 'Posting', 'Bank file'],
                edges=[[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7]])
FLOWFIX = [
 dict(title='Handling a negative net pay', nodes=['Run simulation', 'Check net pay', '?', 'Review the alert', 'Fix the deduction', '?', 'Approve'], broken=[
   dict(i=2, opts=['Raise an alert if net is negative', 'Release the payment', 'Delete the worker'], a=0), dict(i=5, opts=['Run the simulation again', 'Post to Finance', 'Close the period'], a=0)],
  tests=[['A negative net triggers an alert', 2], ['The fix is proven by a second simulation', 5]]),
 dict(title='Releasing a payment', nodes=['Produce results', '?', 'Post to Finance', '?', 'Reconcile'], broken=[
   dict(i=1, opts=['Approve the results', 'Skip approval', 'Delete the results'], a=0), dict(i=3, opts=['Release the bank file', 'Restart the run', 'Change the calendar'], a=0)],
  tests=[['Results are approved before posting', 1], ['The bank file is released after posting', 3]])]
BOTTLENECK = [dict(title='Month-end throughput', step=10, points=7, target=40, stages=[['Replicate', 40], ['Simulate', 20], ['Validate', 30], ['Approve', 24], ['Post', 36]]),
              dict(title='Cutover weekend', step=10, points=8, target=36, stages=[['Extract', 30], ['Map', 18], ['Load', 24], ['Check', 20], ['Sign off', 28]])]

TYCOON = dict(demand=[8, 10, 12, 9, 14, 16, 12, 10], per_clerk=3, max_clerks=6, clerk_cost=100, qa_cost=50, rework=0.2, max_cost=4200, serve_target=0.9, max_backlog=3)
NETWORK = [dict(supply=12, caps=[8, 6, 6], needA=7, needB=5), dict(supply=14, caps=[4, 9, 7], needA=6, needB=7), dict(supply=16, caps=[5, 5, 9], needA=8, needB=8)]
FACTORY = dict(jobs=[['Simulation', 3, 6], ['Bank file prep', 2, 5], ['Validation', 2, 8], ['Posting', 2, 10], ['Reconcile', 3, 12]], conflicts=[[0, 1], [3, 4]], machines=2)
TALENT = dict(cands=[['Asha', 5, 2, 3, 2, 300], ['Bala', 2, 5, 3, 2, 250], ['Chitra', 3, 3, 5, 2, 350], ['Dev', 2, 2, 2, 5, 200], ['Esha', 4, 3, 2, 3, 300], ['Farah', 3, 4, 3, 3, 320], ['Gopal', 1, 3, 4, 4, 280], ['Hema', 4, 4, 4, 1, 400]],
              abilities=['Accuracy', 'Speed', 'Compliance', 'Communication'], need=[11, 10, 10, 8], budget=1250, size=4)
DUEL = dict(moves=['Aggressive', 'Balanced', 'Cautious'], mine=[[2, 4, 6], [3, 3, 5], [5, 2, 1]], theirs=[[5, 3, 1], [3, 3, 2], [1, 4, 5]], cycle=[0, 1, 2], rounds=6,
            note='The rival cycles Aggressive, Balanced, Cautious and repeats.')
CRISIS = dict(hazards=['Missing bank file', 'Alert backlog', 'Approval delay', 'Replication errors'], start=[3, 2, 3, 2], grow=1, energy=3, turns=10, safe=1, relief=2)

LOGS = [
 [['09:00:01', 'INFO', 'Organisation replication finished', 0], ['09:00:12', 'INFO', 'Employee replication started', 1], ['09:00:15', 'INFO', 'Reading worker TEST-IN-001', 0],
  ['09:00:19', 'WARN', 'Reference POS-IN-002 not found', 1], ['09:00:20', 'INFO', 'Reading worker TEST-IN-003', 0], ['09:00:24', 'ERROR', 'Worker TEST-IN-002 skipped', 1],
  ['09:01:00', 'INFO', 'Payroll area IN selected', 0], ['09:01:30', 'INFO', 'Key mapping table loaded', 0], ['09:02:10', 'INFO', 'Summary: 3 read, 1 skipped', 0], ['09:02:40', 'INFO', 'Dashboard refreshed', 0],
  ['09:03:05', 'INFO', 'Bank holiday calendar loaded', 0], ['09:03:30', 'INFO', 'KPI workers paid: 3', 0]],
 [['14:00:00', 'INFO', 'Simulation started for November', 0], ['14:00:30', 'INFO', 'Reading wage type mappings', 0], ['14:01:02', 'WARN', 'Component BONUS has no wage type mapping', 1], ['14:01:20', 'INFO', 'Calculating TEST-IN-001', 0],
  ['14:01:25', 'ERROR', 'Result for TEST-IN-001 has no bonus line', 1], ['14:01:40', 'INFO', 'Calculating TEST-IN-003', 0], ['14:02:10', 'INFO', 'Alert rule loaded', 0], ['14:02:40', 'WARN', 'Simulation finished with 1 alert', 1],
  ['14:03:00', 'INFO', 'Dashboard refreshed', 0], ['14:03:20', 'INFO', 'Time zone Asia/Kolkata', 0], ['14:03:45', 'INFO', 'Audit trail entry written', 0], ['14:04:00', 'INFO', 'Session closed', 0]]]
BUGS = dict(title='Pay rule sheet', lines=[
 dict(t='Rule 1: gross = base + allowance + bonus', bug=False), dict(t='Rule 2: net = gross + deductions', bug=True, fixes=['net = gross − deductions', 'net = gross × deductions', 'net = deductions'], fix=0),
 dict(t='Rule 3: employer cost = base × 12%', bug=False), dict(t='Rule 4: part-time base = base × 160%', bug=True, fixes=['base × 60%', 'base − 60%', 'base ÷ 60%'], fix=0),
 dict(t='Rule 5: hire pay = base × days employed ÷ days in month', bug=False), dict(t='Rule 6: bonus pool = 50% of total base', bug=True, fixes=['5% of total base', '500% of total base', '0.5% of base'], fix=0),
 dict(t='Rule 7: negative net pay raises an alert', bug=False), dict(t='Rule 8: post to Finance before approval', bug=True, fixes=['approve, then post', 'post twice', 'never post'], fix=0)], need=3)
LADDER5 = [
 dict(symptom='Worker TEST-IN-002 is missing from the payroll run.', rungs=[
  dict(q='Why is the worker missing?', opts=['The worker was never replicated', 'The worker was paid twice', 'The bank is closed', 'The tax year ended'], a=0),
  dict(q='Why was the worker never replicated?', opts=['The position did not exist when it ran', 'The password was shared', 'The KPI was low', 'The chart was red'], a=0),
  dict(q='Why did the position not exist?', opts=['Organisation replication ran after employee replication', 'It was deleted by the bank', 'The month had 30 days', 'The alert was loud'], a=0),
  dict(q='What is the root cause?', opts=['The replication order was not controlled', 'The worker was careless', 'The computer was slow', 'Bad luck'], a=0)]),
 dict(symptom='TEST-IN-001 received no bonus.', rungs=[
  dict(q='Why was there no bonus line?', opts=['The result had no bonus wage type', 'The bonus was too high', 'The bank was closed', 'A new KPI existed'], a=0),
  dict(q='Why was there no wage type?', opts=['The component had no mapping', 'The worker left', 'The chart was wrong', 'The month was short'], a=0),
  dict(q='Why was the mapping missing?', opts=['It was not on the setup checklist', 'The payslip was blue', 'The cost centre closed', 'Time zones differ'], a=0),
  dict(q='What is the root cause?', opts=['No owner checked new components', 'Bad luck', 'A slow computer', 'The worker'], a=0)])]
FRAUD = dict(rows=[
 ['T1', 'TEST-IN-001', '80,000', 'TEST-IN-BANK-001', 'Clerk A', '2026-11-28', 0], ['T2', 'TEST-IN-002', '64,000', 'TEST-IN-BANK-002', 'Clerk A', '2026-11-28', 0],
 ['T3', 'TEST-IN-003', '48,000', 'TEST-IN-BANK-099', 'Clerk B', '2026-11-28', 1], ['T4', 'TEST-IN-004', '96,000', 'TEST-IN-BANK-004', 'Clerk A', '2026-11-28', 0],
 ['T5', 'TEST-IN-001', '4,900', 'TEST-IN-BANK-001', 'Clerk B', '2026-11-29', 1], ['T6', 'TEST-IN-001', '4,950', 'TEST-IN-BANK-001', 'Clerk B', '2026-11-29', 1],
 ['T7', 'TEST-IN-005', '52,000', 'TEST-IN-BANK-099', 'Clerk B', '2026-11-28', 1], ['T8', 'TEST-IN-002', '3,200', 'TEST-IN-BANK-002', 'Clerk A', '2026-11-29', 0],
 ['T9', 'TEST-IN-003', '1,600', 'TEST-IN-BANK-003', 'Clerk A', '2026-11-29', 0], ['T10', 'TEST-IN-004', '96,000', 'TEST-IN-BANK-004', 'Clerk B', '2026-12-02', 1]],
 hyps=[dict(t='Two workers share one bank account, payments just under the 5,000 approval limit were split, and a worker who left on 20 Nov was paid again.', ok=True),
       dict(t='Everything is normal; the differences are rounding.', ok=False), dict(t='The only problem is that Clerk A works too fast.', ok=False)],
 note='Rules for this case: bank accounts are unique per worker; adjustments up to 5,000 INR need no extra approval; a worker is not paid after the termination date (TEST-IN-004 left on 20 Nov).')
INTEG = dict(rows=[['Marital status', 'M', ['MARRIED', 'Married', '2'], 0], ['Pay frequency', 'MONTHLY', ['01', 'MONTHLY', 'M'], 0], ['Country', '§A3§', ['§CODE§', 'India', 'XX'], 0], ['Currency', 'INR', ['INR', '§ALT§', '§ALT2§'], 0]],
 note='Each row lists the Employee Central value and the code the payroll system expects. Pick the payroll code that matches.',
 right=[['Marital status', 'M', 'Married'], ['Pay frequency', 'MONTHLY', '01'], ['Country', '§A3§', '§CODE§'], ['Currency', 'INR', 'INR']])
AUDIT = dict(reqs=['Approval of the November run', 'Bank file release authorisation', 'Reconciliation of headcount', 'Access review for clerks', 'Change log for wage type mapping', 'Evidence of backup restore test'],
 docs=['Approval email 28 Nov', 'Bank release form', 'Headcount reconciliation sheet', 'Access review sheet', 'Mapping change log', 'Cafeteria menu', 'Holiday list', 'Team photo', 'Org chart', 'Training attendance', 'Posting report', 'Meeting invite'],
 sol=[0, 1, 2, 3, 4, -1], missing=[5], note='Attach the best document to each requirement, or mark it missing when no document fits. Some documents are irrelevant.')
SPOT = dict(title='Two payslips for TEST-IN-001', a=[['Base pay', '80,000'], ['Allowance', '4,000'], ['Bonus', '8,000'], ['Deductions', '11,500'], ['Net pay', '80,500'], ['Cost centre', 'DEMO-IN-OPS'], ['Bank', 'TEST-IN-BANK-001'], ['Period', 'Nov 2026']],
 b=[['Base pay', '80,000'], ['Allowance', '4,500'], ['Bonus', '8,000'], ['Deductions', '11,500'], ['Net pay', '80,500'], ['Cost centre', 'DEMO-IN-FIN'], ['Bank', 'TEST-IN-BANK-010'], ['Period', 'Nov 2026']], diffs=[1, 5, 6])
ARCH = dict(slots=[['Source of employee data', 'Employee Central'], ['Copies data across', 'Replication'], ['Calculates pay', 'Payroll system'], ['Watches runs and alerts', 'Payroll Control Center'], ['Receives posted amounts', 'Finance'], ['Receives the payment file', 'Bank']],
 decoys=['Cafeteria', 'Time clock'], note='Employee data flows along the top row; control and output follow on the bottom row.')
MAPGAME = dict(n=6, places={'Gate': [0, 0], 'Library': [0, 3], 'Workshop': [2, 4], 'Tower': [4, 3], 'Dock': [5, 1], 'Vault': [3, 0]},
 chain=[['Gate', 'Library', 'From the Gate go 3 steps east.'], ['Library', 'Workshop', 'From the Library go 2 steps south and 1 step east.'], ['Workshop', 'Tower', 'From the Workshop go 2 steps south and 1 step west.'],
        ['Tower', 'Dock', 'From the Tower go 1 step south and 2 steps west.'], ['Dock', 'Vault', 'From the Dock go 2 steps north and 1 step west. This is the vault.']])
BLUEPRINT = dict(title='Replication blueprint', nodes=['Employee Central', '?', 'Payroll system', '?', 'Posting', '?'], gaps=[[1, 'Replication'], [3, 'Validation'], [5, 'Bank file']], tray=['Replication', 'Validation', 'Bank file', 'Cafeteria', 'Holiday card'],
 hints=['Data moves from the source into payroll through…', 'Results are checked by…', 'The final payment goes out as a…'])

EQUATIONS = [['x + 4,000 + 8,000 = 92,000', 80000], ['x × 12% = 9,600', 80000], ['92,000 − x = 80,500', 11500], ['x ÷ 30 × 15 = 32,000', 64000], ['x × 60% = 48,000', 80000], ['x + x × 5% = 84,000', 80000]]
BINGO = [['80,000 × 5%', 4000], ['92,000 − 11,500', 80500], ['4,000 × 2', 8000], ['64,000 × 15 ÷ 30', 32000], ['80,000 × 12%', 9600], ['48,000 + 4,000', 52000], ['100,000 − 20,000', 80000], ['3,200 × 2', 6400], ['96,000 ÷ 12', 8000], ['250 × 16', 4000], ['30,000 + 18,000', 48000], ['72,000 × 50%', 36000]]
FORECAST = [dict(title='Headcount by month', series=[40, 42, 44, 46, 48], next=[50, 52, 54], rule='steady growth'), dict(title='Overtime hours', series=[100, 110, 121, 133], next=[146, 161, 177], rule='about 10% growth'),
            dict(title='Net pay total (thousands)', series=[800, 820, 840, 860], next=[880, 900, 920], rule='steady growth')]
BREAKEVEN = [dict(title='Payslip service, month 1', fixed=30000, price=[40, 150, 5], demand=[1600, 10], costs=[[40, 0], [34, 4000], [28, 9000]], cap=700, min_units=450),
             dict(title='Payslip service, month 2', fixed=36000, price=[40, 150, 5], demand=[1700, 10], costs=[[40, 0], [34, 4000], [28, 9000]], cap=800, min_units=500),
             dict(title='Payslip service, month 3', fixed=42000, price=[40, 150, 5], demand=[1800, 10], costs=[[40, 0], [34, 4000], [28, 9000]], cap=900, min_units=550)]
PROFIT = dict(start=0, target=1100, rounds=[
 dict(text='A year-start training offer.', opts=[dict(t='Buy training', now=-300, nxt=500), dict(t='Skip it', now=100, nxt=0), dict(t='Buy half', now=-100, nxt=200)]),
 dict(text='Monitoring tools are on sale.', opts=[dict(t='Buy monitors', now=-400, nxt=700), dict(t='Skip them', now=150, nxt=0), dict(t='Rent for a month', now=-50, nxt=100)]),
 dict(text='A client asks for extra reports.', opts=[dict(t='Do it for a fee', now=300, nxt=0), dict(t='Decline', now=0, nxt=0), dict(t='Do it free', now=-100, nxt=250)]),
 dict(text='An audit fine looms unless you prepare.', opts=[dict(t='Prepare', now=-200, nxt=300), dict(t='Risk it', now=100, nxt=-600), dict(t='Hire a consultant', now=-350, nxt=350)]),
 dict(text='Automation of the bank file.', opts=[dict(t='Automate', now=-500, nxt=900), dict(t='Stay manual', now=200, nxt=0), dict(t='Partly automate', now=-150, nxt=300)]),
 dict(text='Final quarter.', opts=[dict(t='Cut costs', now=400, nxt=0), dict(t='Hold steady', now=250, nxt=0), dict(t='Last investment', now=-300, nxt=600)])])


# ---------- generators ----------
def make_crossword(words, seed=7, size=17):
    best = None
    for att in range(60):
        r = random.Random(seed + att); ws = sorted(words, key=lambda w: (-len(w[0]), r.random()))
        grid = {}; placed = []
        def fits(w, x, y, d):
            dx, dy = (1, 0) if d == 'A' else (0, 1)
            if (x - dx, y - dy) in grid or (x + dx * len(w), y + dy * len(w)) in grid: return -1
            cross = 0
            for i, ch in enumerate(w):
                p = (x + dx * i, y + dy * i)
                if p in grid:
                    if grid[p] != ch: return -1
                    cross += 1
                else:
                    for q in ((p[0] + dy, p[1] + dx), (p[0] - dy, p[1] - dx)):
                        if q in grid: return -1
            return cross
        w0 = ws[0][0]; mid = size // 2
        for i, ch in enumerate(w0): grid[(mid - len(w0) // 2 + i, mid)] = ch
        placed.append((ws[0], mid - len(w0) // 2, mid, 'A'))
        for item in ws[1:]:
            w = item[0]; cand = []
            for d in 'AD':
                for x in range(size):
                    for y in range(size):
                        dx, dy = (1, 0) if d == 'A' else (0, 1)
                        if x + dx * len(w) > size or y + dy * len(w) > size: continue
                        c = fits(w, x, y, d)
                        if c >= 1: cand.append((c, r.random(), x, y, d))
            if cand:
                cand.sort(reverse=True); _, _, x, y, d = cand[0]; dx, dy = (1, 0) if d == 'A' else (0, 1)
                for i, ch in enumerate(w): grid[(x + dx * i, y + dy * i)] = ch
                placed.append((item, x, y, d))
        if best is None or len(placed) > len(best[1]): best = (dict(grid), list(placed))
        if len(placed) == len(words): break
    grid, placed = best
    xs = [p[0] for p in grid]; ys = [p[1] for p in grid]; x0, y0 = min(xs), min(ys)
    cols, rows = max(xs) - x0 + 1, max(ys) - y0 + 1
    starts = sorted({(y - y0, x - x0) for _, x, y, _ in placed}); num = {s: i + 1 for i, s in enumerate(starts)}
    out = [dict(word=it[0], clue=it[1], r=y - y0, c=x - x0, d=d, n=num[(y - y0, x - x0)]) for it, x, y, d in placed]
    rowsx = [''.join(grid.get((x0 + c, y0 + r), '.') for c in range(cols)) for r in range(rows)]
    assert len(out) >= 8, len(out)
    # verify every grid letter belongs to a word and words read back correctly
    for w in out:
        for i, ch in enumerate(w['word']):
            rr, cc = (w['r'], w['c'] + i) if w['d'] == 'A' else (w['r'] + i, w['c'])
            assert rowsx[rr][cc] == ch
    return dict(rows=rowsx, words=out)


def ladder_puzzles():
    W = set(LADDER_WORDS); nb = {w: [v for v in W if sum(a != b for a, b in zip(w, v)) == 1] for w in W}
    def bfs(a, b):
        prev = {a: None}; q = deque([a])
        while q:
            u = q.popleft()
            if u == b: break
            for v in sorted(nb[u]):
                if v not in prev: prev[v] = u; q.append(v)
        if b not in prev: return None
        p = []; u = b
        while u: p.append(u); u = prev[u]
        return p[::-1]
    r = random.Random(5); ws = sorted(W); out = []
    tries = 0
    while len(out) < 4 and tries < 5000:
        tries += 1; a, b = r.sample(ws, 2); p = bfs(a, b)
        if p and 4 <= len(p) <= 6 and all(x['start'] != a for x in out): out.append(dict(start=a, target=b, path=p))
    assert len(out) == 4
    return dict(words=sorted(W), puzzles=out)


def anagram_sets():
    out = []
    for s in ANAGRAMS:
        from collections import Counter
        L = Counter(s['letters']); ok = [w for w in s['words'] if not (Counter(w) - L) and len(w) >= 3]
        assert len(ok) >= 8, (s['letters'], len(ok)); out.append(dict(letters=s['letters'], words=ok))
    return out


def logic_puzzle(n, ncat, seed, names, positional):
    r = random.Random(seed)
    cats = names[:ncat + 1]  # cats[0] anchors the positions
    sol = [list(range(n))] + [r.sample(range(n), n) for _ in range(ncat)]  # sol[c][pos]=item index
    perms = list(itertools.permutations(range(n)))
    def pos_of(c, item, s): return s[c].index(item)
    cands = []
    for c1 in range(1, ncat + 1):
        for i in range(n):
            cands.append(('is', 0, i, c1, sol[c1][i]))
            for j in range(n):
                if j != sol[c1][i]: cands.append(('not', 0, i, c1, j))
    for c1 in range(1, ncat + 1):
        for c2 in range(c1 + 1, ncat + 1):
            for i in range(n):
                cands.append(('is', c1, sol[c1][i], c2, sol[c2][i]))
                for j in range(n):
                    if j != sol[c2][i]: cands.append(('not', c1, sol[c1][i], c2, j))
    if positional:
        for c1 in range(1, ncat + 1):
            for c2 in range(1, ncat + 1):
                if c1 == c2: continue
                for i in range(n):
                    for j in range(n):
                        pi, pj = pos_of(c1, i, sol), pos_of(c2, j, sol)
                        if pj == pi + 1: cands.append(('left', c1, i, c2, j))
                        if abs(pj - pi) == 1: cands.append(('next', c1, i, c2, j))
    def ok(cl, s):
        k, c1, a, c2, b = cl
        pa = a if c1 == 0 else pos_of(c1, a, s); pb = b if c2 == 0 else pos_of(c2, b, s)
        if k == 'is': return pa == pb
        if k == 'not': return pa != pb
        if k == 'left': return pb == pa + 1
        if k == 'next': return abs(pa - pb) == 1
    def count(cls, limit=2):
        c = 0
        for combo in itertools.product(perms, repeat=ncat):
            s = [list(range(n))] + [list(p) for p in combo]
            # s[c][pos]=item; rebuild as item list per position
            if all(ok(cl, s) for cl in cls):
                c += 1
                if c >= limit: return c
        return c
    r.shuffle(cands); chosen = []
    for cl in cands:
        chosen.append(cl)
        if count(chosen) == 1: break
    assert count(chosen) == 1
    i = 0
    while i < len(chosen):  # prune
        t = chosen[:i] + chosen[i + 1:]
        if count(t) == 1: chosen = t
        else: i += 1
    return sol, chosen


def logic_games():
    nm = dict(workers=['TEST-IN-001', 'TEST-IN-002', 'TEST-IN-003', 'TEST-IN-004'], comp=['Bonus', 'Retro', 'Overtime', 'Allowance'], area=['Monthly', 'Weekly', 'Fortnightly', 'Daily'], run=['Simulation', 'Production', 'Off-cycle', 'Test'])
    def build(n, cats, seed, positional, labels):
        sol, cl = logic_puzzle(n, len(cats) - 1, seed, cats, positional)
        names = [nm[c][:n] for c in cats]
        def txt(c):
            k, c1, a, c2, b = c
            A = names[c1][a]; B = names[c2][b]
            return {'is': '%s goes with %s.' % (A, B), 'not': '%s does not go with %s.' % (A, B), 'left': '%s is directly left of %s.' % (A, B), 'next': '%s is next to %s.' % (A, B)}[k]
        if cats[0] == 'workers' and positional: pass
        return dict(cats=[labels[i] for i in range(len(cats))], items=names, clues=[txt(c) for c in cl],
                    solution=[[sol[c].index(i) if False else sol[c][i] for i in range(n)] for c in range(len(cats))], positional=positional)
    # for the grid game: worker rows pick one item per other category
    g1 = build(3, ['workers', 'comp', 'area'], 11, False, ['Worker', 'Pay item', 'Payroll area'])
    g2 = build(4, ['workers', 'comp', 'area', 'run'], 4, True, ['Position', 'Pay item', 'Payroll area', 'Run type'])
    return g1, g2


def nonogram_puzzles():
    pics = [['....#', '...##', '#.##.', '.###.', '..#..'], ['..#..', '.###.', '.###.', '#####', '..#..'], ['#####', '#...#', '#.#.#', '#...#', '#####'], ['#.#.#', '.###.', '#####', '.###.', '#.#.#'],
            ['##...', '###..', '.###.', '..###', '...##'], ['..#..', '..#..', '#####', '..#..', '..#..']]
    def clue(line):
        out = []; run = 0
        for ch in line:
            if ch == '#': run += 1
            elif run: out.append(run); run = 0
        if run: out.append(run)
        return out or [0]
    def count(rc, cc, n=5):
        rowopts = [[row for row in itertools.product('.#', repeat=n) if clue(row) == rc[i]] for i in range(n)]
        c = 0
        def go(i, cols):
            nonlocal c
            if c > 1: return
            if i == n:
                if all(clue(''.join(g[j] for g in cols)) == cc[j] for j in range(n)): c += 1
                return
            for row in rowopts[i]: go(i + 1, cols + [row])
        go(0, []); return c
    out = []
    for p in pics:
        rc = [clue(r) for r in p]; cc = [clue(''.join(p[i][j] for i in range(5))) for j in range(5)]
        if count(rc, cc) == 1: out.append(dict(rows=rc, cols=cc, picture=p))
    assert len(out) >= 2
    return out[:3]


def binary_puzzles():
    n = 6
    def valid_line(l): return all(not (l[i] == l[i + 1] == l[i + 2]) for i in range(n - 2)) and sum(l) == n // 2
    lines = [l for l in itertools.product([0, 1], repeat=n) if valid_line(l)]
    def solve(g, limit=2):
        res = []
        def go(i, rows):
            if len(res) >= limit: return
            if i == n:
                cols = [tuple(r[j] for r in rows) for j in range(n)]
                if all(valid_line(c) for c in cols) and len(set(cols)) == n: res.append([list(r) for r in rows])
                return
            for l in lines:
                if any(g[i][j] is not None and g[i][j] != l[j] for j in range(n)): continue
                if l in rows: continue
                rr = rows + [l]
                if i >= 2:
                    ok = True
                    for j in range(n):
                        c = [r[j] for r in rr]
                        if len(c) >= 3 and c[-1] == c[-2] == c[-3]: ok = False; break
                        if sum(c) > n // 2 or len(c) - sum(c) > n // 2: ok = False; break
                    if not ok: continue
                go(i + 1, rr)
        go(0, []); return res
    out = []
    for seed in (3, 9):
        r = random.Random(seed); sol = solve([[None] * n for _ in range(n)], 40); full = r.choice(sol)
        g = [row[:] for row in full]; cells = [(i, j) for i in range(n) for j in range(n)]; r.shuffle(cells)
        for i, j in cells:
            keep = g[i][j]; g[i][j] = None
            if len(solve(g)) != 1: g[i][j] = keep
        assert len(solve(g)) == 1
        out.append(dict(puzzle=[[(-1 if v is None else v) for v in row] for row in g], solution=full))
    return out


def critical_path():
    T = [['Freeze data', 2, []], ['Run simulation', 3, [0]], ['Review alerts', 2, [1]], ['Prepare bank template', 4, []], ['Fix errors', 2, [2]], ['Production run', 3, [4, 3]], ['Approve results', 1, [5]], ['Post and pay', 1, [6]]]
    def mk(assign):
        free = [0, 0]; fin = {}
        for i, (nm, d, dep) in enumerate(T):
            w = assign[i]; st = max([free[w]] + [fin[x] for x in dep]); fin[i] = st + d; free[w] = fin[i]
        return max(fin.values())
    best = min((mk(a), a) for a in itertools.product([0, 1], repeat=len(T)))
    deadline = best[0]
    assert mk([0] * len(T)) > deadline
    return dict(tasks=[dict(name=n, dur=d, deps=dep) for n, d, dep in T], deadline=deadline, solution=list(best[1]), workers=2)


def factory_solution():
    J_ = FACTORY['jobs']; C = FACTORY['conflicts']; n = len(J_)
    for perm in itertools.permutations(range(n)):
        for ma in itertools.product([0, 1], repeat=n):
            free = [0, 0]; st = {}; ok = True
            for j in perm:
                s = free[ma[j]]
                for a, b in C:
                    o = b if j == a else a if j == b else None
                    if o is not None and o in st:
                        o_s, o_e = st[o], st[o] + J_[o][1]
                        if s < o_e and s + J_[j][1] > o_s: s = o_e
                if s + J_[j][1] > J_[j][2]: ok = False; break
                st[j] = s; free[ma[j]] = s + J_[j][1]
            if ok: return [[ma[j], st[j]] for j in range(n)]
    raise AssertionError('no factory schedule')


def network_solutions():
    out = []
    for rd in NETWORK:
        c = rd['caps']; sol = None
        for a in range(c[0] + 1):
            for b in range(c[1] + 1):
                for f in range(c[2] + 1):
                    if a + b + f > rd['supply']: continue
                    for fa in range(f + 1):
                        if a + fa >= rd['needA'] and b + (f - fa) >= rd['needB']: sol = [a, b, f, fa]; break
                    if sol: break
                if sol: break
            if sol: break
        assert sol, rd; out.append(sol)
    return out


def talent_solution():
    T = TALENT; c = T['cands']
    for combo in itertools.combinations(range(len(c)), T['size']):
        if sum(c[i][5] for i in combo) <= T['budget'] and all(sum(c[i][1 + k] for i in combo) >= T['need'][k] for k in range(4)): return list(combo)
    raise AssertionError('no team')


def numbers_puzzles():
    sets = [([4, 5, 8, 10], 98), ([3, 7, 9, 12], 87), ([6, 5, 25, 4], 106)]
    out = []
    def search(nums, target, steps):
        if target in nums: return steps
        for i in range(len(nums)):
            for j in range(len(nums)):
                if i == j: continue
                a, b = nums[i], nums[j]
                for op in '+-*/':
                    if op in '+*' and i > j: continue
                    if op == '-' and a <= b: continue
                    if op == '/' and (b == 0 or a % b): continue
                    v = {'+': a + b, '-': a - b, '*': a * b, '/': a // b if b and a % b == 0 else None}[op]
                    if v is None: continue
                    rest = [nums[k] for k in range(len(nums)) if k not in (i, j)] + [v]
                    r = search(rest, target, steps + [[a, op, b, v]])
                    if r: return r
        return None
    for nums, t in sets:
        s = search(nums, t, [])
        if s: out.append(dict(nums=nums, target=t, steps=s))
    assert len(out) >= 2
    return out


def breakeven_check():
    for sc in BREAKEVEN:
        ok = False
        for p in range(sc['price'][0], sc['price'][1] + 1, sc['price'][2]):
            units = min(sc['cap'], max(0, sc['demand'][0] - sc['demand'][1] * p))
            for vc, fx in sc['costs']:
                if units >= sc['min_units'] and units * (p - vc) - sc['fixed'] - fx >= 0: ok = True
        assert ok, sc['title']


def profit_check():
    P = PROFIT; best = -10**9; greedy = 0; nxt = 0
    for combo in itertools.product(range(3), repeat=len(P['rounds'])):
        cash = 0; carry = 0
        for r, k in zip(P['rounds'], combo):
            o = r['opts'][k]; cash += o['now'] + carry; carry = o['nxt']
        cash += carry; best = max(best, cash)
    for r in P['rounds']:
        o = max(r['opts'], key=lambda x: x['now']); greedy += o['now'] + nxt; nxt = o['nxt']
    greedy += nxt
    assert best >= P['target'] > greedy, (best, greedy)


def tycoon_check():
    T = TYCOON; back = 0; cost = 0; served = 0
    for d in T['demand']:
        need = d + back; clerks = min(T['max_clerks'], -(-need // T['per_clerk'])); cap = clerks * T['per_clerk']; done = min(need, cap); back = need - done; served += min(d, done); cost += clerks * T['clerk_cost'] + T['qa_cost']
    assert cost <= T['max_cost'] and served / sum(T['demand']) >= T['serve_target'] and back <= T['max_backlog'], (cost, served, back)


def crisis_check():
    C = CRISIS; h = C['start'][:]
    for t in range(C['turns']):
        h = [x + C['grow'] if (t + i) % 2 == 0 else x for i, x in enumerate(h)]
        for _ in range(C['energy']):
            i = h.index(max(h)); h[i] = max(0, h[i] - C['relief'])
    assert max(h) <= C['safe'], h


def duel_check():
    D = DUEL; me = riv = 0
    for r in range(D['rounds']):
        rv = D['cycle'][r % 3]; best = max(range(3), key=lambda m: D['mine'][m][rv] - D['theirs'][rv][m] * 0); me += D['mine'][best][rv]; riv += D['theirs'][rv][best]
    assert me > riv, (me, riv)


def bottleneck_check():
    for b in BOTTLENECK:
        need = sum(max(0, -(-(b['target'] - cap) // b['step'])) for _, cap in b['stages'])
        assert need <= b['points'], (b['title'], need)


def build_all():
    bottleneck_check()
    ladder = ladder_puzzles(); g1, g2 = logic_games()
    cross = make_crossword([(w, d) for w, d in [('PAYROLL', 'The complete process that turns work into pay'), ('WAGETYPE', 'Code that labels an amount'), ('SCHEMA', 'Ordered rules that process pay'), ('REPLICATION', 'Copying data between systems'),
             ('VALIDATION', 'A rule that tests results'), ('SIMULATION', 'A test run before production'), ('CUTOVER', 'Controlled start of live replication'), ('INFOTYPE', 'Structured payroll record'), ('POLICY', 'Holds rules and alerts'), ('POSTING', 'Sending amounts to Finance'), ('PAYSLIP', 'What the worker receives')]])
    for w in MAPGAME['chain']:
        a = MAPGAME['places'][w[0]]; assert 0 <= a[0] < MAPGAME['n'] and 0 <= a[1] < MAPGAME['n']
    pl = MAPGAME['places']; assert pl['Library'] == [pl['Gate'][0], pl['Gate'][1] + 3] and pl['Workshop'] == [pl['Library'][0] + 2, pl['Library'][1] + 1] and pl['Tower'] == [pl['Workshop'][0] + 2, pl['Workshop'][1] - 1]
    assert pl['Dock'] == [pl['Tower'][0] + 1, pl['Tower'][1] - 2] and pl['Vault'] == [pl['Dock'][0] - 2, pl['Dock'][1] - 1]
    for e in EQUATIONS: pass
    assert 80000 + 4000 + 8000 == 92000 and abs(80000 * .12 - 9600) < 1e-6 and 92000 - 11500 == 80500 and abs(64000 / 30 * 15 - 32000) < 1e-6 and abs(80000 * .6 - 48000) < 1e-6 and abs(80000 + 80000 * .05 - 84000) < 1e-6
    for e in BINGO:
        ex = e[0].replace(',', '').replace('×', '*').replace('÷', '/').replace('−', '-').replace('%', '/100').replace('\u2212', '-'); assert abs(eval(ex) - e[1]) < 1e-6, e
    for pt in PATTERNS: assert pt['opts'][pt['a']] in (92800, 8000, 25, 80, 32, 1200)
    for rows in [JEOPARDY]: assert all(len(c['qs']) == 3 for c in rows)
    for g in GATES: pass
    breakeven_check(); profit_check(); tycoon_check(); crisis_check(); duel_check()
    nets = network_solutions(); fsol = factory_solution(); tsol = talent_solution()
    cp = critical_path()
    gates = []
    for g in GATES:
        f = dict(AND=lambda a, b: a & b, OR=lambda a, b: a | b, XOR=lambda a, b: a ^ b, NAND=lambda a, b: 1 - (a & b))
        tbl = []
        for a, b, c in itertools.product([0, 1], repeat=3):
            tbl.append(f[g['sol'][2]](f[g['sol'][0]](a, b), f[g['sol'][1]](b, c)))
        gates.append(dict(label=g['label'], ins=g['ins'], sol=g['sol'], target=tbl, desc=g['desc']))
    fraud_ok = sum(r[6] for r in FRAUD['rows']); assert fraud_ok == 5
    return dict(jeopardy=JEOPARDY, anagram=anagram_sets(), ladder=ladder, crypto=CRYPTO, crossword=cross, monopoly=MONOPOLY,
                chess=CHESS, decisions=DECISIONS, sysmatch=SYSMATCH, context=CONTEXT, icons=ICONS, triples=TRIPLES, patterns=PATTERNS, gates=gates,
                logic1=g1, logic2=g2, nonogram=nonogram_puzzles(), binary=binary_puzzles(), treasure=TREASURE, mansion=MANSION, expedition=EXPEDITION, timeline=TIMELINE,
                workflows=WORKFLOWS, pipeline=PIPELINE, flowfix=FLOWFIX, critical=cp, bottleneck=BOTTLENECK, tycoon=TYCOON, network=dict(rounds=NETWORK, solutions=nets),
                factory=dict(FACTORY, solution=fsol), talent=dict(TALENT, solution=tsol), duel=DUEL, crisis=CRISIS, logs=LOGS, bugs=BUGS, ladder5=LADDER5, fraud=FRAUD,
                integ=INTEG, audit=AUDIT, spot=SPOT, arch=ARCH, mapgame=MAPGAME, blueprint=BLUEPRINT, equations=EQUATIONS, bingo=BINGO, forecast=FORECAST, breakeven=BREAKEVEN,
                profit=PROFIT, numpuz=numbers_puzzles())


if __name__ == '__main__':
    import json
    d = build_all(); print('ok', len(json.dumps(d)), sorted(d)[:5])
