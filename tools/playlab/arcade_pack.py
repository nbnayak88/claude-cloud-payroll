"""PlayLab 108 content pack: Employee Central Payroll, India learning case (fictional data).
Builds the registry (standard + ECP mapping) and validates that every puzzle in the pack is solvable."""
import json, re, itertools
from pathlib import Path

HERE = Path(__file__).parent
PACK_ID, PACK_VERSION = 'employee-central-payroll.§SLUG§.v1', '1.0.0'
SOURCE = 'https://learning.sap.com/ (official learning reference named by the PlayLab Employee Central Payroll pack; scenarios here are original and fictional)'

WORDS = [['PAYROLL', 'The complete process that turns work into pay'], ['WAGETYPE', 'Code that labels a pay or deduction amount'],
 ['SCHEMA', 'Ordered rules that process pay'], ['REPLICATION', 'Copying employee data from Employee Central to payroll'],
 ['VALIDATION', 'A rule that tests results before release'], ['SIMULATION', 'A test run before production'],
 ['CUTOVER', 'Controlled start of live replication'], ['INFOTYPE', 'Structured payroll record'], ['ALERT', 'Warning raised by a failed check'],
 ['POLICY', 'Holds validation, KPI and alert rules'], ['RETRO', 'Recalculation of earlier periods'], ['POSTING', 'Sending amounts to Finance'],
 ['PAYSLIP', 'What the worker receives'], ['OFFCYCLE', 'A payment outside the regular run'], ['KPI', 'A number the team watches'], ['BONUS', 'A one-time payment']]
HANG = [['PAYROLL AREA', 'Group of workers processed in the same period'], ['WAGE TYPE', 'Code that labels a pay or deduction amount'],
 ['COST CENTRE', 'Where the cost of pay is booked'], ['PAY PERIOD', 'The span a payroll run covers'], ['OFF CYCLE', 'A payment outside the regular run']]
PAIRS = [['Wage type', 'Labels a pay amount'], ['Infotype', 'Stores worker data'], ['Payroll area', 'Workers paid together'], ['Simulation', 'Test run before production'],
 ['Off-cycle', 'Pay outside regular run'], ['Validation', 'Checks results before release'], ['KPI', 'Number watched each run'], ['Alert', 'Warns of a failed check'],
 ['Cutover', 'Start of live replication'], ['Declustering', 'Makes results readable'], ['Key mapping', 'Links person to personnel number'], ['Retro', 'Recalculates earlier periods']]
ODD = [
 dict(items=['Basic pay', 'Allowance', 'Bonus', 'Bank account'], odd=3, why='Bank account is payment data, not a pay component.'),
 dict(items=['Infotype 0008', 'Infotype 0014', 'Infotype 0015', 'Infotype 0006'], odd=3, why='Infotype 0006 holds addresses; the others hold pay.'),
 dict(items=['Simulation', 'Production run', 'Off-cycle run', 'Job description'], odd=3, why='A job description is organisational data, not a run type.'),
 dict(items=['Validation', 'KPI', 'Alert', 'Wage type'], odd=3, why='Wage type is a payroll object; the others are Payroll Control Center objects.'),
 dict(items=['Job', 'Position', 'Organisational unit', 'Bonus'], odd=3, why='Bonus is a payment; the others are organisation objects replicated first.'),
 dict(items=['Hire', 'Rehire', 'Termination', 'Cost centre'], odd=3, why='A cost centre is not an employee event.'),
 dict(items=['Gross pay', 'Net pay', 'Deduction', 'Team'], odd=3, why='A team is a group of people, not an amount.'),
 dict(items=['Payroll area', 'Pay period', 'Payroll calendar', 'Chart type'], odd=3, why='Chart type is analytics; the others define processing periods.')]
