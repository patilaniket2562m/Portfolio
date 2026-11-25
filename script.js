// ===== lazy loader: the 3D house starts only on click =====
(function(){
const ld=document.getElementById('load'),ldt=ld&&ld.querySelector('span');
const showLoad=t=>{if(!ld)return;ldt.textContent=t;ld.style.display='';ld.style.opacity=1};
const hideLoad=()=>{if(!ld)return;ld.style.opacity=0;setTimeout(()=>ld.style.display='none',700)};
addEventListener('load',()=>setTimeout(hideLoad,300));
const LIBS=['https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js',
            'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js'];
const loadScript=src=>new Promise((ok,no)=>{const e=document.createElement('script');e.src=src;e.onload=ok;e.onerror=()=>no(new Error('Could not load '+src));document.head.appendChild(e)});
let libsP=null,started=false,busy=false;
const loadLibs=()=>libsP||(libsP=(async()=>{for(const s of LIBS)await loadScript(s)})().catch(e=>{libsP=null;throw e}));
window.prefetchHouse=()=>LIBS.forEach(h=>{const l=document.createElement('link');l.rel='prefetch';l.as='script';l.href=h;document.head.appendChild(l)});
window.enterHouse=async function(room){
  if(window.HOUSE&&window.HOUSE.ready){HOUSE.enter(room);return}
  if(busy)return;busy=true;showLoad('BUILDING THE HOUSE\u2026');
  try{
    await loadLibs();
    if(!started){started=true;window.NPC_API=window.NPC_API||'/api/chat';
      await new Promise(r=>setTimeout(r,50));
      window.__startHouse()}
    if(!window.HOUSE){hideLoad();return}
    if(!HOUSE.ready)await new Promise(ok=>addEventListener('house-ready',ok,{once:true}));
    hideLoad();HOUSE.enter(room);
  }catch(e){console.warn(e);if(ldt)ldt.textContent='Could not load the 3D house. Check your connection.';setTimeout(hideLoad,2500)}
  finally{busy=false}
};
})();
window.__startHouse=function(){
const $=s=>document.querySelector(s),T=THREE,V3=T.Vector3,rnd=Math.random,cl=(v,a,b)=>Math.max(a,Math.min(b,v));
const coarse=matchMedia('(pointer:coarse)').matches;
let r;const cv=$('#gl');
try{if(!window.THREE)throw 0;r=new T.WebGLRenderer({canvas:cv,antialias:!coarse,powerPreference:'high-performance'})}catch(e){$('#nogl').style.display='grid';$('#load').style.display='none';return}
r.setPixelRatio(Math.min(devicePixelRatio,coarse?1.25:2));r.outputEncoding=T.sRGBEncoding;r.toneMapping=T.ACESFilmicToneMapping;r.toneMappingExposure=1.15;
r.shadowMap.enabled=!coarse;r.shadowMap.type=T.PCFSoftShadowMap;
const scene=new T.Scene();scene.background=new T.Color(0x0b0d12);scene.fog=new T.Fog(0x0b0d12,16,50);
const cam=new T.PerspectiveCamera(72,1,.05,80);
// ---- environment for reflections
(function(){const pm=new T.PMREMGenerator(r),es=new T.Scene();
 es.add(new T.Mesh(new T.BoxGeometry(60,30,60),new T.MeshBasicMaterial({color:0x2a2520,side:T.BackSide})));
 [[0,14,0,30,.5,20,0xffffff,4],[-24,6,0,.5,10,24,0xffd9a8,3],[24,6,0,.5,10,24,0xb8d4ff,2.5],[0,6,-26,26,8,.5,0xffffff,1.5]].forEach(([x,y,z,w,h,d,c,k])=>{const m=new T.MeshBasicMaterial();m.color.set(c).multiplyScalar(k);const b=new T.Mesh(new T.BoxGeometry(w,h,d),m);b.position.set(x,y,z);es.add(b)});
 scene.environment=pm.fromScene(es,.03).texture;pm.dispose()})();
// ---- textures
function tex(w,h,draw,srgb,rep){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new T.CanvasTexture(c);t.encoding=srgb===false?T.LinearEncoding:T.sRGBEncoding;t.wrapS=t.wrapT=T.RepeatWrapping;t.anisotropy=r.capabilities.getMaxAnisotropy();if(rep)t.repeat.set(rep[0],rep[1]);return t}
const concT=tex(512,512,(x,w,h)=>{x.fillStyle='#8d9199';x.fillRect(0,0,w,h);for(let i=0;i<60;i++){const cx=rnd()*w,cy=rnd()*h,rr=20+rnd()*90,g=x.createRadialGradient(cx,cy,0,cx,cy,rr),l=rnd()>.5?255:0;g.addColorStop(0,`rgba(${l},${l},${l},.06)`);g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(cx-rr,cy-rr,rr*2,rr*2)}for(let i=0;i<12000;i++){const l=rnd()>.5?255:0;x.fillStyle=`rgba(${l},${l},${l},${rnd()*.1})`;x.fillRect(rnd()*w,rnd()*h,1+rnd()*2,1+rnd()*2)}},true,[3,3]);
const floorW=tex(512,512,(x,w,h)=>{for(let i=0;i<8;i++){x.fillStyle=`hsl(26,${38+rnd()*10}%,${26+rnd()*8}%)`;x.fillRect(0,i*64,w,64);for(let k=0;k<60;k++){x.fillStyle=`rgba(0,0,0,${rnd()*.12})`;x.fillRect(rnd()*w,i*64+rnd()*64,20+rnd()*90,1)}x.fillStyle='rgba(0,0,0,.45)';x.fillRect(0,i*64,w,2);x.fillRect((i*137)%w,i*64,2,64)}},true,[3,3]);
const woodT=tex(256,256,(x,w,h)=>{x.fillStyle='#6a4529';x.fillRect(0,0,w,h);for(let i=0;i<160;i++){const l=rnd()>.5;x.fillStyle=`rgba(${l?255:20},${l?210:10},${l?170:5},${rnd()*.12})`;x.fillRect(rnd()*w,0,1+rnd()*3,h)}});
function lab(text,bg,fg){return tex(256,256,(x,w,h)=>{x.fillStyle=bg;x.fillRect(0,0,w,h);x.strokeStyle='rgba(255,255,255,.28)';x.lineWidth=8;x.strokeRect(10,10,w-20,h-20);x.fillStyle=fg||'#fff';const fs=Math.min(120,Math.floor(215/(text.length*.6)));x.font=`800 ${fs}px system-ui,sans-serif`;x.textAlign='center';x.textBaseline='middle';x.fillText(text,w/2,h/2+6)})}
function sign(txt,x,y,z,ry,w,h,bg){const t=tex(512,Math.round(512*h/w),(c,W,H)=>{c.fillStyle=bg||'#16201a';c.fillRect(0,0,W,H);c.fillStyle='#fff';c.font=`800 ${H*.5}px system-ui,sans-serif`;c.textAlign='center';c.textBaseline='middle';c.fillText(txt,W/2,H/2+3)});const m=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map:t,toneMapped:false}));m.position.set(x,y,z);m.rotation.y=ry;scene.add(m);return m}
function poster(t1,t2,c1,c2){return tex(1024,640,(x,w,h)=>{const g=x.createLinearGradient(0,0,w,h);g.addColorStop(0,c1);g.addColorStop(1,c2);x.fillStyle=g;x.fillRect(0,0,w,h);x.fillStyle='rgba(5,8,14,.55)';x.fillRect(0,0,w,h);x.fillStyle='rgba(255,255,255,.1)';x.fillRect(60,60,w-120,44);[0,1,2].forEach(i=>{x.fillStyle=['#ff5f57','#febc2e','#28c840'][i];x.beginPath();x.arc(84+i*30,82,8,0,6.3);x.fill()});x.fillStyle='#fff';x.font='bold 84px system-ui,sans-serif';x.fillText(t1,70,300);x.fillStyle='#bcd0ff';x.font='38px system-ui,sans-serif';x.fillText(t2,70,365);for(let i=0;i<7;i++){x.fillStyle=i%2?'rgba(0,213,255,.7)':'rgba(66,133,255,.8)';x.fillRect(70+i*70,570-(40+rnd()*130),48,40+rnd()*130)}})}
function screenTex(title,lines){return tex(512,320,(x,w,h)=>{x.fillStyle='#0a1020';x.fillRect(0,0,w,h);x.fillStyle='#141c33';x.fillRect(0,0,w,26);['#ff5f57','#febc2e','#28c840'].forEach((c,i)=>{x.fillStyle=c;x.beginPath();x.arc(14+i*16,13,4,0,6.3);x.fill()});x.fillStyle='#7dffe0';x.font='800 34px system-ui,sans-serif';x.fillText(title,28,78);x.fillStyle='#cfd8ee';x.font='20px system-ui,sans-serif';lines.forEach((l,i)=>x.fillText(l,28,120+i*30))})}
// ---- materials
const M=(c,m,ro,o)=>new T.MeshStandardMaterial(Object.assign({color:c,metalness:m,roughness:ro},o));
const wallM=M(0xe4dfd6,0,.92,{bumpMap:concT,bumpScale:.4}),trim=M(0x24201c,.3,.5),dark=M(0x15191f,.8,.35),steel=M(0xaab3c0,1,.25),white=M(0xe6e8ec,.05,.55),fabric=M(0x6b665a,0,1),fabric2=M(0x575349,0,1),leaf=M(0x2f6b3a,0,.8);
const leafT=tex(256,256,(x,w,h)=>{for(let i=0;i<170;i++){x.save();x.translate(rnd()*w,rnd()*h);x.rotate(rnd()*6.28);x.fillStyle=`hsl(${92+rnd()*35},${42+rnd()*20}%,${20+rnd()*20}%)`;x.beginPath();x.ellipse(0,0,13+rnd()*8,5+rnd()*3,0,0,6.3);x.fill();x.strokeStyle='rgba(210,240,170,.25)';x.beginPath();x.moveTo(-12,0);x.lineTo(12,0);x.stroke();x.restore()}});
const leafCardM=new T.MeshStandardMaterial({map:leafT,alphaTest:.45,side:T.DoubleSide,roughness:.75});
const woodM=M(0xffffff,0,.55,{map:woodT,bumpMap:woodT,bumpScale:.3,envMapIntensity:.5});
const glowM=new T.MeshBasicMaterial({color:new T.Color(2.6,2.2,1.6)});
const pal=[0x5b2a2a,0x23324f,0x2f4a3a,0x8a6a2a,0x33363d,0x4a2f4f,0x6b6f78].map(c=>M(c,.05,.7));
// ---- world registry
const S=[],solids=[],pick=[],ray=[],bodies=[],rooms=[];
function bx(w,h,d,x,yb,z,m,col){const o=new T.Mesh(new T.BoxGeometry(w,h,d),m);o.position.set(x,yb+h/2,z);o.castShadow=o.receiveShadow=true;scene.add(o);if(col!==false){solids.push(o);ray.push(o);S.push({x0:x-w/2,x1:x+w/2,y0:yb,y1:yb+h,z0:z-d/2,z1:z+d/2,cx:x,cy:yb+h/2,cz:z,hx:w/2,hy:h/2,hz:d/2})}return o}
function cy(rt,rb,h,x,yb,z,m,sg){const o=new T.Mesh(new T.CylinderGeometry(rt,rb,h,sg||24),m);o.position.set(x,yb+h/2,z);o.castShadow=o.receiveShadow=true;scene.add(o);return o}
function sp(rad,m,x,y,z){const o=new T.Mesh(new T.SphereGeometry(rad,20,16),m);o.position.set(x,y,z);o.castShadow=true;scene.add(o);return o}
// walls
const WH=3.2,WT=.2,DHW=.6,DH=2.1;
function wsplit(a,b,cuts,fn){const pts=[a,...cuts.filter(c=>c>a+.01&&c<b-.01),b];for(let i=0;i<pts.length-1;i++)fn(pts[i],pts[i+1])}
function wallH(z,x0,x1,gaps){let a=x0;const seg=(p,q,hd)=>wsplit(p,q,[-4.5,4.5],(u,v)=>hd?bx(v-u,WH-DH,WT,(u+v)/2,DH,z,wallM,false):bx(v-u,WH,WT,(u+v)/2,0,z,wallM));(gaps||[]).slice().sort((p,q)=>p-q).forEach(g=>{seg(a,g-DHW);seg(g-DHW,g+DHW,1);a=g+DHW});seg(a,x1)}
function wallV(x,z0,z1,gaps){let a=z0;const seg=(p,q,hd)=>wsplit(p,q,[0],(u,v)=>hd?bx(WT,WH-DH,v-u,x,DH,(u+v)/2,wallM,false):bx(WT,WH,v-u,x,0,(u+v)/2,wallM));(gaps||[]).slice().sort((p,q)=>p-q).forEach(g=>{seg(a,g-DHW);seg(g-DHW,g+DHW,1);a=g+DHW});seg(a,z1)}
function wallVW(x,z0,z1,zs){let a=z0;const full=(p,q)=>wsplit(p,q,[0],(u,v)=>bx(WT,WH,v-u,x,0,(u+v)/2,wallM));zs.slice().sort((p,q)=>p-q).forEach(zc=>{const p=zc-.95,q=zc+.95;full(a,p);bx(WT,1.0,q-p,x,0,zc,wallM);bx(WT,WH-2.5,q-p,x,2.5,zc,wallM,false);a=q});full(a,z1)}
wallH(-9,-13.5,13.5);wallH(9,-13.5,13.5,[-6.4]);wallVW(-13.5,-9,9,[5]);wallVW(13.5,-9,9,[-4.5,5.2]);
wallH(0,-13.5,13.5,[-9,0,9]);wallV(-4.5,-9,9,[-4.5,4.5]);wallV(4.5,-9,9,[-4.5,4.5]);
const ceil=new T.Mesh(new T.PlaneGeometry(27.2,18.2),M(0xf1eee8,0,.95));ceil.rotation.x=Math.PI/2;ceil.position.y=WH;ceil.receiveShadow=true;scene.add(ceil);
// rooms: floors, lights
const RD=[['Study',-9,-4.5,floorW],['Lab',0,-4.5,M(0x9aa2ae,.35,.4,{map:concT,bumpMap:concT,bumpScale:1})],['Gallery',9,-4.5,M(0xc8ccd2,.3,.35,{map:concT,bumpMap:concT,bumpScale:.6})],['Living room',-9,4.5,floorW],['Library',0,4.5,floorW],['Contact',9,4.5,M(0x80858f,.35,.4,{map:concT,bumpMap:concT,bumpScale:1})]];
RD.forEach(([n,cx,cz,fm],i)=>{rooms.push({n,cx,cz});const f=new T.Mesh(new T.PlaneGeometry(9,9),fm.isMaterial?fm:M(0xffffff,.1,.45,{map:fm,bumpMap:fm,bumpScale:.4}));f.rotation.x=-Math.PI/2;f.receiveShadow=true;scene.add(f);f.position.set(cx,0,cz);
 const pl=bx(2.6,.04,.7,cx,WH-.04,cz,glowM,false);pl.castShadow=false;const lt=new T.PointLight(0xffe0bd,1.15,12);lt.position.set(cx,2.9,cz);scene.add(lt)});
