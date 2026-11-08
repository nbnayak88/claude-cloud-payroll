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
  function ai(){var L=lines3(),m,k;if(c.r()<.3){var fr=b.map(function(v,i){return v?-1:i}).filter(function(i){return i>=0});if(fr.length)return fr[Math.floor(c.r()*fr.length)]}for(var p of['O','X']){for(k=0;k<L.length;k++){var l=L[k],v=l.map(function(i){return b[i]});if(v.filter(function(x){return x===p}).length===2&&v.indexOf('')>=0)return l[v.indexOf('')]}}
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

return{init:init,view:view,stop:stop,auto:auto,state:state,start:start,count:function(){return Object.keys(G).length},ids:function(){return Object.keys(G)}};
})();
