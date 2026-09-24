const assert=require('node:assert/strict');
global.CurveMath=require('../../CurveLab/engine.js');
const G=require('../../CurveLab/construction-core.js');
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-7,`${a} ≠ ${b}`),point=(id,p)=>({id,name:id,kind:'point',coords:p,refs:[]}),obj=(id,kind,refs,extra={})=>({id,name:id,kind,refs,...extra});
const base=[point('A',[0,0,0]),point('B',[4,0,0]),point('C',[0,3,0])];
const kinds=['triangle','circumcenter','incenter','centroid','orthocenter','circumcircle','incircle'];
let m=G.solve([...base,...kinds.map(k=>obj(k,k,['A','B','C']))]);
near(m.get('triangle').area,6);near(m.get('triangle').perimeter,12);assert.deepEqual(m.get('circumcenter').p,[2,1.5,0]);assert.deepEqual(m.get('incenter').p,[1,1,0]);assert.deepEqual(m.get('orthocenter').p,[0,0,0]);near(m.get('circumcircle').radius,2.5);near(m.get('incircle').radius,1);
// Derived values follow source edits, and arbitrary centers are honored.
const graph=[...structuredClone(base),obj('M','midpoint',['A','B']),obj('c','circle',['M'],{radius:'sqrt(4)'}),obj('d','line',['A','B']),obj('i1','intersection',['d','c'],{branch:0}),obj('i2','intersection',['d','c'],{branch:1})];
m=G.solve(graph);assert.deepEqual(m.get('c').c,[2,0,0]);assert.deepEqual(m.get('i1').p,[0,0,0]);assert.deepEqual(m.get('i2').p,[4,0,0]);graph[1].coords=[6,0,0];m=G.solve(graph);assert.deepEqual(m.get('c').c,[3,0,0]);assert.deepEqual(m.get('i1').p,[1,0,0]);assert.deepEqual(m.get('i2').p,[5,0,0]);
const circle={type:'circle',c:[0,0,0],radius:2};assert.equal(G.intersections({type:'line',a:[0,2,0],d:[1,0,0]},circle).length,1);assert.equal(G.intersections({type:'line',a:[0,3,0],d:[1,0,0]},circle).length,0);assert.equal(G.intersections({type:'segment',a:[3,0,0],b:[4,0,0]},circle).length,0);assert.equal(G.intersections(circle,{...circle,c:[3,0,0]}).length,2);assert.equal(G.intersections(circle,circle).length,0);
m=G.solve([...base,obj('bis','bisector',['B','A','C']),obj('foot','foot',['C','A','B']),obj('parallel','parallel',['C','A','B']),obj('perp','perpendicular',['C','A','B']),obj('mid','perpBisector',['A','B']),obj('angle','angle',['B','A','C'])]);near(m.get('bis').d[0],Math.SQRT1_2);near(m.get('bis').d[1],Math.SQRT1_2);near(m.get('angle').value,90);assert.deepEqual(m.get('foot').p,[0,0,0]);near(G.dot(m.get('parallel').d,m.get('perp').d),0);
const space=[point('A',[0,0,3]),point('B',[4,0,3]),point('C',[0,3,3]),point('S',[1,1,7])];m=G.solve([...space,obj('t','tetrahedron',['A','B','C','S']),obj('h','planeFoot',['S','A','B','C']),obj('n','normal',['S','A','B','C']),obj('O','circumcenter',['A','B','C']),obj('H','orthocenter',['A','B','C']),obj('s','sphere',['S'],{radius:2})],3);near(m.get('t').volume,8);assert.deepEqual(m.get('h').p,[1,1,3]);assert.deepEqual(m.get('O').p,[2,1.5,3]);assert.deepEqual(m.get('H').p,[0,0,3]);near(G.norm(m.get('n').d),1);near(m.get('s').radius,2);
m=G.solve([...base,obj('T','transform',['B','A'],{angle:'90',scale:'2',translation:['1','2','0']})]);near(m.get('T').p[0],1);near(m.get('T').p[1],10);
m=G.solve([point('A',[0,0,0]),point('B',[1,0,0]),point('C',[2,0,0]),obj('bad','circumcircle',['A','B','C']),obj('dependent','circle',['bad'],{radius:1})]);assert.ok(m.get('bad').error);assert.ok(m.get('dependent').error);
assert.ok(G.solve([...base,obj('bad','circle',['A'],{radius:'-1'})]).get('bad').error);assert.ok(G.solve([point('A',['1/0',0,0])]).get('A').error);
const doc={app:'curvelab-construction',version:1,dimension:2,objects:graph};assert.deepEqual(G.validate(JSON.parse(JSON.stringify(doc))),doc);assert.throws(()=>G.validate({...doc,objects:[obj('a','midpoint',['missing','missing'])]}));assert.throws(()=>G.validate({...doc,objects:[base[0],base[0]]}));
console.log('PASS: triangle centers, dependency updates, arbitrary centers, intersections/tangency/segment bounds, bisectors, perpendicularity, 3D projections and volume, transforms, degeneracy, file validation.');
const old={app:'curvelab-studio',version:1,mode:'geometry',inputs:{'geometry-kind':'circle','geometry-radius':'2','point-Ax':'-3','point-Ay':'0','point-Bx':'3','point-By':'0','point-Cx':'0','point-Cy':'0','lab-notes':'Bài cũ'}};
const migrated=G.importDocument(old);assert.equal(migrated.notes,'Bài cũ');assert.equal(migrated.objects.filter(o=>o.kind==='intersection').length,2);assert.ok([...G.solve(migrated.objects).values()].every(o=>!o.error));
const cycle=[obj('a','midpoint',['b','b']),obj('b','midpoint',['a','a'])];assert.throws(()=>G.order(cycle),/vòng phụ thuộc/);
assert.equal(G.order([obj('c','circle',['M'],{radius:2}),point('M',[1,2,0])])[0].id,'M');
console.log('PASS: legacy geometry migration and cycle rejection.');

