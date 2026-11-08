/* PlayLab 108 runtime for SuccessLabs payroll workbooks.
   Generic engine: games read a content pack (DATA.pack); no subject facts are hard-coded here.
   Standard: PLAYLAB-108-MASTER.md v1.0.0. Wave 2 implements all 108 templates. */
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
  '<p>PlayLab 108 is the SuccessLabs game standard: 108 reusable templates, each with a visible start, rules, feedback, scoring, an end screen and retry. This arcade runs the <strong>'+esc(DATA.pack.subject)+'</strong> content pack with fictional data. '+((DATA.registry.length-impl)?'Games marked <em>Design only</em> are specified in the standard but not built yet.':'All 108 templates are playable in this pack.')+'</p>'+
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

/* ---------- Quiz Arena ---------- */
G['PL108-001']=function(c){
  var qs=pick(c.pack.quiz,10,c.r).map(function(q){return mix(q,c.r)}),i=0,streak=0,bestS=0,right=0;
  function next(){
    if(i>=qs.length){c.setScore(right*10);return c.end(right>=7&&bestS>=4,right+' of 10 correct, best streak '+bestS+'. The target is 7 correct with a streak of 4.')}
    c.draw('<p><strong>Question '+(i+1)+' / 10</strong> · streak '+streak+' · correct '+right+'</p><div id="ask"></div>');
    c.ask(c.$('#ask'),qs[i],function(ok){if(ok){right++;streak++;bestS=Math.max(bestS,streak)}else streak=0;c.setScore(right*10);i++;next()},{seconds:15,auto:c.accessible?0:1200});
  }
  c.auto=function(){c.curAsk.answer(c.curAsk.right())};next();
};
G['PL108-002']=function(c){
  var prize=[100,200,300,500,1000,2000,4000,8000],qs=pick(c.pack.quiz,12,c.r).map(function(q){return mix(q,c.r)}),lvl=0,qi=0,life={fifty:true,skip:true};
  function next(){
    if(lvl>=prize.length)return c.end(true,'You cleared all '+prize.length+' levels.');
    c.draw('<p><strong>Level '+(lvl+1)+' / '+prize.length+'</strong> · playing for '+prize[lvl]+' points</p><div class="pager" style="justify-content:flex-start"><button class="btn" data-a="fifty"'+(life.fifty?'':' disabled')+'>50:50 (−5)</button><button class="btn" data-a="skip"'+(life.skip?'':' disabled')+'>Swap question (−5)</button></div><div id="ask"></div>',{
      fifty:function(){if(!life.fifty)return;life.fifty=false;c.penalty(5);c.curAsk.fifty();c.say('Two wrong answers removed.');c.$('[data-a=fifty]').disabled=true},
      skip:function(){if(!life.skip)return;life.skip=false;c.penalty(5);qi++;next()}});
    c.ask(c.$('#ask'),qs[qi%qs.length],function(ok){if(!ok)return c.end(false,'Wrong answer at level '+(lvl+1)+'.');lvl++;qi++;next()});
  }
  c.auto=function(){c.curAsk.answer(c.curAsk.right())};next();
};
G['PL108-005']=function(c){
  var items=pick(c.pack.tf,12,c.r),i=0,right=0;
  function next(){
    if(i>=items.length){var pct=Math.round(100*right/items.length);c.setScore(pct);return c.end(pct>=75,right+' of '+items.length+' correct ('+pct+'%). The threshold is 75%.')}
    var it=items[i],left=c.accessible?0:12,h=null,done=false;
    c.draw('<p><strong>Statement '+(i+1)+' / '+items.length+'</strong>'+(left?' · <span id="tt">'+left+'</span>s':'')+'</p><h3>'+esc(it[0])+'</h3><div class="pager" style="justify-content:flex-start"><button class="btn primary" data-a="t" data-v="1">True</button><button class="btn primary" data-a="t" data-v="0">False</button></div><div id="fb"></div>',{t:function(v){fin(v==='1')}});
    function fin(ans){if(done)return;done=true;if(h)c.untick(h);var ok=ans===it[1];if(ok){right++;c.good()}else c.miss();c.setScore(100*right/items.length);c.body.querySelectorAll('[data-a]').forEach(function(b){b.disabled=true});c.$('#fb').innerHTML='<p>'+(ok?'Correct. ':(ans===null?'Time up. ':'Not quite. '))+esc(it[2])+'</p><button class="btn primary" id="go">Continue</button>';c.$('#go').onclick=function(){i++;next()};c.$('#go').focus()}
    if(left)h=c.every(1000,function(){left--;var e=c.$('#tt');if(e)e.textContent=left;if(left<=0)fin(null)});
    c.auto=function(){var go=c.$('#go');if(go)return go.click();fin(it[1])};
  }
  next();
};
/* ---------- Word Arena ---------- */
G['PL108-013']=function(c){
  var words=pick(c.pack.words,6,c.r),wi=0,solved=0,built=[],tiles=[],reveal=0;
  function scr(w){var t=shuffle(w.split(''),c.r),n=0;while(t.join('')===w&&n++<5)t=shuffle(w.split(''),c.r);return t}
  function next(){
    if(wi>=words.length)return c.end(true,'All '+words.length+' terms rebuilt.');
    var w=words[wi][0];tiles=scr(w);built=[];reveal=0;draw();
  }
  function draw(){
    var w=words[wi][0];
    c.draw('<p><strong>Term '+(wi+1)+' / '+words.length+'</strong></p><p class="muted">Clue: '+esc(words[wi][1])+'</p><p aria-live="polite" style="font-size:26px;letter-spacing:6px;min-height:40px">'+built.map(function(k){return esc(tiles[k])}).join('')+(built.length<w.length?'_'.repeat(w.length-built.length):'')+'</p><div class="pager" style="justify-content:flex-start;flex-wrap:wrap">'+tiles.map(function(t,k){return'<button class="btn" data-a="tile" data-v="'+k+'"'+(built.indexOf(k)>=0?' disabled':'')+' aria-label="Letter '+esc(t)+'">'+esc(t)+'</button>'}).join('')+'</div><div class="pager" style="justify-content:flex-start"><button class="btn" data-a="back">Undo</button><button class="btn" data-a="clear">Clear</button><button class="btn" data-a="hint">Hint: next letter (−5)</button></div>',{
      tile:function(v){built.push(Number(v));check()},back:function(){built.pop();draw()},clear:function(){built=[];draw()},
      hint:function(){var w=words[wi][0],need=w[built.length];if(!need)return;var k=tiles.findIndex(function(t,j){return t===need&&built.indexOf(j)<0});if(k>=0){built.push(k);c.penalty(5);check()}}});
  }
  function check(){var w=words[wi][0];if(built.length<w.length)return draw();var s=built.map(function(k){return tiles[k]}).join('');if(s===w){c.good();solved++;c.say('Correct: '+w);wi++;next()}else{c.miss();c.penalty(3);c.say('Not a match. Undo or clear and try again.');built=[];draw()}}
  c.auto=function(){var w=words[wi][0];built=[];var used=[];w.split('').forEach(function(ch){var k=tiles.findIndex(function(t,j){return t===ch&&used.indexOf(j)<0});used.push(k)});built=used;check()};
  next();
};
G['PL108-012']=function(c){
  var ph=pick(c.pack.hang,1,c.r)[0],word=ph[0],clue=ph[1],tried={},wrong=0,max=6;
  function draw(){
    var show=word.split('').map(function(ch){return ch===' '?'  ':(tried[ch]?ch:'_')}).join(' ');
    var abc='ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    c.draw('<p class="muted">Clue: '+esc(clue)+'</p><p aria-live="polite" style="font-size:26px;letter-spacing:3px">'+esc(show)+'</p><p>Mistakes: <strong>'+wrong+' / '+max+'</strong> '+'♥'.repeat(max-wrong)+'</p><div class="pager" style="justify-content:flex-start;flex-wrap:wrap">'+abc.map(function(ch){return'<button class="btn" data-a="l" data-v="'+ch+'"'+(tried[ch]?' disabled':'')+'>'+ch+'</button>'}).join('')+'</div><button class="btn" data-a="hint">Hint: reveal a letter (−10)</button>',{l:function(v){guess(v)},hint:function(){var m=word.split('').filter(function(ch){return ch!==' '&&!tried[ch]});if(m.length){tried[m[0]]=true;c.penalty(10);fin()}}});
  }
  function guess(ch){if(tried[ch])return;tried[ch]=true;if(word.indexOf(ch)>=0){c.good()}else{c.miss();wrong++;c.penalty(8)}fin()}
  function fin(){var all=word.split('').every(function(ch){return ch===' '||tried[ch]});if(all)return c.end(true,'The phrase was '+word+'.');if(wrong>=max)return c.end(false,'The phrase was '+word+'.');draw()}
  c.key(function(e){var k=(e.key||'').toUpperCase();if(/^[A-Z]$/.test(k)){guess(k)}});
  c.auto=function(){var m=word.split('').filter(function(ch){return ch!==' '&&!tried[ch]});if(m.length)guess(m[0])};
  draw();
};
G['PL108-011']=function(c){
  var N=10,words=pick(c.pack.words.map(function(x){return x[0]}).filter(function(w){return w.length<=N}),6,c.r),grid,pos={},found={},sel=null,dirs=[[0,1],[1,0],[1,1]];
  function build(){
    grid=[];for(var i=0;i<N;i++){grid.push([]);for(var j=0;j<N;j++)grid[i].push('')}
    words.forEach(function(w){var ok=false,tries=0;while(!ok&&tries++<400){var d=dirs[Math.floor(c.r()*dirs.length)],r=Math.floor(c.r()*N),cc=Math.floor(c.r()*N),er=r+d[0]*(w.length-1),ec=cc+d[1]*(w.length-1);if(er>=N||ec>=N)continue;var fit=true;for(var k=0;k<w.length;k++){var ch=grid[r+d[0]*k][cc+d[1]*k];if(ch&&ch!==w[k]){fit=false;break}}if(!fit)continue;for(var k2=0;k2<w.length;k2++)grid[r+d[0]*k2][cc+d[1]*k2]=w[k2];pos[w]={r:r,c:cc,d:d};ok=true}});
    var L='ABCDEFGHIJKLMNOPQRSTUVWXYZ';for(var a=0;a<N;a++)for(var b=0;b<N;b++)if(!grid[a][b])grid[a][b]=L[Math.floor(c.r()*26)];
  }
  function cells(w){var p=pos[w],o={};for(var k=0;k<w.length;k++)o[(p.r+p.d[0]*k)+','+(p.c+p.d[1]*k)]=1;return o}
  function foundCells(){var o={};Object.keys(found).forEach(function(w){Object.assign(o,cells(w))});return o}
  function draw(){
    var fc=foundCells();
    c.draw('<p>Find: '+words.map(function(w){return found[w]?'<s>'+esc(w)+'</s>':'<strong>'+esc(w)+'</strong>'}).join(' · ')+'</p><div role="grid" style="display:grid;grid-template-columns:repeat('+N+',minmax(0,36px));gap:3px">'+grid.map(function(row,r){return row.map(function(ch,cc){var k=r+','+cc,on=fc[k],s=sel&&sel.r===r&&sel.c===cc;return'<button class="btn" style="padding:6px 0;'+(on?'background:#e9f6ee;border-color:#2e8b57;':'')+(s?'outline:2px solid #1f6f78;':'')+'" data-a="cell" data-v="'+k+'" aria-label="Row '+(r+1)+' column '+(cc+1)+' letter '+ch+(on?' found':'')+'">'+ch+'</button>'}).join('')}).join('')+'</div><p class="small muted">Tap the first and last letter of a term (rows, columns or diagonals).</p><button class="btn" data-a="hint">Hint: mark a start cell (−5)</button>',{cell:function(v){pickc(v)},hint:function(){var w=words.find(function(x){return!found[x]});if(w){sel={r:pos[w].r,c:pos[w].c};c.penalty(5);c.say('Start cell of one term is marked.');draw()}}});
  }
  function pickc(v){var p=v.split(',').map(Number),cell={r:p[0],c:p[1]};if(!sel){sel=cell;return draw()}var a=sel,b=cell;sel=null;var hit=words.find(function(w){if(found[w])return false;var q=pos[w],e={r:q.r+q.d[0]*(w.length-1),c:q.c+q.d[1]*(w.length-1)};return(a.r===q.r&&a.c===q.c&&b.r===e.r&&b.c===e.c)||(b.r===q.r&&b.c===q.c&&a.r===e.r&&a.c===e.c)});
    if(hit){found[hit]=true;c.good();c.say('Found '+hit+'.');if(words.every(function(w){return found[w]}))return c.end(true,'All '+words.length+' terms found.')}else{c.miss();c.penalty(2);c.say('No term runs between those two letters.')}draw()}
  c.auto=function(){var w=words.find(function(x){return!found[x]});var q=pos[w];pickc(q.r+','+q.c);pickc((q.r+q.d[0]*(w.length-1))+','+(q.c+q.d[1]*(w.length-1)))};
  build();draw();
};

/* ---------- Board Arena ---------- */
G['PL108-019']=function(c){
  var ladders={4:25,9:31,20:42,28:84,36:44,40:59,63:81,71:91},snakes={17:7,54:44,62:48,87:67,95:75},pos=0,turns=0,maxT=50,qs=shuffle(c.pack.quiz,c.r),qi=0,die=0;
  function cellNo(r,col){var row=9-r,base=row*10;return row%2===0?base+col+1:base+(9-col)+1}
  function board(){var h='<div role="grid" aria-label="Board" style="display:grid;grid-template-columns:repeat(10,minmax(0,1fr));gap:2px;font-size:11px">';
    for(var r=0;r<10;r++)for(var col=0;col<10;col++){var n=cellNo(r,col),m=ladders[n]?'▲'+ladders[n]:snakes[n]?'▼'+snakes[n]:'';h+='<div style="border:1px solid var(--line);border-radius:6px;padding:4px 2px;text-align:center;'+(n===pos?'background:#1f6f78;color:#fff;font-weight:700':'')+'" aria-label="Square '+n+(m?(ladders[n]?' ladder to '+ladders[n]:' snake to '+snakes[n]):'')+(n===pos?' you are here':'')+'">'+n+'<br><span style="font-size:10px">'+(n===pos?'●':m)+'</span></div>'}
    return h+'</div>'}
  function draw(){c.draw('<p>Square <strong>'+pos+'</strong> / 100 · turn '+turns+' / '+maxT+'</p>'+board()+'<div class="pager" style="justify-content:flex-start"><button class="btn primary" data-a="roll">Roll the die</button></div>',{roll:roll})}
  function roll(){turns++;die=Math.floor(c.r()*6)+1;c.draw('<p>You rolled <strong>'+die+'</strong>. Answer correctly to move.</p><div id="ask"></div>');
    c.ask(c.$('#ask'),mix(qs[qi++%qs.length],c.r),function(ok){
      if(ok){pos=Math.min(100,pos+die);if(pos<100&&ladders[pos]){c.say('Ladder up to '+ladders[pos]+'.');pos=ladders[pos]}else if(pos<100&&snakes[pos]){c.say('Snake down to '+snakes[pos]+'.');pos=snakes[pos]}}else{c.penalty(2);c.say('Wrong answer: you stay on square '+pos+'.')}
      if(pos>=100){c.setScore(c.score);return c.end(true,'You reached 100 in '+turns+' turns.')}
      if(turns>=maxT)return c.end(false,'You used all '+maxT+' turns on square '+pos+'.');draw()})}
  c.auto=function(){if(c.curAsk&&!c.body.querySelector('[data-a=roll]'))c.curAsk.answer(c.curAsk.right());else roll()};
  draw();
};
function lines3(){return[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]]}
G['PL108-022']=function(c){
  var b=Array(9).fill(''),qs=shuffle(c.pack.quiz,c.r),qi=0;
  function win(p){return lines3().some(function(l){return l.every(function(i){return b[i]===p})})}
  function ai(){var L=lines3(),m,k;if(c.r()<.42){var fr=b.map(function(v,i){return v?-1:i}).filter(function(i){return i>=0});if(fr.length)return fr[Math.floor(c.r()*fr.length)]}for(var p of['O','X']){for(k=0;k<L.length;k++){var l=L[k],v=l.map(function(i){return b[i]});if(v.filter(function(x){return x===p}).length===2&&v.indexOf('')>=0)return l[v.indexOf('')]}}
    if(!b[4])return 4;var free=[0,2,6,8,1,3,5,7].filter(function(i){return!b[i]});return free.length?free[0]:-1}
  function over(){if(win('X'))return (function(w,m){c.end(w,m);return true})(true,'You made three in a row.');if(win('O'))return (function(w,m){c.end(w,m);return true})(false,'The computer made three in a row.');if(b.every(function(x){return x}))return (function(w,m){c.end(w,m);return true})(false,'Draw: the board is full.');return false}
  function draw(){c.draw('<p>You are <strong>X</strong>. Choose a cell, then answer to claim it.</p><div style="display:grid;grid-template-columns:repeat(3,72px);gap:6px">'+b.map(function(v,i){return'<button class="btn" style="height:72px;font-size:26px" data-a="cell" data-v="'+i+'"'+(v?' disabled':'')+' aria-label="Cell '+(i+1)+(v?' '+v:' empty')+'">'+v+'</button>'}).join('')+'</div>',{cell:function(v){claim(Number(v))}})}
  function claim(i){c.draw('<p>Claiming cell '+(i+1)+'.</p><div id="ask"></div>');c.ask(c.$('#ask'),mix(qs[qi++%qs.length],c.r),function(ok){if(ok){b[i]='X'}else{c.penalty(4);c.say('Wrong: the cell stays open and the computer moves.')}
      if(over())return;var m=ai();if(m>=0)b[m]='O';if(over())return;draw()})}
  function mm(bd,p){var w=function(q){return lines3().some(function(l){return l.every(function(i){return bd[i]===q})})};if(w('X'))return[1,-1];if(w('O'))return[-1,-1];var fr=bd.map(function(v,i){return v?-1:i}).filter(function(i){return i>=0});if(!fr.length)return[0,-1];var best=null;fr.forEach(function(i){bd[i]=p;var r=mm(bd,p==='X'?'O':'X')[0];bd[i]='';if(best===null||(p==='X'?r>best[0]:r<best[0]))best=[r,i]});return best}
  c.auto=function(){if(c.curAsk&&c.body.querySelector('.quizopt')&&!c.body.querySelector('.askgo'))return c.curAsk.answer(c.curAsk.right());claim(mm(b.slice(),'X')[1])};
  draw();
};
G['PL108-023']=function(c){
  var R=6,C=7,g=[];for(var i=0;i<R;i++)g.push(Array(C).fill(''));var qs=shuffle(c.pack.quiz,c.r),qi=0;
  function drop(col,p){for(var r=R-1;r>=0;r--)if(!g[r][col]){g[r][col]=p;return r}return -1}
  function four(p){for(var r=0;r<R;r++)for(var cc=0;cc<C;cc++)for(var d of[[0,1],[1,0],[1,1],[1,-1]]){var ok=true;for(var k=0;k<4;k++){var rr=r+d[0]*k,c2=cc+d[1]*k;if(rr<0||rr>=R||c2<0||c2>=C||g[rr][c2]!==p){ok=false;break}}if(ok)return true}return false}
  function playable(){var o=[];for(var cc=0;cc<C;cc++)if(!g[0][cc])o.push(cc);return o}
  function aiMove(){var pl=playable();if(c.r()<.35)return pl[Math.floor(c.r()*pl.length)];for(var p of['O','X']){for(var k=0;k<pl.length;k++){var col=pl[k],r=drop(col,p),w=four(p);g[r][col]='';if(w)return col}}var pref=[3,2,4,1,5,0,6].filter(function(x){return pl.indexOf(x)>=0});return pref[Math.floor(c.r()*Math.min(2,pref.length))]}
  function over(){if(four('X'))return (function(w,m){c.end(w,m);return true})(true,'You connected four.');if(four('O'))return (function(w,m){c.end(w,m);return true})(false,'The computer connected four.');if(!playable().length)return (function(w,m){c.end(w,m);return true})(false,'Draw: the board is full.');return false}
  function draw(){c.draw('<p>You are <strong>X</strong>. Choose a column, then answer to drop your token.</p><div style="display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:4px">'+[0,1,2,3,4,5,6].map(function(cc){return'<button class="btn" data-a="col" data-v="'+cc+'"'+(g[0][cc]?' disabled':'')+' aria-label="Column '+(cc+1)+'">▼</button>'}).join('')+g.map(function(row){return row.map(function(v){return'<div style="aspect-ratio:1;border-radius:50%;border:1px solid var(--line);display:grid;place-items:center;background:'+(v==='X'?'#1f6f78;color:#fff':v==='O'?'#c0562f;color:#fff':'var(--surface)')+'">'+v+'</div>'}).join('')}).join('')+'</div>',{col:function(v){claim(Number(v))}})}
  function claim(col){c.draw('<p>Dropping in column '+(col+1)+'.</p><div id="ask"></div>');c.ask(c.$('#ask'),mix(qs[qi++%qs.length],c.r),function(ok){if(ok)drop(col,'X');else{c.penalty(3);c.say('Wrong: you lose the turn.')}
      if(over())return;var m=aiMove();if(m!==undefined)drop(m,'O');if(over())return;draw()})}
  c.auto=function(){if(c.curAsk&&c.body.querySelector('.quizopt'))return c.curAsk.answer(c.curAsk.right());var pl=playable(),pick1=null;for(var p of['X','O']){for(var k=0;k<pl.length&&pick1===null;k++){var col=pl[k],r=drop(col,p),w=four(p);g[r][col]='';if(w)pick1=col}}if(pick1===null){var pref=[3,2,4,1,5,0,6].filter(function(x){return pl.indexOf(x)>=0});pick1=pref[0]}claim(pick1)};
  draw();
};
/* ---------- Memory Arena ---------- */
G['PL108-028']=function(c){
  var pairs=pick(c.pack.pairs,8,c.r),cards=shuffle(pairs.reduce(function(a,p,i){a.push({k:i,t:p[0]});a.push({k:i,t:p[1]});return a},[]),c.r),open=[],matched={},moves=0,lock=false;
  function draw(){c.draw('<p>Moves: <strong>'+moves+'</strong> · pairs found '+Object.keys(matched).length+' / '+pairs.length+'</p><div style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px">'+cards.map(function(cd,i){var up=open.indexOf(i)>=0||matched[cd.k];return'<button class="btn" style="min-height:74px;font-size:12px;'+(matched[cd.k]?'background:#e9f6ee;border-color:#2e8b57':'')+'" data-a="f" data-v="'+i+'" aria-label="'+(up?esc(cd.t):'Hidden card '+(i+1))+'"'+(matched[cd.k]?' disabled':'')+'>'+(up?esc(cd.t):'?')+'</button>'}).join('')+'</div>',{f:function(v){flip(Number(v))}})}
  function flip(i){if(lock||open.indexOf(i)>=0||matched[cards[i].k])return;open.push(i);if(open.length<2)return draw();moves++;var a=cards[open[0]],b=cards[open[1]];
    if(a.k===b.k){matched[a.k]=true;open=[];c.good();c.say('Match: '+a.t+' = '+b.t);if(Object.keys(matched).length===pairs.length){c.setScore(Math.max(40,100-Math.max(0,moves-pairs.length)*4));draw();return c.end(true,'All pairs found in '+moves+' moves.')}draw()}
    else{c.miss();c.penalty(2);lock=true;draw();c.after(c.accessible?1800:900,function(){open=[];lock=false;draw()})}}
  c.auto=function(){var seen={};for(var i=0;i<cards.length;i++){if(matched[cards[i].k])continue;if(open.indexOf(i)>=0)continue;var k=cards[i].k;if(seen[k]!==undefined){lock=false;open=[];flip(seen[k]);flip(i);return}seen[k]=i}};
  draw();
};
G['PL108-029']=function(c){
  var pairs=pick(c.pack.pairs,8,c.r),left=shuffle(pairs.map(function(p,i){return{k:i,t:p[0]}}),c.r),right=shuffle(pairs.map(function(p,i){return{k:i,t:p[1]}}),c.r),sel=null,done={};
  function draw(){c.draw('<p>Pair each term with what it does. Found '+Object.keys(done).length+' / '+pairs.length+'</p><div style="display:grid;grid-template-columns:1fr 1fr;gap:12px"><div>'+left.map(function(x){return'<button class="btn" style="width:100%;margin-bottom:8px;'+(done[x.k]?'background:#e9f6ee':sel&&sel.s==='L'&&sel.k===x.k?'outline:2px solid #1f6f78':'')+'" data-a="p" data-v="L'+x.k+'"'+(done[x.k]?' disabled':'')+'>'+esc(x.t)+'</button>'}).join('')+'</div><div>'+right.map(function(x){return'<button class="btn" style="width:100%;margin-bottom:8px;font-size:12px;'+(done[x.k]?'background:#e9f6ee':sel&&sel.s==='R'&&sel.k===x.k?'outline:2px solid #1f6f78':'')+'" data-a="p" data-v="R'+x.k+'"'+(done[x.k]?' disabled':'')+'>'+esc(x.t)+'</button>'}).join('')+'</div></div>',{p:function(v){tap(v[0],Number(v.slice(1)))}})}
  function tap(s,k){if(!sel||sel.s===s){sel={s:s,k:k};return draw()}var ok=sel.k===k;sel=null;if(ok){done[k]=true;c.good();c.say('Pair found.')}else{c.miss();c.penalty(4);c.say('Not a pair.')}if(Object.keys(done).length===pairs.length)return c.end(true,'All relationships matched.');draw()}
  c.auto=function(){var k=pairs.findIndex(function(p,i){return!done[i]});sel=null;tap('L',k);tap('R',k)};
  draw();
};
G['PL108-035']=function(c){
  var sets=pick(c.pack.odd,6,c.r).map(function(s){var o=s.items.map(function(t,i){return{t:t,odd:i===s.odd}});return{items:shuffle(o,c.r),why:s.why}}),i=0,found=0,lives=3;
  function next(){if(i>=sets.length){return c.end(true,'You found all '+sets.length+' odd items.')}c.draw('<p><strong>Set '+(i+1)+' / '+sets.length+'</strong> · mistakes left '+lives+'</p><p>Which item does not belong?</p>'+sets[i].items.map(function(x,k){return'<button class="quizopt" data-a="o" data-v="'+k+'">'+esc(x.t)+'</button>'}).join('')+'<div id="fb"></div>',{o:function(v){var s=sets[i],ok=s.items[Number(v)].odd;c.body.querySelectorAll('[data-a]').forEach(function(b){b.disabled=true});if(ok){c.good();found++}else{c.miss();c.penalty(12);lives--}c.$('#fb').innerHTML='<p>'+(ok?'Correct. ':'Not quite. ')+esc(s.why)+'</p><button class="btn primary" id="go">Continue</button>';c.$('#go').focus();c.$('#go').onclick=function(){if(lives<=0)return c.end(false,'You used all your mistakes.');i++;next()}}})}
  c.auto=function(){var go=c.$('#go');if(go)return go.click();var k=sets[i].items.findIndex(function(x){return x.odd});c.body.querySelectorAll('[data-a=o]')[k].click()};
  next();
};