scene.add(new T.HemisphereLight(0xe6e0d4,0x3a2c20,.3));
const fl=new T.SpotLight(0xfff0d8,.9,24,.5,.6,1.3);fl.castShadow=!coarse;fl.shadow.mapSize.set(1024,1024);fl.shadow.bias=-.0005;fl.shadow.normalBias=.02;scene.add(fl,fl.target);
// helpers: bodies and info objects
function body(mesh,half,info,x,y,z){mesh.position.set(x,y,z);mesh.traverse(o=>{if(o.isMesh){o.castShadow=o.receiveShadow=true}});scene.add(mesh);const b={m:mesh,v:new V3(),h:half,s:1,info,held:false,ground:false,home:new V3(x,y,z),name:info.t};mesh.userData.ref=b;bodies.push(b);pick.push(mesh);ray.push(mesh);return b}
function inf(mesh,info){mesh.userData.ref={info,name:info.t};pick.push(mesh);ray.push(mesh);return mesh}
function cube(text,bg,size,info,x,y,z){const m=new T.Mesh(new T.BoxGeometry(size,size,size),M(0xffffff,.1,.4,{map:lab(text,bg),envMapIntensity:.6}));return body(m,[size/2,size/2,size/2],info,x,y,z)}
function table(x,z,w,d,top,m){bx(w,.06,d,x,top-.06,z,m||woodM);[[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([a,b])=>cy(.04,.04,top-.06,x+a*(w/2-.1),0,z+b*(d/2-.1),dark,8))}
function plant(x,z){cy(.22,.17,.4,x,0,z,M(0xb5683a,0,.8));for(let i=0;i<10;i++){const c=new T.Mesh(new T.PlaneGeometry(.75,.75),leafCardM);c.position.set(x+(rnd()-.5)*.25,.75+rnd()*.5,z+(rnd()-.5)*.25);c.rotation.set((rnd()-.5)*.7,rnd()*6.28,(rnd()-.5)*.7);scene.add(c)}S.push({x0:x-.22,x1:x+.22,y0:0,y1:.5,z0:z-.22,z1:z+.22,cx:x,cy:.25,cz:z,hx:.22,hy:.25,hz:.22})}
function rr(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath()}
function board(o){return tex(1280,800,(c,w,h)=>{const g=c.createLinearGradient(0,0,w,h);g.addColorStop(0,o.c1);g.addColorStop(1,o.c2);c.fillStyle=g;c.fillRect(0,0,w,h);c.fillStyle='rgba(6,10,18,.6)';c.fillRect(0,0,w,h);
 c.fillStyle='rgba(255,255,255,.08)';c.fillRect(0,0,w,64);['#ff5f57','#febc2e','#28c840'].forEach((k,i)=>{c.fillStyle=k;c.beginPath();c.arc(40+i*34,32,9,0,6.3);c.fill()});
 c.textBaseline='alphabetic';c.textAlign='right';c.fillStyle='rgba(255,255,255,.65)';c.font='600 26px system-ui,sans-serif';c.fillText(o.tag,w-36,42);c.textAlign='left';
 c.fillStyle='#fff';let fs=100;c.font='800 '+fs+'px system-ui,sans-serif';while(c.measureText(o.t).width>w-110&&fs>40){fs-=4;c.font='800 '+fs+'px system-ui,sans-serif'}c.fillText(o.t,55,190);
 c.fillStyle='#bcd0ff';c.font='500 38px system-ui,sans-serif';c.fillText(o.sub,55,250);c.fillStyle=o.ac;c.fillRect(55,284,140,6);
 c.font='500 40px system-ui,sans-serif';o.pts.forEach((p,i)=>{const y=368+i*62;c.fillStyle=o.ac;c.beginPath();c.arc(68,y-13,9,0,6.3);c.fill();c.fillStyle='#e9eefc';c.fillText(p,98,y)});
 let px=55,py=620;c.font='700 28px system-ui,sans-serif';o.chips.forEach(n=>{const cw=c.measureText(n).width+40;if(px+cw>w-55){px=55;py+=58}c.fillStyle='rgba(255,255,255,.1)';rr(c,px,py,cw,46,23);c.fill();c.strokeStyle=o.ac;c.lineWidth=2;c.stroke();c.fillStyle='#fff';c.fillText(n,px+20,py+32);px+=cw+12});
 c.fillStyle='rgba(255,255,255,.5)';c.font='500 24px system-ui,sans-serif';c.fillText('Look at this board and press E to read more',55,h-24)})}
function skillBoard(cat,items,col,x,z,ry){const W=1024,H=341;const t=tex(W,H,c=>{c.fillStyle='#14201a';c.fillRect(0,0,W,H);c.fillStyle=col;c.fillRect(0,0,W,86);c.textBaseline='middle';c.fillStyle='#fff';c.font='800 52px system-ui,sans-serif';c.textAlign='left';c.fillText(cat,32,46);c.textAlign='right';c.font='500 26px system-ui,sans-serif';c.fillStyle='rgba(255,255,255,.85)';c.fillText(items.length+' skills',W-32,46);c.textAlign='left';
 let px=32,py=118;c.font='700 34px system-ui,sans-serif';items.forEach(it=>{const n=it[0],w=c.measureText(n).width+44;if(px+w>W-32){px=32;py+=80}c.fillStyle='rgba(255,255,255,.1)';rr(c,px,py,w,60,30);c.fill();c.strokeStyle=col;c.lineWidth=3;c.stroke();c.fillStyle='#fff';c.fillText(n,px+22,py+31);px+=w+16});
 c.fillStyle='rgba(255,255,255,.55)';c.font='500 22px system-ui,sans-serif';c.fillText('Pick up the cubes on the table  \u00b7  press E to read',32,H-24)});
 const m=new T.Mesh(new T.PlaneGeometry(2.4,.8),new T.MeshBasicMaterial({map:t,toneMapped:false}));m.position.set(x,1.85,z);m.rotation.y=ry;scene.add(m);inf(m,{t:cat,tag:'Skills',h:'<p>'+items.map(i=>i[0]).join(' \u00b7 ')+'</p>'})}
const BK=[
['Clean Code','Clean Code','Robert C. Martin','Software craftsmanship','Practical rules for naming, functions and tests that keep code readable.','#f1ede3','#1c1c1c','#c0392b'],
['Clean Architecture','Clean Architecture','Robert C. Martin','Software architecture','How to draw boundaries and dependencies so systems stay easy to change.','#16324f','#f5f1e6','#e0a030'],
['Pragmatic Programmer','The Pragmatic Programmer','Andrew Hunt & David Thomas','Developer craft','Timeless habits for becoming a more effective, adaptable developer.','#7a1f1f','#f6e9d0','#e8c36a'],
['Design Patterns','Design Patterns','Erich Gamma, Richard Helm, Ralph Johnson & John Vlissides','Object-oriented design','The classic catalogue of 23 reusable object-oriented design patterns.','#1d3b2f','#f1e8c8','#d9a441'],
['Head First Patterns','Head First Design Patterns','Eric Freeman & Elisabeth Robson','Object-oriented design','A visual, beginner-friendly tour of common design patterns.','#f2c230','#1a1a1a','#d1402b'],
['Refactoring','Refactoring','Martin Fowler','Code quality','Techniques for improving existing code without changing what it does.','#e9e6dc','#1b2a41','#b0392f'],
['Code Complete','Code Complete','Steve McConnell','Software construction','A broad handbook of practical software construction techniques.','#23395b','#ffffff','#f2a900'],
['Intro to Algorithms','Introduction to Algorithms','Thomas Cormen, Charles Leiserson, Ronald Rivest & Clifford Stein','Algorithms','The standard university text on algorithms and data structures.','#2a2a2e','#f2f2f2','#c0392b'],
['Grokking Algorithms','Grokking Algorithms','Aditya Bhargava','Algorithms','An illustrated, approachable introduction to core algorithms.','#f4a259','#2b2118','#5b8e7d'],
['Cracking the Coding Interview','Cracking the Coding Interview','Gayle Laakmann McDowell','Interview preparation','Programming interview questions with worked solutions and strategy.','#c9302c','#ffffff','#222222'],
['C# in Depth','C# in Depth','Jon Skeet','C# language','A deep look at the C# language and how its features evolved.','#5b2a86','#ffffff','#e6d7f5'],
['Pro C#','Pro C# and the .NET Platform','Andrew Troelsen','C# and .NET','A comprehensive guide to C# and the .NET platform.','#223b5c','#f3f3f3','#6cb6ff'],
['ASP.NET Core in Action','ASP.NET Core in Action','Andrew Lock','ASP.NET Core','Building web apps and APIs with ASP.NET Core.','#3b2a6b','#ffffff','#9ad1ff'],
['Eloquent JavaScript','Eloquent JavaScript','Marijn Haverbeke','JavaScript','A modern introduction to JavaScript and programming itself.','#f0db4f','#1a1a1a','#323330'],
["You Don't Know JS","You Don't Know JS",'Kyle Simpson','JavaScript','A deep dive into how JavaScript really works.','#1a1a1a','#f0db4f','#f0db4f'],
['JS: The Good Parts','JavaScript: The Good Parts','Douglas Crockford','JavaScript','A concise look at the best features of JavaScript.','#fff4cf','#222222','#e0a800'],
['Learning React','Learning React','Alex Banks & Eve Porcello','React','Building modern user interfaces with React.','#0e2a3a','#61dafb','#61dafb'],
['Node.js Patterns','Node.js Design Patterns','Mario Casciaro & Luciano Mammino','Node.js','Patterns for scalable, maintainable Node.js applications.','#1e3a2b','#e8f5e0','#6cc24a'],
['Flutter in Action','Flutter in Action','Eric Windmill','Flutter and Dart','Building cross-platform mobile apps with Flutter and Dart.','#0b3a5c','#e6f4ff','#54c5f8'],
['Data-Intensive Apps','Designing Data-Intensive Applications','Martin Kleppmann','Data systems','How modern data systems store, replicate and process information.','#f3efe6','#1d1d1d','#2f7f6f'],
['Database Concepts','Database System Concepts','Abraham Silberschatz, Henry Korth & S. Sudarshan','Databases','A university text covering relational databases, SQL and transactions.','#2e4b6e','#ffffff','#f0c36d'],
['Learning SQL','Learning SQL','Alan Beaulieu','SQL','Mastering SQL queries and data manipulation step by step.','#e2e8ee','#1b3a57','#2a7ab5'],
['SQL Antipatterns','SQL Antipatterns','Bill Karwin','SQL','Common database design and query mistakes, and how to avoid them.','#3a1c4c','#f4e8ff','#ff7bd5'],
['Pro Git','Pro Git','Scott Chacon & Ben Straub','Version control','The official guide to version control with Git.','#f2f0ea','#d14b2a','#2b2b2b'],
['OS Concepts','Operating System Concepts','Abraham Silberschatz, Peter Galvin & Greg Gagne','Operating systems','The classic dinosaur book on processes, memory and file systems.','#1f4d3a','#ffffff','#e8d06a'],
['Computer Networking','Computer Networking: A Top-Down Approach','James Kurose & Keith Ross','Networking','A top-down tour from applications down to the link layer.','#0d3b66','#faf0ca','#f4d35e'],
['Effective Java','Effective Java','Joshua Bloch','Java','Best practices for writing robust, maintainable Java.','#7b2d26','#ffffff','#f0c36d'],
['Head First Java','Head First Java','Kathy Sierra & Bert Bates','Java','A visual, hands-on introduction to Java.','#f7d046','#222222','#e63946'],
['Spring in Action','Spring in Action','Craig Walls','Spring Framework','Building Java applications with the Spring framework.','#2f6b3a','#ffffff','#b8e08a'],
['Mythical Man-Month','The Mythical Man-Month','Frederick P. Brooks Jr.','Project management','Classic essays on managing software projects.','#e7dcc3','#3b2a1a','#8c2f2f'],
['Domain-Driven Design','Domain-Driven Design','Eric Evans','Software design','Modelling complex software around the business domain.','#1b2b4a','#f2e9d0','#c9a24a'],
['Enterprise Patterns','Patterns of Enterprise Application Architecture','Martin Fowler','Enterprise architecture','Patterns for building layered enterprise applications.','#3d3d3d','#f5f5f5','#e4572e'],
['RESTful Web APIs','RESTful Web APIs','Leonard Richardson & Mike Amundsen','REST APIs','Designing hypermedia-driven REST APIs.','#d9e4dd','#143d2c','#2b8a63'],
['Docker Deep Dive','Docker Deep Dive','Nigel Poulton','Containers','Containers and Docker explained from the ground up.','#0a4d8c','#ffffff','#8fd3ff'],
['AI: Modern Approach','Artificial Intelligence: A Modern Approach','Stuart Russell & Peter Norvig','Artificial intelligence','The standard textbook on artificial intelligence.','#f2f2f2','#171717','#b3262e'],
['Python Crash Course','Python Crash Course','Eric Matthes','Python','A hands-on, project-based introduction to Python.','#fcd34d','#1f2937','#2563eb'],
['Linux Command Line','The Linux Command Line','William Shotts','Linux','A complete introduction to working in the shell.','#111827','#e5e7eb','#34d399'],
['Software Engineering','Software Engineering','Ian Sommerville','Software engineering','A textbook covering the full software development process.','#2a4365','#ffffff','#ecc94b'],
['Algorithms','Algorithms','Robert Sedgewick & Kevin Wayne','Algorithms','Core algorithms and data structures with Java implementations.','#c53030','#ffffff','#fbd38d'],
['SICP','Structure and Interpretation of Computer Programs','Harold Abelson & Gerald Sussman','Computer science','A classic on abstraction, computation and programming.','#2d3748','#e2e8f0','#f6ad55'],
['Compilers','Compilers: Principles, Techniques, and Tools','Alfred Aho, Monica Lam, Ravi Sethi & Jeffrey Ullman','Compilers','The dragon book on how compilers are built.','#1a237e','#ffffff','#ffd54f'],
['Art of Unit Testing','The Art of Unit Testing','Roy Osherove','Testing','Practical techniques for writing maintainable unit tests.','#e8f1f2','#13293d','#1b98e0'],
['Hands-On ML','Hands-On Machine Learning with Scikit-Learn, Keras & TensorFlow','Aur\u00e9lien G\u00e9ron','Machine learning','Practical machine learning with Python libraries.','#ffffff','#222222','#e9743d'],
['Building Microservices','Building Microservices','Sam Newman','Microservices','Designing fine-grained systems that evolve independently.','#133b5c','#f3f7fa','#f4a259'],
['Code','Code: The Hidden Language of Computer Hardware and Software','Charles Petzold','Computer fundamentals','How computers work, from simple codes up to software.','#101820','#f2aa4c','#f2aa4c'],
['Release It!','Release It!','Michael Nygard','Production systems','Designing and deploying production-ready software.','#e0e0e0','#8a1c1c','#8a1c1c'],
['Legacy Code','Working Effectively with Legacy Code','Michael Feathers','Legacy code','Strategies for safely changing code that has no tests.','#4a4e69','#f2e9e4','#c9ada7'],
['Programming Pearls','Programming Pearls','Jon Bentley','Problem solving','Classic essays on clever, practical programming.','#264653','#f4f1de','#e9c46a']
].map(a=>({s:a[0],t:a[1],a:a[2],topic:a[3],blurb:a[4],bg:a[5],fg:a[6],ac:a[7]}));
const HS=[.24,.27,.3,.33,.36,.4,.44,.48,.52,.58,.64,.7],TS=[.07,.09,.11,.13,.15,.18];
const BKS=BK.map((b,i)=>{const t=TS[(i*5+2)%6],h=HS[(i*7+3)%12],d=.22+(i%5)*.02,H=512,sw=Math.max(60,Math.round(H*t/h)),W=sw+40,mo=i%3;
 const last=b.a.split(/,| &/)[0].trim().replace(/ Jr\.$/,'').split(' ').pop().toUpperCase();
 const tx=tex(W,H,x=>{x.fillStyle=b.bg;x.fillRect(0,0,W,H);
  x.fillStyle=new T.Color(b.bg).multiplyScalar(.7).getStyle();x.fillRect(sw,0,20,H);x.fillStyle='#efe5cb';x.fillRect(sw+20,0,W-sw-20,H);x.fillStyle=b.ac;
  if(mo===0){x.fillRect(0,0,sw,36);x.fillRect(0,H-36,sw,36);x.globalAlpha=.5;x.fillStyle=b.fg;x.fillRect(sw*.1,52,sw*.8,3);x.fillRect(sw*.1,H-55,sw*.8,3);x.globalAlpha=1}
  else if(mo===1){x.fillRect(0,0,sw,92);x.fillStyle=b.bg;x.beginPath();x.arc(sw/2,46,Math.min(sw*.22,20),0,6.3);x.fill();x.fillStyle=b.ac;x.fillRect(0,H-36,sw,36)}
  else{x.fillRect(sw*.08,0,3,H);x.fillRect(sw*.92-3,0,3,H);x.fillRect(0,H-36,sw,36);x.fillRect(0,0,sw,16)}
  x.save();x.translate(sw/2,mo===1?250:222);x.rotate(Math.PI/2);x.fillStyle=b.fg;x.textAlign='center';x.textBaseline='middle';
  let fs=Math.min(sw*.46,70);const mx=mo===1?250:270;x.font='800 '+fs+'px system-ui,sans-serif';while(x.measureText(b.s).width>mx&&fs>12){fs-=2;x.font='800 '+fs+'px system-ui,sans-serif'}x.fillText(b.s,0,0);x.restore();
  x.save();x.translate(sw/2,H-92);x.rotate(Math.PI/2);x.fillStyle=b.fg;x.globalAlpha=.85;x.textAlign='center';x.textBaseline='middle';fs=Math.min(sw*.24,30);x.font='700 '+fs+'px system-ui,sans-serif';while(x.measureText(last).width>96&&fs>9){fs-=1;x.font='700 '+fs+'px system-ui,sans-serif'}x.fillText(last,0,0);x.restore()});
 tx.wrapS=tx.wrapT=T.ClampToEdgeWrapping;
 const geo=new T.BoxGeometry(t,h,d),uv=geo.attributes.uv;
 for(let f=0;f<6;f++){const rg=f===4?[2/W,(sw-2)/W]:f<2?[(sw+6)/W,(sw+14)/W]:[(sw+24)/W,(sw+34)/W];for(let k=f*4;k<f*4+4;k++)uv.setX(k,uv.getX(k)>.5?rg[1]:rg[0])}
 return{b,t,h,d,geo,mat:M(0xffffff,0,.65,{map:tx,envMapIntensity:.45})}});
function fillBooks(g,len){
 [[.045,.74],[.875,.51],[1.475,.51],[2.075,.34]].forEach(([y,mh])=>{
  const ok=BKS.filter(s=>s.h<=mh+1e-6);let bag=[];const take=()=>{if(!bag.length)bag=ok.slice().sort(()=>rnd()-.5);return bag.pop()};
  let xx=-len/2+.07;
  for(let n=0;n<90;n++){const s=take(),gap=rnd()<.07?.05+rnd()*.12:.004;if(xx+gap+s.t>len/2-.07)break;xx+=gap;
   const m=new T.Mesh(s.geo,s.mat);m.position.set(xx+s.t/2,y+s.h/2,-.15+s.d/2+rnd()*.03);m.castShadow=m.receiveShadow=true;g.add(m);
   const info={t:s.b.t,tag:'IT book \u00b7 '+s.b.topic,h:'<p><b>'+s.b.a+'</b></p><p>'+s.b.blurb+'</p><p style="opacity:.7">Click it to take it off the shelf, turn it around and read the title.</p>'};
   m.userData.ref={book:true,mesh:m,info,name:s.b.t,w:s.t,h:s.h,d:s.d};ray.push(m);pick.push(m);xx+=s.t+.004}})}
function shelf(x,z,len,axis,fs){const g=new T.Group();g.position.set(x,0,z);g.rotation.y=axis==='x'?(fs>0?0:Math.PI):(fs>0?Math.PI/2:-Math.PI/2);scene.add(g);
 const back=new T.Mesh(new T.BoxGeometry(len,2.5,.08),woodM);back.position.set(0,1.25,-.2);g.add(back);[.02,.85,1.45,2.05,2.48].forEach(y=>{const b=new T.Mesh(new T.BoxGeometry(len,.05,.42),woodM);b.position.set(0,y,0);g.add(b)});
 [-len/2,len/2].forEach(sx=>{const b=new T.Mesh(new T.BoxGeometry(.05,2.5,.42),woodM);b.position.set(sx,1.25,0);g.add(b)});
 fillBooks(g,len);
 g.traverse(o=>{if(o.isMesh)o.castShadow=o.receiveShadow=true});
 const a=axis==='x'?[len/2,.25]:[.25,len/2];S.push({x0:x-a[0],x1:x+a[0],y0:0,y1:2.5,z0:z-a[1],z1:z+a[1],cx:x,cy:1.25,cz:z,hx:a[0],hy:1.25,hz:a[1]})}
// ================= CONTENT =================
const SD={'C#':'My main backend language at IMAP Systems, used with ASP.NET.',JavaScript:'Client and server logic across React and Node.js projects.',Dart:'The language behind my Flutter mobile apps.',React:'Component-based frontends: TFOD and MedScan AI.',Flutter:'Cross-platform mobile apps: MedScan AI and Square Chat.','ASP.NET':'Backend APIs and web apps at IMAP Systems and in MedScan AI.','Node.js':'REST APIs for TFOD, MedScan AI and Square Chat.',MySQL:'Relational database for MedScan AI and my Spring Boot internship work.','SQL Server':'Enterprise database at IMAP Systems and behind TFOD.',Firebase:'Firestore, authentication and push notifications in Square Chat.',Git:'Version control for every project I ship.',Postman:'Designing and testing REST APIs.',OOP:'Object-oriented design is the base of how I structure code.',MVC:'Clean separation of models, views and controllers.','REST API':'Secure, well-structured APIs for web and mobile clients.',Security:'Authentication and secure data handling in production systems.'};
const sk=(n,c)=>({t:n,tag:c,h:'<p>'+(SD[n]||n+' is part of my '+c.toLowerCase()+' toolkit.')+'</p>'});
const GH='https://github.com/patilaniket2562m';
// LIVING ROOM (start)
(function(){
 cy(2.3,2.3,.02,-9,0,3.8,M(0x2a3550,0,1),48);
 bx(3.2,.45,1.0,-9,.1,1.95,fabric);bx(3.2,.85,.28,-9,.45,1.4,fabric2);[-10.75,-7.25].forEach(x=>bx(.3,.65,1.0,x,.08,1.95,fabric2));
 [-9.7,-8.3].forEach(x=>{const c=new T.Mesh(new T.BoxGeometry(1.2,.16,.85),fabric);c.position.set(x,.63,1.95);scene.add(c)});
 table(-9,3.8,1.8,.9,.46);
 bx(2.8,.5,.5,-9,0,8.65,woodM);bx(2.4,1.3,.07,-9,1.0,8.8,dark);
 const tv=new T.Mesh(new T.PlaneGeometry(2.3,1.2),new T.MeshBasicMaterial({map:poster('Aniket Patil','Full Stack Developer','#b08d4a','#0f1a14'),toneMapped:false}));tv.position.set(-9,1.65,8.76);tv.rotation.y=Math.PI;scene.add(tv);
 inf(tv,{t:'Aniket Patil',tag:'Welcome home',h:'<p>I\u2019m a Full Stack Developer at IMAP Systems Pvt. Ltd., Mumbai, building scalable web and Flutter-based applications with ASP.NET, React and SQL Server.</p><p>Every room of this house is part of my portfolio: the Study, Lab, Gallery, Library and Contact room.</p>'});
 'ANIKET'.split('').forEach((ch,i)=>cube(ch,['#b08d4a','#46566a','#6b4f3a','#b08d4a','#46566a','#6b4f3a'][i],.26,{t:'Aniket Patil',tag:'Full Stack Developer',h:'<p>ASP.NET \u00b7 React \u00b7 Flutter \u00b7 SQL Server</p><p>Currently at IMAP Systems, Mumbai. Based in Kolhapur, Maharashtra, India.</p>'},-9.85+i*.34,.5+.13,8.65));
 const rm=new T.Mesh(new T.BoxGeometry(.38,.03,.52),[white,white,M(0xffffff,0,.6,{map:tex(256,360,(x,w,h)=>{x.fillStyle='#fff';x.fillRect(0,0,w,h);x.fillStyle='#1a1030';x.font='800 40px system-ui';x.fillText('RESUME',24,60);x.fillStyle='#b08d4a';x.fillRect(24,80,w-48,8);for(let i=0;i<10;i++){x.fillStyle='#c9cdd6';x.fillRect(24,120+i*20,w-48-(i%3)*40,8)}})}),white,white,white]);
 body(rm,[.19,.015,.26],{t:'Resume',tag:'Download',h:'<p>My resume as a PDF.</p>',l:'Aniket%20Patil%20-%20Resume.pdf',lt:'Download resume',dl:1},-8.5,.46+.016,3.8);
 cy(.03,.03,1.5,-12.6,0,1.4,steel,10);cy(.28,.4,.4,-12.6,1.5,1.4,M(0xfff0d0,0,.8,{emissive:0xffd9a0,emissiveIntensity:1.2}));plant(-12.8,8.1);plant(-4.9,8.1)
})();
// STUDY (About)
(function(){
 cy(2.6,2.6,.02,-9,0,-6.2,M(0x3a2a22,0,1),48);
 table(-9,-7.9,2.6,1.1,.8);bx(.6,.74,1,-10.05,0,-7.9,woodM);
 const mon=new T.Group();scene.add(mon);const bz=new T.Mesh(new T.BoxGeometry(1.3,.75,.05),dark);bz.position.set(-9,1.2,-8.3);scene.add(bz);
 const scr=new T.Mesh(new T.PlaneGeometry(1.2,.65),new T.MeshBasicMaterial({map:screenTex('About me',['Full Stack Developer','ASP.NET \u00b7 React \u00b7 Flutter','IMAP Systems, Mumbai','Press E to read more']),toneMapped:false}));scr.position.set(-9,1.2,-8.27);scene.add(scr);
 cy(.05,.05,.35,-9,.8,-8.3,dark,8);
 inf(scr,{t:'About me',tag:'The Study',h:'<p>Full Stack Developer at IMAP Systems Pvt. Ltd., Mumbai, building scalable web and Flutter-based applications. Skilled in REST APIs, authentication and developing secure, production-ready systems.</p><p>I hold an MCA from KIT\u2019s IMER, Kolhapur (2025) and work across ASP.NET, React, Flutter and MySQL / SQL Server.</p>'});
 bx(.5,.08,.5,-9,.45,-6.8,fabric);bx(.9,.8,.1,-9,.5,-6.4,fabric);cy(.05,.05,.45,-9,0,-6.8,steel,8);
 shelf(-13.25,-4.5,4,'z',1);plant(-5.2,-8.1)
})();
// LAB (Skills)
(function(){
 const st=[['LANGUAGES',-2.4,-8.2,0,'#a9593d',[['C#'],['JavaScript'],['Dart']]],
   ['STACK',2.4,-8.2,0,'#46566a',[['React'],['Flutter'],['ASP.NET'],['Node.js']]],
   ['DATA',-2.6,-1.3,Math.PI,'#3f6b57',[['MySQL'],['SQL Server'],['Firebase']]],
   ['TOOLS',2.6,-1.3,Math.PI,'#b08d4a',[['Git'],['Postman'],['OOP'],['MVC'],['REST API'],['Security']]]];
 st.forEach(([cat,x,z,ry,col,items])=>{table(x,z,3.0,1.0,.85,M(0x3d3f3d,.5,.4));const dz=ry?.3:-.3;
  skillBoard(cat,items,col,x,ry?-.14:-8.87,ry);
  items.forEach(([n],i)=>{const row=i<4?0:1,idx=row?i-4:i,cnt=row?items.length-4:Math.min(4,items.length),xx=x+(idx-(cnt-1)/2)*.55,zz=z+(row?(ry?-.2:.2):(ry?.2:-.2));cube(n,col,.36,sk(n,cat[0]+cat.slice(1).toLowerCase()),xx,.85+.18+.01,zz)})});
 sign('SKILLS LAB',0,2.55,-8.85,0,3.6,.6,'#16201a');
 [[-4.0,-6.4],[4.0,-6.4]].forEach(([x,z])=>plant(x,z))
})();
// GALLERY (Projects)
(function(){
 const ped=M(0x3a3f48,.15,.55);
 const EP=[{x:7.6,t:'Online Auction',d:'A dual-user platform enabling vendors to list products and customers to take part in real-time competitive bidding. Features live updates, bid tracking and secure user authentication.',tech:['JSP','Servlet','Java','MySQL']},
  {x:10.4,t:'Online Attendance System',d:'A web-based attendance management system with role-based access control for teachers and students, automated reports, dashboard analytics and secure login flows.',tech:['ASP.NET','SQL Server','JavaScript','MySQL']}];
 EP.forEach((p,i)=>{const info={t:p.t,tag:'Earlier project',h:'<p>'+p.d+'</p><div class="chips">'+p.tech.map(t=>'<span>'+t+'</span>').join('')+'</div>',l:GH,lt:'View code on GitHub'};
  bx(.9,1.0,.9,p.x,0,-5.5,ped);
  const pt=new T.Mesh(new T.PlaneGeometry(.8,.25),new T.MeshBasicMaterial({map:tex(512,160,(c,w,h)=>{c.fillStyle='#16201a';c.fillRect(0,0,w,h);c.strokeStyle='#b08d4a';c.lineWidth=4;c.strokeRect(8,8,w-16,h-16);c.textAlign='center';c.textBaseline='middle';c.fillStyle='#fff';let fs=46;c.font='800 '+fs+'px system-ui,sans-serif';while(c.measureText(p.t).width>w-50&&fs>20){fs-=2;c.font='800 '+fs+'px system-ui,sans-serif'}c.fillText(p.t,w/2,64);c.fillStyle='#d8cfb8';c.font='500 24px system-ui,sans-serif';c.fillText('Earlier project \u00b7 E to read',w/2,118)}),toneMapped:false}));
  pt.position.set(p.x,.62,-5.5+.456);scene.add(pt);inf(pt,info);
  });
 const D=[
  {t:'TFOD',sub:'The Future Of Design \u00b7 Website',tag:'PROJECT 01  \u00b7  04/2026 \u2013 10/2026',c1:'#2f4a3c',c2:'#0f1a14',ac:'#7dffc8',pts:['Responsive React UI components','REST APIs with Node.js and Express','SQL Server database integration','Admin dashboards and site features'],chips:['React.js','Vite','Node.js','Express.js','SQL Server'],d:'Website for TFOD built with React.js, Vite, Node.js, Express.js and SQL Server. Responsive UI components, REST APIs, database integration, admin dashboards and website features.'},
  {t:'MedScan AI',sub:'Medical Report Management',tag:'PROJECT 02  \u00b7  01/2026 \u2013 04/2026',c1:'#3d4f6a',c2:'#101722',ac:'#6cb6ff',pts:['Secure medical report uploads','Multi-user access','Abnormal report detection','Scalable architecture, secure data'],chips:['ASP.NET','Node.js','React','Flutter','MySQL','SQL Server'],d:'A full-stack medical report management system with secure report uploads, multi-user access and abnormal report detection. Built with ASP.NET, Node.js, React and Flutter on MySQL / SQL Server, focused on scalable architecture and secure data handling.'},
  {t:'Square Chat',sub:'Real-Time Messaging',tag:'PROJECT 03  \u00b7  01/2026 \u2013 02/2026',c1:'#8a5a3c',c2:'#1d130d',ac:'#ffb86b',pts:['Real-time chat with Firestore','WebRTC audio and video calls','Authentication','Push notifications, cloud architecture'],chips:['Flutter','Node.js','Firebase','WebRTC','Firestore'],d:'A real-time messaging and calling app. Chat with Firestore, audio/video calling using WebRTC, authentication, push notifications and a scalable cloud-based architecture.'}];
 D.forEach((p,i)=>{const x=6.1+i*2.9;
  bx(2.8,1.9,.1,x,.72,-8.85,dark);
  const pm=new T.Mesh(new T.PlaneGeometry(2.6,1.625),new T.MeshBasicMaterial({map:board(p),toneMapped:false}));pm.position.set(x,1.67,-8.78);scene.add(pm);
  inf(pm,{t:p.t+' \u2013 '+p.sub.split(' \u00b7 ')[0],tag:p.tag.replace(/\s+/g,' '),h:'<p>'+p.d+'</p><div class="chips">'+p.chips.map(q=>'<span>'+q+'</span>').join('')+'</div>',l:GH,lt:'View code on GitHub'})});
 sign('PROJECTS',9,2.88,-8.85,0,3.2,.3,'#16201a');
 bx(2.2,.45,.55,12.4,0,-1.7,woodM);bx(2.2,.45,.55,9,0,-7.9,woodM);plant(13,-8.3)
})();
// LIBRARY (Education)
(function(){
 shelf(0,8.75,7.6,'x',-1);cy(2.2,2.2,.02,0,0,5,M(0x4a2b2b,0,1),48);table(0,5,2.6,1.1,.8);
 [['MCA','KIT’s IMER, Kolhapur','2023 – 2025','66.09%','#2f4a3c'],['BCA','New College, Kolhapur','2021 – 2023','78.82%','#4a1f2f'],['HSC','LTDP College Kalkundri','2018 – 2020','59.23%','#1f4a35']].forEach(([d,c,y,p,col],i)=>{
  const m=new T.Mesh(new T.BoxGeometry(.5,.09,.38),[M(0xf2ead6,0,.8),M(0xf2ead6,0,.8),M(0xffffff,.1,.5,{map:lab(d,col)}),M(0xf2ead6,0,.8),M(col,0,.6),M(col,0,.6)]);
  body(m,[.25,.045,.19],{t:d,tag:'Education',h:'<p><b>'+c+'</b><br>'+y+'</p><div class="chips"><span>'+p+'</span></div>'},-.8+i*.8,.8+.046,5+(i%2?.05:-.05))});
 bx(1.1,.7,1.0,-3.0,.05,2.1,fabric);bx(1.1,.8,.2,-3.0,.4,1.6,fabric2);
 [['IMAP SYSTEMS','Full Stack Developer','01/2026 \u2013 Present',1.7,'IMAP Systems Pvt. Ltd., Mumbai','<p>Full Stack Developer building and maintaining web and mobile applications for enterprise solutions: backend APIs, database management, frontend development and production-level issue resolution.</p><div class="chips"><span>ASP.NET</span><span>C#</span><span>SQL Server</span><span>React.js</span><span>Flutter</span></div>'],['TECHNOWORLD','Full Stack Developer Intern','07/2025 \u2013 01/2026',7.4,'Technoworld Software','<p>Expanded RESTful APIs with Spring Boot, MySQL and Spring Data JPA. Built and tested full CRUD operations with form validation and structured exception handling, and connected a responsive HTML/CSS/JavaScript frontend through API integration.</p><div class="chips"><span>Spring Boot</span><span>MySQL</span><span>Spring Data JPA</span><span>REST APIs</span></div>']].forEach(([co,role,dt,z,full,html])=>{{const fr=new T.Mesh(new T.BoxGeometry(.04,1.16,2.06),new T.MeshBasicMaterial({color:0x0c1410}));fr.position.set(4.372,1.0,z);scene.add(fr)}const p=new T.Mesh(new T.PlaneGeometry(2.0,1.1),new T.MeshBasicMaterial({map:tex(1024,560,(x,_w,_h)=>{x.scale(2,2);const w=512,h=280;x.fillStyle='#16231c';x.fillRect(0,0,w,h);x.strokeStyle='#b08d4a';x.lineWidth=3;x.strokeRect(14,14,w-28,h-28);x.fillStyle='#f1ece0';x.font='800 40px system-ui';x.textAlign='center';x.fillText(co,w/2,100);x.fillStyle='#d8cfb8';x.font='24px system-ui';x.fillText(role,w/2,150);x.fillStyle='#b08d4a';x.font='700 22px system-ui';x.fillText(dt,w/2,196)}),toneMapped:false}));p.material.polygonOffset=true;p.material.polygonOffsetFactor=-2;p.position.set(4.345,1.0,z);p.rotation.y=-Math.PI/2;scene.add(p);inf(p,{t:full,tag:role+' \u00b7 '+dt,h:html})});
 cy(.03,.03,1.5,-4.0,0,7.9,steel,10);cy(.26,.36,.36,-4.0,1.5,7.9,M(0xfff0d0,0,.8,{emissive:0xffd9a0,emissiveIntensity:1.2}))
})();
// CONTACT
(function(){
 bx(3.4,1.0,.9,9,0,5.6,M(0x20262f,.4,.5));cy(2.4,2.4,.02,9,0,3.4,M(0x1a2a44,0,1),48);
 const lg=new T.Group(),lb=new T.Mesh(new T.BoxGeometry(.6,.03,.4),steel),ls=new T.Group();ls.position.set(0,.015,-.2);ls.rotation.x=-.35;const sh=new T.Mesh(new T.BoxGeometry(.6,.4,.02),dark);sh.position.y=.2;const sc2=new T.Mesh(new T.PlaneGeometry(.55,.35),new T.MeshBasicMaterial({map:screenTex('Let’s talk',['Say hello','patilaniket2562m','@gmail.com']),toneMapped:false}));sc2.position.set(0,.2,.011);ls.add(sh,sc2);lg.add(lb,ls);lg.position.set(8.2,1.0,5.6);lg.rotation.y=Math.PI;scene.add(lg);
 inf(lg,{t:'Send a message',tag:'Contact',form:1,h:'<p>Have a project or opportunity in mind? Write below and your email app will open with the message ready.</p>'});
 const ph=new T.Mesh(new T.BoxGeometry(.09,.012,.19),[dark,dark,M(0x0b1a33,.2,.2,{emissive:0x3a5a48,emissiveIntensity:.5}),dark,dark,dark]);
 body(ph,[.05,.007,.1],{t:'Phone',tag:'Call me',h:'<p>+91 9112261074</p>',l:'tel:+919112261074',lt:'Call now'},9.2,1.0+.007,5.5);
 const ev=new T.Mesh(new T.BoxGeometry(.28,.012,.19),[white,white,M(0xffffff,0,.7,{map:tex(256,180,(x,w,h)=>{x.fillStyle='#f4efe3';x.fillRect(0,0,w,h);x.strokeStyle='#bfb59c';x.lineWidth=3;x.beginPath();x.moveTo(0,0);x.lineTo(w/2,h*.6);x.lineTo(w,0);x.stroke();x.fillStyle='#b08d4a';x.font='800 30px system-ui';x.textAlign='center';x.fillText('EMAIL ME',w/2,h*.88)})}),white,white,white]);
 body(ev,[.14,.007,.1],{t:'Letter',tag:'Email',h:'<p>patilaniket2562m@gmail.com</p>',l:'mailto:patilaniket2562m@gmail.com',lt:'Write an email'},9.8,1.0+.007,5.5);
 cube('GitHub','#24292f',.3,{t:'GitHub',tag:'Code',h:'<p>github.com/patilaniket2562m</p>',l:GH,lt:'Open GitHub'},10.3,1.0+.15,5.65);
 cube('LinkedIn','#0a66c2',.3,{t:'LinkedIn',tag:'Network',h:'<p>Connect with me on LinkedIn.</p>',l:'https://linkedin.com/in/Aniket-patil-5b6a78260',lt:'Open LinkedIn'},10.7,1.0+.15,5.65);
 const dr=bx(1.3,2.3,.08,9,0,8.86,woodM,false);cy(.03,.03,.16,9.45,1.0,8.8,steel,8).rotation.x=Math.PI/2;
 sign('CONTACT',9,2.75,3.6,Math.PI,2.4,.45,'#16201a');
 bx(2.4,.45,.55,12.8,0,1.5,woodM);plant(13,8.3);plant(5.2,0.7)
})();

// ================= ENHANCE: realism + character =================
const ANIM=[],MM=(w,h,d,x,y,z,m)=>{const o=new T.Mesh(new T.BoxGeometry(w,h,d),m);o.position.set(x,y,z);scene.add(o);return o},BX=(w,h,d,m)=>new T.Mesh(new T.BoxGeometry(w,h,d),m);
r.toneMappingExposure=1.05;wallM.color.set(0xeadfce);fl.shadow.mapSize.set(2048,2048);
scene.traverse(o=>{const m=o.material;if(o.isMesh&&m&&m.isMeshStandardMaterial&&m.map&&(m.map===floorW||m.map===concT)){m.roughness=.3;m.envMapIntensity=1}});
// trim: crown molding + skirting
const crown=M(0xf6f2ea,0,.6),skirt=M(0x2a211b,.1,.45);
[-8.9,.12,-.12,8.9].forEach(z=>MM(27,.14,.1,0,WH-.07,z,crown));[-13.4,-4.62,-4.38,4.38,4.62,13.4].forEach(x=>MM(.1,.14,18,x,WH-.07,0,crown));
[-8.9,8.9].forEach(z=>MM(27,.16,.05,0,.08,z,skirt));[-13.4,13.4].forEach(x=>MM(.05,.16,18,x,.08,0,skirt));
// windows with sky, curtains, sun shafts
const skyT=tex(512,512,(x,w,h)=>{const g=x.createLinearGradient(0,0,0,h);g.addColorStop(0,'#4f98e6');g.addColorStop(.6,'#bfe0ff');g.addColorStop(.78,'#ffe9c0');g.addColorStop(1,'#4d6b3a');x.fillStyle=g;x.fillRect(0,0,w,h);x.fillStyle='#fffbe6';x.beginPath();x.arc(390,150,38,0,6.3);x.fill();for(let i=0;i<7;i++){x.fillStyle='rgba(255,255,255,.7)';x.beginPath();x.ellipse(rnd()*w,60+rnd()*160,50+rnd()*50,14+rnd()*10,0,0,6.3);x.fill()}x.fillStyle='#2e4a2a';for(let i=0;i<14;i++){x.beginPath();x.arc(i*40,430+rnd()*20,40+rnd()*20,0,6.3);x.fill()}});
const frM=M(0xf2efe8,0,.5),curt=M(0x8a3b3b,0,1),shaftM=new T.MeshBasicMaterial({color:0xffe2a8,transparent:true,opacity:.07,blending:T.AdditiveBlending,depthWrite:false,side:T.DoubleSide});
function win(x,z,ry){const g=new T.Group();g.position.set(x,1.75,z);g.rotation.y=ry;scene.add(g);const a=(w,h,d,px,py,pz,m)=>{const o=BX(w,h,d,m);o.position.set(px,py,pz);g.add(o);return o};
 const gm=new T.MeshStandardMaterial({color:0xdfeaf0,transparent:true,opacity:.1,roughness:.05,metalness:0,depthWrite:false,side:T.DoubleSide});
 const up=new T.Mesh(new T.PlaneGeometry(1.7,.75),gm);up.position.y=.375;g.add(up);
 const sash=new T.Group();sash.position.z=.02;g.add(sash);
 const sg=new T.Mesh(new T.PlaneGeometry(1.7,.73),gm);sg.position.y=-.385;sash.add(sg);
 const sb=(w,h,px,py,m)=>{const o=BX(w,h,.05,m);o.position.set(px,py,0);sash.add(o)};
 sb(1.76,.06,0,-.03,frM);sb(1.76,.06,0,-.745,frM);sb(.06,.75,-.85,-.39,frM);sb(.06,.75,.85,-.39,frM);
 const lk=BX(.14,.04,.05,steel);lk.position.set(0,-.03,.045);sash.add(lk);
 const wst={open:false,a:0},wref={name:'Window',toggle(){wst.open=!wst.open},label(){return wst.open?'Close window':'Open window'}};
 const hit=new T.Mesh(new T.PlaneGeometry(1.7,1.5),new T.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false,side:T.DoubleSide}));hit.position.z=.06;g.add(hit);hit.userData.ref=wref;sash.userData.ref=wref;ray.push(hit,sash);
 a(1.9,.1,.12,0,.8,.04,frM);a(1.9,.1,.12,0,-.8,.04,frM);a(.1,1.7,.12,-.9,0,.04,frM);a(.1,1.7,.12,.9,0,.04,frM);a(.05,1.5,.06,0,0,.03,frM);a(1.7,.05,.06,0,0,.03,frM);a(2.1,.08,.3,0,-.88,.12,frM);
 const cu=[a(.45,2.9,.1,-1.25,-.3,.1,curt),a(.45,2.9,.1,1.25,-.3,.1,curt)];
 ANIM.push((t,dt)=>{const tg=wst.open?1:0;wst.a+=(tg-wst.a)*(1-Math.exp(-4*dt));sash.position.y=.72*wst.a;const sw=wst.a*Math.sin(t*1.3+x)*.05;cu[0].rotation.x=sw;cu[1].rotation.x=sw*.8});
 if(!coarse){const l=new T.PointLight(0xffe6b8,.9,7);l.position.set(0,-.2,.8);g.add(l)}}
win(13.39,-4.5,-Math.PI/2);win(13.39,5.2,-Math.PI/2);win(-13.39,5.0,Math.PI/2);
// woven rugs
function rug(x,z,w,d,c1,c2){const t=tex(512,Math.round(512*d/w),(c,W,H)=>{c.fillStyle=c1;c.fillRect(0,0,W,H);c.strokeStyle=c2;c.lineWidth=10;c.strokeRect(14,14,W-28,H-28);c.lineWidth=3;c.strokeRect(36,36,W-72,H-72);c.fillStyle=c2;for(let i=0;i<5;i++){c.save();c.translate(W/2+(i-2)*W*.17,H/2);c.rotate(.785);c.fillRect(-18,-18,36,36);c.restore()}for(let i=0;i<4000;i++){c.fillStyle=`rgba(${rnd()>.5?255:0},${rnd()>.5?255:0},0,.04)`;c.fillRect(rnd()*W,rnd()*H,2,2)}});
 const o=new T.Mesh(new T.PlaneGeometry(w,d),new T.MeshStandardMaterial({map:t,roughness:1,bumpMap:t,bumpScale:.8}));o.rotation.x=-Math.PI/2;o.position.set(x,.035,z);o.receiveShadow=true;scene.add(o)}
