(function(){
'use strict';

/* ---------- constants & helpers ---------- */
const MINUS='\u2212';
const W=760,H=420,CX=380,CY=210,SX=52,HH=150,LEFT=34,RIGHT=726;
const RIDES=8;
const px=x=>CX+x*SX;
const rnd=n=>Math.floor(Math.random()*n);
const pick=a=>a[rnd(a.length)];
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=rnd(i+1);[a[i],a[j]]=[a[j],a[i]]}return a};
const reduceMotion=()=>window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const fmt=x=>x<0?MINUS+(-x):String(x);
const X_='<i>x</i>';
const sup=m=>m>1?'<sup>'+m+'</sup>':'';
const coefLead=a=>a===1?'':a===-1?MINUS:(a<0?MINUS+(-a):String(a));

function polyMul(p,q){const r=Array(p.length+q.length-1).fill(0);p.forEach((a,i)=>q.forEach((b,j)=>{r[i+j]+=a*b}));return r}
function evalPoly(c,x){let s=0;for(let i=c.length-1;i>=0;i--)s=s*x+c[i];return s}
function linHTML(r,m){const base=r===0?X_:'('+X_+' '+(r>0?MINUS:'+')+' '+Math.abs(r)+')';return base+sup(m)}
function polyHTML(c){
  let out='',first=true;
  for(let i=c.length-1;i>=0;i--){
    const a=c[i];if(a===0)continue;
    const abs=Math.abs(a);
    const body=i===0?String(abs):(abs===1?'':String(abs))+X_+sup(i);
    if(first){out+=(a<0?MINUS:'')+body;first=false}
    else out+=' '+(a<0?MINUS:'+')+' '+body;
  }
  return out||'0';
}
function factoredHTML(p){
  let s=coefLead(p.a);
  p.lin.forEach(z=>{s+=linHTML(z.r,z.m)});
  p.irr.forEach(q=>{s+='('+polyHTML([q.c,q.b,1])+')'});
  return s;
}
const fOf='<i>f</i>('+X_+') = ';

/* ---------- problem model ---------- */
function makeProblem(a,rootList,irr,extra){
  const counts={};rootList.forEach(r=>{counts[r]=(counts[r]||0)+1});
  const lin=Object.keys(counts).map(Number).sort((u,v)=>u-v).map(r=>({r,m:counts[r]}));
  let coeffs=[a];
  lin.forEach(z=>{for(let k=0;k<z.m;k++)coeffs=polyMul(coeffs,[-z.r,1])});
  irr.forEach(q=>{coeffs=polyMul(coeffs,[q.c,q.b,1])});
  const degree=coeffs.length-1;
  const right=a>0?'up':'down';
  const left=degree%2===0?right:(right==='up'?'down':'up');
  const truth={};lin.forEach(z=>{truth[z.r]=z.m%2===0?'bounce':'cross'});
  return Object.assign({a,lin,irr,coeffs,degree,left,right,truth},extra||{});
}

/* Easy mode: already factored */
function genEasy(i){
  const L=Math.min(3,Math.floor(i/2));
  const maxDeg=[3,4,5,6][L],maxM=[2,2,3,4][L];
  const aPool=[[1,2],[1,2,-1,-2],[1,2,-1,-2,3,-3],[1,-1,2,-2,3,-3]][L];
  const nz=[2,2+rnd(2),2+rnd(3),3+rnd(2)][L];
  const ms=Array(nz).fill(1);let deg=nz,guard=0;
  while(deg<maxDeg&&guard++<30){
    const k=rnd(nz);
    if(ms[k]<maxM&&(Math.random()<0.8||ms.every(m=>m===1))){ms[k]++;deg++}
  }
  if(ms.every(m=>m===1))ms[0]++;
  const roots=shuffle([-5,-4,-3,-2,-1,0,1,2,3,4,5]).slice(0,nz);
  const list=[];roots.forEach((r,k)=>{for(let j=0;j<ms[k];j++)list.push(r)});
  return makeProblem(pick(aPool),list,[],{tmpl:'easy'});
}

