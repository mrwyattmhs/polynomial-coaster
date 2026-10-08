const fs=require('fs'),path=require('path');
const js=fs.readFileSync(path.join(__dirname,'..','game.js'),'utf8');
const L={};
const cart={style:{},setAttribute(){}};
const app={addEventListener(t,f){L[t]=f},innerHTML:'',querySelector(q){return q==='#cart'?cart:null}};
global.document={getElementById:()=>app,activeElement:null};
let raf=[];global.requestAnimationFrame=f=>raf.push(f);
global.window={matchMedia:()=>({matches:false})};
eval(js);
const click=(action,data)=>L.click({target:{closest:()=>({dataset:Object.assign({action},data||{}),disabled:false})}});
click('mode',{mode:'easy'});
const pc=window.__pc,S=pc.S;
console.log('game html has sketch group:',/class="rail"/.test(app.innerHTML)===false,'(no sketch before clicks)');
click('end',{side:'left',dir:S.prob.left});
console.log('after left click rail present:',/class="rail"/.test(app.innerHTML));
click('end',{side:'right',dir:S.prob.right});
S.prob.lin.forEach(z=>{click('spot',{x:String(z.r)});if(S.prob.truth[z.r]==='bounce')click('spot',{x:String(z.r)})});
console.log('spots',JSON.stringify(S.spots),'truth',JSON.stringify(S.prob.truth));
click('ride');
console.log('phase after ride click:',S.phase);
// run frames
let t=0,n=0;while(raf.length&&n<5000){const f=raf.shift();t+=16;f(t);n++}
console.log('end phase:',S.phase,'frames',n,'stars',S.lastStars);
console.log('true track shown:',/class="fadein"/.test(app.innerHTML));
// wrong run
click('next');
click('end',{side:'left',dir:S.prob.left==='up'?'down':'up'});
click('end',{side:'right',dir:S.prob.right});
S.prob.lin.forEach(z=>{click('spot',{x:String(z.r)});if(S.prob.truth[z.r]==='bounce')click('spot',{x:String(z.r)})});
click('ride');
raf=raf;t=0;n=0;while(raf.length&&n<5000){const f=raf.shift();t+=16;f(t);n++}
console.log('wrong run phase:',S.phase,'crash',!!S.crash,'msg:',S.msg);
console.log('crash marker rendered:',/class="crash"/.test(app.innerHTML));
// pass/fail: the first ride (all correct) must succeed, the second (left end wrong) must derail
const ok=S.phase==='fail'&&!!S.crash&&/left end/.test(S.msg)&&/class="crash"/.test(app.innerHTML);
console.log('ride','problems:',ok?0:1);
process.exitCode=ok?0:1;
