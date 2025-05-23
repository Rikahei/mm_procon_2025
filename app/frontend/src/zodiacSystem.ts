import * as THREE from 'three';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { Flow } from 'three/addons/modifiers/CurveModifier.js';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';
import { Line2 } from 'three/addons/lines/Line2.js';
import { LineMaterial } from "three/addons/lines/LineMaterial.js";

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
    const textMaterial = new THREE.LineBasicMaterial( {
            color: 0xffffff,
            linewidth: 1,
            // transparent: true,
            // opacity: 0.8
        } );
    textGeo.computeBoundingBox();
    const centerOffset = - 0.5 * ( textGeo.boundingBox.max.x - textGeo.boundingBox.min.x );

    const strokeGroup = new THREE.Group();
    strokeGroup.position.x = centerOffset;
    const lineMaterial = new LineMaterial( {
        color: 0xffffff,
        linewidth: 3,
    } );

    function getStrokeMesh({ shape, i = 0.0 }) {
        let points = shape.getPoints();
        let points3d = [];
        points.forEach((p) => {
            points3d.push(p.x, p.y, 0);
        });
        const lineGeo = new LineGeometry();
        lineGeo.setPositions( points3d );

        const strokeMesh = new Line2( lineGeo, lineMaterial );
        strokeMesh.computeLineDistances();
        return strokeMesh;
    }

    shapes.forEach((s, i) => {
        strokeGroup.add(getStrokeMesh({ shape: s, i }));
        if (s.holes?.length > 0) {
          s.holes.forEach((h) => {
            strokeGroup.add(getStrokeMesh({ shape: h, i }));
          });
        }
    });

    flow = new Flow( strokeGroup );
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