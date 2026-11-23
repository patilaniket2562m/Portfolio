(function(){
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
const WH=3.2,WT=.2;
function wsplit(a,b,cuts,fn){const pts=[a,...cuts.filter(c=>c>a+.01&&c<b-.01),b];for(let i=0;i<pts.length-1;i++)fn(pts[i],pts[i+1])}
function wallH(z,x0,x1,gaps){let a=x0;const seg=(p,q,hd)=>wsplit(p,q,[-4.5,4.5],(u,v)=>hd?bx(v-u,WH-2.3,WT,(u+v)/2,2.3,z,wallM,false):bx(v-u,WH,WT,(u+v)/2,0,z,wallM));(gaps||[]).slice().sort((p,q)=>p-q).forEach(g=>{seg(a,g-1.1);seg(g-1.1,g+1.1,1);a=g+1.1});seg(a,x1)}
function wallV(x,z0,z1,gaps){let a=z0;const seg=(p,q,hd)=>wsplit(p,q,[0],(u,v)=>hd?bx(WT,WH-2.3,v-u,x,2.3,(u+v)/2,wallM,false):bx(WT,WH,v-u,x,0,(u+v)/2,wallM));(gaps||[]).slice().sort((p,q)=>p-q).forEach(g=>{seg(a,g-1.1);seg(g-1.1,g+1.1,1);a=g+1.1});seg(a,z1)}
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
  if(!i){const g=new T.Group(),hd=new T.Mesh(new T.CylinderGeometry(.11,.11,.34,24),M(0x5a3a22,0,.45));hd.rotation.z=Math.PI/2;hd.position.y=.2;g.add(hd);const hn=new T.Mesh(new T.CylinderGeometry(.035,.035,.5,12),woodM);hn.position.y=-.05;g.add(hn);[-.12,.12].forEach(o=>{const b=new T.Mesh(new T.CylinderGeometry(.115,.115,.03,24),steel);b.rotation.z=Math.PI/2;b.position.set(o,.2,0);g.add(b)});body(g,[.17,.3,.11],info,p.x,1.31,-5.5)}
  else{const g=new T.Group(),bd=new T.Mesh(new T.BoxGeometry(.4,.03,.55),M(0x7a5230,0,.5)),pp=new T.Mesh(new T.BoxGeometry(.34,.006,.48),white),cp=new T.Mesh(new T.BoxGeometry(.14,.02,.06),steel);pp.position.y=.019;cp.position.set(0,.02,-.24);g.add(bd,pp,cp);body(g,[.2,.025,.28],info,p.x,1.03,-5.5)}});
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
 [['IMAP SYSTEMS','Full Stack Developer','01/2026 \u2013 Present',1.7,'IMAP Systems Pvt. Ltd., Mumbai','<p>Full Stack Developer building and maintaining web and mobile applications for enterprise solutions: backend APIs, database management, frontend development and production-level issue resolution.</p><div class="chips"><span>ASP.NET</span><span>C#</span><span>SQL Server</span><span>React.js</span><span>Flutter</span></div>'],['TECHNOWORLD','Full Stack Developer Intern','07/2025 \u2013 01/2026',7.4,'Technoworld Software','<p>Expanded RESTful APIs with Spring Boot, MySQL and Spring Data JPA. Built and tested full CRUD operations with form validation and structured exception handling, and connected a responsive HTML/CSS/JavaScript frontend through API integration.</p><div class="chips"><span>Spring Boot</span><span>MySQL</span><span>Spring Data JPA</span><span>REST APIs</span></div>']].forEach(([co,role,dt,z,full,html])=>{bx(.06,1.3,2.2,4.38,1.0,z,M(0x1b2420,0,.6),false);const p=new T.Mesh(new T.PlaneGeometry(2.0,1.1),new T.MeshBasicMaterial({map:tex(1024,560,(x,_w,_h)=>{x.scale(2,2);const w=512,h=280;x.fillStyle='#16231c';x.fillRect(0,0,w,h);x.strokeStyle='#b08d4a';x.lineWidth=3;x.strokeRect(14,14,w-28,h-28);x.fillStyle='#f1ece0';x.font='800 40px system-ui';x.textAlign='center';x.fillText(co,w/2,100);x.fillStyle='#d8cfb8';x.font='24px system-ui';x.fillText(role,w/2,150);x.fillStyle='#b08d4a';x.font='700 22px system-ui';x.fillText(dt,w/2,196)}),toneMapped:false}));p.position.set(4.34,1.0,z);p.rotation.y=-Math.PI/2;scene.add(p);inf(p,{t:full,tag:role+' \u00b7 '+dt,h:html})});
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
 const sh=new T.Mesh(new T.BoxGeometry(1.7,1.5,4.5),shaftM);sh.position.set(0,-.5,2.2);sh.rotation.x=.38;g.add(sh);
 if(!coarse){const l=new T.PointLight(0xffe6b8,.9,7);l.position.set(0,-.2,.8);g.add(l)}}
