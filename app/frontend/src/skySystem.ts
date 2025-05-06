import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
export { skySystem, skyObjects };

const skyObjects = [];

const skySystem = new THREE.Object3D();
skySystem.position.set( 0, -65, 0 );
skyObjects.push( skySystem );

// Moon
const moonGeo = new THREE.DodecahedronGeometry(5, 3);
const moonMaterial = new THREE.MeshPhongMaterial({color: 'yellow'});
const moon = new THREE.Mesh( moonGeo, moonMaterial );
moon.position.x = 0;
moon.position.y = -85;
moon.position.z = -20;
skySystem.add( moon );
skyObjects.push( moon );

const loader = new GLTFLoader();
loader.load( "../public/models/star3.glb", function ( gltf ) {
    const desiredScale = 1.5;
    for (let i = 0; i < 50; i++) {
        const starClone = gltf.scene.clone();
        starClone.scale.set(desiredScale, desiredScale, desiredScale);
        starClone.position.set(Math.random() * 220 - 110, 
            Math.random() * 220 - 110, Math.random() * 180 - 90);
        starClone.rotation.x = Math.random() * 10;
        skySystem.add( starClone );
        skyObjects.push( starClone );
    }
}, undefined, function ( error ) {
    console.error( error );
});

// Stars
const starsGeo = new THREE.DodecahedronGeometry(0.1, 1);
const starsSpace = 220;
const spaceFix = 110;
for (let i = 0; i < 200; i++) {
    const star = new THREE.Mesh(starsGeo, new THREE.MeshLambertMaterial({ color: Math.random() * 0xffffff }));
    
    star.position.x = Math.random() * starsSpace - spaceFix;
    star.position.y = Math.random() * starsSpace - spaceFix;
    star.position.z = Math.random() * starsSpace - spaceFix;

    star.rotation.x = Math.random() * 2 * Math.PI;
    star.rotation.y = Math.random() * 2 * Math.PI;
    star.rotation.z = Math.random() * 2 * Math.PI - 10;

    star.scale.x, star.scale.y, star.scale.z = Math.random() * 2 + 3;
    
    skySystem.add(star);
    skyObjects.push( star );
}