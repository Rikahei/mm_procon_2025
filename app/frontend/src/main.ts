import { player, video } from "./textalive-player";
import "./style.css";
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { skyObjects, skySystem } from "./skySystem";
import { textGroup, textSystem, loadFont, createText, refreshText } from "./textSystem";
import {THREE_GetGifTexture} from "threejs-gif-texture";
import MikuM1 from "../public/images/M1.gif";
import EarthModel from '../public/models/mm_earth.glb';

async function main (){
  	// load text-alive player
  	await player;

	const canvas = document.querySelector( '#mainCanvas' );
	const renderer = new THREE.WebGLRenderer( { alpha: true, antialias: true, canvas } );

	const fov = 60;
	const aspect = 2; // the canvas default
	const near = 0.1;
	const far = 1000;
	const camera = new THREE.PerspectiveCamera( fov, aspect, near, far );
	camera.position.set( 0, 0, 50 ); // default z = 50
	camera.lookAt( 0, 0, 0 );

	const scene = new THREE.Scene();
	{
		const color = 0xFFFFFF;
		const intensity = 3;
		const light = new THREE.DirectionalLight( color, intensity );
		light.position.set( - 1, 2, 4 );
		scene.add( light );
	}

	scene.add( skySystem );
	scene.add( textSystem );

	// earth
	const gLoader = new GLTFLoader();
	gLoader.load( EarthModel, function ( gltf ) {
		const earth = gltf.scene;
		earth.position.x = 0;
		earth.position.y = -25;
		earth.position.z = -5;
		earth.rotation.y = Math.PI / 1;
		earth.scale.set(3.5, 3.5, 3.5);
		scene.add( earth );
	}, undefined, function ( error ) {
		console.error( error );
	});
	
	function resizeRendererToDisplaySize( renderer ) {
		const canvas = renderer.domElement;
		const pixelRatio = window.devicePixelRatio;
		const width = Math.floor( canvas.clientWidth * pixelRatio );
		const height = Math.floor( canvas.clientHeight * pixelRatio );
		const needResize = canvas.width !== width || canvas.height !== height;
		if ( needResize ) {
			renderer.setSize( width, height, false );
		}
		return needResize;
	}

	// load the font
	loadFont();
	let char, lastChar, phrase, lastPhrase, charTemp, charFix = undefined;
	let playerPosition, meshControl, charPosition, fixPosition = 0;

	// Set materials
	let shaderMaterial = new THREE.ShaderMaterial( {
		uniforms: { amplitude: { value: 0.0 } },
		vertexShader: document.getElementById( 'vertexshader' ).textContent,
		fragmentShader: document.getElementById( 'fragmentshader' ).textContent
	} );
	// set moveing material
	let movingMaterial = shaderMaterial.clone();
	movingMaterial.uniforms.amplitude.value = 1;

	// Load Miku
	let theMiku = undefined
	THREE_GetGifTexture(MikuM1).then( texture => { 
		texture.colorSpace = THREE.SRGBColorSpace;
	    theMiku = new THREE.Mesh( 
	        new THREE.PlaneGeometry(20, 20), 
	        new THREE.MeshBasicMaterial({ 
				map: texture,
				transparent: true,
				opacity: 1
			}));
		theMiku.position.z = 20;
		theMiku.scale.set(0.5, 0.5, 0.5);
	    scene.add(theMiku)
	});

	function render( time ) {
		const canvas = renderer.domElement;
		time *= 0.001;
		if ( resizeRendererToDisplaySize( renderer ) ) {
			camera.aspect = canvas.clientWidth / canvas.clientHeight;
			camera.updateProjectionMatrix();
		}
		// skyObject rotations
		skyObjects.forEach( ( obj ) => {
			obj.rotation.z = time * 0.1;
		} );
		if(theMiku) {
			theMiku.position.y = -8 + Math.sin( time * 0.5 );
			theMiku.rotation.y = Math.sin( time * 0.5 ) / 3;
		}
		// Set player video
		if(player.video) {
			playerPosition = player.timer.position;
			phrase = player.video.findPhrase(playerPosition, { loose: true });
			char = player.video.findChar(playerPosition, { loose: true });
			// If position reach char time...
			if( char != null &&
				char.startTime < playerPosition && playerPosition < char.endTime 
				&& lastChar != char.text	
			){
				// Replace char with no animation
				if(charTemp || !lastChar){
					textGroup.remove(charTemp);
					charFix = createText(char.text, shaderMaterial);
					charFix.position.x = fixPosition;
					textGroup.add(charFix);
					fixPosition = fixPosition + 5;
				}
				// Update lastChar
				lastChar = char.text;
				// Add char with animation
				charTemp = createText(char.text, movingMaterial);
				charTemp.position.x = charPosition;
				textGroup.add(charTemp);
				charPosition = charPosition + 5;
				meshControl = 100 * Math.random();
			}
			// text animation control
			if(meshControl >= 0.02){
				meshControl = (phrase.endTime - playerPosition) / 5000;
				movingMaterial.uniforms.amplitude.value = meshControl;
			}else{
				movingMaterial.uniforms.amplitude.value = 0;
			}
			// clear text when phrase ended
			if( phrase != null &&
				phrase.startTime - 100 < playerPosition && playerPosition < phrase.endTime 
				&& lastPhrase != phrase.text	
			){
				lastPhrase = phrase.text;
				refreshText();
				charPosition = -Math.abs( (phrase.charCount / canvas.clientWidth) * 1000 * 3 + 2 );
				fixPosition = -Math.abs( (phrase.charCount / canvas.clientWidth) * 1000 * 3 + 2 );
			}
		}
		textSystem.add(textGroup);
		renderer.render( scene, camera );
		requestAnimationFrame( render );
	}
	requestAnimationFrame( render );
}
main();