/* Factor-first mode: given expanded, student finds real zeros */
const TEMPL=[
  {name:'gcf',make(){
    const k=1+rnd(2),nz=[-4,-3,-2,-1,1,2,3,4];
    const p=pick(nz),q=Math.random()<0.2?p:pick(nz.filter(v=>v!==p));
    const a=pick([1,1,2,3,-1,-2]);
    const roots=[...Array(k).fill(0),p,q];
    return makeProblem(a,roots,[],{
      h1:'Look for a common factor in every term first.',
      h2:'Pull it out: '+coefLead(a)+X_+sup(k)+'('+polyHTML([p*q,-(p+q),1])+')'
    });
  }},
  {name:'group',make(){
    const p=pick([-4,-3,-2,-1,1,2,3,4]),s=1+rnd(4),a=pick([1,1,-1,2]);
    return makeProblem(a,[p,s,-s],[],{
      h1:'Four terms? Try factoring by grouping.',
      h2:'Grouping gives '+coefLead(a)+linHTML(p,1)+'('+X_+'<sup>2</sup> '+MINUS+' '+(s*s)+')'
    });
  }},
  {name:'quad',make(){
    const a=pick([1,-1,2]);
    if(Math.random()<0.6){
      const s=1+rnd(4),t=1+rnd(4);
      return makeProblem(a,[s,-s,t,-t],[],{
        h1:'Only even powers show up. Try letting u = '+X_+'<sup>2</sup>.',
        h2:'That factors as '+coefLead(a)+'('+X_+'<sup>2</sup> '+MINUS+' '+(s*s)+')('+X_+'<sup>2</sup> '+MINUS+' '+(t*t)+')'
      });
    }
    const s=1+rnd(4),t=1+rnd(3);
    return makeProblem(a,[s,-s],[{b:0,c:t*t}],{
      h1:'Only even powers show up. Try letting u = '+X_+'<sup>2</sup>.',
      h2:'That factors as '+coefLead(a)+'('+X_+'<sup>2</sup> '+MINUS+' '+(s*s)+')('+X_+'<sup>2</sup> + '+(t*t)+')'
    });
  }},
  {name:'cube',make(){
    const r=1+rnd(3),diff=Math.random()<0.5,a=pick([1,-1,2]);
    return makeProblem(a,[diff?r:-r],[{b:diff?r:-r,c:r*r}],{
      h1:'Cubes! Look for a sum or difference of cubes.',
      h2:'Use a<sup>3</sup> '+MINUS+' b<sup>3</sup> = (a '+MINUS+' b)(a<sup>2</sup> + ab + b<sup>2</sup>) or a<sup>3</sup> + b<sup>3</sup> = (a + b)(a<sup>2</sup> '+MINUS+' ab + b<sup>2</sup>).'
    });
  }},
  {name:'gcfirr',make(){
    const t=1+rnd(3),a=pick([1,2,-1]);
    return makeProblem(a,[0],[{b:0,c:t*t}],{
      h1:'Factor out the common factor, then look at what is left.',
      h2:'Pull it out: '+coefLead(a)+X_+'('+X_+'<sup>2</sup> + '+(t*t)+')'
    });
  }}
];
function genFactor(i,last){
  const pool=TEMPL.slice(0,Math.min(TEMPL.length,2+Math.floor(i/2)));
  const cand=pool.filter(t=>t.name!==last);
  const t=pick(cand.length?cand:pool);
  const p=t.make();p.tmpl=t.name;return p;
}

const ENDS_RULE='Ends rule: an odd degree sends the ends opposite ways, an even degree sends them the same way. A positive leading coefficient sends the right end up.';
const ZERO_RULE='Zeros rule: an odd exponent passes through the axis, an even exponent bounces off it.';
function hintsFor(p,mode){
  if(mode==='easy'){
    return [
      'Add up the exponents to get the degree: <b>'+p.degree+'</b>. The number out front is the leading coefficient: <b>'+fmt(p.a)+'</b>.',
      ENDS_RULE,ZERO_RULE
    ];
  }
  return [
    p.h1,p.h2,
    'The leading term is '+coefLead(p.a)+X_+sup(p.degree)+'. '+ENDS_RULE,
    ZERO_RULE+' A factor that shows up an odd number of times passes through; an even number of times bounces.'
  ];
}

