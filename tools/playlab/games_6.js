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