/* ---------- Logic Arena ---------- */
G['PL108-037']=function(c){
  var sym=c.pack.symbols4,base=[[0,1,2,3],[2,3,0,1],[1,0,3,2],[3,2,1,0]];
  function perm(){var p=shuffle([0,1,2,3],c.r),rows=[].concat(shuffle([0,1],c.r),shuffle([2,3],c.r));if(c.r()<.5)rows=[rows[2],rows[3],rows[0],rows[1]];var cols=[].concat(shuffle([0,1],c.r),shuffle([2,3],c.r));if(c.r()<.5)cols=[cols[2],cols[3],cols[0],cols[1]];return rows.map(function(r){return cols.map(function(cc){return p[base[r][cc]]})})}
  function count(g,lim){var n=0;(function rec(i){if(n>=lim)return;if(i===16){n++;return}var r=Math.floor(i/4),cc=i%4;if(g[r][cc]>=0)return rec(i+1);for(var v=0;v<4;v++){var ok=true;for(var k=0;k<4;k++){if(g[r][k]===v||g[k][cc]===v){ok=false;break}}var br=r-r%2,bc=cc-cc%2;for(var a=0;a<2&&ok;a++)for(var b=0;b<2;b++)if(g[br+a][bc+b]===v)ok=false;if(ok){g[r][cc]=v;rec(i+1);g[r][cc]=-1}}})(0);return n}
  var sol=perm(),puz=sol.map(function(r){return r.slice()}),order=shuffle([].concat.apply([],Array.from({length:16},function(_,i){return[i]})),c.r);
  order.forEach(function(i){var r=Math.floor(i/4),cc=i%4,keep=puz[r][cc];puz[r][cc]=-1;var t=puz.map(function(x){return x.slice()});if(count(t,2)!==1)puz[r][cc]=keep;});
  var given=puz.map(function(r){return r.map(function(v){return v>=0})}),selc=null;
  function conflicts(){var bad={};for(var r=0;r<4;r++)for(var cc=0;cc<4;cc++){var v=puz[r][cc];if(v<0)continue;for(var k=0;k<4;k++){if(k!==cc&&puz[r][k]===v)bad[r+','+cc]=1;if(k!==r&&puz[k][cc]===v)bad[r+','+cc]=1}var br=r-r%2,bc=cc-cc%2;for(var a=0;a<2;a++)for(var b=0;b<2;b++)if((br+a!==r||bc+b!==cc)&&puz[br+a][bc+b]===v)bad[r+','+cc]=1}return bad}
  function draw(){var bad=conflicts();c.draw('<p>Fill the grid so every row, column and 2×2 box has each of the four items once.</p><div style="display:grid;grid-template-columns:repeat(4,64px);gap:3px">'+puz.map(function(row,r){return row.map(function(v,cc){var k=r+','+cc;return'<button class="btn" style="height:64px;font-size:13px;'+(given[r][cc]?'background:var(--soft,#eef3f4);font-weight:700;':'')+(bad[k]?'border-color:#c0562f;':'')+(selc&&selc.r===r&&selc.c===cc?'outline:2px solid #1f6f78;':'')+((r===1||r===3)?'':'')+'" data-a="cell" data-v="'+k+'" aria-label="Row '+(r+1)+' column '+(cc+1)+(v>=0?' '+esc(sym[v]):' empty')+(bad[k]?' conflict':'')+'">'+(v>=0?esc(sym[v]):'')+(bad[k]?' ✗':'')+'</button>'}).join('')}).join('')+'</div><div class="pager" style="justify-content:flex-start;flex-wrap:wrap">'+sym.map(function(s,i){return'<button class="btn" data-a="put" data-v="'+i+'">'+(i+1)+' '+esc(s)+'</button>'}).join('')+'<button class="btn" data-a="clr">Clear cell</button><button class="btn" data-a="hint">Hint: fill a cell (−5)</button></div>',{cell:function(v){var p=v.split(',').map(Number);if(!given[p[0]][p[1]]){selc={r:p[0],c:p[1]};draw()}},put:function(v){put(Number(v))},clr:function(){if(selc){puz[selc.r][selc.c]=-1;draw()}},hint:function(){for(var r=0;r<4;r++)for(var cc=0;cc<4;cc++)if(puz[r][cc]!==sol[r][cc]){puz[r][cc]=sol[r][cc];given[r][cc]=true;c.penalty(5);return check()}}})}
  function put(v){if(!selc)return c.say('Select an empty cell first.');puz[selc.r][selc.c]=v;if(sol[selc.r][selc.c]===v)c.good();else{c.miss();c.penalty(2)}check()}
  function check(){var full=puz.every(function(r){return r.every(function(v){return v>=0})});if(full&&Object.keys(conflicts()).length===0)return c.end(true,'The grid is valid.');draw()}
  c.key(function(e){if(/^[1-4]$/.test(e.key))put(Number(e.key)-1)});
  c.auto=function(){for(var r=0;r<4;r++)for(var cc=0;cc<4;cc++)if(puz[r][cc]!==sol[r][cc]){selc={r:r,c:cc};puz[r][cc]=sol[r][cc];return check()}};
  draw();
};
G['PL108-039']=function(c){
  var sym=c.pack.symbols6,L=4,max=8,secret=Array.from({length:L},function(){return Math.floor(c.r()*sym.length)}),cur=[],hist=[];
  function score(g){var ex=0,a=[],b=[];g.forEach(function(v,i){if(v===secret[i])ex++;else{a.push(v);b.push(secret[i])}});var pa=0;a.forEach(function(v){var k=b.indexOf(v);if(k>=0){pa++;b.splice(k,1)}});return[ex,pa]}
  function draw(){c.draw('<p>Crack the hidden code of '+L+' items (repeats allowed). Guess '+(hist.length+1)+' / '+max+'. Feedback: ● right item and place, ○ right item wrong place.</p>'+hist.map(function(h,i){return'<p>'+(i+1)+'. '+h.g.map(function(v){return esc(sym[v])}).join(' · ')+' → <strong>'+'●'.repeat(h.s[0])+'○'.repeat(h.s[1])+(h.s[0]+h.s[1]===0?'none':'')+'</strong> <span class="small muted">('+h.s[0]+' exact, '+h.s[1]+' misplaced)</span></p>'}).join('')+'<p>Your guess: <strong>'+(cur.length?cur.map(function(v){return esc(sym[v])}).join(' · '):'(choose '+L+')')+'</strong></p><div class="pager" style="justify-content:flex-start;flex-wrap:wrap">'+sym.map(function(s,i){return'<button class="btn" data-a="add" data-v="'+i+'">'+esc(s)+'</button>'}).join('')+'</div><div class="pager" style="justify-content:flex-start"><button class="btn" data-a="undo">Undo</button><button class="btn primary" data-a="go"'+(cur.length===L?'':' disabled')+'>Submit guess</button></div>',{add:function(v){if(cur.length<L){cur.push(Number(v));draw()}},undo:function(){cur.pop();draw()},go:submit})}
  function submit(){if(cur.length!==L)return;var s=score(cur);hist.push({g:cur.slice(),s:s});if(s[0]===L){c.good();c.setScore(100-(hist.length-1)*10);return c.end(true,'Cracked in '+hist.length+' guesses.')}c.miss();c.penalty(8);cur=[];if(hist.length>=max)return c.end(false,'The code was '+secret.map(function(v){return sym[v]}).join(' · ')+'.');draw()}
  c.auto=function(){cur=secret.slice();submit()};
  draw();
};
G['PL108-040']=function(c){
  var N=8,M=10,mines=null,rev={},flag={},flagMode=false,over=false;
  function nb(r,k){var o=[];for(var a=-1;a<=1;a++)for(var b=-1;b<=1;b++){if(!a&&!b)continue;var rr=r+a,kk=k+b;if(rr>=0&&rr<N&&kk>=0&&kk<N)o.push([rr,kk])}return o}
  function place(sr,sc){mines={};var cells=[];for(var r=0;r<N;r++)for(var k=0;k<N;k++)if(!(Math.abs(r-sr)<=1&&Math.abs(k-sc)<=1))cells.push(r+','+k);shuffle(cells,c.r).slice(0,M).forEach(function(x){mines[x]=1})}
  function cnt(r,k){return nb(r,k).filter(function(p){return mines[p[0]+','+p[1]]}).length}
  function reveal(r,k){var key=r+','+k;if(rev[key]||flag[key])return;rev[key]=true;if(!mines[key]&&cnt(r,k)===0)nb(r,k).forEach(function(p){reveal(p[0],p[1])})}
  function draw(){var safeLeft=N*N-M-Object.keys(rev).length;c.draw('<p>Reveal every clean cell and avoid the '+M+' hidden errors. Clean cells left: <strong>'+safeLeft+'</strong> · flags '+Object.keys(flag).length+' / '+M+'</p><div class="pager" style="justify-content:flex-start"><button class="btn'+(flagMode?' primary':'')+'" data-a="mode" aria-pressed="'+flagMode+'">Flag mode: '+(flagMode?'on':'off')+'</button></div><div style="display:grid;grid-template-columns:repeat('+N+',36px);gap:2px">'+Array.from({length:N*N},function(_,i){var r=Math.floor(i/N),k=i%N,key=r+','+k,v=rev[key];var t=v?(mines[key]?'✹':(cnt(r,k)||'')):(flag[key]?'⚑':'');return'<button class="btn" style="height:36px;padding:0;'+(v?'background:#eef3f4;':'')+'" data-a="c" data-v="'+key+'"'+(v&&!mines[key]?' disabled':'')+' aria-label="Row '+(r+1)+' column '+(k+1)+(v?(mines[key]?' error':' '+cnt(r,k)+' nearby'):flag[key]?' flagged':' hidden')+'">'+t+'</button>'}).join('')+'</div>',{mode:function(){flagMode=!flagMode;draw()},c:function(v){tap(v)}})}
  function tap(v){if(over)return;var p=v.split(',').map(Number),key=v;if(flagMode){if(!rev[key]){flag[key]=!flag[key];if(!flag[key])delete flag[key]}return draw()}if(flag[key])return;if(!mines)place(p[0],p[1]);if(mines[key]){rev[key]=true;over=true;Object.keys(mines).forEach(function(x){rev[x]=true});draw();c.miss();return c.end(false,'You opened a hidden error.')}reveal(p[0],p[1]);c.good();if(N*N-M-Object.keys(rev).length===0)return c.end(true,'Every clean cell is revealed.');draw()}
  c.auto=function(){if(!mines)return tap('4,4');for(var r=0;r<N;r++)for(var k=0;k<N;k++){var key=r+','+k;if(!rev[key]&&!mines[key])return tap(key)}};
  draw();
};
/* ---------- Adventure Arena ---------- */
G['PL108-046']=function(c){
  var rooms=c.pack.rooms,qs=shuffle(c.pack.quiz,c.r),qi=0,room=0,digits=rooms.map(function(){return Math.floor(c.r()*10)}),items=[];
  function next(){if(room>=rooms.length)return door();
    c.draw('<p><strong>'+esc(rooms[room].name)+'</strong> · room '+(room+1)+' / '+rooms.length+' · items: '+(items.join(', ')||'none')+'</p><p class="muted">'+esc(rooms[room].text)+'</p><div id="ask"></div>');
    c.ask(c.$('#ask'),mix(qs[qi++%qs.length],c.r),function(ok){if(ok){items.push(rooms[room].item+' (digit '+digits[room]+')');c.say('The lock opens. You take '+rooms[room].item+'. Code digit: '+digits[room]);room++;next()}else{c.penalty(5);c.say('The lock stays shut. Another challenge appears.');next()}})}
  function door(){c.draw('<p>Final door. Enter the '+rooms.length+'-digit code from the digits you collected, in room order.</p><p class="muted">'+items.map(esc).join(' · ')+'</p><label>Code <input id="code" inputmode="numeric" maxlength="'+rooms.length+'" autocomplete="off"></label> <button class="btn primary" data-a="go">Open</button>',{go:function(){var v=c.$('#code').value.replace(/\D/g,'');if(v===digits.join(''))return c.end(true,'You escaped through the final door.');c.miss();c.penalty(5);c.say('Wrong code.');}});}
  c.auto=function(){var ak=c.body.querySelector('.askgo');if(ak)return ak.click();if(c.body.querySelector('.quizopt'))return c.curAsk.answer(c.curAsk.right());var i=c.$('#code');if(i){i.value=digits.join('');c.body.querySelector('[data-a=go]').click()}};
  next();
};
G['PL108-050']=function(c){
  var N=7,walls={},vis={};
  function key(r,k){return r+','+k}
  (function carve(r,k){vis[key(r,k)]=1;shuffle([[0,1],[1,0],[0,-1],[-1,0]],c.r).forEach(function(d){var rr=r+d[0],kk=k+d[1];if(rr<0||kk<0||rr>=N||kk>=N||vis[key(rr,kk)])return;walls[key(r,k)+'>'+key(rr,kk)]=1;walls[key(rr,kk)+'>'+key(r,k)]=1;carve(rr,kk)})})(0,0);
  function open(a,b){return!!walls[a+'>'+b]}
  var q=[[0,0]],prev={'0,0':null};while(q.length){var cu=q.shift();[[0,1],[1,0],[0,-1],[-1,0]].forEach(function(d){var rr=cu[0]+d[0],kk=cu[1]+d[1],k2=key(rr,kk);if(rr<0||kk<0||rr>=N||kk>=N||prev[k2]!==undefined||!open(key(cu[0],cu[1]),k2))return;prev[k2]=key(cu[0],cu[1]);q.push([rr,kk])})}
  var path=[],cur2=key(N-1,N-1);while(cur2){path.unshift(cur2);cur2=prev[cur2]}
  var gates={};[Math.floor(path.length*.25),Math.floor(path.length*.5),Math.floor(path.length*.75)].forEach(function(i){gates[path[i]]=true});
  var pos={r:0,c:0},qs=shuffle(c.pack.quiz,c.r),qi=0,cleared={},moves=0;
  function draw(){c.draw('<p>Use the arrow keys or buttons to reach ★. Locked cells (🔒) need a correct answer. Moves: '+moves+'</p><div style="display:grid;grid-template-columns:repeat('+N+',44px);gap:0">'+Array.from({length:N*N},function(_,i){var r=Math.floor(i/N),k=i%N,kk=key(r,k),b=function(dr,dc){var rr=r+dr,cc=k+dc;return(rr<0||cc<0||rr>=N||cc>=N||!open(kk,key(rr,cc)))?'2px solid #1f3b44':'2px solid transparent'};
      return'<div style="width:44px;height:44px;display:grid;place-items:center;box-sizing:border-box;border-top:'+b(-1,0)+';border-bottom:'+b(1,0)+';border-left:'+b(0,-1)+';border-right:'+b(0,1)+';'+(pos.r===r&&pos.c===k?'background:#cfe8ea;':'')+'" aria-label="Row '+(r+1)+' column '+(k+1)+(gates[kk]&&!cleared[kk]?' locked':'')+(pos.r===r&&pos.c===k?' you are here':'')+(r===N-1&&k===N-1?' exit':'')+'">'+(pos.r===r&&pos.c===k?'●':(r===N-1&&k===N-1)?'★':gates[kk]&&!cleared[kk]?'🔒':'')+'</div>'}).join('')+'</div><div class="pager" style="justify-content:flex-start"><button class="btn" data-a="m" data-v="u">↑</button><button class="btn" data-a="m" data-v="l">←</button><button class="btn" data-a="m" data-v="d">↓</button><button class="btn" data-a="m" data-v="r">→</button></div><div id="ask"></div>',{m:function(v){move(v)}})}
  function move(v){var d={u:[-1,0],d:[1,0],l:[0,-1],r:[0,1]}[v],rr=pos.r+d[0],cc=pos.c+d[1];if(rr<0||cc<0||rr>=N||cc>=N||!open(key(pos.r,pos.c),key(rr,cc)))return c.say('A wall blocks that way.');var kk=key(rr,cc);
    if(gates[kk]&&!cleared[kk]){c.draw('<p>The gate at row '+(rr+1)+', column '+(cc+1)+' is locked.</p><div id="ask"></div>');return c.ask(c.$('#ask'),mix(qs[qi++%qs.length],c.r),function(ok){if(ok){cleared[kk]=true;pos={r:rr,c:cc};moves++}else{c.penalty(5);c.say('The gate stays locked. Step back and try again.')}after()})}
    pos={r:rr,c:cc};moves++;after()}
  function after(){if(pos.r===N-1&&pos.c===N-1)return c.end(true,'You reached the exit in '+moves+' moves.');draw()}
  c.key(function(e){var m={ArrowUp:'u',ArrowDown:'d',ArrowLeft:'l',ArrowRight:'r'}[e.key];if(m&&c.body.querySelector('[data-a=m]')){e.preventDefault();move(m)}});
  c.auto=function(){var ak=c.body.querySelector('.askgo');if(ak)return ak.click();if(c.body.querySelector('.quizopt'))return c.curAsk.answer(c.curAsk.right());var here=key(pos.r,pos.c),i=path.indexOf(here),nx=path[i+1].split(',').map(Number);move(nx[0]>pos.r?'d':nx[0]<pos.r?'u':nx[1]>pos.c?'r':'l')};
  draw();
};
G['PL108-053']=function(c){
  var days=c.pack.island.days,res={time:8,budget:8,morale:8},day=0,names={time:'Time',budget:'Budget',morale:'Morale'};
  function bars(){return Object.keys(res).map(function(k){return esc(names[k])+': <strong>'+res[k]+'</strong>'}).join(' · ')}
  function next(){if(day>=days.length){var s=Math.round(100*(res.time+res.budget+res.morale)/24);c.setScore(Math.min(100,s));return c.end(true,'Rescue arrived with '+bars().replace(/<[^>]+>/g,'')+'.')}
    var d=days[day];c.draw('<p><strong>Day '+(day+1)+' / '+days.length+'</strong> · '+bars()+'</p><p>'+esc(d.text)+'</p>'+d.options.map(function(o,i){return'<button class="quizopt" data-a="o" data-v="'+i+'">'+esc(o.t)+' <span class="small muted">('+['time','budget','morale'].map(function(k,j){return(o.d[j]>0?'+':'')+o.d[j]+' '+names[k].toLowerCase()}).join(', ')+')</span></button>'}).join(''),{o:function(v){choose(Number(v))}})}
  function choose(i){var o=days[day].options[i];['time','budget','morale'].forEach(function(k,j){res[k]+=o.d[j]});c.good();c.say(o.why);var dead=Object.keys(res).filter(function(k){return res[k]<=0});if(dead.length)return c.end(false,names[dead[0]]+' ran out on day '+(day+1)+'.');day++;next()}
  c.auto=function(){var d=days[day];var best=0,bs=-1e9;d.options.forEach(function(o,i){var s=Math.min.apply(null,['time','budget','morale'].map(function(k,j){return res[k]+o.d[j]}))*10+o.d[0]+o.d[1]+o.d[2];if(s>bs){bs=s;best=i}});choose(best)};
  next();
};
/* ---------- Arcade Arena ---------- */
G['PL108-055']=function(c){
  var set=pick(c.pack.whack,1,c.r)[0],spawns=24,n=0,hits=0,bad=0,cur=null,h=null;
  function items(){var good=c.r()<.55;var arr=good?set.good:set.bad;return{t:arr[Math.floor(c.r()*arr.length)],good:good}}
  function spawn(){if(n>=spawns)return fin();n++;var cell=Math.floor(c.r()*9),it=items();cur={cell:cell,it:it,hit:false};draw();
    if(!c.accessible)h=c.after(1300,function(){if(cur&&!cur.hit&&cur.it.good){c.miss();c.say('Missed: '+cur.it.t)}spawn()})}
  function draw(){c.draw('<p><strong>'+esc(set.prompt)+'</strong></p><p>Target '+n+' / '+spawns+' · hits '+hits+' · wrong hits '+bad+(c.accessible?' · untimed: targets wait for you':'')+'</p><div style="display:grid;grid-template-columns:repeat(3,104px);gap:8px">'+Array.from({length:9},function(_,i){var on=cur&&cur.cell===i&&!cur.hit;return'<button class="btn" style="height:64px;font-size:12px'+(on?';background:#fff3d6;border-color:#c98a00':'')+'" data-a="w" data-v="'+i+'"'+(on?'':' tabindex="-1" aria-hidden="true"')+'>'+(on?esc(cur.it.t):'')+'</button>'}).join('')+'</div>'+(c.accessible?'<button class="btn" data-a="skip">Skip this target</button>':''),{w:function(v){hit(Number(v))},skip:function(){if(cur&&cur.it.good){c.miss()}spawn()}})}
  function hit(i){if(!cur||cur.hit||cur.cell!==i)return;cur.hit=true;if(h)c.untick(h);if(cur.it.good){hits++;c.good()}else{bad++;c.miss();c.penalty(4)}spawn()}
  function fin(){var ok=hits>=9&&bad<=4;c.setScore(Math.max(0,hits*8-bad*4));c.end(ok,hits+' valid hits and '+bad+' wrong hits. Target: at least 9 hits with at most 4 wrong.')}
  c.auto=function(){if(cur&&cur.it.good)hit(cur.cell);else if(cur){var skipB=c.$('[data-a=skip]');if(skipB)skipB.click();else{spawn()}}};
  spawn();
};
G['PL108-056']=function(c){
  var set=pick(c.pack.whack,1,c.r)[0],lanes=3,lane=1,lives=3,caught=0,target=8,item=null,y=0,speed=c.accessible?1.1:2.6,seq=0;
  function spawn(){var good=c.r()<.55,arr=good?set.good:set.bad;item={t:arr[Math.floor(c.r()*arr.length)],good:good,lane:Math.floor(c.r()*lanes)};y=0;render()}
  function render(){var e=c.$('#fa');if(!e){c.draw('<p><strong>'+esc(set.prompt)+'</strong></p><p id="fst"></p><div id="fa" style="position:relative;height:260px;border:1px solid var(--line);border-radius:12px;overflow:hidden"></div><div class="pager" style="justify-content:flex-start"><button class="btn" data-a="l">← Left</button><button class="btn" data-a="r">Right →</button></div>',{l:function(){lane=Math.max(0,lane-1);render()},r:function(){lane=Math.min(lanes-1,lane+1);render()}});e=c.$('#fa')}
    c.$('#fst').textContent='Caught '+caught+' / '+target+' · lives '+lives;
    e.innerHTML=(item?'<div style="position:absolute;left:'+(item.lane*33.3+2)+'%;top:'+y+'%;width:30%;text-align:center;font-size:12px;background:#fff3d6;border:1px solid #c98a00;border-radius:8px;padding:6px 2px">'+esc(item.t)+'</div>':'')+'<div style="position:absolute;bottom:4px;left:'+(lane*33.3+2)+'%;width:30%;text-align:center;background:#1f6f78;color:#fff;border-radius:8px;padding:6px">▲ catch</div>'}
  function stepFn(){if(!item)return;y+=speed;if(y<78){render();return}var ok=item.lane===lane;if(ok&&item.good){caught++;c.good()}else if(ok&&!item.good){lives--;c.miss();c.penalty(10);c.say('Wrong item caught: '+item.t)}else if(!ok&&item.good){c.miss();c.say('Missed: '+item.t)}
    if(caught>=target)return c.end(true,'You caught '+target+' valid items.');if(lives<=0)return c.end(false,'You ran out of lives.');spawn()}
  c.key(function(e){if(e.key==='ArrowLeft'){e.preventDefault();lane=Math.max(0,lane-1);render()}if(e.key==='ArrowRight'){e.preventDefault();lane=Math.min(lanes-1,lane+1);render()}});
  c.every(60,stepFn);
  c.auto=function(){if(!item)return;if(!item.good){lane=(item.lane+1)%lanes}else lane=item.lane;y=100;stepFn()};
  spawn();
};
G['PL108-059']=function(c){
  var sets=pick(c.pack.whack,4,c.r),round=0,lives=3,popped={},left=0,h=null,tl=0;
  function next(){if(round>=sets.length)return c.end(true,'All '+sets.length+' balloon rounds cleared.');var s=sets[round],bl=shuffle(s.good.slice(0,4).map(function(t){return{t:t,good:true}}).concat(s.bad.slice(0,3).map(function(t){return{t:t,good:false}})),c.r);popped={};left=bl.filter(function(x){return x.good}).length;tl=c.accessible?0:25;
    c.draw('<p><strong>Round '+(round+1)+' / '+sets.length+'</strong> · '+esc(s.prompt)+' · lives '+lives+(tl?' · <span id="bt">'+tl+'</span>s':'')+'</p><div style="display:flex;flex-wrap:wrap;gap:12px">'+bl.map(function(b,i){return'<button class="btn" style="border-radius:50% 50% 46% 46%;width:96px;height:112px;font-size:12px;background:#fde7ef" data-a="b" data-v="'+i+'">'+esc(b.t)+'</button>'}).join('')+'</div>',{b:function(v,el){pop(bl,Number(v),el)}});
    c.cur={bl:bl};if(tl){if(h)c.untick(h);h=c.every(1000,function(){tl--;var e=c.$('#bt');if(e)e.textContent=tl;if(tl<=0){lives--;c.penalty(10);if(lives<=0)return c.end(false,'You ran out of lives.');next()}})}}
  function pop(bl,i,el){if(popped[i])return;popped[i]=true;el.disabled=true;if(bl[i].good){left--;c.good();el.style.background='#e9f6ee';if(left<=0){if(h)c.untick(h);round++;c.say('Round cleared.');next()}}else{lives--;c.miss();c.penalty(10);el.style.background='#fdeee8';c.say('Wrong balloon.');if(lives<=0)c.end(false,'You ran out of lives.');else{c.draw=c.draw}}}
  c.auto=function(){var bl=c.cur.bl;for(var i=0;i<bl.length;i++)if(bl[i].good&&!popped[i]){c.body.querySelectorAll('[data-a=b]')[i].click();return}};
  next();
};

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