rug(-9,3.8,3.6,2.4,'#7a2a2a','#e0b36a');rug(-9,-6.5,2.6,1.8,'#3d4a3a','#d9c08a');rug(0,5,3.4,2.2,'#3a5a46','#e8d9a8');rug(9,3.4,3.2,2.0,'#3a4a40','#e0b36a');
// lamp glow
if(!coarse)[[-12.6,1.9,1.4],[-4,1.9,7.9]].forEach(([x,y,z])=>{const l=new T.PointLight(0xffc88a,.8,6);l.position.set(x,y,z);scene.add(l)});
// drifting dust in the light
// ===== CINEMATIC POST-PROCESSING (HDR bloom, ACES grade, lens effects) =====
let comp=null;
if(false&&T.EffectComposer&&T.UnrealBloomPass&&T.ShaderPass){try{
 const rt=new T.WebGLMultisampleRenderTarget(innerWidth,innerHeight,{type:T.HalfFloatType,format:T.RGBAFormat});rt.samples=4;
 comp=new T.EffectComposer(r,rt);comp.setPixelRatio(r.getPixelRatio());comp.addPass(new T.RenderPass(scene,cam));
 comp.addPass(new T.UnrealBloomPass(new T.Vector2(innerWidth,innerHeight),.5,.7,.92));
 const fin=new T.ShaderPass({uniforms:{tDiffuse:{value:null},time:{value:0}},vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader:`uniform sampler2D tDiffuse;uniform float time;varying vec2 vUv;
  float h(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233))+time)*43758.5453);}
  void main(){vec2 d=vUv-.5;float q=dot(d,d);vec2 o=d*q*.012;
   vec3 c=vec3(texture2D(tDiffuse,vUv+o).r,texture2D(tDiffuse,vUv).g,texture2D(tDiffuse,vUv-o).b)*.95;
   c=(c*(2.51*c+.03))/(c*(2.43*c+.59)+.14);
   float l=dot(c,vec3(.2126,.7152,.0722));c=mix(vec3(l),c,1.12);
   c*=mix(vec3(1.04,.98,.93),vec3(.93,.99,1.06),smoothstep(.2,.8,l));
   c=pow(c,vec3(1./2.2));c*=1.-q*1.3;c+=(h(vUv*1000.)-.5)*.035;
   gl_FragColor=vec4(c,1.);}`});
 comp.addPass(fin);r.toneMapping=T.NoToneMapping;ANIM.push(t=>{fin.uniforms.time.value=t%10});
}catch(e){comp=null;console.warn(e)}}
const vgEl=document.getElementById('vg');if(vgEl&&comp)vgEl.style.display='none';

