const assert=require('node:assert/strict');global.CurveMath=require('../../CurveLab/engine.js');const G=require('../../CurveLab/construction-core.js');
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`),p=(id,coords)=>({id,name:id,kind:'point',refs:[],coords});
const initial=[p('O',[0,0,0]),p('A',[4,0,0]),{id:'base',name:'OA',kind:'segment',refs:['O','A']}];
const angle=(extra={})=>({id:'angle',name:'alpha',kind:'fixedAngle',refs:['base'],angle:'60',turn:'ccw',baseDirection:'forward',anglePlane:'xy',...extra});
function solve(extra={},dim=2,base=initial){return G.solve([...base,angle(extra)],dim).get('angle');}
let q=solve();near(q.d[0],.5);near(q.d[1],Math.sqrt(3)/2);near(G.dot(q.u,q.d),.5);
q=solve({turn:'cw'});near(q.d[1],-Math.sqrt(3)/2);
q=solve({baseDirection:'reverse',angle:90});assert.deepEqual(q.a,[4,0,0]);near(q.d[1],-1);
q=solve({angle:270});near(q.theta,1.5*Math.PI);near(q.d[1],-1);
q=solve({angle:'180/2'});near(q.d[1],1);
for(const bad of [0,360,-2,'nope'])assert.ok(solve({angle:bad}).error);
for(const kind of ['ray','line']){const base=structuredClone(initial);base[2].kind=kind;q=solve({baseDirection:'reverse'},2,base);assert.deepEqual(q.a,[0,0,0]);near(q.u[0],-1);}
q=solve({angle:90,anglePlane:'xz'},3);near(q.d[2],1);assert.ok(solve({anglePlane:'yz'},3).error);
const moved=structuredClone(initial);moved[1].coords=[0,4,0];q=solve({},2,moved);near(q.d[0],-Math.sqrt(3)/2);near(q.d[1],.5);
const ray={type:'ray',a:[0,0,0],d:[1,0,0]},circle={type:'circle',c:[0,0,0],radius:2};assert.deepEqual(G.intersections(ray,circle),[[2,0,0]]);assert.deepEqual(G.intersections(ray,{type:'line',a:[-1,-1,0],d:[0,1,0]}),[]);
const {boot}=require('./construction-interaction.test.cjs'),t=boot(),a=t.c.ConstructionApp,submit=()=>t.$('object-form').onsubmit({preventDefault(){}});
t.$('preset').value='empty';t.$('example').click();a.quickPoints('O=(0,0); A=(4,0)');const get=name=>a.objects.find(o=>o.name===name),clickPoint=name=>t.click(a.project(a.resolved.get(get(name).id).p));
a.setTool('ray');clickPoint('O');clickPoint('A');t.$('object-name').value='r';submit();assert.equal(a.resolved.get(get('r').id).type,'ray');
a.setTool('fixedAngle');t.$('angle').value='90';t.$('turn').value='cw';t.click(a.project([2,0,0]));assert.equal(t.$('ref-0').value,get('r').id);t.$('object-name').value='g';submit();assert.equal(get('g').angle,'90');near(a.resolved.get(get('g').id).d[1],-1);assert.ok(a.exportLatex().includes('90°'));
const saved=a.snapshot();t.$('undo').click();assert.equal(get('g'),undefined);t.$('redo').click();assert.ok(get('g'));a.restore(saved);near(a.resolved.get(get('g').id).d[1],-1);a.quickPoints('A=(0,4)');near(a.resolved.get(get('g').id).d[0],1);
a.setTool('fixedAngle');t.$('angle').value='270';t.$('auto-build').checked=true;t.click(a.project([0,2,0]));assert.equal(a.objects.filter(o=>o.kind==='fixedAngle').length,2);
console.log('PASS: ray bounds/intersections, angle direction/reflex/reverse/3D planes, invalid inputs, dependent updates, canvas workflow, undo/redo, save/open, auto-build and TikZ.');
