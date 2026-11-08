/* ---------- Sequence Arena ---------- */
G['PL108-064']=function(c){
  var seqs=pick(c.pack.sequences,1,c.r),s=seqs[0],order=shuffle(s.steps.map(function(t,i){return i}),c.r),tries=0;
  if(order.every(function(v,i){return v===i}))order.reverse();
  function draw(){c.draw('<p><strong>'+esc(s.title)+'</strong> — put the steps in the correct order (move with the arrows).</p><ol style="list-style:none;padding:0;display:grid;gap:8px">'+order.map(function(si,p){return'<li style="display:grid;grid-template-columns:30px 1fr auto;gap:8px;align-items:center;border:1px solid var(--line);border-radius:10px;padding:10px"><span class="mono">'+(p+1)+'</span><span>'+esc(s.steps[si])+'</span><span><button class="btn" data-a="up" data-v="'+p+'" aria-label="Move step '+(p+1)+' up"'+(p?'':' disabled')+'>↑</button> <button class="btn" data-a="dn" data-v="'+p+'" aria-label="Move step '+(p+1)+' down"'+(p<order.length-1?'':' disabled')+'>↓</button></span></li>'}).join('')+'</ol><button class="btn primary" data-a="go">Submit order</button>',{up:function(v){sw(Number(v),Number(v)-1)},dn:function(v){sw(Number(v),Number(v)+1)},go:submit})}
  function sw(a,b){var t=order[a];order[a]=order[b];order[b]=t;draw()}
  function submit(){tries++;var ok=order.filter(function(si,p){return si===p}).length;if(ok===order.length){c.good();return c.end(true,'Correct order after '+tries+' submission'+(tries>1?'s':'')+'.')}c.miss();c.penalty(10);c.say(ok+' of '+order.length+' steps are in the right place.');draw()}
  c.auto=function(){order=order.map(function(v,i){return i});submit()};
  draw();
};
G['PL108-067']=function(c){
  var d=c.pack.dominoes,placed=[],tray=shuffle(d.steps.map(function(t,i){return i}),c.r),bad=0;
  function ok(i){return(d.deps[i]||[]).every(function(p){return placed.indexOf(p)>=0})}
  function draw(){c.draw('<p>Place every piece in an order that respects its prerequisites. Placed: '+placed.length+' / '+d.steps.length+' · illegal tries '+bad+'</p><p><strong>Timeline:</strong> '+(placed.length?placed.map(function(i,k){return(k+1)+'. '+esc(d.steps[i])}).join(' → '):'(empty)')+'</p><div>'+tray.filter(function(i){return placed.indexOf(i)<0}).map(function(i){return'<button class="quizopt" data-a="p" data-v="'+i+'">'+esc(d.steps[i])+(d.deps[i]&&d.deps[i].length?' <span class="small muted">needs: '+d.deps[i].map(function(p){return esc(d.steps[p])}).join(', ')+'</span>':'')+'</button>'}).join('')+'</div>',{p:function(v){place(Number(v))}})}
  function place(i){if(!ok(i)){bad++;c.miss();c.penalty(6);c.say('Not yet: its prerequisites are not placed.');return draw()}placed.push(i);c.good();if(placed.length===d.steps.length)return c.end(true,'All pieces placed legally.');draw()}
  c.auto=function(){var n=tray.find(function(i){return placed.indexOf(i)<0&&ok(i)});place(n)};
  draw();
};
G['PL108-072']=function(c){
  var rl=c.pack.approvals,cases=shuffle(rl.cases,c.r).slice(0,8),i=0,bad=0,max=2;
  function next(){if(i>=cases.length)return c.end(true,'All '+cases.length+' cases routed validly.');var k=cases[i];c.draw('<table class="table"><tbody>'+rl.roles.map(function(r){return'<tr><th>'+esc(r.name)+'</th><td>'+esc(r.rule)+'</td></tr>'}).join('')+'</tbody></table><p><strong>Case '+(i+1)+' / '+cases.length+'</strong> · invalid approvals '+bad+' / '+max+'</p><p>'+esc(k.text)+'</p><div class="pager" style="justify-content:flex-start;flex-wrap:wrap">'+rl.roles.map(function(r,j){return'<button class="btn primary" data-a="r" data-v="'+j+'">Route to '+esc(r.name)+'</button>'}).join('')+'</div>',{r:function(v){route(Number(v))}})}
  function route(j){var k=cases[i];if(j===k.role){c.good();c.say('Valid approval: '+k.why);i++;return next()}bad++;c.miss();c.penalty(15);c.say('Invalid: '+k.why);if(bad>=max)return c.end(false,'Too many invalid approvals.');next()}
  c.auto=function(){route(cases[i].role)};
  next();
};
/* ---------- Strategy Arena ---------- */
G['PL108-074']=function(c){
  var b=c.pack.budget,chosen={},cost=function(){return Object.keys(chosen).reduce(function(s,k){return s+b.items[k].cost},0)},val=function(){return Object.keys(chosen).reduce(function(s,k){return s+b.items[k].value},0)},opt=0,n=b.items.length;
  for(var m=0;m<(1<<n);m++){var cs=0,vs=0;for(var i=0;i<n;i++)if(m&(1<<i)){cs+=b.items[i].cost;vs+=b.items[i].value}if(cs<=b.budget&&vs>opt)opt=vs}
  var need=Math.ceil(opt*.9);
  function draw(){c.draw('<p>Budget: <strong>'+fmt(b.budget)+'</strong> · spent '+fmt(cost())+' · value '+val()+' (target '+need+')</p>'+b.items.map(function(it,i){return'<label class="quizopt" style="display:block"><input type="checkbox" data-a="t" data-v="'+i+'"'+(chosen[i]?' checked':'')+'> '+esc(it.name)+' — cost '+fmt(it.cost)+', value '+it.value+'</label>'}).join('')+'<button class="btn primary" data-a="go">Lock in plan</button>',{go:fin});c.body.querySelectorAll('input[data-a=t]').forEach(function(x){x.onchange=function(){if(x.checked)chosen[x.dataset.v]=true;else delete chosen[x.dataset.v];draw()}})}
  function fin(){if(cost()>b.budget){c.miss();c.penalty(10);return c.say('Over budget. Remove something.')}c.good();if(val()>=need){c.setScore(Math.round(100*val()/opt));return c.end(true,'Value '+val()+' within budget (best possible '+opt+').')}c.miss();c.penalty(10);c.say('Within budget but value '+val()+' is below the target '+need+'.')}
  c.auto=function(){var best=0,bm=0;for(var m=0;m<(1<<n);m++){var cs=0,vs=0;for(var i=0;i<n;i++)if(m&(1<<i)){cs+=b.items[i].cost;vs+=b.items[i].value}if(cs<=b.budget&&vs>best){best=vs;bm=m}}chosen={};for(var i2=0;i2<n;i2++)if(bm&(1<<i2))chosen[i2]=true;fin()};
  draw();
};
G['PL108-075']=function(c){
  var d=c.pack.resources,asg={},selR=null;
  function cover(t){return Object.keys(asg).filter(function(r){return asg[r]===t}).reduce(function(s,r){return s+d.people[r].power},0)}
  function ok(){return d.tasks.every(function(t,i){return!t.critical||cover(i)>=t.need})}
  function draw(){c.draw('<p>Assign each person to one task. Every <strong>critical</strong> task must reach its required effort.</p><div style="display:grid;grid-template-columns:1fr 1fr;gap:14px"><div><h4>People</h4>'+d.people.map(function(p,i){return'<button class="btn" style="width:100%;margin-bottom:6px;'+(selR===i?'outline:2px solid #1f6f78;':'')+'" data-a="p" data-v="'+i+'">'+esc(p.name)+' · effort '+p.power+(asg[i]!==undefined?' → '+esc(d.tasks[asg[i]].name):'')+'</button>'}).join('')+'</div><div><h4>Tasks</h4>'+d.tasks.map(function(t,i){var cv=cover(i);return'<button class="btn" style="width:100%;margin-bottom:6px;'+(cv>=t.need?'background:#e9f6ee;':'')+'" data-a="t" data-v="'+i+'">'+esc(t.name)+(t.critical?' ★ critical':'')+' · '+cv+' / '+t.need+'</button>'}).join('')+'</div></div><div class="pager" style="justify-content:flex-start"><button class="btn" data-a="clear">Clear assignments</button><button class="btn primary" data-a="go">Submit plan</button></div>',{p:function(v){selR=Number(v);draw()},t:function(v){if(selR===null)return c.say('Choose a person first.');asg[selR]=Number(v);selR=null;draw()},clear:function(){asg={};selR=null;draw()},go:fin})}
  function fin(){if(ok()){c.good();return c.end(true,'Every critical task is covered.')}c.miss();c.penalty(12);c.say('A critical task is still short of effort.');draw()}
  c.auto=function(){asg=d.solution.slice();fin()};
  draw();
};
G['PL108-079']=function(c){
  var d=c.pack.risks,chosen={},spent=function(){return Object.keys(chosen).reduce(function(s,k){return s+d.controls[k].cost},0)};
  function residual(){return d.risks.reduce(function(s,r,i){var covered=Object.keys(chosen).some(function(k){return d.controls[k].covers.indexOf(i)>=0});return s+(covered?0:r.severity)},0)}
  function draw(){c.draw('<p>Risk events: '+d.risks.map(function(r,i){var cov=Object.keys(chosen).some(function(k){return d.controls[k].covers.indexOf(i)>=0});return(cov?'<s>':'<strong>')+esc(r.name)+' ('+r.severity+')'+(cov?'</s>':'</strong>')}).join(' · ')+'</p><p>Control budget: <strong>'+d.budget+'</strong> · spent '+spent()+' · residual risk <strong>'+residual()+'</strong> (must end below '+d.threshold+')</p>'+d.controls.map(function(k,i){return'<label class="quizopt" style="display:block"><input type="checkbox" data-a="x" data-v="'+i+'"'+(chosen[i]?' checked':'')+'> '+esc(k.name)+' — cost '+k.cost+' · covers: '+k.covers.map(function(r){return esc(d.risks[r].name)}).join(', ')+'</label>'}).join('')+'<button class="btn primary" data-a="go">Finish</button>',{go:fin});c.body.querySelectorAll('input[data-a=x]').forEach(function(x){x.onchange=function(){if(x.checked)chosen[x.dataset.v]=true;else delete chosen[x.dataset.v];draw()}})}
  function fin(){if(spent()>d.budget){c.miss();c.penalty(10);return c.say('Over the control budget.')}if(residual()<d.threshold){c.good();c.setScore(100-residual()*5);return c.end(true,'Residual risk '+residual()+' is below '+d.threshold+'.')}c.miss();c.penalty(10);c.say('Residual risk '+residual()+' is still too high.')}
  c.auto=function(){chosen={};d.solution.forEach(function(i){chosen[i]=true});fin()};
  draw();
};
/* ---------- Mystery Arena ---------- */
G['PL108-082']=function(c){
  var cs=pick(c.pack.errors,3,c.r),i=0,stage='cause',wrong=0;
  function next(){if(i>=cs.length)return c.end(true,'All '+cs.length+' faults found and fixed.');var k=cs[i],isCause=stage==='cause',opts=isCause?k.causes:k.fixes;
    c.draw('<p><strong>Case '+(i+1)+' / '+cs.length+'</strong> — '+esc(k.symptom)+'</p><div class="notice"><strong>Evidence</strong><ul>'+k.clues.map(function(x){return'<li class="mono">'+esc(x)+'</li>'}).join('')+'</ul></div><p><strong>'+(isCause?'What is the root cause?':'What is the right fix?')+'</strong></p>'+opts.map(function(o,j){return'<button class="quizopt" data-a="o" data-v="'+j+'">'+esc(o)+'</button>'}).join(''),{o:function(v){var ok=Number(v)===(isCause?k.cause:k.fix);if(ok){c.good();c.say((isCause?'Root cause confirmed. ':'Fixed. ')+(isCause?k.why:k.fixWhy));if(isCause)stage='fix';else{stage='cause';i++}}else{c.miss();c.penalty(8);wrong++;c.say('Not supported by the evidence. Look again.')}if(wrong>=5)return c.end(false,'Too many wrong guesses.');next()}})}
  c.auto=function(){var k=cs[i];c.body.querySelectorAll('[data-a=o]')[stage==='cause'?k.cause:k.fix].click()};
  next();
};
G['PL108-085']=function(c){
  var rows=c.pack.recon,verdict={},fixed={};
  function draw(){c.draw('<p>Compare Employee Central (source) with the payroll system. Mark each row, then correct every mismatch to the source value.</p><table class="table"><thead><tr><th>Worker</th><th>Field</th><th>Employee Central</th><th>Payroll</th><th>Your call</th></tr></thead><tbody>'+rows.map(function(r,i){return'<tr><td>'+esc(r.w)+'</td><td>'+esc(r.f)+'</td><td>'+esc(r.a)+'</td><td>'+esc(fixed[i]?r.a:r.b)+'</td><td>'+(fixed[i]?'✓ corrected':verdict[i]==='ok'?'✓ match':verdict[i]==='bad'?'<button class="btn" data-a="fix" data-v="'+i+'">Correct to source</button>':'<button class="btn" data-a="m" data-v="'+i+'">Match</button> <button class="btn" data-a="x" data-v="'+i+'">Mismatch</button>')+'</td></tr>'}).join('')+'</tbody></table>',{m:function(v){mark(Number(v),'ok')},x:function(v){mark(Number(v),'bad')},fix:function(v){fixed[v]=true;c.good();check()}})}
  function mark(i,v){var truth=rows[i].a===rows[i].b?'ok':'bad';if(v===truth){verdict[i]=v;c.good();c.say('Right call.')}else{c.miss();c.penalty(8);c.say('Look at both values again.')}check()}
  function check(){if(rows.every(function(r,i){return verdict[i]==='ok'||fixed[i]}))return c.end(true,'All records reconciled.');draw()}
  c.auto=function(){for(var i=0;i<rows.length;i++){if(!verdict[i]){return mark(i,rows[i].a===rows[i].b?'ok':'bad')}if(verdict[i]==='bad'&&!fixed[i]){fixed[i]=true;c.good();return check()}}};
  draw();
};
G['PL108-086']=function(c){
  var cfg=c.pack.config,found={},clean={},bad=0;
  var need=cfg.filter(function(x){return x.bad}).length;
  function draw(){c.draw('<p>Find the <strong>'+need+'</strong> invalid settings in this mock setup. Flag a row only if it breaks the rule stated for it. Wrong flags cost points.</p><table class="table"><thead><tr><th>Setting</th><th>Value</th><th>Rule</th><th></th></tr></thead><tbody>'+cfg.map(function(x,i){return'<tr><td>'+esc(x.k)+'</td><td class="mono">'+esc(x.v)+'</td><td class="small">'+esc(x.rule)+'</td><td>'+(found[i]?'⚑ flagged ✓':clean[i]?'checked':'<button class="btn" data-a="f" data-v="'+i+'">Flag as invalid</button>')+'</td></tr>'}).join('')+'</tbody></table><button class="btn primary" data-a="done">I have found them all</button>',{f:function(v){flag(Number(v))},done:function(){var f=Object.keys(found).length;if(f===need)return c.end(true,'All '+need+' anomalies located.');c.penalty(10);c.say(f+' of '+need+' found so far.')}})}
  function flag(i){if(cfg[i].bad){found[i]=true;c.good();c.say('Correct: '+cfg[i].why);if(Object.keys(found).length===need)return c.end(true,'All '+need+' anomalies located with '+bad+' wrong flags.')}else{clean[i]=true;bad++;c.miss();c.penalty(8);c.say('That setting is valid: '+cfg[i].why);if(bad>=4)return c.end(false,'Too many wrong flags.')}draw()}
  c.auto=function(){var i=cfg.findIndex(function(x,k){return x.bad&&!found[k]});flag(i)};
  draw();
};