// ================= EXTERIOR WORLD =================
const MS=(w,h,d,x,y,z,m)=>{const o=MM(w,h,d,x,y,z,m);o.castShadow=o.receiveShadow=true;return o};
scene.background=new T.Color(0xd8dfe2);scene.fog=new T.Fog(0xd8dfe2,38,125);cam.far=220;cam.updateProjectionMatrix();
const skyD=new T.Mesh(new T.SphereGeometry(150,32,16),new T.MeshBasicMaterial({map:tex(16,512,(x,w,h)=>{const g=x.createLinearGradient(0,0,0,h);g.addColorStop(0,'#4f78a8');g.addColorStop(.3,'#7f9fbf');g.addColorStop(.46,'#b9c9d6');g.addColorStop(.5,'#d8dfe2');g.addColorStop(1,'#d8dfe2');x.fillStyle=g;x.fillRect(0,0,w,h)}),side:T.BackSide,fog:false,depthWrite:false,toneMapped:false}));skyD.renderOrder=-1;scene.add(skyD);
const clT=tex(256,128,(x,w,h)=>{for(let i=0;i<14;i++){const cx=40+rnd()*176,cy2=50+rnd()*30,rr=24+rnd()*30,g=x.createRadialGradient(cx,cy2,0,cx,cy2,rr);g.addColorStop(0,'rgba(255,255,255,.55)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,w,h)}});
for(let i=0;i<11;i++){const s=new T.Sprite(new T.SpriteMaterial({map:clT,transparent:true,depthWrite:false,fog:false,opacity:.55})),a=rnd()*6.28;s.position.set(Math.cos(a)*(70+rnd()*40),38+rnd()*30,Math.sin(a)*(70+rnd()*40));s.scale.set(70,35,1);scene.add(s)}
const gT=tex(256,256,(x,w,h)=>{x.fillStyle='#4a5a30';x.fillRect(0,0,w,h);for(let i=0;i<9000;i++){x.fillStyle=`hsla(${62+rnd()*40},${20+rnd()*20}%,${16+rnd()*20}%,.5)`;x.fillRect(rnd()*w,rnd()*h,1+rnd(),2+rnd()*3)}},true,[140,140]);
const gnd=new T.Mesh(new T.PlaneGeometry(700,700),new T.MeshStandardMaterial({map:gT,bumpMap:gT,bumpScale:.8,roughness:1,envMapIntensity:.3}));gnd.rotation.x=-Math.PI/2;gnd.position.y=-.02;gnd.receiveShadow=true;scene.add(gnd);
const rdT=tex(512,256,(x,w,h)=>{x.fillStyle='#34373c';x.fillRect(0,0,w,h);for(let i=0;i<6000;i++){x.fillStyle=`rgba(${rnd()>.5?255:0},${rnd()>.5?255:0},0,.05)`;x.fillRect(rnd()*w,rnd()*h,2,2)}x.fillStyle='#e8e2b8';for(let i=0;i<4;i++)x.fillRect(i*128+20,h/2-3,70,6)},true,[30,1]);
const road=new T.Mesh(new T.PlaneGeometry(300,10),new T.MeshStandardMaterial({map:rdT,roughness:.9}));road.rotation.x=-Math.PI/2;road.position.set(0,.005,33);road.receiveShadow=true;scene.add(road);
const stoneM=M(0x8b8478,0,.95,{bumpMap:concT,bumpScale:.8}),pathM=M(0xc9c3b6,0,.9,{bumpMap:concT,bumpScale:.4});
MS(300,.12,2.2,0,.06,27.6,M(0xb5b2aa,0,.9));MS(1.8,.06,16,-6.4,.03,19.7,pathM);MS(5.2,.1,2.8,-6.4,-.02,10.5,pathM);
// house shell: roof, plinth, slat cladding, canopy, posts
MS(29.4,.35,20.4,0,3.425,0,M(0x2a2d33,.3,.6));
MS(6.2,.55,.14,-10.6,.275,9.1,stoneM);MS(19,.55,.14,4.2,.275,9.1,stoneM);MS(2.2,.04,.5,-6.4,0,9.05,stoneM);MS(27.4,.55,.14,0,.275,-9.1,stoneM);[-13.6,13.6].forEach(x=>MS(.14,.55,18.2,x,.275,0,stoneM));
const slatT=tex(256,256,(x,w,h)=>{for(let i=0;i<16;i++){x.fillStyle=`hsl(28,${40+rnd()*10}%,${24+rnd()*10}%)`;x.fillRect(i*16,0,14,h);x.fillStyle='#120b06';x.fillRect(i*16+14,0,2,h)}});
MS(5.5,3,.08,10.5,1.6,9.14,M(0xffffff,0,.6,{map:slatT}));MS(5.5,3,.08,-10.5,1.6,-9.14,M(0xffffff,0,.6,{map:slatT}));
MS(5.6,.14,3.1,-6.4,2.85,10.55,trim);[-8.9,-3.9].forEach(x=>{cy(.07,.07,2.8,x,0,11.6,trim,10);S.push({x0:x-.08,x1:x+.08,y0:0,y1:2.8,z0:11.52,z1:11.68,cx:x,cy:1.4,cz:11.6,hx:.08,hy:1.4,hz:.08})});
// door
const doorPivot=new T.Group();doorPivot.position.set(-7.0,0,9.0);scene.add(doorPivot);const dl=BX(1.2,2.05,.07,woodM);dl.position.set(.6,1.025,0);dl.castShadow=true;doorPivot.add(dl);

MS(.12,2.16,.3,-7.06,1.08,9.05,trim);MS(.12,2.16,.3,-5.74,1.08,9.05,trim);MS(1.5,.12,.3,-6.4,2.16,9.05,trim);
MS(.25,.55,.14,-7.375,.275,9.1,stoneM);MS(.25,.55,.14,-5.425,.275,9.1,stoneM);
// lit windows seen from outside
const gl=tex(64,64,(x,w,h)=>{const g=x.createLinearGradient(0,0,0,h);g.addColorStop(0,'#ffe2b0');g.addColorStop(1,'#a8743c');x.fillStyle=g;x.fillRect(0,0,w,h);x.fillStyle='rgba(255,255,255,.18)';x.beginPath();x.moveTo(0,40);x.lineTo(40,0);x.lineTo(64,0);x.lineTo(0,64);x.fill()});
function glass(x,z,ry,w,clr){const g=new T.Group();g.position.set(x,1.75,z);g.rotation.y=ry;scene.add(g);if(!clr)g.add(new T.Mesh(new T.PlaneGeometry(w,1.5),new T.MeshBasicMaterial({map:gl})));
 [[w+.2,.1,0,.8],[w+.2,.1,0,-.8],[.1,1.7,-w/2-.05,0],[.1,1.7,w/2+.05,0],[.06,1.5,0,0],[w,.05,0,0]].forEach(([a,b,c,d])=>{const o=BX(a,b,.1,trim);o.position.set(c,d,.03);g.add(o)});const s=BX(w+.3,.06,.3,stoneM);s.position.set(0,-.87,.12);g.add(s)}
[-11,-2.5,2.5].forEach(x=>glass(x,9.12,0,2.4));[-4.5,5.2].forEach(z=>glass(13.62,z,Math.PI/2,1.9,1));glass(-13.62,-4.5,-Math.PI/2,1.9);glass(-13.62,5,-Math.PI/2,1.9,1);[-9,0,9].forEach(x=>glass(x,-9.12,Math.PI,2.4));
// garden
const gr=[M(0x3a4d2b,0,1,{bumpMap:concT,bumpScale:2}),M(0x4a5c33,0,1,{bumpMap:concT,bumpScale:2}),M(0x2b3b25,0,1,{bumpMap:concT,bumpScale:2})];const LM=[leafCardM,Object.assign(leafCardM.clone(),{color:new T.Color(0xd6d79a)}),Object.assign(leafCardM.clone(),{color:new T.Color(0xa3b88a)})];
const barkM=M(0x4a3524,0,1,{bumpMap:concT,bumpScale:2});
function leafCluster(g,cx,cy,cz,rx,ry,rz,n,sz,k0,shadow){const im=new T.InstancedMesh(new T.PlaneGeometry(1,1),leafCardM,n),o=new T.Object3D(),col=new T.Color();
 for(let i=0;i<n;i++){const u=rnd()*6.283,v=Math.acos(2*rnd()-1),k=k0+(1-k0)*Math.sqrt(rnd());o.position.set(cx+Math.sin(v)*Math.cos(u)*rx*k,cy+Math.cos(v)*ry*k,cz+Math.sin(v)*Math.sin(u)*rz*k);o.rotation.set((rnd()-.5)*1.7,rnd()*6.283,(rnd()-.5)*1.7);const q=sz*(.7+rnd()*.6);o.scale.set(q,q,q);o.updateMatrix();im.setMatrixAt(i,o.matrix);col.setRGB(.72+rnd()*.28,.85+rnd()*.15,.55+rnd()*.4);im.setColorAt(i,col)}
 im.castShadow=!!shadow&&!coarse;im.frustumCulled=false;g.add(im)}
function tree(x,z,s){const g=new T.Group();g.position.set(x,0,z);scene.add(g);
 const t=new T.Mesh(new T.CylinderGeometry(.15*s,.32*s,3.4*s,10),barkM);t.position.y=1.7*s;t.castShadow=true;g.add(t);
 const n1=coarse?90:170,n2=coarse?14:26,tips=[];
 for(let i=0;i<5;i++){const a=i/5*6.283+rnd()*.8,base=new V3(0,(2.3+rnd()*.5)*s,0),tip=new V3(Math.cos(a)*(1.3+rnd()*.7)*s,(3.9+rnd()*.9)*s,Math.sin(a)*(1.3+rnd()*.7)*s),dir=tip.clone().sub(base),len=dir.length();
  const br=new T.Mesh(new T.CylinderGeometry(.04*s,.1*s,len,6),barkM);br.position.copy(base).addScaledVector(dir,.5);br.quaternion.setFromUnitVectors(new V3(0,1,0),dir.clone().normalize());br.castShadow=true;g.add(br);tips.push(tip)}
 leafCluster(g,0,4.5*s,0,2.2*s,1.7*s,2.2*s,n1,1.7*s,.25,true);
 tips.forEach(p=>leafCluster(g,p.x,p.y+.25*s,p.z,1.0*s,.8*s,1.0*s,n2,1.4*s,.2,true));
 S.push({x0:x-.3*s,x1:x+.3*s,y0:0,y1:3,z0:z-.3*s,z1:z+.3*s,cx:x,cy:1.5,cz:z,hx:.3*s,hy:1.5,hz:.3*s})}
[[-20,15,1.2],[-26,3,1.4],[-22,-10,1.3],[22,14,1.2],[27,2,1.5],[21,-12,1.3],[-10,-17,1.2],[2,-19,1.4],[15,-17,1.2],[-32,20,1.5],[31,21,1.4],[10,19,1],[-14.5,17,.9]].forEach(a=>tree(...a));
[[-11,10.8,5],[.5,10.8,5],[10.5,10.8,5]].forEach(([x,z,w])=>{const h=MS(w,.9,.7,x,.45,z,gr[1]);S.push({x0:x-w/2,x1:x+w/2,y0:0,y1:.9,z0:z-.35,z1:z+.35,cx:x,cy:.45,cz:z,hx:w/2,hy:.45,hz:.35})});
const lampG=new T.MeshBasicMaterial({color:new T.Color(3,2.5,1.7)});[14,20,26].forEach(z=>{cy(.04,.05,1.2,-5.2,0,z,dark,8);sp(.1,lampG,-5.2,1.3,z);S.push({x0:-5.27,x1:-5.13,y0:0,y1:1.4,z0:z-.07,z1:z+.07,cx:-5.2,cy:.7,cz:z,hx:.07,hy:.7,hz:.07})});
if(!coarse){const dl2=new T.PointLight(0xffd9a0,.9,7);dl2.position.set(-6.4,2.5,10.6);scene.add(dl2)}
// sun + daylight (ramps off indoors)
const sun=new T.DirectionalLight(0xffe4bf,coarse?0:1.9);sun.position.set(-36,27,30);scene.add(sun,sun.target);
if(!coarse){sun.castShadow=true;sun.shadow.mapSize.set(4096,4096);const c=sun.shadow.camera;c.left=-34;c.right=34;c.top=30;c.bottom=-30;c.near=5;c.far=120;sun.shadow.bias=-.0004;sun.shadow.normalBias=.04}
const outH=new T.HemisphereLight(0xc4d4e6,0x5b5a44,0);scene.add(outH);ANIM.push(()=>{const ox=Math.max(cl((Math.abs(cam.position.x)-13.2)/1.5,0,1),cl((Math.abs(cam.position.z)-8.7)/1.5,0,1));outH.intensity=(coarse?1.3:.75)*(.3+.7*ox)});


// ===== OUTDOOR REALISM v2: hills, grass tufts, shrubs, rocks =====
(function(){
 const hm=M(0x69775f,0,1);for(let i=0;i<18;i++){const a=i/18*6.283+rnd()*.2,d=100+rnd()*12,h=new T.Mesh(new T.SphereGeometry(1,16,10),hm);h.scale.set(26+rnd()*20,8+rnd()*10,20+rnd()*10);h.position.set(Math.cos(a)*d,-1.5,Math.sin(a)*d);scene.add(h)}
 const gt=tex(128,128,(x,w,h)=>{for(let i=0;i<46;i++){const bx0=w*.1+rnd()*w*.8,hh=h*(.45+rnd()*.5),bend=(rnd()-.5)*34;x.strokeStyle=`hsl(${66+rnd()*34},${26+rnd()*22}%,${22+rnd()*26}%)`;x.lineWidth=1.4+rnd()*1.6;x.lineCap='round';x.beginPath();x.moveTo(bx0,h);x.quadraticCurveTo(bx0+bend*.3,h-hh*.5,bx0+bend,h-hh);x.stroke()}});
 const gm=new T.MeshStandardMaterial({map:gt,alphaTest:.4,side:T.DoubleSide,roughness:1,envMapIntensity:.2});
 const N=coarse?500:1700,im=[new T.InstancedMesh(new T.PlaneGeometry(.75,.6),gm,N),new T.InstancedMesh(new T.PlaneGeometry(.75,.6),gm,N)],o=new T.Object3D(),col=new T.Color();
 let k=0;while(k<N){const x=(rnd()-.5)*84,z=(rnd()-.5)*84+8;
  if(Math.abs(x)<16&&z>-12&&z<12.6)continue;      // house footprint
  if(z>26.2&&z<39)continue;                       // sidewalk + road
  if(Math.abs(x+6.4)<1.6&&z>10&&z<28.5)continue;  // front path
  const sc=.8+rnd()*1.1,ry=rnd()*3.14;
  [0,1].forEach(q=>{o.position.set(x,.2*sc,z);o.rotation.set(0,ry+q*1.5708,0);o.scale.set(sc,sc,sc);o.updateMatrix();im[q].setMatrixAt(k,o.matrix);col.setHSL(.2+rnd()*.07,.25+rnd()*.15,.55+rnd()*.35);im[q].setColorAt(k,col)});k++}
 im.forEach(m=>{m.receiveShadow=true;m.frustumCulled=false;scene.add(m)});
 // shrubs hugging the plinth + natural rocks
 [[-12.5,10.2],[-9.6,10.2],[-3.3,10.2],[-.8,10.2],[3,10.2],[7.6,10.2],[12.8,10.2],[14.2,5],[14.4,-3],[-14.4,6],[-14.5,-2]].forEach(([x,z])=>{const g=new T.Group();g.position.set(x,0,z);scene.add(g);leafCluster(g,0,.38,0,.8,.4,.4,22,.75,0,false)});
 const rk=M(0x7b7870,0,.95,{bumpMap:concT,bumpScale:1.5});for(let i=0;i<16;i++){const r2=new T.Mesh(new T.DodecahedronGeometry(.25+rnd()*.5,0),rk),a=rnd()*6.28,d=17+rnd()*20;r2.position.set(Math.cos(a)*d,.1,Math.sin(a)*d*.8);if(Math.abs(r2.position.z-33)<7){r2.position.z=14+rnd()*8}r2.rotation.set(rnd(),rnd(),rnd());r2.scale.y=.6;r2.castShadow=r2.receiveShadow=true;scene.add(r2)}
})();
// ================= REALISM PASS: real wood floors, normal maps, contact shadows =================
const woodF=tex(1024,1024,(x,w,h)=>{for(let i=0;i<16;i++){const y0=i*64;x.fillStyle=`hsl(${26+rnd()*8},${40+rnd()*12}%,${26+rnd()*10}%)`;x.fillRect(0,y0,w,64);for(let k=0;k<90;k++){const yy=y0+rnd()*64,l=rnd()>.5;x.strokeStyle=`rgba(${l?255:30},${l?220:12},${l?180:4},${.04+rnd()*.1})`;x.lineWidth=.6+rnd()*1.6;x.beginPath();const ph=rnd()*6;for(let xx=0;xx<=w;xx+=32){const yv=yy+Math.sin(xx*.01+ph)*2.2;xx?x.lineTo(xx,yv):x.moveTo(xx,yv)}x.stroke()}x.fillStyle='rgba(8,4,2,.75)';x.fillRect(0,y0,w,2.5);x.fillRect(rnd()*w,y0,2.5,64)}},true,[3,3]);
const nmCache=new Map();
function nmap(src){if(nmCache.has(src))return nmCache.get(src);const c=src.image,w=c.width,h=c.height,d=c.getContext('2d').getImageData(0,0,w,h).data,hh=new Float32Array(w*h);for(let i=0;i<w*h;i++)hh[i]=(d[i*4]*.3+d[i*4+1]*.59+d[i*4+2]*.11)/255;
 const o=document.createElement('canvas');o.width=w;o.height=h;const oc=o.getContext('2d'),od=oc.createImageData(w,h);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const l=hh[y*w+(x+w-1)%w],rr=hh[y*w+(x+1)%w],u=hh[((y+h-1)%h)*w+x],dn=hh[((y+1)%h)*w+x],dx=(l-rr)*3,dy=(dn-u)*3,n=Math.hypot(dx,dy,1),i=(y*w+x)*4;od.data[i]=(dx/n*.5+.5)*255;od.data[i+1]=(dy/n*.5+.5)*255;od.data[i+2]=(1/n*.5+.5)*255;od.data[i+3]=255}
 oc.putImageData(od,0,0);const t=new T.CanvasTexture(o);t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.copy(src.repeat);t.anisotropy=r.capabilities.getMaxAnisotropy();nmCache.set(src,t);return t}
// constant texture density on walls, wood and stone
const seenG=new Set();scene.traverse(o=>{if(!o.isMesh||o.geometry.type!=='BoxGeometry'||seenG.has(o.geometry))return;const m=o.material;if(m!==wallM&&m!==woodM&&m!==stoneM&&m!==pathM)return;seenG.add(o.geometry);const p=o.geometry.parameters,uv=o.geometry.attributes.uv;[[p.depth,p.height],[p.depth,p.height],[p.width,p.depth],[p.width,p.depth],[p.width,p.height],[p.width,p.height]].forEach(([a,b],f)=>{for(let i=0;i<4;i++){const k=f*4+i;uv.setXY(k,uv.getX(k)*a/4,uv.getY(k)*b/4)}})});
// bump -> real normal maps, wood planks on floors
const seenM=new Set();scene.traverse(o=>{const m=o.material;if(!o.isMesh||!m||seenM.has(m)||!m.isMeshStandardMaterial)return;seenM.add(m);if(m.bumpMap===floorW)m.bumpMap=woodF;if(m.map===floorW)m.map=woodF;
 if(m.bumpMap){const k=Math.min((m.bumpScale||1)*1.6,1.6);m.normalMap=nmap(m.bumpMap);m.normalScale.set(k,k);m.bumpMap=null;m.needsUpdate=true}});
// soft contact shadows under every piece of furniture and along wall bases
const aoT=tex(64,64,(x,w,h)=>{const id=x.createImageData(w,h);for(let j=0;j<h;j++)for(let i=0;i<w;i++){let e=Math.min(1,Math.min(i+.5,w-i-.5,j+.5,h-j-.5)/(w*.3));id.data[(j*w+i)*4+3]=e*e*(3-2*e)*255}x.putImageData(id,0,0)},true);aoT.wrapS=aoT.wrapT=T.ClampToEdgeWrapping;
const aoM=op=>new T.MeshBasicMaterial({map:aoT,color:0x000000,transparent:true,opacity:op,depthWrite:false,fog:false,polygonOffset:true,polygonOffsetFactor:-1}),aoA=aoM(.55),aoB=aoM(.3),aoC=aoM(.4);
S.forEach(b=>{if(b.y0>1.2)return;const w=b.x1-b.x0,d=b.z1-b.z0;if(w<.05||d<.05)return;const wall=Math.max(w,d)>=6||b.y1-b.y0>3,mg=wall?.3:.38,W=w+2*mg,D=d+2*mg,g=new T.PlaneGeometry(W,D,3,3),p=g.attributes.position,uv=g.attributes.uv,xs=[-W/2,-w/2,w/2,W/2],ys=[D/2,d/2,-d/2,-D/2],us=[0,.3,.7,1];
 for(let iy=0;iy<4;iy++)for(let ix=0;ix<4;ix++){const k=iy*4+ix;p.setXY(k,xs[ix],ys[iy]);uv.setXY(k,us[ix],us[3-iy])}
 const o=new T.Mesh(g,wall?aoC:b.y0<.1?aoA:aoB);o.rotation.x=-Math.PI/2;o.position.set(b.cx,.04,b.cz);o.renderOrder=2;scene.add(o)});

// ===== ROOM COLOR DESIGN: matte paint, tinted light and accent per room =====
const ACC=['#8fd6a6','#6cb6ff','#ff8a65','#f0b27a','#f2c14e','#4fd1c5'];
const paint=[0x93ad94,0x8aa0c0,0xd7d9dd,0xe0c9a8,0xd1a84f,0x5fa3a0].map(c=>{const m=wallM.clone();m.color.set(c);m.roughness=.97;m.metalness=0;m.envMapIntensity=.25;return m});
const roomIdx=(x,z)=>Math.abs(x)>13.35||Math.abs(z)>8.85?-1:(z<0?0:3)+(x<-4.5?0:x<4.5?1:2);
scene.traverse(o=>{if(!o.isMesh||o.material!==wallM||o.geometry.type!=='BoxGeometry')return;const p=o.geometry.parameters,q=o.position,e=.2,f=(x,z)=>{const i=roomIdx(x,z);return i<0?wallM:paint[i]},hx=p.width/2,hz=p.depth/2;
 o.material=p.width>p.depth?[wallM,wallM,wallM,wallM,f(q.x,q.z+hz+e),f(q.x,q.z-hz-e)]:[f(q.x+hx+e,q.z),f(q.x-hx-e,q.z),wallM,wallM,wallM,wallM]});
const LC=[0xfff0d0,0xe3efff,0xffffff,0xffd7a8,0xffd9a0,0xfff0e0],LI=[1.05,1.1,.78,1,1.05,1.3];
scene.traverse(o=>{if(o.isPointLight&&Math.abs(o.position.y-2.9)<.01){const i=rooms.findIndex(q=>q.cx===o.position.x&&q.cz===o.position.z);if(i>=0){o.color.set(LC[i]);o.intensity*=LI[i]}}});
skirt.color.set(0xf4f1ea);skirt.metalness=0;skirt.roughness=.7;

const doorM=M(0xffffff,0,.55,{map:woodT,color:0xdcc29c,envMapIntensity:.5}),panM=M(0xffffff,0,.6,{map:woodT,color:0xb58f63,envMapIntensity:.4});
function dress(g,x0,w,t){const a=(bw,bh,bd,x,y,z,m)=>{const o=new T.Mesh(new T.BoxGeometry(bw,bh,bd),m);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;g.add(o)};
 [x0+w*.27,x0+w*.73].forEach(x=>{a(w*.4,.8,t+.02,x,.62,0,panM);a(w*.4,.78,t+.02,x,1.68,0,panM)});
 [1,-1].forEach(sd=>{a(.05,.14,.02,x0+w-.13,1.05,sd*(t/2+.01),steel);const k=new T.Mesh(new T.SphereGeometry(.04,10,8),steel);k.position.set(x0+w-.13,1.05,sd*(t/2+.06));g.add(k)})}
const DR=[];
function mkdoor(hx,hz,rot0,sgn,ang,bx0,open0,leaf){
 let piv=leaf;
 if(!piv){piv=new T.Group();piv.position.set(hx,0,hz);scene.add(piv);const sl=new T.Mesh(new T.BoxGeometry(DHW*2-.08,DH-.04,.045),doorM);sl.position.set(DHW-.04+.04,(DH-.04)/2,0);sl.castShadow=sl.receiveShadow=true;piv.add(sl);dress(piv,.04,DHW*2-.08,.045)}
 const e={x0:bx0.x0,x1:bx0.x1,y0:0,y1:DH,z0:bx0.z0,z1:bx0.z1,cx:(bx0.x0+bx0.x1)/2,cy:DH/2,cz:(bx0.z0+bx0.z1)/2,hx:(bx0.x1-bx0.x0)/2,hy:DH/2,hz:(bx0.z1-bx0.z0)/2};S.push(e);
 const d={piv,e,a:open0?1:0,open:!!open0};
 d.sync=()=>{piv.rotation.y=rot0+sgn*ang*d.a;const on=d.a<.6;e.cy=on?DH/2:-99;e.hy=on?DH/2:0;e.y0=on?0:-99;e.y1=on?DH:-98};
 d.toggle=()=>{if(d.open&&P.x>e.x0-.45&&P.x<e.x1+.45&&P.z>e.z0-.45&&P.z<e.z1+.45)return;d.open=!d.open};
 piv.userData.ref={name:'Door',toggle:d.toggle,label:()=>d.open?'Close door':'Open door'};ray.push(piv);
 d.sync();DR.push(d);return d}
[[-9,1],[0,-1],[9,-1]].forEach(([g,sw])=>mkdoor(g-DHW,0,0,sw,1.75,{x0:g-DHW,x1:g+DHW,z0:-.06,z1:.06},true));
[[-4.5,-4.5,-1],[-4.5,4.5,-1],[4.5,-4.5,1],[4.5,4.5,1]].forEach(([x,g,sw])=>mkdoor(x,g-DHW,-Math.PI/2,sw,1.75,{x0:x-.06,x1:x+.06,z0:g-DHW,z1:g+DHW},true));
dress(doorPivot,0,1.2,.07);
const FD=mkdoor(-7.0,9,0,1,1.65,{x0:-7.0,x1:-5.8,z0:8.93,z1:9.07},false,doorPivot);FD.front=true;
ANIM.push((t,dt)=>{DR.forEach(d=>{if(d.front&&CIN.mode!=='play')return;const tg=d.open?1:0;if(d.a!==tg){d.a+=(tg-d.a)*(1-Math.exp(-5*dt));if(Math.abs(tg-d.a)<.003)d.a=tg;d.sync()}})});
// ================= DESIGN UPGRADE v3: apartment-walkthrough inspired rooms + house =================
// Procedural stone / wood / tile / terrazzo floors, rounded furniture, stone + slat feature walls, jali screen,
// pleated curtains, cove LED strips, brass downlights, pendants, framed art, stone entrance, planters and paver path.
(function(){
 const S1=coarse?512:1024,S2=512,gold=M(0xc9a24a,.9,.3,{envMapIntensity:1.3});
 const nz=(g,w,h,a)=>{const d=g.getImageData(0,0,w,h),p=d.data;for(let i=0;i<p.length;i+=4){const n=(rnd()-.5)*a;p[i]+=n;p[i+1]+=n;p[i+2]+=n}g.putImageData(d,0,0)};
 const mk=(draw,rep,amt,sz)=>{sz=sz||S1;return tex(sz,sz,(g,W,H)=>{g.save();g.scale(W/1024,H/1024);draw(g);g.restore();nz(g,W,H,amt==null?9:amt)},true,rep)};
 const RB=(w,h,d,r)=>{r=Math.min(r,w/2-.001,h/2-.001,d/2-.001);const g=new T.BoxGeometry(w,h,d,6,6,6),p=g.attributes.position,n=g.attributes.normal,v=new V3(),k=new V3(),q=new V3(),a=w/2-r,b=h/2-r,e=d/2-r,c=(x,l)=>Math.max(-l,Math.min(l,x));for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i);k.set(c(v.x,a),c(v.y,b),c(v.z,e));q.subVectors(v,k);if(q.lengthSq()>1e-8){q.normalize();n.setXYZ(i,q.x,q.y,q.z);v.copy(k).addScaledVector(q,r);p.setXYZ(i,v.x,v.y,v.z)}}return g};
 const uvd=(o,s)=>{const p=o.geometry.parameters,uv=o.geometry.attributes.uv;[[p.depth,p.height],[p.depth,p.height],[p.width,p.depth],[p.width,p.depth],[p.width,p.height],[p.width,p.height]].forEach(([a,b],f)=>{for(let i=0;i<4;i++){const k=f*4+i;uv.setXY(k,uv.getX(k)*a/s,uv.getY(k)*b/s)}});return o};
 const sb=(w,h,d,x,y,z,m,s)=>{const o=new T.Mesh(new T.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;scene.add(o);return s?uvd(o,s):o};
 const glv=(a,b,c)=>new T.MeshBasicMaterial({color:new T.Color(a,b,c)});
 const lg=(w,h,d,x,y,z,m)=>{const o=new T.Mesh(new T.BoxGeometry(w,h,d),m);o.position.set(x,y,z);scene.add(o);return o};
 const col=(x,z,hx,hz,h)=>S.push({x0:x-hx,x1:x+hx,y0:0,y1:h,z0:z-hz,z1:z+hz,cx:x,cy:h/2,cz:z,hx,hy:h/2,hz});
 const ao2=(x,z,w,d)=>{const p=new T.Mesh(new T.PlaneGeometry(w*1.5,d*1.5),aoB);p.rotation.x=-Math.PI/2;p.position.set(x,.04,z);p.renderOrder=2;scene.add(p)};
 const lathe=(pts,m)=>{const o=new T.Mesh(new T.LatheGeometry(pts.map(p=>new T.Vector2(p[0],p[1])),28),m);o.castShadow=o.receiveShadow=true;return o};
 r.toneMappingExposure=1.12;
 // ---------- textures ----------
 const planks=(h0,s,l0,rep,pl,sz)=>mk(g=>{pl=pl||64;for(let x=0;x<1024;x+=pl){let y=-rnd()*300;while(y<1024){const len=240+rnd()*400,v=rnd()*11;g.fillStyle=`hsl(${h0+rnd()*5},${s}%,${l0+v}%)`;g.fillRect(x,y,pl-1,len);for(let i=0;i<44;i++){const lt=rnd()>.5,gx=x+rnd()*(pl-1);g.strokeStyle=`rgba(${lt?'255,226,186':'28,12,2'},${.04+rnd()*.09})`;g.lineWidth=.6+rnd()*1.3;g.beginPath();g.moveTo(gx,y);g.bezierCurveTo(gx+(rnd()-.5)*8,y+len*.3,gx+(rnd()-.5)*8,y+len*.7,gx+(rnd()-.5)*6,y+len);g.stroke()}g.fillStyle='rgba(0,0,0,.55)';g.fillRect(x,y,pl-1,2.5);y+=len}g.fillStyle='rgba(0,0,0,.6)';g.fillRect(x+pl-2,0,2,1024)}},rep,10,sz);
 const tiles=(hue,sat,lit,grout,n,rep,vein)=>mk(g=>{const s=1024/n;for(let j=0;j<n;j++)for(let i=0;i<n;i++){g.fillStyle=`hsl(${hue+rnd()*4},${sat}%,${lit+rnd()*5}%)`;g.fillRect(i*s,j*s,s,s);for(let k=0;k<3;k++){g.strokeStyle=`rgba(${vein},${.04+rnd()*.07})`;g.lineWidth=1+rnd()*2.5;g.beginPath();g.moveTo(i*s+rnd()*s,j*s);g.bezierCurveTo(i*s+rnd()*s,j*s+s*.3,i*s+rnd()*s,j*s+s*.7,i*s+rnd()*s,j*s+s);g.stroke()}}g.strokeStyle=grout;g.lineWidth=5;for(let i=0;i<=n;i++){g.beginPath();g.moveTo(i*s,0);g.lineTo(i*s,1024);g.stroke();g.beginPath();g.moveTo(0,i*s);g.lineTo(1024,i*s);g.stroke()}},rep,7,S2);
 const terr=mk(g=>{g.fillStyle='#d9d2c4';g.fillRect(0,0,1024,1024);const cs=['#8a7d6c','#b5a58c','#3b3a38','#c98a5a','#f3eee4','#6f7f73'];for(let i=0;i<1500;i++){g.fillStyle=cs[(rnd()*cs.length)|0];g.save();g.translate(rnd()*1024,rnd()*1024);g.rotate(rnd()*6.3);g.beginPath();const r1=2+rnd()*8;g.moveTo(r1,0);for(let k=1;k<6;k++){const a=k/6*6.283,q=r1*(.6+rnd()*.5);g.lineTo(Math.cos(a)*q,Math.sin(a)*q)}g.closePath();g.fill();g.restore()}g.fillStyle='rgba(190,155,80,.95)';[0,256,512,768].forEach(p=>{g.fillRect(p,0,4,1024);g.fillRect(0,p,1024,4)})},[2,2],6,S2);
 const stT=mk(g=>{g.fillStyle='#17110c';g.fillRect(0,0,1024,1024);const rh=64;for(let y=0;y<1024;y+=rh){let x=-rnd()*120;while(x<1024){const l=110+rnd()*230,v=rnd();g.fillStyle=v>.93?`hsl(40,22%,${56+rnd()*12}%)`:`hsl(${24+v*16},${8+v*8}%,${30+v*22}%)`;g.fillRect(x+2,y+2,l-4,rh-4);for(let i=0;i<4;i++){g.fillStyle=`rgba(${rnd()>.5?'255,235,200':'0,0,0'},.09)`;g.fillRect(x+3+rnd()*l,y+3+rnd()*(rh-6),10+rnd()*40,1.5)}x+=l}}},null,14);
 const pvT=mk(g=>{g.fillStyle='#8f887a';g.fillRect(0,0,1024,1024);const s=128;for(let j=0;j<8;j++)for(let i=-1;i<9;i++){const o=(j%2)*s/2,v=rnd();g.fillStyle=`hsl(${34+v*8},${10+v*8}%,${62+v*14}%)`;g.fillRect(i*s+o+3,j*s+3,s-6,s-6)}},null,12,S2);
 const slT=tex(512,512,(g,w,h)=>{for(let i=0;i<24;i++){g.fillStyle=`hsl(${28+rnd()*4},${42+rnd()*8}%,${34+rnd()*10}%)`;g.fillRect(i*w/24,0,w/24-3,h);g.fillStyle='#120b06';g.fillRect(i*w/24-3+w/24,0,3,h)}nz(g,w,h,10)},true);
 const jT=tex(512,512,(g,w,h)=>{g.fillStyle='#120a05';g.fillRect(0,0,w,h);const n=4,s=w/n;for(let j=0;j<n;j++)for(let i=0;i<n;i++){const x=i*s,y=j*s;g.fillStyle='#c9a24a';g.fillRect(x+6,y+6,s-12,s-12);g.fillStyle='#2a1a08';g.save();g.translate(x+s/2,y+s/2);for(let k=0;k<8;k++){g.rotate(Math.PI/4);g.beginPath();g.ellipse(0,s*.2,s*.08,s*.17,0,0,7);g.fill()}g.beginPath();g.arc(0,0,s*.07,0,7);g.fill();g.restore()}},true);
 const curT=tex(256,64,(g,w,h)=>{for(let x=0;x<w;x++){const v=.5+.5*Math.sin(x/w*Math.PI*2*5);g.fillStyle=`rgb(${190+v*50|0},${176+v*48|0},${146+v*42|0})`;g.fillRect(x,0,1,h)}},true);
 const wd=planks(26,42,28,null,70,S2);
 // ---------- floors: a different material in every room ----------
 const F=[planks(30,38,32,[3,3]),tiles(205,10,72,'#8d949c',6,[1.5,1.5],'60,70,80'),terr,planks(32,45,46,[3,3],80),planks(20,32,19,[3,3],56),tiles(40,22,84,'#bfb299',4,[2,2],'150,130,100')],FR=[.38,.22,.18,.36,.3,.16];
 const fm=(t,ro)=>new T.MeshStandardMaterial({map:t,normalMap:nmap(t),normalScale:new T.Vector2(.7,.7),roughness:ro,metalness:0,envMapIntensity:.9});
 scene.traverse(o=>{if(!o.isMesh||o.geometry.type!=='PlaneGeometry')return;const p=o.geometry.parameters;if(p.width!==9||p.height!==9)return;const i=rooms.findIndex(q=>q.cx===o.position.x&&q.cz===o.position.z);if(i>=0)o.material=fm(F[i],FR[i])});
 // ---------- wall paint: softer, warmer, one idea per room ----------
 [0xa9bfa5,0xb4c3d6,0xe9e3d6,0xead8bb,0xc7a66a,0x8fbab4].forEach((c,i)=>paint[i].color.set(c));
 // ---------- furniture wood + pleated curtains ----------
 woodM.map=wd;woodM.normalMap=nmap(wd);woodM.normalScale.set(.6,.6);woodM.bumpMap=null;woodM.color.set(0xffffff);woodM.roughness=.42;woodM.needsUpdate=true;
 curt.map=curT;curt.color.set(0xffffff);curt.roughness=1;curt.needsUpdate=true;
 // ---------- rounded sofas, cushions, tables, cabinets (same size, so collisions are unchanged) ----------
 scene.children.slice().forEach(o=>{if(!o.isMesh||o.geometry.type!=='BoxGeometry'||Array.isArray(o.material))return;const m=o.material,q=o.geometry.parameters,w=q.width,h=q.height,d=q.depth,mx=Math.max(w,h,d),mn=Math.min(w,h,d);let rd=0;
  if((m===fabric||m===fabric2)&&mx<4)rd=Math.min(.08,mn*.4);else if(m===woodM&&mx<3.2&&mn>.03)rd=Math.min(.025,mn*.3);if(!rd)return;
  const g=RB(w,h,d,rd);if(m===woodM){const uv=g.attributes.uv,D=[[d,h],[d,h],[w,d],[w,d],[w,h],[w,h]];for(let f=0;f<6;f++)for(let i=0;i<49;i++){const k=f*49+i;uv.setXY(k,uv.getX(k)*D[f][0]/4,uv.getY(k)*D[f][1]/4)}}
  o.geometry=g});
 // ---------- ceilings: cove LED strips + brass downlights ----------
 const CV=[[2.6,2.2,1.6],[1.7,2.3,2.8],[2.4,2.3,2.1],[2.8,2.1,1.3],[2.8,2.2,1.4],[1.9,2.6,2.5]],dlM=glv(3,2.6,2);
 rooms.forEach((rm,i)=>{const m=glv(...CV[i]),hs=4.2,y=WH-.17;
  lg(2*hs,.035,.05,rm.cx,y,rm.cz-hs,m);lg(2*hs,.035,.05,rm.cx,y,rm.cz+hs,m);lg(.05,.035,2*hs,rm.cx-hs,y,rm.cz,m);lg(.05,.035,2*hs,rm.cx+hs,y,rm.cz,m);
  [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([a,b])=>{const x=rm.cx+a*2.4,z=rm.cz+b*2.4,dk=new T.Mesh(new T.CylinderGeometry(.11,.11,.02,20),dlM);dk.position.set(x,WH-.01,z);scene.add(dk);const rg=new T.Mesh(new T.TorusGeometry(.125,.012,6,20),gold);rg.rotation.x=Math.PI/2;rg.position.set(x,WH-.015,z);scene.add(rg)})});
 // ---------- feature walls ----------
 const stoneW=M(0xffffff,0,.85,{map:stT,normalMap:nmap(stT)}),gW=glv(2.8,2.1,1.3);
 // Living room: stone wall behind the TV with warm edge light
 sb(3.0,2.5,.04,-9.1,1.75,8.88,stoneW,3.5);lg(.03,2.5,.02,-10.62,1.75,8.855,gW);lg(.03,2.5,.02,-7.58,1.75,8.855,gW);lg(3.0,.03,.02,-9.1,3.0,8.855,gW);
 // Study: backlit wood slat wall behind the desk
 sb(3.8,2.6,.04,-9,1.5,-8.86,M(0xffffff,0,.55,{map:slT,envMapIntensity:.5}));lg(3.8,.03,.02,-9,.2,-8.835,gW);lg(3.8,.03,.02,-9,2.8,-8.835,gW);
 // Contact: backlit brass jali screen
 {const g=new T.Group();g.position.set(12.5,1.6,.13);scene.add(g);const f=new T.Mesh(RB(1.72,1.52,.05,.015),gold);g.add(f);const jm=new T.Mesh(new T.PlaneGeometry(1.6,1.4),new T.MeshStandardMaterial({map:jT,emissiveMap:jT,emissive:0xffffff,emissiveIntensity:.8,metalness:.4,roughness:.4}));jm.position.z=.027;g.add(jm)}
 // ---------- pendants and fixtures ----------
 const bulb=glv(3,2.5,1.7);
 {const g=new T.Group();g.position.set(0,2.35,5);scene.add(g);const ring=new T.Mesh(new T.TorusGeometry(.8,.022,8,48),gold);ring.rotation.x=Math.PI/2;g.add(ring);
  for(let i=0;i<10;i++){const a=i/10*6.283,b=new T.Mesh(new T.CylinderGeometry(.045,.045,.16,12),bulb);b.position.set(Math.cos(a)*.8,.1,Math.sin(a)*.8);g.add(b)}
  [0,2.1,4.2].forEach(a=>{const rod=new T.Mesh(new T.CylinderGeometry(.006,.006,.85,5),gold);rod.position.set(Math.cos(a)*.8,.425,Math.sin(a)*.8);g.add(rod)})}
 [[-2.4,-8.2],[2.4,-8.2],[-2.6,-1.3],[2.6,-1.3]].forEach(([x,z])=>{const m=glv(2.2,2.4,2.6);lg(2.4,.05,.1,x,2.55,z,m);[-1,1].forEach(s=>lg(.012,.65,.012,x+s,2.875,z,gold))});
 [8.2,9,9.8].forEach((x,i)=>{const y=2.3-(i===1?.1:0);const gb=new T.Mesh(new T.SphereGeometry(.11,16,12),bulb);gb.position.set(x,y,5.6);scene.add(gb);lg(.008,WH-y,.008,x,(WH+y)/2,5.6,gold)});
 lg(7.4,.03,.05,9,WH-.05,-7.7,dark);
 [6.1,9,11.9].forEach(x=>{const s=new T.Group();s.position.set(x,WH-.1,-7.7);s.rotation.x=.75;scene.add(s);const b=new T.Mesh(new T.CylinderGeometry(.045,.06,.2,14),dark);b.position.y=-.1;s.add(b);const l=new T.Mesh(new T.CircleGeometry(.045,14),dlM);l.rotation.x=Math.PI/2;l.position.y=-.201;s.add(l)});
 // study desk lamp
 cy(.09,.1,.02,-10.1,.8,-8.15,gold,16);cy(.012,.012,.4,-10.1,.82,-8.15,gold,8);{const sh=new T.Mesh(new T.CylinderGeometry(.03,.11,.14,16),M(0xfff0d0,0,.8,{emissive:0xffd9a0,emissiveIntensity:1.2}));sh.position.set(-10.0,1.25,-8.15);sh.rotation.z=.5;scene.add(sh)}
 // ---------- living room styling ----------
 [[-10.35,.95,1.62,0xe0a81c,.12],[-7.65,.95,1.62,0xd9532a,-.12],[-9,.93,1.64,0x2f5a4a,0]].forEach(([x,y,z,c,ry])=>{const o=new T.Mesh(RB(.5,.46,.15,.07),M(c,0,1));o.position.set(x,y,z);o.rotation.set(-.18,ry,0);o.castShadow=true;scene.add(o)});
 [[-3.4,.98,1.8,0xd9532a,.1],[-2.6,.98,1.8,0xe0a81c,-.1]].forEach(([x,y,z,c,ry])=>{const o=new T.Mesh(RB(.42,.4,.13,.06),M(c,0,1));o.position.set(x,y,z);o.rotation.set(-.2,ry,0);o.castShadow=true;scene.add(o)});
 cy(.3,.3,.03,-11.45,.5,1.95,woodM,32);cy(.04,.04,.5,-11.45,0,1.95,gold,10);cy(.2,.2,.03,-11.45,0,1.95,gold,24);col(-11.45,1.95,.3,.3,.55);ao2(-11.45,1.95,.6,.6);
 const vase=(x,y,z,c)=>{const g=new T.Group();g.position.set(x,y,z);scene.add(g);const v=lathe([[0,0],[.06,0],[.1,.09],[.11,.15],[.07,.25],[.05,.3],[.07,.34],[.055,.34],[.04,.3]],M(c,.1,.25,{side:T.DoubleSide,envMapIntensity:1}));g.add(v);
  const base=new T.Vector3(0,.3,0),up=new T.Vector3(0,1,0),stemM2=M(0x3f7a3a,0,.8),leafM3=M(0x2f6b3a,0,.7,{side:T.DoubleSide});
  [[0xf2a7b8,-.2,.1,.62],[0xf6d36b,.15,-.1,.7],[0xf4efe6,.0,.2,.56],[0xe87b52,.25,.15,.66],[0xc86bd0,-.12,-.18,.6]].forEach(([fc,a,b,h])=>{
   const head=new T.Vector3(a*.32,h,b*.26),dir=head.clone().sub(base),len=dir.length(),st=new T.Mesh(new T.CylinderGeometry(.006,.008,len,6),stemM2);
   st.position.copy(base).addScaledVector(dir,.5);st.quaternion.setFromUnitVectors(up,dir.clone().normalize());g.add(st);
   const pm=M(fc,0,.55,{side:T.DoubleSide});
   for(let j=0;j<8;j++){const an=j/8*Math.PI*2,p=new T.Mesh(new T.SphereGeometry(.03,8,6),pm);p.scale.set(1.5,.35,.8);p.position.set(head.x+Math.cos(an)*.04,head.y,head.z+Math.sin(an)*.04);p.rotation.set(0,-an,.35);g.add(p)}
   const ce=new T.Mesh(new T.SphereGeometry(.022,8,6),M(0xe0a526,0,.6));ce.position.copy(head);ce.position.y+=.008;g.add(ce);
   [.35,.6].forEach((t,i)=>{const lf=new T.Mesh(new T.SphereGeometry(.035,8,6),leafM3),pp=base.clone().addScaledVector(dir,t),an=(i?1:-1)*1.2+a*5;lf.scale.set(1.8,.3,.8);lf.position.set(pp.x+Math.cos(an)*.03,pp.y,pp.z+Math.sin(an)*.03);lf.rotation.set(0,-an,.4);g.add(lf)})})}; vase(-9.5,.46,3.8,0x2f5a4a);vase(-11.45,.53,1.95,0xb85a3a);vase(7.6,1.0,5.6,0x2f4a5a);
 // ---------- framed art ----------
 const P=[['#e8d9bf','#c9663a','#2f5a4a','#e0b36a'],['#2f4a3c','#e0b36a','#f1e4c8','#c9663a'],['#d9cdb6','#7a8f6f','#b85a3a','#2f4a5a'],['#25364a','#e8b23a','#c9663a','#f1e4c8']];
 const art=(a,b,c,d,kind)=>tex(256,320,(g,w,h)=>{g.fillStyle=a;g.fillRect(0,0,w,h);
  if(kind===0){g.fillStyle=b;g.beginPath();g.arc(w/2,h*.4,w*.27,0,7);g.fill();g.fillStyle=c;g.fillRect(0,h*.72,w,h*.28);g.fillStyle=d;g.fillRect(w*.18,h*.66,w*.64,6)}
  else if(kind===1){[b,c,d].forEach((cl2,i)=>{g.fillStyle=cl2;const x=w*(.12+i*.28),ww=w*.24,top=h*(.34+i*.06);g.fillRect(x,top+ww/2,ww,h*.9-top-ww/2);g.beginPath();g.arc(x+ww/2,top+ww/2,ww/2,Math.PI,0);g.fill()})}
  else{for(let i=0;i<5;i++){g.fillStyle=[b,c,d,b,c][i];g.fillRect(0,h*(.45+i*.11),w,h*.07)}g.fillStyle=d;g.beginPath();g.arc(w*.68,h*.28,w*.14,0,7);g.fill()}
  nz(g,w,h,22)},true);
 const frameM=M(0x2b1d12,.15,.5),matM=M(0xf4eee0,0,.9),H2=Math.PI/2;
 const pic=(x,y,z,ry,w,h,kind,pi)=>{const g=new T.Group();g.position.set(x,y,z);g.rotation.y=ry;scene.add(g);const f=new T.Mesh(RB(w+.14,h+.14,.05,.012),frameM);f.castShadow=true;g.add(f);
  const mt=new T.Mesh(new T.PlaneGeometry(w+.02,h+.02),matM);mt.position.z=.0255;g.add(mt);const im=new T.Mesh(new T.PlaneGeometry(w*.84,h*.84),new T.MeshStandardMaterial({map:art(...P[pi%4],kind),roughness:.7}));im.position.z=.027;g.add(im)};
 [[-4.63,1.75,2.0,-H2,.9,1.2,0,0],[-4.63,1.75,7.2,-H2,1.1,.8,1,1],[-4.63,1.8,-7.0,-H2,1.0,1.3,2,2],[-4.63,1.75,-1.9,-H2,.8,1.0,0,3],
  [-4.37,1.75,-7.2,H2,1.0,1.3,1,3],[-4.37,1.75,-1.9,H2,.8,1.0,2,1],[4.37,1.75,-7.2,-H2,1.0,1.3,2,0],[4.37,1.75,-1.9,-H2,.8,1.0,0,2],
  [4.63,1.75,-7.2,H2,.9,1.2,1,2],[4.63,1.75,-1.9,H2,1.1,.8,2,3],[-4.37,1.75,6.5,H2,.9,1.1,0,1],[4.63,1.75,2.0,H2,.9,1.2,2,1],[4.63,1.75,7.2,H2,1.0,.8,1,0]].forEach(a=>pic(...a));
 // ================= THE HOUSE (exterior) =================
 stoneM.map=stT;stoneM.color.set(0xffffff);stoneM.normalMap=nmap(stT);stoneM.normalScale.set(1.3,1.3);stoneM.needsUpdate=true;
 pathM.map=pvT;pathM.color.set(0xffffff);pathM.normalMap=nmap(pvT);pathM.needsUpdate=true;
 // stone piers flanking the entrance, roof parapet
 [-8.65,-4.5].forEach(x=>sb(.9,3.2,.14,x,1.6,9.18,stoneM,4));
 const par=M(0xf2ede4,0,.7);[-10.12,10.12].forEach(z=>sb(29.4,.28,.18,0,3.74,z,par));[-14.6,14.6].forEach(x=>sb(.18,.28,20.4,x,3.74,0,par));
 // front door: deep teak, brass pulls, address plaque, doormat
 const teak=M(0xffffff,0,.4,{map:wd,color:0xc79a6b}),teakP=M(0xffffff,0,.45,{map:wd,color:0x8e6439});dl.material=teak;doorPivot.traverse(o=>{if(o.isMesh&&o.material===panM)o.material=teakP});
 [1,-1].forEach(s=>{const b=new T.Mesh(new T.CylinderGeometry(.018,.018,.7,10),gold);b.position.set(1.05,1.05,s*.075);doorPivot.add(b);[.3,-.3].forEach(o=>{const st=new T.Mesh(new T.CylinderGeometry(.012,.012,.05,8),gold);st.rotation.x=H2;st.position.set(1.05,1.05+o,s*.052);doorPivot.add(st)})});
 sign('PATIL HOUSE',-6.4,2.62,9.17,0,1.9,.24,'#2a2118');sb(1.4,.025,.9,-6.4,.045,9.75,M(0x3a3026,0,1));
 // wall lanterns on the piers
 [-8.65,-4.5].forEach(x=>{const o=new T.Mesh(RB(.14,.26,.05,.02),gold);o.position.set(x,2.05,9.29);scene.add(o);sp(.075,lampG,x,2.05,9.34)});
 // planters with topiary
 [-8.45,-4.35].forEach(x=>{const g=new T.Group();g.position.set(x,0,9.9);scene.add(g);const p=new T.Mesh(new T.CylinderGeometry(.3,.24,.62,20),M(0x2e2a27,.1,.55));p.position.y=.31;p.castShadow=p.receiveShadow=true;g.add(p);const rm=new T.Mesh(new T.TorusGeometry(.3,.022,8,24),gold);rm.rotation.x=H2;rm.position.y=.62;g.add(rm);leafCluster(g,0,1.0,0,.38,.5,.38,34,.5,0,false);col(x,9.9,.3,.3,1.3)});
 // flowering beds along the facade: soil strip, leafy bushes, stems and real petalled flowers
 {const pts=[[-12.5,10.2],[-9.6,10.2],[-3.3,10.2],[-.8,10.2],[3,10.2],[7.6,10.2],[12.8,10.2]],PER=9,n=pts.length*PER;
  const soil=M(0x3b2a1c,0,1),stemM=M(0x3f7a3a,0,.8),leafM2=M(0x2f6b3a,0,.7,{side:T.DoubleSide});
  pts.forEach(([x,z])=>{const bed=new T.Mesh(new T.BoxGeometry(1.9,.2,.9),soil);bed.position.set(x,.1,z);bed.receiveShadow=true;scene.add(bed)});
  const stems=new T.InstancedMesh(new T.CylinderGeometry(.01,.013,1,5),stemM,n),
        leaves=new T.InstancedMesh(new T.SphereGeometry(.09,8,6),leafM2,n*3),
        petals=new T.InstancedMesh(new T.SphereGeometry(.035,8,6),new T.MeshStandardMaterial({roughness:.55}),n*6),
        hearts=new T.InstancedMesh(new T.SphereGeometry(.03,8,6),new T.MeshStandardMaterial({color:0xf0b43c,roughness:.6}),n),
        o=new T.Object3D(),c=new T.Color(),pal=['#f2a7b8','#f6d36b','#f4efe6','#e87b52','#c86bd0'];let k=0,l=0,p=0;
  pts.forEach(([x,z])=>{for(let i=0;i<PER;i++){const fx=x+(rnd()-.5)*1.6,fz=z+(rnd()-.5)*.6,h=.3+rnd()*.3;
    o.rotation.set((rnd()-.5)*.15,0,(rnd()-.5)*.15);o.position.set(fx,.2+h/2,fz);o.scale.set(1,h,1);o.updateMatrix();stems.setMatrixAt(k,o.matrix);
    const hy=.2+h;o.rotation.set(0,0,0);o.scale.set(.9,.9,.9);o.position.set(fx,hy,fz);o.updateMatrix();hearts.setMatrixAt(k,o.matrix);
    c.set(pal[(rnd()*pal.length)|0]);const col=c.clone();
    for(let j=0;j<6;j++){const a=j/6*Math.PI*2+rnd()*.3;o.position.set(fx+Math.cos(a)*.05,hy-.004,fz+Math.sin(a)*.05);o.rotation.set(0,-a,0);o.scale.set(1.3,.55,1);o.updateMatrix();petals.setMatrixAt(p,o.matrix);petals.setColorAt(p,col);p++}
    for(let j=0;j<3;j++){const a=rnd()*6.28;o.position.set(fx+Math.cos(a)*.09,.2+.06+rnd()*.12,fz+Math.sin(a)*.09);o.rotation.set((rnd()-.5)*.8,a,(rnd()-.5)*.8);o.scale.set(1.2,.35,.7);o.updateMatrix();leaves.setMatrixAt(l,o.matrix);l++}
    k++}});
  [stems,leaves,petals,hearts].forEach(m=>{m.frustumCulled=false;m.castShadow=false;scene.add(m)})}
})();

// ================= REALISM v4: plaster walls, skirting, natural home lighting =================
(function(){
 const nz=(g,w,h,a)=>{const d=g.getImageData(0,0,w,h),p=d.data;for(let i=0;i<p.length;i+=4){const n=(rnd()-.5)*a;p[i]+=n;p[i+1]+=n;p[i+2]+=n}g.putImageData(d,0,0)};
 // painted plaster: soft tonal clouds, roller stipple, faint trowel streaks (also drives the normal map)
 const plT=tex(coarse?512:1024,coarse?512:1024,(g,w,h)=>{g.fillStyle='#f5f2ed';g.fillRect(0,0,w,h);const k=w/1024;
  for(let i=0;i<70;i++){const x=rnd()*w,y=rnd()*h,rr=(70+rnd()*230)*k,gr=g.createRadialGradient(x,y,0,x,y,rr),l=rnd()>.5?255:170;gr.addColorStop(0,`rgba(${l},${l},${l},.07)`);gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(x-rr,y-rr,rr*2,rr*2)}
  for(let i=0;i<24000*k*k;i++){const l=rnd()>.5?255:95;g.fillStyle=`rgba(${l},${l},${l},${.03+rnd()*.05})`;g.fillRect(rnd()*w,rnd()*h,(1+rnd()*2.2)*k,(1+rnd()*2.2)*k)}
  for(let i=0;i<34;i++){const x=rnd()*w,y=rnd()*h,l=rnd()>.5?255:120;g.strokeStyle=`rgba(${l},${l},${l},.035)`;g.lineWidth=(6+rnd()*18)*k;g.beginPath();g.moveTo(x,y);g.quadraticCurveTo(x+(rnd()-.5)*200*k,y+(rnd()-.5)*200*k,x+(rnd()-.5)*320*k,y+(rnd()-.5)*320*k);g.stroke()}
  nz(g,w,h,7)},true);
 const plN=nmap(plT);
 [wallM,...paint].forEach(m=>{m.map=plT;m.normalMap=plN;m.normalScale.set(.5,.5);m.bumpMap=null;m.roughness=.96;m.metalness=0;m.envMapIntensity=.1;m.needsUpdate=true});
 // skirting boards on the inner walls too (broken at every doorway)
 const sk2=M(0xf4f1ea,0,.55,{envMapIntensity:.3}),sb=(w,h,d,x,y,z)=>{const o=new T.Mesh(new T.BoxGeometry(w,h,d),sk2);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;scene.add(o)};
 const seg=(a,b,gaps,fn)=>{let p=a;gaps.slice().sort((x,y)=>x-y).forEach(g=>{if(g-DHW>p)fn(p,g-DHW);p=g+DHW});if(b>p)fn(p,b)};
 [-1,1].forEach(s=>seg(-13.4,13.4,[-9,0,9],(a,b)=>sb(b-a,.14,.025,(a+b)/2,.07,s*.1125)));
 [-4.5,4.5].forEach(x=>[-1,1].forEach(s=>seg(-8.9,8.9,[-4.5,4.5],(a,b)=>sb(.025,.14,b-a,x+s*.1125,.07,(a+b)/2))));
 // ---------- lighting: warm, soft falloff, less flat fill ----------
 const LC=[0xffe2b8,0xf3f0ea,0xfff3e0,0xffd9a8,0xffd49a,0xffe8cc];
 scene.traverse(o=>{
  if(o.isPointLight&&Math.abs(o.position.y-2.9)<.01){const i=rooms.findIndex(q=>q.cx===o.position.x&&q.cz===o.position.z);if(i>=0){o.color.set(LC[i]);o.decay=1.6;o.distance=13;o.position.y=2.8;o.intensity*=1.15}}
  else if(o.isPointLight&&o.distance&&o.distance<8&&o.distance>5){o.decay=1.5;o.color.set(0xffd2a0)}
  if(o.isHemisphereLight&&o.groundColor&&o.groundColor.getHex()===0x3a2c20){o.intensity=.22;o.groundColor.set(0x4a382a)}});
 if(!coarse){
  // desk lamp over the Study desk and pendants over the Contact desk
  [[-10.0,1.15,-8.15,3.6,.9],[9,2.0,5.6,5.5,.8]].forEach(([x,y,z,d,i])=>{const l=new T.PointLight(0xffd2a0,i,d,1.5);l.position.set(x,y,z);scene.add(l)})}
 // softer, cleaner light shafts through the windows
 shaftM.opacity=.045;
})();

// ================= PLAYER AVATAR (rigged GLB, procedural animation) =================
// The GLB has no baked animations, so the walk / run / jump / carry motion is generated every frame from the skeleton.
// The walk is built from human gait data (hip, knee and foot curves), scaled by the *actual* movement speed, with a
// foot-to-floor solver for the pelvis height so the feet plant instead of skating. All angles are in character space
// (X = character's left, Y = up, Z = forward) and measured from true vertical/forward: the rig's rest pose (splayed legs,
// feet turned out 19 deg, shins tilted back, forearms pre-bent) is measured once at load and compensated.
const WALK_V=2.2,RUN_V=4.2;   // metres/second for walking / holding Shift (also drives the stride length)
function createAvatar(T,model){
 const Q=T.Quaternion,AX=new T.Vector3(1,0,0),AY=new T.Vector3(0,1,0),AZ=new T.Vector3(0,0,1);
 const qa=(ax,a)=>new Q().setFromAxisAngle(ax,a),rx=a=>qa(AX,a),ry=a=>qa(AY,a),rz=a=>qa(AZ,a),mul=(...l)=>l.reduce((a,b)=>a.clone().multiply(b));
 const root=new T.Group();root.add(model);
 const bones={};model.updateMatrixWorld(true);
 model.traverse(o=>{if(o.isBone){bones[o.name]=o;o.userData.qb=o.quaternion.clone();const w=new Q();o.getWorldQuaternion(w);o.userData.W=w;o.userData.Wi=w.clone().invert()}
  if(o.isMesh){o.frustumCulled=false;o.castShadow=true;o.receiveShadow=false}});
 const hips=bones.Hips,hipY=hips?hips.position.y:.94;if(hips){hips.userData.x0=hips.position.x}
 // ---- body proportions read from the skeleton (used by the foot-ground solver)
 const wp=n=>{const v=new T.Vector3();if(bones[n])bones[n].getWorldPosition(v);return v},dirOf=(a,b)=>wp(b).sub(wp(a));
 const L1=bones.LeftLeg?bones.LeftLeg.position.length():.423,L2=bones.LeftFoot?bones.LeftFoot.position.length():.43,
  hipOff=bones.LeftUpLeg?bones.LeftUpLeg.position.y:-.0107,aH=Math.max(.04,wp('LeftFoot').y||.083),   // aH = ankle height above the floor (rest pose)
  hipW=Math.abs(wp('LeftUpLeg').x)||.0723,FOOT_OUT=.328;   // FOOT_OUT: the rest pose has the feet turned out ~19 deg
 // The rest pose is not a neutral stance (legs splayed, shins tilted back, forearms pre-bent), so measure it once and
 // express every animation angle relative to true vertical / forward instead.
 const bind={};['Left','Right'].forEach(sd=>{
  const t=dirOf(sd+'UpLeg',sd+'Leg'),k=dirOf(sd+'Leg',sd+'Foot'),a=dirOf(sd+'Arm',sd+'ForeArm'),f=dirOf(sd+'ForeArm',sd+'Hand'),h=dirOf(sd+'Hand',sd+'HandMiddle1');
  bind[sd]={ts:Math.atan2(t.z,-t.y),tl:Math.atan2(t.x,-t.y),ss:Math.atan2(k.z,-k.y),sl:Math.atan2(k.x,-k.y),
   aDrop:Math.atan2(-a.y,Math.abs(a.x)),aSag:Math.atan2(a.z,Math.hypot(a.x,a.y)),fSag:Math.atan2(f.z,Math.hypot(f.x,f.y)),hSag:Math.atan2(h.z,Math.hypot(h.x,h.y))}});
 // ---- animation state
 const st={ph:0,walk:0,run:0,air:0,hold:0,thr:0,bt:0,v:0,sit:0,gs:0,sh:.6,tk:'',gc:0,pt:''};
 const ease=(v,t,k,dt)=>v+(t-v)*(1-Math.exp(-k*dt));
 const lerp=(a,b,k)=>a+(b-a)*k,sat=(x,a,b)=>Math.max(a,Math.min(b,x));
 let pose={},memo={};
 const I=new Q();
 function rcOf(b){if(!b||!b.isBone)return I;const n=b.name;if(pose[n])return pose[n];if(n in memo)return memo[n];return memo[n]=rcOf(b.parent)}
 function apply(){
  memo={};
  for(const n in pose){const b=bones[n];if(!b)continue;const p=b.parent,Rp=rcOf(p),Wp=p&&p.isBone?p.userData.W:I,Wpi=p&&p.isBone?p.userData.Wi:I;
   // local = Wp^-1 * Rp^-1 * Rc * Wp * qb   (Rc = rotation of the bone in character space)
   b.quaternion.copy(Wpi).multiply(Rp.clone().invert()).multiply(pose[n]).multiply(Wp).multiply(b.userData.qb)}
 }
 // ---- gait data: one full stride (left heel-strike -> next left heel-strike), sampled at 12 points,
 // joined with a periodic Catmull-Rom spline. Values are modelled on normal human walking / jogging kinematics.
 const TAU=Math.PI*2,D=Math.PI/180;
 const cyc=(k,t)=>{const n=k.length;t-=Math.floor(t);const f=t*n,i=Math.floor(f),u=f-i,p0=k[(i+n-1)%n],p1=k[i%n],p2=k[(i+1)%n],p3=k[(i+2)%n];
  return .5*((2*p1)+(-p0+p2)*u+(2*p0-5*p1+4*p2-p3)*u*u+(-p0+3*p1-3*p2+p3)*u*u*u)};
 const deg=a=>a.map(x=>x*D);
 const KW=deg([5,14,18,12,6,8,18,38,58,64,48,15]),     // knee flexion (walk): loading dip, then ~60 deg swing flexion
       FW=deg([18,3,0,0,0,-6,-22,-48,-38,-15,0,10]),    // foot pitch vs ground (+ = toes up): heel strike, flat, heel rise, toe-off
       KR=deg([22,40,45,30,22,45,70,95,105,95,70,40]),  // knee flexion (run)
       FR=deg([10,0,0,0,-8,-30,-50,-45,-30,-10,5,12]);  // foot pitch (run)
 // height the hip joint must have so the lowest point of the foot touches the floor
 const legPose=(t,rn,aA,mA,sh,kS)=>{const th=mA+aA*Math.cos(TAU*(t+sh)),k=lerp(cyc(KW,t),cyc(KR,t),rn)*kS,p=lerp(cyc(FW,t),cyc(FR,t),rn);return{th,k,p,ths:th-k}};
 const reach=g=>{const p=g.p,foot=p>=0?.057*Math.sin(p)+aH*Math.cos(p):aH*Math.cos(p)+.097*Math.sin(-p);   // heel .057 behind / ball .097 ahead of the ankle
  return L1*Math.cos(g.th)+L2*Math.cos(g.ths)+foot};
 function update(dt,s){
  // s: {speed:0..1, run:bool, air:bool, vy, hold:bool, pitch, v:(m/s, optional)}
  const sp=Math.min(1,s.speed||0),mv=sp>.05&&!s.air;
  const vT=s.v!=null?s.v:sp*(s.run?RUN_V:WALK_V);
  st.walk=ease(st.walk,mv?1:0,12,dt);
  st.run=ease(st.run,s.run&&mv?1:0,8,dt);
  st.air=ease(st.air,s.air?1:0,s.air?14:10,dt);
  st.hold=ease(st.hold,s.hold?1:0,9,dt);
  st.thr=Math.max(0,st.thr-dt*3.2);
  st.bt+=dt;
  // gesture clock: restarts whenever a (new) gesture begins, so hugs / dances play as timed sequences
  if(s.task&&!s.sit){if(st.gs<.08||s.task!==st.pt)st.gc=0;st.gc+=dt;st.pt=s.task}else if(st.gs<.02)st.pt='';
  st.sit=ease(st.sit,s.sit?1:0,7,dt);st.gs=ease(st.gs,(s.task&&!s.sit)?1:0,7,dt);if(s.sit)st.sh=s.sit;if(s.task)st.tk=s.task;
  if(mv)st.v=ease(st.v,vT,9,dt);
  const w=st.walk,rn=st.run,ar=st.air,hd=st.hold,idle=1-w;
  const v=Math.max(st.v,.35);
  // cadence (steps/s) and stride grow with speed like a real person: ~1.9 steps/s at 1.4 m/s, ~2.5 at 2.2 m/s
  const cW=1.15+.6*Math.min(v,2.6),cR=2.5+.1*Math.max(0,v-3),cad=lerp(cW,cR,rn);
  if(mv)st.ph=(st.ph+dt*cad*.5)%1;                       // st.ph = fraction of a full stride (two steps)
  const tL=st.ph,tR=(st.ph+.5)%1,bt=st.bt,breath=Math.sin(bt*1.7);
  const ks=sat(v/1.6,.25,1);                              // how pronounced the body motion is
  // ---- leg parameters (hip swing is sized from the step length so feet do not skate)
  const aA=lerp(.57*v/cW,sat(.21*v,.4,.75),rn),mA=lerp(.12,.2,rn),sh=lerp(.03,.1,rn),kS=lerp(.8+.2*sat(v/1.5,0,1),1,rn);
  const gL=legPose(tL,rn,aA,mA,sh,kS),gR=legPose(tR,rn,aA,mA,sh,kS);
  const sL=Math.sin(TAU*tL),cL=Math.cos(TAU*tL);
  // ---- couple motion (hug / slow dance): a slow weight shift from foot to foot. The follower / second hugger sways with the
  // opposite local sign, so that both bodies move in the same direction in the room (they face each other)
  const dk=st.tk,isD=dk==='dance'||dk==='dancef',isH=dk==='hug'||dk==='hugb',dn=(isD||isH)?st.gs*(1-w):0,gc=st.gc,
   dsg=(dk==='hugb'||dk==='dancef')?-1:1,dsn=dsg*(isD?Math.sin(TAU*gc*.5):isH?.5*Math.sin(TAU*gc*.2):0),dsw=dsn*(isD?.055:.016)*dn,dg=[];
  // ---- pelvis: yaw with the stride, drops on the swinging side, and shifts over the standing leg
  const hy=-cL*(.075+.03*rn)*ks*w,hr=sL*(.045+.01*rn)*ks*w+(isD?dsn*.05*dn:0),sway=sL*.022*ks*w+dsw,tilt=.04+.05*rn*w;
  pose.Hips=mul(ry(hy),rz(hr),rx(tilt*w));
  // ---- legs
  const legs=[['Left',-1,gL,tL],['Right',1,gR,tR]],tuckV=s.vy>0?1:.55;
  legs.forEach(([side,sg,g,t],i)=>{
   const bd=bind[side],e=-sg,airS=i?-.15:.55*tuckV,airK=i?.5*tuckV:1.1*tuckV;
   const swg0=lerp(g.th*w,airS,ar),k0=lerp(g.k*w+.03*idle,airK,ar),fr=Math.max(0,side==='Left'?-dsn:dsn),kd=isD?dn*(.3+.5*fr):dn*.08,swg=swg0+kd*.5,k=k0+kd,ths=swg-k;
   // lateral: feet land close to the midline (step width ~10 cm) and the leg angles in under the shifted pelvis
   const footX=e*(.09-.025*w*(1-ar)),phi=(footX-(e*hipW+sway))/(L1+L2);
   const yawT=hy,yawS=hy*.6;
   pose[side+'UpLeg']=mul(ry(yawT),rz(phi-bd.tl),rx(-(swg-bd.ts)));
   pose[side+'Leg']=mul(ry(yawS),rz(phi-bd.sl),rx(-(ths-bd.ss)));
   const p=lerp(g.p*w,-.4,ar)-(isD?fr*.3*dn:0),yawF=e*(lerp(.17,.12,w)-FOOT_OUT)+hy*.3,tt=((t%1)+1)%1;
   const tp=tt<.62?Math.max(p,0):p*sat((tt-.62)/.1,0,1);                       // toes stay on the floor while the heel lifts
   pose[side+'Foot']=mul(ry(yawF),rx(-p));
   pose[side+'ToeBase']=mul(ry(yawF),rx(-lerp(tp,p,ar)));dg[i]={th:swg,ths,p}});
  // ---- spine / head: shoulders counter-rotate against the pelvis, trunk leans slightly, head stays steady
  const lean=(.02+.1*rn)*w+(.05*ar)+breath*.012*idle,ys=cL*(.09+.04*rn)*ks*w;
  pose.Spine=mul(ry(ys*.35),rz(-.006*sL*ks*w),rx(lean*.35));
  pose.Spine1=mul(ry(ys*.7),rz(-.013*sL*ks*w),rx(lean*.7));
  pose.Spine2=mul(ry(ys),rz(-.02*sL*ks*w),rx(lean+breath*.01*idle));
  const look=Math.sin(bt*.45)*.06*idle;
  pose.Neck=mul(ry(ys*.1+look*.5),rx(lean*.4-(s.pitch||0)*.25));
  pose.Head=mul(ry(look),rx(-(s.pitch||0)*.35-.03*idle*breath));
  const hand=(side,H,g,ph0)=>{const sg=side==='Left'?-1:1,mvv=q=>1+.07*Math.sin(bt*.8+q+ph0),fingers={Index:[.28,.40,.28],Middle:[.40,.48,.32],Ring:[.50,.54,.34],Pinky:[.60,.56,.34]};
   let n0=0;for(const f in fingers){let prev=H;fingers[f].forEach((k,q)=>{prev=mul(prev,rz(sg*k*g*mvv(n0+q)));pose[side+'Hand'+f+(q+1)]=prev});n0++}
   let tp=mul(H,ry(sg*.25),rz(sg*.12));pose[side+'HandThumb1']=tp;tp=mul(tp,rz(sg*.3*g));pose[side+'HandThumb2']=tp;tp=mul(tp,rz(sg*.25*g));pose[side+'HandThumb3']=tp};
  // ---- arms: hang close to the body, swing opposite to the legs, elbows flex a little more on the forward swing
  const abd=.1,as=lerp(.26+.2*sat(v/2.2,0,1),.75,rn)*w*(1-hd);
  const armSw=(side,swg0,throwK,ph0)=>{
   const sg=side==='Left'?-1:1,bd=bind[side],swg=swg0+Math.sin(bt*1.15+ph0)*.015*idle,nrm=as>.001?swg0/as:0,hb=1-hd;
   const a=mul(rx(-(swg-bd.aSag*hb)),rz(sg*(Math.PI/2-abd-bd.aDrop)));
   const holdA=mul(rx(-.55),rz(sg*1.38)),flap=mul(rx(-.5),rz(sg*.75));
   let A=a.clone().slerp(holdA,hd);A=A.slerp(flap,ar*(1-hd));
   if(throwK>0)A=A.slerp(mul(rx(-1.7+1.1*(1-throwK)),rz(sg*1.0)),Math.min(1,throwK*1.4));
   pose[side+'Arm']=A;
   const wb=lerp(.1+.24*(1+nrm)*.5*sat(v/1.2,.5,1),1.25+.25*nrm,rn),bend=(.1*idle+wb*w)*hb+hd*1.25+ar*.3;
   const F=mul(rx(-(bend+(bd.aSag-bd.fSag)*hb)),ry(-sg*.45*hd),A);pose[side+'ForeArm']=F;
   const H=mul(F,rx(-((bd.fSag-bd.hSag)*hb-.03*hb)+swg*.1),rz(sg*.06));   // wrist straightened (the rest pose has the hand bent back), then a slight natural flexpose[side+'Hand']=H;
   hand(side,H,1+.45*hd,ph0);
  };
  armSw('Left',-cL*as-.03*w,0,0);armSw('Right',cL*as-.03*w,st.thr,2.1);
  // ---- activities layered on the walk pose: sitting (typing / reading) and standing gestures (wave / stretch / phone)
  if(st.sit>.002||st.gs>.002){
   const sK=st.sit,gK=st.gs,tk=st.tk,SG={Left:-1,Right:1},sl=(k,q,a)=>{pose[k]=(pose[k]||I).clone().slerp(q,a)};
   const arm=(side,fw,bend,ab,wr,k)=>{const sg=SG[side],bd=bind[side],A=mul(rx(-(fw-bd.aSag)),rz(sg*(Math.PI/2-ab-bd.aDrop))),F=mul(rx(-(bend+(bd.aSag-bd.fSag))),A),H=mul(F,rx(-(bd.fSag-bd.hSag)+wr),rz(sg*.06));
    sl(side+'Arm',A,k);sl(side+'ForeArm',F,k);pose[side+'Hand']=(pose[side+'Hand']||pose[side+'ForeArm']).clone().slerp(H,k);hand(side,pose[side+'Hand'],1,sg)};
   // arm2: like arm() but the forearm can also swing inward (yaw) - this is what lets an arm reach around a person's back
   const sm=x=>x*x*(3-2*x),arm2=(side,fw,ab,bend,yaw,wr,k,g)=>{const sg=SG[side],bd=bind[side],A=mul(rx(-(fw-bd.aSag)),rz(sg*(Math.PI/2-ab-bd.aDrop))),F=mul(ry(sg*yaw),rx(-(bend+(bd.aSag-bd.fSag))),A),H=mul(F,rx(-(bd.fSag-bd.hSag)+wr),rz(sg*.06));
    sl(side+'Arm',A,k);sl(side+'ForeArm',F,k);pose[side+'Hand']=(pose[side+'Hand']||pose[side+'ForeArm']).clone().slerp(H,k);hand(side,pose[side+'Hand'],g||1,sg)};
   if(sK>.002){const d=Math.asin(sat((st.sh-aH-L2)/L1,-.4,.95)),th=Math.PI/2-d,rd=tk==='read',ln=tk==='type'?.26:rd?.12:.08;
    ['Left','Right'].forEach(side=>{const bd=bind[side],e=side==='Left'?1:-1;
     sl(side+'UpLeg',mul(rz(-bd.tl+e*.05),rx(-(th-bd.ts))),sK);sl(side+'Leg',mul(rz(-bd.sl-e*.03),rx(bd.ss)),sK);
     const fo=mul(ry(e*(.1-FOOT_OUT)));sl(side+'Foot',fo,sK);sl(side+'ToeBase',fo,sK)});
    sl('Hips',rx(.06),sK);sl('Spine',rx(ln*.35),sK);sl('Spine1',rx(ln*.7),sK);sl('Spine2',rx(ln),sK);
    sl('Neck',rx(ln+.15),sK);sl('Head',rx(ln+(rd?.35:.12)+Math.sin(bt*.5)*.02),sK);
    const o=Math.sin(bt*13)*.05;
    if(rd){arm('Left',.55,1.9,.3,0,sK);arm('Right',.55,1.9,.3,0,sK)}else{arm('Left',.65,.75+o,.2,-.15,sK);arm('Right',.65,.75-o,.2,-.15,sK)}}
   if(gK>.002){
    if(tk==='wave')arm('Right',2.1,.9+Math.sin(bt*10)*.35,.55,0,gK);
    else if(tk==='stretch'){arm('Left',3,.15,.25,0,gK);arm('Right',3,.15,.25,0,gK);sl('Spine2',rx(-.14),gK);sl('Neck',rx(-.2),gK);sl('Head',rx(-.3),gK)}
    else if(tk==='phone'){arm('Right',.85,1.75,.15,0,gK);sl('Neck',rx(.2),gK);sl('Head',rx(.35),gK)}
    else if(tk==='sip'){arm('Right',.8,2.0,.15,0,gK);arm('Left',.5,1.6,.3,0,gK);sl('Head',rx(-.1),gK)}
    else if(tk==='stir'){arm('Right',.75,1.15+Math.sin(bt*6)*.3,.25,0,gK);arm('Left',.6,1.5,.35,0,gK);sl('Spine2',rx(.14),gK);sl('Head',rx(.3),gK)}
    else if(tk==='hug'||tk==='hugb'){
     // 1) arms open wide, 2) they wrap round the partner (left arm high over the shoulder blade, right arm low round the waist),
     // 3) the chest leans in and the head rests on the shoulder, 4) every few seconds a squeeze, a back stroke and a slow breath
     const u=sm(sat((gc-.5)/1.4,0,1)),pl=Math.pow(Math.max(0,Math.sin(gc*1.1-1.2)),6),br=Math.sin(gc*1.7)*.012,st1=Math.sin(gc*1.4)*.05*u;
     arm2('Left',lerp(.95,1.35,u)+st1,lerp(.8,.1,u),lerp(.4,.12,u),lerp(.05,.7,u)+.1*pl,0,gK,.7+.35*pl);
     arm2('Right',lerp(.9,1.1,u),lerp(.7,0,u),lerp(.4,.2,u),lerp(.05,.85,u)+.1*pl,0,gK,.7+.35*pl);
     sl('Spine',rx(.05*u),gK);sl('Spine1',mul(rz(-dsn*.02),rx(.1*u+br)),gK);sl('Spine2',mul(rz(-dsn*.025),rx(.14*u+br)),gK);
     sl('Neck',mul(ry(.2*u),rz(-.05*u)),gK);sl('Head',mul(ry(.45*u),rz(-.14*u),rx(.08*u-br)),gK)}
    else if(tk==='dance'||tk==='dancef'){
     // slow couple dance. Leader: both hands on the partner's waist. Follower: arms up round the leader's neck.
     // The body sways with the weight shift, the head rests close, the free foot lifts a little with every sway.
     const u=sm(sat((gc-.3)/1.0,0,1)),fol=tk==='dancef',br=Math.sin(gc*1.7)*.01,sw=dsn*dn;
     if(fol){arm2('Left',lerp(.9,1.45,u),lerp(.5,.12,u),lerp(.5,.3,u),lerp(.1,.75,u)+sw*.06,0,gK,.75);arm2('Right',lerp(.9,1.45,u),lerp(.5,.12,u),lerp(.5,.3,u),lerp(.1,.75,u)-sw*.06,0,gK,.75)}
     else{arm2('Left',lerp(.9,.88,u),lerp(.5,.02,u),lerp(.5,.3,u),lerp(.1,.5,u)+sw*.05,0,gK,.8);arm2('Right',lerp(.9,.8,u),lerp(.5,.04,u),lerp(.5,.33,u),lerp(.1,.45,u)-sw*.05,0,gK,.8)}
     sl('Spine',rx(.03*u),gK);sl('Spine1',mul(rz(-dsn*.03),rx(.05*u+br)),gK);sl('Spine2',mul(rz(-dsn*.04),rx(.07*u+br)),gK);
     sl('Neck',mul(ry((fol?.2:-.12)*u),rz((fol?-.06:.05)*u)),gK);sl('Head',mul(ry((fol?.35:-.22)*u+dsn*.04),rz((fol?-.13:.07)*u),rx((fol?.05:.1)*u-br)),gK)}
    else if(tk==='point'){arm('Right',1.55,.25,.5,0,gK)}
    else if(tk==='water'){arm('Right',1.0,.7,.2,.3,gK);sl('Spine2',rx(.2),gK);sl('Head',rx(.3),gK)}
    else if(tk==='laugh'){sl('Spine2',rx(-.1+Math.sin(bt*14)*.05),gK);sl('Head',rx(-.28),gK);arm('Right',.9,1.8,.15,0,gK*.6)}}
  }
  apply();
  // ---- hips: height from the foot/ground solver (feet always meet the floor), side sway over the standing leg
  if(hips){
   // Geometry alone would bob the pelvis ~10 cm at a brisk pace; real people keep it to ~5-7 cm (pelvic rotation, ankle rocker),
   // so ease the bob toward the stride's mean height. Feet stay within ~1-2 cm of the floor.
   let Hm=0;for(let q=0;q<6;q++){const u=q/12;Hm+=Math.max(reach(legPose(u,rn,aA,mA,sh,kS)),reach(legPose(u+.5,rn,aA,mA,sh,kS)))/6}
   const H=Math.max(reach(gL),reach(gR)),flight=rn*.04*(.5+.5*Math.cos(TAU*2*(tL-.43))),stand=L1+L2+aH;
   const walkH=Hm+lerp(.62,.8,rn)*(H-Hm)+flight,hj=lerp(lerp(stand,walkH,w),dn>.002?Math.max(reach(dg[0]),reach(dg[1])):stand,dn),jump=hj-.05*(s.vy>0?0:1);
   hips.position.y=lerp(hj,jump,ar)-hipOff+(breath*.004*idle);
   hips.position.x=(hips.userData.x0||0)+sway;
   if(st.sit>.002)hips.position.y=lerp(hips.position.y,st.sh-hipOff,st.sit)}
 }
 return{root,bones,update,throwIt(){st.thr=1},st};
}
let AV=null;const TPS={on:false,fp:false,cd:0,sd:1,so:.55},CAMD=3.1,SHO=.55,AIM=new V3(),rcc=new T.Raycaster(),lastP={x:0,z:0};
let mvAmt=0,mvV=0,mvRun=false,mvX=0,mvZ=-1,heading=Math.PI;
(function(){
 const msg=t=>{console.warn('[avatar] '+t);let d=document.getElementById('avmsg');if(!d){d=document.createElement('div');d.id='avmsg';d.style.cssText='position:fixed;left:50%;bottom:1rem;transform:translateX(-50%);z-index:60;max-width:90vw;padding:.6rem 1rem;border-radius:12px;background:rgba(120,20,20,.92);color:#fff;font:500 .8rem system-ui,sans-serif;text-align:center';document.body.appendChild(d);setTimeout(()=>d.remove(),15000)}d.textContent='Avatar not loaded: '+t+' (using first-person view)'};
 const loadScript=urls=>new Promise((ok,no)=>{const n=()=>{const u=urls.shift();if(!u)return no(new Error('could not download GLTFLoader (check internet / ad-blocker)'));const e=document.createElement('script');e.src=u;e.onload=()=>T.GLTFLoader?ok():n();e.onerror=n;document.head.appendChild(e)};n()});
 const tryLoad=paths=>new Promise((ok,no)=>{const n=()=>{const u=paths.shift();if(!u)return no(new Error('model file not found. Put it at avatar/model.glb next to index.html'));new T.GLTFLoader().load(u,ok,undefined,n)};n()});
 (async()=>{try{
  if(!T.GLTFLoader)await loadScript(['https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js','https://unpkg.com/three@0.128.0/examples/js/loaders/GLTFLoader.js','https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/examples/js/loaders/GLTFLoader.js']);
  let g;
  // opened by double-click (file://) browsers block fetching the .glb, so use the embedded copy avatar/model.js instead
  const fromJs=()=>new Promise((ok,no)=>{const load=()=>{try{const b=atob(window.AVATAR_GLB),u=new Uint8Array(b.length);for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i);new T.GLTFLoader().parse(u.buffer,'',ok,no)}catch(e){no(e)}};if(window.AVATAR_GLB)return load();const e=document.createElement('script');e.src='avatar/model.js';e.onload=load;e.onerror=()=>no(new Error('avatar/model.js not found'));document.head.appendChild(e)});
  if(location.protocol==='file:')g=await fromJs();else{try{g=await tryLoad(['avatar/model.glb','./avatar/model.glb','model.glb','avatar.glb','Avatar/model.glb'])}catch(e){g=await fromJs()}}
  g.scene.traverse(o=>{if(o.isMesh&&o.material){const ms=Array.isArray(o.material)?o.material:[o.material];ms.forEach(m=>{if(m.isMeshStandardMaterial){m.envMapIntensity=.55;if(m.metalness>.3)m.metalness=.1}})}});
  AV=createAvatar(T,g.scene);AV.root.visible=false;scene.add(AV.root);TPS.on=true;if(CIN.mode==='play'){cam.fov=62;cam.updateProjectionMatrix()}
 }catch(e){msg(e&&e.message||String(e))}})()})();
// ================= PHYSICS & PLAYER =================
const P={x:-9,z:6.2,y:0,vy:0};let yaw=Math.PI,pitch=0,started=false,panelOpen=false,held=null,holdD=1.8,tgt=null;
const K={},touch={mx:0,mz:0,jid:null,jx:0,jy:0,lid:null,lx:0,ly:0,mv:0,t0:0},hv=new V3(),fwd=new V3(),rc=new T.Raycaster(),bh=new T.BoxHelper(new T.Mesh(new T.BoxGeometry(1,1,1)),0x00d5ff);bh.visible=false;scene.add(bh);
function pushOut(p,rad,b){const cx=cl(p.x,b.x0,b.x1),cz=cl(p.z,b.z0,b.z1),dx=p.x-cx,dz=p.z-cz,d2=dx*dx+dz*dz;if(d2>=rad*rad)return;
 if(d2>1e-8){const d=Math.sqrt(d2),k=(rad-d)/d;p.x+=dx*k;p.z+=dz*k}else{const l=p.x-b.x0,rr=b.x1-p.x,t=p.z-b.z0,bt=b.z1-p.z,m=Math.min(l,rr,t,bt);if(m===l)p.x=b.x0-rad;else if(m===rr)p.x=b.x1+rad;else if(m===t)p.z=b.z0-rad;else p.z=b.z1+rad}}
function resolve(b,o,k){const p=b.m.position,hx=b.h[0]*b.s,hy=b.h[1]*b.s,hz=b.h[2]*b.s,dx=p.x-o.cx,dy=p.y-o.cy,dz=p.z-o.cz,ox=hx+o.hx-Math.abs(dx),oy=hy+o.hy-Math.abs(dy),oz=hz+o.hz-Math.abs(dz);
 if(ox<=0||oy<=0||oz<=0)return;
 if(oy<=ox&&oy<=oz){const sg=dy>0?1:-1;p.y+=sg*oy*k;if(sg>0){b.ground=true;if(b.v.y<0)b.v.y=b.v.y<-3?-b.v.y*.25:0}else if(b.v.y>0)b.v.y=0}
 else if(ox<=oz){p.x+=(dx>0?1:-1)*ox*k;b.v.x*=-.3}else{p.z+=(dz>0?1:-1)*oz*k;b.v.z*=-.3}}
const aabb=b=>{const p=b.m.position;return{cx:p.x,cy:p.y,cz:p.z,hx:b.h[0]*b.s,hy:b.h[1]*b.s,hz:b.h[2]*b.s}};
function physics(dt){
 for(let step=0;step<2;step++){const h=dt/2;
  bodies.forEach(b=>{if(b.held)return;const p=b.m.position;b.ground=false;b.v.y-=16*h;b.v.clampLength(0,16);p.addScaledVector(b.v,h);
   const hy=b.h[1]*b.s;if(p.y-hy<0){p.y=hy;if(b.v.y<0)b.v.y=b.v.y<-3?-b.v.y*.25:0;b.ground=true}
   for(let i=0;i<S.length;i++)resolve(b,S[i],1);
   if(Math.hypot(p.x-P.x,p.z-P.z)<.45+Math.max(b.h[0],b.h[2])*b.s&&hy*2<1.3&&p.y-hy<P.y+1.5){const dx=p.x-P.x,dz=p.z-P.z,d=Math.hypot(dx,dz)||1;b.v.x+=dx/d*5*h*8;b.v.z+=dz/d*5*h*8}});
  for(let i=0;i<bodies.length;i++)for(let j=i+1;j<bodies.length;j++){const a=bodies[i],c=bodies[j];if(a.held||c.held)continue;resolve(a,aabb(c),.5);resolve(c,aabb(a),.5)}
  bodies.forEach(b=>{if(b.held)return;if(b.ground){const f=Math.exp(-5*h);b.v.x*=f;b.v.z*=f}const p=b.m.position;if(p.y<-4||Math.abs(p.x)>58||Math.abs(p.z)>46){p.copy(b.home);b.v.set(0,0,0)}})}
}
function lookDir(){fwd.set(-Math.sin(yaw)*Math.cos(pitch),Math.sin(pitch),-Math.cos(yaw)*Math.cos(pitch))}
function movePlayer(dt){
 if(panelOpen||!started){mvAmt=0;mvV=0;return}
 let f=((K.KeyW||K.ArrowUp)?1:0)-((K.KeyS||K.ArrowDown)?1:0)-touch.mz,s=((K.KeyD||K.ArrowRight)?1:0)-((K.KeyA||K.ArrowLeft)?1:0)+touch.mx;
 const l=Math.hypot(f,s);if(l>1){f/=l;s/=l}
 const sp=(K.ShiftLeft||K.ShiftRight)?RUN_V:WALK_V,sy=Math.sin(yaw),cy2=Math.cos(yaw);
 mvAmt=Math.min(1,l);mvV=mvAmt*sp;mvRun=!!(K.ShiftLeft||K.ShiftRight);if(l>.05){mvX=-sy*f+cy2*s;mvZ=-cy2*f-sy*s}
 P.x+=(-sy*f+cy2*s)*sp*dt;P.z+=(-cy2*f-sy*s)*sp*dt;
 for(let i=0;i<S.length;i++){const b=S[i];if(b.y1>P.y+.2&&b.y0<P.y+1.5)pushOut(P,.32,b)}
 P.x=cl(P.x,-58,58);P.z=cl(P.z,-46,46);
 P.vy-=20*dt;P.y+=P.vy*dt;if(P.y<=0){P.y=0;P.vy=0}
 moving=Math.abs(f)+Math.abs(s)>.05&&P.y===0}
let moving=false,bob=0;
function grab(b){held=b;b.held=true;b.v.set(0,0,0);holdD=cl(b.m.position.distanceTo(AIM),1,2.6);hv.set(0,0,0)}
function drop(){const b=held;b.held=false;b.v.copy(hv).clampLength(0,9);held=null}
function throwIt(){if(!held)return;if(AV)AV.throwIt();const b=held;drop();lookDir();b.v.copy(fwd).multiplyScalar(11).add(new V3(0,1.5,0))}
function takeBook(ref){const m=ref.mesh;scene.attach(m);const p=m.position;m.rotation.set(0,Math.atan2(AIM.x-p.x,AIM.z-p.z),0);const hh=Math.max(ref.w,ref.d)/2*.9,b=body(m,[hh,ref.h/2,hh],ref.info,p.x,p.y,p.z);b.name=ref.info.t;grab(b)}
function act(){if(!started||panelOpen)return;if(held){drop();return}if(tgt){if(tgt.toggle)tgt.toggle();else if(tgt.m)grab(tgt);else if(tgt.book)takeBook(tgt);else readIt()}}
function readIt(){if(!held&&tgt&&tgt.toggle&&started&&!panelOpen){tgt.toggle();return}const t=held||tgt;if(t&&t.info&&started)openPanel(t.info)}
// panel
const pnl=$('#panel');
function openPanel(i){panelOpen=true;try{document.exitPointerLock()}catch(e){}
 pnl.innerHTML='<button id="px" aria-label="Close">✕</button><span class="tag">'+(i.tag||'')+'</span><h2>'+i.t+'</h2>'+(i.h||'')+(i.form?'<form id="cf" novalidate><label>Name<input id="fn"></label><label>Email<input id="fe" type="email"></label><label>Subject<input id="fs"></label><label>Message<textarea id="fm" rows="3"></textarea></label><button class="btn" type="submit">Send message</button><div id="fmsg" style="color:var(--cy);font-size:.85rem;min-height:1.2em"></div></form>':'')+(i.l?'<a class="btn" href="'+i.l+'"'+(i.dl?' download':' target="_blank" rel="noopener"')+'>'+i.lt+'</a>':'');
 pnl.hidden=false;$('#px').onclick=closePanel;$('#px').focus();
 const cf=$('#cf');if(cf)cf.onsubmit=e=>{e.preventDefault();const n=$('#fn').value.trim(),m=$('#fe').value.trim(),s=$('#fs').value.trim(),b=$('#fm').value.trim();if(!n||!/\S+@\S+\.\S+/.test(m)||!s||!b){$('#fmsg').textContent='Please fill every field with a valid email.';return}location.href='mailto:patilaniket2562m@gmail.com?subject='+encodeURIComponent(s)+'&body='+encodeURIComponent(b+'\n\n— '+n+' ('+m+')');$('#fmsg').textContent='Opening your email app…'}}
function closePanel(){panelOpen=false;pnl.hidden=true;lock()}
function lock(){if(coarse)return;try{const p=cv.requestPointerLock&&cv.requestPointerLock();if(p&&p.catch)p.catch(()=>{})}catch(e){}}
// input
let locked=false,down=null;
document.addEventListener('pointerlockchange',()=>{locked=document.pointerLockElement===cv});
cv.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse'||!started||panelOpen)return;if(e.button===2){throwIt();return}down={m:0,b:e.button};try{cv.setPointerCapture(e.pointerId)}catch(_){}if(!locked)lock()});
cv.addEventListener('pointermove',e=>{if(e.pointerType!=='mouse'||!started||panelOpen)return;if(locked||down){const mx=e.movementX||0,my=e.movementY||0;if(down)down.m+=Math.abs(mx)+Math.abs(my);if(locked||(down&&down.m>6)){yaw-=mx*.0022;pitch=cl(pitch-my*.0022,-1.4,1.4)}}});
cv.addEventListener('pointerup',e=>{if(down&&down.m<6&&down.b===0)act();down=null});
cv.addEventListener('contextmenu',e=>e.preventDefault());
addEventListener('wheel',e=>{if(held)holdD=cl(holdD-e.deltaY*.002,.8,3.6)},{passive:true});
addEventListener('keydown',e=>{if(/INPUT|TEXTAREA/.test(e.target.tagName))return;
 if(e.code==='Escape'){if(panelOpen)closePanel();return}
 if(!started)return;K[e.code]=1;
 if(e.code==='Space'){e.preventDefault();if(!panelOpen&&P.y===0)P.vy=6.2}
 if(e.code==='KeyE'&&!panelOpen)readIt();if(e.code==='KeyF')throwIt();if(e.code==='KeyL')fl.visible=!fl.visible;if(e.code==='KeyV'&&AV&&!panelOpen){TPS.fp=!TPS.fp;cam.fov=TPS.fp?72:62;cam.updateProjectionMatrix()}
 if(e.code.startsWith('Arrow'))e.preventDefault()});
addEventListener('keyup',e=>{delete K[e.code]});
// touch
const tz=$('#tz'),joy=$('#joy'),jk=joy.firstElementChild;
const joyShow=(x,y)=>{joy.style.left=(x-55)+'px';joy.style.top=(y-55)+'px';joy.style.bottom='auto';joy.classList.add('act')},joyMove=(a,b)=>{jk.style.transform='translate('+a*38+'px,'+b*38+'px)'},joyHide=()=>{joy.classList.remove('act');joy.style.left=joy.style.top=joy.style.bottom='';jk.style.transform=''};
tz.addEventListener('touchstart',e=>{for(const t of e.changedTouches){if(t.clientX<innerWidth*.45&&touch.jid===null){touch.jid=t.identifier;touch.jx=t.clientX;touch.jy=t.clientY;joyShow(t.clientX,t.clientY)}else if(touch.lid===null){touch.lid=t.identifier;touch.lx=t.clientX;touch.ly=t.clientY;touch.mv=0}}},{passive:true});
tz.addEventListener('touchmove',e=>{if(panelOpen)return;for(const t of e.changedTouches){if(t.identifier===touch.jid){touch.mx=cl((t.clientX-touch.jx)/45,-1,1);touch.mz=cl((t.clientY-touch.jy)/45,-1,1);joyMove(touch.mx,touch.mz)}else if(t.identifier===touch.lid){const dx=t.clientX-touch.lx,dy=t.clientY-touch.ly;touch.mv+=Math.abs(dx)+Math.abs(dy);yaw-=dx*.005;pitch=cl(pitch-dy*.005,-1.4,1.4);touch.lx=t.clientX;touch.ly=t.clientY}}},{passive:true});
const tend=e=>{for(const t of e.changedTouches){if(t.identifier===touch.jid){touch.jid=null;touch.mx=touch.mz=0;joyHide()}if(t.identifier===touch.lid){if(touch.mv<10)act();touch.lid=null}}};
tz.addEventListener('touchend',tend,{passive:true});tz.addEventListener('touchcancel',tend,{passive:true});
$('#bRead').onclick=readIt;$('#bThrow').onclick=throwIt;$('#bJump').onclick=()=>{if(P.y===0)P.vy=6.2};
// ================= CINEMATIC ENTRANCE =================
const CIN={mode:'idle',u:0,curve:null};document.body.classList.add('intro');
const smooth=x=>x*x*(3-2*x),L0=new V3(-7,2,0),L1=new V3(-6.4,1.7,5),L2=new V3(-6.4,1.65,-6),tmpL=new V3();
CIN.update=(t,dt)=>{
 if(CIN.mode==='idle'){const a=Math.sin(t*.12)*.6;cam.position.set(36*Math.sin(a),9+Math.sin(t*.2),8+36*Math.cos(a));cam.lookAt(L0);if(cam.fov!==55){cam.fov=55;cam.updateProjectionMatrix()}}
 else if(CIN.mode==='enter'){CIN.u=Math.min(1,CIN.u+dt/10);const u=CIN.u;cam.position.copy(CIN.curve.getPointAt(smooth(u)));
  tmpL.copy(u<.6?L0.clone().lerp(L1,smooth(u/.6)):L1.clone().lerp(L2,smooth((u-.6)/.4)));cam.lookAt(tmpL);
  doorPivot.rotation.y=1.65*smooth(cl((u-.35)/.25,0,1));cam.fov=55+17*smooth(cl((u-.5)/.5,0,1));cam.updateProjectionMatrix();if(u>=1)CIN.end()}};
CIN.begin=()=>{if(CIN.mode!=='idle')return;const s=cam.position.clone();CIN.curve=new T.CatmullRomCurve3([s,new V3(-6.4+(s.x+6.4)*.35,6.5,30),new V3(-6.4,3,20),new V3(-6.4,1.9,13.5),new V3(-6.4,1.65,10),new V3(-6.4,1.65,8.2),new V3(-6.4,1.65,6.6)]);CIN.mode='enter';CIN.u=0;$('#start').hidden=true};
CIN.end=()=>{CIN.mode='play';FD.a=1;FD.open=true;FD.sync();P.x=-6.4;P.z=6.6;P.y=0;P.vy=0;yaw=0;pitch=0;cam.fov=TPS.on&&!TPS.fp?62:72;cam.updateProjectionMatrix();started=true;TPS.cd=0;document.body.classList.remove('intro');if(CIN.after!=null){[P.x,P.z,yaw]=TP[CIN.after];pitch=0;P.y=0}CIN.after=null;heading=yaw+Math.PI;lock()};
addEventListener('pointerdown',()=>{if(CIN.mode==='enter')CIN.u=Math.max(CIN.u,.999)});
const SITE=$('#site');
window.HOUSE={enter(i){if(CIN.mode!=='idle')return;CIN.after=i;window.SP=false;SITE.classList.add('out');setTimeout(()=>{SITE.style.display='none'},1700);CIN.begin()},
 home(){if(held)drop();panelOpen=false;pnl.hidden=true;try{document.exitPointerLock()}catch(e){}started=false;CIN.mode='idle';FD.a=0;FD.open=false;FD.sync();document.body.classList.add('intro');SITE.style.display='block';SITE.offsetWidth;SITE.classList.remove('out');SITE.scrollTop=0}};
// HUD
const tele=$('#tele'),TP=[[-9,6.2,Math.PI],[-9,-1.2,0],[0,-3.2,0],[9,-1.4,0],[0,1.5,Math.PI],[9,1.6,Math.PI]],order=[3,0,1,2,4,5];
const tabs={};let lastRoom='';order.forEach(i=>{const b=document.createElement('button');b.textContent=rooms[i].n;b.style.setProperty('--d',ACC[i]);b.onclick=()=>{[P.x,P.z,yaw]=TP[i];pitch=0;P.y=0;if(held)drop()};tele.appendChild(b);tabs[i]=b});const gb=document.createElement('button');gb.textContent='Garden';gb.style.setProperty('--d','#8fd6a6');gb.onclick=()=>{[P.x,P.z,yaw]=[-6.4,14.5,0];pitch=0;P.y=0;if(held)drop()};tele.appendChild(gb);const hb=document.createElement('button');hb.textContent='← Website';hb.onclick=()=>HOUSE.home();tele.appendChild(hb);
const mm=$('#mm'),mc=mm.getContext('2d');
function drawMM(){mc.clearRect(0,0,140,94);rooms.forEach((rm,i)=>{mc.fillStyle='rgba(66,133,255,.28)';mc.strokeStyle='rgba(255,255,255,.35)';mc.fillRect((rm.cx-4.5+13.5)*5+2,(rm.cz-4.5+9)*5+2,43,43);mc.strokeRect((rm.cx-4.5+13.5)*5+2,(rm.cz-4.5+9)*5+2,43,43)});
 const px=cl((P.x+13.5)*5+2,2,138),pz=cl((P.z+9)*5+2,2,92);mc.fillStyle='#00d5ff';mc.beginPath();mc.arc(px,pz,3.5,0,6.3);mc.fill();mc.strokeStyle='#00d5ff';mc.beginPath();mc.moveTo(px,pz);mc.lineTo(px-Math.sin(yaw)*9,pz-Math.cos(yaw)*9);mc.stroke()}
const roomEl=$('#room'),tipEl=$('#tip'),cross=$('#cross');
function roomAt(){if(Math.abs(P.x)>13.5||Math.abs(P.z)>9)return 'Garden';const c=P.x<-4.5?0:P.x<4.5?1:2,rw=P.z<0?0:1;return rooms[[0,1,2,3,4,5][rw*3+c]].n}
function resize(){r.setSize(innerWidth,innerHeight,false);if(comp)comp.setSize(innerWidth,innerHeight);cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix()}
resize();addEventListener('resize',resize);
function camRay(pv,rt,so){const u=new V3().addScaledVector(fwd,-CAMD).addScaledVector(rt,so),L=u.length();u.divideScalar(L);rcc.set(pv,u);rcc.far=L+.3;const h=rcc.intersectObjects(solids)[0];return{u,L,w:h?Math.max(.3,Math.min(L,h.distance-.28)):L}}
function thirdPerson(dt){
 const sy=Math.sin(yaw),cy2=Math.cos(yaw),pv=new V3(P.x,P.y+1.85,P.z),rt=new V3(cy2,0,-sy);
 // swap shoulders when a wall is in the way on the current side
 const a=camRay(pv,rt,TPS.sd*SHO);if(a.w<a.L-.05){const b=camRay(pv,rt,-TPS.sd*SHO);if(b.w>a.w+.5)TPS.sd=-TPS.sd}
 TPS.so+=(TPS.sd*SHO-TPS.so)*(1-Math.exp(-7*dt));
 const c=camRay(pv,rt,TPS.so),u=c.u,L=c.L,want=c.w;
 TPS.cd=want<TPS.cd?want:TPS.cd+(want-TPS.cd)*(1-Math.exp(-3.2*dt));
 cam.position.copy(pv).addScaledVector(u,TPS.cd);
 const inside=Math.abs(P.x)<13.4&&Math.abs(P.z)<8.9;cam.position.y=cl(cam.position.y,.22,inside?3.05:10);
 AIM.copy(pv).addScaledVector(rt,TPS.so/L*TPS.cd)}
// ================= NPCs "SVIA" and "Aniket" (wife and husband): own daily routines + AI chat =================
// COUPLE LIFE: SVIA and Aniket love each other, have their own feelings (hunger, energy, missing each other, joy) and free will.
// They roam the whole house on their own, and every so often decide together to share a moment (chai, cooking, coding, reading, dancing, hugs, plans, tidying, goodnight) and talk to each other.
// Each of them wanders, codes on the laptop in the Study, reads a book in the Library, checks the phone and stretches.
// They take turns at the two stations, sometimes walk over to each other, and chat with the visitor (real AI via your own server).
const NPCS=[];
const NPCU=(function(){
 const U={voice:true,active:null,bubOwner:null,bubT:0,tagD:1e9,tagOwner:null,tagText:'',tagY:2.1,logOwner:null,hintFor:null};
 const pick=a=>a[Math.floor(rnd()*a.length)];
 U.bub=document.createElement('div');U.bub.id='npcBub';document.body.appendChild(U.bub);
 U.tag=document.createElement('div');U.tag.id='npcTag';document.body.appendChild(U.tag);
 const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
 const box=document.createElement('div');box.id='npcChat';box.hidden=true;
 box.innerHTML='<header><div class="av">A</div><div><b id="ncN">SVIA</b><small id="ncS"></small></div><button id="ncV" title="Voice on/off">\uD83D\uDD0A</button><button id="ncX" aria-label="Close">\u2715</button></header><div id="ncLog"></div><div id="ncChips"></div><form id="ncF" autocomplete="off">'+(SR?'<button type="button" id="ncM" title="Speak">\uD83C\uDFA4</button>':'')+'<input id="ncI" placeholder="Ask me anything\u2026" enterkeyhint="send"><button>Send</button></form>';
 document.body.appendChild(box);
 U.box=box;U.hint=document.createElement('button');U.hint.id='npcHint';U.hint.hidden=true;document.body.appendChild(U.hint);
 U.log=box.querySelector('#ncLog');U.inp=box.querySelector('#ncI');U.chips=box.querySelector('#ncChips');
 const draw=(who,t)=>{const m=document.createElement('div');m.className='m '+who;m.textContent=t;U.log.appendChild(m);U.log.scrollTop=U.log.scrollHeight;return m};
 U.add=(who,t)=>{const e=[who,t],m=draw(who,t);m._e=e;U.logOwner.msgs.push(e);return m};
 U.bind=o=>{box.querySelector('#ncN').textContent=o.cfg.name;{const av=box.querySelector('.av');if(av)av.textContent=o.cfg.name[0]}box.querySelector('#ncS').textContent=o.cfg.sub;U.chips.innerHTML=o.cfg.chips.map(c=>'<button type="button">'+c+'</button>').join('');
  if(U.logOwner!==o){U.logOwner=o;U.log.innerHTML='';o.msgs.forEach(e=>draw(e[0],e[1]))}};
 U.hearts=k=>{const r=U.bub.getBoundingClientRect(),bx0=r.width?r.left+r.width/2:innerWidth/2,by0=r.width?r.bottom:innerHeight/2;
  for(let i=0;i<(k||6);i++){const h=document.createElement('i');h.className='npcHeart';h.textContent=pick(['\u2764\uFE0F','\uD83D\uDC96','\uD83D\uDC95','\uD83D\uDC97']);h.style.left=(bx0+(rnd()-.5)*90)+'px';h.style.top=by0+'px';h.style.animationDelay=(i*.12)+'s';document.body.appendChild(h);setTimeout(()=>h.remove(),2600+i*120)}};
 U.speak=(o,t)=>{if(!U.voice||!window.speechSynthesis)return;try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(t.replace(/[\u{1F300}-\u{1FAFF}\u2600-\u27BF]/gu,'')),vs=speechSynthesis.getVoices(),male=o.cfg.male,
   rx=male?/(^|\s)male\b|david|mark|guy|ryan|james|daniel|alex|rishi|ravi|prabhat|george|fred/i:/female|zira|samantha|aria|jenny|susan|google uk english female/i;
   u.voice=vs.find(v=>/en/i.test(v.lang)&&rx.test(v.name))||vs.find(v=>/^en/i.test(v.lang))||null;u.rate=1.02;u.pitch=male?.75:1.15;speechSynthesis.speak(u)}catch(e){}};
 U.say=(o,t,ms,mute)=>{U.bubOwner=o;U.bub.textContent=t;U.bub.classList.add('on');U.bubT=ms||5000;if(!mute)U.speak(o,t)};
 box.querySelector('#ncF').onsubmit=e=>{e.preventDefault();const v=U.inp.value;U.inp.value='';if(U.active)U.active.ask(v)};
 U.chips.onclick=e=>{if(e.target.tagName==='BUTTON'&&U.active)U.active.ask(e.target.textContent)};
 box.querySelector('#ncV').onclick=e=>{U.voice=!U.voice;e.currentTarget.textContent=U.voice?'\uD83D\uDD0A':'\uD83D\uDD07';if(!U.voice&&window.speechSynthesis)speechSynthesis.cancel()};
 const mic=box.querySelector('#ncM');if(mic&&SR)mic.onclick=()=>{try{const r=new SR();r.lang='en-IN';r.interimResults=false;r.onresult=e=>{if(U.active)U.active.ask(e.results[0][0].transcript)};r.onstart=()=>mic.classList.add('on');r.onend=()=>mic.classList.remove('on');r.start()}catch(e){}};
 box.querySelector('#ncX').onclick=()=>{if(U.active)U.active.stopTalk()};
 U.hint.onclick=()=>{if(U.hintFor)U.hintFor.startTalk()};
 addEventListener('keydown',e=>{if(!U.active&&e.code==='KeyT'&&!/INPUT|TEXTAREA/.test(e.target.tagName)){const c=NPCS.filter(o=>o.near).sort((a,b)=>a.dist-b.dist)[0];if(c){e.preventDefault();c.startTalk()}}else if(U.active&&e.code==='Escape'){e.stopImmediatePropagation();U.active.stopTalk()}},true);
 return U})();