/* ---------- track geometry ---------- */
// Monotone cubic (Fritsch-Carlson) through points; points flagged "flat" get a horizontal tangent
function hermiteLine(pts){
  const n=pts.length,d=[],m=[];
  for(let i=0;i<n-1;i++)d[i]=(pts[i+1].Y-pts[i].Y)/(pts[i+1].X-pts[i].X);
  m[0]=d[0];m[n-1]=d[n-2];
  for(let i=1;i<n-1;i++)m[i]=d[i-1]*d[i]<=0?0:(d[i-1]+d[i])/2;
  for(let i=0;i<n-1;i++){
    if(d[i]===0){m[i]=0;m[i+1]=0;continue}
    const a=m[i]/d[i],b=m[i+1]/d[i],s=a*a+b*b;
    if(s>9){const t=3/Math.sqrt(s);m[i]=t*a*d[i];m[i+1]=t*b*d[i]}
  }
  pts.forEach((q,i)=>{if(q.flat)m[i]=0});
  const line=[];
  for(let i=0;i<n-1;i++){
    const x0=pts[i].X,x1=pts[i+1].X,h=x1-x0,steps=Math.max(2,Math.ceil(h/2));
    for(let k=0;k<steps;k++){
      const t=k/steps,t2=t*t,t3=t2*t;
      const y=(2*t3-3*t2+1)*pts[i].Y+(t3-2*t2+t)*h*m[i]+(-2*t3+3*t2)*pts[i+1].Y+(t3-t2)*h*m[i+1];
      line.push({x:x0+t*h,y});
    }
  }
  line.push({x:pts[n-1].X,y:pts[n-1].Y});
  return line;
}
function pathFromLine(line){
  const cum=[0];
  for(let i=1;i<line.length;i++)cum.push(cum[i-1]+Math.hypot(line[i].x-line[i-1].x,line[i].y-line[i-1].y));
  const total=cum[cum.length-1];
  const d='M'+line.map(q=>q.x.toFixed(1)+' '+q.y.toFixed(1)).join(' L');
  function poseAt(s){
    s=Math.max(0,Math.min(total,s));
    let lo=0,hi=cum.length-1;
    while(hi-lo>1){const mid=(lo+hi)>>1;if(cum[mid]<=s)lo=mid;else hi=mid}
    const f=cum[hi]===cum[lo]?0:(s-cum[lo])/(cum[hi]-cum[lo]);
    const X=line[lo].x+(line[hi].x-line[lo].x)*f,Y=line[lo].y+(line[hi].y-line[lo].y)*f;
    const j1=Math.max(0,lo-3),j2=Math.min(line.length-1,hi+3);
    const a=Math.atan2(line[j2].y-line[j1].y,line[j2].x-line[j1].x)*180/Math.PI;
    return {X,Y,a};
  }
  function sAtX(X){
    for(let i=0;i<line.length;i++)if(line[i].x>=X)return cum[i];
    return total;
  }
  return {d,line,cum,total,poseAt,sAtX};
}

// The true graph (shown after a successful ride or "show me the answer")
function buildTrack(p){
  const sgnR=p.a>0?1:-1;
  const sgnL=p.degree%2===0?sgnR:-sgnR;
  const pts=[{X:LEFT,Y:CY-sgnL*HH}];
  p.lin.forEach(z=>pts.push({X:px(z.r),Y:CY,flat:z.m>=2}));
  const xs=[],ys=[];
  for(let x=-6.4;x<=6.4001;x+=0.01){xs.push(x);ys.push(evalPoly(p.coeffs,x))}
  const ex=[];
  for(let i=1;i<xs.length-1;i++){
    const y=ys[i];
    const isMax=y>ys[i-1]&&y>ys[i+1],isMin=y<ys[i-1]&&y<ys[i+1];
    if(!(isMax||isMin))continue;
    if(Math.abs(y)<1e-6)continue;
    if(p.lin.some(z=>Math.abs(z.r-xs[i])<0.06))continue;
    ex.push({x:xs[i],y});
  }
  const maxAbs=ex.reduce((m,e)=>Math.max(m,Math.abs(e.y)),0)||1;
  ex.forEach(e=>{
    const h=HH*(0.28+0.57*Math.sqrt(Math.abs(e.y)/maxAbs));
    const X=px(e.x);
    if(pts.some(q=>Math.abs(q.X-X)<8))return;
    pts.push({X,Y:CY-Math.sign(e.y)*h});
  });
  pts.push({X:RIGHT,Y:CY-sgnR*HH});
  pts.sort((u,v)=>u.X-v.X);
  return pathFromLine(hermiteLine(pts));
}

// The student's own sketch, built live from their clicks.
// Signs flow left to right from the left end (and right to left from the right end):
// passing through flips the side of the axis, bouncing keeps it.
function buildSketch(){
  const easy=S.mode==='easy';
  const xs=(easy?S.spotXs.slice():S.spotXs.filter(x=>S.spots[x])).sort((a,b)=>a-b);
  const zs=xs.map(x=>({x,st:S.spots[x]}));
  const n=zs.length;
  const sgn=d=>d==='up'?1:-1;
  const sg=Array(n+1).fill(null),bs=Array(n+1).fill(null);
  if(S.sel.left){
    let cur=sgn(S.sel.left);sg[0]=cur;
    for(let i=0;i<n;i++){if(!zs[i].st)break;cur=zs[i].st==='cross'?-cur:cur;sg[i+1]=cur}
  }
  if(S.sel.right){
    let cur=sgn(S.sel.right);bs[n]=cur;
    for(let i=n-1;i>=0;i--){if(!zs[i].st)break;cur=zs[i].st==='cross'?-cur:cur;bs[i]=cur}
  }
  let inconsistent=false;
  for(let k=0;k<=n;k++){
    if(sg[k]!==null&&bs[k]!==null){if(sg[k]!==bs[k])inconsistent=true}
    else if(sg[k]===null&&bs[k]!==null)sg[k]=bs[k];
  }
  const runs=[];
  if(n===0){
    // no zeros yet: just short stubs coming in from each chosen end
    if(S.sel.left){const s=sgn(S.sel.left);runs.push(pathFromLine(hermiteLine([{X:LEFT,Y:CY-s*HH},{X:LEFT+120,Y:CY-s*HH*0.55}])))}
    if(S.sel.right){const s=sgn(S.sel.right);runs.push(pathFromLine(hermiteLine([{X:RIGHT-120,Y:CY-s*HH*0.55},{X:RIGHT,Y:CY-s*HH}])))}
    return {runs,full:null,inconsistent:false};
  }
  const zp=i=>({X:px(zs[i].x),Y:CY,flat:zs[i].st==='bounce'});
  let cur=null;
  const flush=()=>{if(cur&&cur.length>1)runs.push(pathFromLine(hermiteLine(cur)));cur=null};
  for(let k=0;k<=n;k++){
    const s=sg[k];
    if(s===null){flush();continue}
    const A=k===0?{X:LEFT,Y:CY-s*HH}:zp(k-1);
    const B=k===n?{X:RIGHT,Y:CY-s*HH}:zp(k);
    if(!cur)cur=[A];
    if(k>0&&k<n){
      const h=Math.min(0.6*HH,Math.max(0.3*HH,(B.X-A.X)*0.3));
      cur.push({X:(A.X+B.X)/2,Y:CY-s*h});
    }
    cur.push(B);
  }
  flush();
  const complete=sg.every(v=>v!==null);
  return {runs,full:(runs.length===1&&complete)?runs[0]:null,inconsistent};
}