/* ---------- Visual Arena ---------- */
G['PL108-093']=function(c){
  var d=c.pack.zones,place={},sel=null,items=shuffle(d.items,c.r);
  function draw(){c.draw('<p>Click an object, then the zone where it belongs. Place all '+items.length+' objects validly.</p><div class="pager" style="justify-content:flex-start;flex-wrap:wrap">'+items.filter(function(x){return place[x.t]===undefined}).map(function(x){return'<button class="btn" style="'+(sel===x.t?'outline:2px solid #1f6f78':'')+'" data-a="o" data-v="'+esc(x.t)+'">'+esc(x.t)+'</button>'}).join('')+'</div><div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px">'+d.zones.map(function(z,zi){return'<button class="btn" style="min-height:96px;text-align:left;align-items:flex-start" data-a="z" data-v="'+zi+'"><strong>'+esc(z)+'</strong><br><span class="small">'+items.filter(function(x){return place[x.t]===zi}).map(function(x){return esc(x.t)}).join(', ')+'</span></button>'}).join('')+'</div>',{o:function(v){sel=v;draw()},z:function(v){drop(Number(v))}})}
  function drop(z){if(sel===null)return c.say('Choose an object first.');var it=items.find(function(x){return x.t===sel});if(it.zone===z){place[sel]=z;c.good();c.say('Correct: '+it.why);sel=null;if(items.every(function(x){return place[x.t]!==undefined}))return c.end(true,'The layout is valid.')}else{c.miss();c.penalty(6);c.say('That zone does not fit: '+it.why)}draw()}
  c.auto=function(){var it=items.find(function(x){return place[x.t]===undefined});sel=it.t;drop(it.zone)};
  draw();
};
G['PL108-097']=function(c){
  var N=3,t=[1,2,3,4,5,6,7,8,0],labels=c.pack.stepLabels,moves=0;
  function nbs(z){var r=Math.floor(z/N),k=z%N,o=[];if(r>0)o.push(z-N);if(r<N-1)o.push(z+N);if(k>0)o.push(z-1);if(k<N-1)o.push(z+1);return o}
  for(var i=0;i<60;i++){var z=t.indexOf(0),n=nbs(z),pick1=n[Math.floor(c.r()*n.length)];t[z]=t[pick1];t[pick1]=0}
  if(t.every(function(v,i){return v===(i+1)%9}))t=[1,2,3,4,5,6,7,0,8];
  function solved(){return t.every(function(v,i){return v===(i+1)%9})}
  function draw(){c.draw('<p>Slide tiles next to the gap to put the steps in order 1 to 8. Moves: <strong>'+moves+'</strong></p><div style="display:grid;grid-template-columns:repeat(3,96px);gap:6px">'+t.map(function(v,i){return v?'<button class="btn" style="height:84px;font-size:12px" data-a="s" data-v="'+i+'" aria-label="Tile '+v+': '+esc(labels[v-1])+'">'+v+'<br>'+esc(labels[v-1])+'</button>':'<div aria-label="Gap"></div>'}).join('')+'</div>',{s:function(v){slide(Number(v))}})}
  function slide(i){var z=t.indexOf(0);if(nbs(z).indexOf(i)<0)return c.say('That tile is not next to the gap.');t[z]=t[i];t[i]=0;moves++;c.good();c.setScore(100-Math.max(0,moves-24)*2);if(solved())return c.end(true,'Solved in '+moves+' moves.');draw()}
  c.key(function(e){var z=t.indexOf(0),r=Math.floor(z/N),k=z%N,m={ArrowUp:r<N-1?z+N:-1,ArrowDown:r>0?z-N:-1,ArrowLeft:k<N-1?z+1:-1,ArrowRight:k>0?z-1:-1}[e.key];if(m>=0&&m!==undefined){e.preventDefault();slide(m)}});
  c.auto=function(){/* BFS solve */var key=function(a){return a.join('')},start=t.slice(),goal=[1,2,3,4,5,6,7,8,0],seen={},q=[[start,[]]];seen[key(start)]=1;var plan=null;while(q.length&&!plan){var cur=q.shift(),a=cur[0],z=a.indexOf(0);for(var n of nbs(z)){var b=a.slice();b[z]=b[n];b[n]=0;var kk=key(b);if(seen[kk])continue;seen[kk]=1;var p=cur[1].concat([n]);if(kk===key(goal)){plan=p;break}q.push([b,p])}}if(plan){plan.forEach(function(n){if(!c.done)slide(n)})}};
  draw();
};
G['PL108-098']=function(c){
  var g=c.pack.graph,pos=g.start,visited={},path=[g.start],visited0={};visited[g.start]=true;
  function can(to){return(g.edges[pos]||[]).indexOf(to)>=0}
  function draw(){var next=(g.edges[pos]||[]);c.draw('<p>Move along the connections from <strong>'+esc(g.nodes[pos])+'</strong>. Rule: '+esc(g.rule)+'</p><p><strong>Route so far:</strong> '+path.map(function(n){return esc(g.nodes[n])}).join(' → ')+'</p><p>Targets: '+g.targets.map(function(t){return(visited[t]?'<s>':'<strong>')+esc(g.nodes[t])+(visited[t]?'</s>':'</strong>')}).join(' · ')+'</p><div class="pager" style="justify-content:flex-start;flex-wrap:wrap">'+next.map(function(n){return'<button class="btn primary" data-a="go" data-v="'+n+'">Go to '+esc(g.nodes[n])+'</button>'}).join('')+'<button class="btn" data-a="back"'+(path.length>1?'':' disabled')+'>Step back</button></div>',{go:function(v){move(Number(v))},back:function(){path.pop();pos=path[path.length-1];draw()}})}
  function move(n){if(!can(n))return;var req=g.requires[n];if(req!==undefined&&!visited[req]){c.miss();c.penalty(10);c.say('Blocked: '+g.nodes[req]+' must be visited first.');return draw()}pos=n;path.push(n);visited[n]=true;c.good();if(g.targets.every(function(t){return visited[t]}))return c.end(true,'Both targets reached under the route rules.');draw()}
  c.auto=function(){var p=g.solution,k=path.length-1;if(k>=p.length)return;move(p[k])};
  draw();
};
/* ---------- Numbers Arena ---------- */
G['PL108-100']=function(c){
  var items=pick(c.pack.calc,8,c.r),i=0,right=0;
  function next(){if(i>=items.length){var pct=Math.round(100*right/items.length);c.setScore(pct);return c.end(pct>=75,right+' of '+items.length+' correct ('+pct+'%). Target: 75%.')}var k=items[i];
    c.draw('<p><strong>Problem '+(i+1)+' / '+items.length+'</strong></p><div class="notice">'+esc(k.rule)+'</div><h3>'+esc(k.q)+'</h3><label>Your answer <input id="ans" inputmode="decimal" autocomplete="off" style="padding:8px"></label> <button class="btn primary" data-a="go">Check</button><div id="fb"></div>',{go:check});var inp=c.$('#ans');inp.focus();inp.onkeydown=function(e){if(e.key==='Enter')check()}}
  function check(){var k=items[i],v=parseFloat(String(c.$('#ans').value).replace(/,/g,''));if(isNaN(v))return c.say('Enter a number.');var ok=Math.abs(v-k.a)<=(k.tol||0.01);if(ok){right++;c.good()}else{c.miss()}c.$('#fb').innerHTML='<p>'+(ok?'Correct. ':'Not quite. The answer is '+fmt(k.a)+'. ')+esc(k.why)+'</p><button class="btn primary" id="go">Continue</button>';c.body.querySelector('[data-a=go]').disabled=true;c.$('#ans').disabled=true;c.$('#go').onclick=function(){i++;next()};c.$('#go').focus()}
  c.auto=function(){var go=c.$('#go');if(go)return go.click();c.$('#ans').value=items[i].a;check()};
  next();
};
G['PL108-104']=function(c){
  var d=c.pack.optimize,st={sim:1,rules:1,rev:0},tries=0,best=1e9,cfgs=[];
  function det(s){return Math.min(100,d.base+d.simGain*s.sim+d.ruleGain*s.rules+d.revGain*s.rev)}
  function cost(s){return s.sim*d.simCost+s.rules*d.ruleCost+s.rev*d.revCost}
  for(var a=0;a<=d.maxSim;a++)for(var b=0;b<=d.maxRules;b++)for(var e=0;e<=d.maxRev;e++){var s={sim:a,rules:b,rev:e};if(det(s)>=d.target)best=Math.min(best,cost(s))}
  var limit=Math.round(best*1.15);
  function draw(){c.draw('<p>Choose how much checking to buy. Detection must reach <strong>'+d.target+'%</strong> at a cost no higher than <strong>'+fmt(limit)+'</strong>.</p>'+[['sim','Simulation runs',d.simCost,d.maxSim],['rules','Validation rules',d.ruleCost,d.maxRules],['rev','Human reviewers',d.revCost,d.maxRev]].map(function(r){return'<p><label>'+r[1]+' ('+fmt(r[2])+' each) <input type="range" min="0" max="'+r[3]+'" value="'+st[r[0]]+'" data-k="'+r[0]+'" style="vertical-align:middle"> <strong id="v'+r[0]+'">'+st[r[0]]+'</strong></label></p>'}).join('')+'<p>Detection: <strong id="dt">'+det(st)+'%</strong> · Cost: <strong id="ct">'+fmt(cost(st))+'</strong></p><button class="btn primary" data-a="go">Submit plan</button>',{go:submit});c.body.querySelectorAll('input[type=range]').forEach(function(x){x.oninput=function(){st[x.dataset.k]=Number(x.value);c.$('#v'+x.dataset.k).textContent=x.value;c.$('#dt').textContent=det(st)+'%';c.$('#ct').textContent=fmt(cost(st))}})}
  function submit(){tries++;if(det(st)>=d.target&&cost(st)<=limit){c.good();c.setScore(Math.max(40,100-Math.round(100*(cost(st)-best)/best)));return c.end(true,'Detection '+det(st)+'% at cost '+fmt(cost(st))+'.')}c.miss();c.penalty(8);c.say(det(st)<d.target?'Detection is below the target.':'The plan is valid but costs too much.');if(tries>=8)return c.end(false,'No valid low-cost plan found in 8 tries.');draw()}
  c.auto=function(){var bs=null,bc=1e9;for(var a=0;a<=d.maxSim;a++)for(var b=0;b<=d.maxRules;b++)for(var e=0;e<=d.maxRev;e++){var s={sim:a,rules:b,rev:e};if(det(s)>=d.target&&cost(s)<bc){bc=cost(s);bs=s}}st=bs;submit()};
  draw();
};
G['PL108-106']=function(c){
  var rounds=pick(c.pack.percent,5,c.r),i=0,me=0,rival=0;
  function next(){if(i>=rounds.length){c.setScore(Math.round(100*me/rounds.length));return c.end(me>rival,'You '+me+' – Rival '+rival+(me>rival?'.':' (you must win more rounds than the rival).'))}var k=rounds[i];
    c.draw('<p><strong>Round '+(i+1)+' / '+rounds.length+'</strong> · You '+me+' – Rival '+rival+'</p><div class="notice">'+esc(k.rule)+'</div><h3>'+esc(k.q)+'</h3><div>'+k.opts.map(function(o,j){return'<button class="quizopt" data-a="o" data-v="'+j+'">'+esc(o)+'</button>'}).join('')+'</div><div id="fb"></div>',{o:function(v){pickp(Number(v))}})}
  function pickp(j){var k=rounds[i],ok=j===k.a,rv=(i%2===0);if(ok){me++;c.good()}else c.miss();if(rv)rival++;c.body.querySelectorAll('[data-a=o]').forEach(function(b,q){b.disabled=true;if(q===k.a)b.classList.add('correct');else if(q===j)b.classList.add('wrong')});c.$('#fb').innerHTML='<p>'+(ok?'Correct. ':'Not quite. ')+esc(k.why)+' Rival '+(rv?'scored':'missed')+' this round.</p><button class="btn primary" id="go">Next round</button>';c.$('#go').onclick=function(){i++;next()};c.$('#go').focus()}
  c.auto=function(){var go=c.$('#go');if(go)return go.click();pickp(rounds[i].a)};
  next();
};

/* ===== Wave 2 helpers ===== */
var INP='padding:8px;border:1px solid var(--line);border-radius:8px;font-size:14px';
function nq(c){if(!c._qs){c._qs=shuffle(c.pack.quiz,c.r);c._qi=0}var q=c._qs[c._qi%c._qs.length];c._qi++;return mix(q,c.r)}
function dq(c){var P=c.pack.pairs;if(!c._dp){c._dp=shuffle(P,c.r);c._di=0}var p=c._dp[c._di%P.length];c._di++;
  var o=shuffle([{t:p[0],ok:true}].concat(shuffle(P.filter(function(x){return x[0]!==p[0]}),c.r).slice(0,3).map(function(x){return{t:x[0],ok:false}})),c.r);
  return{q:'Which term means: '+p[1]+'?',why:p[0]+': '+p[1]+'.',opts:o}}
function tq(c){var T=c.pack.tf;if(!c._tp){c._tp=shuffle(T,c.r);c._ti=0}var t=c._tp[c._ti%T.length];c._ti++;return{q:'True or false: '+t[0],why:t[2],opts:[{t:'True',ok:t[1]},{t:'False',ok:!t[1]}]}}
function pq(c){var P=c.pack.percent;if(!c._pp){c._pp=shuffle(P,c.r);c._pi=0}var p=c._pp[c._pi%P.length];c._pi++;return{q:p.rule+' '+p.q,why:p.why,opts:p.opts.map(function(t,i){return{t:t,ok:i===p.a}})}}
function anyq(c){return[nq,dq,tq,pq][Math.floor(c.r()*4)](c)}
function aa(c){if(c.$('#ask')&&c.curAsk&&!c.$('.askgo')){c.curAsk.answer(c.curAsk.right());return true}return false}
function num(s){return Number(String(s).replace(/,|\s/g,'').replace(/−/g,'-'))}
function clickIn(c,sel){var b=c.$(sel);if(b&&!b.disabled){b.click();return true}return false}

