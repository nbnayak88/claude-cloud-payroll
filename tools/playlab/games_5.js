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