TF = [
 ['Employee Central Payroll receives employee master data replicated from Employee Central.', True, 'Replication copies the master data into the payroll system.'],
 ['Payroll Control Center replaces the payroll schema.', False, 'It monitors and orchestrates payroll; it does not replace the schema.'],
 ['An effective-dated change to base pay can trigger retroactive accounting.', True, 'A change dated in a closed period makes the run recalculate it.'],
 ['Organisational objects should replicate before the employees that reference them.', True, 'Employees refer to jobs and positions, which must exist first.'],
 ['A pay component with no wage type mapping can lead to a missing payment.', True, 'Unmapped components have nowhere to go in the payroll result.'],
 ['Declustering makes payroll results readable for Payroll Control Center.', True, 'Rules and KPIs can only inspect results they can read.'],
 ['A simulation payroll posts amounts to Finance.', False, 'A simulation is a test; posting belongs to the production flow.'],
 ['A validation rule needs an owner and a threshold to be useful.', True, 'Without both, alerts become noise.'],
 ['An off-cycle payment is paid outside the regular run.', True, 'That is what off-cycle means.'],
 ['Learning cases should use real employee identities.', False, 'Use synthetic identities such as TEST-IN-001.'],
 ['A payroll area groups workers who are processed in the same period.', True, 'It drives which workers a run includes.'],
 ['Employee replication works without a configured connection.', False, 'The connection to Employee Central must be configured first.'],
 ['Reconciliation compares results with an independent expectation.', True, 'Writing the expectation first keeps the check honest.'],
 ['In a run, bank payment is released before the results are approved.', False, 'Approval comes before posting and payment.'],
 ['Negative net pay should raise an alert.', True, 'It almost always means deductions exceed pay.'],
 ['Absences can replicate separately from master data.', True, 'Time data has its own replication step.'],
 ['In a day-based rule, a hire on 16 Nov in a 30-day November is paid for 15 days.', True, 'Days 16 to 30 inclusive are 15 days.'],
 ['A KPI is a number the team watches each cycle.', True, 'For example the number of workers paid.'],
 ['Changing a policy after a process starts takes effect without a restart.', False, 'Restart the process so the change is reflected.'],
 ['The audit trail shows who changed what.', True, 'That is its purpose.'],
 ['One worker’s cost can never be split across cost centres.', False, 'Cost distribution allows a split such as 70/30.'],
 ['Key mapping rows link an Employee Central person to a payroll personnel number during cutover.', True, 'They tie the two systems together for existing workers.'],
 ['Code values such as marital status need mapping between the two systems.', True, 'Unmapped values cause replication errors.'],
 ['Passing a learning sign-off proves production readiness.', False, 'It proves only the learning case.']]
SYMBOLS4 = ['Basic', 'Bonus', 'Tax', 'Net']
SYMBOLS6 = ['Basic', 'Bonus', 'Tax', 'Net', 'Alert', 'Policy']
ROOMS = [dict(name='Master data vault', item='Hire-date key', text='A steel door guards the worker records. A panel asks a question.'),
 dict(name='Wage type workshop', item='Wage type badge', text='Labelled bins line the walls. One badge opens the next door.'),
 dict(name='Replication tunnel', item='Mapping chart', text='Pipes carry data between two systems. A valve needs the right answer.'),
 dict(name='Control Center tower', item='Alert whistle', text='Screens flash amber. A console waits for your answer.'),
 dict(name='Posting dock', item='Bank seal', text='Crates marked for Finance block the exit. One last lock remains.')]
ISLAND = [
 dict(text='Replication failed overnight and four workers are missing.', options=[
  dict(t='Investigate now', d=[-2, 0, -1], why='Fast, but it uses time.'), dict(t='Wait for the next scheduled run', d=[1, 0, -3], why='Saves time but the team worries.')]),
 dict(text='An approver is on leave two days before approval.', options=[
  dict(t='Pay for an agency approver', d=[0, -3, 1], why='Costs budget, keeps calm.'), dict(t='Chase the approver by phone', d=[-2, 0, -1], why='Costs time and goodwill.')]),
 dict(text='A late change arrives after the cut-off.', options=[
  dict(t='Handle in an off-cycle run', d=[-1, -2, 1], why='Safe but costs time and money.'), dict(t='Force it into the main run', d=[1, 0, -3], why='Fast but risky and stressful.')]),
 dict(text='Simulation shows negative net pay for one worker.', options=[
  dict(t='Fix the recovery and re-simulate', d=[-2, 0, 2], why='Time spent, team confident.'), dict(t='Ignore it and hope', d=[2, 0, -4], why='Saves time, costs trust.')]),
 dict(text='The bank file template fails a format check.', options=[
  dict(t='Hire a short-term specialist', d=[1, -3, 1], why='Budget spent, quick fix.'), dict(t='Fix it in-house', d=[-3, 0, 1], why='Slow but free.')]),
 dict(text='Rescue is near. The team can finish with a review or skip it.', options=[
  dict(t='Run the final review', d=[-1, 0, 2], why='A little time buys confidence.'), dict(t='Skip the review', d=[1, 1, -3], why='Looks efficient but risky.')])]