/* ---------- Quiz Arena ---------- */
G['PL108-003']=function(c){
  var B=c.pack.jeopardy,vals=[100,200,300],used={},picks=0,pts=0,MAXP=8,TARGET=1000;
  function board(){c.draw('<p><strong>Points '+pts+' / '+TARGET+'</strong> · picks left '+(MAXP-picks)+'. A wrong answer costs half the stake.</p><div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px">'+B.map(function(x){return'<strong class="small">'+esc(x.cat)+'</strong>'}).join('')+
    vals.map(function(v,vi){return B.map(function(x,ci){var k=ci+'-'+vi;return'<button class="btn primary" data-a="pick" data-v="'+k+'"'+(used[k]?' disabled':'')+'>'+v+'</button>'}).join('')}).join('')+'</div>',{pick:pick})}
  function pick(k){used[k]=1;picks++;var ci=Number(k.split('-')[0]),vi=Number(k.split('-')[1]),v=vals[vi];
    c.draw('<p><strong>'+esc(B[ci].cat)+'</strong> for '+v+'</p><div id="ask"></div>');
    c.ask(c.$('#ask'),mix(B[ci].qs[vi],c.r),function(ok){pts+=ok?v:-v/2;c.setScore(Math.max(0,pts)*100/TARGET);
      if(pts>=TARGET)return c.end(true,pts+' points in '+picks+' picks.');if(picks>=MAXP)return c.end(false,'Out of picks with '+pts+' points.');board()},{seconds:20})}
  c.auto=function(){if(aa(c))return;var bs=Array.from(c.body.querySelectorAll('[data-a=pick]:not([disabled])'));if(!bs.length)return;bs.sort(function(a,b){return Number(b.textContent)-Number(a.textContent)});bs[0].click()};
  board();
};
G['PL108-004']=function(c){
  var spins=0,right=0,N=8,segs=[['Quiz',nq],['Term',dq],['True or false',tq],['Numbers',pq]],last='';
  function wheel(){c.draw('<p><strong>Spin '+(spins+1)+' / '+N+'</strong> · correct '+right+'</p><p>'+segs.map(function(s){return'<span class="pill">'+s[0]+'</span>'}).join(' ')+'</p><button class="btn primary" data-a="spin">Spin the wheel</button>'+(last?'<p class="small muted">Last spin: '+esc(last)+'</p>':''),{spin:spin})}
  function spin(){var s=segs[Math.floor(c.r()*segs.length)];last=s[0];c.draw('<p>The wheel landed on <strong>'+s[0]+'</strong>.</p><div id="ask"></div>');
    c.ask(c.$('#ask'),s[1](c),function(ok){if(ok)right++;spins++;c.setScore(100*right/N);if(spins>=N)return c.end(right>=6,right+' of '+N+' correct. Target: 6.');wheel()},{seconds:20})}
  c.auto=function(){if(aa(c))return;clickIn(c,'[data-a=spin]')};wheel();
};
G['PL108-006']=function(c){
  var left=10,round=0,sched=[2,2,1,1,1,1,1],shield=true;
  function nextRound(){if(round>=sched.length)return c.end(true,'You are the last learner standing.');
    c.draw('<p><strong>Round '+(round+1)+' / '+sched.length+'</strong> · learners left <b>'+left+'</b> · second chance '+(shield?'available':'used')+'</p><div id="ask"></div>');
    c.ask(c.$('#ask'),nq(c),function(ok){if(!ok){if(shield){shield=false;c.penalty(15);c.say('Second chance used.')}else return c.end(false,'You were eliminated in round '+(round+1)+'.')}
      left-=sched[round];round++;nextRound()},{seconds:20})}
  c.auto=function(){aa(c)};nextRound();
};
G['PL108-007']=function(c){
  var pts=100,n=0,N=6,T=250;
  function wager(){c.draw('<p><strong>Question '+(n+1)+' / '+N+'</strong> · points '+pts+' · target '+T+'</p><p>Choose your wager:</p><div class="pager" style="justify-content:flex-start">'+[10,25,50].map(function(w){return'<button class="btn" data-a="w" data-v="'+w+'"'+(w>pts?' disabled':'')+'>Risk '+w+'</button>'}).join('')+'</div>',{w:function(v){ask(Number(v))}})}
  function ask(w){c.draw('<p>Wager: '+w+'</p><div id="ask"></div>');c.ask(c.$('#ask'),nq(c),function(ok){pts+=ok?w:-w;n++;c.setScore(pts*100/T);
    if(pts<=0)return c.end(false,'You lost all your points.');if(n>=N)return c.end(pts>=T,'Final points '+pts+'. Target '+T+'.');wager()},{seconds:20})}
  c.auto=function(){if(aa(c))return;var bs=c.body.querySelectorAll('[data-a=w]:not([disabled])');if(bs.length)bs[bs.length-1].click()};wager();
};
G['PL108-008']=function(c){
  var P=pick(c.pack.pairs,9,c.r),mark=[],miss=0,tgt=0,lines=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  function clue(){var open=P.map(function(_,i){return i}).filter(function(i){return!mark[i]});tgt=open[Math.floor(c.r()*open.length)];draw()}
  function draw(){c.draw('<p>Clue: <strong>'+esc(P[tgt][1])+'</strong></p><p class="small">Mistakes '+miss+' / 5. Click the term that matches the clue.</p><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">'+P.map(function(p,i){return'<button class="btn'+(mark[i]?' primary':'')+'" data-a="cell" data-v="'+i+'"'+(mark[i]?' disabled':'')+'>'+(mark[i]?'✓ ':'')+esc(p[0])+'</button>'}).join('')+'</div>',
    {cell:function(v){var i=Number(v);if(i===tgt){mark[i]=true;c.good();if(lines.some(function(l){return l.every(function(k){return mark[k]})}))return c.end(true,'Bingo with '+miss+' mistakes.');clue()}
      else{miss++;c.miss();c.setScore(100-miss*20);c.say('Not that one.');if(miss>=5)return c.end(false,'Five mistakes.');draw()}}})}
  c.auto=function(){clickIn(c,'[data-a=cell][data-v="'+tgt+'"]')};clue();
};
G['PL108-009']=function(c){
  var bosses=[['Typo Troll',3],['Alert Ogre',4],['Retro Dragon',5]],bi=0,hp=bosses[0][1],lives=3;
  function turn(){c.draw('<p><strong>'+esc(bosses[bi][0])+'</strong> · boss HP '+hp+' · your lives '+lives+'</p><div id="ask"></div>');
    c.ask(c.$('#ask'),nq(c),function(ok){if(ok){hp--;if(hp<=0){bi++;if(bi>=bosses.length)return c.end(true,'All three bosses defeated.');hp=bosses[bi][1];c.say(bosses[bi-1][0]+' defeated.')}}else{lives--;c.penalty(15);if(lives<=0)return c.end(false,'You ran out of lives.')}turn()},{seconds:20})}
  c.auto=function(){aa(c)};turn();
};

/* ---------- Word Arena ---------- */
function cwTable(X,mode,codes){var nums={},cols=X.rows[0].length;X.words.forEach(function(w){nums[w.r+','+w.c]=w.n});
  return'<div style="overflow:auto;max-width:100%"><div style="display:grid;grid-template-columns:repeat('+cols+',34px);gap:2px;width:max-content">'+X.rows.map(function(row,r){return row.split('').map(function(ch,k){if(ch==='.')return'<div style="width:34px;height:34px"></div>';
    var tag=mode==='code'?codes[ch]:(nums[r+','+k]||'');
    return'<div style="position:relative;width:34px;height:34px;border:1px solid #9bb3b6;border-radius:4px;background:#fff"><span style="position:absolute;top:1px;left:3px;font-size:9px;color:#456">'+tag+'</span><input class="cwi" maxlength="1" data-r="'+r+'" data-k="'+k+'" data-code="'+(mode==='code'?codes[ch]:'')+'" aria-label="row '+(r+1)+', column '+(k+1)+'" style="width:100%;height:100%;box-sizing:border-box;border:0;text-align:center;text-transform:uppercase;font-size:16px;padding:9px 0 0;background:transparent"></div>'}).join('')}).join('')+'</div></div>'}
G['PL108-010']=function(c){
  var X=c.pack.crossword;
  function list(d){return X.words.filter(function(w){return w.d===d}).sort(function(a,b){return a.n-b.n}).map(function(w){return'<li>'+w.n+'. '+esc(w.clue)+' ('+w.word.length+')</li>'}).join('')}
  c.draw(cwTable(X,'clue')+'<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px"><div><h4>Across</h4><ul class="small">'+list('A')+'</ul></div><div><h4>Down</h4><ul class="small">'+list('D')+'</ul></div></div><div class="pager" style="justify-content:flex-start"><button class="btn primary" data-a="check">Check</button><button class="btn" data-a="hint">Reveal one letter (−5)</button></div>',{check:check,hint:hint});
  function ins(){return Array.from(c.body.querySelectorAll('.cwi'))}
  function want(i){return X.rows[Number(i.dataset.r)][Number(i.dataset.k)]}
  function check(){var bad=0,empty=0;ins().forEach(function(i){var v=i.value.toUpperCase();if(!v){empty++;i.style.background='transparent'}else if(v!==want(i)){bad++;i.style.background='#fdeee8'}else i.style.background='#e9f6ee'});
    if(!bad&&!empty)return c.end(true,'Every word is correct.');if(bad){c.penalty(3);c.miss();c.say(bad+' wrong letter(s) are marked red.')}else c.say(empty+' cells are still empty.')}
  function hint(){var t=ins().find(function(i){return i.value.toUpperCase()!==want(i)});if(!t)return;t.value=want(t);t.style.background='#fff3d6';c.penalty(5);c.say('One letter revealed.')}
  c.auto=function(){ins().forEach(function(i){i.value=want(i)});check()};
};
G['PL108-014']=function(c){
  var S=pick(c.pack.anagram,4,c.r),ri=0,found=[],wrong=0;
  function draw(){var s=S[ri];c.draw('<p><strong>Round '+(ri+1)+' / '+S.length+'</strong> · letters <span style="font-size:22px;letter-spacing:6px">'+s.letters.split('').join(' ')+'</span></p><p class="small">Find 3 words of 3 or more letters using only these letters. Found: '+(found.join(', ')||'none yet')+' · mistakes '+wrong+' / 8</p><div class="pager" style="justify-content:flex-start"><input id="aw" maxlength="12" aria-label="your word" style="'+INP+'"><button class="btn primary" data-a="add">Add word</button></div>',{add:add})}
  function add(){var w=(c.$('#aw').value||'').trim().toUpperCase(),s=S[ri];if(found.indexOf(w)>=0){c.say('Already found.');return}
    if(s.words.indexOf(w)>=0){found.push(w);c.good();if(found.length>=3){ri++;found=[];if(ri>=S.length)return c.end(true,'All rounds cleared.')}draw()}
    else{wrong++;c.miss();c.penalty(5);c.say('Not a valid word for these letters.');if(wrong>=8)return c.end(false,'Too many invalid words.');draw()}}
  c.auto=function(){var s=S[ri],w=s.words.filter(function(x){return found.indexOf(x)<0})[0];c.$('#aw').value=w;add()};draw();
};
G['PL108-015']=function(c){
  var L=c.pack.ladder,P=pick(L.puzzles,3,c.r),pi=0,cur=[],words={};L.words.forEach(function(w){words[w]=1});
  function diff(a,b){var d=0;for(var i=0;i<a.length;i++)if(a[i]!==b[i])d++;return d}
  function start(){cur=[P[pi].start];draw()}
  function draw(){c.draw('<p><strong>Ladder '+(pi+1)+' / '+P.length+'</strong> · change one letter at a time to reach <b>'+P[pi].target+'</b></p><p style="font-size:18px">'+cur.join(' → ')+' → ?</p><div class="pager" style="justify-content:flex-start"><input id="lw" maxlength="4" aria-label="next word" style="'+INP+'"><button class="btn primary" data-a="step">Add step</button><button class="btn" data-a="undo">Undo</button><button class="btn" data-a="hint">Hint (−5)</button></div>',{step:step,undo:function(){if(cur.length>1)cur.pop();draw()},hint:function(){var p=P[pi].path;c.penalty(5);c.say(cur.every(function(w,i){return w===p[i]})?'Try '+p[cur.length]+'.':'Undo until you are back on a path, then try again.')}})}
  function step(w){w=(typeof w==='string'?w:(c.$('#lw').value||'')).trim().toUpperCase();var last=cur[cur.length-1];
    if(!words[w]||diff(w,last)!==1||cur.indexOf(w)>=0){c.miss();c.penalty(3);c.say('Each step must be a listed word that differs by exactly one letter.');return draw()}
    cur.push(w);c.good();if(w===P[pi].target){pi++;if(pi>=P.length)return c.end(true,'All ladders climbed.');return start()}draw()}
  c.auto=function(){step(P[pi].path[cur.length])};start();
};
G['PL108-016']=function(c){
  var W=pick(c.pack.words,8,c.r),i=0,err=0,hide=[];
  function start(){var w=W[i][0],idx=w.split('').map(function(_,j){return j});hide=shuffle(idx,c.r).slice(0,Math.max(2,Math.ceil(w.length/2)));draw()}
  function draw(){var w=W[i][0];c.draw('<p><strong>Term '+(i+1)+' / '+W.length+'</strong> · mistakes '+err+' / 5</p><p style="font-size:24px;letter-spacing:6px">'+w.split('').map(function(ch,j){return hide.indexOf(j)>=0?'_':ch}).join(' ')+'</p><p class="small">Clue: '+esc(W[i][1])+'</p><div class="pager" style="justify-content:flex-start"><input id="mw" aria-label="full term" style="'+INP+'"><button class="btn primary" data-a="chk">Check</button></div>',{chk:chk})}
  function chk(){var v=(c.$('#mw').value||'').trim().toUpperCase();if(v===W[i][0]){c.good();i++;if(i>=W.length)return c.end(true,'All terms completed with '+err+' mistakes.');return start()}
    err++;c.miss();c.penalty(8);c.say('Not quite; one more letter is revealed.');if(err>=5)return c.end(false,'Too many mistakes.');hide.pop();draw()}
  c.auto=function(){c.$('#mw').value=W[i][0];chk()};start();
};
G['PL108-017']=function(c){
  var M=pick(c.pack.crypto,2,c.r),mi=0,inv={},guess={},enc='';
  function start(){var A='ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''),sh,ok=false;while(!ok){sh=shuffle(A,c.r);ok=sh.every(function(x,k){return x!==A[k]})}
    var key={};inv={};A.forEach(function(a,k){key[a]=sh[k];inv[sh[k]]=a});enc=M[mi].split('').map(function(ch){return key[ch]||ch}).join('');guess={};draw()}
  function letters(){var o=[];enc.split('').forEach(function(ch){if(/[A-Z]/.test(ch)&&o.indexOf(ch)<0)o.push(ch)});return o.sort()}
  function dec(){return enc.split('').map(function(ch){return/[A-Z]/.test(ch)?(guess[ch]||'_'):ch}).join('')}
  function draw(){c.draw('<p><strong>Message '+(mi+1)+' / '+M.length+'</strong></p><p style="font-size:20px;letter-spacing:3px;word-break:break-word">'+enc+'</p><p id="dec" style="font-size:20px;letter-spacing:3px;color:var(--accent,#1f6f78);word-break:break-word">'+dec()+'</p><div style="display:flex;flex-wrap:wrap;gap:6px">'+letters().map(function(l){return'<label class="small">'+l+' = <input class="cg" data-l="'+l+'" maxlength="1" aria-label="cipher letter '+l+'" style="width:34px;text-align:center;text-transform:uppercase;'+INP+'"></label>'}).join('')+'</div><div class="pager" style="justify-content:flex-start"><button class="btn primary" data-a="chk">Check</button><button class="btn" data-a="hint">Reveal one letter (−5)</button></div>',{chk:chk,hint:hint});
    c.body.querySelectorAll('.cg').forEach(function(i){i.value=guess[i.dataset.l]||'';i.oninput=function(){guess[i.dataset.l]=i.value.toUpperCase();c.$('#dec').textContent=dec()}})}
  function chk(){var wrong=letters().filter(function(l){return guess[l]!==inv[l]});if(!wrong.length){mi++;c.good();if(mi>=M.length)return c.end(true,'Both messages decoded.');return start()}c.miss();c.penalty(3);c.say(wrong.length+' letter(s) are still wrong or empty.')}
  function hint(){var l=letters().find(function(x){return guess[x]!==inv[x]});if(!l)return;guess[l]=inv[l];c.penalty(5);draw()}
  c.auto=function(){letters().forEach(function(l){guess[l]=inv[l]});c.body.querySelectorAll('.cg').forEach(function(i){i.value=guess[i.dataset.l]});chk()};start();
};
G['PL108-018']=function(c){
  var X=c.pack.crossword,letters=[];X.rows.forEach(function(r){r.split('').forEach(function(ch){if(ch!=='.'&&letters.indexOf(ch)<0)letters.push(ch)})});
  var nums=shuffle(Array.from({length:26},function(_,i){return i+1}),c.r).slice(0,letters.length),codes={},rev={};letters.forEach(function(l,i){codes[l]=nums[i];rev[nums[i]]=l});
  var shown=shuffle(letters,c.r).slice(0,6).map(function(l){return codes[l]});
  c.draw('<p>Every number stands for one letter. Letters in the grid share the same number. '+shown.length+' are already given.</p>'+cwTable(X,'code',codes)+'<p class="small" id="ctab"></p><div class="pager" style="justify-content:flex-start"><button class="btn primary" data-a="check">Check</button><button class="btn" data-a="hint">Reveal one number (−5)</button></div>',{check:check,hint:hint});
  function ins(){return Array.from(c.body.querySelectorAll('.cwi'))}
  function want(i){return rev[Number(i.dataset.code)]}
  function sync(code,v){ins().forEach(function(i){if(Number(i.dataset.code)===code)i.value=v});tab()}
  function tab(){var m={};ins().forEach(function(i){if(i.value)m[i.dataset.code]=i.value.toUpperCase()});c.$('#ctab').textContent='Known: '+Object.keys(m).sort(function(a,b){return a-b}).map(function(k){return k+'='+m[k]}).join('  ')}
  ins().forEach(function(i){var code=Number(i.dataset.code);if(shown.indexOf(code)>=0){i.value=want(i);i.readOnly=true;i.style.background='#fff3d6'}i.oninput=function(){sync(code,i.value.toUpperCase())}});tab();
  function check(){var bad=0,empty=0;ins().forEach(function(i){var v=i.value.toUpperCase();if(!v){empty++}else if(v!==want(i)){bad++;i.style.background='#fdeee8'}else if(!i.readOnly)i.style.background='#e9f6ee'});
    if(!bad&&!empty)return c.end(true,'The codeword is complete.');if(bad){c.penalty(3);c.miss();c.say(bad+' wrong letter(s) are marked red.')}else c.say(empty+' cells are still empty.')}
  function hint(){var t=ins().find(function(i){return i.value.toUpperCase()!==want(i)});if(!t)return;sync(Number(t.dataset.code),want(t));c.penalty(5)}
  c.auto=function(){ins().forEach(function(i){i.value=want(i)});check()};
};

