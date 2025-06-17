import * as THREE from 'three';
import { TTFLoader } from "three/addons/loaders/TTFLoader.js";
import { Font } from 'three/addons/loaders/FontLoader.js';
import MplusRouned1cMedium from '../public/fonts/MPLUSRounded1c-Medium.ttf';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { TessellateModifier } from 'three/addons/modifiers/TessellateModifier.js';

export { textSystem, textGroup, loadFont, createText, textPositionHelper, refreshText};

const zodiacObjects = [];
let font, mestText;

const textGroup = new THREE.Group();
const textSystem = new THREE.Object3D();
zodiacObjects.push( textSystem );

const loader = new TTFLoader();
let message = 'マジカルミライ２０２５';

function loadFont() {
    loader.load( MplusRouned1cMedium, function ( response ) { 
        font = new Font(response);
        refreshText(message);
    } );
}

function createText (text, textMaterial) {
    const props = {
      font,
      size: 3,
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
    textGeo.center();

    const tessellateModifier = new TessellateModifier( 2, 4 );
    textGeo = tessellateModifier.modify( textGeo );

	const numFaces = textGeo.attributes.position.count / 3;
	const colors = new Float32Array( numFaces * 3 * 3 );
	const displacement = new Float32Array( numFaces * 3 * 3 );
	const color = new THREE.Color();
	for ( let f = 0; f < numFaces; f ++ ) {
		const index = 9 * f;
		const h = 2 * Math.random();
		const s = 0.35 + Math.random();
		const l = 0.5 + Math.random();
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

    mestText = new THREE.Mesh( textGeo, textMaterial );
    // mestText.position.y = 50;
    return mestText;
}

function textPositionHelper (char, charIndex, charCount, radius = 45, deg = 6) {
    const degreesToRads = ( ( (charIndex * deg) - ( ( (charCount - 1) * deg) / 2) ) * Math.PI ) / 180;
    let x = radius * Math.sin(degreesToRads);
    let y = radius * Math.cos(degreesToRads);
    char.position.x = x;
    char.position.y = y - 25;
}

function refreshText() {
    if(textGroup) {
        textGroup.clear();
    }
}