WHACK = [
 dict(prompt='Hit the PAY COMPONENTS', good=['Basic pay', 'Allowance', 'Bonus', 'Overtime', 'Commission'], bad=['Bank account', 'Cost centre', 'Job title', 'Address', 'Work schedule']),
 dict(prompt='Hit the PAYROLL CONTROL CENTER objects', good=['Validation', 'KPI', 'Alert', 'Policy', 'Team'], bad=['Wage type', 'Infotype', 'Bank file', 'Cost centre']),
 dict(prompt='Hit the REPLICATION objects', good=['Target system', 'Employee query', 'Code mapping', 'Key mapping', 'Status report'], bad=['Alert', 'KPI', 'Chart', 'Team']),
 dict(prompt='Hit the EMPLOYEE EVENTS', good=['Hire', 'Rehire', 'Termination', 'Transfer', 'Promotion'], bad=['Wage type', 'Alert', 'Policy', 'Report']),
 dict(prompt='Hit the PAYROLL RUN TYPES', good=['Simulation', 'Production run', 'Off-cycle run', 'Test run'], bad=['Hire', 'Address', 'Bonus', 'Cost centre']),
 dict(prompt='Hit the WORKER DATA records', good=['Name', 'Address', 'Bank details', 'National ID', 'Email'], bad=['Gross pay', 'Tax', 'Net pay', 'Alert'])]
DOMINOES = dict(steps=['Freeze master data', 'Run simulation', 'Review alerts', 'Fix errors', 'Re-run simulation', 'Production run', 'Approve results', 'Post to Finance', 'Release bank file', 'Prepare bank file template'],
 deps={1: [0], 2: [1], 3: [2], 4: [3], 5: [4], 6: [5], 7: [6], 8: [6, 9], 9: [0]})
APPROVALS = dict(roles=[dict(name='Payroll clerk', rule='Adjustments up to 5,000 INR'), dict(name='Payroll lead', rule='Adjustments from 5,001 to 50,000 INR'),
  dict(name='Finance controller', rule='Above 50,000 INR and every posting release'), dict(name='Security administrator', rule='Role and access requests')],
 cases=[dict(text='Expense reimbursement of 1,600 INR for TEST-IN-001.', role=0, why='1,600 is within the clerk limit.'),
  dict(text='Retro difference of 3,200 INR after a base pay revision.', role=0, why='3,200 is within the clerk limit.'),
  dict(text='One-time bonus of 8,000 INR.', role=1, why='8,000 is above the clerk limit and below 50,000.'),
  dict(text='Correction of 45,000 INR for an earlier period.', role=1, why='45,000 sits in the lead range.'),
  dict(text='Release the November posting to Finance.', role=2, why='Every posting release goes to Finance.'),
  dict(text='New clerk needs access to Payroll Control Center.', role=3, why='Access requests go to security.'),
  dict(text='Leaver settlement of 120,000 INR.', role=2, why='Above 50,000 goes to Finance.'),
  dict(text='Allowance change of 500 INR.', role=0, why='500 is within the clerk limit.'),
  dict(text='Remove an old role from a former team member.', role=3, why='Role changes belong to security.'),
  dict(text='Off-cycle correction of 20,000 INR.', role=1, why='20,000 sits in the lead range.')])
BUDGET = dict(budget=16000, items=[dict(name='Daily validation rules', cost=4000, value=9), dict(name='Full simulation cycle', cost=6000, value=12),
 dict(name='Training for two clerks', cost=3000, value=6), dict(name='Dashboard KPIs', cost=5000, value=8), dict(name='Audit trail tile', cost=2000, value=4),
 dict(name='Extra reviewer day', cost=3500, value=5), dict(name='Replication monitor', cost=4500, value=9), dict(name='Team alert routing', cost=2500, value=6)])
