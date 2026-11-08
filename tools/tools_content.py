"""Learning-tool content and script patches for sections 55-108 (Payroll Control Center and EC-ECP replication).

TERMS feed the flashcards, Match-Up tool and quiz. Every term is taken from the rows in spec_pcc.py / spec_p2p.py,
confirm exact names in your own release.
"""

# (term, meaning, part) part: 'pcc' or 'p2p'. Meanings are unique so Match-Up has one right answer.
TERMS = [
 ('PYC_CONFIG_WORKBENCH', 'Configuration workbench for Payroll Control Center objects', 'pcc'),
 ('Manage Configuration', 'No-code application for PCC key performance indicators and validation rules or alerts', 'pcc'),
 ('CL_PYC_CHK_FP4_SAMPLE', 'Sample ABAP class for a custom PCC validation', 'pcc'),
 ('CL_PYC_EXAMPLE_KPI_EE_NUM', 'Sample ABAP class for a custom PCC KPI (employee count)', 'pcc'),
 ('HCM_LOC_CI_95', 'Business function for the PCC Action Log Viewer', 'pcc'),
 ('HCM_LOC_CI_99', 'Business function for PCC alert management and team alerts', 'pcc'),
 ('HCM_LOC_CI_92', 'Business function for PCC simplified configuration', 'pcc'),
 ('HCM_LOC_CI_97', 'Business function for PCC process management', 'pcc'),
 ('HCM_LOC_CI_79', 'Business function for payroll log storage', 'pcc'),
 ('pyc_process_manager_srv', 'OData service for PCC process management', 'pcc'),
 ('pyc_conf_srv', 'OData service for PCC simplified configuration', 'pcc'),
 ('pyc_cont_003_srv', 'OData service behind the PCC Action Log Viewer', 'pcc'),
 ('pyc_cont_pem_002_srv', 'OData service for PCC error management and the team viewer', 'pcc'),
 ('hrpy_pcc_errm_t', 'PCC entry for error-management team assignment', 'pcc'),
 ('Payroll Control Center Configuration', 'Admin Center object that selects the classic or new PCC experience for a company', 'pcc'),
 ('Payroll System Assignment', 'Permission that lets a user assign payroll systems to target users', 'pcc'),
 ('My Off-Cycles', 'PCC application for starting and monitoring off-cycle processes', 'pcc'),
 ('Manage Teams', 'PCC application for maintaining teams and members', 'pcc'),
 ('Declustering', 'Setup that stores payroll results in a form PCC can analyse', 'pcc'),
 ('Policy group', 'A set of policies assigned to a payroll process', 'pcc'),
 ('Step template', 'Reusable building block from which a PCC process is composed', 'pcc'),
 ('HRSFEC_PTP_CONFIG', 'Transaction that configures the connection from the payroll system to Employee Central', 'p2p'),
 ('HRSFEC_PTP_EE_REPL', 'Transaction that runs employee data replication (program RP_HRSFEC_PTP_EE_REPLICATION)', 'p2p'),
 ('HRSFEC_JOB_POS_REPL', 'Background job that replicates jobs, positions and organisational data', 'p2p'),
 ('HRSFEC_REPL_STATUS', 'Report showing the status of executed employee replication', 'p2p'),
 ('HRSFEC_PTP_LMOD', 'Transaction that maintains the Last Run Table', 'p2p'),
 ('HRSFEC_PN_FTSD', 'Transaction that maintains individual full-transmission-start-date entries', 'p2p'),
 ('T77SFEC_PTP_CONF', 'Table that holds the full transmission start date', 'p2p'),
 ('HRSFEC_D_EEKEYMP', 'Employee key mapping table used in cutover', 'p2p'),
 ('RP_HRSFEC_UPLOAD_EEKEY_MAPPING', 'Program that inserts rows into the employee key mapping table', 'p2p'),
 ('HRSFEC_SPOT_EEMDR_CE', 'Shortcut transaction that opens the replication enhancement spot', 'p2p'),
 ('HRSFEC_CE_MASTER_DATA_REPL', 'Enhancement spot for adjusting master data replication logic', 'p2p'),
 ('RP_HRSFEC_PTP_EE_ABSENCE_REPL', 'Program that replicates absences to infotype 2001', 'p2p'),
 ('RP_HRSFEC_PTP_EE_TIMEPAYCOMP_REPL', 'Program that replicates working time to infotype 2010', 'p2p'),
 ('SLG1', 'Transaction that displays the application log for replication errors', 'p2p'),
 ('SRT_UTIL', 'Service runtime utility used when troubleshooting replication web services', 'p2p'),
 ('Compound Employee API', 'Employee Central API that the employee replication program calls', 'p2p'),
 ('Replication target system', 'Employee Central object identifying the payroll system that receives data', 'p2p'),
 ('Data replication configuration', 'Employee Central object setting when data replication proxies are created', 'p2p'),
 ('X.509 certificate', 'Authentication option for the point-to-point connection, supported from H2 2022', 'p2p'),
 ('Infotype 0008', 'Basic pay', 'p2p'),
 ('Infotype 0014', 'Recurring payments and deductions', 'p2p'),
 ('Infotype 0015', 'Additional (one-time) payments', 'p2p'),
 ('Infotype 0006', 'Addresses', 'p2p'),
 ('Infotype 0009', 'Bank details (payment information)', 'p2p'),
 ('Infotype 0027', 'Cost distribution', 'p2p'),
 ('Infotype 0267', 'Additional off-cycle payments', 'p2p'),
]

