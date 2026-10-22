import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.164.1/build/three.module.js';

const $ = (s, root=document) => root.querySelector(s);
const toast = (message) => { const el=$('#toast'); if(!el) return; el.textContent=message; el.classList.add('show'); clearTimeout(toast.timer); toast.timer=setTimeout(()=>el.classList.remove('show'),2600); };
$('#year').textContent = new Date().getFullYear();

// A real WebGL scene: layered torus rings, a luminous core, floating shards, and a 3D particle field.
const mount = $('#portalCanvas');
let scene, camera, renderer, portal, core, particlePoints, shards=[], ringGroup, pointer={x:0,y:0}, target={x:0,y:0};
if (mount && window.WebGLRenderingContext) {
  try {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(42, mount.clientWidth / Math.max(1,mount.clientHeight), .1, 100);
    camera.position.set(0,0,9.5);
    renderer = new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'high-performance'});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
    renderer.setSize(mount.clientWidth,mount.clientHeight);
    renderer.outputColorSpace=THREE.SRGBColorSpace;
    renderer.toneMapping=THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure=1.35;
    mount.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xff5b27,1.3));
    const goldLight=new THREE.PointLight(0x6fe9ff,28,18); goldLight.position.set(2,2,4); scene.add(goldLight);
    const redLight=new THREE.PointLight(0x00bcd4,22,15); redLight.position.set(-3,-1,2); scene.add(redLight);
    const backLight=new THREE.PointLight(0x8af4ff,20,15); backLight.position.set(0,0,-3); scene.add(backLight);

    portal=new THREE.Group(); scene.add(portal); ringGroup=new THREE.Group(); portal.add(ringGroup);
    // VEES signature: an actual extruded, beveled V sculpture suspended inside the portal.
    const vShape = new THREE.Shape(); vShape.moveTo(-0.95,1.15); vShape.lineTo(-0.48,1.15); vShape.lineTo(0,0.05); vShape.lineTo(0.48,1.15); vShape.lineTo(0.95,1.15); vShape.lineTo(0.22,-1.05); vShape.quadraticCurveTo(0,-1.28,-0.22,-1.05); vShape.closePath();
    const vGeo = new THREE.ExtrudeGeometry(vShape,{depth:0.34,bevelEnabled:true,bevelSegments:4,steps:1,bevelSize:0.075,bevelThickness:0.075}); vGeo.center();
    const vMat = new THREE.MeshPhysicalMaterial({color:0x6fe9ff,metalness:0.62,roughness:0.16,clearcoat:1,clearcoatRoughness:0.08,emissive:0x00bcd4,emissiveIntensity:0.55});
    const vMonument = new THREE.Mesh(vGeo,vMat); vMonument.position.z=0.55; vMonument.rotation.x=-0.08; vMonument.scale.set(1.03,1.03,1); portal.add(vMonument); portal.userData.vMonument=vMonument;
    const vWire = new THREE.LineSegments(new THREE.EdgesGeometry(vGeo),new THREE.LineBasicMaterial({color:0xffffff,transparent:true,opacity:0.82})); vWire.position.copy(vMonument.position); vWire.scale.copy(vMonument.scale); vWire.rotation.copy(vMonument.rotation); portal.add(vWire); portal.userData.vWire=vWire;
    const torusMat=(color,emissive,intensity,metalness=.55,roughness=.24)=>new THREE.MeshStandardMaterial({color,emissive,emissiveIntensity:intensity,metalness,roughness});
    const ringSpecs=[
      {r:2.2,t:.055,c:0x071519,e:0x00bcd4,i:2.7,z:0},
      {r:2.08,t:.018,c:0xffffff,e:0x6fe9ff,i:3.2,z:.06},
      {r:1.91,t:.035,c:0x00bcd4,e:0x00bcd4,i:2.2,z:-.08},
      {r:1.72,t:.012,c:0x6fe9ff,e:0x00bcd4,i:3.4,z:.1}
    ];
    ringSpecs.forEach((s,i)=>{const m=new THREE.Mesh(new THREE.TorusGeometry(s.r,s.t,12,180),torusMat(s.c,s.e,s.i));m.position.z=s.z;m.rotation.x=(i%2?-.13:.12);ringGroup.add(m)});
    const inner=new THREE.Mesh(new THREE.TorusGeometry(1.45,.025,10,120),new THREE.MeshBasicMaterial({color:0x071519,transparent:true,opacity:.8}));inner.rotation.x=.35;inner.rotation.y=.2;ringGroup.add(inner);

    const coreGeo=new THREE.SphereGeometry(1.25,64,64);
    const coreMat=new THREE.MeshPhysicalMaterial({color:0xffffff,emissive:0x6fe9ff,emissiveIntensity:.75,metalness:.55,roughness:.18,clearcoat:1,clearcoatRoughness:.12});
    core=new THREE.Mesh(coreGeo,coreMat);core.scale.set(1,1,.34);portal.add(core);
    const coreShell=new THREE.Mesh(new THREE.SphereGeometry(1.12,48,48),new THREE.MeshBasicMaterial({color:0x00bcd4,wireframe:true,transparent:true,opacity:.14}));coreShell.scale.set(1,1,.45);portal.add(coreShell);
    const energy=new THREE.Mesh(new THREE.TorusKnotGeometry(.7,.012,180,8,2,5),new THREE.MeshBasicMaterial({color:0x071519,transparent:true,opacity:.75}));energy.scale.set(1.4,1.4,.5);portal.add(energy);portal.userData.energy=energy;portal.userData.shell=coreShell;

    // Beads along a helical orbital path
    const beadGeo=new THREE.SphereGeometry(.025,8,8), beadMat=new THREE.MeshBasicMaterial({color:0x00cfea});
    const beads=new THREE.Group();for(let i=0;i<100;i++){const b=new THREE.Mesh(beadGeo,beadMat);const a=i/100*Math.PI*2*5;const r=2.35+(i%7)*.018;b.position.set(Math.cos(a)*r,Math.sin(a)*r,Math.sin(a*1.7)*.28);beads.add(b)}portal.add(beads);portal.userData.beads=beads;

    // Instanced floating crystalline shards for depth and scale
    const shardGeo=new THREE.OctahedronGeometry(1,0);
    for(let i=0;i<36;i++){
      const mat=new THREE.MeshStandardMaterial({color:i%3===0?0xffffff:(i%3===1?0x6fe9ff:0x00bcd4),emissive:i%3===1?0x00bcd4:0x005a6b,emissiveIntensity:1.15,metalness:.7,roughness:.22,transparent:true,opacity:.82});
      const mesh=new THREE.Mesh(shardGeo,mat);const a=i/36*Math.PI*2;const r=2.6+Math.random()*1.2;
      mesh.position.set(Math.cos(a)*r,Math.sin(a)*r,(Math.random()-.5)*2.5);mesh.scale.set(.05+Math.random()*.12,.15+Math.random()*.42,.04+Math.random()*.09);mesh.rotation.set(Math.random()*3,Math.random()*3,Math.random()*3);
      mesh.userData={a,r,speed:(Math.random()-.5)*.4,baseY:mesh.position.y,phase:Math.random()*6};portal.add(mesh);shards.push(mesh);
    }
    const count=1800, positions=new Float32Array(count*3), colors=new Float32Array(count*3);
    for(let i=0;i<count;i++){const r=2.3+Math.random()*5.5,a=Math.random()*Math.PI*2;positions[i*3]=Math.cos(a)*r;positions[i*3+1]=Math.sin(a)*r;positions[i*3+2]=(Math.random()-.5)*8;const hot=Math.random();colors[i*3]=.18+hot*.55;colors[i*3+1]=.82+hot*.18;colors[i*3+2]=1;}
    const pGeo=new THREE.BufferGeometry();pGeo.setAttribute('position',new THREE.BufferAttribute(positions,3));pGeo.setAttribute('color',new THREE.BufferAttribute(colors,3));
    particlePoints=new THREE.Points(pGeo,new THREE.PointsMaterial({size:.025,vertexColors:true,transparent:true,opacity:.82,blending:THREE.AdditiveBlending,depthWrite:false}));scene.add(particlePoints);

    const resize=()=>{const w=mount.clientWidth,h=mount.clientHeight;if(!w||!h)return;camera.aspect=w/h;camera.position.z=w<500?10.8:9.5;camera.updateProjectionMatrix();renderer.setSize(w,h)};
    new ResizeObserver(resize).observe(mount);
    const clock=new THREE.Clock();
    const animate=()=>{requestAnimationFrame(animate);const t=clock.getElapsedTime();target.x+=(pointer.x-target.x)*.035;target.y+=(pointer.y-target.y)*.035;portal.rotation.y=target.x*.24+Math.sin(t*.22)*.045;portal.rotation.x=-target.y*.18+Math.cos(t*.3)*.025;portal.userData.vMonument.rotation.y=Math.sin(t*.55)*.22+target.x*.12;portal.userData.vMonument.rotation.x=-.08+Math.cos(t*.43)*.09-target.y*.08;portal.userData.vWire.rotation.copy(portal.userData.vMonument.rotation);portal.userData.vWire.position.copy(portal.userData.vMonument.position);ringGroup.rotation.z=t*.11;portal.userData.energy.rotation.x=t*.32;portal.userData.energy.rotation.y=t*.5;portal.userData.shell.rotation.y=-t*.12;portal.userData.beads.rotation.z=-t*.15;core.scale.set(1+Math.sin(t*1.5)*.018,1+Math.sin(t*1.5)*.018,.34);goldLight.intensity=19+Math.sin(t*2.3)*4;redLight.intensity=14+Math.sin(t*1.7+2)*3;shards.forEach(s=>{s.rotation.x+=.002+s.userData.speed*.006;s.rotation.y+=.004;s.position.y=s.userData.baseY+Math.sin(t*.7+s.userData.phase)*.09});particlePoints.rotation.z=t*.012;renderer.render(scene,camera)};animate();
    mount.addEventListener('pointermove',e=>{const r=mount.getBoundingClientRect();pointer.x=((e.clientX-r.left)/r.width-.5)*2;pointer.y=((e.clientY-r.top)/r.height-.5)*2});
    mount.addEventListener('pointerleave',()=>{pointer.x=0;pointer.y=0});
  } catch(err) { console.warn('3D scene could not initialize:',err); }
}

