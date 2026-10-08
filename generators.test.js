const fs=require('fs'),path=require('path');
const js=fs.readFileSync(path.join(__dirname,'..','game.js'),'utf8');
const app={addEventListener(){},innerHTML:'',querySelector(){return null}};
global.document={getElementById:()=>app,activeElement:null};
global.window={matchMedia:()=>({matches:false})};
global.matchMedia=window.matchMedia;
eval(js);
const pc=window.__pc;
let bad=0;
function check(p,label){
  // verify expanded coeffs match factored eval
  for(const x of [-3.3,-1.7,0.4,2.9,4.2]){
    let f=p.a;p.lin.forEach(z=>f*=Math.pow(x-z.r,z.m));p.irr.forEach(q=>f*=(x*x+q.b*x+q.c));
    const e=pc.evalPoly(p.coeffs,x);
    if(Math.abs(f-e)>1e-6*Math.max(1,Math.abs(f))){bad++;console.log('coef mismatch',label)}
  }
  // roots within +-5
  if(p.lin.some(z=>Math.abs(z.r)>5)){bad++;console.log('root range',label)}
  const t=pc.buildTrack(p);
  if(!isFinite(t.total)||t.line.some(q=>!isFinite(q.x)||!isFinite(q.y))){bad++;console.log('nan track',label)}
  // track crosses axis at each zero & stays within box
  if(t.line.some(q=>q.y<-5||q.y>425)){bad++;console.log('out of box',label,Math.min(...t.line.map(q=>q.y)),Math.max(...t.line.map(q=>q.y)))}
  // sign pattern: cross zeros change sign, bounce zeros don't
  p.lin.forEach(z=>{
    const X=pc.px(z.r);
    const before=t.line.filter(q=>q.x<X-12).pop(), after=t.line.find(q=>q.x>X+12);
    const sb=Math.sign(210-before.y), sa=Math.sign(210-after.y);
    const crossed=sb!==sa;
    if(crossed!==(z.m%2===1)){bad++;console.log('sign wrong',label,z)}
  });
  // end nodes match
  const first=t.line[0],last=t.line[t.line.length-1];
  if((first.y<210?'up':'down')!==p.left||(last.y<210?'up':'down')!==p.right){bad++;console.log('ends wrong',label)}
}
for(let i=0;i<8;i++)for(let k=0;k<150;k++){check(pc.genEasy(i),'easy'+i);check(pc.genFactor(i,null),'fac'+i)}
for(const T of pc.TEMPL)for(let k=0;k<100;k++){const p=T.make();check(p,T.name)}
console.log('generators','problems:',bad);
process.exitCode=bad?1:0;
const s=pc.TEMPL[2].make();console.log(s.coeffs,s.lin,s.irr,s.h2);
