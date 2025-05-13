import * as THREE from 'three';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { Flow } from 'three/addons/modifiers/CurveModifier.js';

export { zodiacSystem, zodiacObjects, flow, loadFont, refreshText};

const zodiacObjects = [];
let flow, font;

const zodiacSystem = new THREE.Object3D();
zodiacObjects.push( zodiacSystem );

// Define 8 points manually for a closed loop (approx radius 80, z = -10)
const curve = new THREE.CatmullRomCurve3( [
	new THREE.Vector3( 0, 15, -10 ),    // Top
	new THREE.Vector3( 57, -8, -10 ),   // Top-Right
	new THREE.Vector3( 80, -65, -10 ),    // Right
	new THREE.Vector3( 57, -122, -10 ),  // Bottom-Right
	new THREE.Vector3( 0, -145, -10 ),   // Bottom
	new THREE.Vector3( -57, -122, -10 ), // Bottom-Left
	new THREE.Vector3( -80, -65, -10 ),   // Left
	new THREE.Vector3( -57, -8, -10 )   // Top-Left
]);
curve.curveType = 'centripetal';
curve.closed = true;
const points = curve.getPoints( 50 );
const line = new THREE.LineLoop(
    new THREE.BufferGeometry().setFromPoints( points ),
    new THREE.LineBasicMaterial( { 
        color: 0x00ff00,
        transparent: true,
        opacity: 0
     } )
);
zodiacSystem.add( line );
const loader = new FontLoader();
let message = 'マジカルミライ２０２５';

function loadFont() {
    loader.load( "../public/fonts/Rounded_Mplus_1c_Medium_Regular.typeface.json", function ( response ) { 
        font = response;
        refreshText(message);
    } );
}

function createText (text) {
    const shapes = font.generateShapes( text, 5 );
    const textGeo = new THREE.ShapeGeometry( shapes );
    const textMaterial = new THREE.MeshToonMaterial( {
            color: 0xffffff,
            transparent: true,
            opacity: 0.8
        } );
    textGeo.computeBoundingBox();

    const objectToCurve = new THREE.Mesh( textGeo, textMaterial );
    textGeo.rotateX( 33 );

    flow = new Flow( objectToCurve );
    flow.updateCurve( 0, curve );
    // Set init position of text
    flow.uniforms.pathOffset.value = 0.65;
    zodiacSystem.add( flow.object3D );
}

function refreshText(text) { 
    if (flow) {
        zodiacSystem.remove( flow.object3D );
    }
    createText(text);
}