RESOURCES = dict(people=[dict(name='Asha', power=3), dict(name='Bala', power=2), dict(name='Chitra', power=4), dict(name='Dev', power=1), dict(name='Esha', power=3)],
 tasks=[dict(name='Run simulation', need=4, critical=True), dict(name='Fix replication errors', need=5, critical=True), dict(name='Prepare bank file', need=3, critical=True), dict(name='Update documentation', need=1, critical=False)])
RISKS = dict(budget=14, threshold=5, risks=[dict(name='Wrong bank account', severity=5), dict(name='Duplicate payment', severity=4), dict(name='Missing replication', severity=4),
 dict(name='Unauthorised change', severity=5), dict(name='Late approval', severity=3), dict(name='Wrong tax setting', severity=5)],
 controls=[dict(name='Bank record validation', cost=3, covers=[0]), dict(name='Duplicate check', cost=2, covers=[1]), dict(name='Replication monitor', cost=3, covers=[2]),
  dict(name='Role review', cost=3, covers=[3]), dict(name='Approval reminder', cost=1, covers=[4]), dict(name='Tax setting review', cost=3, covers=[5]), dict(name='Combined audit sweep', cost=5, covers=[1, 2])])
ERRORS = [
 dict(symptom='Replication of TEST-IN-002 failed with "position not found".', clues=['Employee replication started 09:00', 'Employee references POS-IN-002', 'Position POS-IN-002 created 11:30', 'Organisation replication last ran 08:00'],
  causes=['The password expired', 'The position did not exist when the employee replicated', 'The bank file is missing', 'The tax year changed'], cause=1, why='The employee ran before the position existed.',
  fixes=['Run organisation replication, then employee replication', 'Delete the employee', 'Change the payroll area'], fix=0, fixWhy='Order matters: organisation objects first.'),
 dict(symptom='The 8,000 INR bonus is missing from TEST-IN-001’s result.', clues=['Pay component BONUS replicated', 'Wage type mapping for BONUS: none', 'Basic pay and allowance present'],
  causes=['The bonus has no wage type mapping', 'The employee left', 'The cost centre is closed', 'The calendar is wrong'], cause=0, why='Without a mapping the component has nowhere to go.',
  fixes=['Map BONUS to a wage type and rerun', 'Raise the bonus amount', 'Restart the server'], fix=0, fixWhy='Map it, then re-run to prove the result.'),
 dict(symptom='Starting a process in Payroll Control Center does nothing.', clues=['Start pressed, no response', 'Role check passed', 'Process service status: inactive'],
  causes=['The user lacks a role', 'The process service is inactive', 'There are no employees', 'The currency is wrong'], cause=1, why='The service behind the start action is not active.',
  fixes=['Activate the service and retry', 'Rename the process', 'Delete the team'], fix=0, fixWhy='Activate the service, then start again.'),
 dict(symptom='TEST-IN-003 shows net pay of -1,200 INR.', clues=['Gross 48,000 INR', 'Deductions 49,200 INR', 'Recovery of 30,000 INR scheduled this period'],
  causes=['A large recovery is scheduled in one period', 'The bonus was doubled', 'The worker is a leaver', 'The bank is closed'], cause=0, why='The recovery pushes deductions above gross.',
  fixes=['Spread the recovery over several periods', 'Increase the gross', 'Switch off validations'], fix=0, fixWhy='Spreading it keeps net pay positive.')]
RECON = [dict(w='TEST-IN-001', f='Base pay', a='80,000', b='80,000'), dict(w='TEST-IN-001', f='Cost centre', a='DEMO-IN-OPS', b='DEMO-IN-OPS'),
 dict(w='TEST-IN-002', f='Hire date', a='2026-11-16', b='2026-11-15'), dict(w='TEST-IN-003', f='Work schedule', a='60%', b='100%'),
 dict(w='TEST-IN-004', f='Termination date', a='2026-11-20', b='2026-11-20'), dict(w='TEST-IN-001', f='Bank record', a='TEST-IN-BANK-001', b='TEST-IN-BANK-010'),
 dict(w='TEST-IN-002', f='Base pay', a='64,000', b='64,000'), dict(w='TEST-IN-004', f='Base pay', a='96,000', b='69,000')]
