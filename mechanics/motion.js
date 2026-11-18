import {instanceMatrix} from './kinematics.js';
import * as THREE from 'three';
import {OrbitControls} from '../vendor/OrbitControls.js';
import {GLTFLoader} from '../vendor/GLTFLoader.js';
const $=id=>document.getElementById(id), viewport=$('viewport');
const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(40,1,.1,200);
const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true});
renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.6));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;
viewport.appendChild(renderer.domElement);
const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.minDistance=5;controls.maxDistance=65;controls.target.set(0,1,0);
scene.add(new THREE.HemisphereLight(0xdbe7f9,0x596376,3.1));
const key=new THREE.DirectionalLight(0xffefdb,3.7);key.position.set(7,13,10);scene.add(key);
const rim=new THREE.DirectionalLight(0x9cbcf9,2.0);rim.position.set(-10,6,-8);scene.add(rim);
let rig,sailMeta,groups=[],staticRoot,scaleRoot,sails=[],count=10,fold=0,deploy=1,ready=false,angle='iso';
const gltf=new GLTFLoader(),temp=new THREE.Matrix4(),yaw=new THREE.Matrix4(),tilt=new THREE.Matrix4(),scale=new THREE.Matrix4();
async function load(url){
 let failure;
 for(let attempt=0;attempt<3;attempt++){
  try{return await new Promise((resolve,reject)=>gltf.load(url,data=>resolve(data.scene),undefined,reject));}
  catch(err){failure=err;if(attempt<2)await new Promise(r=>setTimeout(r,900*(attempt+1)));}
 }
 throw failure;
}
function prototypes(root){root.updateMatrixWorld(true);const out=[];root.traverse(ob=>{if(ob.isMesh)out.push({geometry:ob.geometry,material:ob.material,base:ob.matrixWorld.clone()});});return out;}
function addSet(label,parts){const record={label,items:[]};for(const p of parts){const m=new THREE.InstancedMesh(p.geometry,p.material,12);m.frustumCulled=false;m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);scene.add(m);record.items.push({mesh:m,base:p.base});}groups.push(record);return record;}
function attachSail(sceneRoot,name){
 const a=sailMeta.deployment.sails[name].pivot_blender_xyz;
 const pivot=new THREE.Vector3(a[0],a[2],-a[1]);
 const wrap=new THREE.Group();
 wrap.name=name;wrap.position.copy(pivot);
 sceneRoot.position.sub(pivot);
 wrap.add(sceneRoot);scene.add(wrap);sails.push(wrap);
}
function updateSails(){
 for(const rig of sails)rig.scale.set(.75+.25*deploy,1,.65+.35*deploy);
 $('deploy').value=String(Math.round(deploy*100));
 $('deploy-value').textContent=Math.round(deploy*100)+'%';
}
function updateRig(){
 const counts={outer:count,inner:Math.max(6,count-2)};
 for(const g of groups){const inner=g.label.startsWith('inner'),hub=g.label.endsWith('hub');const cfg=inner?rig.inner:rig.outer,n=counts[inner?'inner':'outer'];
  const width=Math.pow(cfg.referenceCount/n,.75);
  for(const item of g.items){item.mesh.count=n;for(let i=0;i<n;i++){
   item.mesh.setMatrixAt(i,instanceMatrix(THREE,cfg,n,i,fold,hub,item.base));
  }item.mesh.instanceMatrix.needsUpdate=true;}
 }
 $('count-label').textContent=String(count).padStart(2,'0')+' / '+String(counts.inner).padStart(2,'0');
 $('fold').value=String(Math.round(fold*100));$('fold-value').textContent=Math.round(fold*100)+'%';
 document.querySelectorAll('[data-count]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.count)===count)));
 $('status').textContent=`● 联动 · 外圈 ${count} / 内圈 ${counts.inner} · 太阳帆 ${Math.round(deploy*100)}%`;
 updateSails();window.__P2L_STATE__={ready,petals:count,innerPetals:counts.inner,fold,deploy,sailRigs:sails.length,nodeEquivalent:'native-root-pivot',view:angle};
}
function setView(which){angle=which;const ratio=viewport.clientWidth/viewport.clientHeight;const distance=ratio<1.1?34:27;
 const d={iso:new THREE.Vector3(1,.72,1.3),top:new THREE.Vector3(.0001,1,.0001),side:new THREE.Vector3(1,.3,.1)}[which].normalize();
 camera.position.copy(controls.target).addScaledVector(d,distance);controls.update();
 document.querySelectorAll('[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===which));if(ready)updateRig();
}
function resize(){const r=viewport.getBoundingClientRect();camera.aspect=Math.max(1,r.width)/Math.max(1,r.height);camera.updateProjectionMatrix();renderer.setSize(r.width,r.height,false);if(ready)setView(angle);}
new ResizeObserver(resize).observe(viewport);
$('fold').addEventListener('input',e=>{fold=Number(e.target.value)/100;$('play').checked=false;if(ready)updateRig();});
$('deploy').addEventListener('input',e=>{deploy=Number(e.target.value)/100;$('play').checked=false;if(ready)updateRig();});
$('scale-ref').addEventListener('change',e=>{if(scaleRoot)scaleRoot.visible=e.target.checked;});
document.querySelectorAll('[data-count]').forEach(b=>b.addEventListener('click',()=>{count=Number(b.dataset.count);if(ready)updateRig();}));
document.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>setView(b.dataset.view)));
$('wire').addEventListener('change',e=>scene.traverse(ob=>{if(ob.isMesh){const mats=Array.isArray(ob.material)?ob.material:[ob.material];mats.forEach(m=>m.wireframe=e.target.checked);}}));
$('capture').addEventListener('click',()=>{renderer.render(scene,camera);const a=document.createElement('a');a.download=`lotus-l2.1-${count}-${Math.round(fold*100)}.png`;a.href=renderer.domElement.toDataURL('image/png');a.click();});
function exactBounds(){const box=new THREE.Box3();const mat=new THREE.Matrix4(),v=new THREE.Vector3();for(const g of groups)for(const item of g.items){const attr=item.mesh.geometry.attributes.position;for(let i=0;i<item.mesh.count;i++){item.mesh.getMatrixAt(i,mat);for(let j=0;j<attr.count;j++){v.fromBufferAttribute(attr,j).applyMatrix4(mat);box.expandByPoint(v);}}}return {xspan:box.max.x-box.min.x,ymax:box.max.y,ymin:box.min.y};}
function frame(t){requestAnimationFrame(frame);if(!ready)return;if($('play').checked){fold=(1-Math.cos(t/1200))/2;deploy=1-.58*fold;updateRig();}controls.update();renderer.render(scene,camera);}requestAnimationFrame(frame);
(async()=>{try{
 rig=await fetch('assets/rig.json').then(r=>{if(!r.ok)throw Error('rig.json HTTP '+r.status);return r.json();});
 sailMeta=await fetch('assets/p2l_rig.json').then(r=>{if(!r.ok)throw Error('p2l_rig.json HTTP '+r.status);return r.json();});
 const [body,outer,inner,hinge,left,right,human]=await Promise.all(['static','outer','inner','hinge','sail_left','sail_right','scale_reference'].map(x=>load('assets/'+x+'.glb')));
 staticRoot=body;scene.add(body);attachSail(left,'sail_left');attachSail(right,'sail_right');scaleRoot=human;scaleRoot.visible=false;scene.add(scaleRoot);const a=prototypes(outer),b=prototypes(inner),h=prototypes(hinge);
 addSet('outer',a);addSet('inner',b);addSet('outer-hub',h);addSet('inner-hub',h);
 ready=true;$('loading').hidden=true;updateRig();resize();setView('iso');
 window.__P2L_TEST__={setPose:(n,f,d)=>{count=n;fold=f;deploy=d;updateRig();return exactBounds();},bounds:exactBounds,drawcalls:()=>renderer.info.render.calls};
}catch(err){console.error(err);$('loading').hidden=true;$('error').hidden=false;$('error').textContent='载入失败：'+err.message;window.__P2L_ERROR__=String(err);}})();
