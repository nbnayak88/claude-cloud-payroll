/* ---------- Mystery Arena (wave 2) ---------- */
G['PL108-083']=function(c){
  var L=pick(c.pack.logs,1,c.r)[0],fl={},tries=0,need=L.filter(function(x){return x[3]}).length;
  c.draw('<p>The run failed. Read the log and flag the lines that form the failing chain of events (there are '+need+'). Attempts <span id="lt">0</span> / 4.</p><div class="pager" style="justify-content:flex-start"><input id="lf" placeholder="Filter by keyword" aria-label="filter by keyword" style="'+INP+'"><select id="lv" aria-label="filter by level" style="'+INP+'"><option value="">All levels</option><option>INFO</option><option>WARN</option><option>ERROR</option></select></div><div id="ll"></div><p></p><button class="btn primary" data-a="go">Submit the chain</button>',{go:go});
  function list(){var kw=c.$('#lf').value.toLowerCase(),lv=c.$('#lv').value;c.$('#ll').innerHTML=L.map(function(x,i){if(lv&&x[1]!==lv)return'';if(kw&&(x[0]+' '+x[1]+' '+x[2]).toLowerCase().indexOf(kw)<0)return'';
      return'<button class="btn'+(fl[i]?' primary':'')+'" data-i="'+i+'" aria-pressed="'+(!!fl[i])+'" style="display:block;width:100%;text-align:left;margin-bottom:4px;font-family:monospace;font-size:12px">'+(fl[i]?'⚑ ':'')+esc(x[0])+' ['+x[1]+'] '+esc(x[2])+'</button>'}).join('');
    c.$('#ll').querySelectorAll('[data-i]').forEach(function(b){b.onclick=function(){fl[b.dataset.i]=!fl[b.dataset.i];list()}})}
  c.$('#lf').oninput=list;c.$('#lv').onchange=list;list();
  function go(){var flagged=L.map(function(_,i){return i}).filter(function(i){return fl[i]}),right=flagged.filter(function(i){return L[i][3]}).length,extra=flagged.length-right;
    if(right===need&&extra<=1)return c.end(true,'You found the failing chain'+(extra?' with one extra line.':'.'));tries++;c.miss();c.penalty(10);c.say('You flagged '+right+' of '+need+' decisive lines and '+extra+' extra.');c.$('#lt').textContent=tries;if(tries>=4)c.end(false,'Out of attempts.')}
  c.auto=function(){L.forEach(function(x,i){fl[i]=!!x[3]});go()};
};
G['PL108-084']=function(c){
  var B=c.pack.bugs,fixed={},sel=-1,rep=-1,wrong=0,fixedN=0;
  function draw(){c.draw('<p><strong>'+esc(B.title)+'</strong> · fix '+B.need+' defects · fixed '+fixedN+' · wrong reports '+wrong+' / 5. Click a line you think is wrong.</p>'+B.lines.map(function(l,i){return'<button class="btn'+(sel===i?' primary':'')+'" data-a="ln" data-v="'+i+'" style="display:block;width:100%;text-align:left;margin-bottom:4px"'+(fixed[i]?' disabled':'')+'>'+(fixed[i]?'✅ '+esc(l.fixes[l.fix]):esc(l.t))+'</button>'}).join('')+(sel>=0&&!fixed[sel]?(rep===sel?'<p><b>Choose the correct rewrite for:</b> '+esc(B.lines[sel].t)+'</p>'+B.lines[sel].fixes.map(function(f,k){return'<button class="quizopt" data-a="fx" data-v="'+k+'">'+esc(f)+'</button>'}).join(''):'<div class="pager" style="justify-content:flex-start"><button class="btn primary" data-a="rep">Report a defect in this line</button></div>'):''),
    {ln:function(v){sel=Number(v);rep=-1;draw()},rep:function(){var l=B.lines[sel];if(!l.bug){wrong++;c.miss();c.penalty(10);c.say('This line is correct.');sel=-1;if(wrong>=5)return c.end(false,'Too many false reports.');return draw()}rep=sel;draw()},
     fx:function(v){var l=B.lines[sel];if(Number(v)===l.fix){fixed[sel]=1;fixedN++;c.good();sel=-1;rep=-1;if(fixedN>=B.need)return c.end(true,'You fixed '+fixedN+' defects.');draw()}else{wrong++;c.miss();c.penalty(8);c.say('That rewrite is not right.');if(wrong>=5)return c.end(false,'Too many wrong fixes.');draw()}}})}
  c.auto=function(){var i=B.lines.findIndex(function(l,k){return l.bug&&!fixed[k]});if(sel!==i){return clickIn(c,'[data-a=ln][data-v="'+i+'"]')}if(rep!==i)return clickIn(c,'[data-a=rep]');clickIn(c,'[data-a=fx][data-v="'+B.lines[i].fix+'"]')};draw();
};
G['PL108-087']=function(c){
  var L=c.pack.ladder5,ci=0,ri=0,chain=[],miss=0;
  function ask(){var cs=L[ci],r=cs.rungs[ri];c.draw('<p><strong>Case '+(ci+1)+' / '+L.length+'</strong> · mistakes '+miss+' / 4</p><p><b>Symptom:</b> '+esc(cs.symptom)+'</p><ol class="small">'+chain.map(function(x){return'<li>'+esc(x)+'</li>'}).join('')+'</ol><div id="ask"></div>');
    c.ask(c.$('#ask'),{q:r.q,why:'Follow the evidence one link at a time.',opts:shuffle(r.opts.map(function(t,k){return{t:t,ok:k===r.a}}),c.r)},function(ok){if(!ok){miss++;c.penalty(10);if(miss>=4)return c.end(false,'Too many broken links.');return ask()}chain.push(r.opts[r.a]);ri++;if(ri>=cs.rungs.length){ci++;ri=0;chain=[];if(ci>=L.length)return c.end(true,'Both causal chains are complete.')}ask()},{seconds:30})}
  c.auto=function(){aa(c)};ask();
};
G['PL108-088']=function(c){
  var F=c.pack.fraud,fl={},tries=0,stage=0;
  function draw(){c.draw('<p>'+esc(F.note)+' Flag every suspicious transaction. Attempts '+tries+' / 4.</p><div style="overflow:auto"><table class="table"><thead><tr><th>Flag</th><th>ID</th><th>Worker</th><th>Amount</th><th>Bank</th><th>By</th><th>Date</th></tr></thead><tbody>'+F.rows.map(function(r,i){return'<tr><td><input type="checkbox" class="fr" data-i="'+i+'" aria-label="flag '+r[0]+'"'+(fl[i]?' checked':'')+'></td>'+r.slice(0,6).map(function(x){return'<td>'+esc(x)+'</td>'}).join('')+'</tr>'}).join('')+'</tbody></table></div><button class="btn primary" data-a="go">Submit flags</button>',{go:go});
    c.body.querySelectorAll('.fr').forEach(function(b){b.onchange=function(){fl[b.dataset.i]=b.checked}})}
  function go(){var need=F.rows.filter(function(r){return r[6]}).length,flagged=F.rows.map(function(_,i){return i}).filter(function(i){return fl[i]}),right=flagged.filter(function(i){return F.rows[i][6]}).length,extra=flagged.length-right;
    if(right===need&&extra<=1){c.good();return conclude()}tries++;c.miss();c.penalty(10);c.say('You caught '+right+' of the suspicious rows and flagged '+extra+' normal row(s).');if(tries>=4)c.end(false,'Out of attempts.')}
  function conclude(){stage=1;c.draw('<p>Now state the conclusion the evidence supports.</p><div id="ask"></div>');c.ask(c.$('#ask'),{q:'Which statement is best supported by the flagged rows?',why:'The conclusion must match every flagged pattern.',opts:shuffle(F.hyps.map(function(h){return{t:h.t,ok:h.ok}}),c.r)},function(ok){if(ok)return c.end(true,'The case is supported by the evidence.');tries++;c.penalty(10);if(tries>=4)return c.end(false,'Out of attempts.');conclude()},{})}
  c.auto=function(){if(aa(c))return;F.rows.forEach(function(r,i){fl[i]=!!r[6]});go()};draw();
};
G['PL108-089']=function(c){
  var I=c.pack.integ,runs=0,right={};I.right.forEach(function(r){right[r[0]]=r[2]});
  c.draw('<p>'+esc(I.note)+' Runs '+runs+' / 6.</p><table class="table"><thead><tr><th>Field</th><th>'+esc(U('src','Employee Central'))+' value</th><th>'+esc(U('dst','Payroll'))+' code</th></tr></thead><tbody>'+I.rows.map(function(r,i){return'<tr><td>'+esc(r[0])+'</td><td>'+esc(r[1])+'</td><td><select class="im" data-f="'+esc(r[0])+'" aria-label="'+esc(U('dst','Payroll').toLowerCase())+' code for '+esc(r[0])+'" style="'+INP+'"><option value="">?</option>'+r[2].map(function(o){return'<option>'+esc(o)+'</option>'}).join('')+'</select></td></tr>'}).join('')+'</tbody></table><div id="res"></div><button class="btn primary" data-a="run">Run the integration tests</button>',{run:run});
  function run(){runs++;var pass=0,html='';c.body.querySelectorAll('.im').forEach(function(s,i){var ok=s.value===right[s.dataset.f];if(ok)pass++;html+='<li>'+(ok?'✅ ':'❌ ')+c.pack.recon[0].w.replace(/\d+$/,'')+'00'+(i+1)+' '+esc(U('verb','replicates with'))+' '+esc(s.dataset.f)+'</li>'});c.$('#res').innerHTML='<ul>'+html+'</ul>';
    if(pass===I.rows.length)return c.end(true,'The whole integration suite passes.');c.miss();c.penalty(8);c.say(pass+' of '+I.rows.length+' tests pass.');if(runs>=6)c.end(false,'Out of runs.')}
  c.auto=function(){c.body.querySelectorAll('.im').forEach(function(s){s.value=right[s.dataset.f]});run()};
};
G['PL108-090']=function(c){
  var A=c.pack.audit,tries=0;
  c.draw('<p>'+esc(A.note)+' Attempts <span id="at">0</span> / 5.</p><table class="table"><thead><tr><th>Requirement</th><th>Evidence</th></tr></thead><tbody>'+A.reqs.map(function(r,i){return'<tr><td>'+esc(r)+'</td><td><select class="ae" data-i="'+i+'" aria-label="evidence for '+esc(r)+'" style="'+INP+'"><option value="-9">Choose…</option><option value="-1">No evidence found (missing)</option>'+A.docs.map(function(d,k){return'<option value="'+k+'">'+esc(d)+'</option>'}).join('')+'</select></td></tr>'}).join('')+'</tbody></table><button class="btn primary" data-a="go">Submit the evidence pack</button>',{go:go});
  function go(){var bad=0,s=Array.from(c.body.querySelectorAll('.ae'));s.forEach(function(x,i){if(Number(x.value)!==A.sol[i])bad++});if(!bad)return c.end(true,'Every requirement has the right evidence or a correctly reported gap.');tries++;c.miss();c.penalty(10);c.say(bad+' requirement(s) are not right.');c.$('#at').textContent=tries;if(tries>=5)c.end(false,'Out of attempts.')}
  c.auto=function(){c.body.querySelectorAll('.ae').forEach(function(x,i){x.value=A.sol[i]});go()};
};

