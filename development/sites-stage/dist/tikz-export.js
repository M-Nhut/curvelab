(function(root){'use strict';
const num=x=>{if(!Number.isFinite(x))throw Error('Tọa độ xuất LaTeX không hữu hạn.');return Number(x.toFixed(6)).toString();};
const escape=s=>String(s).replace(/[\\{}%$&#_^~\r\n]/g,c=>({'\\':'\\textbackslash{}','{':'\\{','}':'\\}','%':'\\%','$':'\\$','&':'\\&','#':'\\#','_':'\\_','^':'\\textasciicircum{}','~':'\\textasciitilde{}','\n':' ','\r':' '}[c]));
const comment=s=>String(s).replace(/[\r\n\u2028\u2029]/g,' ');
function color(s){s=String(s).trim().toLowerCase();const named={white:'#ffffff',black:'#000000',red:'#ff0000',blue:'#0000ff',gray:'#808080',grey:'#808080',transparent:'#00000000'};s=named[s]||s;if(/^#[a-f0-9]{3,8}$/.test(s)){let h=s.slice(1);if(h.length===3||h.length===4)h=[...h].map(x=>x+x).join('');if(h.length!==6&&h.length!==8)throw Error('Màu không hỗ trợ: '+s);return {rgb:[0,2,4].map(i=>parseInt(h.slice(i,i+2),16)),a:h.length===8?parseInt(h.slice(6),16)/255:1};}let m=s.match(/^rgba?\((.+)\)$/);if(m){const p=m[1].split(/[\s,\/]+/).filter(Boolean);return {rgb:p.slice(0,3).map(x=>Math.round(parseFloat(x)*(x.includes('%')?2.55:1))),a:p[3]===undefined?1:parseFloat(p[3])};}m=s.match(/^hsla?\((.+)\)$/);if(m){const p=m[1].split(/[\s,\/]+/).filter(Boolean),h=((parseFloat(p[0])%360)+360)%360/60,ss=parseFloat(p[1])/100,l=parseFloat(p[2])/100,c=(1-Math.abs(2*l-1))*ss,x=c*(1-Math.abs(h%2-1)),v=[[c,x,0],[x,c,0],[0,c,x],[0,x,c],[x,0,c],[c,0,x]][Math.floor(h)],z=l-c/2;return {rgb:v.map(t=>Math.round((t+z)*255)),a:p[3]===undefined?1:parseFloat(p[3])};}throw Error('Màu chưa được hỗ trợ khi xuất: '+s);}
function intersect(a,b){return [Math.max(a[0],b[0]),Math.max(a[1],b[1]),Math.min(a[2],b[2]),Math.min(a[3],b[3])];}
function clipLine(a,b,r){const dx=b[0]-a[0],dy=b[1]-a[1];let t0=0,t1=1;for(const [p,q] of [[-dx,a[0]-r[0]],[dx,r[2]-a[0]],[-dy,a[1]-r[1]],[dy,r[3]-a[1]]]){if(p===0){if(q<0)return null;continue;}const t=q/p;if(p<0)t0=Math.max(t0,t);else t1=Math.min(t1,t);if(t0>t1)return null;}return [[a[0]+t0*dx,a[1]+t0*dy],[a[0]+t1*dx,a[1]+t1*dy]];}
function clipPolygon(points,r){let p=points;for(const [axis,bound,sign] of [[0,r[0],1],[0,r[2],-1],[1,r[1],1],[1,r[3],-1]]){const out=[];for(let i=0;i<p.length;i++){const a=p[i],b=p[(i+1)%p.length],ia=sign*(a[axis]-bound)>=0,ib=sign*(b[axis]-bound)>=0;if(ia)out.push(a);if(ia!==ib){const t=(bound-a[axis])/(b[axis]-a[axis]);out.push([a[0]+t*(b[0]-a[0]),a[1]+t*(b[1]-a[1])]);}}p=out;}return p;}

// Factor styles and adjacent clips without changing paint order or sampled geometry.
function compactDrawing(lines,viewport){
 const entries=lines.map(line=>{const m=line.match(/^\\begin\{scope\}\n\\clip ([^\n]+);\n([\s\S]*)\n\\end\{scope\}$/);return m?{clip:m[1],body:m[2]}:{clip:viewport,body:line};}),styles=new Map();
 for(const e of entries)e.body=e.body.replace(/\\(draw|fill|node)\[([^\n]*?)\] /g,(_,cmd,opts)=>{let name=styles.get(opts);if(!name){name='s'+(styles.size+1);styles.set(opts,name);}return '\\'+cmd+'['+name+'] ';});
 // Adjacent opaque strokes of the same style share a path. Keep dashed subpaths separate.
 const combined=[];
 for(const e of entries){const m=e.body.match(/^\\draw\[(s\d+)\] ([\s\S]*);$/),prev=combined.at(-1),pm=prev?.body.match(/^\\draw\[(s\d+)\] ([\s\S]*);$/),opts=m?[...styles].find(([,v])=>v===m[1])[0]:'';
  if(m&&pm&&m[1]===pm[1]&&e.clip===prev.clip&&/draw opacity=1(?:,|$)/.test(opts)){
   let path=m[2];const tail=pm[2].match(/(\([^()]+\))$/),head=path.match(/^(\([^()]+\))--/);
   if(!opts.includes('dash pattern')&&tail&&head&&tail[1]===head[1])path=path.slice(head[1].length);else path=' '+path;
   prev.body='\\draw['+m[1]+'] '+pm[2]+path+';';
  }else combined.push({...e});
 }
 const body=[];let clip=viewport;
 for(const e of combined){if(e.clip!==clip){if(clip!==viewport)body.push('\\end{scope}');clip=e.clip;if(clip!==viewport)body.push('\\begin{scope}','\\clip '+clip+';');}body.push(e.body);}
 if(clip!==viewport)body.push('\\end{scope}');
 return {body:body.join('\n'),styles:[...styles].map(([opts,name])=>'  '+name+'/.style={'+opts+'}').join(',\n')};
}

class Recorder{
 constructor(width,height,native){if(!(width>0&&height>0))throw Error('Khung hình chưa sẵn sàng.');this.width=width;this.height=height;this.native=native;this.ops=[];this.stack=[];this.path=[];this.current=null;this.state={strokeStyle:'#000',fillStyle:'#000',lineWidth:1,font:'10px sans-serif',textAlign:'start',textBaseline:'alphabetic',lineCap:'butt',lineJoin:'miter',globalAlpha:1,dash:[],clip:[0,0,width,height]};for(const key of ['font','textAlign','textBaseline','lineCap','lineJoin','lineWidth','strokeStyle','fillStyle','globalAlpha'])if(native?.[key]!==undefined&&typeof native[key]!=='function')this.state[key]=native[key];}
 beginPath(){this.path=[];this.current=null;}
 moveTo(x,y){this.current={points:[[x,y]],closed:false};this.path.push(this.current);}
 lineTo(x,y){if(!this.current)this.moveTo(x,y);else{this.current.points.push([x,y]);delete this.current.ellipse;}}
 closePath(){if(this.current)this.current.closed=true;}
 rect(x,y,w,h){this.current={points:[[x,y],[x+w,y],[x+w,y+h],[x,y+h]],closed:true};this.path.push(this.current);}
 arc(x,y,r,start,end,ccw=false){this.ellipse(x,y,r,r,0,start,end,ccw);}
 ellipse(x,y,rx,ry,rotation,start,end,ccw=false){if(rx<0||ry<0)throw Error('Bán kính âm.');const tau=2*Math.PI;let sweep=end-start;if(Math.abs(sweep)>=tau)sweep=ccw?-tau:tau;else if(ccw&&sweep>0)sweep-=tau;else if(!ccw&&sweep<0)sweep+=tau;const full=Math.abs(Math.abs(sweep)-tau)<1e-8,points=[],n=Math.max(12,Math.min(720,Math.ceil(Math.abs(sweep)*Math.max(rx,ry)/3)));for(let i=0;i<=n;i++){const a=start+sweep*i/n,u=rx*Math.cos(a),v=ry*Math.sin(a);points.push([x+u*Math.cos(rotation)-v*Math.sin(rotation),y+u*Math.sin(rotation)+v*Math.cos(rotation)]);}if(!this.current){this.current={points,closed:full};if(full&&rotation===0)this.current.ellipse={x,y,rx,ry};this.path.push(this.current);}else this.current.points.push(...points);}
 save(){this.stack.push(structuredClone(this.state));}
 restore(){if(this.stack.length)this.state=this.stack.pop();}
 clip(){if(!this.path.length)return;const ps=this.path.flatMap(p=>p.points),r=[Math.min(...ps.map(p=>p[0])),Math.min(...ps.map(p=>p[1])),Math.max(...ps.map(p=>p[0])),Math.max(...ps.map(p=>p[1]))];this.state.clip=intersect(this.state.clip,r);}
 setLineDash(d){this.state.dash=[...d];} getLineDash(){return [...this.state.dash];}
 setTransform(){/* Draw routines already use CSS-pixel coordinates, independent of DPR. */}
 clearRect(x,y,w,h){if(x<=0&&y<=0&&w>=this.width&&h>=this.height)this.ops=[];}
 add(kind){this.ops.push({kind,path:structuredClone(this.path),state:structuredClone(this.state)});}
 stroke(){this.add('stroke');} fill(){this.add('fill');}
 fillRect(x,y,w,h){this.ops.push({kind:'fill',path:[{points:[[x,y],[x+w,y],[x+w,y+h],[x,y+h]],closed:true}],state:structuredClone(this.state)});}
 fillText(text,x,y){this.ops.push({kind:'text',text:String(text),x,y,state:structuredClone(this.state)});}
 measureText(text){if(this.native?.measureText){const old=this.native.font;try{this.native.font=this.state.font;return this.native.measureText(text);}finally{this.native.font=old;}}return {width:String(text).length*(parseFloat(this.state.font.match(/([\d.]+)px/)?.[1])||10)*.55};}
 document(options={}){const unit=16/this.width,pt=unit*72.27/2.54,colors=new Map(),xy=p=>'('+num(p[0]*unit)+','+num(p[1]*unit)+')',coords=new Map(),declarations=[],lines=[];
 const paint=(source,alpha=1)=>{const c=color(source),key=c.rgb.join(','),name=colors.get(key)||'cl'+colors.size;colors.set(key,name);return {name,opacity:num(Math.max(0,Math.min(1,c.a*alpha)))};};
 for(const [i,p] of (options.points||[]).entries()){if(!p.screen?.every(Number.isFinite))continue;const k=p.screen.map(v=>num(v)).join(','),name='P'+(i+1);if(Math.max(...p.screen.map(Math.abs))*unit>300)continue;coords.set(k,name);declarations.push('% '+comment(p.name)+'; world = '+comment(JSON.stringify(p.world))+'\n\\coordinate ('+name+') at '+xy(p.screen)+';');}
 const at=p=>{const ref=coords.get(p.map(v=>num(v)).join(','));return ref?'('+ref+')':xy(p);};
 for(const op of this.ops){const s=op.state,r=s.clip;if(r[0]>=r[2]||r[1]>=r[3])continue;const p=paint(op.kind==='stroke'?s.strokeStyle:s.fillStyle,s.globalAlpha),opts=[(op.kind==='stroke'?'draw':'fill')+'='+p.name,(op.kind==='stroke'?'draw':'fill')+' opacity='+p.opacity];if(op.kind==='stroke'){opts.push('line width='+num(s.lineWidth*pt)+'pt','line cap='+({butt:'butt',round:'round',square:'rect'}[s.lineCap]||'butt'),'line join='+({miter:'miter',round:'round',bevel:'bevel'}[s.lineJoin]||'miter'));if(s.dash.length){let dash=s.dash.length%2?[...s.dash,...s.dash]:s.dash;opts.push('dash pattern='+dash.map((v,i)=>(i%2?'off ':'on ')+num(Math.max(.001,v*pt))+'pt').join(' '));}}
 if(op.kind==='text'){if(op.x<r[0]-300||op.x>r[2]+300||op.y<r[1]-100||op.y>r[3]+100)continue;const size=(Number(s.font.match(/([\d.]+)px/)?.[1])||12)*pt,bold=/bold|[6-9]00/.test(s.font)?'\\bfseries':'',italic=/italic/.test(s.font)?'\\itshape':'',family=/Georgia|serif|Times|Cambria/.test(s.font)&&!/sans-serif/.test(s.font)?'\\rmfamily':'\\sffamily',vertical={alphabetic:'base',top:'north',hanging:'north',middle:'center',bottom:'south',ideographic:'south'}[s.textBaseline]||'base',horizontal={left:'west',start:'west',right:'east',end:'east',center:''}[s.textAlign]??'west',anchor=vertical==='center'?(horizontal||'center'):vertical+(horizontal?' '+horizontal:'');lines.push('\\begin{scope}\n\\clip '+xy([r[0],r[1]])+' rectangle '+xy([r[2],r[3]])+';\n\\node[anchor='+anchor+',inner sep=0pt,outer sep=0pt,text='+p.name+',text opacity='+p.opacity+',font={'+family+bold+italic+'\\fontsize{'+num(size)+'}{'+num(size*1.2)+'}\\selectfont}] at '+xy([op.x,op.y])+' {'+escape(op.text)+'};\n\\end{scope}');continue;}
 const pieces=[];for(const path of op.path){if(path.points.some(p=>!p.every(Number.isFinite)))continue;const e=path.ellipse;if(e&&Math.max(Math.abs(e.x)+e.rx,Math.abs(e.y)+e.ry)*unit<300){pieces.push(at([e.x,e.y])+' ellipse [x radius='+num(e.rx*unit)+'cm,y radius='+num(e.ry*unit)+'cm]');continue;}if(op.kind==='fill'){const ps=clipPolygon(path.points,r);if(ps.length>2)pieces.push(ps.map(at).join('--')+'--cycle');}else{let prior=null;for(let i=1;i<path.points.length+(path.closed?1:0);i++){const seg=clipLine(path.points[i-1],path.points[i%path.points.length],r);if(!seg){prior=null;continue;}const a=at(seg[0]),b=at(seg[1]);if(prior===a)pieces[pieces.length-1]+='--'+b;else pieces.push(a+'--'+b);prior=b;}}}if(pieces.length)lines.push('\\begin{scope}\n\\clip '+xy([r[0],r[1]])+' rectangle '+xy([r[2],r[3]])+';\n\\'+(op.kind==='fill'?'fill':'draw')+'['+opts.join(',')+'] '+pieces.join(' ')+';\n\\end{scope}');}
 if(options.formula?.tex){const f=options.formula,left=f.corner==='left',size=15*pt;lines.push('% Formula shown in the selected corner.\n\\node[anchor=north '+(left?'west':'east')+',inner sep=3pt,fill=white,fill opacity=.94,text opacity=1,font={\\fontsize{'+num(size)+'}{'+num(size*1.2)+'}\\selectfont}] at '+xy([left?14:this.width-14,14])+' {$'+f.tex+'$};');}
 const viewport=xy([0,0])+' rectangle '+xy([this.width,this.height]),compact=compactDrawing(lines,viewport);
 const definitions=[...colors].map(([key,name])=>'\\definecolor{'+name+'}{RGB}{'+key+'}').join('\n');
 return `% !TeX program = xelatex
% CurveLab - standalone vector export. Compile with XeLaTeX, not pdfLaTeX.
% Structure: tailieuvehinh.pdf, I.1 (p.4); coordinates, draw, node, scope, clip.
% 3D is the current parallel projection, with visible/hidden line parts (I.3.5, pp.30-32).
% Captures the current viewport and sampled paths, without embedding a PNG.
% Width 16 cm; line widths and label sizes preserve the current drawing proportions.
% Mode: ${comment(options.title||'CurveLab')}
\\documentclass[varwidth=50cm,border=2pt]{standalone}
\\usepackage{fontspec}
\\IfFontExistsTF{Times New Roman}{\\setmainfont{Times New Roman}}{\\setmainfont{TeX Gyre Termes}}
\\IfFontExistsTF{Arial}{\\setsansfont{Arial}}{\\setsansfont{TeX Gyre Heros}}
\\usepackage{amsmath,amssymb}
\\usepackage{tikz,graphicx}
\\usetikzlibrary{calc,angles,arrows.meta}
${definitions}
% Change only this width; geometry, strokes and labels scale together.
\\newcommand{\\FigureWidth}{16cm}
\\begin{document}
\\begin{center}
\\resizebox{\\FigureWidth}{!}{%
\\begin{tikzpicture}[x=1cm,y=-1cm,
 declare function={figwidth=16; figheight=${num(this.height*unit)};},
${compact.styles}
]
% Coordinates use the displayed projection; original coordinates are retained in comments.
\\path[use as bounding box] (0,0) rectangle ({figwidth},{figheight});
\\begin{scope}
\\clip (0,0) rectangle ({figwidth},{figheight});
${declarations.join('\n')}
% Drawing in display order: axes/grid, shapes, labels, formula.
${compact.body}
\\end{scope}
\\end{tikzpicture}%
}
\\end{center}
\\end{document}
`;}
}
for(const key of ['strokeStyle','fillStyle','lineWidth','font','textAlign','textBaseline','lineCap','lineJoin','globalAlpha'])Object.defineProperty(Recorder.prototype,key,{get(){return this.state[key];},set(v){this.state[key]=v;}});
function download(source,filename){const link=document.createElement('a'),url=URL.createObjectURL(new Blob([source],{type:'application/x-tex;charset=utf-8'}));link.href=url;link.download=filename;link.click();setTimeout(()=>URL.revokeObjectURL(url),2000);}
root.CurveTikZ={Recorder,escape,color,clipLine,clipPolygon,download};if(typeof module!=='undefined')module.exports=root.CurveTikZ;
})(typeof window!=='undefined'?window:globalThis);
