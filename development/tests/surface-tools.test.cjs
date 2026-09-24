const assert=require('node:assert/strict');require('../../CurveLab/engine.js');require('../../CurveLab/geometry.js');const C=require('../../CurveLab/lab-core.js'),T=require('../../CurveLab/surface-tools.js');
const surface=z=>C.surface({kind:'graph',z,u0:'-2',u1:'2',v0:'-2',v1:'2',constants:''});
for(const [expr,label]of [['x^2+y^2','tiểu'],['-x^2-y^2','đại'],['x^2-y^2','yên ngựa'],['x^4+y^4','chưa kết luận']]){const a=T.graphAnalysis(surface(expr),0,0);assert.ok(a.valid);assert.match(a.classification,new RegExp(label));}
const a=T.graphAnalysis(surface('x+2*y'),.2,.4,Math.PI/2);assert.deepEqual(a.gradient,[1,2]);assert.ok(Math.abs(a.directional-2)<1e-12);
assert.equal(T.graphAnalysis(surface('sin(sqrt(x^2+y^2))'),0,0).valid,false);assert.equal(T.graphAnalysis(surface('abs(x)+y'),0,0).valid,false);
const m=T.mesh(surface('x^2+y^2'),44),sections=T.sections(m,[1]);assert.ok(sections[0].segments.length>30);for(const seg of sections[0].segments)for(const p of seg){assert.equal(p[2],1);assert.ok(Math.abs(p[0]**2+p[1]**2-1)<.02);}
const plane=T.mesh(surface('0'),28);assert.ok(T.sections(plane,[0])[0].coplanar);assert.equal(T.sections(plane,[1])[0].segments.length,0);
const pole=T.mesh(surface('1/(x-0.13)'),44);assert.ok(pole.omitted>0);assert.equal(T.sections(pole,[0])[0].segments.length,0);
const hidden=T.depthIndex([{p:[0,0],depth:1},{p:[0,10],depth:1},{p:[10,0],depth:1},{p:[10,10],depth:1}],1,[true]);assert.equal(hidden({p:[5,5],depth:0}),true);assert.equal(hidden({p:[5,5],depth:1}),false);assert.equal(hidden({p:[20,20],depth:0}),false);
assert.deepEqual(T.ticks(-2,2),[-2,-1,0,1,2]);assert.throws(()=>T.mesh(surface('x'),500));
console.log('PASS: gradient, Hessian classification, directional derivative, cusps, contour interpolation, coplanarity, discontinuity rejection and depth occlusion.');
