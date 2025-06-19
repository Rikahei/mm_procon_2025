import * as THREE from 'three';
export { skySystem, skyObjects };

const skyObjects = [];

const skySystem = new THREE.Object3D();
skySystem.position.set( 0, -65, 0 );
skyObjects.push( skySystem );

// Moon
const moonGeo = new THREE.DodecahedronGeometry(3, 3);
const moonMaterial = new THREE.MeshPhongMaterial({color: 0xfffcb3});
const moon = new THREE.Mesh( moonGeo, moonMaterial );
moon.layers.enable( 1 );
moon.position.x = 0;
moon.position.y = -85;
moon.position.z = -20;
moon.scale.set(0.8, 0.8, 0.8);
skySystem.add( moon );
skyObjects.push( moon );

// Stars
const starsGeo = new THREE.IcosahedronGeometry(1, 0);
const starsSpace = 300;
const spaceFix = 100;
for (let i = 0; i < 100; i++) {
    const starsMaterial = new THREE.MeshBasicMaterial({ color: Math.random() * 0xffffff });
    const star = new THREE.Mesh(starsGeo, starsMaterial);
    star.layers.enable( 1 );
    star.position.x = Math.random() * starsSpace - spaceFix;
    star.position.y = Math.random() * starsSpace - spaceFix;
    star.position.z = Math.random() * starsSpace - spaceFix - 120;

    star.rotation.x = Math.random() * 2 * Math.PI;
    star.rotation.y = Math.random() * 2 * Math.PI;
    star.rotation.z = Math.random() * 2 * Math.PI - 10;

    let randomScale = Math.random() * 1;
    star.scale.set(randomScale, randomScale, randomScale);
    
    skySystem.add(star);
    skyObjects.push( star );
}