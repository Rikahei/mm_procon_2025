import * as THREE from 'three';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import DotGothic16 from '../public/fonts/DotGothic16-Regular.typeface.json?url';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { TessellateModifier } from 'three/addons/modifiers/TessellateModifier.js';

export { textSystem, textGroup, loadFont, createText, textPositionHelper, charLengthHelper, refreshText};

const zodiacObjects = [];
let font: any, mestText: any;

const textGroup = new THREE.Group();
const textSystem = new THREE.Object3D();
zodiacObjects.push( textSystem );

const loader = new FontLoader();

function loadFont() {
    loader.load(DotGothic16, function ( response: any ) {
        font = response;
        refreshText();
    } );
}

function createText (text: string, textMaterial: any, fontScale = 0.1, isFix = 1, speech = null) {
    const props = {
      font,
      size: 10,
      depth: 1,
      curveSegments: 5,
      bevelEnabled: true,
      bevelThickness: 0.2,
      bevelSize: 0.1,
      bevelOffset: 0,
      bevelSegments: 3,
    };
    let textGeo = new TextGeometry(text, props);
    textGeo.computeBoundingBox();
    textGeo.center();

    const tessellateModifier = new TessellateModifier( 3, 4 );
    textGeo = tessellateModifier.modify( textGeo );

	const numFaces = textGeo.attributes.position.count / 3
	const colors = new Float32Array( numFaces * 3 * 3 );
	const displacement = new Float32Array( numFaces * 3 * 3 );
	const color = new THREE.Color();
	for ( let f = 0; f < numFaces; f ++ ) {
		const index = 9 * f;
		const h = speechColorHelper(speech, isFix).h;
		const s = speechColorHelper(speech, isFix).s;
		const l = speechColorHelper(speech, isFix).l;
		color.setHSL( h, s, l );
		const d = 10 * ( 0.5 - Math.random() );
		for ( let i = 0; i < 3; i ++ ) {
			colors[ index + ( 3 * i ) ] = color.r;
			colors[ index + ( 3 * i ) + 1 ] = color.g;
			colors[ index + ( 3 * i ) + 2 ] = color.b;
			displacement[ index + ( 3 * i ) ] = 0;
			displacement[ index + ( 3 * i ) + 1 ] = 0;
			displacement[ index + ( 3 * i ) + 2 ] = d;
		}
	}

    textGeo.setAttribute( 'customColor', new THREE.BufferAttribute( colors, 3 ) );
	textGeo.setAttribute( 'displacement', new THREE.BufferAttribute( displacement, 3 ) );

    mestText = new THREE.Mesh( textGeo, textMaterial );
    mestText.scale.set(fontScale, fontScale, fontScale);
    mestText.layers.enable(1);
    return mestText;
}

function textPositionHelper (char: { position: { x: number; y: number; }; rotation: { z: number; }; }, charIndex: number, charCount: number, deg = 8) {
    const radius = 45
    const degreesToRads = ( ( (charIndex * deg) - ( ( (charCount - 1) * deg) / 2) ) * Math.PI ) / 180;
    let x = radius * Math.sin(degreesToRads);
    let y = radius * Math.cos(degreesToRads);
    char.position.x = x;
    char.position.y = y - 25;
    char.rotation.z = -degreesToRads;
}

function charLengthHelper (charCount: number) {
    switch (charCount != undefined && charCount > 0) {
        case (charCount > 23):
            return 0.65;
        case (charCount > 15):
            return 0.8;
        case (charCount < 7):
            return 1.3;
        case (charCount < 10):
            return 1.2;
        default:
            return 1;
    }
}

function speechColorHelper (speech: string | null, isFix = 1) {
    const mikuColor = [0.8, 0.48];
    const rinLenColor = [0.05, 0.18];
    const mikoKaitoColor = [0, 0.65];
    switch (true) {
        case speech == 'N' && isFix == 1:
            return { h: mikuColor[1], s: 0.35 + Math.random(), l: 0.4 + Math.random() * 0.25};
        case speech == 'N' && isFix == 0:
            return { h: mikuColor[Math.floor(Math.random() * 2)], s: 0.35 + Math.random(), l: 0.35 + Math.random() * 0.1};
        case (speech == 'J' || speech == 'M') && isFix == 1:
            return { h: rinLenColor[1], s: 0.35 + Math.random(), l: 0.5 + Math.random() * 0.2};
        case (speech == 'J' || speech == 'M') && isFix == 0:
            return { h: rinLenColor[Math.floor(Math.random() * 2)], s: 0.35 + Math.random(), l: 0.35 + Math.random() * 0.1};
        case speech == 'V' && isFix == 1:
            return { h: 0.9, s: 0.5 + Math.random(), l: 0.58 + Math.random() * 0.1};
        case speech == 'V' && isFix == 0:
            return { h: mikoKaitoColor[Math.floor(Math.random() * 2)], s: 0.35 + Math.random(), l: 0.35 + Math.random() * 0.1};
        default:
            return { h: Math.random(), s: 0.35 + Math.random(), l: 0.52 + Math.random()};
    }
}

function refreshText() {
    if(textGroup) {
        textGroup.clear();
    }
}