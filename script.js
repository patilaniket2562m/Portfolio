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
function sign(txt,x,y,z,ry,w,h,bg){const t=tex(512,Math.round(512*h/w),(c,W,H)=>{c.fillStyle=bg||'#0f1522';c.fillRect(0,0,W,H);c.fillStyle='#fff';c.font=`800 ${H*.5}px system-ui,sans-serif`;c.textAlign='center';c.textBaseline='middle';c.fillText(txt,W/2,H/2+3)});const m=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map:t,toneMapped:false}));m.position.set(x,y,z);m.rotation.y=ry;scene.add(m);return m}
function poster(t1,t2,c1,c2){return tex(1024,640,(x,w,h)=>{const g=x.createLinearGradient(0,0,w,h);g.addColorStop(0,c1);g.addColorStop(1,c2);x.fillStyle=g;x.fillRect(0,0,w,h);x.fillStyle='rgba(5,8,14,.55)';x.fillRect(0,0,w,h);x.fillStyle='rgba(255,255,255,.1)';x.fillRect(60,60,w-120,44);[0,1,2].forEach(i=>{x.fillStyle=['#ff5f57','#febc2e','#28c840'][i];x.beginPath();x.arc(84+i*30,82,8,0,6.3);x.fill()});x.fillStyle='#fff';x.font='bold 84px system-ui,sans-serif';x.fillText(t1,70,300);x.fillStyle='#bcd0ff';x.font='38px system-ui,sans-serif';x.fillText(t2,70,365);for(let i=0;i<7;i++){x.fillStyle=i%2?'rgba(0,213,255,.7)':'rgba(66,133,255,.8)';x.fillRect(70+i*70,570-(40+rnd()*130),48,40+rnd()*130)}})}
function screenTex(title,lines){return tex(512,320,(x,w,h)=>{x.fillStyle='#0a1020';x.fillRect(0,0,w,h);x.fillStyle='#141c33';x.fillRect(0,0,w,26);['#ff5f57','#febc2e','#28c840'].forEach((c,i)=>{x.fillStyle=c;x.beginPath();x.arc(14+i*16,13,4,0,6.3);x.fill()});x.fillStyle='#7dffe0';x.font='800 34px system-ui,sans-serif';x.fillText(title,28,78);x.fillStyle='#cfd8ee';x.font='20px system-ui,sans-serif';lines.forEach((l,i)=>x.fillText(l,28,120+i*30))})}
// ---- materials
const M=(c,m,ro,o)=>new T.MeshStandardMaterial(Object.assign({color:c,metalness:m,roughness:ro},o));
const wallM=M(0xe4dfd6,0,.92,{bumpMap:concT,bumpScale:.4}),trim=M(0x24201c,.3,.5),dark=M(0x15191f,.8,.35),steel=M(0xaab3c0,1,.25),white=M(0xe6e8ec,.05,.55),fabric=M(0x3b4a66,0,1),fabric2=M(0x2d3a52,0,1),leaf=M(0x2f6b3a,0,.8);
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
wallH(-9,-13.5,13.5);wallH(9,-13.5,13.5,[-6.4]);wallV(-13.5,-9,9);wallV(13.5,-9,9);
wallH(0,-13.5,13.5,[-9,0,9]);wallV(-4.5,-9,9,[-4.5,4.5]);wallV(4.5,-9,9,[-4.5,4.5]);
const ceil=new T.Mesh(new T.PlaneGeometry(27.2,18.2),M(0xf1eee8,0,.95));ceil.rotation.x=Math.PI/2;ceil.position.y=WH;ceil.receiveShadow=true;scene.add(ceil);
// rooms: floors, lights
const RD=[['Study',-9,-4.5,floorW],['Lab',0,-4.5,M(0x9aa2ae,.35,.4,{map:concT,bumpMap:concT,bumpScale:1})],['Gallery',9,-4.5,M(0xc8ccd2,.3,.35,{map:concT,bumpMap:concT,bumpScale:.6})],['Living room',-9,4.5,floorW],['Library',0,4.5,floorW],['Contact',9,4.5,M(0x80858f,.35,.4,{map:concT,bumpMap:concT,bumpScale:1})]];
RD.forEach(([n,cx,cz,fm],i)=>{rooms.push({n,cx,cz});const f=new T.Mesh(new T.PlaneGeometry(9,9),fm.isMaterial?fm:M(0xffffff,.1,.45,{map:fm,bumpMap:fm,bumpScale:.4}));f.rotation.x=-Math.PI/2;f.receiveShadow=true;scene.add(f);f.position.set(cx,0,cz);
 const pl=bx(2.6,.04,.7,cx,WH-.04,cz,glowM,false);pl.castShadow=false;const lt=new T.PointLight(0xffe0bd,1.15,12);lt.position.set(cx,2.9,cz);scene.add(lt)});