CONFIG = [dict(k='Payroll area', v='§CODE§', rule='Must be the India area code', bad=False, why='§CODE§ is the India area.'),
 dict(k='Country grouping', v='§CODE§', rule='Must match the payroll area country', bad=False, why='Matches.'),
 dict(k='Currency', v='§ALT§', rule='India case pays in INR', bad=True, why='§ALT§ does not fit an INR case.'),
 dict(k='Pay period', v='Monthly', rule='Case cycle is monthly', bad=False, why='Monthly matches.'),
 dict(k='Replication target system', v='(blank)', rule='Must name the payroll system', bad=True, why='A blank target means nothing can replicate.'),
 dict(k='Employee filter country', v='§CODE§', rule='Only India workers replicate', bad=False, why='Correct filter.'),
 dict(k='Time zone', v='Asia/Kolkata', rule='India time zone', bad=False, why='Correct.'),
 dict(k='Test worker ID', v='REAL-EMP-1234', rule='Learning cases use synthetic IDs only (TEST-IN-nnn)', bad=True, why='A real-looking identity must never enter a learning case.'),
 dict(k='Cost centre', v='DEMO-IN-OPS', rule='Case cost centre', bad=False, why='Matches.'),
 dict(k='Process start date', v='2026-11-31', rule='Must be a real calendar date', bad=True, why='November has 30 days.'),
 dict(k='Bank file format', v='TEST-IN', rule='Synthetic format for the case', bad=False, why='Correct.'),
 dict(k='Infotype filter', v='0000, 0001, 0008', rule='Must include the infotypes the case uses', bad=False, why='Covers the case infotypes.')]
ZONES = dict(zones=['Employee Central', 'Employee Central Payroll', 'Payroll Control Center', 'Finance and bank'], items=[
 dict(t='Job information', zone=0, why='Employment data is maintained in Employee Central.'), dict(t='Position', zone=0, why='Positions live in Employee Central.'),
 dict(t='Replication target system', zone=0, why='It is an Employee Central object naming the payroll system.'), dict(t='Payroll results', zone=1, why='Results are produced in the payroll system.'),
 dict(t='Wage type', zone=1, why='Wage types are payroll objects.'), dict(t='Infotype 0008', zone=1, why='Basic pay is held in the payroll system.'),
 dict(t='Validation rule', zone=2, why='Rules are part of Payroll Control Center.'), dict(t='Alert', zone=2, why='Alerts come from failed validations.'),
 dict(t='Posting to ledger', zone=3, why='Posting goes to Finance.'), dict(t='Bank file', zone=3, why='Payment files go to the bank.')])
STEP_LABELS = ['Freeze data', 'Simulate', 'Review alerts', 'Fix errors', 'Re-simulate', 'Produce', 'Approve', 'Post and pay']
GRAPH = dict(nodes=['Employee Central', 'Replication', 'Payroll area', 'Simulation', 'Validation', 'Production run', 'Approval', 'Posting', 'Bank file', 'Manual edit'],
 edges={0: [1], 1: [2], 2: [3, 9], 3: [4, 5], 4: [5], 5: [6], 6: [7], 7: [8]}, start=0, targets=[7, 8], requires={5: 4},
 rule='You cannot enter Production run unless you have already visited Validation.', solution=[1, 2, 3, 4, 5, 6, 7, 8])
OPT = dict(base=30, simGain=10, ruleGain=4, revGain=12, target=90, simCost=500, ruleCost=150, revCost=1200, maxSim=5, maxRules=8, maxRev=3)