/* ---------- Board Arena ---------- */
G['PL108-020']=function(c){
  var T=[0,0],GOAL=16,gates={4:1,8:1,12:1},rolls=0,MAXR=26,die=0;
  function homeN(){return T.filter(function(x){return x>=GOAL}).length}
  function track(){return'<div style="display:flex;flex-wrap:wrap;gap:4px">'+Array.from({length:GOAL+1},function(_,s){var who=T.map(function(p,i){return p===s?'T'+(i+1):''}).join(' ');return'<span style="width:44px;height:40px;border:1px solid var(--line);border-radius:8px;text-align:center;font-size:11px;'+(gates[s]?'background:#fff3d6;':'')+(s===GOAL?'background:#e9f6ee;':'')+'">'+s+'<br><b>'+who+'</b></span>'}).join('')+'</div><p class="small muted">Yellow squares are challenge gates; square '+GOAL+' is home. A failed gate sends the token back 2 squares.</p>'}
  function draw(){c.draw('<p><strong>Rolls '+rolls+' / '+MAXR+'</strong> · tokens home '+homeN()+' / 2</p>'+track()+(die?'<p>You rolled <b>'+die+'</b>. Move which token?</p><div class="pager" style="justify-content:flex-start">'+T.map(function(p,i){return'<button class="btn primary" data-a="mv" data-v="'+i+'"'+(p>=GOAL?' disabled':'')+'>Token '+(i+1)+' (square '+p+')</button>'}).join('')+'</div>':'<button class="btn primary" data-a="roll">Roll the die</button>'),{roll:roll,mv:mv})}
  function roll(){rolls++;die=Math.floor(c.r()*6)+1;draw()}
  function mv(v){var i=Number(v);if(T[i]>=GOAL)return;T[i]=Math.min(GOAL,T[i]+die);die=0;
    if(gates[T[i]]){c.draw('<p>Token '+(i+1)+' reached a challenge gate.</p><div id="ask"></div>');return c.ask(c.$('#ask'),nq(c),function(ok){if(!ok)T[i]=Math.max(0,T[i]-2);after()},{seconds:20})}after()}
  function after(){c.setScore(100-rolls*2);if(homeN()===2)return c.end(true,'Both tokens are home after '+rolls+' rolls.');if(rolls>=MAXR)return c.end(false,'Out of rolls.');draw()}
  c.auto=function(){if(aa(c))return;if(clickIn(c,'[data-a=roll]'))return;var i=T[0]<=T[1]?0:1;if(T[i]>=GOAL)i=1-i;clickIn(c,'[data-a=mv][data-v="'+i+'"]')};draw();
};
G['PL108-021']=function(c){
  var M=c.pack.monopoly,S=M.squares,cash=M.start_cash,pos=0,own={},turn=0;
  function worth(){var w=cash;Object.keys(own).forEach(function(k){w+=S[k].cost});return w}
  function income(){var s=0;Object.keys(own).forEach(function(k){s+=S[k].income});return s}
  function hud(){return'<p><strong>Turn '+turn+' / '+M.turns+'</strong> · cash '+fmt(cash)+' · net worth <b>'+fmt(worth())+'</b> / '+fmt(M.target)+' · income per turn '+income()+'</p>'}
  function board(){return'<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px">'+S.map(function(s,i){return'<div style="border:1px solid var(--line);border-radius:8px;padding:6px;font-size:11px;background:'+(i===pos?'#d9f0f2':own[i]?'#e9f6ee':'transparent')+'"><b>'+esc(s.name)+'</b><br>'+(s.k==='asset'?(own[i]?'owned':'cost '+s.cost+' · +'+s.income):(s.k==='event'?'question':'payday +'+M.salary))+'</div>'}).join('')+'</div>'}
  function main(){c.draw(hud()+board()+'<p></p><button class="btn primary" data-a="roll">Roll and move</button>',{roll:roll})}
  function roll(){turn++;var inc=income();cash+=inc;var d=Math.floor(c.r()*6)+1,np=pos+d;if(np>=S.length){cash+=M.salary;np-=S.length}pos=np;land(d,inc)}
  function land(d,inc){var s=S[pos],note='You rolled '+d+(inc?' and collected '+inc+' income.':'.');
    if(s.k==='asset'&&!own[pos]&&cash>=s.cost){c.draw(hud()+'<p>'+note+' You landed on <b>'+esc(s.name)+'</b>: cost '+s.cost+', income '+s.income+' per turn.</p><div class="pager" style="justify-content:flex-start"><button class="btn primary" data-a="buy">Buy</button><button class="btn" data-a="pass">Pass</button></div>',{buy:function(){cash-=s.cost;own[pos]=1;c.good();next()},pass:next});return}
    if(s.k==='event'){c.draw(hud()+'<p>'+note+' '+esc(s.name)+': answer correctly to earn 120, or lose 60.</p><div id="ask"></div>');return c.ask(c.$('#ask'),anyq(c),function(ok){cash=Math.max(0,cash+(ok?120:-60));next()},{seconds:20})}
    c.say(note);next()}
  function next(){c.setScore(worth()*100/M.target);if(worth()>=M.target)return c.end(true,'Net worth '+fmt(worth())+' reached in '+turn+' turns.');if(turn>=M.turns)return c.end(false,'Turns are over; net worth '+fmt(worth())+'.');main()}
  c.auto=function(){if(aa(c))return;if(clickIn(c,'[data-a=buy]'))return;clickIn(c,'[data-a=roll]')};main();
};
G['PL108-024']=function(c){
  var N=6,b=new Array(N*N).fill(0),sel=-1,moves=0;
  for(var r=0;r<N;r++)for(var k=0;k<N;k++)if((r+k)%2===1){if(r<2)b[r*N+k]=2;else if(r>=N-2)b[r*N+k]=1}
  function own(p,s){return s===1?(p===1||p===3):(p===2||p===4)}
  function legal(i){var p=b[i],r=Math.floor(i/N),k=i%N,out=[];if(!p)return out;var side=(p===1||p===3)?1:2,dirs=[];if(side===1||p>2)dirs.push(-1);if(side===2||p>2)dirs.push(1);
    dirs.forEach(function(dr){[-1,1].forEach(function(dk){var r1=r+dr,k1=k+dk;if(r1<0||r1>=N||k1<0||k1>=N)return;var t=b[r1*N+k1];
      if(t===0)out.push({to:r1*N+k1,cap:-1});else if(!own(t,side)){var r2=r+2*dr,k2=k+2*dk;if(r2>=0&&r2<N&&k2>=0&&k2<N&&b[r2*N+k2]===0)out.push({to:r2*N+k2,cap:r1*N+k1})}})});return out}
  function all(side){var o=[];for(var i=0;i<b.length;i++)if(b[i]&&own(b[i],side))legal(i).forEach(function(m){o.push({from:i,to:m.to,cap:m.cap})});return o}
  function apply(m){var p=b[m.from];b[m.from]=0;if(m.cap>=0)b[m.cap]=0;var r=Math.floor(m.to/N);if(p===1&&r===0)p=3;if(p===2&&r===N-1)p=4;b[m.to]=p}
  function count(side){return b.filter(function(p){return p&&own(p,side)}).length}
  function over(){if(count(2)===0||all(2).length===0){c.end(true,'You won: the rival has no pieces or no moves.');return true}if(count(1)===0||all(1).length===0){c.end(false,'You have no pieces or no moves left.');return true}if(moves>=120){c.end(false,'Move limit reached.');return true}return false}
  function ai(){var ms=all(2);if(!ms.length)return;var caps=ms.filter(function(m){return m.cap>=0}),pool=caps.length?caps:ms;apply(pool[Math.floor(c.r()*pool.length)]);moves++}
  function post(){sel=-1;if(over())return;ai();if(over())return;draw()}
  function doMove(m){if(m.cap>=0){c.draw('<p>Capture challenge: answer correctly to capture.</p><div id="ask"></div>');return c.ask(c.$('#ask'),nq(c),function(ok){if(ok){apply(m);moves++}else c.say('The capture failed and you lose the turn.');post()},{seconds:20})}apply(m);moves++;post()}
  function draw(){var d={};if(sel>=0)legal(sel).forEach(function(m){d[m.to]=m});
    var h='<p>Select one of your pieces (●), then a green square. Capturing needs a correct answer. Your pieces: '+count(1)+' · rival: '+count(2)+'</p><div style="display:grid;grid-template-columns:repeat('+N+',50px);gap:2px">';
    for(var i=0;i<N*N;i++){var r=Math.floor(i/N),k=i%N,dark=(r+k)%2===1,p=b[i],g=p===1?'●':p===3?'♛':p===2?'○':p===4?'♕':'';
      h+='<button data-a="cell" data-v="'+i+'" aria-label="row '+(r+1)+' column '+(k+1)+'" style="width:50px;height:50px;font-size:24px;border:0;cursor:'+(dark?'pointer':'default')+';background:'+(!dark?'#eef3f3':d[i]?'#bde7c3':i===sel?'#ffe29a':'#8a9a9c')+'"'+(dark?'':' disabled')+'>'+g+'</button>'}
    c.draw(h+'</div>',{cell:function(v){var i=Number(v);if(d[i])return doMove({from:sel,to:i,cap:d[i].cap});if(b[i]&&own(b[i],1)&&legal(i).length){sel=i;return draw()}sel=-1;draw()}})}
  c.auto=function(){if(aa(c))return;var ms=all(1);if(!ms.length)return;var best=null,bs=-99;
    ms.forEach(function(m){var save=b.slice();apply(m);var threat=all(2).filter(function(x){return x.cap>=0}).length;b=save;var sc=(m.cap>=0?3:0)-threat*2+c.r()*.5;if(sc>bs){bs=sc;best=m}});doMove(best)};
  draw();
};
function fenGrid(fen){var out=[];fen.split(' ')[0].split('/').forEach(function(r){var row=[];r.split('').forEach(function(ch){if(/\d/.test(ch))for(var i=0;i<+ch;i++)row.push('');else row.push(ch)});out.push(row)});return out}
var CHESS_GL={K:'♔',Q:'♕',R:'♖',B:'♗',N:'♘',P:'♙',k:'♚',q:'♛',r:'♜',b:'♝',n:'♞',p:'♟'};
G['PL108-025']=function(c){
  var P=c.pack.chess,pi=0,wrong=0;
  function draw(){var p=P[pi],g=fenGrid(p.fen),opts=p._o||(p._o=shuffle(p.opts,c.r));
    c.draw('<p><strong>Puzzle '+(pi+1)+' / '+P.length+' · '+esc(p.title)+'</strong> · White to move · mistakes '+wrong+' / 3</p><div style="display:grid;grid-template-columns:repeat(8,40px);gap:0;width:320px;margin-bottom:10px">'+g.map(function(row,r){return row.map(function(ch,k){return'<div aria-label="'+(ch||'empty')+'" style="width:40px;height:40px;font-size:26px;text-align:center;line-height:40px;background:'+((r+k)%2?'#8aa4a8':'#eef3f3')+';color:#111">'+(ch?CHESS_GL[ch]:'')+'</div>'}).join('')}).join('')+'</div><p>Which move gives checkmate?</p><div class="pager" style="justify-content:flex-start">'+opts.map(function(o){return'<button class="btn primary" data-a="mv" data-v="'+esc(o)+'">'+esc(o)+'</button>'}).join('')+'</div><p class="small muted">Like a retro run: look at every consequence of a move before you commit to it.</p>',
      {mv:function(v){if(v===p.mate){c.good();pi++;if(pi>=P.length)return c.end(true,'All positions solved with '+wrong+' mistakes.');c.say('Checkmate. Next position.');draw()}else{wrong++;c.miss();c.penalty(12);c.say(v+' does not give checkmate.');if(wrong>=3)return c.end(false,'Three mistakes.');draw()}}})}
  c.auto=function(){clickIn(c,'[data-a=mv][data-v="'+P[pi].mate+'"]')};draw();
};
G['PL108-026']=function(c){
  var D=shuffle(c.pack.decisions,c.r),di=0,pos=0,pts=0,TRACK=36,TARGET=45,rolls=0,die=0;
  function draw(){c.draw('<p><strong>Square '+pos+' / '+TRACK+'</strong> · points '+pts+' / '+TARGET+' · rolls '+rolls+'</p><div style="height:12px;background:var(--line);border-radius:6px"><div style="height:12px;width:'+Math.min(100,pos*100/TRACK)+'%;background:#1f6f78;border-radius:6px"></div></div><p></p><button class="btn primary" data-a="roll">Roll the die</button>',{roll:roll})}
  function roll(){rolls++;die=Math.floor(c.r()*6)+1;pos+=die;var card=D[di%D.length];di++;var opts=shuffle(card.opts,c.r);
    c.draw('<p>You rolled <b>'+die+'</b> and moved to square '+Math.min(pos,TRACK)+'. Decision card:</p><h3>'+esc(card.text)+'</h3>'+opts.map(function(o,k){return'<button class="quizopt" data-a="opt" data-v="'+k+'">'+esc(o.t)+'</button>'}).join('')+'<div id="fb"></div>',
      {opt:function(v){var o=opts[Number(v)];pts+=o.pts;if(o.pts>0)c.good();else c.miss();c.setScore(pts*100/TARGET);c.body.querySelectorAll('[data-a=opt]').forEach(function(b){b.disabled=true});
        c.$('#fb').innerHTML='<p>'+(o.pts>0?'Good call (+':'Risky (')+o.pts+'). '+esc(o.why)+'</p><button class="btn primary" data-a="go">Continue</button>';c.$('[data-a=go]').onclick=function(){if(pos>=TRACK)return c.end(pts>=TARGET,'Finished with '+pts+' points; target '+TARGET+'.');draw()}}})}
  c.auto=function(){if(clickIn(c,'[data-a=go]'))return;if(clickIn(c,'[data-a=roll]'))return;var bs=c.body.querySelectorAll('[data-a=opt]');if(!bs.length)return;var best=0,card=D[(di-1)%D.length];
    var bt=card.opts.reduce(function(m,o){return o.pts>m.pts?o:m});Array.from(bs).find(function(b){return b.textContent===bt.t}).click()};draw();
};
G['PL108-027']=function(c){
  var pos=0,rolls=0,MAXR=30,gate={};for(var s=7;s<100;s+=7)gate[s]=1;
  function boardHtml(){var rows=[];for(var r=9;r>=0;r--){var row=[];for(var k=0;k<10;k++)row.push(r*10+(r%2===0?k+1:10-k));rows.push(row)}
    return'<div style="display:grid;grid-template-columns:repeat(10,1fr);gap:2px;max-width:520px">'+rows.map(function(row){return row.map(function(n){return'<div style="border:1px solid var(--line);border-radius:4px;font-size:10px;text-align:center;padding:5px 0;'+(n===pos?'background:#1f6f78;color:#fff;font-weight:700':(gate[n]?'background:#fff3d6':''))+'">'+n+'</div>'}).join('')}).join('')+'</div>'}
  function draw(){c.draw('<p><strong>Square '+pos+' / 100</strong> · rolls '+rolls+' / '+MAXR+'</p>'+boardHtml()+'<p class="small muted">Yellow squares are challenges: a wrong answer sends you back 3 squares.</p><button class="btn primary" data-a="roll">Roll two dice</button>',{roll:roll})}
  function roll(){rolls++;var d=Math.floor(c.r()*6)+Math.floor(c.r()*6)+2;pos+=d;c.setScore(100-rolls*2);c.say('You rolled '+d+'.');if(pos>=100)return c.end(true,'You reached 100 in '+rolls+' rolls.');
    if(gate[pos]){c.draw('<p>Challenge square '+pos+'.</p><div id="ask"></div>');return c.ask(c.$('#ask'),anyq(c),function(ok){if(!ok)pos=Math.max(0,pos-3);after()},{seconds:20})}after()}
  function after(){if(rolls>=MAXR)return c.end(false,'Out of rolls at square '+pos+'.');draw()}
  c.auto=function(){if(aa(c))return;clickIn(c,'[data-a=roll]')};draw();
};

/* ---------- Memory Arena (wave 2) ---------- */
function flipBoard(c,cards,cols,onDone,o){o=o||{};
  var rev=[],found={},moves=0,pending=false,pairs=cards.length/2;
  function draw(){c.draw('<p>Moves '+moves+' · pairs found '+Object.keys(found).length+' / '+pairs+'</p><div style="display:grid;grid-template-columns:repeat('+cols+','+(o.w||68)+'px);gap:8px">'+cards.map(function(cd,i){var open=found[cd.id]||rev.indexOf(i)>=0;
    return'<button class="btn'+(found[cd.id]?' primary':'')+'" data-a="f" data-v="'+i+'" aria-label="'+(open?esc(cd.label||cd.face):'hidden card')+'"'+(found[cd.id]?' disabled':'')+' style="height:'+(o.h||64)+'px;font-size:'+(o.fs||22)+'px">'+(open?esc(cd.face):'?')+'</button>'}).join('')+'</div>'+(pending?'<p class="small muted">No match. Pick another card to turn them back.</p>':''),{f:flip})}
  function flip(v){var i=Number(v);if(found[cards[i].id])return;if(pending){rev=[];pending=false}if(rev.indexOf(i)>=0)return;rev.push(i);
    if(rev.length===2){moves++;if(cards[rev[0]].id===cards[rev[1]].id){found[cards[i].id]=true;rev=[];c.good()}else{pending=true;c.miss()}
      c.setScore(100-Math.max(0,moves-pairs*2)*3);if(Object.keys(found).length===pairs)return onDone(moves)}draw()}
  c.auto=function(){if(aa(c))return;var ids={};cards.forEach(function(cd,i){if(!found[cd.id])(ids[cd.id]=ids[cd.id]||[]).push(i)});var k=Object.keys(ids)[0];if(k===undefined)return;
    var t=(rev.length===1&&!pending)?ids[cards[rev[0]].id].filter(function(x){return x!==rev[0]})[0]:ids[k][0];clickIn(c,'[data-a=f][data-v="'+t+'"]')};
  draw()}
function matcher(c,pairs,o){
  var L=shuffle(pairs.map(function(_,i){return i}),c.r),R=shuffle(pairs.map(function(_,i){return i}),c.r),done={},sel=-1,miss=0,n=0;
  function draw(){c.draw('<p>Matched '+n+' / '+o.target+' · mistakes '+miss+' / '+o.maxMiss+'. Pick a card on the left, then its match on the right.</p><div style="display:grid;grid-template-columns:1fr 1fr;gap:10px"><div>'+L.map(function(i){return'<button class="btn'+(sel===i?' primary':'')+'" style="width:100%;margin-bottom:6px;text-align:left" data-a="l" data-v="'+i+'"'+(done[i]?' disabled':'')+'>'+(done[i]?'✓ ':'')+esc(pairs[i][0])+'</button>'}).join('')+'</div><div>'+R.map(function(i){return'<button class="btn" style="width:100%;margin-bottom:6px;text-align:left" data-a="r" data-v="'+i+'"'+(done[i]?' disabled':'')+'>'+esc(pairs[i][1])+'</button>'}).join('')+'</div></div>',
    {l:function(v){sel=Number(v);draw()},r:function(v){var i=Number(v);if(sel<0){c.say('Pick a card on the left first.');return}
      if(i===sel){done[i]=true;n++;c.good();sel=-1;if(n>=o.target)return c.end(true,'Matched '+n+' with '+miss+' mistakes.')}else{miss++;c.miss();c.setScore(100-miss*(100/(o.maxMiss+1)));sel=-1;c.say('Those do not belong together.');if(miss>=o.maxMiss)return c.end(false,'Too many mistakes.')}draw()}})}
  c.auto=function(){var i=L.find(function(x){return!done[x]});if(i===undefined)return;if(sel!==i&&!clickIn(c,'[data-a=l][data-v="'+i+'"]'))return;clickIn(c,'[data-a=r][data-v="'+i+'"]')};draw()}
G['PL108-030']=function(c){matcher(c,c.pack.sysmatch,{target:8,maxMiss:6})};
G['PL108-031']=function(c){matcher(c,c.pack.context,{target:6,maxMiss:4})};
G['PL108-032']=function(c){
  var I=c.pack.icons,cards=[];I.forEach(function(x,k){cards.push({id:k,face:x[0],label:x[1]});cards.push({id:k,face:x[0],label:x[1]})});cards=shuffle(cards,c.r);
  flipBoard(c,cards,4,function(m){c.end(true,'All '+I.length+' picture pairs cleared in '+m+' moves.')},{w:72});
};
G['PL108-033']=function(c){
  var T=c.pack.triples,tiles=[],sel=[],done={},miss=0;T.forEach(function(g,gi){g.items.forEach(function(t){tiles.push({t:t,g:gi})})});tiles=shuffle(tiles,c.r);
  function draw(){c.draw('<p>Groups found '+Object.keys(done).length+' / '+T.length+' · mistakes '+miss+' / 5. Select three tiles that belong together.</p><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">'+tiles.map(function(x,i){return'<button class="btn'+(sel.indexOf(i)>=0?' primary':'')+'" data-a="t" data-v="'+i+'"'+(done[x.g]?' disabled':'')+'>'+(done[x.g]?'✓ ':'')+esc(x.t)+'</button>'}).join('')+'</div>'+Object.keys(done).map(function(g){return'<p class="small">✓ '+esc(T[g].name)+'</p>'}).join(''),{t:pickT})}
  function pickT(v){var i=Number(v),k=sel.indexOf(i);if(k>=0)sel.splice(k,1);else sel.push(i);
    if(sel.length===3){var g=tiles[sel[0]].g;if(sel.every(function(j){return tiles[j].g===g})){done[g]=true;c.good();c.say('Group found: '+T[g].name+'.');if(Object.keys(done).length===T.length)return c.end(true,'All groups found with '+miss+' mistakes.')}else{miss++;c.miss();c.setScore(100-miss*20);c.say('Those three do not share a group.');if(miss>=5)return c.end(false,'Five mistakes.')}sel=[]}draw()}
  c.auto=function(){if(sel.length&&sel.length<3){var g=tiles[sel[0]].g;var nx=tiles.findIndex(function(x,i){return x.g===g&&sel.indexOf(i)<0});return clickIn(c,'[data-a=t][data-v="'+nx+'"]')}
    var g2=T.findIndex(function(_,gi){return!done[gi]}),i=tiles.findIndex(function(x){return x.g===g2});clickIn(c,'[data-a=t][data-v="'+i+'"]')};draw();
};
G['PL108-034']=function(c){
  var S=c.pack.symbols4,LEN=6,seq=[],i;for(i=0;i<LEN;i++)seq.push(Math.floor(c.r()*S.length));
  var lvl=1,lives=2,phase='view',pos=0;
  function view(){phase='view';pos=0;c.draw('<p><strong>Chain '+lvl+' / '+LEN+'</strong> · lives '+lives+'</p><p>Remember this order:</p><p style="font-size:20px">'+seq.slice(0,lvl).map(function(k){return'<span class="pill">'+esc(S[k])+'</span>'}).join(' → ')+'</p><button class="btn primary" data-a="hide">Hide and repeat</button>',{hide:input});
    if(!c.accessible)c.after(2500+lvl*900,function(){if(phase==='view')input()})}
  function input(){phase='in';pos=0;draw()}
  function draw(){c.draw('<p><strong>Chain '+lvl+' / '+LEN+'</strong> · lives '+lives+' · entered '+pos+' of '+lvl+'</p><div class="pager" style="justify-content:flex-start">'+S.map(function(s,k){return'<button class="btn primary" data-a="k" data-v="'+k+'">'+esc(s)+'</button>'}).join('')+'</div>',{k:function(v){press(Number(v))}})}
  function press(k){if(k===seq[pos]){pos++;if(pos>=lvl){c.good();lvl++;c.setScore(100*(lvl-1)/LEN);if(lvl>LEN)return c.end(true,'You repeated a chain of '+LEN+'.');return view()}draw()}
    else{lives--;c.miss();c.penalty(15);c.say('Wrong step. The chain is shown again.');if(lives<=0)return c.end(false,'You ran out of lives.');view()}}
  c.auto=function(){if(phase==='view')return clickIn(c,'[data-a=hide]');clickIn(c,'[data-a=k][data-v="'+seq[pos]+'"]')};view();
};
G['PL108-036']=function(c){
  var P=c.pack.pairs,stages=[3,4,6],si=0;
  function stage(){var n=stages[si],ps=pick(P,n,c.r),cards=[];ps.forEach(function(p,k){cards.push({id:k,face:p[0],label:p[0]});cards.push({id:k,face:p[1],label:p[1]})});cards=shuffle(cards,c.r);
    c.say('Stage '+(si+1)+' of '+stages.length+': '+n+' pairs. Match each term with its meaning.');
    flipBoard(c,cards,n>4?4:3,function(m){si++;if(si>=stages.length)return c.end(true,'All three boards cleared.');stage()},{w:118,h:84,fs:12})}
  stage();
};

/* ---------- Logic Arena (wave 2) ---------- */
function logicGame(c,LG,note){
  var n=LG.items[0].length,wrong=0;
  function draw(){c.draw('<p>'+esc(note)+'</p><ol class="small">'+LG.clues.map(function(t){return'<li>'+esc(t)+'</li>'}).join('')+'</ol><div style="overflow:auto"><table class="table"><thead><tr><th>'+esc(LG.cats[0])+'</th>'+LG.cats.slice(1).map(function(x){return'<th>'+esc(x)+'</th>'}).join('')+'</tr></thead><tbody>'+
    LG.items[0].map(function(it,i){return'<tr><th>'+esc(it)+'</th>'+LG.cats.slice(1).map(function(_,k){return'<td><select class="lg" data-i="'+i+'" data-k="'+(k+1)+'" aria-label="'+esc(it+' '+LG.cats[k+1])+'" style="'+INP+'"><option value="-1">?</option>'+LG.items[k+1].map(function(o,j){return'<option value="'+j+'">'+esc(o)+'</option>'}).join('')+'</select></td>'}).join('')+'</tr>'}).join('')+'</tbody></table></div><div class="pager" style="justify-content:flex-start"><button class="btn primary" data-a="chk">Check my answer</button><button class="btn" data-a="hint">Reveal one cell (−8)</button></div><p class="small muted">Each item in a column is used exactly once.</p>',{chk:chk,hint:hint})}
  function sels(){return Array.from(c.body.querySelectorAll('.lg'))}
  function want(s){return LG.solution[Number(s.dataset.k)][Number(s.dataset.i)]}
  function chk(){var s=sels(),empty=s.filter(function(x){return x.value==='-1'}).length,bad=s.filter(function(x){return x.value!=='-1'&&Number(x.value)!==want(x)}).length;
    if(!empty&&!bad)return c.end(true,'The deduction is complete'+(wrong?' after '+wrong+' wrong checks.':'.'));
    if(bad){wrong++;c.miss();c.penalty(6);c.say(bad+' of your choices conflict with the clues.')}else c.say(empty+' cells are still empty.');if(wrong>=8)c.end(false,'Too many wrong checks.')}
  function hint(){var t=sels().find(function(x){return Number(x.value)!==want(x)});if(!t)return;t.value=want(t);t.style.background='#fff3d6';c.penalty(8)}
  c.auto=function(){sels().forEach(function(s){s.value=want(s)});chk()};draw()}
