const assert=require('node:assert/strict');global.Construction=require('../../CurveLab/construction-core.js');const G=Construction,V=require('../../CurveLab/construction-view.js');
const cube={id:'cube',type:'prism',p:[[0,0,0],[3,0,0],[3,3,0],[0,3,0],[0,0,3],[3,0,3],[3,3,3],[0,3,3]]};
const v={x:1.5,y:1.5,z:1.5,yaw:.63,pitch:-.57,scale:70};
function classify(view){const scene=V.scene([cube],view);return V.edges(cube).map(([a,b])=>V.hidden(V.camera(G.mul(G.add(a,b),.5),view),scene));}
const front=classify(v),back=classify({...v,yaw:v.yaw+Math.PI,pitch:Math.PI-v.pitch});assert.equal(front.filter(Boolean).length,3);assert.equal(back.filter(Boolean).length,3);assert.notDeepEqual(front,back);
// In plan view, four bottom edges are hidden and four top edges remain solid.
const plan={...v,yaw:0,pitch:0};assert.deepEqual(classify(plan).slice(0,8),[true,true,true,true,false,false,false,false]);
// Occlusion changes along an edge crossing a finite face, not just whole-edge flags.
const face={type:'triangle',p:[[-1,-1,1],[1,-1,1],[0,1,1]]},scene=V.scene([face],{...plan,x:0,y:0,z:0}),runs=V.split([-2,0,0],[2,0,0],{...plan,x:0,y:0,z:0},scene);assert.deepEqual(runs.map(r=>r.hidden),[false,true,false]);
assert.equal(V.hidden([0,0,1],scene),false);assert.equal(V.hidden([0,0,0],scene),true);assert.equal(V.hidden([0,0,2],scene),false);
const sphere=V.scene([{id:'s',type:'sphere',c:[0,0,0],radius:2}],{...plan,x:0,y:0,z:0});assert.equal(V.hidden([0,0,-2],sphere),true);assert.equal(V.hidden([0,0,2],sphere),false);assert.equal(V.hidden([3,0,0],sphere),false);
// Invert the projection onto all three placement planes, including rotated views.
for(const plane of ['xy','xz','yz']){const p=[1.2,2.3,3.4],q=V.camera(p,v),axis={xy:2,xz:1,yz:0}[plane],r=V.fromScreen(480+q[0]*v.scale,280-q[1]*v.scale,v,960,560,plane,p[axis]);r.forEach((x,i)=>assert.ok(Math.abs(x-p[i])<1e-9));}
assert.throws(()=>V.fromScreen(480,280,plan,960,560,'xz',0),/90°/);
const points=cube.p.slice(0,5).map((coords,i)=>({id:'p'+i,name:'p'+i,kind:'point',coords,refs:[]}));const solid={id:'solid',name:'solid',kind:'prism',refs:points.map(p=>p.id)};assert.equal(G.solve([...points,solid],3).get('solid').volume,27);const bad=structuredClone(points);bad[3].coords=[0,3,1];assert.ok(G.solve([...bad,solid],3).get('solid').error);
console.log('PASS: camera-dependent cube visibility, self-occlusion tolerance, partial occlusion, sphere visibility, inverse mouse projection, edge-on guards and prism geometry.');

