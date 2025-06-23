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
import { acceSystem } from './acceSystem';
import { textGroup, textSystem, loadFont, createText, 
	textPositionHelper, charLengthHelper, refreshText } from "./textSystem";
import EarthModel from '../public/models/earth_sphere.glb';
import MikuM11 from "../public/images/M11.gif";
import MikuM3 from "../public/images/M3.gif";
import MikuW2 from "../public/images/W2.gif";

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
		const frontLight = new THREE.DirectionalLight( color, intensity );
		const backLight = new THREE.DirectionalLight( color, 0.5 );
		frontLight.position.set( 0, 5, 20 );
		backLight.position.set( 0, -50, -150 );
		scene.add( frontLight, backLight );
	}

	scene.add( skySystem );
	scene.add( acceSystem );
	scene.add( textSystem );

	let earth, theMiku, songName, artistName, char, phrase, lastPhrase, charTemp, charFix = undefined;
	let lastCharStartTime, playerPosition, meshControl, charIndex, mikuSinging, screenRatio = 0;

	// Load earth
	const modelLoader = new GLTFLoader();
	modelLoader.load( EarthModel, function ( gltf ) {
		earth = gltf.scene;
		earth.position.x = 0;
		earth.position.y = -25;
		earth.position.z = 15;
		earth.rotation.y = Math.PI / 1;
		earth.scale.set(1.1, 1.1, 1.1);
		scene.add( earth );
	}, undefined, function ( error ) {
		console.error( error );
	});

	// Load Miku
	let mikuMaterial = new THREE.MeshBasicMaterial({
		transparent: true,
		opacity: 1,
	});
	theMiku = new THREE.Mesh(new THREE.PlaneGeometry(18, 18), mikuMaterial);
	theMiku.position.z = 20;
	theMiku.scale.set(0.6, 0.6, 0.6);
	scene.add(theMiku)

	function loadMiku(mikuStatus = 0) {
		const mikuArr = [MikuM11, MikuM3, MikuW2];
		THREE_GetGifTexture(mikuArr[mikuStatus]).then( texture => { 
			texture.colorSpace = THREE.SRGBColorSpace;
			mikuMaterial.needsUpdate = true;
	    	mikuMaterial.map = texture;
		});
		mikuSinging = mikuStatus == 1 ? 1 : 0;
	}

	let textScaleIndex = 5;

	// Set materials
	const shaderMaterial = new THREE.ShaderMaterial( {
		uniforms: { amplitude: { value: 0.0 } },
		vertexShader: document.getElementById( 'vertexText' ).textContent,
		fragmentShader: document.getElementById( 'fragmentText' ).textContent
	} );
	// set moveing material
	let movingMaterial = shaderMaterial.clone();
	movingMaterial.uniforms.amplitude.value = 1;

	// Blooming filter
	const BLOOM_SCENE = 1;
	const bloomLayer = new THREE.Layers();
	bloomLayer.set( BLOOM_SCENE );
	scene.traverse( disposeMaterial );

	const renderScene = new RenderPass( scene, camera );
	const bloomPass = new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85 );
	bloomPass.threshold = 0;
	bloomPass.strength = 0.55;
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

	function resizeRendererToDisplaySize( renderer ) {
		const canvas = renderer.domElement;
		const pixelRatio = window.devicePixelRatio;
		const width = Math.floor( canvas.clientWidth * pixelRatio );
		const height = Math.floor( canvas.clientHeight * pixelRatio );
		screenRatio = canvas.width / canvas.height;
		const needResize = canvas.width !== width || canvas.height !== height;
		if ( needResize ) {
			renderer.setSize( width, height, false );
			bloomComposer.setSize( width, height );
			finalComposer.setSize( width, height );
		}
		return needResize;
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
			obj.rotation.z = time * 0.02;
		} );
		acceSystem.rotation.z = time * -0.05;

		if(theMiku) {
			theMiku.position.x = Math.sin( time * 0.2 ) * 8;
			theMiku.position.y = -1.25 + ( Math.sin( time * 0.5 ) * 2);
			theMiku.rotation.y = Math.sin( time * 0.5 ) / 6;
		}
		if(textGroup.children) {
			textGroup.children.forEach( (font, index) => {
				const fontZ = font.position.z;
				// Set animation after the bloom effect of temp & fix chars
				if ( index % 2 == 0 && index < textGroup.children.length - 2 ) {
					font.position.z = fontZ + (Math.sin( time * 0.7 ) / 120 );
				} else if ( index < textGroup.children.length - 2 ) {
					font.position.z = fontZ + (Math.cos( time * 0.7 ) / 120 );
				}
			})
		}
		// Set player video
		if(player.video) {
			playerPosition = player.timer.position;
			phrase = player.video.findPhrase(playerPosition, { loose: true });
			char = player.video.findChar(playerPosition, { loose: true });
			// If position reach char time...
			if( char != null &&
				char.startTime < playerPosition && playerPosition < char.endTime 
				&& lastCharStartTime != char.startTime
			){
				// Replace char with no animation
				if(charTemp || !lastCharStartTime){
					textGroup.remove(charTemp);
					charFix = createText(char.text, shaderMaterial, 
						( screenRatio / textScaleIndex ) * charLengthHelper(phrase.charCount), 1, char.parent.pos );
					textPositionHelper(charFix, charIndex, phrase.charCount, (  
						screenRatio * textScaleIndex * charLengthHelper(phrase.charCount) - 0.8 ) 
					);
					textGroup.add(charFix);
				}
				// Update lastChar
				lastCharStartTime = char.startTime;
				// Add char with animation
				charTemp = createText(char.text, movingMaterial, 
					( screenRatio / textScaleIndex ) * charLengthHelper(phrase.charCount), 0, char.parent.pos );
				textGroup.add(charTemp);
				textPositionHelper(charTemp, charIndex, phrase.charCount, ( 
					screenRatio * textScaleIndex * charLengthHelper(phrase.charCount) - 0.8 ) 
				);
				meshControl = 100;
				// disable layer for last Char in textgroup
				if(textGroup.children[charIndex - 1]) {
					textGroup.children[charIndex - 1].layers.disable(1);
				}
				charIndex = charIndex + 1;
			}
			// text animation control
			if(meshControl >= 0.5 && phrase ){
				meshControl -= 0.1;
				movingMaterial.uniforms.amplitude.value = meshControl;
			}else{
				movingMaterial.uniforms.amplitude.value = 0;
				if(textGroup.children[charIndex - 1]) {
					textGroup.children[charIndex - 1].layers.disable(1);
				}
			}
			// clear text when phrase ended
			if( phrase != null &&
				phrase.startTime - 100 < playerPosition && playerPosition < phrase.endTime 
				&& lastPhrase != phrase.text	
			){
				lastPhrase = phrase.text;
				refreshText();
				charIndex = 0;
			}
			if (player.isPlaying == true && !phrase && 
					lastCharStartTime && player.data.song.length * 1000 - 8000 < playerPosition) {
				lastCharStartTime = undefined;
				refreshText();
				songName = createText(player.data.song.name, shaderMaterial, 
					( screenRatio / textScaleIndex ) * 1, 1, 'songName' );
				artistName = createText(player.data.song.artist.name, shaderMaterial, 
					( screenRatio / textScaleIndex ) * 0.6, 1, 'artistName' );
				songName.position.y = 20;
				artistName.position.y = 14;
				textGroup.add(songName, artistName);
			}
			// Miku changes
			if( player.isPlaying == false && playerPosition < 1){
				if(mikuSinging) loadMiku(2);
				if(songName && artistName) {
					songName.layers.disable(1);
					artistName.layers.disable(1);
				}
			} else {
				if(!mikuSinging) loadMiku(1);
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
	// load the font
	loadFont();
	loadMiku();
	requestAnimationFrame( render );
}
main();