/* ---------- Visual Arena (wave 2) ---------- */
G['PL108-091']=function(c){
  var S=c.pack.spot,found={},wrong=0;
  function card(rows,side){return'<div style="flex:1;min-width:220px;border:1px solid var(--line);border-radius:12px;padding:10px"><b>'+(side?'Payslip B (click differences)':'Payslip A')+'</b>'+rows.map(function(r,i){return side?'<button class="btn'+(found[i]?' primary':'')+'" data-a="d" data-v="'+i+'" style="display:flex;justify-content:space-between;width:100%;margin-top:4px"'+(found[i]?' disabled':'')+'><span>'+esc(r[0])+'</span><span>'+esc(r[1])+'</span></button>':'<div style="display:flex;justify-content:space-between;padding:8px 14px;margin-top:4px;border:1px solid var(--line);border-radius:10px"><span>'+esc(r[0])+'</span><span>'+esc(r[1])+'</span></div>'}).join('')+'</div>'}
  function draw(){c.draw('<p><strong>'+esc(S.title)+'</strong> · differences found '+Object.keys(found).length+' / '+S.diffs.length+' · wrong clicks '+wrong+' / 4</p><div style="display:flex;gap:12px;flex-wrap:wrap">'+card(S.a,0)+card(S.b,1)+'</div>',{d:function(v){var i=Number(v);if(S.diffs.indexOf(i)>=0){found[i]=1;c.good();if(Object.keys(found).length===S.diffs.length)return c.end(true,'All differences found with '+wrong+' wrong clicks.')}else{wrong++;c.miss();c.setScore(100-wrong*20);c.say('Those two lines match.');if(wrong>=4)return c.end(false,'Too many wrong clicks.')}draw()}})}
  c.auto=function(){var i=S.diffs.find(function(d){return!found[d]});clickIn(c,'[data-a=d][data-v="'+i+'"]')};draw();
};
function placer(c,items,pieces,cols,intro){
  var put={},sel=null,wrong=0,P=shuffle(pieces,c.r);
  function draw(){c.draw('<p>'+esc(intro)+' Mistakes '+wrong+' / 5.</p><div style="display:grid;grid-template-columns:repeat('+cols+',1fr);gap:8px">'+items.map(function(it,i){if(it.fixed)return'<div style="border:1px solid var(--line);border-radius:10px;padding:10px;text-align:center;background:#eef3f3"><b>'+esc(it.fixed)+'</b></div>';
      return'<button class="btn" data-a="slot" data-v="'+i+'" style="min-height:62px;border-style:dashed">'+(put[i]?'<b>'+esc(put[i])+'</b>':'<span class="small muted">'+esc(it.hint)+'</span>')+'</button>'}).join('')+'</div><p class="small">Pieces: pick one, then pick its place. Pick a filled place to take the piece back.</p><div class="pager" style="justify-content:flex-start">'+P.filter(function(p){return Object.keys(put).every(function(k){return put[k]!==p})}).map(function(p){return'<button class="btn'+(sel===p?' primary':'')+'" data-a="pc" data-v="'+esc(p)+'">'+esc(p)+'</button>'}).join('')+'</div><button class="btn primary" data-a="chk">Check</button>',
    {pc:function(v){sel=v;draw()},slot:function(v){var i=Number(v);if(put[i]){delete put[i]}else if(sel){put[i]=sel;sel=null}draw()},chk:chk})}
  function chk(){var gaps=items.map(function(it,i){return i}).filter(function(i){return!items[i].fixed});if(gaps.some(function(i){return!put[i]})){c.say('Fill every place first.');return}
    var bad=gaps.filter(function(i){return put[i]!==items[i].ans}).length;if(!bad)return c.end(true,'The diagram is complete'+(wrong?' after '+wrong+' wrong checks.':'.'));wrong++;c.miss();c.penalty(10);c.say(bad+' piece(s) are in the wrong place.');gaps.forEach(function(i){if(put[i]!==items[i].ans)delete put[i]});if(wrong>=5)return c.end(false,'Too many wrong checks.');draw()}
  c.auto=function(){items.forEach(function(it,i){if(!it.fixed)put[i]=it.ans});chk()};draw()}