G['PL108-038']=function(c){logicGame(c,c.pack.logic1,'Match each worker with a pay item and a payroll area. All of this is fictional.')};
G['PL108-044']=function(c){logicGame(c,c.pack.logic2,'Four workers stand in a row in ID order (left to right). Find every attribute for each worker. All of this is fictional.')};
G['PL108-041']=function(c){
  var P=pick(c.pack.nonogram,2,c.r),pi=0,g,wrong=0;
  function start(){g=[];for(var i=0;i<5;i++)g.push([0,0,0,0,0]);draw()}
  function draw(){var p=P[pi];c.draw('<p><strong>Picture '+(pi+1)+' / '+P.length+'</strong> · mistakes '+wrong+' / 6. Numbers show runs of filled cells in each row and column.</p><div style="display:grid;grid-template-columns:70px repeat(5,42px);gap:3px;width:max-content;align-items:end"><div></div>'+p.cols.map(function(cl){return'<div class="small" style="text-align:center;line-height:1.2">'+cl.join('<br>')+'</div>'}).join('')+
    g.map(function(row,r){return'<div class="small" style="text-align:right;padding-right:6px;align-self:center">'+p.rows[r].join(' ')+'</div>'+row.map(function(v,k){return'<button data-a="cell" data-v="'+r+','+k+'" aria-label="row '+(r+1)+' column '+(k+1)+(v?' filled':' empty')+'" style="width:42px;height:42px;border:1px solid var(--line);border-radius:6px;background:'+(v?'#1f6f78':'#fff')+'"></button>'}).join('')}).join('')+'</div><p></p><button class="btn primary" data-a="chk">Check</button>',
    {cell:function(v){var a=v.split(',');g[a[0]][a[1]]=1-g[a[0]][a[1]];draw()},chk:chk})}
  function chk(){var p=P[pi].picture,bad=0;for(var r=0;r<5;r++)for(var k=0;k<5;k++)if((p[r][k]==='#'?1:0)!==g[r][k])bad++;
    if(!bad){c.good();pi++;if(pi>=P.length)return c.end(true,'Both pictures complete.');return start()}wrong++;c.miss();c.penalty(8);c.say('Not yet: some cells do not satisfy the clues.');if(wrong>=6)return c.end(false,'Too many wrong checks.')}
  c.auto=function(){var p=P[pi].picture;for(var r=0;r<5;r++)for(var k=0;k<5;k++)g[r][k]=p[r][k]==='#'?1:0;chk()};start();
};
G['PL108-042']=function(c){
  var P=pick(c.pack.patterns,5,c.r),i=0,right=0;
  function next(){if(i>=P.length){c.setScore(right*20);return c.end(right>=4,right+' of '+P.length+' patterns solved. Target: 4.')}
    var p=P[i];c.draw('<p><strong>Pattern '+(i+1)+' / '+P.length+'</strong></p><p style="font-size:20px">'+p.series.map(fmt).join(' , ')+' , ?</p><div id="ask"></div>');
    c.ask(c.$('#ask'),{q:'What comes next?',why:p.why,opts:shuffle(p.opts.map(function(o,k){return{t:fmt(o),ok:k===p.a}}),c.r)},function(ok){if(ok)right++;i++;next()},{seconds:30})}
  c.auto=function(){aa(c)};next();
};
G['PL108-043']=function(c){
  var GT=c.pack.gates,gi=0,F={AND:function(a,b){return a&b},OR:function(a,b){return a|b},XOR:function(a,b){return a^b},NAND:function(a,b){return 1-(a&b)}},names=Object.keys(F);
  function table(){var g=GT[gi],sel=Array.from(c.body.querySelectorAll('.gt')).map(function(s){return s.value}),rows=[],ok=true;
    for(var a=0;a<2;a++)for(var b=0;b<2;b++)for(var d=0;d<2;d++){var k=a*4+b*2+d,out=F[sel[2]](F[sel[0]](a,b),F[sel[1]](b,d));if(out!==g.target[k])ok=false;rows.push('<tr><td>'+a+'</td><td>'+b+'</td><td>'+d+'</td><td>'+g.target[k]+'</td><td>'+out+' '+(out===g.target[k]?'✓':'✗')+'</td></tr>')}
    c.$('#tt').innerHTML=rows.join('');return ok}
  function draw(){var g=GT[gi];c.draw('<p><strong>Circuit '+(gi+1)+' / '+GT.length+': '+esc(g.label)+'</strong></p><p class="small">Inputs A = '+esc(g.ins[0])+', B = '+esc(g.ins[1])+', C = '+esc(g.ins[2])+'.<br>'+esc(g.desc)+'</p><div class="pager" style="justify-content:flex-start">'+['G1','G2','G3'].map(function(n,k){return'<label>'+n+' <select class="gt" aria-label="gate '+n+'" style="'+INP+'">'+names.map(function(x){return'<option>'+x+'</option>'}).join('')+'</select></label>'}).join('')+'</div><table class="table"><thead><tr><th>A</th><th>B</th><th>C</th><th>Target</th><th>Yours</th></tr></thead><tbody id="tt"></tbody></table><button class="btn primary" data-a="chk">Lock in this circuit</button>',{chk:chk});
    c.body.querySelectorAll('.gt').forEach(function(s){s.onchange=table});table()}
  function chk(){if(!table()){c.miss();c.penalty(8);c.say('Some rows still differ from the target.');return}c.good();gi++;if(gi>=GT.length)return c.end(true,'All target outputs match.');draw()}
  c.auto=function(){var s=c.body.querySelectorAll('.gt'),g=GT[gi];g.sol.forEach(function(x,k){s[k].value=x});table();chk()};draw();
};
G['PL108-045']=function(c){
  var P=pick(c.pack.binary,2,c.r),pi=0,g,N=6,wrong=0;
  function start(){g=P[pi].puzzle.map(function(r){return r.slice()});draw()}
  function draw(){c.draw('<p><strong>Grid '+(pi+1)+' / '+P.length+'</strong> · mistakes '+wrong+' / 6</p><p class="small">Fill every cell with 0 or 1. No three equal digits in a row or column; each row and column has three 0s and three 1s; no two rows or two columns are identical. (Think 0 = hold, 1 = pay.)</p><div style="display:grid;grid-template-columns:repeat('+N+',46px);gap:3px">'+
    g.map(function(row,r){return row.map(function(v,k){var fixed=P[pi].puzzle[r][k]>=0;return'<button data-a="cell" data-v="'+r+','+k+'" aria-label="row '+(r+1)+' column '+(k+1)+' '+(v<0?'empty':v)+'" style="width:46px;height:46px;font-size:18px;border:1px solid var(--line);background:'+(fixed?'#e8eef0':'transparent')+(fixed?';font-weight:700':'')+'"'+(fixed?' disabled':'')+'>'+(v<0?'':v)+'</button>'}).join('')}).join('')+'</div><p></p><button class="btn primary" data-a="chk">Check</button>',
    {cell:function(v){var a=v.split(',').map(Number);g[a[0]][a[1]]=g[a[0]][a[1]]<0?0:g[a[0]][a[1]]===0?1:-1;draw()},chk:chk})}
  function bad(){var m=[];for(var r=0;r<N;r++){if(g[r].some(function(x){return x<0}))return'Fill every cell first.'}
    var L=[];for(r=0;r<N;r++){L.push(g[r].slice());L.push(g.map(function(x){return x[r]}))}
    for(var i=0;i<L.length;i++){var l=L[i],name=(i%2?'column ':'row ')+(Math.floor(i/2)+1);if(l.reduce(function(a,b){return a+b},0)!==N/2)return'The '+name+' must have three 0s and three 1s.';for(var j=0;j<N-2;j++)if(l[j]===l[j+1]&&l[j]===l[j+2])return'The '+name+' has three equal digits in a row.'}
    for(i=0;i<N;i++)for(j=i+1;j<N;j++){if(g[i].join('')===g[j].join(''))return'Rows '+(i+1)+' and '+(j+1)+' are identical.';if(g.map(function(x){return x[i]}).join('')===g.map(function(x){return x[j]}).join(''))return'Columns '+(i+1)+' and '+(j+1)+' are identical.'}return''}
  function chk(){var m=bad();if(!m){c.good();pi++;if(pi>=P.length)return c.end(true,'Both grids are valid.');return start()}wrong++;c.miss();c.penalty(6);c.say(m);if(wrong>=6)return c.end(false,'Too many wrong checks.')}
  c.auto=function(){g=P[pi].solution.map(function(r){return r.slice()});chk()};start();
};

/* ---------- Adventure Arena (wave 2) ---------- */
G['PL108-047']=function(c){
  var T=c.pack.treasure,i=0,wrong=0;
  function stop(){c.draw('<p><strong>Stop '+(i+1)+' / '+T.length+': '+esc(T[i].name)+'</strong> · wrong answers '+wrong+' / 6</p><p>'+(i?'Clue found: ':'Your first clue: ')+'<em>'+esc(T[i].clue)+'</em></p><button class="btn primary" data-a="search">Search this place</button>',{search:search})}
  function search(){c.draw('<p>You search '+esc(T[i].name)+'. A lock needs an answer.</p><div id="ask"></div>');c.ask(c.$('#ask'),nq(c),function(ok){if(ok){c.setScore(100-wrong*10);i++;if(i>=T.length)return c.end(true,'You found the treasure with '+wrong+' wrong answers.');c.say('Clue found. On to the next place.');stop()}else{wrong++;c.penalty(5);if(wrong>=6)return c.end(false,'The trail went cold.');stop()}},{seconds:25})}
  c.auto=function(){if(aa(c))return;clickIn(c,'[data-a=search]')};stop();
};
function oq(c){var O=c.pack.odd,o=O[Math.floor(c.r()*O.length)];return{q:'Which one does not belong?',why:o.why,opts:shuffle(o.items.map(function(t,k){return{t:t,ok:k===o.odd}}),c.r)}}
G['PL108-048']=function(c){
  var stages=[['Prepare the cutover',[['Quiz check',nq],['Odd one out',oq]]],['Replicate and verify',[['Term check',dq],['True or false',tq]]],['Release the pay',[['Numbers check',pq],['Final quiz',nq]]]],si=0,oi=0,wrong=0,done=0,TOTAL=6;
  function list(){return'<ul class="small">'+stages.map(function(s,k){return'<li><b>'+esc(s[0])+'</b>: '+s[1].map(function(o,j){return(k<si||(k===si&&j<oi)?'✓ ':'○ ')+o[0]}).join(' · ')+'</li>'}).join('')+'</ul>'}
  function obj(){var st=stages[si],o=st[1][oi];c.draw('<p><strong>Stage '+(si+1)+' / '+stages.length+': '+esc(st[0])+'</strong> · objective '+(done+1)+' / '+TOTAL+' · wrong '+wrong+' / 5</p>'+list()+'<div id="ask"></div>');
    c.ask(c.$('#ask'),o[1](c),function(ok){if(!ok){wrong++;c.penalty(8);if(wrong>=5)return c.end(false,'The mission failed after five wrong answers.');return obj()}done++;oi++;if(oi>=st[1].length){oi=0;si++}c.setScore(100*done/TOTAL-wrong*8);
      if(si>=stages.length)return c.end(true,'All mandatory objectives completed with '+wrong+' wrong answers.');obj()},{seconds:25})}
  c.auto=function(){aa(c)};obj();
};
G['PL108-049']=function(c){
  var M=c.pack.mansion,R=M.rooms,room=0,inv=[],taken={},wrong=0;
  function draw(){var r=R[room];c.draw('<p><strong>'+esc(r.name)+'</strong> · items: '+(inv.join(', ')||'none')+' · wrong '+wrong+' / 8</p><p>'+esc(r.text)+'</p>'+(r.item&&!taken[room]?'<button class="btn primary" data-a="search">Search for something useful</button>':'<p class="small muted">Nothing more to find here.</p>')+'<p class="small">Doors:</p><div class="pager" style="justify-content:flex-start">'+r.exits.map(function(e){return'<button class="btn" data-a="go" data-v="'+e+'">'+esc(R[e].name)+(R[e].need&&inv.indexOf(R[e].need)<0?' 🔒':'')+'</button>'}).join('')+'</div>',
    {search:search,go:function(v){var e=Number(v),n=R[e].need;if(n&&inv.indexOf(n)<0){c.say('The door is locked. You need: '+n+'.');return}room=e;if(e===R.length-1)return c.end(true,'You unlocked the final chamber.');draw()}})}
  function search(){c.draw('<p>You search the '+esc(R[room].name)+'. Answer to open a hidden drawer.</p><div id="ask"></div>');c.ask(c.$('#ask'),nq(c),function(ok){if(ok){taken[room]=1;inv.push(R[room].item);c.say('You found: '+R[room].item+'.')}else{wrong++;c.penalty(8);if(wrong>=8)return c.end(false,'The mansion defeated you.')}draw()},{seconds:25})}
  c.auto=function(){if(aa(c))return;if(clickIn(c,'[data-a=search]'))return;var route=[0,1,3,5],nx=route[route.indexOf(room)+1];if(nx===undefined)nx=route[route.length-1];clickIn(c,'[data-a=go][data-v="'+nx+'"]')};draw();
};
G['PL108-051']=function(c){
  var E=c.pack.expedition,N=E.n,pr=E.start.slice(),got={},energy=E.energy,wrong=0;
  function isH(r,k){return E.hazards.some(function(h){return h[0]===r&&h[1]===k})}
  function fragAt(r,k){return E.fragments.findIndex(function(f,i){return f[0]===r&&f[1]===k&&!got[i]})}
  function draw(){var h='<p><strong>Energy '+energy+'</strong> · fragments '+Object.keys(got).length+' / '+E.fragments.length+'. Move with the arrow buttons or keys. ⚠ costs '+E.hazardCost+' extra energy.</p><div style="display:grid;grid-template-columns:repeat('+N+',54px);gap:3px">';
    for(var r=0;r<N;r++)for(var k=0;k<N;k++){var me=pr[0]===r&&pr[1]===k,f=E.fragments.findIndex(function(x){return x[0]===r&&x[1]===k});
      h+='<div aria-label="row '+(r+1)+' column '+(k+1)+'" style="width:54px;height:54px;border:1px solid var(--line);border-radius:8px;text-align:center;line-height:54px;font-size:22px;background:'+(me?'#d9f0f2':isH(r,k)?'#fdeee8':'transparent')+'">'+(me?'🧭':f>=0?(got[f]?'✅':'🧩'):isH(r,k)?'⚠':'')+'</div>'}
    c.draw(h+'</div><div class="pager" style="justify-content:flex-start"><button class="btn" data-a="m" data-v="-1,0">↑ Up</button><button class="btn" data-a="m" data-v="1,0">↓ Down</button><button class="btn" data-a="m" data-v="0,-1">← Left</button><button class="btn" data-a="m" data-v="0,1">Right →</button></div>',{m:function(v){var d=v.split(',').map(Number);go(d[0],d[1])}})}
  function go(dr,dk){var r=pr[0]+dr,k=pr[1]+dk;if(r<0||r>=N||k<0||k>=N)return;energy-=1+(isH(r,k)?E.hazardCost:0);pr=[r,k];c.setScore(100*energy/E.energy);
    var f=fragAt(r,k);if(f>=0){c.draw('<p>You found a data fragment. Decode it to collect it.</p><div id="ask"></div>');return c.ask(c.$('#ask'),nq(c),function(ok){if(ok){got[f]=1;c.good()}else{wrong++;c.penalty(6)}after()},{seconds:25})}after()}
  function after(){if(Object.keys(got).length===E.fragments.length)return c.end(true,'All fragments recovered with '+energy+' energy left.');if(energy<=0)return c.end(false,'You ran out of energy.');draw()}
  c.key(function(e){var m={ArrowUp:[-1,0],ArrowDown:[1,0],ArrowLeft:[0,-1],ArrowRight:[0,1]}[e.key];if(m){e.preventDefault();go(m[0],m[1])}});
  c.auto=function(){if(aa(c))return;var best=null,dist={},q=[[pr[0],pr[1],0,null]];dist[pr[0]+','+pr[1]]=0;var heap=[{r:pr[0],k:pr[1],d:0,first:null}],seen={};
    while(heap.length){heap.sort(function(a,b){return a.d-b.d});var u=heap.shift(),key=u.r+','+u.k;if(seen[key])continue;seen[key]=1;if(fragAt(u.r,u.k)>=0&&u.first){best=u;break}
      [[-1,0],[1,0],[0,-1],[0,1]].forEach(function(dd){var r=u.r+dd[0],k=u.k+dd[1];if(r<0||r>=N||k<0||k>=N||seen[r+','+k])return;heap.push({r:r,k:k,d:u.d+1+(isH(r,k)?E.hazardCost:0),first:u.first||dd})})}
    if(best)go(best.first[0],best.first[1])};
  draw();
};
G['PL108-052']=function(c){
  var CA=c.pack.calc,H=c.pack.hang,ca=CA[Math.floor(c.r()*CA.length)],hg=H[Math.floor(c.r()*H.length)],qz=nq(c),stage=0,tries=0,MAXT=5;
  function draw(){var h='<p><strong>Vault lock '+(stage+1)+' / 3</strong> · wrong tries '+tries+' / '+MAXT+'</p>'+'<div style="display:flex;gap:8px;margin-bottom:10px">'+[0,1,2].map(function(s){return'<span class="pill">'+(s<stage?'🔓 open':s===stage?'🔐 working':'🔒 locked')+'</span>'}).join('')+'</div>';
    if(stage===0)c.draw(h+'<p>'+esc(ca.rule)+'</p><p><strong>'+esc(ca.q)+'</strong></p><div class="pager" style="justify-content:flex-start"><input id="vn" aria-label="your number" style="'+INP+'"><button class="btn primary" data-a="n">Try the code</button></div>',{n:function(){tryAns(Math.abs(num(c.$('#vn').value)-ca.a)<=Math.max(ca.tol,Math.abs(ca.a)*0.0001)+1e-9)}});
    else if(stage===1){c.draw(h+'<div id="ask"></div>');c.ask(c.$('#ask'),qz,function(ok){tryAns(ok)},{})}
    else c.draw(h+'<p>Clue: '+esc(hg[1])+'</p><p style="font-size:22px;letter-spacing:5px">'+hg[0].replace(/[A-Z]/g,'_ ').replace(/ /g,' ')+'</p><div class="pager" style="justify-content:flex-start"><input id="vw" aria-label="the phrase" style="'+INP+'"><button class="btn primary" data-a="w">Try the phrase</button></div>',{w:function(){tryAns((c.$('#vw').value||'').trim().toUpperCase()===hg[0])}})}
  function tryAns(ok){if(ok){c.good();stage++;c.setScore(100-tries*10);if(stage>=3)return c.end(true,'The vault is open with '+tries+' wrong tries.');if(stage===1)qz=nq(c);return draw()}tries++;c.miss();c.penalty(10);c.say('The lock stays shut.');if(tries>=MAXT)return c.end(false,'The vault locked down.');if(stage===1)qz=nq(c);draw()}
  c.auto=function(){if(aa(c))return;if(stage===0){c.$('#vn').value=ca.a;clickIn(c,'[data-a=n]')}else if(stage===2){c.$('#vw').value=hg[0];clickIn(c,'[data-a=w]')}};draw();
};
G['PL108-054']=function(c){
  var TL=c.pack.timeline,si=0,ei=0,damage=0,opts;
  function draw(){var s=TL[si],e=s.eras[ei];opts=opts||shuffle(e.opts.map(function(t,k){return{t:t,ok:k===e.a}}),c.r);
    c.draw('<p><strong>Timeline '+(si+1)+' / '+TL.length+': '+esc(s.title)+'</strong> · era '+(ei+1)+' / 3 · damage '+damage+' / 4</p><p>'+s.eras.map(function(x,k){return'<span class="pill" style="'+(k===ei?'background:#1f6f78;color:#fff':'')+'">'+(k<ei?'✓ ':'')+esc(x.era)+'</span>'}).join(' ')+'</p><h3>'+esc(e.q)+'</h3>'+opts.map(function(o,k){return'<button class="quizopt" data-a="o" data-v="'+k+'">'+esc(o.t)+'</button>'}).join(''),
      {o:function(v){if(opts[Number(v)].ok){c.good();opts=null;ei++;if(ei>=3){ei=0;si++;if(si>=TL.length)return c.end(true,'The timeline is restored with '+damage+' damage.');c.say('Timeline restored. A new one opens.')}draw()}
        else{damage++;c.miss();c.penalty(10);c.say('A branch opens: '+e.branch+' Choose again.');if(damage>=4)return c.end(false,'The timeline collapsed.');draw()}}})}
  c.auto=function(){var b=Array.from(c.body.querySelectorAll('[data-a=o]'));var k=opts.findIndex(function(o){return o.ok});if(b[k])b[k].click()};draw();
};

