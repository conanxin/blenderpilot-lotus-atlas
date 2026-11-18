// Blender Z-up root articulation mapped to glTF Y-up. Shared by viewer and numerical test.
export function instanceMatrix(THREE,cfg,n,i,fold,hub,base){
 const theta=2*Math.PI*(i+cfg.angleOffset)/n;
 const m=new THREE.Matrix4().makeTranslation(cfg.radius*Math.cos(theta),cfg.height,-cfg.radius*Math.sin(theta));
 m.multiply(new THREE.Matrix4().makeRotationY(theta));
 if(!hub)m.multiply(new THREE.Matrix4().makeRotationZ(cfg.foldRadians*fold)).multiply(new THREE.Matrix4().makeScale(1,1,Math.pow(cfg.referenceCount/n,.75)));
 return m.multiply(base);
}
