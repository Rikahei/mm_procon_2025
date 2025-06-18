import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import Star4 from '../public/models/star4.glb';
import StarK from '../public/models/star-K2.glb';
import StarL from '../public/models/star-L.glb';
import StarM from '../public/models/star-M.glb';
import StarR from '../public/models/star-R.glb';
import StarRK from '../public/models/star-RK.glb';

export { acceSystem, acceObjects };

const acceObjects = [];
const StarModels = [Star4, StarK, StarL, StarM, StarR, StarRK];

const acceSystem = new THREE.Object3D();
acceSystem.position.set( 0, -65, -10 );
acceObjects.push( acceSystem );

// load models
const loader = new GLTFLoader();
function loadStarModels(file) {
    loader.load( file, function ( gltf ) {
        const desiredScale = 1.2;
        for (let i = 0; i < 10; i++) {
            const starClone = gltf.scene.clone();
            starClone.scale.set(desiredScale, desiredScale, desiredScale);
            starClone.position.set(Math.random() * 220 - 110, 
                Math.random() * 220 - 100, Math.random() * 160 - 100);
            starClone.rotation.x = -Math.PI * 1.5;
            starClone.rotation.y = Math.PI * 3 * Math.random();
            acceSystem.add( starClone );
            acceObjects.push( starClone );
        }
    }, undefined, function ( error ) {
        console.error( error );
    });
}
StarModels.forEach(model => {
    loadStarModels(model);
});