scene.add(new T.HemisphereLight(0xbfd0ff,0x3a2c20,.28));
const fl=new T.SpotLight(0xfff0d8,.9,24,.5,.6,1.3);fl.castShadow=!coarse;fl.shadow.mapSize.set(1024,1024);fl.shadow.bias=-.0005;fl.shadow.normalBias=.02;scene.add(fl,fl.target);
// helpers: bodies and info objects
function body(mesh,half,info,x,y,z){mesh.position.set(x,y,z);mesh.traverse(o=>{if(o.isMesh){o.castShadow=o.receiveShadow=true}});scene.add(mesh);const b={m:mesh,v:new V3(),h:half,s:1,info,held:false,ground:false,home:new V3(x,y,z),name:info.t};mesh.userData.ref=b;bodies.push(b);pick.push(mesh);ray.push(mesh);return b}
function inf(mesh,info){mesh.userData.ref={info,name:info.t};pick.push(mesh);ray.push(mesh);return mesh}
function cube(text,bg,size,info,x,y,z){const m=new T.Mesh(new T.BoxGeometry(size,size,size),M(0xffffff,.1,.4,{map:lab(text,bg),envMapIntensity:.6}));return body(m,[size/2,size/2,size/2],info,x,y,z)}
function table(x,z,w,d,top,m){bx(w,.06,d,x,top-.06,z,m||woodM);[[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([a,b])=>cy(.04,.04,top-.06,x+a*(w/2-.1),0,z+b*(d/2-.1),dark,8))}
function plant(x,z){cy(.22,.17,.4,x,0,z,M(0xb5683a,0,.8));for(let i=0;i<10;i++){const c=new T.Mesh(new T.PlaneGeometry(.75,.75),leafCardM);c.position.set(x+(rnd()-.5)*.25,.75+rnd()*.5,z+(rnd()-.5)*.25);c.rotation.set((rnd()-.5)*.7,rnd()*6.28,(rnd()-.5)*.7);scene.add(c)}S.push({x0:x-.22,x1:x+.22,y0:0,y1:.5,z0:z-.22,z1:z+.22,cx:x,cy:.25,cz:z,hx:.22,hy:.25,hz:.22})}
function shelf(x,z,len,axis,fs){const g=new T.Group();g.position.set(x,0,z);g.rotation.y=axis==='x'?(fs>0?0:Math.PI):(fs>0?Math.PI/2:-Math.PI/2);scene.add(g);
 const back=new T.Mesh(new T.BoxGeometry(len,2.5,.08),woodM);back.position.set(0,1.25,-.2);g.add(back);[.02,.85,1.45,2.05,2.48].forEach(y=>{const b=new T.Mesh(new T.BoxGeometry(len,.05,.42),woodM);b.position.set(0,y,0);g.add(b)});
 [-len/2,len/2].forEach(sx=>{const b=new T.Mesh(new T.BoxGeometry(.05,2.5,.42),woodM);b.position.set(sx,1.25,0);g.add(b)});
 [.05,.88,1.48,2.08].forEach(y=>{let xx=-len/2+.1;while(xx<len/2-.25){const w=.07+rnd()*.12,h=.28+rnd()*.3,bk=new T.Mesh(new T.BoxGeometry(w,h,.28),pal[(rnd()*7)|0]);bk.position.set(xx+w/2,y+h/2+.025,-.02);g.add(bk);xx+=w+.012}});
 g.traverse(o=>{if(o.isMesh)o.castShadow=o.receiveShadow=true});
 const a=axis==='x'?[len/2,.25]:[.25,len/2];S.push({x0:x-a[0],x1:x+a[0],y0:0,y1:2.5,z0:z-a[1],z1:z+a[1],cx:x,cy:1.25,cz:z,hx:a[0],hy:1.25,hz:a[1]})}
// ================= CONTENT =================
const SD={Java:'The core language behind my backend work, used in Online Auction.',Servlet:'Used to build the server side of Online Auction.',JSP:'Server-rendered pages in Online Auction.',MySQL:'My main relational database, used across my projects.','SQL Server':'Used in the Online Attendance System.','ASP.NET':'Used for the Online Attendance System.',JavaScript:'Interactivity and client-side logic.','React.js':'Component-based frontends.','Spring Boot':'Production-ready Java services and REST APIs.',Hibernate:'ORM for mapping Java objects to database tables.'};
const sk=(n,c)=>({t:n,tag:c,h:'<p>'+(SD[n]||n+' is part of my '+c.toLowerCase()+' toolkit.')+'</p>'});
const GH='https://github.com/patilaniket2562m';
// LIVING ROOM (start)
(function(){
 cy(2.3,2.3,.02,-9,0,3.8,M(0x2a3550,0,1),48);
 bx(3.2,.45,1.0,-9,.1,1.95,fabric);bx(3.2,.85,.28,-9,.45,1.4,fabric2);[-10.75,-7.25].forEach(x=>bx(.3,.65,1.0,x,.08,1.95,fabric2));
 [-9.7,-8.3].forEach(x=>{const c=new T.Mesh(new T.BoxGeometry(1.2,.16,.85),fabric);c.position.set(x,.63,1.95);scene.add(c)});
 table(-9,3.8,1.8,.9,.46);
 bx(2.8,.5,.5,-9,0,8.65,woodM);bx(2.4,1.3,.07,-9,1.0,8.8,dark);
 const tv=new T.Mesh(new T.PlaneGeometry(2.3,1.2),new T.MeshBasicMaterial({map:poster('Aniket Patil','Full Stack Developer','#4285ff','#0b1a3a'),toneMapped:false}));tv.position.set(-9,1.65,8.76);tv.rotation.y=Math.PI;scene.add(tv);
 inf(tv,{t:'Aniket Patil',tag:'Welcome home',h:'<p>I’m a Full Stack Developer building web applications with Java, Spring Boot, React.js and MySQL.</p><p>Everything in this house is interactive. Visit the Study, Lab, Gallery, Library and Contact rooms, and feel free to throw the furniture’s contents around.</p>'});
 'ANIKET'.split('').forEach((ch,i)=>cube(ch,['#4285ff','#00a8d4','#6b3df5','#4285ff','#00a8d4','#6b3df5'][i],.26,{t:'Aniket Patil',tag:'Full Stack Developer',h:'<p>Java · Spring Boot · React.js · MySQL</p><p>Based in Kolhapur, Maharashtra, India. Currently pursuing an MCA at KIT’s IMER.</p>'},-9.85+i*.34,.5+.13,8.65));
 const rm=new T.Mesh(new T.BoxGeometry(.38,.03,.52),[white,white,M(0xffffff,0,.6,{map:tex(256,360,(x,w,h)=>{x.fillStyle='#fff';x.fillRect(0,0,w,h);x.fillStyle='#1a1030';x.font='800 40px system-ui';x.fillText('RESUME',24,60);x.fillStyle='#4285ff';x.fillRect(24,80,w-48,8);for(let i=0;i<10;i++){x.fillStyle='#c9cdd6';x.fillRect(24,120+i*20,w-48-(i%3)*40,8)}})}),white,white,white]);
 body(rm,[.19,.015,.26],{t:'Resume',tag:'Download',h:'<p>My resume as a PDF. It works once the file sits next to this page on your hosting.</p>',l:'Aniket%20Patil%20-%20Resume%20(1).pdf',lt:'Download resume',dl:1},-8.5,.46+.016,3.8);
 cy(.03,.03,1.5,-12.6,0,1.4,steel,10);cy(.28,.4,.4,-12.6,1.5,1.4,M(0xfff0d0,0,.8,{emissive:0xffd9a0,emissiveIntensity:1.2}));plant(-12.8,8.1);plant(-4.9,8.1)
})();
// STUDY (About)
(function(){
 cy(2.6,2.6,.02,-9,0,-6.2,M(0x3a2a22,0,1),48);
 table(-9,-7.9,2.6,1.1,.8);bx(.6,.74,1,-10.05,0,-7.9,woodM);
 const mon=new T.Group();scene.add(mon);const bz=new T.Mesh(new T.BoxGeometry(1.3,.75,.05),dark);bz.position.set(-9,1.2,-8.3);scene.add(bz);
 const scr=new T.Mesh(new T.PlaneGeometry(1.2,.65),new T.MeshBasicMaterial({map:screenTex('About me',['Passionate Full Stack Developer','Java · Spring Boot · React · MySQL','MCA at KIT’s IMER, Kolhapur','Press E to read more']),toneMapped:false}));scr.position.set(-9,1.2,-8.27);scene.add(scr);
 cy(.05,.05,.35,-9,.8,-8.3,dark,8);
 inf(scr,{t:'About me',tag:'The Study',h:'<p>I’m a passionate Full Stack Developer with hands-on experience building real-world applications. I love designing user-friendly interfaces and solving complex problems with clean, efficient code.</p><p>I’m pursuing my MCA at KIT’s IMER, Kolhapur, combining strong backend fundamentals with modern frontend skills to deliver complete web solutions.</p><div class="chips"><span>MCA 66.09%</span><span>BCA 78.82%</span><span>Graduating 2025</span></div>'});
 const mug=new T.Mesh(new T.CylinderGeometry(.07,.07,.12,20),white);body(mug,[.07,.06,.07],{t:'Coffee mug',tag:'Fuel',h:'<p>Fuel for clean code. Go ahead, knock it over.</p>'},-8.2,.8+.065,-7.7);
 const nb=new T.Mesh(new T.BoxGeometry(.28,.03,.38),[dark,dark,M(0xffffff,0,.6,{map:tex(256,340,(x,w,h)=>{x.fillStyle='#14305c';x.fillRect(0,0,w,h);x.fillStyle='#fff';x.font='800 38px system-ui';x.fillText('NOTES',30,70);x.fillStyle='#7dffe0';x.fillRect(30,90,60,6)})}),dark,dark,dark]);
 body(nb,[.14,.015,.19],{t:'Notebook',tag:'Currently',h:'<p>Currently pursuing an MCA at KIT’s IMER, Kolhapur (2023 – 2025), strengthening backend fundamentals alongside modern frontend skills.</p>'},-9.8,.8+.016,-7.6);
 bx(.5,.08,.5,-9,.45,-6.8,fabric);bx(.9,.8,.1,-9,.5,-6.4,fabric);cy(.05,.05,.45,-9,0,-6.8,steel,8);
 shelf(-13.25,-4.5,4,'z',1);plant(-5.2,-8.1)
})();
// LAB (Skills)
(function(){
 const st=[['FRONTEND',-2.4,-8.2,0,'#e8527a',[['HTML5'],['CSS3'],['Bootstrap'],['JavaScript'],['React.js'],['JSP']]],
  ['BACKEND',2.4,-8.2,0,'#6b3df5',[['Java'],['Servlet'],['Spring'],['Spring Boot'],['Hibernate'],['JDBC'],['ASP.NET']]],
  ['DATA',-2.6,-1.3,Math.PI,'#0fa88c',[['MySQL'],['SQL Server']]],
  ['TOOLS',2.6,-1.3,Math.PI,'#d98a1c',[['Git'],['GitHub'],['VS Code'],['IntelliJ IDEA'],['Postman'],['Maven'],['REST APIs']]]];
 st.forEach(([cat,x,z,ry,col,items])=>{table(x,z,3.0,1.0,.85,M(0x2b3140,.5,.4));const dz=ry?.3:-.3;
  sign(cat,x,1.35,z+(ry?.42:-.42),ry,1.5,.32,'#10151f');
  items.forEach(([n],i)=>{const row=i<4?0:1,idx=row?i-4:i,cnt=row?items.length-4:Math.min(4,items.length),xx=x+(idx-(cnt-1)/2)*.55,zz=z+(row?(ry?-.2:.2):(ry?.2:-.2));cube(n,col,.36,sk(n,cat[0]+cat.slice(1).toLowerCase()),xx,.85+.18+.01,zz)})});
 sign('SKILLS LAB',0,2.55,-8.85,0,3.6,.6,'#0f1522');
 [[-4.2,-4.5],[4.2,-4.5]].forEach(([x,z])=>plant(x,z))
})();
// GALLERY (Projects)
(function(){
 const P=[{x:6.9,t:'Online Auction',s:'JSP · Servlet · Java · MySQL',c1:'#4285ff',c2:'#0b1a3a',d:'A dual-user platform enabling vendors to list products and customers to take part in real-time competitive bidding. Features live updates, bid tracking and secure user authentication.',tech:['JSP','Servlet','Java','MySQL']},
  {x:11.1,t:'Attendance System',s:'ASP.NET · SQL Server · JavaScript',c1:'#00a0c0',c2:'#07202b',d:'A web-based attendance management system with role-based access control for teachers and students, automated reports, dashboard analytics and secure login flows.',tech:['ASP.NET','SQL Server','JavaScript','MySQL']}];
 P.forEach((p,i)=>{const info={t:i?'Online Attendance System':p.t,tag:'Project 0'+(i+1),h:'<p>'+p.d+'</p><div class="chips">'+p.tech.map(t=>'<span>'+t+'</span>').join('')+'</div>',l:GH,lt:'View code on GitHub'};
  bx(3.7,2.4,.1,p.x,.5,-8.85,dark);const pm=new T.Mesh(new T.PlaneGeometry(3.4,2.12),new T.MeshBasicMaterial({map:poster(p.t,p.s,p.c1,p.c2),toneMapped:false}));pm.position.set(p.x,1.66,-8.78);scene.add(pm);inf(pm,info);
  bx(.9,1.0,.9,p.x+.7*(i?-1:1),0,-5.5,M(0xe6e8ec,.1,.55));
  const px=p.x+.7*(i?-1:1);
  if(!i){const g=new T.Group(),hd=new T.Mesh(new T.CylinderGeometry(.11,.11,.34,24),M(0x5a3a22,0,.45));hd.rotation.z=Math.PI/2;hd.position.y=.2;g.add(hd);const hn=new T.Mesh(new T.CylinderGeometry(.035,.035,.5,12),woodM);hn.position.y=-.05;g.add(hn);[-.12,.12].forEach(o=>{const b=new T.Mesh(new T.CylinderGeometry(.115,.115,.03,24),steel);b.rotation.z=Math.PI/2;b.position.set(o,.2,0);g.add(b)});body(g,[.17,.3,.11],info,px,1.0+.3+.01,-5.5)}
  else{const g=new T.Group(),bd=new T.Mesh(new T.BoxGeometry(.4,.03,.55),M(0x7a5230,0,.5)),pp=new T.Mesh(new T.BoxGeometry(.34,.006,.48),white),cp=new T.Mesh(new T.BoxGeometry(.14,.02,.06),steel);pp.position.y=.019;cp.position.set(0,.02,-.24);g.add(bd,pp,cp);body(g,[.2,.025,.28],info,px,1.0+.03,-5.5)}});
 sign('PROJECTS',9,2.75,-8.85,0,3.2,.5,'#0f1522');
 bx(2.2,.45,.55,9,0,-1.7,woodM);bx(2.2,.45,.55,9,0,-7.9,woodM,false);plant(13,-8.3)
})();
// LIBRARY (Education)
(function(){
 shelf(0,8.75,7.6,'x',-1);cy(2.2,2.2,.02,0,0,5,M(0x4a2b2b,0,1),48);table(0,5,2.6,1.1,.8);
 [['MCA','KIT’s IMER, Kolhapur','2023 – 2025','66.09%','#14305c'],['BCA','New College, Kolhapur','2021 – 2023','78.82%','#4a1f2f'],['HSC','LTDP College Kalkundri','2018 – 2020','59.23%','#1f4a35']].forEach(([d,c,y,p,col],i)=>{
  const m=new T.Mesh(new T.BoxGeometry(.5,.09,.38),[M(0xf2ead6,0,.8),M(0xf2ead6,0,.8),M(0xffffff,.1,.5,{map:lab(d,col)}),M(0xf2ead6,0,.8),M(col,0,.6),M(col,0,.6)]);
  body(m,[.25,.045,.19],{t:d,tag:'Education',h:'<p><b>'+c+'</b><br>'+y+'</p><div class="chips"><span>'+p+'</span></div>'},-.8+i*.8,.8+.046,5+(i%2?.05:-.05))});
 bx(1.1,.7,1.0,-3.0,.05,2.1,fabric);bx(1.1,.8,.2,-3.0,.4,1.6,fabric2);
 [['EXPERIENCE',1.7],['CERTIFICATIONS',7.4]].forEach(([t,z])=>{const bd=bx(.06,1.3,2.2,4.38,1.0,z,M(0x1b2233,0,.6),false);const p=new T.Mesh(new T.PlaneGeometry(2.0,1.1),new T.MeshBasicMaterial({map:tex(512,280,(x,w,h)=>{x.fillStyle='#10192e';x.fillRect(0,0,w,h);x.setLineDash([12,8]);x.strokeStyle='#4285ff';x.lineWidth=3;x.strokeRect(14,14,w-28,h-28);x.fillStyle='#fff';x.font='800 38px system-ui';x.textAlign='center';x.fillText(t,w/2,110);x.fillStyle='#a9b4cc';x.font='24px system-ui';x.fillText('Add yours here',w/2,160)}),toneMapped:false}));p.position.set(4.34,1.0,z);p.rotation.y=-Math.PI/2;scene.add(p);
  inf(p,{t:t[0]+t.slice(1).toLowerCase(),tag:'Placeholder',h:'<p>Your original portfolio listed no '+t.toLowerCase()+', so nothing is invented here. Add your details to this board in the code.</p>'})});
 cy(.03,.03,1.5,-4.0,0,7.9,steel,10);cy(.26,.36,.36,-4.0,1.5,7.9,M(0xfff0d0,0,.8,{emissive:0xffd9a0,emissiveIntensity:1.2}))
})();
// CONTACT
(function(){
 bx(3.4,1.0,.9,9,0,5.6,M(0x20262f,.4,.5));cy(2.4,2.4,.02,9,0,3.4,M(0x1a2a44,0,1),48);
 const lg=new T.Group(),lb=new T.Mesh(new T.BoxGeometry(.6,.03,.4),steel),ls=new T.Group();ls.position.set(0,.015,-.2);ls.rotation.x=-.35;const sh=new T.Mesh(new T.BoxGeometry(.6,.4,.02),dark);sh.position.y=.2;const sc2=new T.Mesh(new T.PlaneGeometry(.55,.35),new T.MeshBasicMaterial({map:screenTex('Let’s talk',['Say hello','patilaniket2562m','@gmail.com']),toneMapped:false}));sc2.position.set(0,.2,.011);ls.add(sh,sc2);lg.add(lb,ls);lg.position.set(8.2,1.0,5.6);lg.rotation.y=Math.PI;scene.add(lg);
 inf(lg,{t:'Send a message',tag:'Contact',form:1,h:'<p>Have a project or opportunity in mind? Write below and your email app will open with the message ready.</p>'});
 const ph=new T.Mesh(new T.BoxGeometry(.09,.012,.19),[dark,dark,M(0x0b1a33,.2,.2,{emissive:0x2060ff,emissiveIntensity:.5}),dark,dark,dark]);
 body(ph,[.05,.007,.1],{t:'Phone',tag:'Call me',h:'<p>+91 9112261074</p>',l:'tel:+919112261074',lt:'Call now'},9.2,1.0+.007,5.5);
 const ev=new T.Mesh(new T.BoxGeometry(.28,.012,.19),[white,white,M(0xffffff,0,.7,{map:tex(256,180,(x,w,h)=>{x.fillStyle='#f4efe3';x.fillRect(0,0,w,h);x.strokeStyle='#bfb59c';x.lineWidth=3;x.beginPath();x.moveTo(0,0);x.lineTo(w/2,h*.6);x.lineTo(w,0);x.stroke();x.fillStyle='#4285ff';x.font='800 30px system-ui';x.textAlign='center';x.fillText('EMAIL ME',w/2,h*.88)})}),white,white,white]);
 body(ev,[.14,.007,.1],{t:'Letter',tag:'Email',h:'<p>patilaniket2562m@gmail.com</p>',l:'mailto:patilaniket2562m@gmail.com',lt:'Write an email'},9.8,1.0+.007,5.5);
 cube('GitHub','#24292f',.3,{t:'GitHub',tag:'Code',h:'<p>github.com/patilaniket2562m</p>',l:GH,lt:'Open GitHub'},10.3,1.0+.15,5.65);
 cube('LinkedIn','#0a66c2',.3,{t:'LinkedIn',tag:'Network',h:'<p>Connect with me on LinkedIn.</p>',l:'https://linkedin.com/in/Aniket-patil-5b6a78260',lt:'Open LinkedIn'},10.7,1.0+.15,5.65);
 const dr=bx(1.3,2.3,.08,9,0,8.86,woodM,false);cy(.03,.03,.16,9.45,1.0,8.8,steel,8).rotation.x=Math.PI/2;
 sign('CONTACT',9,2.75,3.6,Math.PI,2.4,.45,'#0f1522');
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
function win(x,z,ry){const g=new T.Group();g.position.set(x,1.75,z);g.rotation.y=ry;scene.add(g);const a=(w,h,d,px,py,pz,m)=>{const o=BX(w,h,d,m);o.position.set(px,py,pz);g.add(o)};
 g.add(new T.Mesh(new T.PlaneGeometry(1.7,1.5),new T.MeshBasicMaterial({map:skyT,toneMapped:false})));
 a(1.9,.1,.12,0,.8,.04,frM);a(1.9,.1,.12,0,-.8,.04,frM);a(.1,1.7,.12,-.9,0,.04,frM);a(.1,1.7,.12,.9,0,.04,frM);a(.05,1.5,.06,0,0,.03,frM);a(1.7,.05,.06,0,0,.03,frM);a(2.1,.08,.3,0,-.88,.12,frM);
 a(.45,2.9,.1,-1.25,-.3,.1,curt);a(.45,2.9,.1,1.25,-.3,.1,curt);
 const sh=new T.Mesh(new T.BoxGeometry(1.7,1.5,4.5),shaftM);sh.position.set(0,-.5,2.2);sh.rotation.x=.38;g.add(sh);
 if(!coarse){const l=new T.PointLight(0xffe6b8,.9,7);l.position.set(0,-.2,.8);g.add(l)}}
win(13.39,-4.5,-Math.PI/2);win(13.39,5.2,-Math.PI/2);win(-13.39,5.0,Math.PI/2);
// framed art
function art(x,y,z,ry,w,h,hue){const t=tex(256,Math.round(256*h/w),(c,W,H)=>{const g=c.createLinearGradient(0,0,W,H);g.addColorStop(0,`hsl(${hue},60%,22%)`);g.addColorStop(1,`hsl(${hue+50},70%,52%)`);c.fillStyle=g;c.fillRect(0,0,W,H);for(let i=0;i<7;i++){c.fillStyle=`hsla(${hue+rnd()*90},70%,${50+rnd()*30}%,.55)`;c.beginPath();c.arc(rnd()*W,rnd()*H,14+rnd()*50,0,6.3);c.fill()}});
 const g=new T.Group();g.position.set(x,y,z);g.rotation.y=ry;scene.add(g);g.add(BX(w+.12,h+.12,.05,woodM));const p=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshStandardMaterial({map:t,roughness:.6}));p.position.z=.03;g.add(p)}
art(-6.4,1.8,-8.86,0,1.2,.8,210);art(-11.8,1.8,-8.86,0,.8,1.1,20);art(-11.5,1.8,.11,0,1.2,.8,340);art(-6.5,1.8,.11,0,.9,.9,150);art(6.2,1.8,.11,0,1.2,.8,260);art(11.8,1.8,.11,0,.8,1.1,40);
// woven rugs
function rug(x,z,w,d,c1,c2){const t=tex(512,Math.round(512*d/w),(c,W,H)=>{c.fillStyle=c1;c.fillRect(0,0,W,H);c.strokeStyle=c2;c.lineWidth=10;c.strokeRect(14,14,W-28,H-28);c.lineWidth=3;c.strokeRect(36,36,W-72,H-72);c.fillStyle=c2;for(let i=0;i<5;i++){c.save();c.translate(W/2+(i-2)*W*.17,H/2);c.rotate(.785);c.fillRect(-18,-18,36,36);c.restore()}for(let i=0;i<4000;i++){c.fillStyle=`rgba(${rnd()>.5?255:0},${rnd()>.5?255:0},0,.04)`;c.fillRect(rnd()*W,rnd()*H,2,2)}});
 const o=new T.Mesh(new T.PlaneGeometry(w,d),new T.MeshStandardMaterial({map:t,roughness:1,bumpMap:t,bumpScale:.8}));o.rotation.x=-Math.PI/2;o.position.set(x,.035,z);o.receiveShadow=true;scene.add(o)}
rug(-9,3.8,3.6,2.4,'#7a2a2a','#e0b36a');rug(-9,-6.5,2.6,1.8,'#233a5e','#d9c08a');rug(0,5,3.4,2.2,'#3a5a46','#e8d9a8');rug(9,3.4,3.2,2.0,'#2a3b66','#e0b36a');
// lamp glow
if(!coarse)[[-12.6,1.9,1.4],[-4,1.9,7.9]].forEach(([x,y,z])=>{const l=new T.PointLight(0xffc88a,.8,6);l.position.set(x,y,z);scene.add(l)});
// live wall clock
const ck=new T.Group();ck.position.set(-4.38,2.35,2.0);ck.rotation.y=Math.PI/2;scene.add(ck);
const cd=new T.Mesh(new T.CylinderGeometry(.3,.3,.04,40),dark);cd.rotation.x=Math.PI/2;ck.add(cd);
const cf=new T.Mesh(new T.CircleGeometry(.27,40),new T.MeshBasicMaterial({map:tex(256,256,(c,W)=>{c.fillStyle='#f6f1e6';c.fillRect(0,0,W,W);c.fillStyle='#222';for(let i=0;i<12;i++){c.save();c.translate(128,128);c.rotate(i*Math.PI/6);c.fillRect(-4,-118,8,i%3?14:26);c.restore()}}),toneMapped:false}));cf.position.z=.025;ck.add(cf);
const hand=(l,w,c,z)=>{const g=new T.Group(),m=new T.Mesh(new T.BoxGeometry(w,l,.006),new T.MeshBasicMaterial({color:c}));m.position.y=l/2;g.add(m);g.position.z=z;ck.add(g);return g},hH=hand(.15,.02,0x111111,.03),hM=hand(.22,.014,0x111111,.033),hS=hand(.24,.006,0xd02020,.036);
ANIM.push(()=>{const d=new Date(),s=d.getSeconds(),m=d.getMinutes();hH.rotation.z=-(d.getHours()%12+m/60)/12*6.283;hM.rotation.z=-(m+s/60)/60*6.283;hS.rotation.z=-s/60*6.283});
// ceiling fan
const fan=new T.Group();fan.position.set(-9,2.95,2.2);scene.add(fan);fan.add(new T.Mesh(new T.CylinderGeometry(.1,.1,.12,16),dark));
for(let i=0;i<4;i++){const b=BX(.75,.015,.16,woodM);b.position.set(Math.cos(i*1.571)*.45,0,Math.sin(i*1.571)*.45);b.rotation.y=-i*1.571;fan.add(b)}
ANIM.push((t,dt)=>{fan.rotation.y+=dt*4});
// drifting dust in the light
const N=260,pa=new Float32Array(N*3);for(let i=0;i<N;i++){pa[i*3]=(rnd()-.5)*26;pa[i*3+1]=.3+rnd()*2.7;pa[i*3+2]=(rnd()-.5)*17}
const dg=new T.BufferGeometry();dg.setAttribute('position',new T.BufferAttribute(pa,3));const dust=new T.Points(dg,new T.PointsMaterial({color:0xfff0d0,size:.035,transparent:true,opacity:.55,blending:T.AdditiveBlending,depthWrite:false}));dust.frustumCulled=false;scene.add(dust);
ANIM.push(t=>{const a=dg.attributes.position.array;for(let i=0;i<N;i++){a[i*3]+=Math.sin(t*.3+i)*.0008;a[i*3+1]+=Math.cos(t*.2+i*1.7)*.0006;a[i*3+2]+=Math.sin(t*.25+i*.7)*.0008}dg.attributes.position.needsUpdate=true});
// ---- CHARACTER: Aniket at his desk (swivels and waves when you approach)
const skin=M(0xd9a47a,0,.7),shirt=M(0x1f6fd1,0,.9),pants=M(0x232a3a,0,.9),hairM=M(0x15110f,0,.6);
const av=new T.Group();av.position.set(-9,.53,-6.95);scene.add(av);
const ad=(m,x,y,z,p)=>{(p||av).add(m);m.position.set(x,y,z);m.castShadow=true;return m};
[-1,1].forEach(s=>{ad(BX(.15,.14,.5,pants),s*.1,.07,-.2);ad(BX(.13,.5,.13,pants),s*.1,-.22,-.42);ad(BX(.14,.07,.24,dark),s*.1,-.5,-.48)});
ad(new T.Mesh(new T.CylinderGeometry(.19,.16,.56,20),shirt),0,.36,0).scale.z=.7;
ad(new T.Mesh(new T.CylinderGeometry(.05,.05,.08,10),skin),0,.68,0);
const head=new T.Group();ad(head,0,.84,0);
ad(new T.Mesh(new T.SphereGeometry(.125,24,18),skin),0,0,0,head);ad(new T.Mesh(new T.SphereGeometry(.132,24,18,0,6.3,0,1.2),hairM),0,.015,.012,head);ad(new T.Mesh(new T.SphereGeometry(.015,8,6),skin),0,-.015,-.125,head);
[-1,1].forEach(s=>{ad(new T.Mesh(new T.SphereGeometry(.014,8,6),dark),s*.045,.012,-.113,head);const g=new T.Mesh(new T.TorusGeometry(.034,.005,6,18),dark);ad(g,s*.045,.012,-.122,head)});
const arms=[-1,1].map(s=>{const g=new T.Group();ad(g,s*.24,.58,0);const u=BX(.09,.09,.5,shirt);u.position.z=-.25;u.castShadow=true;g.add(u);const h=new T.Mesh(new T.SphereGeometry(.05,12,10),skin);h.position.z=-.52;g.add(h);g.rotation.x=-.5;return g});
const bt=tex(512,160,(c,W,H)=>{c.fillStyle='rgba(255,255,255,.96)';c.beginPath();c.rect(8,8,W-16,H-40);c.fill();c.fillStyle='#10182b';c.font='800 46px system-ui';c.textAlign='center';c.fillText('Hi, I’m Aniket! 👋',W/2,82)});
const bub=new T.Sprite(new T.SpriteMaterial({map:bt,transparent:true,opacity:0}));bub.scale.set(1.2,.375,1);bub.position.set(-9,1.85,-6.95);scene.add(bub);
inf(av,{t:'Aniket Patil',tag:'The developer',h:'<p>Yes, that’s me, deep in code. Check my screen for the full story, or look around the house.</p>'});
ANIM.push((t,dt)=>{const dx=P.x-av.position.x,dz=P.z-av.position.z,near=Math.hypot(dx,dz)<4.2;const ty=near?Math.atan2(-dx,-dz):0,df=((ty-av.rotation.y+Math.PI*3)%(Math.PI*2))-Math.PI;av.rotation.y+=df*Math.min(1,dt*3);const w=near&&Math.abs(df)<.5,k=Math.min(1,dt*6);
 arms.forEach((a,i)=>{const tx=(i&&w)?1.4:-.5+(near?0:Math.sin(t*13+i*2)*.035);a.rotation.x+=(tx-a.rotation.x)*k;a.rotation.z=(i&&w)?Math.sin(t*8)*.35:0});
 head.rotation.x=Math.sin(t*1.3)*.03;bub.material.opacity+=((w?1:0)-bub.material.opacity)*Math.min(1,dt*5)});
// ---- CHARACTER: Bug the cat wandering the living room
const cat=new T.Group(),fur=M(0xc9793a,0,.95),cb=new T.Mesh(new T.SphereGeometry(.1,16,12),fur);cb.scale.set(1.9,.85,.85);cb.position.y=.17;cat.add(cb);
const chd=new T.Mesh(new T.SphereGeometry(.07,16,12),fur);chd.position.set(.2,.22,0);cat.add(chd);
[-1,1].forEach(s=>{const e=new T.Mesh(new T.ConeGeometry(.025,.05,4),fur);e.position.set(.2,.29,s*.04);cat.add(e);const ey=new T.Mesh(new T.SphereGeometry(.01,8,6),new T.MeshBasicMaterial({color:0x66ff88}));ey.position.set(.265,.235,s*.03);cat.add(ey)});
const tail=new T.Group();tail.position.set(-.18,.2,0);const tl=new T.Mesh(new T.CylinderGeometry(.012,.02,.28,8),fur);tl.position.y=.14;tail.add(tl);cat.add(tail);
const legs=[[.1,.05],[.1,-.05],[-.1,.05],[-.1,-.05]].map(([lx,lz])=>{const g=new T.Group();g.position.set(lx,.1,lz);const l=new T.Mesh(new T.CylinderGeometry(.015,.013,.1,6),fur);l.position.y=-.05;g.add(l);cat.add(g);return g});
cat.traverse(o=>{if(o.isMesh)o.castShadow=true});cat.scale.setScalar(1.25);cat.position.set(-11.5,0,6.5);scene.add(cat);
inf(cat,{t:'Bug the cat',tag:'Resident debugger',h:'<p>Meow. I live here, sleep on the keyboard and introduce most of the bugs. Don’t tell anyone.</p>'});
const wp=[[-11.5,6.5],[-6.5,6.5],[-6.4,3],[-12,3.3]],nb=[[1,3],[0,2],[1],[0]];let ci=0,cn=0,wait=1;
ANIM.push((t,dt)=>{if(wait>0){wait-=dt;tail.rotation.z=.4+Math.sin(t*2)*.3;legs.forEach(l=>l.rotation.z=0);cat.position.y=0;if(wait<=0){const o=nb[ci];cn=o[(rnd()*o.length)|0]}return}
 const dx=wp[cn][0]-cat.position.x,dz=wp[cn][1]-cat.position.z,d=Math.hypot(dx,dz);if(d<.08){ci=cn;wait=2+rnd()*4;return}
 cat.position.x+=dx/d*.55*dt;cat.position.z+=dz/d*.55*dt;const th=Math.atan2(-dz,dx),df=((th-cat.rotation.y+Math.PI*3)%(Math.PI*2))-Math.PI;cat.rotation.y+=df*Math.min(1,dt*6);
 legs.forEach((l,i)=>l.rotation.z=Math.sin(t*9+(i%2?3.14:0)+(i>1?1.5:0))*.5);cat.position.y=Math.abs(Math.sin(t*9))*.01;tail.rotation.z=.9+Math.sin(t*4)*.15});

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
scene.background=new T.Color(0xcfe0f0);scene.fog=new T.Fog(0xcfe0f0,45,130);cam.far=220;cam.updateProjectionMatrix();
const skyD=new T.Mesh(new T.SphereGeometry(150,32,16),new T.MeshBasicMaterial({map:tex(16,512,(x,w,h)=>{const g=x.createLinearGradient(0,0,0,h);g.addColorStop(0,'#2f6fc4');g.addColorStop(.38,'#6fa8e6');g.addColorStop(.5,'#cfe3f4');g.addColorStop(1,'#cfe3f4');x.fillStyle=g;x.fillRect(0,0,w,h)}),side:T.BackSide,fog:false,depthWrite:false,toneMapped:false}));skyD.renderOrder=-1;scene.add(skyD);
const clT=tex(256,128,(x,w,h)=>{for(let i=0;i<14;i++){const cx=40+rnd()*176,cy2=50+rnd()*30,rr=24+rnd()*30,g=x.createRadialGradient(cx,cy2,0,cx,cy2,rr);g.addColorStop(0,'rgba(255,255,255,.55)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,w,h)}});
for(let i=0;i<11;i++){const s=new T.Sprite(new T.SpriteMaterial({map:clT,transparent:true,depthWrite:false,fog:false,opacity:.9})),a=rnd()*6.28;s.position.set(Math.cos(a)*(70+rnd()*40),38+rnd()*30,Math.sin(a)*(70+rnd()*40));s.scale.set(70,35,1);scene.add(s)}
const gT=tex(256,256,(x,w,h)=>{x.fillStyle='#3f6b2c';x.fillRect(0,0,w,h);for(let i=0;i<9000;i++){x.fillStyle=`hsla(${85+rnd()*35},${40+rnd()*25}%,${18+rnd()*22}%,.5)`;x.fillRect(rnd()*w,rnd()*h,1+rnd(),2+rnd()*3)}},true,[140,140]);
const gnd=new T.Mesh(new T.PlaneGeometry(700,700),new T.MeshStandardMaterial({map:gT,bumpMap:gT,bumpScale:.8,roughness:1,envMapIntensity:.3}));gnd.rotation.x=-Math.PI/2;gnd.position.y=-.02;gnd.receiveShadow=true;scene.add(gnd);
const rdT=tex(512,256,(x,w,h)=>{x.fillStyle='#34373c';x.fillRect(0,0,w,h);for(let i=0;i<6000;i++){x.fillStyle=`rgba(${rnd()>.5?255:0},${rnd()>.5?255:0},0,.05)`;x.fillRect(rnd()*w,rnd()*h,2,2)}x.fillStyle='#e8e2b8';for(let i=0;i<4;i++)x.fillRect(i*128+20,h/2-3,70,6)},true,[30,1]);
const road=new T.Mesh(new T.PlaneGeometry(300,10),new T.MeshStandardMaterial({map:rdT,roughness:.9}));road.rotation.x=-Math.PI/2;road.position.set(0,.005,33);road.receiveShadow=true;scene.add(road);
const stoneM=M(0x8b8478,0,.95,{bumpMap:concT,bumpScale:.8}),pathM=M(0xc9c3b6,0,.9,{bumpMap:concT,bumpScale:.4});
MS(300,.12,2.2,0,.06,27.6,M(0xb5b2aa,0,.9));MS(1.8,.06,16,-6.4,.03,19.7,pathM);MS(5.2,.1,2.8,-6.4,-.02,10.5,pathM);
// house shell: roof, plinth, slat cladding, canopy, posts
MS(29.4,.35,20.4,0,3.425,0,M(0x2a2d33,.3,.6));
MS(27.4,.55,.14,0,.275,9.1,stoneM);MS(27.4,.55,.14,0,.275,-9.1,stoneM);[-13.6,13.6].forEach(x=>MS(.14,.55,18.2,x,.275,0,stoneM));
const slatT=tex(256,256,(x,w,h)=>{for(let i=0;i<16;i++){x.fillStyle=`hsl(28,${40+rnd()*10}%,${24+rnd()*10}%)`;x.fillRect(i*16,0,14,h);x.fillStyle='#120b06';x.fillRect(i*16+14,0,2,h)}});
MS(5.5,3,.08,10.5,1.6,9.14,M(0xffffff,0,.6,{map:slatT}));MS(5.5,3,.08,-10.5,1.6,-9.14,M(0xffffff,0,.6,{map:slatT}));
MS(5.6,.14,3.1,-6.4,2.85,10.55,trim);[-8.9,-3.9].forEach(x=>cy(.07,.07,2.8,x,0,11.6,trim,10));
// door
const doorPivot=new T.Group();doorPivot.position.set(-7.5,0,9.0);scene.add(doorPivot);const dl=BX(2.15,2.3,.07,woodM);dl.position.set(1.08,1.15,0);dl.castShadow=true;doorPivot.add(dl);
const kn=new T.Mesh(new T.SphereGeometry(.04,10,8),steel);kn.position.set(1.95,1.1,.06);doorPivot.add(kn);
MS(.12,2.4,.3,-7.56,1.2,9.05,trim);MS(.12,2.4,.3,-5.24,1.2,9.05,trim);MS(2.5,.12,.3,-6.4,2.36,9.05,trim);
// lit windows seen from outside
const gl=tex(64,64,(x,w,h)=>{const g=x.createLinearGradient(0,0,0,h);g.addColorStop(0,'#ffe2b0');g.addColorStop(1,'#a8743c');x.fillStyle=g;x.fillRect(0,0,w,h);x.fillStyle='rgba(255,255,255,.18)';x.beginPath();x.moveTo(0,40);x.lineTo(40,0);x.lineTo(64,0);x.lineTo(0,64);x.fill()});
function glass(x,z,ry,w){const g=new T.Group();g.position.set(x,1.75,z);g.rotation.y=ry;scene.add(g);g.add(new T.Mesh(new T.PlaneGeometry(w,1.5),new T.MeshBasicMaterial({map:gl})));
 [[w+.2,.1,0,.8],[w+.2,.1,0,-.8],[.1,1.7,-w/2-.05,0],[.1,1.7,w/2+.05,0],[.06,1.5,0,0],[w,.05,0,0]].forEach(([a,b,c,d])=>{const o=BX(a,b,.1,trim);o.position.set(c,d,.03);g.add(o)});const s=BX(w+.3,.06,.3,stoneM);s.position.set(0,-.87,.12);g.add(s)}
[-11,-2.5,2.5].forEach(x=>glass(x,9.12,0,2.4));[-4.5,5.2].forEach(z=>glass(13.62,z,Math.PI/2,1.9));[-4.5,5].forEach(z=>glass(-13.62,z,-Math.PI/2,1.9));[-9,0,9].forEach(x=>glass(x,-9.12,Math.PI,2.4));
// garden
const gr=[M(0x2f5a2a,0,1,{bumpMap:concT,bumpScale:2}),M(0x3d7035,0,1,{bumpMap:concT,bumpScale:2}),M(0x25492a,0,1,{bumpMap:concT,bumpScale:2})];
function tree(x,z,s){const g=new T.Group();g.position.set(x,0,z);scene.add(g);const t=new T.Mesh(new T.CylinderGeometry(.16*s,.3*s,2.8*s,10),M(0x4a3524,0,1,{bumpMap:concT,bumpScale:2}));t.position.y=1.4*s;g.add(t);
 for(let i=0;i<4;i++){const f=new T.Mesh(new T.IcosahedronGeometry((1+rnd()*.5)*s,1),gr[2]);f.position.set((rnd()-.5)*1.4*s,(3.2+rnd()*1.4)*s,(rnd()-.5)*1.4*s);g.add(f)}
 for(let i=0;i<36;i++){const c=new T.Mesh(new T.PlaneGeometry(2.2*s,2.2*s),leafCardM),a=rnd()*6.28,rr=rnd()*1.7*s;c.position.set(Math.cos(a)*rr,(2.9+rnd()*2.4)*s,Math.sin(a)*rr);c.rotation.set((rnd()-.5)*1.4,rnd()*6.28,(rnd()-.5)*1.4);g.add(c)}
 g.traverse(o=>{if(o.isMesh&&o.material!==leafCardM)o.castShadow=true})}
[[-20,15,1.2],[-26,3,1.4],[-22,-10,1.3],[22,14,1.2],[27,2,1.5],[21,-12,1.3],[-10,-17,1.2],[2,-19,1.4],[15,-17,1.2],[-32,20,1.5],[31,21,1.4],[10,19,1],[-14.5,17,.9]].forEach(a=>tree(...a));
[[-11,10.8,5],[.5,10.8,5],[10.5,10.8,5]].forEach(([x,z,w])=>{const h=MS(w,.9,.7,x,.45,z,gr[1])});
const lampG=new T.MeshBasicMaterial({color:new T.Color(3,2.5,1.7)});[14,20,26].forEach(z=>{cy(.04,.05,1.2,-5.2,0,z,dark,8);sp(.1,lampG,-5.2,1.3,z)});
if(!coarse){const dl2=new T.PointLight(0xffd9a0,.9,7);dl2.position.set(-6.4,2.5,10.6);scene.add(dl2)}
// sun + daylight (ramps off indoors)
const sun=new T.DirectionalLight(0xfff0d6,coarse?0:1.4);sun.position.set(-26,38,34);scene.add(sun,sun.target);
if(!coarse){sun.castShadow=true;sun.shadow.mapSize.set(4096,4096);const c=sun.shadow.camera;c.left=-34;c.right=34;c.top=30;c.bottom=-30;c.near=5;c.far=120;sun.shadow.bias=-.0004;sun.shadow.normalBias=.04}
const outH=new T.HemisphereLight(0xcfe3ff,0x56683f,0);scene.add(outH);ANIM.push(()=>{outH.intensity=(coarse?1.3:.6)*cl((cam.position.z-8.4)/2,0,1)});

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
const paint=[0x93ad94,0x8aa0c0,0xefece6,0xe0c9a8,0xd1a84f,0x5fa3a0].map(c=>{const m=wallM.clone();m.color.set(c);m.roughness=.97;m.metalness=0;m.envMapIntensity=.25;return m});
const roomIdx=(x,z)=>Math.abs(x)>13.35||Math.abs(z)>8.85?-1:(z<0?0:3)+(x<-4.5?0:x<4.5?1:2);
scene.traverse(o=>{if(!o.isMesh||o.material!==wallM||o.geometry.type!=='BoxGeometry')return;const p=o.geometry.parameters,q=o.position,e=.2,f=(x,z)=>{const i=roomIdx(x,z);return i<0?wallM:paint[i]},hx=p.width/2,hz=p.depth/2;
 o.material=p.width>p.depth?[wallM,wallM,wallM,wallM,f(q.x,q.z+hz+e),f(q.x,q.z-hz-e)]:[f(q.x+hx+e,q.z),f(q.x-hx-e,q.z),wallM,wallM,wallM,wallM]});
const LC=[0xfff0d0,0xe3efff,0xffffff,0xffd7a8,0xffd9a0,0xfff0e0],LI=[1.05,1.1,1,1,1.05,1.3];
scene.traverse(o=>{if(o.isPointLight&&Math.abs(o.position.y-2.9)<.01){const i=rooms.findIndex(q=>q.cx===o.position.x&&q.cz===o.position.z);if(i>=0){o.color.set(LC[i]);o.intensity*=LI[i]}}});
skirt.color.set(0xf4f1ea);skirt.metalness=0;skirt.roughness=.7;

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
  bodies.forEach(b=>{if(b.held)return;if(b.ground){const f=Math.exp(-5*h);b.v.x*=f;b.v.z*=f}const p=b.m.position;if(p.y<-4||Math.abs(p.x)>14||Math.abs(p.z)>9.6){p.copy(b.home);b.v.set(0,0,0)}})}
}
function lookDir(){fwd.set(-Math.sin(yaw)*Math.cos(pitch),Math.sin(pitch),-Math.cos(yaw)*Math.cos(pitch))}
function movePlayer(dt){
 if(panelOpen||!started)return;
 let f=((K.KeyW||K.ArrowUp)?1:0)-((K.KeyS||K.ArrowDown)?1:0)-touch.mz,s=((K.KeyD||K.ArrowRight)?1:0)-((K.KeyA||K.ArrowLeft)?1:0)+touch.mx;
 const l=Math.hypot(f,s);if(l>1){f/=l;s/=l}
 const sp=(K.ShiftLeft||K.ShiftRight)?5.4:3.1,sy=Math.sin(yaw),cy2=Math.cos(yaw);
 P.x+=(-sy*f+cy2*s)*sp*dt;P.z+=(-cy2*f-sy*s)*sp*dt;
 for(let i=0;i<S.length;i++){const b=S[i];if(b.y1>P.y+.2&&b.y0<P.y+1.5)pushOut(P,.32,b)}
 P.x=cl(P.x,-13.1,13.1);P.z=cl(P.z,-8.6,8.6);
 P.vy-=20*dt;P.y+=P.vy*dt;if(P.y<=0){P.y=0;P.vy=0}
 moving=Math.abs(f)+Math.abs(s)>.05&&P.y===0}
let moving=false,bob=0;
function grab(b){held=b;b.held=true;b.v.set(0,0,0);holdD=cl(b.m.position.distanceTo(cam.position),1,2.6);hv.set(0,0,0)}
function drop(){const b=held;b.held=false;b.v.copy(hv).clampLength(0,9);held=null}
function throwIt(){if(!held)return;const b=held;drop();lookDir();b.v.copy(fwd).multiplyScalar(11).add(new V3(0,1.5,0))}
function act(){if(!started||panelOpen)return;if(held){drop();return}if(tgt){if(tgt.m)grab(tgt);else readIt()}}
function readIt(){const t=held||tgt;if(t&&t.info&&started)openPanel(t.info)}
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
CIN.end=()=>{CIN.mode='play';doorPivot.rotation.y=1.65;P.x=-6.4;P.z=6.6;P.y=0;P.vy=0;yaw=0;pitch=0;cam.fov=72;cam.updateProjectionMatrix();started=true;document.body.classList.remove('intro');if(CIN.after!=null){[P.x,P.z,yaw]=TP[CIN.after];pitch=0;P.y=0}CIN.after=null;lock()};
addEventListener('pointerdown',()=>{if(CIN.mode==='enter')CIN.u=Math.max(CIN.u,.999)});
const SITE=$('#site');
window.HOUSE={enter(i){if(CIN.mode!=='idle')return;CIN.after=i;window.SP=false;SITE.classList.add('out');setTimeout(()=>{SITE.style.display='none'},1700);CIN.begin()},
 home(){if(held)drop();panelOpen=false;pnl.hidden=true;try{document.exitPointerLock()}catch(e){}started=false;CIN.mode='idle';doorPivot.rotation.y=0;document.body.classList.add('intro');SITE.style.display='block';SITE.offsetWidth;SITE.classList.remove('out');SITE.scrollTop=0}};
// HUD
const tele=$('#tele'),TP=[[-9,6.2,Math.PI],[-9,-1.2,0],[0,-3.2,0],[9,-1.4,0],[0,1.5,Math.PI],[9,1.6,Math.PI]],order=[3,0,1,2,4,5];
const tabs={};let lastRoom='';order.forEach(i=>{const b=document.createElement('button');b.textContent=rooms[i].n;b.style.setProperty('--d',ACC[i]);b.onclick=()=>{[P.x,P.z,yaw]=TP[i];pitch=0;P.y=0;if(held)drop()};tele.appendChild(b);tabs[i]=b});const hb=document.createElement('button');hb.textContent='← Website';hb.onclick=()=>HOUSE.home();tele.appendChild(hb);
const mm=$('#mm'),mc=mm.getContext('2d');
function drawMM(){mc.clearRect(0,0,140,94);rooms.forEach((rm,i)=>{mc.fillStyle='rgba(66,133,255,.28)';mc.strokeStyle='rgba(255,255,255,.35)';mc.fillRect((rm.cx-4.5+13.5)*5+2,(rm.cz-4.5+9)*5+2,43,43);mc.strokeRect((rm.cx-4.5+13.5)*5+2,(rm.cz-4.5+9)*5+2,43,43)});
 const px=(P.x+13.5)*5+2,pz=(P.z+9)*5+2;mc.fillStyle='#00d5ff';mc.beginPath();mc.arc(px,pz,3.5,0,6.3);mc.fill();mc.strokeStyle='#00d5ff';mc.beginPath();mc.moveTo(px,pz);mc.lineTo(px-Math.sin(yaw)*9,pz-Math.cos(yaw)*9);mc.stroke()}
const roomEl=$('#room'),tipEl=$('#tip'),cross=$('#cross');
function roomAt(){const c=P.x<-4.5?0:P.x<4.5?1:2,rw=P.z<0?0:1;return rooms[[0,1,2,3,4,5][rw*3+c]].n}
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
  const tg=cam.position.clone().addScaledVector(fwd,d);tg.y=cl(tg.y,hy+.02,2.9);tg.x=cl(tg.x,-13,13);tg.z=cl(tg.z,-8.6,8.6);
  const old=p.clone();p.lerp(tg,1-Math.exp(-16*dt));hv.lerp(p.clone().sub(old).divideScalar(Math.max(dt,.001)),.3);
  if(K.KeyR)b.m.rotation.y+=dt*2.5;if(K.Equal||K.NumpadAdd){b.s=Math.min(3,b.s*(1+dt*1.2));b.m.scale.setScalar(b.s)}if(K.Minus||K.NumpadSubtract){b.s=Math.max(.35,b.s*(1-dt*1.2));b.m.scale.setScalar(b.s)}}
 ANIM.forEach(f=>f(now/1000,dt));physics(dt);
 // targeting
 tgt=null;if(started&&!panelOpen){rc.setFromCamera({x:0,y:0},cam);rc.far=3.6;const hs=rc.intersectObjects(ray,true);if(hs.length){let o=hs[0].object;while(o&&!o.userData.ref&&o.parent&&o.parent!==scene)o=o.parent;if(o&&o.userData.ref&&!o.userData.ref.held)tgt=o.userData.ref,bh.setFromObject(o)}}
 const sh=held||tgt;bh.visible=!!tgt;cross.classList.toggle('on',!!sh);
 tipEl.classList.toggle('on',!!sh);if(sh){tipEl.textContent=held?held.name+' · tap/click to drop · F throw · wheel push/pull':(tgt.m?tgt.name+' · click to pick up · E to read':tgt.name+' · E / click to read')}
 {const rn=roomAt();if(rn!==lastRoom){lastRoom=rn;const ri=rooms.findIndex(q=>q.n===rn);document.documentElement.style.setProperty('--cy',ACC[ri]);Object.keys(tabs).forEach(k=>tabs[k].classList.toggle('on',rooms[k].n===rn));roomEl.textContent=rn}}drawMM();
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