# hand-written scenario questions: (question, options, answer index, why)
SCENARIOS = [
 ('Starting a process from the Payroll Control Center front end does nothing. What is the first thing to rule out?',
  ['The OData services are not activated', 'The employee has no bank account', 'The tax year has not started', 'The quiz was not completed'], 0,
  'Without the services enabled, nothing happens when a process is started from the front end, so check this first.'),
 ('In point-to-point replication, which side initiates employee data transfer?',
  ['The payroll system runs the replication program and calls the Compound Employee API', 'The bank pushes data to Employee Central', 'Employee Central pushes to the payroll system with no job', 'The learner uploads a CSV'], 0,
  'The replication program in the payroll system calls the Compound Employee API in Employee Central.'),
 ('Why would you run organisational replication before employee replication?',
  ['So referenced jobs, positions and organisational units already exist', 'To delete old employees', 'To skip validation', 'To change the tax year'], 0,
  'Employees reference organisational objects, and the point-to-point framework replicates those through its own job.'),
 ('After changing a PCC process (sections, policies, members or recurrence dates), what should you do?',
  ['Restart the process so the change is reflected', 'Nothing; changes apply automatically', 'Delete the payroll area', 'Re-run the quiz'], 0,
  'Restart the process after such changes so the outcome reflects them.'),
 ('A team member list in PCC shows unexpected employees. What is a sensible first step?',
  ['Check the user and payroll-administrator relationships behind the member list', 'Rename the team', 'Change the currency', 'Disable all alerts'], 0,
  'The member list is derived from user and payroll-administrator data, so check the records behind it.'),
 ('What does passing the end-to-end learning sign-off in section 108 prove?',
  ['Only the learning case; it is not a production approval or certification', 'Production readiness for India', 'Statutory compliance', 'That SAP has approved the setup'], 0,
  'The workbook is learning material with fictional data and no tenant execution.'),
]

EXTRA_CROSSWORD = [
 ['REPLICATION', 'Copying employee data from Employee Central into the payroll system (sections 82 to 108).'],
 ['SIMULATION', 'A payroll run used to find errors before production (section 78).'],
 ['VALIDATION', 'A rule that tests payroll results before release (section 61).'],
 ['INFOTYPE', 'Structured payroll record that replicated data updates.'],
 ['ALERT', 'Message raised by a failed validation, with a solution attached (section 63).'],
 ['POLICY', 'PCC object that sets validation, KPI and alert rules for a process.'],
 ['CUTOVER', 'The controlled start of replication for existing employees (section 106).'],
 ['KPI', 'A number the payroll team watches each cycle (section 62).'],
]

CSS = ('.seqitem{display:grid;grid-template-columns:34px 1fr auto;gap:10px;align-items:center;padding:12px 14px;border:1px solid var(--line);border-radius:12px;background:var(--surface)}'
       '.seqitem.correct{border-color:#2e8b57;background:#e9f6ee}.seqitem.incorrect{border-color:#c0562f;background:#fdeee8}'
       '.seqbtns{display:flex;gap:6px}.matchrow{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,2fr);gap:12px;align-items:center;padding:10px 12px;border:1px solid var(--line);border-radius:12px;background:var(--surface);margin-bottom:10px}'
       '.matchrow.correct{border-color:#2e8b57;background:#e9f6ee}.matchrow.incorrect{border-color:#c0562f;background:#fdeee8}.matchrow select{width:100%;padding:8px;border-radius:8px;border:1px solid var(--line);background:var(--surface);color:var(--text)}'
       '@media(max-width:700px){.matchrow{grid-template-columns:1fr}}')

