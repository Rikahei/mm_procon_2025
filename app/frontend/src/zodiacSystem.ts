import * as THREE from 'three';
import { TTFLoader } from "three/addons/loaders/TTFLoader.js";
import { Font } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { TessellateModifier } from 'three/addons/modifiers/TessellateModifier.js';

export { zodiacSystem, uniforms, loadFont, refreshText};

const zodiacObjects = [];
let font, mestText;

const zodiacSystem = new THREE.Object3D();
zodiacObjects.push( zodiacSystem );

const loader = new TTFLoader();
let message = 'マジカルミライ２０２５';

function loadFont() {
    loader.load( "../public/fonts/MPLUSRounded1c-Medium.ttf", function ( response ) { 
        font = new Font(response);
        refreshText(message);
    } );
}

let uniforms = {
	amplitude: { value: 0.0 }
};
let shaderMaterial = new THREE.ShaderMaterial( {
	uniforms: uniforms,
	vertexShader: document.getElementById( 'vertexshader' ).textContent,
	fragmentShader: document.getElementById( 'fragmentshader' ).textContent
} );

function createText (text) {
    const textGroup = new THREE.Group();
    const props = {
      font,
      size: 3.5,
      depth: 1,
      curveSegments: 5,
      bevelEnabled: true,
      bevelThickness: 0.08,
      bevelSize: 0.01,
      bevelOffset: 0,
      bevelSegments: 3,
    };
    let textGeo = new TextGeometry(text, props);
    textGeo.computeBoundingBox();
    const centerOffset = - 0.5 * ( textGeo.boundingBox.max.x - textGeo.boundingBox.min.x );
    textGeo.center();

    const tessellateModifier = new TessellateModifier( 8, 6 );
    textGeo = tessellateModifier.modify( textGeo );

	const numFaces = textGeo.attributes.position.count / 3;
	const colors = new Float32Array( numFaces * 3 * 3 );
	const displacement = new Float32Array( numFaces * 3 * 3 );
	const color = new THREE.Color();
	for ( let f = 0; f < numFaces; f ++ ) {
		const index = 9 * f;
		const h = 0.5 + 0.4 * Math.random();
		const s = 0.5 + 0.2 * Math.random();
		const l = 0.5 + 0.2 * Math.random();
		color.setHSL( h, s, l );
		const d = 10 * ( 0.5 - Math.random() );
		for ( let i = 0; i < 3; i ++ ) {
			colors[ index + ( 3 * i ) ] = color.r;
			colors[ index + ( 3 * i ) + 1 ] = color.g;
			colors[ index + ( 3 * i ) + 2 ] = color.b;
			displacement[ index + ( 3 * i ) ] = d;
			displacement[ index + ( 3 * i ) + 1 ] = d;
			displacement[ index + ( 3 * i ) + 2 ] = d;
		}
	}

    textGeo.setAttribute( 'customColor', new THREE.BufferAttribute( colors, 3 ) );
	textGeo.setAttribute( 'displacement', new THREE.BufferAttribute( displacement, 3 ) );

    mestText = new THREE.Mesh( textGeo, shaderMaterial );

    zodiacSystem.add (mestText);
}

function refreshText(text) { 
    if (mestText) {
        zodiacSystem.remove (mestText);
    }
    createText(text);
}