const enter=()=>$('#profile')?.scrollIntoView({behavior:'smooth'});
$('#enterPortal')?.addEventListener('click',enter);$('#portalHitarea')?.addEventListener('click',enter);$('#quickResume')?.addEventListener('click',()=>$('#education')?.scrollIntoView({behavior:'smooth'}));
const printCV=()=>window.print();$('#downloadTop')?.addEventListener('click',printCV);$('#downloadProfile')?.addEventListener('click',printCV);
$('#photoInput')?.addEventListener('change',e=>{const file=e.target.files?.[0];if(!file)return;if(!file.type.startsWith('image/'))return toast('Choose an image file.');const url=URL.createObjectURL(file);$('#profilePhoto').src=url;toast('Photo preview updated for this browser session.');});

const skillData={
 'HTML & CSS':{icon:'</>',desc:'Building the structure and visual presentation of web pages with HTML and CSS.',tags:['HTML','CSS','Responsive UI']},
 'JavaScript':{icon:'JS',desc:'Adding browser-side interactivity and behavior to web interfaces.',tags:['JavaScript','DOM','Interactions']},
 'C Programming':{icon:'C',desc:'Learning programming fundamentals and problem-solving with C.',tags:['C','Programming fundamentals']},
 'Git & GitHub':{icon:'⌘',desc:'Version control and project collaboration using Git and GitHub.',tags:['Git','GitHub','Version control']},
 'Web Development':{icon:'◇',desc:'Combining front-end technologies to build useful web applications.',tags:['Web apps','UI','Problem solving']}
};
$$('.skill-node').forEach(node=>node.addEventListener('click',()=>{const name=node.dataset.skill,d=skillData[name];if(!d)return;$$('.skill-node').forEach(n=>n.classList.toggle('active',n===node));$('#skillTitle').textContent=name;$('#skillIcon').textContent=d.icon;$('#skillDescription').textContent=d.desc;$('#skillNumber').textContent='NODE_0'+(Array.from($$('.skill-node')).indexOf(node)+1);$('#skillTags').innerHTML=d.tags.map(t=>`<span>${t}</span>`).join('')}));
function $$(selector,root=document){return Array.from(root.querySelectorAll(selector))}
const dialog=$('#profileDialog');$('#editProfile')?.addEventListener('click',()=>dialog?.showModal());
$('#profileForm')?.addEventListener('submit',e=>{e.preventDefault();const name=$('#inputName').value.trim(),role=$('#inputRole').value.trim(),about=$('#inputAbout').value.trim(),email=$('#inputEmail').value.trim(),github=$('#inputGithub').value.trim();if(name){$('#heroName').textContent=name.toUpperCase();$('#profileName').textContent=name;$('#avatarInitials').textContent=name.split(/\s+/).map(x=>x[0]).join('').slice(0,2).toUpperCase()}if(role){$('#profileRole').textContent=role;$('.hero-kicker').textContent=role}if(about)$('#aboutText').textContent=about;const emailNode=$$('.info-grid>div').find(d=>d.querySelector('.info-label')?.textContent==='EMAIL')?.querySelector('strong');if(emailNode)emailNode.textContent=email;const gh=$$('.info-grid>div').find(d=>d.querySelector('.info-label')?.textContent==='GITHUB')?.querySelector('a');if(gh&&github){gh.href=github;gh.textContent=github.replace(/^https?:\/\//,'')+' ↗'}dialog.close();toast('Profile updated in this browser session.');});

// Give project cards a subtle 3D tilt on pointer devices.
if(matchMedia('(hover:hover) and (pointer:fine)').matches){$$('.project-card').forEach(card=>{card.addEventListener('pointermove',e=>{const r=card.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;card.style.transform=`translateY(-7px) rotateX(${-y*5}deg) rotateY(${x*5}deg)`});card.addEventListener('pointerleave',()=>card.style.transform='')})}
