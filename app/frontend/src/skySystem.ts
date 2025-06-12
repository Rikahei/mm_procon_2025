import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import Star4 from '../public/models/star4.glb';
import StarK from '../public/models/star-K.glb';
import StarL from '../public/models/star-L.glb';
import StarM from '../public/models/star-M.glb';
import StarR from '../public/models/star-R.glb';
import StarRK from '../public/models/star-RK.glb';
// import backGround from "../public/images/background.jpg"
export { skySystem, skyObjects };

const skyObjects = [];
const StarModels = [Star4, StarK, StarL, StarM, StarR, StarRK];

const skySystem = new THREE.Object3D();
skySystem.position.set( 0, -65, 0 );
skyObjects.push( skySystem );

// Background
// const backGeo = new THREE.SphereGeometry(
// 	500, 200, 200,
// 	Math.PI * 1.05, Math.PI * 2,
// 	Math.PI * 0.8, Math.PI * 0.39
// );
// backGeo.center();
// const backLoader = new THREE.TextureLoader();
// backLoader.load( backGround, (texture) => {
// 	texture.colorSpace = THREE.SRGBColorSpace;
// 	const material = new THREE.MeshBasicMaterial({
// 		map: texture,
// 	});
// 	const starBackground = new THREE.Mesh(backGeo, material);
// 	starBackground.rotation.x = 100;
// 	starBackground.position.y = -65;
// 	starBackground.position.z = -100;
// 	starBackground.rotation.x = Math.PI / 2;
// 	skySystem.add(starBackground);
// });

// Moon
const moonGeo = new THREE.DodecahedronGeometry(5, 3);
const moonMaterial = new THREE.MeshPhongMaterial({color: 'yellow'});
const moon = new THREE.Mesh( moonGeo, moonMaterial );
moon.position.x = 0;
moon.position.y = -85;
moon.position.z = -20;
skySystem.add( moon );
skyObjects.push( moon );

// Stars
const starsGeo = new THREE.TetrahedronGeometry(0.2, 2);
const starsSpace = 220;
const spaceFix = 110;
for (let i = 0; i < 200; i++) {
    const star = new THREE.Mesh(starsGeo, new THREE.MeshLambertMaterial({ 
        color: Math.random() * 0xffffff 
    }));
    
    star.position.x = Math.random() * starsSpace - spaceFix;
    star.position.y = Math.random() * starsSpace - spaceFix;
    star.position.z = Math.random() * starsSpace - spaceFix;

    star.rotation.x = Math.random() * 2 * Math.PI;
    star.rotation.y = Math.random() * 2 * Math.PI;
    star.rotation.z = Math.random() * 2 * Math.PI - 10;

    star.scale.x, star.scale.y, star.scale.z = Math.random() + 0.2;
    
    skySystem.add(star);
    skyObjects.push( star );
}
// load models
const loader = new GLTFLoader();
function loadStarModels(file) {
    loader.load( file, function ( gltf ) {
        const desiredScale = 1.2;
        for (let i = 0; i < 10; i++) {
            const starClone = gltf.scene.clone();
            starClone.scale.set(desiredScale, desiredScale, desiredScale);
            starClone.position.set(Math.random() * 220 - 110, 
                Math.random() * 220 - 110, Math.random() * 180 - 60);
            starClone.rotation.x = Math.random() * 10;
            skySystem.add( starClone );
            skyObjects.push( starClone );
        }
    }, undefined, function ( error ) {
        console.error( error );
    });
}
StarModels.forEach(model => {
    loadStarModels(model);
});