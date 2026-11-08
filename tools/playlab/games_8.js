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