JS = r"""
let seqIx=0,seqOrder=null,seqResult='';
function seqShuffle(a,seed){let s=seed*7919+13;return a.map((x,i)=>[(s=(s*9301+49297)%233280)/233280,i]).sort((p,q)=>p[0]-q[0]).map(x=>x[1])}
function seqFresh(seed){const q=D.sequence[seqIx];let o=seqShuffle(q.steps,seed);if(o.every((v,i)=>v===i))o.reverse();seqOrder=o;seqResult=''}
function sequence(){const q=D.sequence[seqIx];if(!seqOrder)seqFresh(seqIx+1);const items=seqOrder.map((si,pos)=>'<li class="seqitem '+(seqResult&&seqResult.checked?(si===pos?'correct':'incorrect'):'')+'"><span class="mono">'+(pos+1)+'</span><span>'+esc(q.steps[si])+'</span><span class="seqbtns"><button class="btn" data-seq-up="'+pos+'" aria-label="Move step '+(pos+1)+' up"'+(pos===0?' disabled':'')+'>↑</button><button class="btn" data-seq-down="'+pos+'" aria-label="Move step '+(pos+1)+' down"'+(pos===seqOrder.length-1?' disabled':'')+'>↓</button></span></li>').join('');return header('Learning tool 7 / 9',P.name+' sequence sprint','Put the steps of a real process into the right order, then check your order.')+'<div class="card"><div class="side-stat"><strong>Process '+(seqIx+1)+' / '+D.sequence.length+'</strong><span>Section '+q.n+'</span></div><h3 style="margin:16px 0">'+esc(q.title)+'</h3><ol style="list-style:none;padding:0;display:grid;gap:10px">'+items+'</ol><div class="notice" role="status" aria-live="polite">'+esc(seqResult&&seqResult.text||'Use the arrows to reorder, then press Check order.')+'</div><div class="pager"><button class="btn" id="seqprev">← Previous</button><button class="btn primary" id="seqcheck">Check order</button><button class="btn" id="seqshuffle">Shuffle</button><button class="btn" id="seqnext">Next →</button></div><p class="small muted">Review the explanation in <a href="#section-'+q.n+'">section '+q.n+'</a>.</p></div>'}
function bindSequence(){const swap=(a,b)=>{[seqOrder[a],seqOrder[b]]=[seqOrder[b],seqOrder[a]];seqResult='';render('sequence')};document.querySelectorAll('[data-seq-up]').forEach(b=>b.onclick=()=>swap(Number(b.dataset.seqUp),Number(b.dataset.seqUp)-1));document.querySelectorAll('[data-seq-down]').forEach(b=>b.onclick=()=>swap(Number(b.dataset.seqDown),Number(b.dataset.seqDown)+1));$('seqcheck').onclick=()=>{const ok=seqOrder.filter((si,pos)=>si===pos).length,n=seqOrder.length;seqResult={checked:true,text:ok===n?'Correct order. Explain why each step must come before the next.':ok+' of '+n+' steps are in the right place. Move the highlighted steps and check again.'};render('sequence')};$('seqshuffle').onclick=()=>{seqFresh(Date.now()%1000+2);render('sequence')};$('seqprev').onclick=()=>{seqIx=(seqIx-1+D.sequence.length)%D.sequence.length;seqOrder=null;seqResult='';render('sequence')};$('seqnext').onclick=()=>{seqIx=(seqIx+1)%D.sequence.length;seqOrder=null;seqResult='';render('sequence')}}
let mtRound=0,mtChecked=false,mtPick={};
function mtIds(){const n=D.match.length,size=6,start=(mtRound*size)%n;return Array.from({length:size},(_,i)=>(start+i)%n)}
function match(){const ids=mtIds(),meanings=ids.map(i=>D.match[i][1]),order=seqShuffle(meanings,mtRound+3);const rows=ids.map((id,k)=>{const picked=mtPick[k],good=mtChecked&&picked===String(k);return '<div class="matchrow '+(mtChecked?(good?'correct':'incorrect'):'')+'"><label for="mt'+k+'"><strong>'+esc(D.match[id][0])+'</strong></label><div><select id="mt'+k+'" data-mt="'+k+'"><option value="">Choose what it does…</option>'+order.map(o=>'<option value="'+o+'"'+(picked===String(o)?' selected':'')+'>'+esc(meanings[o])+'</option>').join('')+'</select>'+(mtChecked&&!good?'<p class="small muted">Answer: '+esc(meanings[k])+'</p>':'')+'</div></div>'}).join('');const score=ids.filter((_,k)=>mtPick[k]===String(k)).length;return header('Learning tool 8 / 9',P.name+' match-up','Pair each SAP object, transaction or term with what it does. Six pairs per round.')+'<div class="card"><div class="side-stat"><strong>Round '+(mtRound+1)+' / '+Math.ceil(D.match.length/6)+'</strong><span>'+(mtChecked?score+' of 6 correct':'Choose six answers')+'</span></div>'+rows+'<div class="pager"><button class="btn primary" id="mtcheck">Check pairs</button><button class="btn" id="mtreset">Clear</button><button class="btn" id="mtnext">Next round →</button></div></div>'}
function bindMatch(){document.querySelectorAll('[data-mt]').forEach(sel=>sel.onchange=()=>{mtPick[sel.dataset.mt]=sel.value;mtChecked=false});$('mtcheck').onclick=()=>{mtChecked=true;render('match')};$('mtreset').onclick=()=>{mtPick={};mtChecked=false;render('match')};$('mtnext').onclick=()=>{mtRound=(mtRound+1)%Math.ceil(D.match.length/6);mtPick={};mtChecked=false;render('match')}}
"""