win(13.39,-4.5,-Math.PI/2);win(13.39,5.2,-Math.PI/2);win(-13.39,5.0,Math.PI/2);
// woven rugs
function rug(x,z,w,d,c1,c2){const t=tex(512,Math.round(512*d/w),(c,W,H)=>{c.fillStyle=c1;c.fillRect(0,0,W,H);c.strokeStyle=c2;c.lineWidth=10;c.strokeRect(14,14,W-28,H-28);c.lineWidth=3;c.strokeRect(36,36,W-72,H-72);c.fillStyle=c2;for(let i=0;i<5;i++){c.save();c.translate(W/2+(i-2)*W*.17,H/2);c.rotate(.785);c.fillRect(-18,-18,36,36);c.restore()}for(let i=0;i<4000;i++){c.fillStyle=`rgba(${rnd()>.5?255:0},${rnd()>.5?255:0},0,.04)`;c.fillRect(rnd()*W,rnd()*H,2,2)}});
 const o=new T.Mesh(new T.PlaneGeometry(w,d),new T.MeshStandardMaterial({map:t,roughness:1,bumpMap:t,bumpScale:.8}));o.rotation.x=-Math.PI/2;o.position.set(x,.035,z);o.receiveShadow=true;scene.add(o)}
rug(-9,3.8,3.6,2.4,'#7a2a2a','#e0b36a');rug(-9,-6.5,2.6,1.8,'#3d4a3a','#d9c08a');rug(0,5,3.4,2.2,'#3a5a46','#e8d9a8');rug(9,3.4,3.2,2.0,'#3a4a40','#e0b36a');
// lamp glow
if(!coarse)[[-12.6,1.9,1.4],[-4,1.9,7.9]].forEach(([x,y,z])=>{const l=new T.PointLight(0xffc88a,.8,6);l.position.set(x,y,z);scene.add(l)});
// drifting dust in the light
const N=260,pa=new Float32Array(N*3);for(let i=0;i<N;i++){pa[i*3]=(rnd()-.5)*26;pa[i*3+1]=.3+rnd()*2.7;pa[i*3+2]=(rnd()-.5)*17}
const dg=new T.BufferGeometry();dg.setAttribute('position',new T.BufferAttribute(pa,3));const dust=new T.Points(dg,new T.PointsMaterial({color:0xfff0d0,size:.035,transparent:true,opacity:.55,blending:T.AdditiveBlending,depthWrite:false}));dust.frustumCulled=false;scene.add(dust);
ANIM.push(t=>{const a=dg.attributes.position.array;for(let i=0;i<N;i++){a[i*3]+=Math.sin(t*.3+i)*.0008;a[i*3+1]+=Math.cos(t*.2+i*1.7)*.0006;a[i*3+2]+=Math.sin(t*.25+i*.7)*.0008}dg.attributes.position.needsUpdate=true});
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
const doorPivot=new T.Group();doorPivot.position.set(-7.5,0,9.0);scene.add(doorPivot);const dl=BX(2.15,2.3,.07,woodM);dl.position.set(1.08,1.15,0);dl.castShadow=true;doorPivot.add(dl);

