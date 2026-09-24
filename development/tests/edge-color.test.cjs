const assert=require('node:assert/strict'),{boot}=require('./construction-interaction.test.cjs');
for(const [hash,preset] of [['','triangle'],['#space','tetrahedron'],['#space','cube']]){
 const t=boot(hash),a=t.c.ConstructionApp;t.$('preset').value=preset;t.$('example').click();
 const o=a.objects.find(o=>['triangle','tetrahedron','prism'].includes(o.kind)),q=a.resolved.get(o.id),edge=q.type==='triangle'?q.p.slice(0,2):t.c.ConstructionView.edges(q)[0],mid=edge[0].map((v,i)=>(v+edge[1][i])/2);
 t.click(a.project(mid));assert.equal(a.selected,o.id);assert.equal(a.selectedEdge,0);assert.equal(t.$('selection-panel').hidden,false);
 t.$('selection-color').value='#ed1234';t.$('selection-color').onchange();assert.equal(o.edgeColors[0],'#ed1234');assert.equal(Object.keys(o.edgeColors).length,1);
 const saved=a.snapshot(),tex=a.exportLatex();assert.ok(tex.includes('{237,18,52}'));t.$('undo').click();assert.equal(a.objects.find(x=>x.id===o.id).edgeColors?.[0],undefined);t.$('redo').click();assert.equal(a.objects.find(x=>x.id===o.id).edgeColors[0],'#ed1234');
 a.restore(saved);assert.equal(a.objects.find(x=>x.id===o.id).edgeColors[0],'#ed1234');
 a.quickPoints(preset==='triangle'?'A=(1,0)':'A=(1,0,0)');assert.equal(a.objects.find(x=>x.id===o.id).edgeColors[0],'#ed1234');
}
console.log('PASS: select individual triangle/tetrahedron/prism edges, isolated color, undo/redo, save/open, point updates and TikZ colors.');