/* ---------- Arcade Arena (wave 2) ---------- */
G['PL108-057']=function(c){
  var N=8,i=0,lives=3,names=['Left lane','Middle lane','Right lane'];
  function gate(){var q=nq(c),keep=q.opts.filter(function(o){return o.ok}).concat(shuffle(q.opts.filter(function(o){return!o.ok}),c.r).slice(0,2));keep=shuffle(keep,c.r);
    var lane=keep.map(function(o,k){return{t:names[k]+': '+o.t,ok:o.ok}});
    c.draw('<p><strong>Gate '+(i+1)+' / '+N+'</strong> · lives '+lives+'</p><div style="height:10px;background:var(--line);border-radius:6px;margin-bottom:10px"><div style="height:10px;width:'+(i*100/N)+'%;background:#1f6f78;border-radius:6px"></div></div><p class="small muted">Run through the lane with the correct answer.</p><div id="ask"></div>');
    c.ask(c.$('#ask'),{q:q.q,why:q.why,opts:lane},function(ok){i++;if(!ok){lives--;c.penalty(15);if(lives<=0)return c.end(false,'You crashed three times.')}if(i>=N)return c.end(true,'You completed the course with '+lives+' lives left.');gate()},{seconds:14})}
  c.auto=function(){aa(c)};gate();
};
G['PL108-058']=function(c){
  var set=pick(c.pack.whack,1,c.r)[0],COLS=5,ROWS=6,wave=0,WAVES=3,lives=3,ship=2,en=[],shot=0;
  function newWave(){wave++;if(wave>WAVES)return c.end(true,'All '+WAVES+' waves cleared with '+lives+' lives left.');en=[];var goodN=2+Math.floor(c.r()*2);var idx=shuffle([0,1,2,3,4],c.r);
    idx.forEach(function(col,k){var good=k<goodN;var arr=good?set.good:set.bad;en.push({col:col,y:Math.floor(c.r()*2),t:arr[Math.floor(c.r()*arr.length)],good:good,live:true})});draw()}
  function draw(){var h='<p><strong>'+esc(set.prompt)+'</strong></p><p>Wave '+wave+' / '+WAVES+' · lives '+lives+(c.accessible?' · untimed: invaders move only when you press "Advance"':'')+'</p><div style="position:relative;height:'+(ROWS*40+44)+'px;border:1px solid var(--line);border-radius:12px;overflow:hidden">';
    en.forEach(function(e){if(e.live)h+='<div style="position:absolute;left:'+(e.col*20+1)+'%;top:'+(e.y*40+4)+'px;width:18%;height:34px;font-size:11px;text-align:center;line-height:34px;background:#fff3d6;border:1px solid #c98a00;border-radius:8px">'+esc(e.t)+'</div>'});
    h+='<div style="position:absolute;left:'+(ship*20+1)+'%;bottom:4px;width:18%;text-align:center;background:#1f6f78;color:#fff;border-radius:8px;padding:6px">▲ ship</div></div>';
    c.draw(h+'<div class="pager" style="justify-content:flex-start"><button class="btn" data-a="l">← Left</button><button class="btn primary" data-a="f">Fire</button><button class="btn" data-a="r">Right →</button>'+(c.accessible?'<button class="btn" data-a="adv">Advance</button>':'')+'</div>',
      {l:function(){ship=Math.max(0,ship-1);draw()},r:function(){ship=Math.min(COLS-1,ship+1);draw()},f:fire,adv:tick})}
  function fire(){var t=en.filter(function(e){return e.live&&e.col===ship}).sort(function(a,b){return b.y-a.y})[0];if(!t){c.say('Nothing in that column.');return}t.live=false;
    if(t.good){c.good();c.say('Hit: '+t.t)}else{c.miss();c.penalty(8);c.say('Wrong target: '+t.t)}settle()}
  function tick(){en.forEach(function(e){if(e.live){e.y++;if(e.y>=ROWS){e.live=false;if(e.good){lives--;c.miss();c.penalty(12);c.say('A valid item got through: '+e.t)}}}});if(lives<=0)return c.end(false,'You ran out of lives.');settle()}
  function settle(){if(c.done)return;if(!en.some(function(e){return e.live&&e.good}))return newWave();draw()}
  if(!c.accessible)c.every(1700,tick);
  c.auto=function(){var g=en.filter(function(e){return e.live&&e.good}).sort(function(a,b){return b.y-a.y})[0];if(!g)return;ship=g.col;fire()};
  newWave();
};
G['PL108-060']=function(c){
  var set=pick(c.pack.whack,1,c.r)[0],W=10,H=12,lives=3,px=3,bx,by,dx,dy,bricks=[],hits=0,need=0;
  var pool=[];for(var k=0;k<6;k++)pool.push({good:true,t:set.good[k%set.good.length]});for(k=0;k<4;k++)pool.push({good:false,t:set.bad[k%set.bad.length]});pool=shuffle(pool,c.r);
  pool.forEach(function(p,n){bricks.push({x:(n%5)*2,y:1+Math.floor(n/5),t:p.t,good:p.good,live:true});if(p.good)need++});
  function serve(){bx=px+1;by=H-2;dx=0;dy=-1}
  function brickAt(x,y){return bricks.find(function(b){return b.live&&b.y===y&&x>=b.x&&x<b.x+2})}
  function step(){var nx=bx+dx,ny=by+dy;if(nx<0||nx>=W){dx=-dx;nx=bx+dx}if(ny<0){dy=1;ny=by+dy}
    var br=brickAt(nx,ny);if(br){br.live=false;dy=-dy;ny=by+dy;if(br.good){hits++;c.good();c.setScore(100*hits/need)}else{c.miss();c.penalty(10);c.say('A decoy block was hit: '+br.t)}
      if(hits>=need)return c.end(true,'All required blocks cleared.')}
    if(ny===H-1&&dy>0){if(nx>=px&&nx<=px+2){dy=-1;dx=nx===px?-1:nx===px+2?1:0;ny=by+dy}else{lives--;c.miss();c.penalty(12);if(lives<=0)return c.end(false,'You ran out of lives.');serve();return draw()}}
    bx=nx;by=ny;draw()}
  function draw(){var h='<p><strong>Break the valid blocks: '+esc(set.prompt)+'</strong></p><p>Cleared '+hits+' / '+need+' · lives '+lives+(c.accessible?' · untimed: the ball moves when you press "Step"':'')+'</p><div style="position:relative;width:100%;max-width:420px;height:'+(H*28)+'px;border:1px solid var(--line);border-radius:10px;overflow:hidden;background:#fafcfc">';
    bricks.forEach(function(b){if(b.live)h+='<div style="position:absolute;left:'+(b.x*10)+'%;top:'+(b.y*28)+'px;width:20%;height:26px;font-size:9px;text-align:center;line-height:26px;background:'+(b.good?'#d9f0f2':'#fdeee8')+';border:1px solid '+(b.good?'#1f6f78':'#c0562f')+';border-radius:4px;overflow:hidden">'+esc(b.t)+'</div>'});
    h+='<div style="position:absolute;left:'+(bx*10+2)+'%;top:'+(by*28+6)+'px;width:16px;height:16px;border-radius:50%;background:#1f6f78"></div><div style="position:absolute;left:'+(px*10)+'%;top:'+((H-1)*28+10)+'px;width:30%;height:10px;border-radius:5px;background:#333"></div></div>';
    c.draw(h+'<div class="pager" style="justify-content:flex-start"><button class="btn" data-a="l">← Paddle left</button><button class="btn" data-a="r">Paddle right →</button>'+(c.accessible?'<button class="btn primary" data-a="s">Step</button>':'')+'</div><p class="small muted">Hit the ball on the left, middle or right of the paddle to change its direction. Green blocks must go; red blocks are decoys.</p>',
      {l:function(){px=Math.max(0,px-1);draw()},r:function(){px=Math.min(W-3,px+1);draw()},s:step})}
  c.key(function(e){if(e.key==='ArrowLeft'){e.preventDefault();px=Math.max(0,px-1);draw()}if(e.key==='ArrowRight'){e.preventDefault();px=Math.min(W-3,px+1);draw()}});
  if(!c.accessible)c.every(170,step);
  
  function refl(x){var p=2*(W-1);x=((x%p)+p)%p;return x>W-1?p-x:x}
  function land(){var sx=bx,sy=by,sdx=dx,sdy=dy,g=0;while(g++<80){var nx=sx+sdx,ny=sy+sdy;if(nx<0||nx>=W){sdx=-sdx;nx=sx+sdx}if(ny<0){sdy=1;ny=sy+sdy}if(ny===H-1&&sdy>0)return nx;sx=nx;sy=ny}return bx}
  function simHit(seq,tg){var x=bx,y=by,ddx=dx,ddy=dy,k=0,t=0;while(t++<400){var nx=x+ddx,ny=y+ddy;if(nx<0||nx>=W){ddx=-ddx;nx=x+ddx}if(ny<0){ddy=1;ny=y+ddy}if(ny===tg.y&&nx>=tg.x&&nx<tg.x+2)return t;
      if(ny===H-1&&ddy>0){var d=seq[k++];if(d===undefined)return 1e9;var p=nx-(d<0?0:d>0?2:1);if(p<0||p>W-3)return 1e9;ddy=-1;ddx=d;ny=y+ddy}x=nx;y=ny}return 1e9}
  function plan(tg){var best=1e9,bd=0,A=[-1,0,1];A.forEach(function(a){A.forEach(function(b){A.forEach(function(e){A.forEach(function(f){var t=simHit([a,b,e,f],tg);if(t<best){best=t;bd=a}})})})});if(best>=1e9)bd=[-1,0,1][Math.floor(c.r()*3)];return bd}
  c.auto=function(){for(var n=0;n<80&&!c.done;n++){var tg=bricks.filter(function(b){return b.live&&b.good})[0];if(!tg)return;
      if(dy>0){var lx=land(),d=plan(tg);px=Math.max(0,Math.min(W-3,lx-(d<0?0:d>0?2:1)))}step()}};
  serve();draw();
};
G['PL108-061']=function(c){
  var sets=pick(c.pack.whack,2,c.r),si=0,T=[],hits=0,bad=0,per=5,tickN=0,speed=c.accessible?2:5,seq=0;
  function spawn(){var set=sets[si],good=c.r()<.5,arr=good?set.good:set.bad;T.push({id:++seq,t:arr[Math.floor(c.r()*arr.length)],good:good,x:-18,lane:Math.floor(c.r()*3)})}
  function draw(){c.draw('<p><strong>'+esc(sets[si].prompt)+'</strong> (set '+(si+1)+' / 2)</p><p>Hits '+hits+' / '+(per*2)+' · wrong shots '+bad+' / 4'+(c.accessible?' · untimed: press "Advance" to move targets':'')+'</p><div style="position:relative;height:190px;border:1px solid var(--line);border-radius:12px;overflow:hidden">'+
    T.map(function(t){return'<button class="btn" data-a="shoot" data-v="'+t.id+'" style="position:absolute;left:'+t.x+'%;top:'+(t.lane*60+8)+'px;width:17%;font-size:11px;padding:6px 2px">'+esc(t.t)+'</button>'}).join('')+'</div>'+(c.accessible?'<button class="btn" data-a="adv">Advance</button>':''),{shoot:shoot,adv:step})}
  function shoot(v){var t=T.find(function(x){return x.id===Number(v)});if(!t)return;T=T.filter(function(x){return x!==t});if(t.good){hits++;c.good();c.setScore(100*hits/(per*2))}else{bad++;c.miss();c.penalty(8)}
    if(bad>=4)return c.end(false,'Too many wrong shots.');if(hits>=per*2)return c.end(true,'Both sets cleared.');if(hits===per&&si===0){si=1;T=[];c.say('New prompt: '+sets[1].prompt)}draw()}
  function step(){tickN++;T.forEach(function(t){t.x+=speed});T=T.filter(function(t){if(t.x>=100){if(t.good){c.miss();c.say('A valid target escaped: '+t.t)}return false}return true});if(tickN%3===1)spawn();draw()}
  if(!c.accessible)c.every(200,step);
  c.auto=function(){var g=T.find(function(t){return t.good});for(var n=0;!g&&n<12;n++){step();g=T.find(function(t){return t.good})}if(g)shoot(g.id)};
  spawn();draw();
};
G['PL108-062']=function(c){
  var Z=c.pack.zones,laps=3,per=4,n=0,lives=3,items=shuffle(Z.items,c.r);
  function gate(){var it=items[n%items.length],truth=c.r()<.5,zi=truth?it.zone:(it.zone+1+Math.floor(c.r()*(Z.zones.length-1)))%Z.zones.length;
    var lap=Math.floor(n/per)+1;
    c.draw('<p><strong>Lap '+lap+' / '+laps+' · gate '+(n%per+1)+' / '+per+'</strong> · tyres '+lives+'</p><div style="height:10px;background:var(--line);border-radius:6px;margin-bottom:10px"><div style="height:10px;width:'+(n*100/(laps*per))+'%;background:#1f6f78;border-radius:6px"></div></div><div id="ask"></div>');
    c.ask(c.$('#ask'),{q:'Gate ahead: “'+it.t+'” belongs to “'+Z.zones[zi]+'”. Steer left for Yes, right for No.',why:it.why,opts:[{t:'← Yes, it belongs',ok:truth},{t:'No, it does not →',ok:!truth}]},
      function(ok){n++;if(!ok){lives--;c.penalty(15);if(lives<=0)return c.end(false,'You wore out all three tyres.')}if(n>=laps*per)return c.end(true,'You finished all '+laps+' laps with '+lives+' tyres left.');gate()},{seconds:9})}
  c.auto=function(){aa(c)};gate();
};
G['PL108-063']=function(c){
  var T=c.pack.tf,pool=shuffle(T,c.r),wave=0,WAVES=4,shield=3,A=[],pi=0,ROWS=6;
  function newWave(){wave++;if(wave>WAVES)return c.end(true,'The city survived all '+WAVES+' waves with '+shield+' shields.');A=[];
    var need=2,k=0,guard=0;while(A.length<4&&guard++<60){var t=pool[pi++%pool.length],hz=!t[1];if(hz&&need<=0&&A.filter(function(a){return a.hz}).length>=2)continue;A.push({t:t[0],hz:hz,y:A.length%2,live:true,why:t[2]})}
    if(!A.some(function(a){return a.hz})){A[0].hz=true;A[0].t='(Hazard) '+A[0].t}draw()}
  function draw(){c.draw('<p><strong>Wave '+wave+' / '+WAVES+'</strong> · city shields '+shield+'. Each asteroid is a statement. Intercept the <b>false</b> ones; let true ones pass.'+(c.accessible?' (Untimed: press "Advance".)':'')+'</p>'+
    A.map(function(a,i){return'<div style="border:1px solid var(--line);border-radius:10px;padding:8px;margin-bottom:6px;'+(a.live?'':'opacity:.4')+'"><div style="height:6px;background:var(--line);border-radius:4px;margin-bottom:6px"><div style="height:6px;width:'+Math.min(100,a.y*100/ROWS)+'%;background:'+(a.live?'#c0562f':'#999')+';border-radius:4px"></div></div><span class="small">'+esc(a.t)+'</span> <button class="btn" data-a="x" data-v="'+i+'"'+(a.live?'':' disabled')+'>Intercept</button></div>'}).join('')+(c.accessible?'<button class="btn" data-a="adv">Advance</button>':''),{x:hit,adv:tick})}
  function hit(v){var a=A[Number(v)];if(!a||!a.live)return;a.live=false;if(a.hz){c.good();c.say('Intercepted a false statement. '+a.why)}else{c.miss();c.penalty(8);c.say('That statement was true. '+a.why)}settle()}
  function tick(){A.forEach(function(a){if(a.live){a.y++;if(a.y>=ROWS){a.live=false;if(a.hz){shield--;c.miss();c.penalty(15);c.say('A false statement hit the city: '+a.why)}}}});if(shield<=0)return c.end(false,'The city shields failed.');settle()}
  function settle(){if(c.done)return;if(!A.some(function(a){return a.live}))return newWave();draw()}
  if(!c.accessible)c.every(900,tick);
  c.auto=function(){var h=A.findIndex(function(a){return a.live&&a.hz});if(h>=0)return hit(h);for(var i=0;i<ROWS+1&&!c.done;i++)tick()};
  newWave();
};

/* ---------- Sequence Arena (wave 2) ---------- */
G['PL108-065']=function(c){
  var W=c.pack.workflows,wi=0,node,bad=0;
  function start(){node=W[wi].start;draw()}
  function draw(){var w=W[wi],nd=w.nodes[node];c.draw('<p><strong>Workflow '+(wi+1)+' / '+W.length+': '+esc(w.title)+'</strong> · detours '+bad+' / 6</p><h3>'+esc(nd.text)+'</h3>'+shuffle(nd.ch,c.r).map(function(ch,k){return'<button class="quizopt" data-a="ch" data-v="'+esc(ch[1])+'">'+esc(ch[0])+'</button>'}).join(''),
    {ch:function(to){if(to==='bad'){bad++;c.miss();c.penalty(10);c.say('That branch leads to rework. You are sent back to this decision.');if(bad>=6)return c.end(false,'Too much rework.');return draw()}c.good();if(to==='win'){wi++;if(wi>=W.length)return c.end(true,'Both workflows reached a valid end state.');c.say('Workflow complete.');return start()}node=to;draw()}})}
  c.auto=function(){var nd=W[wi].nodes[node],good=nd.ch.find(function(x){return x[1]!=='bad'}),b=Array.from(c.body.querySelectorAll('[data-a=ch]')).find(function(x){return x.dataset.v===good[1]&&x.textContent===good[0]});if(b)b.click()};start();
};
G['PL108-066']=function(c){
  var P=c.pack.pipeline,N=P.nodes,have={},from=-1,wrong=0,hist=[];
  function key(a,b){return a+'>'+b}
  function draw(){c.draw('<p>Connect the components with arrows (from → to) to build a valid end-to-end pipeline. Links '+Object.keys(have).length+' / '+P.edges.length+' · wrong links '+wrong+' / 8</p><p class="small">'+(from<0?'Pick the component the data comes FROM.':'From <b>'+esc(N[from])+'</b>: pick the component it goes TO.')+'</p><div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px">'+N.map(function(n,i){return'<button class="btn'+(from===i?' primary':'')+'" data-a="n" data-v="'+i+'">'+esc(n)+'</button>'}).join('')+'</div><p class="small">Built: '+(hist.map(function(h){return esc(N[h[0]])+' → '+esc(N[h[1]])}).join(' · ')||'nothing yet')+'</p><div class="pager" style="justify-content:flex-start"><button class="btn" data-a="undo">Undo last link</button></div>',
    {n:function(v){var i=Number(v);if(from<0){from=i;return draw()}if(from===i){from=-1;return draw()}var k=key(from,i);
      if(P.edges.some(function(e){return e[0]===from&&e[1]===i})){if(!have[k]){have[k]=1;hist.push([from,i]);c.good();c.setScore(100-wrong*10)}from=-1;if(Object.keys(have).length===P.edges.length)return c.end(true,'The pipeline is complete.');draw()}
      else{wrong++;c.miss();c.setScore(100-wrong*10);c.say(N[from]+' does not hand over directly to '+N[i]+'.');from=-1;if(wrong>=8)return c.end(false,'Too many invalid links.');draw()}},
      undo:function(){var h=hist.pop();if(h)delete have[key(h[0],h[1])];draw()}})}
  c.auto=function(){var e=P.edges.find(function(x){return!have[key(x[0],x[1])]});if(!e)return;if(from!==e[0])clickIn(c,'[data-a=n][data-v="'+e[0]+'"]');if(from===e[0]||true)clickIn(c,'[data-a=n][data-v="'+e[1]+'"]')};
  draw();
};
G['PL108-068']=function(c){
  var S=c.pack.sequences.filter(function(s){return s.steps.length>=6}),sq=pick(S.length?S:c.pack.sequences,2,c.r),si=0,segs,order,placed;
  function build(){var s=sq[si],n=s.steps.length,ch=Math.max(2,Math.ceil(n/3)),parts=[];for(var i=0;i<n;i+=ch)parts.push(s.steps.slice(i,i+ch));segs=shuffle(parts.map(function(p,k){return{k:k,steps:p}}),c.r);placed=[];draw()}
  function draw(){var s=sq[si],used={};placed.forEach(function(k){used[k]=1});
    c.draw('<p><strong>Process '+(si+1)+' / '+sq.length+': '+esc(s.title)+'</strong></p><p class="small">Place the segments in order, first to last.</p><div>'+placed.map(function(k,i){return'<div style="border:1px solid #2e8b57;border-radius:10px;padding:8px;margin-bottom:6px"><b>Position '+(i+1)+'</b><br><span class="small">'+esc(sq[si].steps.slice(segStart(k),segStart(k)+segLen(k)).join(' → '))+'</span></div>'}).join('')+'</div><div>'+segs.filter(function(g){return!used[g.k]}).map(function(g){return'<button class="btn" data-a="p" data-v="'+g.k+'" style="display:block;width:100%;text-align:left;margin-bottom:6px">'+esc(g.steps.join(' → '))+'</button>'}).join('')+'</div><div class="pager" style="justify-content:flex-start"><button class="btn" data-a="reset">Reset</button></div>',
      {p:function(v){placed.push(Number(v));if(placed.length===segs.length){var ok=placed.every(function(k,i){return k===i});if(ok){c.good();si++;if(si>=sq.length)return c.end(true,'Both processes reassembled.');return build()}c.miss();c.penalty(10);c.say('That order breaks the flow. Try again.');placed=[]}draw()},reset:function(){placed=[];draw()}})}
  function segLen(k){var n=sq[si].steps.length,ch=Math.max(2,Math.ceil(n/3));return Math.min(ch,n-k*ch)}
  function segStart(k){return k*Math.max(2,Math.ceil(sq[si].steps.length/3))}
  c.auto=function(){var next=placed.length;clickIn(c,'[data-a=p][data-v="'+next+'"]')};build();
};
G['PL108-069']=function(c){
  var K=c.pack.critical,T=K.tasks,runs=0;
  function draw(){c.draw('<p>Two workers share the work. Assign every task to a worker, then run the schedule. A task starts only when its worker is free and its prerequisites are done. Deadline: <b>'+K.deadline+'</b> hours. Runs '+runs+' / 6.</p><table class="table"><thead><tr><th>Task</th><th>Hours</th><th>Needs</th><th>Worker</th></tr></thead><tbody>'+
    T.map(function(t,i){return'<tr><td>'+esc(t.name)+'</td><td>'+t.dur+'</td><td>'+(t.deps.map(function(d){return esc(T[d].name)}).join(', ')||'—')+'</td><td><select class="wk" data-i="'+i+'" aria-label="worker for '+esc(t.name)+'" style="'+INP+'"><option value="0">Worker 1</option><option value="1">Worker 2</option></select></td></tr>'}).join('')+'</tbody></table><div id="res"></div><button class="btn primary" data-a="run">Run the schedule</button>',{run:run})}
  function sched(){var sel=Array.from(c.body.querySelectorAll('.wk')).map(function(s){return Number(s.value)}),free=[0,0],fin=[],rows=[];T.forEach(function(t,i){var w=sel[i],st=Math.max.apply(null,[free[w]].concat(t.deps.map(function(d){return fin[d]})));fin[i]=st+t.dur;free[w]=fin[i];rows.push([t.name,w+1,st,fin[i]])});return{rows:rows,end:Math.max.apply(null,fin)}}
  function run(){runs++;var r=sched();c.$('#res').innerHTML='<table class="table"><thead><tr><th>Task</th><th>Worker</th><th>Start</th><th>End</th></tr></thead><tbody>'+r.rows.map(function(x){return'<tr><td>'+esc(x[0])+'</td><td>'+x[1]+'</td><td>'+x[2]+'</td><td>'+x[3]+'</td></tr>'}).join('')+'</tbody></table><p><b>Finish: '+r.end+' hours</b> (deadline '+K.deadline+')</p>';
    if(r.end<=K.deadline)return c.end(true,'The schedule finishes in '+r.end+' hours.');c.miss();c.penalty(10);c.say('Too slow: '+r.end+' hours. Move independent work to the other worker.');if(runs>=6)c.end(false,'Out of runs.')}
  c.auto=function(){var s=c.body.querySelectorAll('.wk');K.solution.forEach(function(w,i){s[i].value=w});run()};draw();
};
G['PL108-070']=function(c){
  var F=c.pack.flowfix,fi=0,tries=0;
  function draw(){var f=F[fi];c.draw('<p><strong>Flow '+(fi+1)+' / '+F.length+': '+esc(f.title)+'</strong> · test runs '+tries+' / 6</p><div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center">'+f.nodes.map(function(n,i){var b=f.broken.find(function(x){return x.i===i});return(i?'<span>→</span>':'')+(b?'<select class="fx" data-i="'+i+'" aria-label="node '+(i+1)+'" style="'+INP+'"><option value="-1">Choose a step…</option>'+b.opts.map(function(o,k){return'<option value="'+k+'">'+esc(o)+'</option>'}).join('')+'</select>':'<span class="pill">'+esc(n)+'</span>')}).join('')+'</div><div id="res"></div><p></p><button class="btn primary" data-a="run">Run the tests</button>',{run:run})}
  function run(){var f=F[fi],sel={};c.body.querySelectorAll('.fx').forEach(function(s){sel[s.dataset.i]=Number(s.value)});var pass=0,html='';
    f.tests.forEach(function(t){var b=f.broken.find(function(x){return x.i===t[1]}),ok=sel[t[1]]===b.a;if(ok)pass++;html+='<li>'+(ok?'✅ ':'❌ ')+esc(t[0])+'</li>'});c.$('#res').innerHTML='<ul>'+html+'</ul>';
    if(pass===f.tests.length){c.good();fi++;if(fi>=F.length)return c.end(true,'Both flows pass every test.');c.say('All tests pass. Next flow.');return draw()}tries++;c.miss();c.penalty(8);if(tries>=6)c.end(false,'Too many failed test runs.')}
  c.auto=function(){var f=F[fi];c.body.querySelectorAll('.fx').forEach(function(s){var b=f.broken.find(function(x){return x.i===Number(s.dataset.i)});s.value=b.a});run()};draw();
};
G['PL108-071']=function(c){
  var B=c.pack.bottleneck,bi=0,caps,pts,wrong=0;
  function start(){caps=B[bi].stages.map(function(s){return s[1]});pts=B[bi].points;draw()}
  function thr(){return Math.min.apply(null,caps)}
  function draw(){var b=B[bi];c.draw('<p><strong>'+esc(b.title)+' ('+(bi+1)+' / '+B.length+')</strong> · each point adds '+b.step+' capacity · points left <b>'+pts+'</b></p><table class="table"><thead><tr><th>Stage</th><th>Capacity</th><th></th></tr></thead><tbody>'+caps.map(function(v,i){return'<tr><td>'+esc(b.stages[i][0])+'</td><td>'+v+(v===thr()?' ⚠ bottleneck':'')+'</td><td><button class="btn" data-a="add" data-v="'+i+'"'+(pts<1?' disabled':'')+'>+ point</button> <button class="btn" data-a="sub" data-v="'+i+'"'+(v<=b.stages[i][1]?' disabled':'')+'>−</button></td></tr>'}).join('')+'</tbody></table><p>Throughput = the slowest stage: <b>'+thr()+'</b> · target <b>'+b.target+'</b></p><button class="btn primary" data-a="lock">Lock in this plan</button>',
    {add:function(v){caps[v]+=b.step;pts--;draw()},sub:function(v){caps[v]-=b.step;pts++;draw()},lock:lock})}
  function lock(){var b=B[bi];if(thr()>=b.target){c.good();bi++;if(bi>=B.length)return c.end(true,'Both flows meet their targets.');return start()}wrong++;c.miss();c.penalty(10);c.say('Throughput is still '+thr()+'. Raise the slowest stage.');if(wrong>=5)c.end(false,'Too many failed plans.')}
  c.auto=function(){var b=B[bi];if(pts>0&&thr()<b.target){var i=caps.indexOf(thr());return clickIn(c,'[data-a=add][data-v="'+i+'"]')}lock()};start();
};

