import * as THREE from 'three';
import {OrbitControls} from './vendor/OrbitControls.js';
import {GLTFLoader} from './vendor/GLTFLoader.js';

const el=id=>document.getElementById(id);
const viewport=el('viewport'),loader=el('loader'),loadText=el('load-text');
const status=el('status'),countLabel=el('stage-count'),meshLabel=el('mesh-count'),visibleLabel=el('visible-count'),triangleLabel=el('triangle-count');
const paths={
 hull:'./assets/central_hull.glb',sails:'./assets/solar_sails.glb',
 engines:'./assets/ion_thrusters.glb',shuttle:'./assets/recon_shuttle.glb',
 petals8:'./assets/parametric_petals_8.glb',petals10:'./assets/parametric_petals_10.glb',petals12:'./assets/parametric_petals_12.glb'
};
let selectedCount='10',ready=false,loaded=0;
const models=new Map(),scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(42,1,.1,200);camera.position.set(12,9,15);
const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true});
renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.32;
viewport.appendChild(renderer.domElement);
const controls=new OrbitControls(camera,renderer.domElement);
controls.target.set(0,.55,0);controls.enableDamping=true;controls.autoRotateSpeed=.6;controls.minDistance=3;controls.maxDistance=55;controls.update();
scene.add(new THREE.HemisphereLight(0xd7e9ff,0x51617b,3));
const light=new THREE.DirectionalLight(0xffeedb,3);light.position.set(6,12,9);scene.add(light);
const fill=new THREE.DirectionalLight(0x8cafff,2);fill.position.set(-12,5,-8);scene.add(fill);
const grid=new THREE.GridHelper(35,35,0x4c637c,0x31445a);grid.position.y=-2.7;grid.material.transparent=true;grid.material.opacity=.2;scene.add(grid);
const gltfLoader=new GLTFLoader();
function checked(id){return document.querySelector('input[data-module="'+id+'"]').checked;}
function update(){
 for(const [id,root] of models){
  root.visible=id.startsWith('petals')?(checked('petals')&&id==='petals'+selectedCount):checked(id);
 }
 let count=0,shown=0,triangles=0;
 for(const root of models.values())if(root.visible){shown++;root.traverse(o=>{if(o.isMesh){count++;const g=o.geometry;triangles+=g.index?g.index.count/3:g.attributes.position.count/3;}});}
 countLabel.textContent=selectedCount.padStart(2,'0');meshLabel.textContent=String(count);triangleLabel.textContent=Math.round(triangles).toLocaleString('zh-CN');visibleLabel.textContent=shown+' / 5';
 status.textContent='● 资产已加载 · '+selectedCount+' 花瓣';
 window.__BP_VIEWER_STATE__={petals:Number(selectedCount),visibleModules:shown,meshObjects:count,ready};
}
function view(which){
 const p={iso:[12,9,15],top:[.001,23,.001],side:[20,5,0]}[which];
 camera.position.set(...p);controls.target.set(0,.55,0);controls.update();
 document.querySelectorAll('[data-view]').forEach(b=>b.classList.toggle('selected',b.dataset.view===which));
}
function load(name,url){
 return new Promise((resolve,reject)=>gltfLoader.load(url,gltf=>{
  scene.add(gltf.scene);models.set(name,gltf.scene);
  loadText.textContent='正在载入三维资产 · '+(++loaded)+' / 7';resolve();
 },undefined,e=>reject(new Error(name+': '+(e.message||e)))));
}
function resize(){const r=viewport.getBoundingClientRect();const w=Math.max(1,r.width),h=Math.max(1,r.height);camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false);}
new ResizeObserver(resize).observe(viewport);resize();
function frame(){requestAnimationFrame(frame);controls.update();if(ready)renderer.render(scene,camera);}frame();
document.querySelectorAll('input[name="petals"]').forEach(r=>r.addEventListener('change',()=>{if(r.checked){selectedCount=r.value;update();}}));
document.querySelectorAll('input[data-module]').forEach(c=>c.addEventListener('change',update));
el('all-on').addEventListener('click',()=>{document.querySelectorAll('input[data-module]').forEach(c=>c.checked=true);update();});
el('all-off').addEventListener('click',()=>{document.querySelectorAll('input[data-module]').forEach(c=>c.checked=false);update();});
document.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>view(b.dataset.view)));
el('reset-camera').addEventListener('click',()=>view('iso'));
el('auto-rotate').addEventListener('change',e=>controls.autoRotate=e.target.checked);
el('wireframe').addEventListener('change',e=>{for(const obj of models.values())obj.traverse(x=>{if(x.isMesh){const mats=Array.isArray(x.material)?x.material:[x.material];mats.forEach(m=>{if(m&&'wireframe'in m)m.wireframe=e.target.checked;});}});});
el('capture').addEventListener('click',()=>{renderer.render(scene,camera);const a=document.createElement('a');a.download='BlenderPilot-'+selectedCount+'-petals.png';a.href=renderer.domElement.toDataURL('image/png');a.click();});
(async()=>{try{await Promise.all(Object.entries(paths).map(([k,v])=>load(k,v)));loader.hidden=true;ready=true;view('iso');update();window.__BLENDERPILOT_READY__=true;}catch(e){console.error(e);loader.hidden=true;el('error').hidden=false;el('error').textContent='模型载入失败：'+e.message+'。请通过 HTTP 本地服务打开，而非 file://。';status.textContent='● 加载失败';window.__BLENDERPILOT_ERROR__=String(e);}})();