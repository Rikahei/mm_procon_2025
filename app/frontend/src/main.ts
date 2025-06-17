import { player, video } from "./textalive-player";
import "./style.css";
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import {THREE_GetGifTexture} from "threejs-gif-texture";
import { skyObjects, skySystem } from "./skySystem";
import { textGroup, textSystem, loadFont, createText, textPositionHelper, refreshText } from "./textSystem";

import EarthModel from '../public/models/earth_sphere.glb';
import MikuM1 from "../public/images/M1.gif";
import MikuA1 from "../public/images/A1.gif";
import MikuWW from "../public/images/WW.gif";

const mikuRandom = [MikuM1, MikuA1, MikuWW];

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
		const intensity = 2;
		const light = new THREE.DirectionalLight( color, intensity );
		light.position.set( 0, 5, 20 );
		scene.add( light );
	}

	scene.add( skySystem );
	scene.add( textSystem );

	// earth
	let earth = undefined
	const gLoader = new GLTFLoader();
	gLoader.load( EarthModel, function ( gltf ) {
		earth = gltf.scene;
		earth.position.x = 0;
		earth.position.y = -25;
		earth.position.z = 10;
		earth.rotation.y = Math.PI / 1;
		earth.scale.set(1.1, 1.1, 1.1);
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
			bloomComposer.setSize( width, height );
			finalComposer.setSize( width, height );
		}
		return needResize;
	}

	// load the font
	loadFont();
	const textScaleIndex = 5;
	let char, lastChar, phrase, lastPhrase, charTemp, charFix = undefined;
	let playerPosition, meshControl, charIndex = 0;

	// Set materials
	const shaderMaterial = new THREE.ShaderMaterial( {
		uniforms: { amplitude: { value: 0.0 } },
		vertexShader: document.getElementById( 'vertexText' ).textContent,
		fragmentShader: document.getElementById( 'fragmentText' ).textContent
	} );
	// set moveing material
	let movingMaterial = shaderMaterial.clone();
	movingMaterial.uniforms.amplitude.value = 1;

	// Load Miku
	let theMiku = undefined
	THREE_GetGifTexture(mikuRandom[Math.floor(Math.random() * mikuRandom.length)]).then( texture => { 
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

	// Blooming filter
	const BLOOM_SCENE = 1;
	const bloomLayer = new THREE.Layers();
	bloomLayer.set( BLOOM_SCENE );
	scene.traverse( disposeMaterial );

	const renderScene = new RenderPass( scene, camera );
	const bloomPass = new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85 );
	bloomPass.threshold = 0;
	bloomPass.strength = 0.8;
	bloomPass.radius = 0.25;

	const bloomComposer = new EffectComposer( renderer );
	bloomComposer.renderToScreen = false;
	bloomComposer.addPass( renderScene );
	bloomComposer.addPass( bloomPass );

	const mixPass = new ShaderPass(
		new THREE.ShaderMaterial( {
			uniforms: {
				baseTexture: { value: null },
				bloomTexture: { value: bloomComposer.renderTarget2.texture }
			},
			vertexShader: document.getElementById( 'vertexshader' ).textContent,
			fragmentShader: document.getElementById( 'fragmentshader' ).textContent,
			defines: {}
		} ), 'baseTexture'
	);
	mixPass.needsSwap = true;

	const outputPass = new OutputPass();
	const finalComposer = new EffectComposer( renderer );
	finalComposer.addPass( renderScene );
	finalComposer.addPass( mixPass );
	finalComposer.addPass( outputPass );

	// Blooming functions
	const darkMaterial = new THREE.MeshBasicMaterial( { color: 0x000000 } );
	const materials = {};
	function disposeMaterial( obj ) {
		if ( obj.material ) {
			obj.material.dispose();
		}
	}
	function darkenNonBloomed( obj ) {
		if ( obj.isMesh && bloomLayer.test( obj.layers ) === false ) {
				materials[ obj.uuid ] = obj.material;
				obj.material = darkMaterial;
			}
	}
	function restoreMaterial( obj ) {
		if ( materials[ obj.uuid ] && bloomLayer.test( obj.layers ) === false) {
			obj.material = materials[ obj.uuid ];
			delete materials[ obj.uuid ];
		}
	}

	// Rendering
	function render( time ) {
		const canvas = renderer.domElement;
		time *= 0.001;
		if ( resizeRendererToDisplaySize( renderer ) ) {
			camera.aspect = canvas.clientWidth / canvas.clientHeight;
			camera.updateProjectionMatrix();
		}
		// earth rotations
		if(earth){
			earth.rotation.x = time * 0.01;
			earth.rotation.y = time * 0.05;
		}
		// skyObject rotations
		skyObjects.forEach( ( obj ) => {
			obj.rotation.z = time * 0.1;
		} );
		if(theMiku) {
			theMiku.position.y = -1 + Math.sin( time * 0.5 );
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
					charFix = createText(char.text, shaderMaterial, ( (canvas.width / canvas.height ) / textScaleIndex ) );
					textPositionHelper(charFix, charIndex, phrase.charCount, (  
						(canvas.width / canvas.height ) * textScaleIndex - 0.8 ) 
					);
					textGroup.add(charFix);
				}
				// Update lastChar
				lastChar = char.text;
				// Add char with animation
				charTemp = createText(char.text, movingMaterial, ( (canvas.width / canvas.height ) / textScaleIndex ) );
				textGroup.add(charTemp);
				textPositionHelper(charTemp, charIndex, phrase.charCount, ( 
					(canvas.width / canvas.height ) * textScaleIndex - 0.8 ) 
				);
				meshControl = 100 * Math.random();
				charIndex = charIndex + 1;
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
				charIndex = 0;
				console.log(canvas.width, canvas.height);
			}
		}
		textSystem.add(textGroup);
		// Blooming filter
		scene.traverse( darkenNonBloomed );
		renderer.setClearColor( 0x000000 );
		bloomComposer.render();
		renderer.setClearColor( 0x000005 );
		scene.traverse( restoreMaterial );
		finalComposer.render();

		requestAnimationFrame( render );
	}

	requestAnimationFrame( render );
}
main();