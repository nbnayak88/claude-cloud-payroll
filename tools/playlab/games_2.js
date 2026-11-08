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