const NPV=new V3();
function npcProj(o,y,el,d){NPV.set(o.x,y,o.z).project(cam);const vis=NPV.z<1&&d<10;el.style.opacity=vis?'':'0';el.style.left=((NPV.x*.5+.5)*innerWidth)+'px';el.style.top=((-NPV.y*.5+.5)*innerHeight)+'px'}
// shared props: laptop on the study desk and a chair at the library table
(function(){
 const lap=new T.Group();
 {const bs=new T.Mesh(new T.BoxGeometry(.32,.015,.22),M(0x9aa3ad,.9,.3)),sc=new T.Mesh(new T.BoxGeometry(.32,.21,.012),M(0x15191f,.5,.4)),gl=new T.Mesh(new T.PlaneGeometry(.29,.18),new T.MeshBasicMaterial({map:screenTex('Home office \u00b7 coding',['npm run build \u2713','git commit -m "ship it"','deploying\u2026','all tests passed']),toneMapped:false}));
  bs.position.y=.0075;sc.position.set(0,.12,-.1);sc.rotation.x=-.25;gl.position.set(0,.121,-.092);gl.rotation.x=-.25;lap.add(bs,sc,gl);lap.position.set(-9,.8,-7.5);scene.add(lap)}
 bx(.5,.08,.5,0,.41,6.15,fabric,false);bx(.5,.5,.06,0,.49,6.42,fabric2,false);[[-.2,-.2],[.2,-.2],[-.2,.2],[.2,.2]].forEach(([a,b])=>cy(.025,.025,.41,a,0,6.15+b,steel,8));
 // couple seats: two more chairs and laptops at the Study desk, two more chairs at the Library table
 [-9.9,-8.1].forEach(x=>{bx(.5,.08,.5,x,.45,-6.8,fabric,false);bx(.7,.8,.1,x,.5,-6.4,fabric,false);cy(.05,.05,.45,x,0,-6.8,steel,8);const l2=lap.clone();l2.position.set(x,.8,-7.5);scene.add(l2)});
 [-.9,.9].forEach(x=>{bx(.5,.08,.5,x,.41,6.15,fabric,false);bx(.5,.5,.06,x,.49,6.42,fabric2,false);[[-.2,-.2],[.2,-.2],[-.2,.2],[.2,.2]].forEach(([a,b])=>cy(.025,.025,.41,x+a,0,6.15+b,steel,8))});
})();
const FACTS_A=['Aniket built this whole 3D house in the browser with Three.js. No game engine!','Square Chat, one of Aniket\u2019s projects, uses WebRTC for live calls.','Aniket does ASP.NET, React and Flutter, so he can ship the backend, web and mobile parts himself.','I may be biased, but my husband writes really tidy code.'];
const FACTS_N=['I built this whole 3D house in the browser with Three.js. No game engine!','Square Chat, one of my projects, uses WebRTC for live calls.','I do ASP.NET, React and Flutter, so I can ship the backend, web and mobile parts myself.','SVIA says my code is tidy. She is biased, but I will take it.'];
const API_URL=String(window.NPC_API||'').trim();
function makeNPC(CFG){
 const NAME=CFG.name,API=API_URL,PN=CFG.male?'his':'her';
 const R=.38,CS=.25,X0=-13.2,Z0=-8.7,NX=Math.round(26.4/CS),NZ=Math.round(17.4/CS),WV=CFG.speed||1.35;
 const U=NPCU;
 const n={av:null,x:0,z:0,h:0,v:0,path:[],wait:CFG.wait0||1.5,grid:null,near:false,talk:false,chk:0,cx:0,cz:0,last:-1e9,mode:'idle',st:null,stk:'',tr:null,timer:0,gest:'',gT:0,tour:null,hist:[],onArrive:null,tag:'',who:'',seated:false,hintOK:false,d:99,pc:10+Math.random()*20,duo:null,tk:25+Math.random()*30,F:{love:.85,joy:.7,energy:1,hunger:.12+Math.random()*.25,lonely:.1}};
 const msgs=[];
 try{n.who=localStorage.getItem('ava_visitor')||''}catch(e){}
 let self;
 const other=()=>NPCS.find(o=>o!==self);
 const say=(t,ms,mute)=>U.say(self,t,ms,mute),bubble=(t,ms)=>U.say(self,t,ms);
 const idx=(i,j)=>j*NX+i,ci=x=>cl(Math.floor((x-X0)/CS),0,NX-1),cj=z=>cl(Math.floor((z-Z0)/CS),0,NZ-1),pick=a=>a[Math.floor(rnd()*a.length)],ang=(a,b)=>Math.atan2(Math.sin(b-a),Math.cos(b-a));
 const free=(x,z)=>!n.grid[idx(ci(x),cj(z))];
 const book=new T.Group();{book.add(new T.Mesh(new T.BoxGeometry(.3,.022,.22),M(0x7a2f2f,0,.7)),new T.Mesh(new T.BoxGeometry(.28,.026,.2),M(0xf2ead6,0,.9)));book.rotation.x=-1;book.visible=false}
 const ST={
  work:{sx:-9,sz:-6.78,h:Math.PI,hj:.62,ax:-8.2,az:-6.8,task:'type',txt:'\uD83D\uDCBB Coding',act:'working on '+PN+' laptop at the desk in the Study'},
  read:{sx:0,sz:6.12,h:Math.PI,hj:.58,ax:1.1,az:6.1,task:'read',txt:'\uD83D\uDCD6 Reading',act:'reading a book at the table in the Library'},
  cwork0:{sx:-9.9,sz:-6.78,h:Math.PI,hj:.62,ax:-10.8,az:-6.6,task:'type',txt:'\uD83D\uDCBB Coding together',act:'coding next to '+CFG.partner+' in the Study'},
  cwork1:{sx:-8.1,sz:-6.78,h:Math.PI,hj:.62,ax:-7.2,az:-6.6,task:'type',txt:'\uD83D\uDCBB Coding together',act:'coding next to '+CFG.partner+' in the Study'},
  cread0:{sx:-.9,sz:6.12,h:Math.PI,hj:.58,ax:-1.9,az:6.1,task:'read',txt:'\uD83D\uDCD6 Reading together',act:'reading next to '+CFG.partner+' in the Library'},
  cread1:{sx:.9,sz:6.12,h:Math.PI,hj:.58,ax:1.9,az:6.1,task:'read',txt:'\uD83D\uDCD6 Reading together',act:'reading next to '+CFG.partner+' in the Library'}};
 const TOUR=CFG.tour;
 // ---------- navigation grid + A*
 function nearestFree(x,z){if(free(x,z))return[x,z];for(let r=.25;r<4;r+=.25)for(let a=0;a<16;a++){const px=x+Math.cos(a/16*6.283)*r,pz=z+Math.sin(a/16*6.283)*r;if(Math.abs(px)<13&&Math.abs(pz)<8.4&&free(px,pz))return[px,pz]}return[x,z]}
 function build(){const ds=new Set(DR.map(d=>d.e)),g=new Uint8Array(NX*NZ);
  for(let j=0;j<NZ;j++)for(let i=0;i<NX;i++){const x=X0+(i+.5)*CS,z=Z0+(j+.5)*CS;
   for(const o of S){if(ds.has(o)||o.y1<.25||o.y0>1.6)continue;const dx=x-cl(x,o.x0,o.x1),dz=z-cl(z,o.z0,o.z1);if(dx*dx+dz*dz<R*R){g[idx(i,j)]=1;break}}}
  n.grid=g;const f=nearestFree(CFG.spawn[0],CFG.spawn[1]);n.x=f[0];n.z=f[1];for(const k in ST){const a=nearestFree(ST[k].ax,ST[k].az);ST[k].apx=a[0];ST[k].apz=a[1]}}
 const los=(a,b)=>{const d=Math.hypot(b[0]-a[0],b[1]-a[1]),k=Math.max(1,Math.ceil(d/(CS*.5)));for(let q=0;q<=k;q++)if(!free(a[0]+(b[0]-a[0])*q/k,a[1]+(b[1]-a[1])*q/k))return false;return true};
 function smooth(p){if(p.length<3)return p;const o=[p[0]];let a=0;while(a<p.length-1){let b=p.length-1;while(b>a+1&&!los(p[a],p[b]))b--;o.push(p[b]);a=b}return o}
 function astar(sx,sz,tx,tz){const g=n.grid,s=idx(ci(sx),cj(sz)),t=idx(ci(tx),cj(tz));if(g[t])return null;
  const N=NX*NZ,gs=new Float32Array(N).fill(1e9),f=new Float32Array(N),par=new Int32Array(N).fill(-1),dn=new Uint8Array(N),open=[s],tx_=t%NX,tj=(t/NX)|0,hf=k=>Math.hypot((k%NX)-tx_,((k/NX)|0)-tj);gs[s]=0;
  while(open.length){let bi=0;for(let q=1;q<open.length;q++)if(f[open[q]]<f[open[bi]])bi=q;const c=open[bi];open[bi]=open[open.length-1];open.pop();if(c===t)break;if(dn[c])continue;dn[c]=1;
   const x=c%NX,y=(c/NX)|0;
   for(let dj=-1;dj<=1;dj++)for(let di=-1;di<=1;di++){if(!di&&!dj)continue;const a=x+di,b=y+dj;if(a<0||b<0||a>=NX||b>=NZ)continue;const k=idx(a,b);if(g[k])continue;if(di&&dj&&(g[idx(x+di,y)]||g[idx(x,y+dj)]))continue;
    const ng=gs[c]+(di&&dj?1.414:1);if(ng<gs[k]){gs[k]=ng;par[k]=c;f[k]=ng+hf(k);open.push(k)}}}
  if(s!==t&&par[t]<0)return null;const p=[];for(let k=t;k!==-1;k=par[k])p.push([X0+((k%NX)+.5)*CS,Z0+(((k/NX)|0)+.5)*CS]);p.reverse();p.shift();return smooth([[sx,sz]].concat(p)).slice(1)}
 // ---------- daily routine
 function wander(){for(let q=0;q<25;q++){const x=X0+1+rnd()*(26.4-2),z=Z0+1+rnd()*(17.4-2);if(!free(x,z)||Math.hypot(x-n.x,z-n.z)<3.5)continue;const p=astar(n.x,n.z,x,z);if(p&&p.length){n.path=p;n.mode='walk';n.onArrive=()=>{n.mode='idle';n.wait=2+rnd()*5};return}}n.wait=1}
 function station(k){if(NPCS.some(o=>o!==self&&o.stk===k))return wander();const s=ST[k],p=astar(n.x,n.z,s.apx,s.apz);if(!p){n.wait=2;return}n.st=s;n.stk=k;n.path=p;n.mode='walk';n.onArrive=()=>{n.mode='sitIn';n.tr={t:0,fx:n.x,fz:n.z,tx:s.sx,tz:s.sz}}}
 function plan(){const pr=other(),F=n.F,h=new Date().getHours();
  // missing the partner: go and be near them
  if(pr&&pr.ready&&!pr.seated&&Math.hypot(pr.x-n.x,pr.z-n.z)>3.2&&rnd()<(CFG.together||0)+F.lonely*.55){const f=nearestFree(pr.x+.9,pr.z+.4),p=astar(n.x,n.z,f[0],f[1]);if(p&&p.length){n.path=p;n.mode='walk';n.onArrive=()=>{n.mode='idle';n.wait=4+rnd()*6;F.lonely=Math.max(0,F.lonely-.25)};return}}
  if(F.hunger>.72&&rnd()<.7)return snack(false);
  if(F.energy<.28&&rnd()<.6){n.gest='stretch';n.gT=5;n.wait=6;F.energy=Math.min(1,F.energy+.2);return}
  // free will: pick whatever feels right, anywhere in the house
  const o=[['wander',.2],['room',.24],['work',h>=9&&h<19?.24:.08],['read',h>=17||h<9?.22:.14],['phone',.07],['stretch',.05],['sip',.1],['water',.07]];let t=0;o.forEach(q=>t+=q[1]);let r=rnd()*t,kd='wander';for(const q of o){if((r-=q[1])<=0){kd=q[0];break}}
  if(kd==='work')return station('work');if(kd==='read')return station('read');if(kd==='room')return visitRoom();if(kd==='sip')return snack(true);if(kd==='water')return waterPlant();
  if(kd==='phone'){n.gest='phone';n.gT=9}else if(kd==='stretch'){n.gest='stretch';n.gT=5}else return wander();n.wait=n.gT+1}
 function actText(){if(n.duo&&n.duo.k==='stand'&&n.duo.act)return n.duo.act;if(n.mode==='sit'||n.mode==='sitIn')return n.st.act;if(n.mode==='tour')return 'guiding a visitor around the house';if(n.gT>0&&n.gest==='phone')return 'checking '+PN+' phone';if(n.gT>0&&n.gest==='stretch')return 'stretching';if(n.gT>0&&n.gest==='sip')return 'having a cup of chai';if(n.gT>0&&n.gest==='water')return 'watering the plants';return n.mode==='walk'?'walking around the house':'relaxing at home'}
  // ---------- feelings, free will and couple helpers
 const GT={phone:'\uD83D\uDCF1 On '+PN+' phone',stretch:'\uD83D\uDE46 Stretching',sip:'\u2615 Having chai',water:'\uD83E\uDEB4 Watering plants'};
 const ROOMQ={'Study':['The Study is where ideas become code.'],'Lab':['The Lab always smells like fresh ideas.'],'Gallery':['Every project on this wall has a story.'],'Living room':['The best spot for a lazy evening.'],'Library':['So peaceful in here.'],'Contact':['Anyone could walk in and say hello here.']};
 const PL=[[-12.2,7.4],[-5.6,7.4],[-5.9,-7.3],[5.9,1.4],[12.3,-7.5],[12.3,7.5]];
 function feel(dt){const F=n.F,pr=other();let dp=99;if(pr&&pr.ready)dp=Math.hypot(pr.x-n.x,pr.z-n.z);
  F.hunger=Math.min(1,F.hunger+dt/260);F.energy=cl(F.energy+(n.seated?dt/170:n.v>.1?-dt/420:-dt/700),0,1);
  F.lonely=cl(F.lonely+(dp<3.2?-dt/25:dt/95),0,1);if(dp<2)F.love=Math.min(1,F.love+dt/900);
  const tj=.55+.4*F.love*(1-F.lonely)-(F.hunger>.7?.2:0)-(F.energy<.25?.15:0);F.joy+=(tj-F.joy)*Math.min(1,dt/20)}
 function moodTxt(){const F=n.F;return F.lonely>.7?'\uD83E\uDD7A Missing '+CFG.partner:F.hunger>.85?'\uD83C\uDF7D\uFE0F Feeling hungry':F.energy<.2?'\uD83D\uDE34 Feeling sleepy':F.joy>.85?'\uD83E\uDD70 Feeling loved':''}
 function moodWords(){const F=n.F,a=[];if(F.lonely>.6)a.push('missing '+CFG.partner);if(F.hunger>.7)a.push('a little hungry');if(F.energy<.3)a.push('a bit sleepy');if(!a.length)a.push(F.joy>.75?'really happy':'calm and content');return a.join(' and ')+(F.love>.8?', and still very much in love with '+CFG.partner:'')}
 function thought(){const F=n.F,P=CFG.partner,a=[];if(F.lonely>.6)a.push('I wonder where '+P+' is right now\u2026','I miss '+P+' already.');if(F.hunger>.7)a.push('I could really use a snack.');if(F.energy<.3)a.push('A short rest would be nice.');if(F.love>.85&&F.joy>.65)a.push('I\u2019m so lucky to share this house with '+P+'.','Home feels warm because of '+P+'.');a.push('What a lovely '+daypart()+'.','I should check what '+P+' is up to.');return pick(a)}
 function goThen(x,z,fn){const f=nearestFree(x,z),p=astar(n.x,n.z,f[0],f[1]);if(!p||!p.length){n.wait=1.5;return false}n.path=p;n.mode='walk';n.onArrive=()=>{n.mode='idle';fn()};return true}
 function snack(chai){const F=n.F;goThen(-9+(rnd()-.5)*3,5.8+(rnd()-.5)*1.5,()=>{n.gest='sip';n.gT=7;n.wait=1;F.hunger=Math.max(0,F.hunger-(chai?.15:.7));F.energy=Math.min(1,F.energy+.1);if(n.near)say(chai?'Nothing beats a warm cup of chai.':'A little snack, finally!',3500,true)})}
 function visitRoom(){const r=rooms[Math.floor(rnd()*rooms.length)];goThen(r.cx+(rnd()-.5)*5,r.cz+(rnd()-.5)*4,()=>{n.wait=3+rnd()*6;if(n.near&&rnd()<.5)say(pick(ROOMQ[r.n]||['Such a nice room.']),4200,true)})}
 function waterPlant(){const p=pick(PL);goThen(p[0],p[1],()=>{n.gest='water';n.gT=6;n.wait=1;n.F.joy=Math.min(1,n.F.joy+.05);if(n.near)say('Grow well, little friend.',3500,true)})}
 // couple activities, driven by the director below
 function duoGo(sp){if(n.mode==='sit'||n.mode==='sitIn'||n.mode==='sitOut')return false;const f=nearestFree(sp.x,sp.z);n.path=[];n.stk='';n.gest='';n.gT=0;n.onArrive=null;n.mode='duo';n.duo={k:'stand',s:'go',x:f[0],z:f[1],g:'',tag:sp.tag||'',act:sp.act||'',t:0,fl:0};return true}
 function duoSit(k){if(NPCS.some(o=>o!==self&&o.stk===k))return false;n.duo={k:'sit'};station(k);return n.stk===k}
 function duoEnd(){const was=n.duo;n.duo=null;if(was&&was.k==='sit'){if(n.mode==='sit')n.timer=0}else if(n.mode==='duo'){n.mode='idle';n.path.length=0;n.wait=1.5+rnd()*2}}
 function startTour(){n.duo=null;if(n.talk)stopTalk();n.tour={i:0,s:'go',t:0,far:0};n.mode='tour';n.stk='';n.path=[];n.gest='';n.gT=0;bubble('Sure, follow me! I\u2019ll show you around.',3500);tourGo()}
 function tourGo(){const T0=n.tour,s=T0&&TOUR[T0.i];if(!s)return endTour('That\u2019s the whole house! Ask me anything else.');const f=nearestFree(s[0],s[1]);n.path=astar(n.x,n.z,f[0],f[1])||[];T0.s='go'}
 function endTour(t){n.tour=null;n.mode='idle';n.wait=3;n.path=[];if(t)bubble(t,5000)}
 // ---------- chat
 const daypart=()=>{const h=new Date().getHours();return h<5?'late night':h<12?'morning':h<17?'afternoon':h<21?'evening':'night'};
 const nm=()=>n.who?', '+n.who:'';
 const add=(w,t)=>U.add(w,t);
 const FACTS=CFG.id==='ava'?FACTS_A:FACTS_N;
 const HEAD=[
  [/(my name is|call me|name\u2019s|name's)\s+([a-z]{2,20})\b/,m=>{const w=m[2];if(/^(a|an|the|here|just|looking|hiring|fine|good|great|ok|okay|new|so|not|very|really|also|from|into|interested|curious|recruiter|developer|student)$/i.test(w))return null;n.who=w[0].toUpperCase()+w.slice(1);try{localStorage.setItem('ava_visitor',n.who)}catch(e){}return 'Nice to meet you, '+n.who+'! I\u2019ll remember that. What would you like to know?'}],
  [/tour|show me around|guide me|follow you/,()=>'Of course, follow me! [[tour]]']];
 const TAIL=[
  [/what are you doing|what.?s up|doing now|busy/,()=>'I\u2019m '+actText()+' right now.'],
  [/(fun )?fact/,()=>pick(FACTS)],
  [/^(hi+|hello+|hey+|yo|namaste|hola|good (morning|evening|afternoon))\b/,()=>pick(CFG.greet).replace('%n',nm())],
  [/how are you|how r u/,()=>'Doing great, thanks! It\u2019s a lovely '+daypart()+'. What would you like to know?'],
  [/joke|funny/,()=>pick(['Why do programmers prefer dark mode? Because light attracts bugs.','A SQL query walks into a bar and asks two tables: can I join you?'])],
  [/thank|thanks|thx/,()=>'Anytime!'],[/bye|goodbye|see you/,()=>'Bye'+nm()+'! I\u2019ll be around.']];
 const FEEL=[
  [/how are you feeling|how do you feel|your (mood|feelings?)|are you (happy|sad|ok|okay|tired|hungry)|on your mind/,()=>'Right now I\u2019m '+moodWords()+'.'],
  [/do you love (him|her|aniket|svia)|in love with (him|her|aniket|svia)|you two|are you a couple/,()=>'Every single day. '+CFG.partner+' and I share chai, meals, work and long talks, and I wouldn\u2019t trade this life for anything. [[heart]]'],
  [/what do you (two|both) do|daily (life|routine)|your routine/,()=>'We live a simple, happy life: chai together, cooking, coding side by side, reading, a little dancing and plenty of talking. Right now I\u2019m '+actText()+'.']];
 const KB=HEAD.concat(FEEL,CFG.kb({actText,other,pick}),TAIL);
 const fallback=q=>{const l=q.toLowerCase();for(const [re,f] of KB){const m=re.exec(l);if(m){const r=f(m);if(r)return r}}return CFG.dunno};
 async function aiReply(){const c=new AbortController(),tm=setTimeout(()=>c.abort(),20000);
  try{let h=n.hist.slice(-12);while(h.length&&h[0].role!=='user')h.shift();
   const r=await fetch(API,{method:'POST',signal:c.signal,headers:{'Content-Type':'application/json'},body:JSON.stringify({npc:CFG.id,name:NAME,partner:CFG.partner,messages:[{role:'user',content:CFG.stage},{role:'assistant',content:'Understood.'}].concat(h),ctx:{time:new Date().toLocaleString('en-IN',{weekday:'long',hour:'numeric',minute:'2-digit'}),daypart:daypart(),activity:actText(),mood:moodWords(),room:roomAt(),visitor:n.who,name:NAME,role:CFG.role,partner:CFG.partner}})});
   if(!r.ok)throw new Error(r.status);const j=await r.json();if(!j.reply)throw new Error('empty');return j.reply}finally{clearTimeout(tm)}}
 async function ask(t){t=t.trim().slice(0,400);if(!t)return;add('u',t);n.hist.push({role:'user',content:t});const th=add('b','\u2026');let a;
  if(API){try{a=await aiReply()}catch(e){console.warn('[npc] AI server failed, using offline brain',e);a=fallback(t)}}else{await new Promise(r=>setTimeout(r,350));a=fallback(t)}
  const wantTour=/\[\[tour\]\]/i.test(a),wave=/\[\[wave\]\]/i.test(a),heart=/\[\[heart\]\]/i.test(a);a=a.replace(/\[\[\w+\]\]/g,'').trim()||'\u2026';
  th.textContent=a;if(th._e)th._e[1]=a;U.log.scrollTop=U.log.scrollHeight;n.hist.push({role:'assistant',content:a});bubble(a,Math.min(9000,3000+a.length*45));
  if(heart)setTimeout(()=>U.hearts(7),400);
  if(wave&&n.mode==='idle'){n.gest='wave';n.gT=2.6}if(wantTour)setTimeout(startTour,1500)}
 function startTalk(){if(U.active||panelOpen||!started)return;U.active=self;n.talk=true;panelOpen=true;try{document.exitPointerLock()}catch(e){}U.bind(self);U.box.hidden=false;U.hint.hidden=true;if(!msgs.length)add('b','Good '+daypart()+nm()+'! '+CFG.welcome);if(!coarse)setTimeout(()=>U.inp.focus(),30)}
 function stopTalk(){if(!n.talk)return;n.talk=false;if(U.active===self)U.active=null;panelOpen=false;U.box.hidden=true;U.inp.blur();lock()}
 // ---------- load the model
 (async()=>{try{
  for(let i=0;i<200&&!T.GLTFLoader;i++)await new Promise(r=>setTimeout(r,100));if(!T.GLTFLoader)return;
  const fromJs=()=>new Promise((ok,no)=>{const go=()=>{try{const b=atob(window[CFG.glbVar]),u=new Uint8Array(b.length);for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i);new T.GLTFLoader().parse(u.buffer,'',ok,no)}catch(e){no(e)}};if(window[CFG.glbVar])return go();const s=document.createElement('script');s.src=CFG.js;s.onload=go;s.onerror=()=>no(new Error(CFG.js+' not found'));document.head.appendChild(s)});
  const tryLoad=ps=>new Promise((ok,no)=>{const nx=()=>{const u=ps.shift();if(!u)return no(new Error(CFG.glb+' not found'));new T.GLTFLoader().load(u,ok,undefined,nx)};nx()});
  let g;if(location.protocol==='file:')g=await fromJs();else{try{g=await tryLoad([CFG.glb,'./'+CFG.glb,CFG.glb.replace('avatar/','')])}catch(e){g=await fromJs()}}
  g.scene.traverse(o=>{if(o.isMesh&&o.material){(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>{if(m.isMeshStandardMaterial){m.envMapIntensity=.55;if(m.metalness>.3)m.metalness=.1}})}});
  n.av=createAvatar(T,g.scene);n.av.root.visible=false;n.av.root.add(book);scene.add(n.av.root);
 }catch(e){console.warn('[npc '+NAME+'] '+(e&&e.message||e))}})();
 function update(dt){
  if(!n.av)return;
  if(!started||CIN.mode!=='play'){n.av.root.visible=false;n.hintOK=false;if(U.bubOwner===self)U.bub.classList.remove('on');return}
  if(!n.grid)build();feel(dt);
  n.av.root.visible=true;
  const dx=P.x-n.x,dz=P.z-n.z,d=Math.hypot(dx,dz),near=d<3.2&&Math.abs(P.x)<13.6&&Math.abs(P.z)<9.2;
  if(near&&!n.near){n.near=true;if(!U.active&&performance.now()-n.last>45000){n.last=performance.now();say(n.who?pick(CFG.back).replace('%n',n.who):pick(CFG.hello),5500);if(n.mode==='idle'||n.mode==='walk'){n.gest='wave';n.gT=2.6}}}
  if(!near&&n.near){n.near=false;if(n.talk)stopTalk();if(U.bubOwner===self){U.bub.classList.remove('on');U.bubT=0;if(window.speechSynthesis)speechSynthesis.cancel()}}
  n.hintOK=n.near&&!n.talk&&n.mode!=='tour';n.d=d;
  const engaged=(n.talk||(near&&!n.duo))&&n.mode!=='tour';
  let th=n.h,tv=0,task='',sit=0;
  const follow=()=>{if(!n.path.length)return 2;const w=n.path[0],wx=w[0]-n.x,wz=w[1]-n.z,wd=Math.hypot(wx,wz);
   n.chk+=dt;if(n.chk>1.6){const m=Math.hypot(n.x-n.cx,n.z-n.cz);n.chk=0;n.cx=n.x;n.cz=n.z;if(m<.3){n.path.length=0;return 3}}
   if(wd<.18){n.path.shift();return n.path.length?0:2}th=Math.atan2(wx,wz);tv=WV;return 1};
  if(engaged&&(n.mode==='sit'||n.mode==='sitIn')){n.tr={t:0,fx:n.x,fz:n.z,tx:n.st.apx,tz:n.st.apz};n.mode='sitOut'}
  const m=n.mode,seated=m==='sit'||m==='sitIn'||m==='sitOut';n.tag='';
  if(m==='sitIn'||m==='sitOut'){const s=n.st,tr=n.tr;tr.t=Math.min(1,tr.t+dt/.85);const k=tr.t*tr.t*(3-2*tr.t);n.x=tr.fx+(tr.tx-tr.fx)*k;n.z=tr.fz+(tr.tz-tr.fz)*k;
   if(m==='sitIn'){n.h+=ang(n.h,s.h)*(1-Math.exp(-8*dt));sit=s.hj;task=s.task;n.tag=s.txt;if(tr.t>=1){n.mode='sit';n.timer=30+rnd()*40}}
   else{n.h+=ang(n.h,Math.atan2(dx,dz))*(1-Math.exp(-5*dt));if(tr.t>=1){n.mode='idle';n.stk='';n.wait=1;n.gest='wave';n.gT=n.near?2.2:0}}}
  else if(m==='sit'){const s=n.st;n.x=s.sx;n.z=s.sz;n.h+=ang(n.h,s.h)*(1-Math.exp(-8*dt));sit=s.hj;task=s.task;n.tag=s.txt;if(!n.duo)n.timer-=dt;if(n.timer<=0){n.tr={t:0,fx:n.x,fz:n.z,tx:s.apx,tz:s.apz};n.mode='sitOut'}}
  else if(m==='tour'){const T0=n.tour,s=T0&&TOUR[T0.i];n.tag='\uD83E\uDDED Guiding you';
   if(s){if(d>14){T0.far+=dt;if(T0.far>14)endTour('I\u2019ll let you explore on your own!')}else T0.far=0}
   if(n.tour&&s){if(T0.s==='go'){if(d>8)th=Math.atan2(dx,dz);else{const r=follow();if(r===2){T0.s='talk';T0.t=0;bubble(s[2],7500)}else if(r===3)tourGo()}}
    else{th=Math.atan2(dx,dz);T0.t+=dt;if(T0.t>8&&d<8){T0.i++;tourGo()}}}}
  else if(engaged){n.path.length=0;n.onArrive=null;if(n.mode==='walk'){n.mode='idle';n.stk=''}th=Math.atan2(dx,dz);n.wait=Math.max(n.wait,2);if(n.gT>0){n.gT-=dt;task=n.gest}}
  else if(n.duo&&n.duo.k==='stand'){const D=n.duo,pr=other();
   if(D.s==='go'){if(Math.hypot(n.x-D.x,n.z-D.z)<.4)D.s='at';else{if(!n.path.length){const p=astar(n.x,n.z,D.x,D.z);if(p&&p.length)n.path=p;else{D.fl+=dt;if(D.fl>2)D.s='at'}}const r=follow();if(r===3)n.path.length=0}}
   else{if(pr&&pr.ready)th=Math.atan2(pr.x-n.x,pr.z-n.z);task=D.g||'';n.tag=D.tag||'';D.t+=dt}}
  else if(m==='walk'){const r=follow();if(r===2){const f=n.onArrive;n.onArrive=null;if(f)f();else n.mode='idle'}else if(r===3){n.mode='idle';n.stk='';n.wait=1;n.onArrive=null}}
  else{const pr=other();if(pr&&pr.ready&&!pr.seated&&Math.hypot(pr.x-n.x,pr.z-n.z)<2.4){th=Math.atan2(pr.x-n.x,pr.z-n.z);n.pc-=dt;if(n.pc<=0){n.pc=28+rnd()*35;if(d<9&&!U.active&&U.bubT<=0)say(pick(CFG.pair),4800,true)}}
   if(n.gT>0){n.gT-=dt;task=n.gest;n.tag=GT[n.gest]||''}else{n.wait-=dt;if(n.wait<=0)plan()}}
  // open closed doors that are close to her
  for(const dr of DR){if(dr.open||dr.front)continue;const e=dr.e;if(Math.hypot(n.x-(e.x0+e.x1)/2,n.z-(e.z0+e.z1)/2)<1.7&&(tv>0||n.path.length))dr.open=true}
  const df=ang(n.h,th);if(!seated)n.h+=df*(1-Math.exp(-7*dt));
  const sp=seated?0:tv*cl(Math.cos(df),0,1);n.v+=(sp-n.v)*(1-Math.exp(-6*dt));
  if(n.v>.02&&!seated){const nx=n.x+Math.sin(n.h)*n.v*dt,nz=n.z+Math.cos(n.h)*n.v*dt;if(free(nx,nz)||!free(n.x,n.z)){n.x=nx;n.z=nz}else n.path.length=0}
  n.seated=seated;n.av.root.position.set(n.x,0,n.z);n.av.root.rotation.y=n.h;
  n.av.update(dt,{speed:n.v>.08?1:0,v:Math.max(n.v,.35),run:false,air:false,vy:0,hold:false,pitch:0,sit,task});
  book.visible=n.av.st.sit>.6&&task==='read';if(book.visible)book.position.set(0,(n.st?n.st.hj:.58)+.46,.4);
  if(!n.tag&&!seated&&(n.mode==='idle'||n.mode==='walk'))n.tag=moodTxt();
  n.tk-=dt;if(n.tk<=0){n.tk=30+rnd()*40;if(d<9&&!U.active&&U.bubT<=0&&!engaged&&!n.duo&&n.mode!=='tour')say(thought(),4200,true)}
  if(n.tag&&d<9&&!n.talk&&d<U.tagD){U.tagD=d;U.tagOwner=self;U.tagText=n.tag;U.tagY=CFG.tagY}
  if(U.bubOwner===self&&U.bubT>0){U.bubT-=dt*1000;if(U.bubT<=0)U.bub.classList.remove('on');else npcProj(self,CFG.bubY,U.bub,d)}
 }
 self={cfg:CFG,msgs,update,ask,startTalk,stopTalk,act:actText,push(dx,dz){const nx=n.x+dx,nz=n.z+dz;if(n.grid&&free(nx,nz)){n.x=nx;n.z=nz}},get x(){return n.x},get z(){return n.z},get seated(){return n.seated},get near(){return n.near},get dist(){return n.d},get stk(){return n.stk},get ready(){return !!n.av},get hintOK(){return n.hintOK},get F(){return n.F},get mode(){return n.mode},get duo(){return n.duo},
  duoGo,duoSit,duoEnd,release(){if(n.mode==='sit')n.timer=0},talkTo(t,ms){say(t,ms,true)},setG(g){if(n.duo&&n.duo.k==='stand')n.duo.g=g||''}};
 NPCS.push(self);return self}

// ---------- the two characters
const AVA_CFG={id:'ava',name:'SVIA',male:false,partner:'Aniket',role:'Aniket\u2019s wife and the assistant of this house',sub:'Aniket\u2019s wife & assistant \u00b7 online',
 spawn:[0,4.5],glb:'avatar/npc.glb',js:'avatar/npc.js',glbVar:'NPC_GLB',tagY:2.12,bubY:2.5,together:.12,wait0:1.5,
 stage:'(Stage note, not from the visitor: you are SVIA, the WIFE of Aniket Patil (never say girlfriend). Aniket is your husband and also lives in this house. You and Aniket are a deeply loving married couple who spend your days together (chai, cooking, coding, reading, dancing, long talks) and you each have your own feelings and free will. Stay in character as SVIA.)',
 chips:['Who is Aniket?','Skills','Projects','Take me on a tour','What are you doing?','Are you his wife?','Where is Aniket?','How are you feeling?'],
 welcome:'I\u2019m SVIA, Aniket\u2019s wife and assistant. Ask me anything, or tap a suggestion below.',
 hello:['Hi! I\u2019m SVIA, Aniket\u2019s wife. Welcome to our house!','Oh, hello! Looking for something? I can tell you all about my husband.'],
 back:['Welcome back, %n! Good to see you again.','Hi %n! Missed you.'],
 greet:['Hey%n! Great to see you. Ask me about Aniket\u2019s skills, projects or how to reach him.','Hello there%n! Want a tour of our house?'],
 pair:['Aniket, don\u2019t forget to commit your code!','Chai later, Aniket?','Love you, Aniket. Don\u2019t work too late!','Come sit with me for a minute?','You look tired. Take a break with me.','I\u2019m so glad you\u2019re home with me.'],
 dunno:'I can mostly talk about Aniket and his work. Try asking about skills, projects, or say "tour"!',
 tour:[[-9,5,'This is our living room, the welcome area. Aniket\u2019s story starts here.'],[-9,-4.2,'The Study. This is where you learn about Aniket, and where we both do our coding!'],[0,-5,'Welcome to the Lab. All his skills live here: ASP.NET, React, Flutter and SQL Server.'],[9,-4.5,'The Gallery shows his projects: TFOD, MedScan AI, Square Chat and more.'],[0,3.6,'The Library has his education and experience. I love reading here.'],[9,4,'And the Contact room. He is open to work, so say hello!']],
 kb:c=>[
  [/husband|wife|girlfriend|boyfriend|lover|partner|relationship|married|dating|aniket and you|you and aniket/,()=>'Yes, I\u2019m Aniket\u2019s wife, and I help him welcome visitors to our house. [[heart]]'],
  [/i love you|love you|you.?re (cute|pretty|beautiful|sweet)|marry me|kiss/,()=>c.pick(['Aww, thank you! But my heart already belongs to my husband, Aniket. [[heart]]','That\u2019s sweet of you! Just don\u2019t tell Aniket I blushed. [[heart]]'])],
  [/where.*aniket|find aniket|meet aniket|see aniket|is aniket (home|here|around)/,()=>{const p=c.other();return p&&p.ready?'Aniket is '+p.act()+' right now. Go say hi, he lives here too!':'Aniket is somewhere in the house. Go say hi, he lives here too!'}],
  [/who are you|your name|are you (a )?(bot|ai|real)/,()=>'I\u2019m SVIA, an AI character who lives in Aniket\u2019s 3D house. I\u2019m his wife, and I help him look after visitors.'],
  [/who is aniket|about aniket|tell me about (aniket|him)|developer/,()=>'Aniket Patil is my husband. He is a Full Stack Developer at IMAP Systems, Mumbai. He builds web and Flutter apps with ASP.NET, React and SQL Server, and finished his MCA at KIT\u2019s IMER, Kolhapur in 2025.'],
  [/skill|tech|stack|language|asp|react|flutter|sql|\.net|c#|node|firebase|java/,()=>'Aniket works with ASP.NET and C#, React, Flutter, Node.js, SQL Server and MySQL, plus Firebase, REST APIs and Spring Boot.'],
  [/project|built|medscan|tfod|square chat|auction|attendance/,()=>'Highlights: TFOD (React + Node website), MedScan AI (medical report system), Square Chat (Flutter + Firebase + WebRTC), Online Auction and an Attendance System. See the Gallery room!'],
  [/experience|company|imap|intern|technoworld/,()=>'Since January 2026 he is a Full Stack Developer at IMAP Systems, Mumbai. Before that he interned at Technoworld Software.'],
  [/educat|study|degree|mca|college/,()=>'Aniket has an MCA from KIT\u2019s IMER, Kolhapur (2025).'],
  [/contact|email|hire|reach|available|open to work|linkedin|github/,()=>'He is open to work! Email patilaniket2562m@gmail.com, or use the links in the Contact room.'],
  [/resume|cv/,()=>'You can download his resume from the About section of the website.']]};
const ANIKET_CFG={id:'aniket',name:'Aniket',male:true,partner:'SVIA',role:'Aniket Patil, the owner of this house and SVIA\u2019s husband',sub:'Host of the house \u00b7 SVIA\u2019s husband \u00b7 online',
 spawn:[-7,3.2],glb:'avatar/aniket.glb',js:'avatar/aniket.js',glbVar:'ANIKET_GLB',tagY:2.22,bubY:2.62,together:.3,wait0:3,speed:1.3,
 stage:'(Stage note, not from the visitor: you are Aniket Patil himself, a Full Stack Developer and the owner of this 3D house. SVIA is your WIFE and lives here with you. Always speak as Aniket in the first person, never as SVIA. You and SVIA are a deeply loving married couple who spend your days together and you each have your own feelings and free will.)',
 chips:['Who are you?','Skills','Projects','Take me on a tour','What are you doing?','Is SVIA your wife?','Where is SVIA?','How are you feeling?'],
 welcome:'I\u2019m Aniket, welcome to my house. Ask me anything, or tap a suggestion below.',
 hello:['Hey! I\u2019m Aniket. Welcome to my house!','Oh, hello! Looking for something? I can tell you all about my work.'],
 back:['Welcome back, %n! Good to see you again.','Hey %n! Great to see you here again.'],
 greet:['Hey%n! Welcome to my house. Ask me about my skills, projects or how to reach me.','Hello there%n! Want a tour of my house?'],
 pair:['SVIA, you are the best part of this house.','Chai in ten minutes, SVIA?','SVIA, come look at this bug with me.','What would I do without you?','You make every room feel like home.','I love you, SVIA.'],
 dunno:'I mostly talk about my work and this house. Try asking about skills, projects, or say "tour"!',
 tour:[[-9,5,'This is our living room, the welcome area. My story starts here.'],[-9,-4.2,'The Study. This is where you learn about me, and where SVIA and I do our coding.'],[0,-5,'Welcome to the Lab. All my skills live here: ASP.NET, React, Flutter and SQL Server.'],[9,-4.5,'The Gallery shows my projects: TFOD, MedScan AI, Square Chat and more.'],[0,3.6,'The Library has my education and experience. SVIA loves reading here.'],[9,4,'And the Contact room. I am open to work, so say hello!']],
 kb:c=>[
  [/\b(svia|ava|eva)\b.*(wife|girlfriend|married)|wife|married|spouse|girlfriend|relationship|dating|\bwho is (svia|ava|eva)\b|about (svia|ava|eva)/,()=>'SVIA is my wife. She lives here with me and helps me welcome visitors. [[heart]]'],
  [/i love you|love you|marry me|kiss/,()=>'Ha, thanks! But I\u2019m happily married to SVIA. [[heart]]'],
  [/where.*\b(svia|ava|eva)\b|find (svia|ava|eva)|meet (svia|ava|eva)|see (svia|ava|eva)|is (svia|ava|eva) (home|here|around)/,()=>{const p=c.other();return p&&p.ready?'SVIA is '+p.act()+' right now. Go say hi!':'SVIA is somewhere in the house. Go say hi!'}],
  [/who are you|your name|are you (a )?(bot|ai|real)/,()=>'I\u2019m Aniket Patil, a Full Stack Developer, and this is my house. SVIA, my wife, lives here with me.'],
  [/who is aniket|about aniket|about you|tell me about (yourself|you|aniket)|developer/,()=>'I\u2019m a Full Stack Developer at IMAP Systems, Mumbai. I build web and Flutter apps with ASP.NET, React and SQL Server, and I finished my MCA at KIT\u2019s IMER, Kolhapur in 2025.'],
  [/skill|tech|stack|language|asp|react|flutter|sql|\.net|c#|node|firebase|java/,()=>'I work with ASP.NET and C#, React, Flutter, Node.js, SQL Server and MySQL, plus Firebase, REST APIs and Spring Boot.'],
  [/project|built|medscan|tfod|square chat|auction|attendance/,()=>'My highlights: TFOD (React + Node website), MedScan AI (medical report system), Square Chat (Flutter + Firebase + WebRTC), Online Auction and an Attendance System. See the Gallery room!'],
  [/experience|company|imap|intern|technoworld/,()=>'Since January 2026 I\u2019m a Full Stack Developer at IMAP Systems, Mumbai. Before that I interned at Technoworld Software.'],
  [/educat|study|degree|mca|college/,()=>'I have an MCA from KIT\u2019s IMER, Kolhapur (2025).'],
  [/contact|email|hire|reach|available|open to work|linkedin|github/,()=>'I\u2019m open to work! Email me at patilaniket2562m@gmail.com, or use the links in the Contact room.'],
  [/resume|cv/,()=>'You can download my resume from the About section of the website.']]};
const NPC=(function(){
 const U=NPCU,A=makeNPC(AVA_CFG),B=makeNPC(ANIKET_CFG);
 // ---- couple director: SVIA and Aniket decide together to share a moment of daily life, walk to it, talk and feel it.
 // lines are [who(0=SVIA,1=Aniket), text, {g:[gestureA,gestureB], h:hearts}]
 const hr=()=>new Date().getHours(),rp=a=>a[Math.floor(rnd()*a.length)],PLS=[[-11.6,6.6],[-6.3,6.6],[-6.6,-6.6],[4.9,2.2],[11.6,-6.7],[11.6,6.7]];
 const ACTS=[
  {id:'chai',kind:'stand',room:3,off:[-1.2,1.4],sep:.8,gs:['sip','sip'],tag:'\u2615 Chai together',act:p=>'having chai with '+p,hold:5,fx:{energy:.12},
   w:q=>.9+((q.h<11||(q.h>=16&&q.h<20))?.9:0)+q.tir*.5,
   lines:()=>[[0,'Chai is ready! Careful, it\u2019s hot.'],[1,'Mmm. Nobody makes it like you do.'],[0,'You say that every single time.'],[1,'And it\u2019s true every single time.',{h:1}],[0,'So how is your day going?'],[1,'Better now. This is my favourite part of it.'],[0,'Stop it, you\u2019re making me blush.',{g:['laugh','sip'],h:1}]]},
  {id:'cook',kind:'stand',room:3,off:[-2.4,1.8],sep:.9,gs:['stir','stir'],tag:'\uD83C\uDF72 Cooking together',act:p=>'cooking together with '+p,hold:5,fx:{hunger:-.85},
   w:q=>.4+q.hun*2.4+(((q.h>=12&&q.h<14)||(q.h>=19&&q.h<21))?1:0),
   lines:()=>{const h=hr(),meal=h<11?'breakfast':h<16?'lunch':'dinner';return[[0,'I\u2019m making '+meal+' today. Taste this for me?'],[1,'Needs a little more spice.'],[0,'You always say that. Last time you were crying.'],[1,'Worth it. It was delicious.',{g:['stir','laugh']}],[0,'Hand me that bowl, will you?'],[1,'Anything for the chef.',{g:['stir','stir']}],[0,'Our '+meal+' is going to be perfect.'],[1,'Everything is perfect when we cook together.',{h:1}]]}},
  {id:'hug',kind:'stand',room:'any',sep:.4,close:true,gs:['hug','hugb'],tag:'\uD83E\uDD70 Hugging',act:p=>'hugging '+p,hold:6,
   w:q=>.5+q.lone*2.6,
   lines:()=>[[0,'Come here, you.'],[1,'I missed you. Even when we\u2019re in the same house.'],[0,'I love you, Aniket.',{h:1}],[1,'I love you more, SVIA.',{h:1}],[0,'Don\u2019t let go yet.'],[1,'Never.']]},
  {id:'dance',kind:'stand',room:'any',sep:.5,close:true,gs:['dancef','dance'],tag:'\uD83D\uDC83 Dancing together',act:p=>'slow dancing with '+p,hold:7,
   w:q=>(q.night?1.2:.35)+q.lone*.8,
   lines:()=>[[1,'May I have this dance?'],[0,'There\u2019s no music, silly.'],[1,'Then we\u2019ll hum our own.'],[0,'Hmm hmm hmm\u2026 you\u2019re terrible at this.',{g:['dancef','dance']}],[1,'But you\u2019re still smiling.',{h:1}],[0,'Always, with you.',{h:1}]]},
  {id:'code',kind:'sit',st:['cwork0','cwork1'],hold:18,
   w:q=>(q.h>=9&&q.h<20)?1.1:.3,
   lines:()=>[[1,'This bug makes no sense. The API returns 200 but the page is empty.'],[0,'Did you check the state update? It\u2019s usually that.'],[1,'\u2026Of course. A missing dependency. How do you always see it?'],[0,'Because I know your code better than you do.'],[1,'Fine, then you review the pull request too.'],[0,'Deal. And you make the chai.'],[1,'Deal. Commit, push, break!'],[0,'Proud of you. Always.',{h:1}]]},
  {id:'read',kind:'sit',st:['cread0','cread1'],hold:22,fx:{energy:.1},
   w:q=>((q.h>=17||q.h<9)?1.2:.5)+q.tir*.8,
   lines:()=>[[0,'This chapter is so good. Listen to this idea\u2026'],[1,'Tell me, I\u2019ll read it next.'],[0,'It says small habits build a big life.'],[1,'Like having chai together every evening.',{h:1}],[0,'Exactly like that.'],[1,'Then let\u2019s never skip it.']]},
  {id:'gallery',kind:'stand',room:2,off:[-1.5,.6],sep:.9,gs:['',' point'.trim()],tag:'\uD83D\uDDBC\uFE0F Looking at projects',act:p=>'admiring old projects with '+p,hold:4,
   w:q=>.6,
   lines:()=>[[1,'Remember when Square Chat made its first video call?'],[0,'I screamed so loud the neighbours called.'],[1,'You believed in it before I did.'],[0,'Because I believe in you. MedScan AI too.',{h:1}],[1,'Next project, we plan it together.'],[0,'Always together.']]},
  {id:'plants',kind:'stand',at:()=>rp(PLS),sep:.8,gs:['water',''],tag:'\uD83E\uDEB4 Watering plants',act:p=>'looking after the plants with '+p,hold:4,
   w:q=>q.h<12?.9:.5,
   lines:()=>[[0,'Look, a new leaf!'],[1,'Because you talk to it every morning.'],[0,'Plants need love too.'],[1,'Just like us.',{h:1}],[0,'Exactly.']]},
  {id:'plan',kind:'stand',room:'any',sep:.9,gs:['',''],tag:'\uD83D\uDCAD Making plans',act:p=>'making plans with '+p,hold:4,
   w:q=>.6,
   lines:()=>[[0,'What should we do this weekend?'],[1,'A long drive, maybe? Somewhere green.'],[0,'And chai on the way.'],[1,'Obviously.'],[0,'Someday I want a little garden of our own.'],[1,'Then we build it. Together.',{h:1}]]},
  {id:'tease',kind:'stand',room:'any',sep:.75,gs:['',''],tag:'\uD83D\uDE04 Playful talk',act:p=>'chatting and teasing '+p,hold:5,
   w:q=>.5,
   lines:()=>[[0,'Aniket, you left your laptop open again and the tabs are everywhere.'],[1,'It\u2019s organised chaos. I know where everything is.',{g:['','laugh']}],[0,'You said that last month. Then you lost the charger.'],[1,'Okay okay, you\u2019re right. Sorry.'],[0,'I\u2019m not angry. I just worry you forget to rest.'],[1,'Thank you for looking after me.',{g:['hug','hug'],h:1}],[0,'Always.',{h:1}]]},
  {id:'tidy',kind:'stand',room:'any',sep:1,gs:['stir','stir'],tag:'\uD83E\uDDF9 Tidying up',act:p=>'tidying up with '+p,hold:4,
   w:q=>.45,
   lines:()=>[[0,'Who left cables all over the floor?'],[1,'Those are not cables, that\u2019s artistic wiring.'],[0,'Artistic wiring goes in the drawer.'],[1,'Yes, boss.',{g:['stir','laugh']}],[0,'Thank you. Teamwork makes it quick.'],[1,'Teamwork with you is my favourite kind.',{h:1}]]},
  {id:'stretch',kind:'stand',room:'any',sep:1.2,gs:['stretch','stretch'],tag:'\uD83E\uDDD8 Stretching together',act:p=>'stretching with '+p,hold:3,fx:{energy:.2},
   w:q=>(q.h<10?1:.4)+q.tir*1.2,
   lines:()=>[[0,'Ahh, my back. Too much sitting.'],[1,'Same. Stretch with me?'],[0,'One, two, three\u2026 up!'],[1,'Show-off.'],[0,'You\u2019re just jealous.',{g:['laugh','stretch']}],[1,'Maybe a little. Okay, break over?']]},
  {id:'goodnight',kind:'stand',room:'any',sep:.4,close:true,gs:['hug','hugb'],tag:'\uD83C\uDF19 Saying goodnight',act:p=>'saying goodnight to '+p,hold:6,
   w:q=>q.night?3.2:0,
   lines:()=>[[0,'It\u2019s getting late. Shall we call it a night?'],[1,'Just a few more minutes with you.'],[0,'You work too hard, you know.'],[1,'I do it for us.',{h:1}],[0,'Goodnight, my love.',{h:1}],[1,'Goodnight, SVIA. Sweet dreams.',{h:1}]]}
 ];
 const D={act:null,ph:'',t:0,li:0,cool:12,last:'',L:null,k0:'',k1:'',to:0};
 function pickAct(){const F0=A.F,F1=B.F,h=hr(),q={h,night:h>=22||h<5,lone:Math.max(F0.lonely,F1.lonely),hun:Math.max(F0.hunger,F1.hunger),tir:1-Math.min(F0.energy,F1.energy)};
  let tot=0;const ws=ACTS.map(a=>{const w=Math.max(0,a.w(q))*(a.id===D.last?.15:1);tot+=w;return w});if(tot<=0)return null;let r=rnd()*tot;for(let i=0;i<ACTS.length;i++){if((r-=ws[i])<=0)return ACTS[i]}return ACTS[0]}
 function endDuo(abort){A.duoEnd();B.duoEnd();
  if(D.act&&!abort){[A,B].forEach(o=>{const F=o.F,fx=D.act.fx||{};for(const k in fx)F[k]=cl(F[k]+fx[k],0,1);F.lonely=0;F.joy=Math.min(1,F.joy+.12);F.love=Math.min(1,F.love+.02)})}
  D.act=null;D.ph='';D.cool=abort?12:35+rnd()*40}
 function director(dt){
  const ok=started&&CIN.mode==='play'&&A.ready&&B.ready&&A.mode!=='tour'&&B.mode!=='tour';
  if(!ok){if(D.act)endDuo(true);return}
  if(!D.act){if(U.active)return;D.cool-=dt;if(D.cool<=0){const a=pickAct();if(a){D.act=a;D.last=a.id;D.ph='prep';D.li=0;D.to=0;D.L=a.lines();if(a.kind==='sit'){D.k0=a.st[0];D.k1=a.st[1]}}else D.cool=10}return}
  const a=D.act;
  if(D.ph==='prep'){D.to+=dt;[A,B].forEach(o=>{if(o.mode==='sit')o.release()});
   if([A,B].some(o=>o.mode==='sit'||o.mode==='sitIn'||o.mode==='sitOut')){if(D.to>25)endDuo(true);return}
   if(a.kind==='sit'){if(!A.duoSit(D.k0)||!B.duoSit(D.k1))return endDuo(true)}
   else{const rm=a.room==='any'||a.room==null?rooms[Math.floor(rnd()*rooms.length)]:rooms[a.room],c=a.at?a.at():[rm.cx+(a.off?a.off[0]:(rnd()-.5)*3),rm.cz+(a.off?a.off[1]:(rnd()-.5)*3)],h=a.sep/2;
    if(!A.duoGo({x:c[0]-h,z:c[1],tag:a.tag,act:a.act(B.cfg.name)})||!B.duoGo({x:c[0]+h,z:c[1],tag:a.tag,act:a.act(A.cfg.name)}))return endDuo(true)}
   D.ph='gather';D.to=0;return}
  if(D.ph==='gather'){D.to+=dt;
   if(a.kind==='sit'?(A.stk!==D.k0||B.stk!==D.k1):(!A.duo||!B.duo))return endDuo(true);
   const there=a.kind==='sit'?(A.mode==='sit'&&B.mode==='sit'):(A.duo.s==='at'&&B.duo.s==='at');
   if(there){D.ph='talk';D.t=.8;if(a.kind==='stand'){A.setG(a.gs[0]);B.setG(a.gs[1])}}else if(D.to>55)endDuo(true);return}
  if(a.kind==='sit'?(A.stk!==D.k0||B.stk!==D.k1):(!A.duo||!B.duo))return endDuo(true);
  if(U.active)return;
  D.t-=dt;if(D.t>0)return;
  if(D.ph==='talk'){const L=D.L[D.li++];if(!L){D.ph='hold';D.t=a.hold||5;return}
   const sp=L[0]?B:A,ex=L[2]||{},ms=cl(1800+L[1].length*52,2800,8000);sp.talkTo(L[1],ms);
   if(ex.g&&a.kind==='stand'){A.setG(ex.g[0]);B.setG(ex.g[1])}if(ex.h)U.hearts(6);D.t=ms/1000+.5;return}
  if(D.ph==='hold')endDuo(false)}
 function post(dt){
  // slow dance: the couple turns gently round their common centre (the pelvis sway and foot lifts come from the avatar rig)
  if(started&&CIN.mode==='play'&&A.ready&&B.ready&&D.act&&D.act.id==='dance'&&(D.ph==='talk'||D.ph==='hold')&&A.duo&&B.duo&&A.duo.s==='at'&&B.duo.s==='at'){const mx=(A.x+B.x)/2,mz=(A.z+B.z)/2,wv=.14*dt,c=Math.cos(wv),sn=Math.sin(wv);[A,B].forEach(o=>{const ox=o.x-mx,oz=o.z-mz;o.push(ox*c-oz*sn-ox,ox*sn+oz*c-oz)})}
  if(started&&CIN.mode==='play'&&A.ready&&B.ready){const dx=B.x-A.x,dz=B.z-A.z,d=Math.hypot(dx,dz),mn=(D.act&&D.act.close&&D.ph==='talk')?.3:.75;if(d<mn&&d>1e-4){const k=(mn-d)*.5*Math.min(1,dt*8),ux=dx/d,uz=dz/d;if(!A.seated)A.push(-ux*k,-uz*k);if(!B.seated)B.push(ux*k,uz*k)}}
  if(U.tagOwner){U.tag.textContent=U.tagText;U.tag.classList.add('on');npcProj(U.tagOwner,U.tagY,U.tag,U.tagD)}else U.tag.classList.remove('on');
  U.tagOwner=null;U.tagD=1e9;
  const h=U.active?null:NPCS.filter(o=>o.hintOK).sort((a,b)=>a.dist-b.dist)[0];
  if(h){if(U.hintFor!==h||!U.hint.innerHTML){U.hintFor=h;U.hint.innerHTML=(coarse?'\uD83D\uDCAC Chat with ':'Press <b>T</b> to chat with ')+h.cfg.name}U.hint.hidden=false}else U.hint.hidden=true}
 return{update(dt){A.update(dt);B.update(dt);director(dt);post(dt)}}})();
let last=performance.now(),first=true;
function frame(now){requestAnimationFrame(frame);if(document.hidden){last=now;return}
 const dt=Math.min(.05,(now-last)/1000);last=now;
 movePlayer(dt);
 bob+=moving?dt*9:0;
 const tp=!!AV&&TPS.on&&!TPS.fp&&CIN.mode==='play'&&started;
 if(tp)pitch=cl(pitch,-.95,1.05);
 cam.rotation.order='YXZ';cam.rotation.set(pitch,yaw,0);lookDir();
 if(tp)thirdPerson(dt);else{const eye=1.65+(moving?Math.sin(bob)*.03:0);cam.position.set(P.x,P.y+eye,P.z);AIM.copy(cam.position);TPS.cd=0}
 if(CIN.mode!=='play')CIN.update(now/1000,dt);
 if(AV){const vis=tp&&TPS.cd>.5;AV.root.visible=vis;
  if(Math.hypot(P.x-lastP.x,P.z-lastP.z)>1.5)heading=yaw+Math.PI;lastP.x=P.x;lastP.z=P.z;
  if(vis){const th=held?yaw+Math.PI:(mvAmt>.05?Math.atan2(mvX,mvZ):heading);heading+=Math.atan2(Math.sin(th-heading),Math.cos(th-heading))*(1-Math.exp(-14*dt));
   AV.root.position.set(P.x,P.y,P.z);AV.root.rotation.y=heading;
   AV.update(dt,{speed:mvAmt,v:mvV,run:mvRun,air:P.y>.03,vy:P.vy,hold:!!held,pitch})}}
 NPC.update(dt);
 fl.position.copy(AIM).addScaledVector(fwd,tp?.45:0);fl.target.position.copy(AIM).addScaledVector(fwd,6);
 if(held){const b=held,p=b.m.position,hy=b.h[1]*b.s;let d=holdD;rc.set(AIM,fwd);rc.far=d+.4;const h=rc.intersectObjects(solids)[0];if(h)d=Math.max(.6,h.distance-.4);
  const tg=AIM.clone().addScaledVector(fwd,d);tg.y=cl(tg.y,hy+.02,2.9);tg.x=cl(tg.x,-58,58);tg.z=cl(tg.z,-46,46);
  const old=p.clone();p.lerp(tg,1-Math.exp(-16*dt));hv.lerp(p.clone().sub(old).divideScalar(Math.max(dt,.001)),.3);
  if(K.KeyR)b.m.rotation.y+=dt*2.5;if(K.Equal||K.NumpadAdd){b.s=Math.min(3,b.s*(1+dt*1.2));b.m.scale.setScalar(b.s)}if(K.Minus||K.NumpadSubtract){b.s=Math.max(.35,b.s*(1-dt*1.2));b.m.scale.setScalar(b.s)}}
 ANIM.forEach(f=>f(now/1000,dt));physics(dt);
 // targeting
 tgt=null;if(started&&!panelOpen){if(tp)rc.set(AIM,fwd);else rc.setFromCamera({x:0,y:0},cam);rc.far=3.6;const hs=rc.intersectObjects(ray,true);if(hs.length){let o=hs[0].object;while(o&&!o.userData.ref&&o.parent&&o.parent!==scene)o=o.parent;if(o&&o.userData.ref&&!o.userData.ref.held)tgt=o.userData.ref,bh.setFromObject(o)}}
 const sh=held||tgt;bh.visible=false;cross.classList.toggle('on',!!sh);
 tipEl.classList.toggle('on',!!sh);if(sh){tipEl.textContent=coarse?(held?held.name+' · tap to drop':tgt.toggle?tgt.label()+' · tap':tgt.book?tgt.name+' · tap to take':tgt.m?tgt.name+' · tap to pick up':tgt.name+' · tap to read'):held?held.name+' · tap/click to drop · F throw · wheel push/pull':(tgt.toggle?tgt.label()+' · click / E':tgt.book?tgt.name+' · click to take · E to read':tgt.m?tgt.name+' · click to pick up · E to read':tgt.name+' · E / click to read')}
 {const rn=roomAt();if(rn!==lastRoom){lastRoom=rn;const ri=rooms.findIndex(q=>q.n===rn);document.documentElement.style.setProperty('--cy',ACC[ri]||'#8fd6a6');Object.keys(tabs).forEach(k=>tabs[k].classList.toggle('on',rooms[k].n===rn));roomEl.textContent=rn;gb.classList.toggle('on',rn==='Garden')}}drawMM();
 if(!window.SP){if(comp)comp.render();else r.render(scene,cam)}
 if(first){first=false;window.HOUSE.ready=true;dispatchEvent(new Event('house-ready'))}}
requestAnimationFrame(frame);
};


(function(){const s=document.getElementById('site');if(!s)return;const pr=s.querySelector('.s-prog'),nv=s.querySelector('.s-nav'),hc=s.querySelector('.s-hc');
const io=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;e.target.classList.add('in');io.unobserve(e.target);e.target.querySelectorAll('[data-count]').forEach(n=>{const t=+n.dataset.count,st=performance.now();(function f(now){const k=Math.min(1,(now-st)/1400);n.textContent=Math.round(t*(1-Math.pow(1-k,3)));if(k<1)requestAnimationFrame(f)})(st)})}),{root:s,threshold:.15});
s.querySelectorAll('[data-r]').forEach(e=>io.observe(e));
s.addEventListener('scroll',()=>{const st=s.scrollTop,m=Math.max(1,s.scrollHeight-s.clientHeight);pr.style.width=(st/m*100)+'%';nv.classList.toggle('s-solid',st>40);hc.style.transform='translateY('+st*.22+'px)';hc.style.opacity=Math.max(0,1-st/(innerHeight*.8));window.SP=st>innerHeight*1.05},{passive:true});
s.querySelectorAll('[data-enter]').forEach(b=>{b.onclick=()=>enterHouse(b.dataset.room===undefined?null:+b.dataset.room);b.addEventListener('pointerenter',prefetchHouse,{once:true})});
})();

