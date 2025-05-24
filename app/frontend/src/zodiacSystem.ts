import * as THREE from 'three';
import { TTFLoader } from "three/addons/loaders/TTFLoader.js";
import { Font } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
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
const loader = new TTFLoader();
let message = 'マジカルミライ２０２５';

function loadFont() {
    loader.load( "../public/fonts/MPLUSRounded1c-Medium.ttf", function ( response ) { 
        font = new Font(response);
        refreshText(message);
    } );
}

const vertices = [];

for ( let i = 0; i < 10000; i ++ ) {
	const x = THREE.MathUtils.randFloatSpread( 2000 );
	const y = THREE.MathUtils.randFloatSpread( 2000 );
	const z = THREE.MathUtils.randFloatSpread( 2000 );

	vertices.push( x, y, z );
}

function createText (text) {
    const textGroup = new THREE.Group();
    const props = {
      font,
      size: 8,
      depth: 0.1,
      curveSegments: 5,
      bevelEnabled: true,
      bevelThickness: 0.08,
      bevelSize: 0.01,
      bevelOffset: 0,
      bevelSegments: 2,
    };
    const textGeo = new TextGeometry(text, props);
    textGeo.computeBoundingBox();
    const textMaterial = new THREE.MeshBasicMaterial( {
            color: 0xff9900,
            linewidth: 1,
            wireframe: true,
            // transparent: true,
            // opacity: 0.8
        } );
    textGeo.computeBoundingBox();
    const centerOffset = - 0.5 * ( textGeo.boundingBox.max.x - textGeo.boundingBox.min.x );

	const objectToCurve = new THREE.Mesh( textGeo, textMaterial );
    textGeo.rotateX( 33 );

    flow = new Flow( objectToCurve );
    flow.updateCurve( 0, curve );
    // Set init position of text
    flow.uniforms.pathOffset.value = 0.6;
    zodiacSystem.add( flow.object3D );
}

function refreshText(text) { 
    if (flow) {
        zodiacSystem.remove( flow.object3D );
    }
    createText(text);
}