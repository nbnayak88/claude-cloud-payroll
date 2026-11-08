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
