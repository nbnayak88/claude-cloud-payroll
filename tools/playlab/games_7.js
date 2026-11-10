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
G['PL108-038']=function(c){logicGame(c,c.pack.logic1,'Match each '+c.pack.logic1.cats[0].toLowerCase()+' with a '+c.pack.logic1.cats[1].toLowerCase()+' and a '+c.pack.logic1.cats[2].toLowerCase()+'. All of this is fictional.')};
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
  var stages=[[U('stage1','Prepare the cutover'),[['Quiz check',nq],['Odd one out',oq]]],[U('stage2','Replicate and verify'),[['Term check',dq],['True or false',tq]]],[U('stage3','Release the pay'),[['Numbers check',pq],['Final quiz',nq]]]],si=0,oi=0,wrong=0,done=0,TOTAL=6;
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