/* ---------- game state ---------- */
const S={screen:'start',mode:null,ride:0,total:0,results:[],errors:{ends:0,behavior:0,zeros:0},lastTmpl:null,
  prob:null,track:null,spotXs:[],hintList:[],sel:{left:null,right:null},spots:{},wrong:0,hints:0,
  phase:'edit',revealX:0,cart:null,crash:null,flag:null,msg:'',lastStars:0,fbFresh:false};
const app=document.getElementById('app');

function startRun(mode){
  S.mode=mode;S.ride=0;S.total=0;S.results=[];S.errors={ends:0,behavior:0,zeros:0};S.lastTmpl=null;S.screen='game';
  nextRide();
}
function nextRide(){
  const p=S.mode==='easy'?genEasy(S.ride):genFactor(S.ride,S.lastTmpl);
  S.lastTmpl=p.tmpl;S.prob=p;S.track=buildTrack(p);
  S.spotXs=S.mode==='easy'?p.lin.map(z=>z.r):[-6,-5,-4,-3,-2,-1,0,1,2,3,4,5,6];
  S.hintList=hintsFor(p,S.mode);
  S.sel={left:null,right:null};S.spots={};S.wrong=0;S.hints=0;S.phase='edit';
  S.revealX=0;S.cart=null;S.crash=null;S.flag=null;S.msg='';
  render();
}

/* ---------- checking ---------- */
function mismatches(){
  const p=S.prob,out=[];
  if(S.sel.left!==p.left)out.push({k:'left',ord:-1e9,X:LEFT});
  S.spotXs.forEach(x=>{
    const t=p.truth[x],s=S.spots[x];
    if(t!==s)out.push({k:'zero',x,t,s,ord:x,X:px(x)});
  });
  if(S.sel.right!==p.right)out.push({k:'right',ord:1e9,X:RIGHT});
  return out.sort((a,b)=>a.ord-b.ord);
}
function failMessage(m){
  const p=S.prob;
  const lw=S.sel.left!==p.left,rw=S.sel.right!==p.right;
  if(m.k==='left'||m.k==='right'){
    if(lw&&rw)return 'The cart came off right at the start. Both ends are off. Start with the sign of the leading coefficient.';
    if(m.k==='left')return 'The cart came off at the left end. Check the degree: do the two ends point the same way or opposite ways?';
    return 'The cart made it to the right end, then came off. Check the sign of the leading coefficient.';
  }
  const xs='x = '+fmt(m.x);
  if(m.t&&m.s)return 'The cart came off at '+xs+'. Check how many times that factor repeats: odd passes through, even bounces.';
  if(m.t&&!m.s)return 'The cart came off at '+xs+'. There is a zero there that is not marked yet.';
  return 'The cart came off at '+xs+'. That spot is not a zero. Re-check your factoring.';
}
function explainHTML(){
  const p=S.prob,parity=p.degree%2===0?'even':'odd',sign=p.a>0?'positive':'negative';
  let h='';
  if(S.mode==='factor')h+='<p class="math">'+fOf+factoredHTML(p)+'</p>';
  h+='<p><b>Ends:</b> degree '+p.degree+' is '+parity+' and the leading coefficient is '+sign+', so the ends point '+(parity==='odd'?'opposite ways':'the same way')+': the left end goes '+p.left+' and the right end goes '+p.right+'.</p><ul>';
  p.lin.forEach(z=>{
    const odd=z.m%2===1;
    const how=odd?(z.m>=3?'passes through with a flat spot':'passes straight through'):'bounces off the axis';
    h+='<li><b>x = '+fmt(z.r)+'</b> comes from '+linHTML(z.r,z.m)+'. The exponent is '+z.m+' ('+(odd?'odd':'even')+'), so the track '+how+'.</li>';
  });
  p.irr.forEach(q=>{h+='<li>'+polyHTML([q.c,q.b,1])+' has no real zeros, so the track never touches the axis because of it. It still counts toward the degree.</li>'});
  return h+'</ul>';
}