G['PL108-092']=function(c){var A=c.pack.arch;placer(c,A.slots.map(function(s){return{hint:s[0],ans:s[1]}}),A.slots.map(function(s){return s[1]}).concat(A.decoys),3,A.note)};
G['PL108-099']=function(c){var Bp=c.pack.blueprint,g=0;placer(c,Bp.nodes.map(function(n,i){return n==='?'?{hint:Bp.hints[g],ans:Bp.gaps[g++][1]}:{fixed:n}}),Bp.tray,3,Bp.title+': place the missing parts so the blueprint works end to end.')};
G['PL108-094']=function(c){
  var M=c.pack.mapgame,N=M.n,step=0,known={Gate:true},wrong=0,P=M.places;
  function draw(){var ch=M.chain[step],h='<p><strong>Clue '+(step+1)+' / '+M.chain.length+'</strong> · wrong clicks '+wrong+' / 6</p><p>'+esc(ch[2])+' Click the square on the map.</p><div style="display:grid;grid-template-columns:repeat('+N+',58px);gap:3px">';
    var names={};Object.keys(P).forEach(function(n){if(known[n])names[P[n][0]+','+P[n][1]]=n});
    for(var r=0;r<N;r++)for(var k=0;k<N;k++){var nm=names[r+','+k];h+='<button data-a="sq" data-v="'+r+','+k+'" aria-label="row '+(r+1)+' column '+(k+1)+(nm?', '+nm:'')+'" style="width:58px;height:58px;font-size:11px;border:1px solid var(--line);background:'+(nm?'#d9f0f2':'transparent')+'">'+(nm?esc(nm):'')+'</button>'}
    c.draw(h+'</div><p class="small muted">North is up. One step moves one square.</p>',{sq:function(v){var a=v.split(',').map(Number),t=P[ch[1]];if(a[0]===t[0]&&a[1]===t[1]){known[ch[1]]=true;c.good();step++;if(step>=M.chain.length)return c.end(true,'You reached the vault with '+wrong+' wrong clicks.');c.say('Found: '+ch[1]+'.');draw()}else{wrong++;c.miss();c.penalty(8);c.say('Not there. Count the steps again.');if(wrong>=6)return c.end(false,'Too many wrong clicks.');draw()}}})}
  c.auto=function(){var t=P[M.chain[step][1]];clickIn(c,'[data-a=sq][data-v="'+t[0]+','+t[1]+'"]')};draw();
};
G['PL108-095']=function(c){
  var I=c.pack.icons,sizes=[3,4,5],ri=0,lives=3,pat,put,cur,phase;
  function newRound(){var n=sizes[ri],cells=shuffle(Array.from({length:16},function(_,i){return i}),c.r).slice(0,n),syms=shuffle(I,c.r).slice(0,n);pat={};cells.forEach(function(cl,k){pat[cl]=syms[k][0]});put={};cur=null;view()}
  function grid(show,click){var h='<div style="display:grid;grid-template-columns:repeat(4,64px);gap:6px">';for(var i=0;i<16;i++){var v=show?pat[i]:put[i];h+='<button '+(click?'data-a="cell" data-v="'+i+'" ':'disabled ')+'aria-label="cell '+(i+1)+(v?' '+v:' empty')+'" style="width:64px;height:64px;font-size:26px;border:1px solid var(--line);background:'+(v?'#d9f0f2':'transparent')+'">'+(v||'')+'</button>'}return h+'</div>'}
  function view(){phase='view';c.draw('<p><strong>Round '+(ri+1)+' / '+sizes.length+'</strong> · lives '+lives+'. Study the pattern.</p>'+grid(true,false)+'<p></p><button class="btn primary" data-a="hide">Hide and rebuild</button>',{hide:build});if(!c.accessible)c.after(3000+sizes[ri]*600,function(){if(phase==='view')build()})}
  function build(){phase='in';var used=[];Object.keys(pat).forEach(function(k){used.push(pat[k])});var pal=shuffle(used,c.r);
    c.draw('<p><strong>Round '+(ri+1)+' / '+sizes.length+'</strong> · lives '+lives+'. Pick a symbol, then the square where it was.</p><div class="pager" style="justify-content:flex-start">'+pal.map(function(s){return'<button class="btn'+(cur===s?' primary':'')+'" data-a="pal" data-v="'+s+'" style="font-size:22px">'+s+'</button>'}).join('')+'</div>'+grid(false,true)+'<p></p><div class="pager" style="justify-content:flex-start"><button class="btn primary" data-a="chk">Check my pattern</button><button class="btn" data-a="peek">Show the pattern again (−10)</button></div>',
      {pal:function(v){cur=v;build()},cell:function(v){if(put[v])delete put[v];else if(cur)put[v]=cur;build()},chk:check,peek:function(){c.penalty(10);view()}})}
  function check(){var ok=Object.keys(pat).every(function(k){return put[k]===pat[k]})&&Object.keys(put).length===Object.keys(pat).length;
    if(ok){c.good();ri++;if(ri>=sizes.length)return c.end(true,'All three patterns rebuilt.');return newRound()}lives--;c.miss();c.penalty(12);c.say('Not the same pattern.');if(lives<=0)return c.end(false,'You ran out of lives.');view()}
  c.auto=function(){if(phase==='view')return clickIn(c,'[data-a=hide]');put={};Object.keys(pat).forEach(function(k){put[k]=pat[k]});check()};newRound();
};
G['PL108-096']=function(c){
  var R=4,C=5,T=[],path=[],sr=Math.floor(c.r()*R),turns=0,CH={'0,2':'┃','1,3':'━','0,1':'┗','1,2':'┏','2,3':'┓','0,3':'┛'};
  function conns(t){return t.type==='s'?[(1+t.rot)%4,(3+t.rot)%4]:[t.rot%4,(t.rot+1)%4]}
  function ch(t){var k=conns(t).slice().sort().join(',');return CH[k]||'?'}
  var vis={},r=sr,k=0,from=3;path.push([r,k,3]);vis[r+','+k]=1;
  while(k<C-1){var opts=[];if(r>0&&!vis[(r-1)+','+k]&&from!==0)opts.push(0);if(r<R-1&&!vis[(r+1)+','+k]&&from!==2)opts.push(2);opts.push(1,1);var d=opts[Math.floor(c.r()*opts.length)];
    path[path.length-1][3]=d;var nr=r+(d===2?1:d===0?-1:0),nk=k+(d===1?1:0);vis[nr+','+nk]=1;from=(d+2)%4;path.push([nr,nk,from]);r=nr;k=nk}
  path[path.length-1][3]=1;
  for(r=0;r<R;r++){T.push([]);for(k=0;k<C;k++)T[r].push({type:c.r()<.5?'s':'c',rot:Math.floor(c.r()*4),path:false})}
  path.forEach(function(p){var a=p[2],b=p[3],t=T[p[0]][p[1]];t.path=true;t.type=(a+2)%4===b?'s':'c';t.need=[a,b];
    if(conns(t).indexOf(a)>=0&&conns(t).indexOf(b)>=0)t.rot=(t.rot+1)%4;});
  function ok(t,a,b){var cs=conns(t);return cs.indexOf(a)>=0&&cs.indexOf(b)>=0}
  function solved(){return path.every(function(p){return ok(T[p[0]][p[1]],p[2],p[3])})}
  function draw(){c.draw('<p>Rotate the tiles so power flows from the left edge (⚡ row '+(sr+1)+') to the right edge. Rotations '+turns+'.</p><div style="display:grid;grid-template-columns:repeat('+C+',56px);gap:3px">'+T.map(function(row,r){return row.map(function(t,k){return'<button data-a="rot" data-v="'+r+','+k+'" aria-label="row '+(r+1)+' column '+(k+1)+'" style="width:56px;height:56px;font-size:30px;border:1px solid var(--line);background:'+(r===sr&&k===0?'#fff3d6':'transparent')+'">'+ch(t)+'</button>'}).join('')}).join('')+'</div>',{rot:function(v){var a=v.split(',').map(Number);T[a[0]][a[1]].rot=(T[a[0]][a[1]].rot+1)%4;turns++;c.setScore(100-Math.max(0,turns-20));if(solved())return c.end(true,'The circuit is complete in '+turns+' rotations.');draw()}})}
  c.auto=function(){path.forEach(function(p){var t=T[p[0]][p[1]];for(var i=0;i<4&&!ok(t,p[2],p[3]);i++)t.rot=(t.rot+1)%4});turns++;if(solved())return c.end(true,'The circuit is complete.');draw()};draw();
};