/* ---------- Strategy Arena (wave 2) ---------- */
G['PL108-073']=function(c){
  var T=c.pack.tycoon,rd=0,back=0,cost=0,served=0,dem=T.demand.reduce(function(a,b){return a+b},0),log=[];
  function draw(){var d=T.demand[rd];c.draw('<p><strong>Round '+(rd+1)+' / '+T.demand.length+'</strong> · demand <b>'+d+'</b> cases · backlog <b>'+back+'</b> · cost so far '+fmt(cost)+' / '+fmt(T.max_cost)+'</p><p class="small">Each clerk clears '+T.per_clerk+' cases and costs '+T.clerk_cost+'. A quality check costs '+T.qa_cost+'; without it about '+Math.round(T.rework*100)+'% of finished cases come back as rework.</p><div class="pager" style="justify-content:flex-start"><label>Clerks <select id="tk" style="'+INP+'">'+Array.from({length:T.max_clerks},function(_,i){return'<option>'+(i+1)+'</option>'}).join('')+'</select></label><label><input type="checkbox" id="tq" checked> Quality check</label><button class="btn primary" data-a="run">Run the round</button></div><ul class="small">'+log.map(function(l){return'<li>'+esc(l)+'</li>'}).join('')+'</ul>',{run:run})}
  function run(){var d=T.demand[rd],k=Number(c.$('#tk').value),qa=c.$('#tq').checked,need=d+back,done=Math.min(need,k*T.per_clerk);back=need-done+(qa?0:Math.ceil(done*T.rework));served+=Math.min(d,done);cost+=k*T.clerk_cost+(qa?T.qa_cost:0);
    log.push('Round '+(rd+1)+': '+k+' clerks cleared '+done+' of '+need+'; backlog now '+back+'.');rd++;c.setScore(100*served/dem);
    if(rd>=T.demand.length){var ok=served/dem>=T.serve_target&&back<=T.max_backlog&&cost<=T.max_cost;return c.end(ok,'Served '+Math.round(100*served/dem)+'% of demand, backlog '+back+', cost '+fmt(cost)+'. Targets: at least '+Math.round(T.serve_target*100)+'% served, backlog at most '+T.max_backlog+', cost at most '+fmt(T.max_cost)+'.')}draw()}
  c.auto=function(){var d=T.demand[rd],k=Math.min(T.max_clerks,Math.ceil((d+back)/T.per_clerk));c.$('#tk').value=k;c.$('#tq').checked=true;run()};draw();
};
G['PL108-076']=function(c){
  var N=c.pack.network,R=N.rounds,S=N.solutions,ri=0,wrong=0;
  function draw(){var r=R[ri];c.draw('<p><strong>Round '+(ri+1)+' / '+R.length+'</strong> · supply '+r.supply+' units · wrong shipments '+wrong+' / 5</p><p class="small">Route 1 serves Area A only (capacity '+r.caps[0]+'). Route 2 serves Area B only (capacity '+r.caps[1]+'). Route 3 is flexible (capacity '+r.caps[2]+') and can serve either area. Area A needs '+r.needA+'; Area B needs '+r.needB+'.</p><div class="pager" style="justify-content:flex-start">'+[['r1','Route 1 → A'],['r2','Route 2 → B'],['fa','Route 3 → A'],['fb','Route 3 → B']].map(function(x){return'<label>'+x[1]+' <input class="nw" id="'+x[0]+'" type="number" min="0" value="0" style="width:70px;'+INP+'"></label>'}).join('')+'</div><p id="sum" class="small"></p><button class="btn primary" data-a="send">Send the shipment</button>',{send:send});
    c.body.querySelectorAll('.nw').forEach(function(i){i.oninput=sum});sum()}
  function vals(){return{r1:Number(c.$('#r1').value)||0,r2:Number(c.$('#r2').value)||0,fa:Number(c.$('#fa').value)||0,fb:Number(c.$('#fb').value)||0}}
  function sum(){var v=vals(),r=R[ri];c.$('#sum').textContent='Total sent '+(v.r1+v.r2+v.fa+v.fb)+' of '+r.supply+' · Area A gets '+(v.r1+v.fa)+' · Area B gets '+(v.r2+v.fb)}
  function send(){var v=vals(),r=R[ri],why='';if(v.r1>r.caps[0]||v.r2>r.caps[1]||v.fa+v.fb>r.caps[2])why='A route is over capacity.';else if(v.r1+v.r2+v.fa+v.fb>r.supply)why='You sent more than the supply.';else if(v.r1+v.fa<r.needA)why='Area A is short.';else if(v.r2+v.fb<r.needB)why='Area B is short.';
    if(!why){c.good();ri++;if(ri>=R.length)return c.end(true,'All three rounds delivered.');c.say('Delivered. The network changes next round.');return draw()}wrong++;c.miss();c.penalty(10);c.say(why);if(wrong>=5)c.end(false,'Too many failed shipments.')}
  c.auto=function(){var s=S[ri];c.$('#r1').value=s[0];c.$('#r2').value=s[1];c.$('#fa').value=s[3];c.$('#fb').value=s[2]-s[3];send()};draw();
};
G['PL108-077']=function(c){
  var F=c.pack.factory,J=F.jobs,tries=0;
  function draw(){c.draw('<p>Schedule every job on one of two machines. Jobs on the same machine cannot overlap. Linked jobs (conflicts) cannot run at the same time even on different machines. Every job must end by its deadline. Runs '+tries+' / 6.</p><table class="table"><thead><tr><th>Job</th><th>Hours</th><th>Deadline</th><th>Machine</th><th>Start at</th></tr></thead><tbody>'+
    J.map(function(j,i){return'<tr><td>'+esc(j[0])+'</td><td>'+j[1]+'</td><td>'+j[2]+'</td><td><select class="fm" data-i="'+i+'" aria-label="machine for '+esc(j[0])+'" style="'+INP+'"><option value="0">M1</option><option value="1">M2</option></select></td><td><select class="fs" data-i="'+i+'" aria-label="start for '+esc(j[0])+'" style="'+INP+'">'+Array.from({length:11},function(_,k){return'<option>'+k+'</option>'}).join('')+'</select></td></tr>'}).join('')+'</tbody></table><p class="small">Conflicts: '+F.conflicts.map(function(x){return esc(J[x[0]][0])+' and '+esc(J[x[1]][0])}).join('; ')+'.</p><div id="res"></div><button class="btn primary" data-a="run">Check the schedule</button>',{run:run})}
  function run(){var m=Array.from(c.body.querySelectorAll('.fm')).map(function(s){return Number(s.value)}),st=Array.from(c.body.querySelectorAll('.fs')).map(function(s){return Number(s.value)}),errs=[];
    function ov(a,b){return st[a]<st[b]+J[b][1]&&st[b]<st[a]+J[a][1]}
    J.forEach(function(j,i){if(st[i]+j[1]>j[2])errs.push(j[0]+' ends after its deadline.')});
    for(var a=0;a<J.length;a++)for(var b=a+1;b<J.length;b++){if(m[a]===m[b]&&ov(a,b))errs.push(J[a][0]+' and '+J[b][0]+' overlap on machine M'+(m[a]+1)+'.')}
    F.conflicts.forEach(function(x){if(ov(x[0],x[1]))errs.push(J[x[0]][0]+' and '+J[x[1]][0]+' cannot run together.')});
    if(!errs.length)return c.end(true,'A conflict-free schedule that meets every deadline.');tries++;c.miss();c.penalty(8);c.$('#res').innerHTML='<ul>'+errs.map(function(e){return'<li>❌ '+esc(e)+'</li>'}).join('')+'</ul>';if(tries>=6)c.end(false,'Out of attempts.')}
  c.auto=function(){F.solution.forEach(function(s,i){c.body.querySelectorAll('.fm')[i].value=s[0];c.body.querySelectorAll('.fs')[i].value=s[1]});run()};draw();
};
G['PL108-078']=function(c){
  var T=c.pack.talent,sel=[],tries=0;
  function draw(){var sum=T.abilities.map(function(_,k){return sel.reduce(function(a,i){return a+T.cands[i][1+k]},0)}),cost=sel.reduce(function(a,i){return a+T.cands[i][5]},0);
    c.draw('<p>Pick a team of '+T.size+'. Needs: '+T.abilities.map(function(a,k){return esc(a)+' ≥ '+T.need[k]}).join(', ')+'. Budget ≤ '+T.budget+'. Attempts '+tries+' / 6.</p><div style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px">'+T.cands.map(function(p,i){return'<button class="btn'+(sel.indexOf(i)>=0?' primary':'')+'" data-a="p" data-v="'+i+'" style="text-align:left"><b>'+esc(p[0])+'</b> · '+T.abilities.map(function(a,k){return a[0]+p[1+k]}).join(' ')+' · cost '+p[5]+'</button>'}).join('')+'</div><p>Team: '+(sel.map(function(i){return T.cands[i][0]}).join(', ')||'none')+' · totals '+T.abilities.map(function(a,k){return a[0]+' '+sum[k]}).join(', ')+' · cost '+cost+'</p><button class="btn primary" data-a="go"'+(sel.length===T.size?'':' disabled')+'>Run the challenge</button>',
      {p:function(v){var i=Number(v),k=sel.indexOf(i);if(k>=0)sel.splice(k,1);else if(sel.length<T.size)sel.push(i);draw()},go:go})}
  function go(){var sum=T.abilities.map(function(_,k){return sel.reduce(function(a,i){return a+T.cands[i][1+k]},0)}),cost=sel.reduce(function(a,i){return a+T.cands[i][5]},0),why=[];
    T.abilities.forEach(function(a,k){if(sum[k]<T.need[k])why.push(a+' is '+sum[k]+', needs '+T.need[k])});if(cost>T.budget)why.push('cost '+cost+' is over '+T.budget);
    if(!why.length)return c.end(true,'The team passes the challenge.');tries++;c.miss();c.penalty(10);c.say('Not yet: '+why.join('; ')+'.');if(tries>=6)c.end(false,'Out of attempts.')}
  c.auto=function(){if(sel.length<T.size){var next=T.solution.find(function(i){return sel.indexOf(i)<0});return clickIn(c,'[data-a=p][data-v="'+next+'"]')}clickIn(c,'[data-a=go]')};draw();
};
G['PL108-080']=function(c){
  var D=c.pack.duel,rd=0,me=0,rv=0,log=[];
  function draw(){c.draw('<p><strong>Round '+(rd+1)+' / '+D.rounds+'</strong> · you '+me+' · rival '+rv+'</p><p class="small">'+esc(D.note)+'</p><table class="table"><thead><tr><th>Your move \\ rival move</th>'+D.moves.map(function(m){return'<th>'+esc(m)+'</th>'}).join('')+'</tr></thead><tbody>'+D.moves.map(function(m,i){return'<tr><th>'+esc(m)+'</th>'+D.moves.map(function(_,j){return'<td>you '+D.mine[i][j]+' / rival '+D.theirs[j][i]+'</td>'}).join('')+'</tr>'}).join('')+'</tbody></table><div class="pager" style="justify-content:flex-start">'+D.moves.map(function(m,i){return'<button class="btn primary" data-a="mv" data-v="'+i+'">Play '+esc(m)+'</button>'}).join('')+'</div><ul class="small">'+log.map(function(l){return'<li>'+esc(l)+'</li>'}).join('')+'</ul>',{mv:play})}
  function play(v){var m=Number(v),r=D.cycle[rd%D.cycle.length],a=D.mine[m][r],b=D.theirs[r][m];me+=a;rv+=b;log.push('Round '+(rd+1)+': you '+D.moves[m]+' vs rival '+D.moves[r]+' → you +'+a+', rival +'+b);rd++;c.good();c.setScore(100*me/(me+rv));
    if(rd>=D.rounds)return c.end(me>rv,'Final score: you '+me+', rival '+rv+(me>rv?'.':'. You needed more than the rival.'));draw()}
  c.auto=function(){var r=D.cycle[rd%D.cycle.length],best=0;D.mine.forEach(function(row,i){if(row[r]>D.mine[best][r])best=i});clickIn(c,'[data-a=mv][data-v="'+best+'"]')};draw();
};
G['PL108-081']=function(c){
  var C=c.pack.crisis,h=C.start.slice(),turn=0,ap=C.energy;
  function grow(){h=h.map(function(x,i){return(turn+i)%2===0?x+C.grow:x})}
  function draw(){c.draw('<p><strong>Turn '+(turn+1)+' / '+C.turns+'</strong> · action points <b>'+ap+'</b>. Bring every hazard to '+C.safe+' or lower. Each action cuts one hazard by '+C.relief+'. Hazards grow between turns; any hazard reaching 8 is a breach.</p>'+h.map(function(v,i){return'<div style="display:flex;gap:10px;align-items:center;margin-bottom:6px"><span style="width:160px">'+esc(C.hazards[i])+'</span><div style="flex:1;height:14px;background:var(--line);border-radius:7px"><div style="height:14px;width:'+Math.min(100,v*100/8)+'%;background:'+(v>=6?'#c0562f':v>C.safe?'#c98a00':'#2e8b57')+';border-radius:7px"></div></div><b>'+v+'</b><button class="btn" data-a="fix" data-v="'+i+'"'+(ap<1||v<=0?' disabled':'')+'>Contain</button></div>'}).join('')+'<button class="btn primary" data-a="end">End turn</button>',{fix:function(v){h[v]=Math.max(0,h[v]-C.relief);ap--;c.good();c.setScore(100-Math.max.apply(null,h)*12);if(ap<=0)return endTurn();draw()},end:endTurn})}
  function endTurn(){if(Math.max.apply(null,h)<=C.safe)return c.end(true,'All hazards are at a safe level on turn '+(turn+1)+'.');turn++;if(turn>=C.turns)return c.end(false,'The turns ran out with hazards still above the safe level.');ap=C.energy;grow();if(Math.max.apply(null,h)>=8)return c.end(false,'A hazard reached breach level.');draw()}
  c.auto=function(){var i=h.indexOf(Math.max.apply(null,h));if(ap>0&&h[i]>0&&h[i]>C.safe)return clickIn(c,'[data-a=fix][data-v="'+i+'"]');clickIn(c,'[data-a=end]')};
  grow();draw();
};

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
  c.draw('<p>'+esc(I.note)+' Runs '+runs+' / 6.</p><table class="table"><thead><tr><th>Field</th><th>Employee Central value</th><th>Payroll code</th></tr></thead><tbody>'+I.rows.map(function(r,i){return'<tr><td>'+esc(r[0])+'</td><td>'+esc(r[1])+'</td><td><select class="im" data-f="'+esc(r[0])+'" aria-label="payroll code for '+esc(r[0])+'" style="'+INP+'"><option value="">?</option>'+r[2].map(function(o){return'<option>'+esc(o)+'</option>'}).join('')+'</select></td></tr>'}).join('')+'</tbody></table><div id="res"></div><button class="btn primary" data-a="run">Run the integration tests</button>',{run:run});
  function run(){runs++;var pass=0,html='';c.body.querySelectorAll('.im').forEach(function(s,i){var ok=s.value===right[s.dataset.f];if(ok)pass++;html+='<li>'+(ok?'✅ ':'❌ ')+'TEST-IN-00'+(i+1)+' replicates with '+esc(s.dataset.f)+'</li>'});c.$('#res').innerHTML='<ul>'+html+'</ul>';
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
  function draw(){c.draw('<p><strong>Puzzle '+(pi+1)+' / '+P.length+'</strong> · target <b>'+P[pi].target+'</b> · moves '+moves+'. Combine two numbers with an operation. Numbers are in thousands of INR.</p><div class="pager" style="justify-content:flex-start">'+cards.map(function(v,i){return'<button class="btn'+(sel===i?' primary':'')+'" data-a="cd" data-v="'+i+'" style="font-size:20px;min-width:64px">'+v+'</button>'}).join('')+'</div><p class="small">'+(sel<0?'Pick a first number.':op?'Now pick the second number.':'Pick an operation.')+'</p><div class="pager" style="justify-content:flex-start">'+['+','-','*','/'].map(function(o){return'<button class="btn'+(op===o?' primary':'')+'" data-a="op" data-v="'+o+'" style="font-size:20px">'+SYM[o]+'</button>'}).join('')+'<button class="btn" data-a="undo">Undo</button><button class="btn" data-a="reset">Reset</button></div>',
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
  function draw(){c.draw('<p><strong>Lock '+(i+1)+' / '+E.length+'</strong> · wrong tries '+wrong+' / 5</p><p style="font-size:20px">'+esc(E[i][0])+'</p><p class="small">Solve for x (an amount in INR).</p><div class="pager" style="justify-content:flex-start"><input id="eq" aria-label="value of x" style="'+INP+'"><button class="btn primary" data-a="go">Try the code</button></div>',{go:go})}
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
  function draw(){var s=B[bi];c.draw('<p><strong>'+esc(s.title)+' ('+(bi+1)+' / '+B.length+')</strong> · fixed cost '+fmt(s.fixed)+' · capacity '+s.cap+' payslips · failed months '+wrong+' / 5</p><p class="small">Higher prices reduce demand (demand = '+s.demand[0]+' − '+s.demand[1]+' × price). Reach break-even (profit of zero or more) while serving at least '+s.min_units+' payslips.</p><div class="pager" style="justify-content:flex-start"><label>Price per payslip <select id="pr" style="'+INP+'">'+(function(){var o='';for(var p=s.price[0];p<=s.price[1];p+=s.price[2])o+='<option>'+p+'</option>';return o})()+'</select></label><label>Method <select id="vc" style="'+INP+'">'+s.costs.map(function(x,k){return'<option value="'+k+'">Cost '+x[0]+' per payslip'+(x[1]?' (+'+fmt(x[1])+' setup)':'')+'</option>'}).join('')+'</select></label></div><p id="out"></p><button class="btn primary" data-a="go">Close the month</button>',{go:go});
    c.$('#pr').onchange=show;c.$('#vc').onchange=show;show()}
  function go(){var r=calc(),s=B[bi];if(r.profit>=0&&r.u>=s.min_units){c.good();bi++;if(bi>=B.length)return c.end(true,'You broke even in all three months.');c.say('Break-even reached.');return draw()}wrong++;c.miss();c.penalty(10);c.say(r.u<s.min_units?'Too few payslips served.':'The month made a loss.');if(wrong>=5)c.end(false,'Too many loss-making months.')}
  c.auto=function(){var s=B[bi],best=null;for(var p=s.price[0];p<=s.price[1];p+=s.price[2])s.costs.forEach(function(x,k){var u=Math.min(s.cap,Math.max(0,s.demand[0]-s.demand[1]*p)),pf=u*(p-x[0])-s.fixed-x[1];if(u>=s.min_units&&pf>=0&&(!best||pf>best.pf))best={p:p,k:k,pf:pf}});
    c.$('#pr').value=best.p;c.$('#vc').value=best.k;go()};draw();
};
G['PL108-108']=function(c){
  var P=c.pack.profit,ri=0,cash=P.start,carry=0;
  function draw(){var r=P.rounds[ri];c.draw('<p><strong>Quarter '+(ri+1)+' / '+P.rounds.length+'</strong> · surplus so far <b>'+fmt(cash)+'</b> · target '+fmt(P.target)+' · carried over '+fmt(carry)+'</p><h3>'+esc(r.text)+'</h3>'+r.opts.map(function(o,k){return'<button class="quizopt" data-a="o" data-v="'+k+'">'+esc(o.t)+' — now '+(o.now>=0?'+':'')+o.now+', next quarter '+(o.nxt>=0?'+':'')+o.nxt+'</button>'}).join(''),
    {o:function(v){var o=r.opts[Number(v)];cash+=o.now+carry;carry=o.nxt;ri++;c.good();c.setScore(Math.max(0,cash)*100/P.target);if(ri>=P.rounds.length){cash+=carry;return c.end(cash>=P.target,'Final surplus '+fmt(cash)+'. Target '+fmt(P.target)+'.')}draw()}})}
  c.auto=function(){var best=null,bv=-1e9;(function rec(i,cs,cr,seq){if(i>=P.rounds.length){var t=cs+cr;if(t>bv){bv=t;best=seq.slice()}return}P.rounds[i].opts.forEach(function(o,k){seq.push(k);rec(i+1,cs+o.now+cr,o.nxt,seq);seq.pop()})})(ri,cash,carry,[]);clickIn(c,'[data-a=o][data-v="'+best[0]+'"]')};draw();
};

return{init:init,view:view,stop:stop,auto:auto,state:state,start:start,count:function(){return Object.keys(G).length},ids:function(){return Object.keys(G)}};
})();
