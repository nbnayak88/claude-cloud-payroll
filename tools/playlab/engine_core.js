/* PlayLab 108 runtime for SuccessLabs payroll workbooks.
   Generic engine: games read a content pack (DATA.pack); no subject facts are hard-coded here.
   Standard: PLAYLAB-108-MASTER.md v1.0.0. Wave 1 implements 36 of the 108 templates. */
var Arcade=(function(){
'use strict';
var DATA=null,cur=null,RK='playlab108-results',G={},VERSION='1.0.0';
function esc(s){return String(s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function rng(seed){var a=seed>>>0;return function(){a|=0;a=a+0x6D2B79F5|0;var t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function shuffle(arr,r){var a=arr.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(r()*(i+1)),t=a[i];a[i]=a[j];a[j]=t}return a}
function pick(arr,n,r){return shuffle(arr,r).slice(0,n)}
function mix(q,r){var o=q.options.map(function(t,i){return{t:t,ok:i===q.answer}});return{q:q.q,why:q.why,opts:shuffle(o,r)}}
function fmt(n){return Number(n).toLocaleString('en-IN')}
function load(){try{return JSON.parse(localStorage.getItem(RK)||'[]')}catch(e){return[]}}
function save(list){try{localStorage.setItem(RK,JSON.stringify(list.slice(-300)))}catch(e){}}
function best(id){return load().filter(function(x){return x.templateId===id}).reduce(function(m,x){return Math.max(m,x.score)},-1)}
function stop(){if(cur){cur.handles.forEach(function(h){clearInterval(h);clearTimeout(h)});cur.handles=[];if(cur.onkey)document.removeEventListener('keydown',cur.onkey);cur.stopped=true}cur=null}
function reduced(){try{return window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches}catch(e){return false}}

function home(){
  var fams={},order=[];DATA.registry.forEach(function(t){if(!fams[t.family]){fams[t.family]=[];order.push(t.family)}fams[t.family].push(t)});
  var impl=DATA.registry.filter(function(t){return!!G[t.templateId]}).length;
  var res=load(),won=DATA.registry.filter(function(t){return res.some(function(x){return x.templateId===t.templateId&&x.outcome==='won'})}).length;
  return '<div class="card"><div class="side-stat"><strong>'+impl+' playable · '+(DATA.registry.length-impl)+' design only</strong><span>'+won+' won on this device</span></div>'+
  '<p>PlayLab 108 is the SuccessLabs game standard: 108 reusable templates, each with a visible start, rules, feedback, scoring, an end screen and retry. This arcade runs the <strong>'+esc(DATA.pack.subject)+'</strong> content pack with fictional data. Games marked <em>Design only</em> are specified in the standard but not built yet.</p>'+
  '<div class="notice" role="note">Fictional scenarios, original to this workbook; not official product game content, not a certification. A game score does not prove skills or readiness. Source line for PlayLab: '+esc(DATA.source)+'</div>'+
  '<div class="pager"><button class="btn" id="arcexport">Export results (JSON)</button><button class="btn" id="arcclear">Clear my results</button></div></div>'+
  order.map(function(f){return '<div class="sectiontitle"><h2>'+esc(f)+'</h2><span class="small muted">'+fams[f].filter(function(t){return G[t.templateId]}).length+' of '+fams[f].length+' playable</span></div><div class="arc-grid">'+fams[f].map(function(t){var ok=!!G[t.templateId],b=best(t.templateId);
    return '<div class="arc-tile'+(ok?'':' off')+'"><span class="label muted">'+esc(t.templateId)+' · '+t.defaultMinutes+' min</span><strong>'+esc(t.name)+'</strong><p class="small muted">'+esc(t.topic)+'</p>'+(ok?'<button class="btn primary" data-play="'+t.templateId+'" aria-label="Play '+esc(t.name)+'">'+(b>=0?'Play again · best '+b:'Play')+'</button>':'<span class="pill">Design only</span>')+'</div>'}).join('')+'</div>'}).join('');
}
function bindHome(){
  document.querySelectorAll('[data-play]').forEach(function(b){b.onclick=function(){setup(b.dataset.play)}});
  var ex=document.getElementById('arcexport');if(ex)ex.onclick=function(){var a=document.createElement('a'),u=URL.createObjectURL(new Blob([JSON.stringify({packId:DATA.pack.id,packVersion:DATA.pack.version,results:load()},null,2)],{type:'application/json'}));a.href=u;a.download='playlab108-results.json';document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(u)},500)};
  var cl=document.getElementById('arcclear');if(cl)cl.onclick=function(){if(confirm('Clear PlayLab results on this device?')){save([]);view()}};
}
function target(){return document.getElementById('arcade-root')}
function view(){stop();var t=target();if(!t)return;t.innerHTML=home();bindHome()}

function setup(id){
  stop();var t=DATA.registry.find(function(x){return x.templateId===id}),el=target();
  var mins=[5,10,15,20,25,30];
  el.innerHTML='<div class="card"><button class="btn" id="arcback">← All games</button><h3 style="margin-top:14px">'+esc(t.templateId)+' · '+esc(t.name)+'</h3><p class="small muted">'+esc(t.family)+' · topic: '+esc(t.topic)+'</p>'+
  '<p><strong>Player action:</strong> '+esc(t.playerAction)+'</p><p><strong>Scenario:</strong> '+esc(t.challenge)+'</p><p><strong>You win when:</strong> '+esc(t.winCondition)+'</p>'+
  '<div class="pager" style="justify-content:flex-start;flex-wrap:wrap"><label>Session length <select id="arcmin">'+mins.map(function(m){return'<option value="'+m+'"'+(m===t.defaultMinutes?' selected':'')+'>'+m+' minutes</option>'}).join('')+'</select></label>'+
  '<label><input type="checkbox" id="arcuntimed"'+(reduced()?' checked':'')+'> Untimed accessible mode (no time pressure, slower motion)</label></div>'+
  '<p class="small muted">Scoring starts at 100; hints and mistakes cost points. Finishing early is fine. Everything uses synthetic data and stays on this device.</p><button class="btn primary" id="arcgo">Start game</button></div>';
  document.getElementById('arcback').onclick=view;
  document.getElementById('arcgo').onclick=function(){start(id,{minutes:Number(document.getElementById('arcmin').value),untimed:document.getElementById('arcuntimed').checked,attempt:1,seed:108})};
}

function start(id,o){
  stop();var t=DATA.registry.find(function(x){return x.templateId===id}),el=target();
  var c=cur={id:id,t:t,handles:[],score:100,ok:0,bad:0,done:false,seed:o.seed,attempt:o.attempt,minutes:o.minutes,untimed:o.untimed,accessible:o.untimed||reduced(),started:Date.now(),left:o.minutes*60,pack:DATA.pack,stopped:false};
  c.r=rng(o.seed*1000+o.attempt);
  el.innerHTML='<div class="card arc-play"><div class="side-stat"><strong>'+esc(t.templateId)+' · '+esc(t.name)+'</strong><span>Score <b id="arcscore">100</b> · '+(c.untimed?'Untimed':'Time left <b id="arctime"></b>')+'</span></div><p class="small muted" id="arcgoal"></p>'+
  '<div class="notice" role="status" aria-live="polite" id="arcmsg">Ready.</div><div id="arcbody"></div><div class="pager"><button class="btn" id="arcquit">Quit to arcade</button><button class="btn" id="arcrestart">Restart</button></div></div>';
  c.body=document.getElementById('arcbody');
  document.getElementById('arcgoal').textContent='Goal: '+t.winCondition+'.';
  document.getElementById('arcquit').onclick=view;
  document.getElementById('arcrestart').onclick=function(){start(id,{minutes:o.minutes,untimed:o.untimed,attempt:c.attempt+1,seed:o.seed})};
  c.$=function(s){return c.body.querySelector(s)};
  c.say=function(m){var e=document.getElementById('arcmsg');if(e)e.textContent=m};
  c.setScore=function(n){c.score=Math.max(0,Math.min(100,Math.round(n)));var e=document.getElementById('arcscore');if(e)e.textContent=c.score};
  c.penalty=function(n){c.setScore(c.score-n)};
  c.good=function(){c.ok++};c.miss=function(){c.bad++};
  c.every=function(ms,fn){var h=setInterval(function(){if(!c.done&&!c.stopped)fn()},ms);c.handles.push(h);return h};
  c.after=function(ms,fn){var h=setTimeout(function(){if(!c.done&&!c.stopped)fn()},ms);c.handles.push(h);return h};
  c.key=function(fn){c.onkey=function(e){if(c.done)return;if(/INPUT|SELECT|TEXTAREA/.test((e.target||{}).tagName||''))return;fn(e)};document.addEventListener('keydown',c.onkey)};
  c.untick=function(h){clearInterval(h);clearTimeout(h);var k=c.handles.indexOf(h);if(k>=0)c.handles.splice(k,1)};
  c.ask=function(box,q,cb,o){o=o||{};var done=false,tl=(!c.accessible&&o.seconds)||0,h=null,hidden={};
    function draw(){box.innerHTML='<h3>'+esc(q.q)+'</h3>'+(tl?'<p class="small">Time <b class="qt">'+tl+'</b>s</p>':'')+q.opts.map(function(x,k){return'<button class="quizopt" data-k="'+k+'"'+(hidden[k]?' hidden':'')+'>'+esc(x.t)+'</button>'}).join('')+'<div class="askfb"></div>';
      box.querySelectorAll('.quizopt').forEach(function(b){b.onclick=function(){fin(Number(b.dataset.k))}})}
    function fin(k){if(done)return;done=true;if(h)c.untick(h);var ok=k>=0&&q.opts[k].ok;if(ok)c.good();else c.miss();
      box.querySelectorAll('.quizopt').forEach(function(b,j){b.disabled=true;if(q.opts[j].ok){b.classList.add('correct');b.textContent='\u2713 '+q.opts[j].t}else if(j===k){b.classList.add('wrong');b.textContent='\u2717 '+q.opts[j].t}});
      var fb=box.querySelector('.askfb');fb.innerHTML='<p>'+(ok?'Correct. ':(k<0?'Time up. ':'Not quite. '))+esc(q.why)+'</p>'+(o.auto?'':'<button class="btn primary askgo">Continue</button>');
      if(o.auto)c.after(o.auto,function(){cb(ok)});else{var g=fb.querySelector('.askgo');g.onclick=function(){cb(ok)};g.focus()}}
    draw();if(tl)h=c.every(1000,function(){tl--;var e=box.querySelector('.qt');if(e)e.textContent=tl;if(tl<=0)fin(-1)});
    var api={answer:fin,right:function(){return q.opts.findIndex(function(x){return x.ok})},fifty:function(){var n=0;q.opts.forEach(function(x,k){if(!x.ok&&n<2){hidden[k]=true;n++}});if(!done){var keep=box.querySelectorAll('.quizopt');keep.forEach(function(b,k){if(hidden[k])b.hidden=true})}}};
    c.curAsk=api;return api};
  c.draw=function(html,h){c.body.innerHTML=html;h=h||{};c.body.querySelectorAll('[data-a]').forEach(function(b){b.onclick=function(ev){var f=h[b.dataset.a];if(f){ev.preventDefault();f(b.dataset.v,b)}}})};
  c.end=function(won,note){if(c.done)return;c.done=true;c.handles.forEach(function(x){clearInterval(x);clearTimeout(x)});c.handles=[];
    var secs=Math.round((Date.now()-c.started)/1000),att=c.ok+c.bad,acc=att?Math.round(100*c.ok/att):null;
    var rec={templateId:id,templateVersion:VERSION,contentPackId:DATA.pack.id,contentPackVersion:DATA.pack.version,seed:c.seed,attempt:c.attempt,sessionMinutes:c.minutes,untimed:!!c.untimed,outcome:won?'won':'not-won',completion:won?'finished':'not-finished',score:c.score,accuracyPct:acc,answers:att,elapsedSeconds:secs,at:new Date().toISOString()};
    var l=load();l.push(rec);save(l);
    c.body.innerHTML='<div role="status" aria-live="polite"><h3>'+(won?'You won':'Not won this time')+'</h3><p>'+esc(note||'')+'</p><table class="table"><tbody><tr><th>Outcome</th><td>'+(won?'Won (finished)':'Not finished')+'</td></tr><tr><th>Score</th><td>'+c.score+' / 100</td></tr><tr><th>Accuracy</th><td>'+(acc===null?'not applicable':acc+'% ('+c.ok+' of '+att+')')+'</td></tr><tr><th>Time</th><td>'+Math.floor(secs/60)+'m '+secs%60+'s</td></tr><tr><th>Attempt</th><td>'+c.attempt+'</td></tr></tbody></table><p class="small muted">Template '+esc(id)+' v'+VERSION+' · pack '+esc(DATA.pack.id)+' v'+esc(DATA.pack.version)+'. Fictional scenarios; a score is not a certification.</p><div class="pager"><button class="btn primary" id="arcretry">Play again (new seed)</button><button class="btn" id="arcbk">Back to arcade</button></div></div>';
    document.getElementById('arcretry').onclick=function(){start(id,{minutes:o.minutes,untimed:o.untimed,attempt:c.attempt+1,seed:o.seed})};
    document.getElementById('arcbk').onclick=view;
    c.say(won?'Finished. Well played.':'Game over. You can retry.')};
  if(!c.untimed){var tm=document.getElementById('arctime');var upd=function(){var m=Math.floor(c.left/60),s=c.left%60;if(tm)tm.textContent=m+':'+(s<10?'0':'')+s};upd();
    c.handles.push(setInterval(function(){if(c.done||c.stopped)return;c.left--;upd();if(c.left<=0)c.end(false,'The session time ran out.')},1000))}
  G[id](c);
}
function init(d){DATA=d}
function auto(){if(!cur||cur.done)return;var g=cur.body&&cur.body.querySelector('.askgo');if(g)return g.click();if(cur.auto)cur.auto()}
function state(){return cur}