def calc_items():
    L = []
    def add(rule, q, a, why, tol=0.01): L.append(dict(rule=rule, q=q, a=a, why=why, tol=tol))
    add('Fictional case: base 80,000, allowance 4,000, bonus 8,000 INR.', 'What is the gross pay?', 80000 + 4000 + 8000, '80,000 + 4,000 + 8,000.')
    add('Base pay was revised from 80,000 to 83,200 INR and the correction covers 2 periods.', 'What is the total retro amount?', (83200 - 80000) * 2, '(83,200 − 80,000) × 2.')
    add('Fictional rule: pay = base × days employed ÷ days in month. Hire on 16 Nov, November has 30 days, base 64,000.', 'What is the pay for November?', 64000 * 15 / 30, 'Days 16 to 30 are 15 days: 64,000 × 15 ÷ 30.')
    add('Same rule. Leaver on 20 Nov, base 96,000, November has 30 days.', 'What is the pay for November?', 96000 * 20 / 30, 'Days 1 to 20 are 20 days: 96,000 × 20 ÷ 30.')
    add('Gross pay 92,000 INR and deductions 11,500 INR.', 'What is the net pay?', 92000 - 11500, '92,000 − 11,500.')
    add('Fictional employer cost rate: 12% of base. Base 80,000.', 'What is the employer cost amount?', 80000 * 0.12, '80,000 × 12%.')
    add('A 60% schedule is applied to a full-time base of 80,000.', 'What is the scheduled base?', 80000 * 0.6, '80,000 × 60%.')
    add('Bonus pool is 5% of total base. Bases: 80,000, 64,000, 48,000, 96,000.', 'What is the pool?', (80000 + 64000 + 48000 + 96000) * 0.05, 'Total base 288,000 × 5%.')
    add('Gross 92,000 is split 70/30 across two cost centres.', 'What goes to the 30% centre?', 92000 * 0.3, '92,000 × 30%.')
    add('Gross 48,000 and deductions 49,200 INR.', 'What is the net pay? (use a minus sign if negative)', 48000 - 49200, '48,000 − 49,200 is negative, so an alert is needed.')
    return L


def percent_items():
    L = []
    def add(rule, q, opts, a, why):
        assert opts[a] is not None; L.append(dict(rule=rule, q=q, opts=opts, a=a, why=why))
    add('Base pay rose from 80,000 to 83,200 INR.', 'By what percentage did base pay rise?', ['3%', '4%', '5%', '6%'], 1, '3,200 ÷ 80,000 = 4%.'); assert round(3200 / 80000 * 100) == 4
    add('Gross 92,000 includes a bonus of 8,000.', 'What share of gross is the bonus (to 1 decimal)?', ['8.0%', '8.7%', '9.5%', '10.0%'], 1, '8,000 ÷ 92,000 ≈ 8.7%.'); assert round(8000 / 92000 * 100, 1) == 8.7
    add('An allowance rises from 4,000 to 4,500 INR.', 'What is the percentage rise?', ['10%', '11.25%', '12.5%', '15%'], 2, '500 ÷ 4,000 = 12.5%.'); assert 500 / 4000 == .125
    add('Gross 92,000 and deductions 11,500.', 'Deductions are what percentage of gross?', ['10%', '12.5%', '15%', '20%'], 1, '11,500 ÷ 92,000 = 12.5%.'); assert 11500 / 92000 == .125
    add('A 60% schedule applies to a base of 80,000.', 'What is the scheduled base?', ['46,000', '48,000', '50,000', '52,000'], 1, '80,000 × 0.6 = 48,000.')
    add('Headcount grows from 4 to 5 workers.', 'What is the percentage growth?', ['20%', '25%', '30%', '40%'], 1, '1 ÷ 4 = 25%.')
    add('Employer cost is 12% of a base of 80,000.', 'What is the amount?', ['8,400', '9,000', '9,600', '10,000'], 2, '80,000 × 0.12 = 9,600.')
    add('Gross falls from 92,000 to 78,200 INR.', 'What is the percentage fall?', ['12%', '15%', '18%', '20%'], 1, '13,800 ÷ 92,000 = 15%.'); assert 13800 / 92000 == .15
    return L


def registry():
    reg = json.loads((HERE / 'game-registry.json').read_text())['templates']
    md = (HERE / 'ecp-pack-README.md').read_text()
    rows = {}
    for m in re.finditer(r'^\| (PL108-\d{3}) \| ([^|]+) \| ([^|]+) \| ([^|]+) \| (\d+) min \| ([^|]+) \|$', md, re.M):
        obj = re.search(r'apply the scenario objective: (.+?)\.$', m.group(4).strip())
        rows[m.group(1)] = (m.group(3).strip(), (obj.group(1) if obj else '').strip())
    out = []
    for t in reg:
        topic, obj = rows[t['templateId']]
        out.append(dict(templateId=t['templateId'], family=t['family'], name=t['name'], playerAction=t['playerAction'], winCondition=t['winCondition'],
                        defaultMinutes=t['defaultMinutes'], topic=topic, challenge=obj[:1].upper() + obj[1:] + '.'))
    assert len(out) == 108 and len(rows) == 108
    return out