MS(.12,2.4,.3,-7.56,1.2,9.05,trim);MS(.12,2.4,.3,-5.24,1.2,9.05,trim);MS(2.5,.12,.3,-6.4,2.36,9.05,trim);
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
 if(!piv){piv=new T.Group();piv.position.set(hx,0,hz);scene.add(piv);const sl=new T.Mesh(new T.BoxGeometry(2.12,2.28,.045),doorM);sl.position.set(1.1,1.14,0);sl.castShadow=sl.receiveShadow=true;piv.add(sl);dress(piv,.04,2.12,.045)}
 const e={x0:bx0.x0,x1:bx0.x1,y0:0,y1:2.3,z0:bx0.z0,z1:bx0.z1,cx:(bx0.x0+bx0.x1)/2,cy:1.15,cz:(bx0.z0+bx0.z1)/2,hx:(bx0.x1-bx0.x0)/2,hy:1.15,hz:(bx0.z1-bx0.z0)/2};S.push(e);
 const d={piv,e,a:open0?1:0,open:!!open0};
 d.sync=()=>{piv.rotation.y=rot0+sgn*ang*d.a;const on=d.a<.6;e.cy=on?1.15:-99;e.hy=on?1.15:0;e.y0=on?0:-99;e.y1=on?2.3:-98};
 d.toggle=()=>{if(d.open&&P.x>e.x0-.45&&P.x<e.x1+.45&&P.z>e.z0-.45&&P.z<e.z1+.45)return;d.open=!d.open};
 piv.userData.ref={name:'Door',toggle:d.toggle,label:()=>d.open?'Close door':'Open door'};ray.push(piv);
 d.sync();DR.push(d);return d}
[[-9,1],[0,-1],[9,-1]].forEach(([g,sw])=>mkdoor(g-1.1,0,0,sw,1.75,{x0:g-1.1,x1:g+1.1,z0:-.06,z1:.06},true));
[[-4.5,-4.5,-1],[-4.5,4.5,-1],[4.5,-4.5,1],[4.5,4.5,1]].forEach(([x,g,sw])=>mkdoor(x,g-1.1,-Math.PI/2,sw,1.75,{x0:x-.06,x1:x+.06,z0:g-1.1,z1:g+1.1},true));
dress(doorPivot,0,2.15,.07);
const FD=mkdoor(-7.5,9,0,1,1.65,{x0:-7.5,x1:-5.3,z0:8.93,z1:9.07},false,doorPivot);FD.front=true;
ANIM.push((t,dt)=>{DR.forEach(d=>{if(d.front&&CIN.mode!=='play')return;const tg=d.open?1:0;if(d.a!==tg){d.a+=(tg-d.a)*(1-Math.exp(-5*dt));if(Math.abs(tg-d.a)<.003)d.a=tg;d.sync()}})});
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
 if(panelOpen||!started)return;
 let f=((K.KeyW||K.ArrowUp)?1:0)-((K.KeyS||K.ArrowDown)?1:0)-touch.mz,s=((K.KeyD||K.ArrowRight)?1:0)-((K.KeyA||K.ArrowLeft)?1:0)+touch.mx;
 const l=Math.hypot(f,s);if(l>1){f/=l;s/=l}
 const sp=(K.ShiftLeft||K.ShiftRight)?5.4:3.1,sy=Math.sin(yaw),cy2=Math.cos(yaw);
 P.x+=(-sy*f+cy2*s)*sp*dt;P.z+=(-cy2*f-sy*s)*sp*dt;
 for(let i=0;i<S.length;i++){const b=S[i];if(b.y1>P.y+.2&&b.y0<P.y+1.5)pushOut(P,.32,b)}
 P.x=cl(P.x,-58,58);P.z=cl(P.z,-46,46);
 P.vy-=20*dt;P.y+=P.vy*dt;if(P.y<=0){P.y=0;P.vy=0}
 moving=Math.abs(f)+Math.abs(s)>.05&&P.y===0}
