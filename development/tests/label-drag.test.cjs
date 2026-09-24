const assert=require('node:assert/strict'),{boot}=require('./construction-interaction.test.cjs');
for(const hash of ['', '#space']){
 const t=boot(hash),a=t.c.ConstructionApp,point=a.objects.find(o=>o.name==='B'),q=a.project(a.resolved.get(point.id).p),start=[q[0]+13,q[1]-13],end=[start[0]+120,start[1]-80],original=JSON.stringify(point.coords),view=JSON.stringify(a.view);
 t.$('board').onpointerdown(t.ev(start));t.$('board').onpointermove(t.ev(end));t.$('board').onpointerup(t.ev(end));
 assert.equal(JSON.stringify(point.coords),original);assert.equal(JSON.stringify(a.view),view);assert.ok(Math.abs(Math.hypot(...point.labelOffset)-56)<1e-8);
 const offset=[...point.labelOffset],saved=a.snapshot(),tex=a.exportLatex();assert.ok(tex.includes(' {B}'));t.$('undo').click();assert.equal(a.objects.find(o=>o.id===point.id).labelOffset,undefined);t.$('redo').click();assert.deepEqual(a.objects.find(o=>o.id===point.id).labelOffset,offset);
 a.restore(saved);assert.deepEqual(a.objects.find(o=>o.id===point.id).labelOffset,offset);
 t.$('labels').checked=false;t.$('labels').onchange();assert.ok(!a.exportLatex().includes(' {B}'));t.$('labels').checked=true;t.$('labels').onchange();
 const p=a.project(a.resolved.get(point.id).p);t.$('board').ondblclick({...t.ev([p[0]+offset[0]+3,p[1]+offset[1]-5]),preventDefault(){}});assert.equal(a.objects.find(o=>o.id===point.id).labelOffset,undefined);
 const invalid=a.snapshot();invalid.objects[0].labelOffset=[999,0];assert.throws(()=>a.restore(invalid),/56 pixel/);
}
console.log('PASS: bounded label dragging in 2D/3D, unchanged coordinates/camera, undo/redo, save/open, export, hidden labels, reset and invalid offset guard.');