def validate():
    # solvable puzzles
    n = len(BUDGET['items']); opt = 0
    for m in range(1 << n):
        c = sum(BUDGET['items'][i]['cost'] for i in range(n) if m >> i & 1); v = sum(BUDGET['items'][i]['value'] for i in range(n) if m >> i & 1)
        if c <= BUDGET['budget']: opt = max(opt, v)
    assert opt > 0
    P, T = RESOURCES['people'], RESOURCES['tasks']; sol = None
    for a in itertools.product(range(len(T)), repeat=len(P)):
        if all((not t['critical']) or sum(P[i]['power'] for i in range(len(P)) if a[i] == k) >= t['need'] for k, t in enumerate(T)): sol = list(a); break
    assert sol; RESOURCES['solution'] = sol
    R = RISKS; best = None
    for m in range(1 << len(R['controls'])):
        ch = [i for i in range(len(R['controls'])) if m >> i & 1]
        if sum(R['controls'][i]['cost'] for i in ch) > R['budget']: continue
        res = sum(r['severity'] for j, r in enumerate(R['risks']) if not any(j in R['controls'][i]['covers'] for i in ch))
        if res < R['threshold']: best = ch; break
    assert best is not None; RISKS['solution'] = best
    wins = 0
    for combo in itertools.product([0, 1], repeat=len(ISLAND)):
        s = [8, 8, 8]; ok = True
        for d, o in zip(ISLAND, combo):
            dd = d['options'][o]['d']; s = [s[i] + dd[i] for i in range(3)]
            if min(s) <= 0: ok = False; break
        wins += ok
    assert 0 < wins < 2 ** len(ISLAND), wins
    o = OPT; found = any(min(100, o['base'] + o['simGain'] * a + o['ruleGain'] * b + o['revGain'] * e) >= o['target'] for a in range(o['maxSim'] + 1) for b in range(o['maxRules'] + 1) for e in range(o['maxRev'] + 1)); assert found
    for t in ODD: assert t['odd'] < len(t['items'])
    for e in ERRORS: assert e['cause'] < len(e['causes']) and e['fix'] < len(e['fixes'])
    assert sum(1 for x in CONFIG if x['bad']) == 4
    assert all(any(it['zone'] == z for it in ZONES['items']) for z in range(4))
    for w, _ in WORDS: assert re.fullmatch(r'[A-Z]+', w)
    for p, _ in HANG: assert re.fullmatch(r'[A-Z ]+', p)
    assert {r['a'] == r['b'] for r in RECON} == {True, False}
    # graph solution legal
    pos = GRAPH['start']; vis = {pos}
    for n2 in GRAPH['solution']:
        assert n2 in GRAPH['edges'][pos]; req = GRAPH['requires'].get(n2)
        assert req is None or req in vis; pos = n2; vis.add(n2)
    assert all(t in vis for t in GRAPH['targets'])
    return True


def build(quiz, sequences):
    validate()
    pack = dict(id=PACK_ID, version=PACK_VERSION, cur='INR', subject='Employee Central Payroll (India learning case)', locale='en', quiz=quiz, sequences=sequences, tf=TF, words=WORDS, hang=HANG, pairs=PAIRS, odd=ODD,
                symbols4=SYMBOLS4, symbols6=SYMBOLS6, rooms=ROOMS, island=dict(days=ISLAND), whack=WHACK, dominoes=DOMINOES, approvals=APPROVALS, budget=BUDGET, resources=RESOURCES,
                risks=RISKS, errors=ERRORS, recon=RECON, config=CONFIG, zones=ZONES, stepLabels=STEP_LABELS, graph=GRAPH, calc=calc_items(), optimize=OPT, percent=percent_items())
    import arcade_pack2
    pack.update(arcade_pack2.build_all())
    # sequences must have >=4 steps
    assert all(len(s['steps']) >= 4 for s in sequences)
    return dict(registry=registry(), pack=pack, source=SOURCE)


if __name__ == '__main__':
    d = build([], [dict(n=1, title='x', steps=list('abcd'))]); print('pack ok', len(d['registry']), len(json.dumps(d)))
