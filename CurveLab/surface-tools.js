/* Surface sampling and local differential analysis. No symbolic conclusions from a mesh. */
(function(root){'use strict';
const finite=p=>p.every(v=>Number.isFinite(v)&&Math.abs(v)<1e9),sub=(a,b)=>a.map((v,i)=>v-b[i]),norm=a=>Math.hypot(...a);
function bounds(points){const ps=points.filter(finite);if(!ps.length)throw Error('Không có điểm hữu hạn.');return [0,1,2].map(k=>{let lo=Infinity,hi=-Infinity;for(const p of ps){lo=Math.min(lo,p[k]);hi=Math.max(hi,p[k]);}const pad=Math.max((hi-lo)*.08,Math.max(1,Math.abs(lo))*.02);return [lo-pad,hi+pad];});}
function ticks(lo,hi,count=5){const raw=(hi-lo)/count;if(!(raw>0))return [];const power=10**Math.floor(Math.log10(raw)),q=raw/power,step=(q<=1?1:q<=2?2:q<=5?5:10)*power,out=[];for(let i=Math.ceil(lo/step),n=0;i*step<=hi+step*1e-9&&n<20;i++,n++)out.push(Number((i*step).toPrecision(10)));return out;}
function mesh(s,N){if(![28,44,64,100].includes(N))throw Error('Chọn độ chi tiết 28, 44, 64 hoặc 100.');const points=[],gauss=[],cells=[],[a,b,c,d]=s.range;let omitted=0;
 for(let i=0;i<=N;i++)for(let j=0;j<=N;j++){const u=a+(b-a)*i/N,v=c+(d-c)*j/N;points.push(s.point(u,v));gauss.push(s.at(u,v,false).K);}
 for(let i=0;i<N;i++)for(let j=0;j<N;j++){
  const ids=[i*(N+1)+j,(i+1)*(N+1)+j,(i+1)*(N+1)+j+1,i*(N+1)+j+1],ps=ids.map(k=>points[k]);let valid=ps.every(finite);
  if(valid){const probes=[[i+.5,j],[i+1,j+.5],[i+.5,j+1],[i,j+.5]];for(let k=0;k<4;k++){const q=s.point(a+(b-a)*probes[k][0]/N,c+(d-c)*probes[k][1]/N),mid=ps[k].map((v,t)=>(v+ps[(k+1)%4][t])/2),span=norm(sub(ps[k],ps[(k+1)%4]));if(!finite(q)||norm(sub(q,mid))>.5*Math.max(1e-8,span)){valid=false;break;}}}
  cells.push(valid);if(!valid)omitted++;
 }
 return {N,points,gauss,cells,omitted,bounds:bounds(points)};
}
function sections(model,levels){const {N,points,cells}=model,out=levels.map(level=>({level,segments:[],coplanar:false}));
 for(let i=0;i<N;i++)for(let j=0;j<N;j++){if(cells&&!cells[i*N+j])continue;const ids=[i*(N+1)+j,(i+1)*(N+1)+j,(i+1)*(N+1)+j+1,i*(N+1)+j+1];if(!ids.every(k=>finite(points[k])))continue;
  for(const tri of [[ids[0],ids[1],ids[2]],[ids[0],ids[2],ids[3]]])for(const item of out){const ps=tri.map(k=>points[k]),eps=1e-10*Math.max(1,Math.abs(item.level)),delta=ps.map(p=>p[2]-item.level);if(delta.every(v=>Math.abs(v)<=eps)){item.coplanar=true;continue;}const found=[];const add=p=>{if(!found.some(q=>norm(sub(p,q))<1e-9))found.push(p);};for(let k=0;k<3;k++){const next=(k+1)%3;if(Math.abs(delta[k])<=eps)add(ps[k]);if(delta[k]*delta[next]<0){const t=delta[k]/(delta[k]-delta[next]);add(ps[k].map((v,a)=>v+t*(ps[next][a]-v)));}}if(found.length===2&&norm(sub(found[0],found[1]))>1e-10)item.segments.push(found);}
 }
 return out;
}
function parameterCurve(s,u,v,axis,count=240){const [a,b,c,d]=s.range,out=[];let run=[],prior=null;for(let i=0;i<=count;i++){const t=i/count,q=axis==='u'?s.point(u,c+(d-c)*t):s.point(a+(b-a)*t,v);if(!finite(q)){if(run.length>1)out.push(run);run=[];prior=null;continue;}if(prior){const mid=axis==='u'?s.point(u,c+(d-c)*(i-.5)/count):s.point(a+(b-a)*(i-.5)/count,v),mean=q.map((x,k)=>(x+prior[k])/2);if(!finite(mid)||norm(sub(mid,mean))>.5*Math.max(1e-8,norm(sub(q,prior)))){if(run.length>1)out.push(run);run=[];}}run.push(q);prior=q;}if(run.length>1)out.push(run);return out;}
function depthIndex(projected,N,cells,size=32){const buckets=new Map();
 for(let i=0;i<N;i++)for(let j=0;j<N;j++){if(cells&&!cells[i*N+j])continue;const ids=[i*(N+1)+j,(i+1)*(N+1)+j,(i+1)*(N+1)+j+1,i*(N+1)+j+1];if(ids.some(k=>!projected[k]))continue;for(const indices of [[0,1,2],[0,2,3]]){const tri=indices.map(k=>projected[ids[k]]),xs=tri.map(q=>q.p[0]),ys=tri.map(q=>q.p[1]),x0=Math.floor(Math.min(...xs)/size),x1=Math.floor(Math.max(...xs)/size),y0=Math.floor(Math.min(...ys)/size),y1=Math.floor(Math.max(...ys)/size);if((x1-x0+1)*(y1-y0+1)>1000)continue;for(let x=x0;x<=x1;x++)for(let y=y0;y<=y1;y++){const key=x+','+y;if(!buckets.has(key))buckets.set(key,[]);buckets.get(key).push(tri);}}}
 return q=>{const list=buckets.get(Math.floor(q.p[0]/size)+','+Math.floor(q.p[1]/size))||[];for(const [a,b,c] of list){const den=(b.p[1]-c.p[1])*(a.p[0]-c.p[0])+(c.p[0]-b.p[0])*(a.p[1]-c.p[1]);if(Math.abs(den)<1e-10)continue;const u=((b.p[1]-c.p[1])*(q.p[0]-c.p[0])+(c.p[0]-b.p[0])*(q.p[1]-c.p[1]))/den,v=((c.p[1]-a.p[1])*(q.p[0]-c.p[0])+(a.p[0]-c.p[0])*(q.p[1]-c.p[1]))/den,w=1-u-v;if(Math.min(u,v,w)>=-1e-7&&u*a.depth+v*b.depth+w*c.depth>q.depth+1e-5*Math.max(1,Math.abs(q.depth)))return true;}return false;};
}
function graphAnalysis(s,x,y,angle=0){const p=s.at(x,y),hessian=[p.duu[2],p.duv[2],p.dvv[2]],gradient=[p.du[2],p.dv[2]],direction=[Math.cos(angle),Math.sin(angle)];const result={p,gradient,hessian,direction,gradientNorm:norm(gradient),directional:gradient[0]*direction[0]+gradient[1]*direction[1],valid:false,secondOrder:false,classification:'Chưa kết luận'};
 if(!p.regular||!finite(gradient))return result;result.valid=true;result.secondOrder=finite(hessian);
 // Compare one-sided slopes and derivatives at two scales. This is a diagnostic, not a proof of C².
 for(const factor of [1,0.5])for(let k=0;k<2;k++){const h=1e-4*factor*Math.max(1,Math.abs(k?y:x)),pa=s.at(x+(k?0:h),y+(k?h:0),false),pb=s.at(x-(k?0:h),y-(k?h:0),false),forward=(pa.p[2]-p.p[2])/h,backward=(p.p[2]-pb.p[2])/h;if(!Number.isFinite(forward+backward)||Math.max(Math.abs(forward-gradient[k]),Math.abs(backward-gradient[k]))>0.005*Math.max(1,norm(gradient))){result.valid=false;result.secondOrder=false;}
  const estimate=[(pa.du[2]-pb.du[2])/(2*h),(pa.dv[2]-pb.dv[2])/(2*h)],expected=k?[hessian[1],hessian[2]]:[hessian[0],hessian[1]];if(!finite(estimate)||norm(sub(estimate,expected))>.005*Math.max(1,norm(expected)))result.secondOrder=false;
 }
 if(!result.valid)return result;
 const [xx,xy,yy]=hessian,D=xx*yy-xy*xy;result.determinant=D;
 if(result.gradientNorm>1e-8)result.classification='Không phải điểm dừng (theo ngưỡng số)';
 else if(!result.secondOrder)result.classification='Hessian chưa ổn định · chưa phân loại';
 else{const tol=1e-8*Math.max(1,xx*xx,xy*xy,yy*yy);result.classification=D>tol?(xx>0?'Gần điểm cực tiểu':'Gần điểm cực đại'):D<-tol?'Gần điểm yên ngựa':'Hessian suy biến · phép thử chưa kết luận';}
 return result;
}
root.SurfaceTools={bounds,ticks,mesh,sections,parameterCurve,graphAnalysis,depthIndex};if(typeof module!=='undefined')module.exports=root.SurfaceTools;
})(typeof window!=='undefined'?window:globalThis);