let moving=false,bob=0;
function grab(b){held=b;b.held=true;b.v.set(0,0,0);holdD=cl(b.m.position.distanceTo(cam.position),1,2.6);hv.set(0,0,0)}
function drop(){const b=held;b.held=false;b.v.copy(hv).clampLength(0,9);held=null}
function throwIt(){if(!held)return;const b=held;drop();lookDir();b.v.copy(fwd).multiplyScalar(11).add(new V3(0,1.5,0))}
function takeBook(ref){const m=ref.mesh;scene.attach(m);const p=m.position;m.rotation.set(0,Math.atan2(cam.position.x-p.x,cam.position.z-p.z),0);const hh=Math.max(ref.w,ref.d)/2*.9,b=body(m,[hh,ref.h/2,hh],ref.info,p.x,p.y,p.z);b.name=ref.info.t;grab(b)}
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
 if(e.code==='KeyE'&&!panelOpen)readIt();if(e.code==='KeyF')throwIt();if(e.code==='KeyL')fl.visible=!fl.visible;
 if(e.code.startsWith('Arrow'))e.preventDefault()});
addEventListener('keyup',e=>{delete K[e.code]});
// touch
const tz=$('#tz');
tz.addEventListener('touchstart',e=>{for(const t of e.changedTouches){if(t.clientX<innerWidth*.45&&touch.jid===null){touch.jid=t.identifier;touch.jx=t.clientX;touch.jy=t.clientY}else if(touch.lid===null){touch.lid=t.identifier;touch.lx=t.clientX;touch.ly=t.clientY;touch.mv=0}}},{passive:true});
tz.addEventListener('touchmove',e=>{if(panelOpen)return;for(const t of e.changedTouches){if(t.identifier===touch.jid){touch.mx=cl((t.clientX-touch.jx)/45,-1,1);touch.mz=cl((t.clientY-touch.jy)/45,-1,1)}else if(t.identifier===touch.lid){const dx=t.clientX-touch.lx,dy=t.clientY-touch.ly;touch.mv+=Math.abs(dx)+Math.abs(dy);yaw-=dx*.005;pitch=cl(pitch-dy*.005,-1.4,1.4);touch.lx=t.clientX;touch.ly=t.clientY}}},{passive:true});
const tend=e=>{for(const t of e.changedTouches){if(t.identifier===touch.jid){touch.jid=null;touch.mx=touch.mz=0}if(t.identifier===touch.lid){if(touch.mv<10)act();touch.lid=null}}};
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
CIN.end=()=>{CIN.mode='play';FD.a=1;FD.open=true;FD.sync();P.x=-6.4;P.z=6.6;P.y=0;P.vy=0;yaw=0;pitch=0;cam.fov=72;cam.updateProjectionMatrix();started=true;document.body.classList.remove('intro');if(CIN.after!=null){[P.x,P.z,yaw]=TP[CIN.after];pitch=0;P.y=0}CIN.after=null;lock()};
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
let last=performance.now(),first=true;
function frame(now){requestAnimationFrame(frame);if(document.hidden){last=now;return}
 const dt=Math.min(.05,(now-last)/1000);last=now;
 movePlayer(dt);
 bob+=moving?dt*9:0;const eye=1.65+(moving?Math.sin(bob)*.03:0);
 cam.position.set(P.x,P.y+eye,P.z);cam.rotation.order='YXZ';cam.rotation.set(pitch,yaw,0);lookDir();if(CIN.mode!=='play')CIN.update(now/1000,dt);
 fl.position.copy(cam.position);fl.target.position.copy(cam.position).addScaledVector(fwd,6);
 if(held){const b=held,p=b.m.position,hy=b.h[1]*b.s;let d=holdD;rc.set(cam.position,fwd);rc.far=d+.4;const h=rc.intersectObjects(solids)[0];if(h)d=Math.max(.6,h.distance-.4);
  const tg=cam.position.clone().addScaledVector(fwd,d);tg.y=cl(tg.y,hy+.02,2.9);tg.x=cl(tg.x,-58,58);tg.z=cl(tg.z,-46,46);
  const old=p.clone();p.lerp(tg,1-Math.exp(-16*dt));hv.lerp(p.clone().sub(old).divideScalar(Math.max(dt,.001)),.3);
  if(K.KeyR)b.m.rotation.y+=dt*2.5;if(K.Equal||K.NumpadAdd){b.s=Math.min(3,b.s*(1+dt*1.2));b.m.scale.setScalar(b.s)}if(K.Minus||K.NumpadSubtract){b.s=Math.max(.35,b.s*(1-dt*1.2));b.m.scale.setScalar(b.s)}}
 ANIM.forEach(f=>f(now/1000,dt));physics(dt);
 // targeting
 tgt=null;if(started&&!panelOpen){rc.setFromCamera({x:0,y:0},cam);rc.far=3.6;const hs=rc.intersectObjects(ray,true);if(hs.length){let o=hs[0].object;while(o&&!o.userData.ref&&o.parent&&o.parent!==scene)o=o.parent;if(o&&o.userData.ref&&!o.userData.ref.held)tgt=o.userData.ref,bh.setFromObject(o)}}
 const sh=held||tgt;bh.visible=!!tgt;cross.classList.toggle('on',!!sh);
 tipEl.classList.toggle('on',!!sh);if(sh){tipEl.textContent=held?held.name+' · tap/click to drop · F throw · wheel push/pull':(tgt.toggle?tgt.label()+' · click / E':tgt.book?tgt.name+' · click to take · E to read':tgt.m?tgt.name+' · click to pick up · E to read':tgt.name+' · E / click to read')}
 {const rn=roomAt();if(rn!==lastRoom){lastRoom=rn;const ri=rooms.findIndex(q=>q.n===rn);document.documentElement.style.setProperty('--cy',ACC[ri]||'#8fd6a6');Object.keys(tabs).forEach(k=>tabs[k].classList.toggle('on',rooms[k].n===rn));roomEl.textContent=rn;gb.classList.toggle('on',rn==='Garden')}}drawMM();
 if(!window.SP){if(comp)comp.render();else r.render(scene,cam)}
 if(first){first=false;$('#load').style.opacity=0;setTimeout(()=>$('#load').style.display='none',700);const g=$('#go');g.disabled=false;g.textContent='Enter the house';$('#start').hidden=false}}