/* ---------- Numbers Arena (wave 2) ---------- */
G['PL108-101']=function(c){
  var P=pick(c.pack.numpuz,2,c.r),pi=0,cards,sel=-1,op='',moves=0,hist=[];
  function start(){cards=P[pi].nums.slice();sel=-1;op='';hist=[];draw()}
  var SYM={'+':'+','-':'−','*':'×','/':'÷'};
  function draw(){c.draw('<p><strong>Puzzle '+(pi+1)+' / '+P.length+'</strong> · target <b>'+P[pi].target+'</b> · moves '+moves+'. Combine two numbers with an operation. Numbers are in thousands of '+esc(c.pack.cur)+'.</p><div class="pager" style="justify-content:flex-start">'+cards.map(function(v,i){return'<button class="btn'+(sel===i?' primary':'')+'" data-a="cd" data-v="'+i+'" style="font-size:20px;min-width:64px">'+v+'</button>'}).join('')+'</div><p class="small">'+(sel<0?'Pick a first number.':op?'Now pick the second number.':'Pick an operation.')+'</p><div class="pager" style="justify-content:flex-start">'+['+','-','*','/'].map(function(o){return'<button class="btn'+(op===o?' primary':'')+'" data-a="op" data-v="'+o+'" style="font-size:20px">'+SYM[o]+'</button>'}).join('')+'<button class="btn" data-a="undo">Undo</button><button class="btn" data-a="reset">Reset</button></div>',
    {cd:function(v){var i=Number(v);if(sel<0){sel=i;return draw()}if(!op){sel=i;return draw()}if(i===sel){c.say('Pick a different number.');return}combine(sel,i)},op:function(v){if(sel<0){c.say('Pick a first number.');return}op=v;draw()},undo:function(){if(hist.length){cards=hist.pop();sel=-1;op=''}draw()},reset:start})}
  function combine(i,j){var a=cards[i],b=cards[j],v;if(op==='+')v=a+b;else if(op==='-'){if(a<=b){c.say('The result must be above zero.');return}v=a-b}else if(op==='*')v=a*b;else{if(b===0||a%b){c.say('Division must give a whole number.');return}v=a/b}
    hist.push(cards.slice());cards=cards.filter(function(_,k){return k!==i&&k!==j}).concat([v]);sel=-1;op='';moves++;c.good();
    if(cards.indexOf(P[pi].target)>=0){pi++;if(pi>=P.length)return c.end(true,'Both targets reached.');c.say('Target reached.');return start()}if(cards.length===1){c.say('No numbers left. Reset and try another route.');}draw()}
  c.auto=function(){var st=P[pi].steps,done=hist.length;if(done>=st.length)return;var s=st[done],a=cards.indexOf(s[0]),b=cards.findIndex(function(v,k){return v===s[2]&&k!==a});
    if(sel!==a)clickIn(c,'[data-a=cd][data-v="'+a+'"]');clickIn(c,'[data-a=op][data-v="'+s[1]+'"]');clickIn(c,'[data-a=cd][data-v="'+b+'"]')};
  start();
};
G['PL108-102']=function(c){
  var E=pick(c.pack.equations,4,c.r),i=0,wrong=0;
  function draw(){c.draw('<p><strong>Lock '+(i+1)+' / '+E.length+'</strong> · wrong tries '+wrong+' / 5</p><p style="font-size:20px">'+esc(E[i][0])+'</p><p class="small">Solve for x (an amount in '+esc(c.pack.cur)+').</p><div class="pager" style="justify-content:flex-start"><input id="eq" aria-label="value of x" style="'+INP+'"><button class="btn primary" data-a="go">Try the code</button></div>',{go:go})}
  function go(){var v=num(c.$('#eq').value);if(Math.abs(v-E[i][1])<.5){c.good();i++;if(i>=E.length)return c.end(true,'All doors unlocked with '+wrong+' wrong tries.');c.say('Unlocked.');return draw()}wrong++;c.miss();c.penalty(10);c.say('That value does not satisfy the equation.');if(wrong>=5)return c.end(false,'The final door stayed shut.');draw()}
  c.auto=function(){c.$('#eq').value=E[i][1];go()};draw();
};
G['PL108-103']=function(c){
  var seen={},uniq=[];c.pack.bingo.forEach(function(b){if(!seen[b[1]]){seen[b[1]]=1;uniq.push(b)}});var all=shuffle(uniq,c.r),board=all.slice(0,9),extra=all.slice(9),calls=shuffle(board.concat(extra),c.r),n=0,mark=[],wrong=0,lines=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  function draw(){var cl=calls[n];c.draw('<p><strong>Call '+(n+1)+' / '+calls.length+'</strong> · mistakes '+wrong+' / 4. Work out the number, then mark it on your board.</p><p style="font-size:22px"><b>'+esc(cl[0])+'</b> = ?</p><div style="display:grid;grid-template-columns:repeat(3,100px);gap:6px">'+board.map(function(b,i){return'<button class="btn'+(mark[i]?' primary':'')+'" data-a="cell" data-v="'+i+'" style="height:56px"'+(mark[i]?' disabled':'')+'>'+(mark[i]?'✓ ':'')+fmt(b[1])+'</button>'}).join('')+'</div><p></p><button class="btn" data-a="none">Not on my board</button>',{cell:function(v){answer(Number(v))},none:function(){answer(-1)}})}
  function answer(i){var cl=calls[n],idx=board.findIndex(function(b){return b[1]===cl[1]}),ok=i===idx;
    if(!ok){wrong++;c.miss();c.setScore(100-wrong*20);c.say(idx<0?'That number is not on your board.':'The answer is '+fmt(cl[1])+'.');if(wrong>=4)return c.end(false,'Too many mistakes.')}else{c.good();if(i>=0){mark[i]=true;if(lines.some(function(l){return l.every(function(k){return mark[k]})}))return c.end(true,'Bingo with '+wrong+' mistakes.')}}
    n++;if(n>=calls.length)return c.end(false,'The calls ran out before a line.');draw()}
  c.auto=function(){var cl=calls[n],idx=board.findIndex(function(b){return b[1]===cl[1]});if(idx>=0)clickIn(c,'[data-a=cell][data-v="'+idx+'"]');else clickIn(c,'[data-a=none]')};draw();
};
G['PL108-105']=function(c){
  var F=c.pack.forecast,fi=0,errs=[];
  function draw(){var f=F[fi];c.draw('<p><strong>'+esc(f.title)+' ('+(fi+1)+' / '+F.length+')</strong>. Predict the next three values. The average error must stay within 5% overall.</p><p style="font-size:18px">'+f.series.join(' , ')+' , ?</p><div class="pager" style="justify-content:flex-start">'+[1,2,3].map(function(k){return'<label>Next '+k+' <input class="fv" aria-label="forecast '+k+'" style="width:90px;'+INP+'"></label>'}).join('')+'<button class="btn primary" data-a="go">Submit forecast</button></div>'+(errs.length?'<p class="small">Errors so far: '+errs.map(function(e){return e.toFixed(1)+'%'}).join(', ')+'</p>':''),{go:go})}
  function go(){var f=F[fi],v=Array.from(c.body.querySelectorAll('.fv')).map(function(i){return num(i.value)});if(v.some(function(x){return isNaN(x)||x===0})){c.say('Enter all three numbers.');return}
    var e=0;f.next.forEach(function(t,k){e+=Math.abs(v[k]-t)/t*100});e/=f.next.length;errs.push(e);c.good();c.say('Average error '+e.toFixed(1)+'%. Rule: '+f.rule+'.');fi++;c.setScore(100-errs.reduce(function(a,b){return a+b},0)*4);
    if(fi>=F.length){var m=errs.reduce(function(a,b){return a+b},0)/errs.length;return c.end(m<=5,'Mean forecast error '+m.toFixed(1)+'%. Threshold 5%.')}draw()}
  c.auto=function(){var f=F[fi];c.body.querySelectorAll('.fv').forEach(function(i,k){i.value=f.next[k]});go()};draw();
};
G['PL108-107']=function(c){
  var B=c.pack.breakeven,bi=0,wrong=0;
  function calc(){var s=B[bi],p=Number(c.$('#pr').value),k=Number(c.$('#vc').value),u=Math.min(s.cap,Math.max(0,s.demand[0]-s.demand[1]*p)),cost=s.costs[k],profit=u*(p-cost[0])-s.fixed-cost[1];return{p:p,k:k,u:u,profit:profit,cost:cost}}
  function show(){var r=calc(),s=B[bi];c.$('#out').innerHTML='Units sold <b>'+r.u+'</b> (need at least '+s.min_units+') · revenue '+fmt(r.u*r.p)+' · costs '+fmt(r.u*r.cost[0]+s.fixed+r.cost[1])+' · profit <b>'+fmt(r.profit)+'</b>'}
  function draw(){var s=B[bi];c.draw('<p><strong>'+esc(s.title)+' ('+(bi+1)+' / '+B.length+')</strong> · fixed cost '+fmt(s.fixed)+' · capacity '+s.cap+' '+esc(U('unit','payslips'))+' · failed months '+wrong+' / 5</p><p class="small">Higher prices reduce demand (demand = '+s.demand[0]+' − '+s.demand[1]+' × price). Reach break-even (profit of zero or more) while serving at least '+s.min_units+' '+esc(U('unit','payslips'))+'.</p><div class="pager" style="justify-content:flex-start"><label>Price per '+esc(U('unit1','payslip'))+' <select id="pr" style="'+INP+'">'+(function(){var o='';for(var p=s.price[0];p<=s.price[1];p+=s.price[2])o+='<option>'+p+'</option>';return o})()+'</select></label><label>Method <select id="vc" style="'+INP+'">'+s.costs.map(function(x,k){return'<option value="'+k+'">Cost '+x[0]+' per '+esc(U('unit1','payslip'))+(x[1]?' (+'+fmt(x[1])+' setup)':'')+'</option>'}).join('')+'</select></label></div><p id="out"></p><button class="btn primary" data-a="go">Close the month</button>',{go:go});
    c.$('#pr').onchange=show;c.$('#vc').onchange=show;show()}
  function go(){var r=calc(),s=B[bi];if(r.profit>=0&&r.u>=s.min_units){c.good();bi++;if(bi>=B.length)return c.end(true,'You broke even in all three months.');c.say('Break-even reached.');return draw()}wrong++;c.miss();c.penalty(10);c.say(r.u<s.min_units?'Too few '+esc(U('unit','payslips'))+' served.':'The month made a loss.');if(wrong>=5)c.end(false,'Too many loss-making months.')}
  c.auto=function(){var s=B[bi],best=null;for(var p=s.price[0];p<=s.price[1];p+=s.price[2])s.costs.forEach(function(x,k){var u=Math.min(s.cap,Math.max(0,s.demand[0]-s.demand[1]*p)),pf=u*(p-x[0])-s.fixed-x[1];if(u>=s.min_units&&pf>=0&&(!best||pf>best.pf))best={p:p,k:k,pf:pf}});
    c.$('#pr').value=best.p;c.$('#vc').value=best.k;go()};draw();
};
G['PL108-108']=function(c){
  var P=c.pack.profit,ri=0,cash=P.start,carry=0;
  function draw(){var r=P.rounds[ri];c.draw('<p><strong>Quarter '+(ri+1)+' / '+P.rounds.length+'</strong> · surplus so far <b>'+fmt(cash)+'</b> · target '+fmt(P.target)+' · carried over '+fmt(carry)+'</p><h3>'+esc(r.text)+'</h3>'+r.opts.map(function(o,k){return'<button class="quizopt" data-a="o" data-v="'+k+'">'+esc(o.t)+' — now '+(o.now>=0?'+':'')+o.now+', next quarter '+(o.nxt>=0?'+':'')+o.nxt+'</button>'}).join(''),
    {o:function(v){var o=r.opts[Number(v)];cash+=o.now+carry;carry=o.nxt;ri++;c.good();c.setScore(Math.max(0,cash)*100/P.target);if(ri>=P.rounds.length){cash+=carry;return c.end(cash>=P.target,'Final surplus '+fmt(cash)+'. Target '+fmt(P.target)+'.')}draw()}})}
  c.auto=function(){var best=null,bv=-1e9;(function rec(i,cs,cr,seq){if(i>=P.rounds.length){var t=cs+cr;if(t>bv){bv=t;best=seq.slice()}return}P.rounds[i].opts.forEach(function(o,k){seq.push(k);rec(i+1,cs+o.now+cr,o.nxt,seq);seq.pop()})})(ri,cash,carry,[]);clickIn(c,'[data-a=o][data-v="'+best[0]+'"]')};draw();
};
