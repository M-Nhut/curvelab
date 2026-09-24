// Actual drawing functions under a minimal DOM; this is not a browser layout test.
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
const read=f=>fs.readFileSync(path.join(__dirname,'../../CurveLab',f),'utf8'),out=path.join(__dirname,'../artifacts/tikz');
function context(){const ids=new Map(),element=()=>({value:'',checked:false,style:{},classList:{toggle(){}},append(){},replaceChildren(){},getContext(){return null;}});const c={console,structuredClone,document:{getElementById(id){if(!ids.has(id))ids.set(id,element());return ids.get(id);},createElement:element}};c.window=c;vm.createContext(c);for(const f of ['tikz-export.js','engine.js','geometry.js','lab-core.js','surface-tools.js','latex.js'])vm.runInContext(read(f),c);c.CurveLatex.node=()=>element();return c;}
const studio=read('studio.js'),c=context();
vm.runInContext(studio.slice(0,studio.indexOf('function surfaceResult()'))+studio.match(/function exportLatex\(\)[^\n]+/)[0]+`
const config={kind:'graph',z:'x^2-y^2',u0:'-2',u1:'2',v0:'-2',v1:'2',constants:''},s=C.surface(config),N=24,points=[];
for(let i=0;i<=N;i++)for(let j=0;j<=N;j++)points.push(s.point(-2+4*i/N,-2+4*j/N));
model={s,N,points,gauss:points.map(()=>0),config};
$('surface-color').value='height';$('surface-u').value='600';$('surface-v').value='550';$('lab-corner').value='right';
for(const id of ['surface-mesh','surface-normal','surface-tangent','lab-axes','lab-grid'])$(id).checked=true;
ctx=new CurveTikZ.Recorder(W,H);fit();annotate();window.surfaceTex=exportLatex();
mode='worksheet';model={a:-3,b:3,x0:1,fs:C.functions([{expr:'x^2',color:'#1463d6'},{expr:'sin(x)',color:'#b03587'}],'')};
$('worksheet-selected').value='0';$('worksheet-derivative').checked=true;$('worksheet-tangent').checked=true;
fit();annotate();window.worksheetTex=exportLatex();
})();`,c);
for(const name of ['surface','worksheet']){assert.ok(!c[name+'Tex'].includes('gathered'));fs.writeFileSync(path.join(out,name+'.tex'),c[name+'Tex']);}
const a=context(),app=read('app.js');
const fn=name=>{const start=app.indexOf('function '+name+'('),end=app.indexOf('\nfunction ',start+1);return app.slice(start,end<0?undefined:end);};
vm.runInContext(`const $=id=>document.getElementById(id);let W=900,H=550,ctx=new CurveTikZ.Recorder(W,H),view,selectedT=null;const margins={l:72,r:22,t:24,b:48};const fmt=String;function typeset(){}function drawSurveyPoints(){}function drawPointNames(){}function drawAxes(){}
const plotted={mode:'param',x:'3*cos(t)',y:'2*sin(t)',a:'0',b:'2*pi',samples:1200,constants:''},curve=CurveMath.makeCurve(plotted);
$('position').value='1300';$('grid').checked=true;$('axes').checked=true;$('tangent').checked=true;$('equal').checked=true;$('formula-corner').value='right';
${['geometry','ticks','line','drawPlanar','fitPlanar'].map(fn).join('\n')}
function draw(){drawPlanar();}
${read('math-view.js').split('function renderPlotFormula')[0]}
${app.match(/function exportCurveLatex\(\)[^\n]+/)[0]}
fitPlanar();window.source=exportCurveLatex();`,a);
assert.ok(!a.source.includes('gathered'));assert.match(a.source,/\\draw/);fs.writeFileSync(path.join(out,'curve.tex'),a.source);
console.log('PASS: curve, surface and worksheet drawing functions export vector paths and mathematical formula overlays.');
