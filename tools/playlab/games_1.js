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
