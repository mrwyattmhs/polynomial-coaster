const fs=require('fs'),path=require('path');
const js=fs.readFileSync(path.join(__dirname,'..','game.js'),'utf8');
const app={addEventListener(){},innerHTML:'',querySelector(){return null}};
global.document={getElementById:()=>app,activeElement:null};
global.window={matchMedia:()=>({matches:false})};
eval(js);
const pc=window.__pc,S=pc.S;
let bad=0;
function setup(p,mode,perfect){
  S.mode=mode;S.prob=p;
  S.spotXs=mode==='easy'?p.lin.map(z=>z.r):[-6,-5,-4,-3,-2,-1,0,1,2,3,4,5,6];
  S.sel={left:p.left,right:p.right};S.spots={};
  p.lin.forEach(z=>{S.spots[z.r]=p.truth[z.r]});
}
function sideOf(line,X,off){const q=off<0?line.filter(q=>q.x<X+off).pop():line.find(q=>q.x>X+off);return Math.sign(210-q.y)}
for(let i=0;i<8;i++)for(const mode of ['easy','factor'])for(let k=0;k<150;k++){
  const p=mode==='easy'?pc.genEasy(i):pc.genFactor(i,null);
  setup(p,mode);
  let sk=pc.buildSketch();
  if(!sk.full||sk.inconsistent){bad++;console.log('perfect not full/consistent',mode,p.lin,p.irr);continue}
  if(pc.mismatches().length){bad++;console.log('perfect has mismatches')}
  const L=sk.full.line;
  if(L.some(q=>!isFinite(q.x)||!isFinite(q.y))||L.some((q,j)=>j&&q.x<L[j-1].x)){bad++;console.log('bad line')}
  // sketch behaves: crosses at odd, bounces at even
  p.lin.forEach(z=>{const X=pc.px(z.r);const crossed=sideOf(L,X,-12)!==sideOf(L,X,12);if(crossed!==(z.m%2===1)){bad++;console.log('sketch sign wrong',z)}});
  // wrong left end => inconsistent or mismatch
  S.sel.left=p.left==='up'?'down':'up';
  sk=pc.buildSketch();
  if(!sk.inconsistent){bad++;console.log('flipped left should be inconsistent')}
  if(pc.mismatches()[0].k!=='left'){bad++;console.log('first mismatch not left')}
  S.sel.left=p.left;
  // flip one zero's behavior => inconsistent sketch (ends disagree) and mismatch at that zero
  const z=p.lin[rand(p.lin.length)];
  S.spots[z.r]=p.truth[z.r]==='cross'?'bounce':'cross';
  sk=pc.buildSketch();
  if(!sk.inconsistent){bad++;console.log('flipped zero should be inconsistent')}
  const mm=pc.mismatches(); if(mm[0].k!=='zero'||mm[0].x!==z.r){bad++;console.log('mismatch zero wrong')}
  if(!sk.full){bad++;console.log('sketch should still be full for ride')}
  else { const s=sk.full.sAtX(mm[0].X); if(!(s>0&&s<sk.full.total)){bad++;console.log('derail s out of range')} }
}
function rand(n){return Math.floor(Math.random()*n)}
// progressive drawing
const p=pc.genEasy(3);setup(p,'easy');S.sel={left:null,right:null};S.spots={};
console.log('nothing set runs:',pc.buildSketch().runs.length);
S.sel.left=p.left;console.log('left only runs:',pc.buildSketch().runs.length);
S.sel.right=p.right;console.log('both ends runs:',pc.buildSketch().runs.length,'full:',!!pc.buildSketch().full);
S.spots[p.lin[0].r]=p.truth[p.lin[0].r];console.log('first zero set runs:',pc.buildSketch().runs.length);
// factoring mode no zeros stubs
const q=pc.genFactor(0,null);setup(q,'factor');S.spots={};console.log('factor stubs:',pc.buildSketch().runs.length);
console.log('sketch','problems:',bad);
process.exitCode=bad?1:0;
