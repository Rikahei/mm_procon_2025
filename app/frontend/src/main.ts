import { player, mikuTimer } from "./textalive-player";
import "./style.css";
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { gui } from "./lilGui";
import { theMiku, mikuMaterial, loadMiku } from "./theMiku";
import { skyObjects, skySystem } from "./skySystem";
import { acceSystem } from './acceSystem';
import { textGroup, textSystem, loadFont, createText, 
	textPositionHelper, charLengthHelper, refreshText } from "./textSystem";
import EarthModel from '../public/models/earth_sphere.glb';

async function main (){
  	// load text-alive player
  	await player;
	await gui;

	const canvas = document.querySelector( '#mainCanvas' );
	document.querySelector("#media").className = "disabled";
	const renderer = new THREE.WebGLRenderer( { alpha: true, antialias: true, canvas } );

	const fov = 60;
	const aspect = 2; // the canvas default
	const near = 0.1;
	const far = 1000;
	const camera = new THREE.PerspectiveCamera( fov, aspect, near, far );
	camera.position.set( 0, 0, 50 ); // default z = 50
	camera.lookAt( 0, 0, 0 );

	let frontLightY = -10;
	const scene = new THREE.Scene();
	const color = 0xFFFFFF;
	const frontLight = new THREE.DirectionalLight( color, 0 );
	const ambientLight = new THREE.AmbientLight( color, 0.2 );
	frontLight.position.set( 0, 0, 20 );
	ambientLight.position.set( 0, -50, -50 );
	scene.add( frontLight, ambientLight );
	scene.add( skySystem );
	scene.add( acceSystem );
	scene.add( textSystem );

	let earth, songName, artistName, char, phrase, lastPhrase, charTemp, charFix = undefined;
	let lastCharStartTime, playerPosition, jitterUnlock, meshControl, charIndex, screenRatio = 0;

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

	const playBtnGeo = new THREE.TetrahedronGeometry(2, 0);
	const playBtn = new THREE.Mesh(playBtnGeo, new THREE.MeshBasicMaterial({
		color: 'white',
	}));
	playBtn.position.y = -8;
	playBtn.position.z = 30;
	playBtn.rotation.y = Math.PI / 1.35;
	playBtn.rotation.z = Math.PI / 1.33;
	playBtn.scale.set(0.8, 0.8, 0.8);
	playBtn.layers.enable(1);
	playBtn.name = 'playBtn';
	scene.add(playBtn);

	// Mouse pointer raycaster
	const raycaster = new THREE.Raycaster();
	const pointer = new THREE.Vector2();
	function onPointerDown(event) {
		pointer.set( ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1 );
		raycaster.setFromCamera( pointer, camera );
		const intersects = raycaster.intersectObjects( scene.children, true );
		for ( let i = 0; i < intersects.length; i ++ ) {
			if(intersects[i].object.name == 'playBtn' || intersects[i].object.parent.name == 'Earth') {
				if( player.isLoading ) return;
				playBtn.visible = false;
				player.requestPlay();
			}
		}
	}
	document.addEventListener( 'pointerdown', onPointerDown );

	let textScaleIndex = 5;

	// Set text materials
	const shaderMaterial = new THREE.ShaderMaterial( {
		uniforms: { amplitude: { value: 0.0 } },
		vertexShader: document.getElementById( 'vertexText' ).textContent,
		fragmentShader: document.getElementById( 'fragmentText' ).textContent
	} );
	// Set text moveing material
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

		if(theMiku && mikuMaterial.map) {
			playBtn.position.z = 30 + Math.sin(time * 0.2);
			theMiku.position.y = -1.5 + ( Math.sin( time * 0.5 ) * 1.5);
			theMiku.rotation.y = Math.sin( time * 0.5 ) / 6;
			// Flip miku image when arrived position
			// Don't know why set map center in render get more smooth gif action.
			if (theMiku.position.x > 9.9) {
				mikuMaterial.map.center.set( 0.5, 0.5 );
    			mikuMaterial.map.repeat.set( 1, 1 );
			} else if (theMiku.position.x < -9.9) {
				mikuMaterial.map.center.set( 0.5, 0.5 );
				mikuMaterial.map.repeat.set( -1, 1 );
			}
		}
		if(textGroup.children && player.isPlaying == true) {
			textGroup.children.forEach( (font, index) => {
				const fontZ = font.position.z;
				// Set animation after the bloom effect of temp & fix chars
				if ( index % 2 == 0 && ( index < textGroup.children.length - 2 || !phrase ) ) {
					font.position.z = fontZ + (Math.sin( time * 0.7 ) / 120 );
				} else if ( index < textGroup.children.length - 2 || !phrase ) {
					font.position.z = fontZ + (Math.cos( time * 0.7 ) / 120 );
				}
			});
		}
		// Set player video
		if(player.video) {
			playerPosition = player.timer.position;
			phrase = player.video.findPhrase(playerPosition, { loose: true });
			char = player.video.findChar(playerPosition, { loose: true });
			// Textalive API has jittery start from piapro.jp
			// Add char lock to prevent display char from random postions at starting
			if(player.isPlaying == true && phrase && phrase.firstChar.startTime == char.startTime) {
				jitterUnlock = 1;
			}

			// If position reach char time...
			if( char != null &&
				char.startTime < playerPosition && playerPosition < char.endTime 
				&& lastCharStartTime != char.startTime && jitterUnlock == 1
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
					textGroup.remove(charTemp);
					textGroup.children[charIndex - 1].layers.disable(1);
				}
			}
			// clear text when phrase ended
			if( phrase != null &&
				phrase.startTime - 50 < playerPosition && playerPosition < phrase.endTime 
				&& lastPhrase != phrase.startTime	
			){
				lastPhrase = phrase.startTime;
				refreshText();
				charIndex = 0;
			}
			// Close title and artist name
			if (player.isPlaying == true && !phrase && 
					lastCharStartTime && player.data.song.length * 1000 - 8000 < playerPosition) {
				lastCharStartTime = undefined;
				refreshText();
				songName = createText(player.data.song.name, shaderMaterial, 
					( screenRatio / textScaleIndex ) * 1, 1, 'songName' );
				artistName = createText(player.data.song.artist.name, shaderMaterial, 
					( screenRatio / textScaleIndex ) * 0.6, 1, 'artistName' );
				songName.position.y = 16.5;
				artistName.position.y = 11;
				textGroup.add(songName, artistName);
			}
			// Play animation
			if(player.isPlaying == true) {
				mikuTimer.update();
				if(playBtn.visible){
					playBtn.visible = false;
				}
				if(theMiku && mikuMaterial.map) {
					theMiku.position.x = Math.sin( mikuTimer.getElapsed() * 0.2 ) * 10;
				}
				// dim the light
				if (frontLight.intensity < 1.8) {
					frontLight.intensity += 0.002;
				};
				if (frontLightY < 20 ) {
					frontLightY += 0.02;
					frontLight.position.set( 0, frontLightY, 20 );
				}
			}
			// Dim light at ending
			if(player.isPlaying == true && 
				player.data.song.length * 1000 - 8000 < playerPosition) {
					if(frontLight.intensity > 0.1 && frontLight.intensity < 2) {
						frontLight.intensity -= 0.01;
					}
					if(frontLightY > -10 && frontLightY < 21) {
						frontLightY -= 0.2;
						frontLight.position.set(0, frontLightY, 20);
					}
			}
			// Miku changes
			if( player.isPlaying == false && playerPosition < 1){
				jitterUnlock = 0;
				playBtn.visible = true;
				if(songName && artistName) {
					songName.layers.disable(1);
					artistName.layers.disable(1);
					loadMiku(3);
				}
				if(theMiku.position.x > 0.05 || theMiku.position.x < -0.05) {
					mikuTimer.update();
					theMiku.position.x = Math.sin( mikuTimer.getElapsed() * 0.2 ) * 10;
				}
			} else {
				loadMiku(1);
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
	scene.add(theMiku);
	requestAnimationFrame( render );
}
main();