(function(){const s=document.getElementById('site');if(!s)return;const L=[...s.querySelectorAll('.s-nav nav a')],S=L.map(a=>s.querySelector(a.getAttribute('href')));s.addEventListener('scroll',()=>{const y=s.scrollTop+innerHeight*.35;let c=-1;S.forEach((e,i)=>{if(e&&e.offsetTop<=y)c=i});L.forEach((a,i)=>a.classList.toggle('on',i===c))},{passive:true})})();
// ===== mega menu (tabs) =====
(function(){const s=document.getElementById('site'),h=s&&s.querySelector('.s-nav'),t=h&&h.querySelector('.s-tg');if(!t)return;
const set=o=>{h.classList.toggle('open',o);t.setAttribute('aria-expanded',o)};
t.onclick=e=>{e.stopPropagation();set(!h.classList.contains('open'))};
h.querySelectorAll('.s-mc').forEach(b=>b.addEventListener('click',()=>set(false)));
s.addEventListener('click',e=>{if(!h.contains(e.target))set(false)});
s.addEventListener('scroll',()=>set(false),{passive:true});
addEventListener('keydown',e=>{if(e.key==='Escape')set(false)})})();

// ===== 2026 scroll motion =====
(function(){const s=document.getElementById('site');if(!s)return;
const cl=(v,a,b)=>Math.max(a,Math.min(b,v));
function wrap(node,st){[...node.childNodes].forEach(n=>{if(n.nodeType===3){const f=document.createDocumentFragment();n.textContent.split(/(\s+)/).forEach(t=>{if(!t)return;if(/^\s+$/.test(t)){f.appendChild(document.createTextNode(t));return}
 if(st.fill){const w=document.createElement('span');w.className='fw';w.textContent=t;st.ws.push(w);f.appendChild(w)}
 else{const o=document.createElement('span'),i=document.createElement('span');o.className='sw';i.className='swi';i.style.setProperty('--i',st.i++);i.textContent=t;o.appendChild(i);f.appendChild(o)}});n.replaceWith(f)}else if(n.nodeType===1)wrap(n,st)})}
// headline words rise in
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('sv');io.unobserve(e.target)}}),{root:s,threshold:.3});
s.querySelectorAll('.s-h').forEach(h=>{wrap(h,{i:0});io.observe(h)});
// paragraph words fill with scroll
const fills=[...s.querySelectorAll('#s-about .s-p')].map(p=>{const st={fill:1,ws:[]};wrap(p,st);return{p,ws:st.ws,n:-1}});
s.querySelectorAll('.s-chips,.s-card>div').forEach(g=>g.querySelectorAll('.s-chip').forEach((c,i)=>c.style.setProperty('--i',i)));
// magnetic buttons
s.querySelectorAll('.s-btn').forEach(b=>{b.addEventListener('pointermove',e=>{const r=b.getBoundingClientRect();b.style.setProperty('--mx',(e.clientX-r.left-r.width/2)*.25+'px');b.style.setProperty('--my',(e.clientY-r.top-r.height/2)*.35+'px')});b.addEventListener('pointerleave',()=>{b.style.removeProperty('--mx');b.style.removeProperty('--my')})});
const nav=s.querySelector('.s-nav'),mq=s.querySelector('.s-mq div'),hme=s.querySelector('.s-hme'),cards=[...s.querySelectorAll('#s-work .s-card')];
let last=-1,vel=0,rate=1,mqA=null;
function tick(){requestAnimationFrame(tick);if(s.style.display==='none')return;
 const st=s.scrollTop,d=last<0?0:st-last,H=innerHeight;
 vel+=(Math.abs(d)-vel)*.15;rate+=(1+Math.min(vel*.4,9)-rate)*.1;
 if(!mqA&&mq)mqA=mq.getAnimations()[0];if(mqA)mqA.playbackRate=rate;
 if(d||last<0){
  if(!nav.classList.contains('open')){if(d>6&&st>300)nav.classList.add('hide');else if(d<-4||st<300)nav.classList.remove('hide')}
  if(hme){const k=Math.min(st,H*1.2);hme.style.setProperty('--py',k*.16);hme.style.setProperty('--pb',-k*.1);hme.style.setProperty('--sc',1-k/H*.1);hme.style.opacity=Math.max(0,1-st/(H*.85))}
  fills.forEach(f=>{const r=f.p.getBoundingClientRect(),k=cl((H*.88-r.top)/(H*.5+r.height*.3),0,1),n=Math.round(k*f.ws.length);if(n!==f.n){f.n=n;f.ws.forEach((w,i)=>w.classList.toggle('on',i<n))}});
  cards.forEach((c,i)=>{const nx=cards[i+1];if(!nx)return;const k=cl(1-(nx.getBoundingClientRect().top-132)/(H*.55),0,1);c.style.transform='scale('+(1-.05*k)+')';c.style.filter='brightness('+(1-.07*k)+')'})}
 last=st}
requestAnimationFrame(tick);
})();

// ===== premium hero: cursor spotlight, wordmark parallax, faded 3D house behind =====
(function(){const s=document.getElementById('site'),hero=s&&s.querySelector('.s-hero');if(!hero)return;
hero.addEventListener('pointermove',e=>{const r=hero.getBoundingClientRect();hero.style.setProperty('--hx',e.clientX-r.left+'px');hero.style.setProperty('--hy',e.clientY-r.top+'px')});
s.addEventListener('scroll',()=>hero.style.setProperty('--sy',s.scrollTop),{passive:true});
})();
(function(){const v=window.visualViewport;if(!v)return;const f=()=>document.documentElement.style.setProperty('--kb',Math.max(0,innerHeight-v.height-v.offsetTop)+'px');v.addEventListener('resize',f);v.addEventListener('scroll',f);f()})();