/* ---------- ride animation ---------- */
function startRide(){
  if(S.phase!=='edit')return;
  const sk=buildSketch();
  if(!sk.full)return;
  const tr=sk.full,mm=mismatches();
  S.phase='riding';S.flag=null;S.crash=null;render();
  const cartEl=app.querySelector('#cart');
  let stopS=tr.total,fail=null;
  if(mm.length){
    fail=mm[0];
    stopS=fail.k==='left'?Math.min(24,tr.total*0.04):fail.k==='right'?tr.total-18:Math.max(10,tr.sAtX(fail.X));
  }
  cartEl.style.display='';
  const setPose=P=>cartEl.setAttribute('transform','translate('+P.X+' '+P.Y+') rotate('+P.a+')');
  let s=0,last=null,begin=null;
  setPose(tr.poseAt(0));
  function frame(ts){
    if(last===null){last=ts;begin=ts}
    const dt=Math.min(0.04,(ts-last)/1000);last=ts;
    const t=(ts-begin)/1000;
    if(t<0.5){requestAnimationFrame(frame);return}          // a beat at the station
    const ramp=Math.min(1,0.3+(t-0.5)/0.8);                    // roll off slowly, then pick up speed
    const P0=tr.poseAt(s);
    const v=Math.min(430,Math.max(150,250+0.8*(P0.Y-CY)))*ramp; // faster on the way down
    s=Math.min(stopS,s+v*dt);
    const P=tr.poseAt(s);setPose(P);
    if(s>=stopS)finishRide(fail,P,v,cartEl);else requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
function finishRide(fail,P,v,cartEl){
  if(!fail){
    const stars=Math.max(1,3-S.wrong-(S.hints>0?1:0));
    S.lastStars=stars;S.total+=stars;S.results.push({stars});
    S.phase='success';S.cart={X:P.X,Y:P.Y,a:P.a};S.fbFresh=true;
    return render();
  }
  const done=()=>{
    S.wrong++;S.phase='fail';S.cart=null;S.crash={X:P.X,Y:P.Y};
    S.flag={key:fail.k==='zero'?'s-'+fail.x:'e-'+fail.k};
    if(fail.k!=='zero')S.errors.ends++;else if(fail.t&&fail.s)S.errors.behavior++;else S.errors.zeros++;
    S.msg=failMessage(fail);S.fbFresh=true;render();
  };
  const calm=reduceMotion();                       // gentler tip-over, no tumbling
  const ang=P.a*Math.PI/180;
  let x=P.X,y=P.Y,vx=Math.cos(ang)*v*(calm?0.5:1.1),vy=Math.sin(ang)*v*(calm?0.5:1.1)-(calm?40:120),rot=P.a;
  const w=calm?50:(Math.random()<0.5?-1:1)*(300+rnd(200));
  let last=null,t=0;
  function f(ts){
    if(last===null)last=ts;
    const dt=Math.min(0.04,(ts-last)/1000);last=ts;t+=dt;
    vy+=1100*dt;x+=vx*dt;y+=vy*dt;rot+=w*dt;
    cartEl.setAttribute('transform','translate('+x+' '+y+') rotate('+rot+')');
    if(t<(calm?1.0:1.4)&&y<H+60)requestAnimationFrame(f);else done();
  }
  requestAnimationFrame(f);
}

/* ---------- rendering ---------- */
function statusText(){
  if(S.phase!=='edit')return S.phase==='riding'?'Here we go...':'';
  const easy=S.mode==='easy';
  if(!S.sel.left&&!S.sel.right)return 'Click an end point on each side. The track starts to draw as you go.';
  if(!S.sel.left||!S.sel.right)return 'Now set the other end.';
  if(buildSketch().inconsistent)return 'The track you have drawn does not line up with both of your end points. Check the zeros and the ends.';
  if(easy){
    const left=S.spotXs.length-Object.keys(S.spots).length;
    return left>0?'Click each zero to choose pass through or bounce ('+left+' left).':'Ready to ride.';
  }
  return Object.keys(S.spots).length===0
    ?'Click the x-values where the track touches the axis. Click again to switch between pass through and bounce.'
    :'Ready to ride. Check your zeros once more.';
}
function canRide(){
  if(S.phase!=='edit'||!S.sel.left||!S.sel.right)return false;
  const n=Object.keys(S.spots).length;
  return S.mode==='easy'?n===S.spotXs.length:n>=1;
}
function stageSVG(){
  const p=S.prob,easy=S.mode==='easy',truth=S.phase==='revealed';
  let s='<svg id="stage" viewBox="0 0 '+W+' '+H+'" role="group" aria-label="Coordinate plane for the track">';
  for(let x=-6;x<=6;x++)s+='<line class="grid" x1="'+px(x)+'" y1="30" x2="'+px(x)+'" y2="'+(H-30)+'"/>';
  [-150,-100,-50,50,100,150].forEach(dy=>{s+='<line class="grid" x1="12" y1="'+(CY+dy)+'" x2="'+(W-12)+'" y2="'+(CY+dy)+'"/>'});
  s+='<line class="yaxis" x1="'+CX+'" y1="24" x2="'+CX+'" y2="'+(H-24)+'"/>';
  s+='<line class="axis" x1="10" y1="'+CY+'" x2="'+(W-10)+'" y2="'+CY+'"/>';
  for(let x=-6;x<=6;x++)s+='<line class="tickmark" x1="'+px(x)+'" y1="'+(CY-5)+'" x2="'+px(x)+'" y2="'+(CY+5)+'"/>';
  s+='<text class="axlabel" x="'+(W-14)+'" y="'+(CY-10)+'" text-anchor="end">x</text>';

  // track: the true graph once the ride is won (or shown), otherwise the student's own sketch
  if(S.phase==='success'||S.phase==='revealed'){
    s+='<g class="fadein"><path class="ties" d="'+S.track.d+'"/><path class="rail" d="'+S.track.d+'"/></g>';
  }else{
    buildSketch().runs.forEach(r=>{s+='<g><path class="ties" d="'+r.d+'"/><path class="rail" d="'+r.d+'"/></g>'});
  }
  if(S.phase==='fail'&&S.crash){
    s+='<g class="crash" transform="translate('+S.crash.X+' '+S.crash.Y+')"><circle r="15"/><path d="M-6 -6 L6 6 M6 -6 L-6 6"/></g>';
  }

  // end nodes
  ['left','right'].forEach(side=>{
    const cx=side==='left'?LEFT:RIGHT;
    s+='<text class="endlabel" x="'+cx+'" y="'+(CY-HH-30)+'">'+side+' end</text>';
    ['up','down'].forEach(dir=>{
      const cy=dir==='up'?CY-HH:CY+HH;
      const chosen=truth?p[side]:S.sel[side];
      const on=chosen===dir;
      const flag=S.flag&&S.flag.key==='e-'+side&&on;
      const arrow=dir==='up'?'M0 7 L0 -7 M-6 -2 L0 -8 L6 -2':'M0 -7 L0 7 M-6 2 L0 8 L6 2';
      s+='<g class="endnode'+(on?' on':'')+(truth?' truth':'')+(flag?' flag':'')+'" data-action="end" data-side="'+side+'" data-dir="'+dir+'" data-key="e-'+side+'-'+dir+'" tabindex="0" role="button" aria-pressed="'+on+'" aria-label="'+side+' end goes '+dir+'" transform="translate('+cx+' '+cy+')">'
        +'<circle class="hit" r="26"/><circle class="ring" r="16"/><path class="arrow" d="'+arrow+'"/></g>';
    });
  });

  // zero spots
  S.spotXs.forEach(x=>{
    const st=truth?(p.truth[x]||'unset'):(S.spots[x]||'unset');
    const flag=S.flag&&S.flag.key==='s-'+x;
    const word=st==='cross'?'pass':st==='bounce'?'bounce':'';
    const glyph=st==='cross'?'<path class="glyph" d="M-13 9 L13 -9"/>':st==='bounce'?'<path class="glyph" d="M-13 -11 Q0 13 13 -11"/>':(easy?'<text class="q" y="6">?</text>':'');
    const r=(st==='unset'&&!easy)?8:12;
    s+='<g class="spot st-'+st+(flag?' flag':'')+'" data-action="spot" data-x="'+x+'" data-key="s-'+x+'" tabindex="0" role="button" aria-label="x equals '+fmt(x)+', '+(word||'not set')+'" transform="translate('+px(x)+' '+CY+')">'
      +'<circle class="hit" r="24"/><circle class="ring" r="'+r+'"/>'+glyph+'<text class="tl" y="34">'+fmt(x)+'</text>'
      +'<text class="sw" y="52">'+word+'</text></g>';
  });

  // cart
  const c=S.cart;
  s+='<g id="cart" style="'+(c?'':'display:none')+'"'+(c?' transform="translate('+c.X+' '+c.Y+') rotate('+c.a+')"':'')+'>'
    +'<rect class="cart-body" x="-17" y="-21" width="34" height="14" rx="5"/>'
    +'<circle class="rider" cx="3" cy="-28" r="5.5"/>'
    +'<circle class="wheel" cx="-10" cy="-5" r="4.4"/><circle class="wheel" cx="10" cy="-5" r="4.4"/></g>';

  if(S.phase==='success'){
    const n=S.lastStars;
    s+='<g transform="translate('+CX+' 74)">';
    for(let i=0;i<n;i++)s+='<text class="spark" x="'+((i-(n-1)/2)*40)+'" y="0" style="animation-delay:'+(i*0.18)+'s">\u2605</text>';
    s+='</g>';
  }
  return s+'</svg>';
}
function dotsHTML(){
  let h='';
  for(let i=0;i<RIDES;i++){
    const r=S.results[i];
    h+='<span class="dot'+(r?' s'+r.stars:'')+(i===S.ride&&!(S.results.length>i)?' now':'')+'"></span>';
  }
  return h;
}
function gameHTML(){
  const p=S.prob,easy=S.mode==='easy';
  let h='<div class="wrap"><header class="topbar"><button class="btn small" data-action="menu" data-key="menu">Modes</button>'
    +'<div class="info"><span class="modename">'+(easy?'Factored form':'Factor first')+'</span>'
    +'<span class="dots" role="img" aria-label="Ride '+(S.ride+1)+' of '+RIDES+'">'+dotsHTML()+'</span>'
    +'<span class="score">'+S.total+' \u2605</span></div></header>';
  h+='<section class="card"><div class="eq">'+fOf+(easy?factoredHTML(p):polyHTML(p.coeffs))+'</div>';
  h+='<p class="sub">'+(easy?'Read the factors to build the track.':'Factor it to find the real zeros, then build the track.')+'</p>';
  h+='<div class="stage-scroll">'+stageSVG()+'</div>';
  h+='<p class="status" aria-live="polite">'+statusText()+'</p>';

  const showHints=S.phase==='edit'||S.phase==='fail';
  if(showHints&&S.hints>0){
    h+='<ul class="hints">'+S.hintList.slice(0,S.hints).map(t=>'<li class="hint">'+t+'</li>').join('')+'</ul>';
  }
  if(S.phase==='edit'){
    const more=S.hints<S.hintList.length;
    h+='<div class="row"><button class="btn primary" data-action="ride" data-key="ride"'+(canRide()?'':' disabled')+'>Ride</button>'
      +'<button class="btn" data-action="hint" data-key="hint"'+(more?'':' disabled')+'>'+(S.hints?'Another hint':'Hint')+'</button></div>';
  }
  if(S.phase==='fail'){
    h+='<div class="feedback bad" id="fb" tabindex="-1" role="status"><h3>The cart derailed</h3><p>'+S.msg+'</p>'
      +'<div class="row"><button class="btn primary" data-action="retry" data-key="retry">Fix my track</button>'
      +'<button class="btn" data-action="hint" data-key="hint"'+(S.hints<S.hintList.length?'':' disabled')+'>'+(S.hints?'Another hint':'Hint')+'</button>'
      +'<button class="btn" data-action="reveal" data-key="reveal">Show me the answer</button></div></div>';
  }
  const last=S.ride+1>=RIDES;
  if(S.phase==='success'){
    const st=S.lastStars,stars='\u2605'.repeat(st)+'\u2606'.repeat(3-st);
    const head=st===3?'Smooth ride!':st===2?'Made it!':'Made it. Keep going.';
    h+='<div class="feedback good" id="fb" tabindex="-1" role="status"><h3>'+head+' <span aria-label="'+st+' of 3 stars">'+stars+'</span></h3>'
      +'<div class="why">'+explainHTML()+'</div>'
      +'<div class="row"><button class="btn primary" data-action="next" data-key="next">'+(last?'See results':'Next ride')+'</button></div></div>';
  }
  if(S.phase==='revealed'){
    h+='<div class="feedback info" id="fb" tabindex="-1" role="status"><h3>Here is the full track</h3>'
      +'<div class="why">'+explainHTML()+'</div>'
      +'<div class="row"><button class="btn primary" data-action="next" data-key="next">'+(last?'See results':'Next ride')+'</button></div></div>';
  }
  return h+'</section></div>';
}
function startHTML(){
  const hero='<svg viewBox="0 0 620 130" aria-hidden="true"><path d="M6 112 C70 112 78 22 150 22 S 230 112 300 112 S 372 112 420 60 S 500 -4 614 8" fill="none" stroke="var(--tie)" stroke-width="15" stroke-dasharray="2.5 9"/>'
    +'<path d="M6 112 C70 112 78 22 150 22 S 230 112 300 112 S 372 112 420 60 S 500 -4 614 8" fill="none" stroke="var(--track)" stroke-width="5" stroke-linecap="round"/>'
    +'<g transform="translate(150 22)"><rect class="cart-body" x="-17" y="-21" width="34" height="14" rx="5"/><circle class="rider" cx="3" cy="-28" r="5.5"/><circle class="wheel" cx="-10" cy="-5" r="4.4"/><circle class="wheel" cx="10" cy="-5" r="4.4"/></g></svg>';
  return '<div class="wrap"><div class="hero"><h1>Polynomial Coaster</h1>'
    +'<p>Build the track from the equation, then send the cart down it. Get the ends and zeros right and it makes the whole ride.</p>'+hero+'</div>'
    +'<div class="modes">'
    +'<button class="mode" data-action="mode" data-mode="easy" data-key="m-easy"><span class="tag">Easy</span><h2>Factored form</h2><p>The polynomial is already factored. Read the exponents and build the track.</p></button>'
    +'<button class="mode" data-action="mode" data-mode="factor" data-key="m-factor"><span class="tag">Medium</span><h2>Factor first</h2><p>Factor the polynomial yourself to find the real zeros. Watch for factors that have none.</p></button>'
    +'<button class="mode locked" disabled aria-disabled="true"><span class="tag">Expert</span><h2>Synthetic division</h2><p>Coming soon.</p></button>'
    +'</div>'
    +'<div class="how"><h2>How a ride works</h2><ol><li>Click an end point on each side. The track starts to draw as you click.</li><li>Click each zero to choose pass through or bounce. The track fills in.</li><li>Press Ride. The cart rolls along your track and comes off at the first mistake.</li></ol></div></div>';
}
function endHTML(){
  const e=S.errors,tot=e.ends+e.behavior+e.zeros;
  let h='<div class="wrap"><div class="hero"><h1>Run complete</h1></div><section class="card">'
    +'<div class="big">'+S.total+' of '+(RIDES*3)+' \u2605</div>'
    +'<div class="results">'+S.results.map((r,i)=>'<div class="res"><small>Ride '+(i+1)+'</small>'+(r.stars?'\u2605'.repeat(r.stars)+'\u2606'.repeat(3-r.stars):'Answer shown')+'</div>').join('')+'</div>';
  if(tot>0)h+='<p>Where the cart came off: ends '+e.ends+', pass vs. bounce '+e.behavior+', missed or extra zeros '+e.zeros+'.</p>';
  else h+='<p>No derailments. Clean run.</p>';
  h+='<div class="row"><button class="btn primary" data-action="again" data-key="again">Ride again</button><button class="btn" data-action="menu" data-key="menu">Pick another mode</button></div></section></div>';
  return h;
}
function render(){
  const ae=document.activeElement,fk=ae&&ae.dataset?ae.dataset.key:null;
  app.innerHTML=S.screen==='start'?startHTML():S.screen==='end'?endHTML():gameHTML();
  if(S.fbFresh){
    const fb=app.querySelector('#fb');
    if(fb){fb.focus({preventScroll:false});fb.scrollIntoView({block:'nearest',behavior:'smooth'})}
    S.fbFresh=false;return;
  }
  if(fk){const el=app.querySelector('[data-key="'+fk+'"]');if(el)el.focus({preventScroll:true})}
}

/* ---------- events ---------- */
function act(t){
  const a=t.dataset.action;
  if(a==='mode')return startRun(t.dataset.mode);
  if(a==='menu'){S.screen='start';return render()}
  if(a==='again')return startRun(S.mode);
  if(S.phase==='riding')return;
  if(a==='end'&&S.phase==='edit'){
    S.sel[t.dataset.side]=t.dataset.dir;
    if(S.flag&&S.flag.key==='e-'+t.dataset.side)S.flag=null;
    return render();
  }
  if(a==='spot'&&S.phase==='edit'){
    const x=+t.dataset.x,cur=S.spots[x];
    if(S.mode==='easy')S.spots[x]=cur==='cross'?'bounce':'cross';
    else if(!cur)S.spots[x]='cross';
    else if(cur==='cross')S.spots[x]='bounce';
    else delete S.spots[x];
    if(S.flag&&S.flag.key==='s-'+x)S.flag=null;
    return render();
  }
  if(a==='hint'){S.hints=Math.min(S.hintList.length,S.hints+1);return render()}
  if(a==='ride')return startRide();
  if(a==='retry'){S.phase='edit';S.cart=null;S.crash=null;return render()}
  if(a==='reveal'){S.results.push({stars:0});S.phase='revealed';S.revealX=W;S.cart=null;S.flag=null;S.fbFresh=true;return render()}
  if(a==='next'){
    if(S.ride+1>=RIDES){S.screen='end';return render()}
    S.ride++;return nextRide();
  }
}
app.addEventListener('click',e=>{
  const t=e.target.closest('[data-action]');
  if(t&&!t.disabled)act(t);
});
app.addEventListener('keydown',e=>{
  if((e.key==='Enter'||e.key===' ')&&e.target.matches&&e.target.matches('g[data-action]')){
    e.preventDefault();act(e.target);
  }
});

// exposed for the test suite in /tests
window.__pc={genEasy,genFactor,buildTrack,buildSketch,mismatches,makeProblem,evalPoly,TEMPL,px,S};
render();
})();