$('#go').onclick=()=>CIN.begin();
requestAnimationFrame(frame);
})();


(function(){const s=document.getElementById('site');if(!s)return;const pr=s.querySelector('.s-prog'),nv=s.querySelector('.s-nav'),hc=s.querySelector('.s-hc');
const io=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;e.target.classList.add('in');io.unobserve(e.target);e.target.querySelectorAll('[data-count]').forEach(n=>{const t=+n.dataset.count,st=performance.now();(function f(now){const k=Math.min(1,(now-st)/1400);n.textContent=Math.round(t*(1-Math.pow(1-k,3)));if(k<1)requestAnimationFrame(f)})(st)})}),{root:s,threshold:.15});
s.querySelectorAll('[data-r]').forEach(e=>io.observe(e));
s.addEventListener('scroll',()=>{const st=s.scrollTop,m=Math.max(1,s.scrollHeight-s.clientHeight);pr.style.width=(st/m*100)+'%';nv.classList.toggle('s-solid',st>40);hc.style.transform='translateY('+st*.22+'px)';hc.style.opacity=Math.max(0,1-st/(innerHeight*.8));window.SP=st>innerHeight*1.05},{passive:true});
s.querySelectorAll('[data-enter]').forEach(b=>b.onclick=()=>window.HOUSE&&HOUSE.enter(b.dataset.room===undefined?null:+b.dataset.room));
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
