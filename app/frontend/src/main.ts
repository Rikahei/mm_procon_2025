import { player, video } from "./textalive-player";
import "./style.css";
import * as THREE from 'three';
import { skyObjects, skySystem } from "./skySystem";
import { zodiacObjects, zodiacSystem, flow, loadFont, refreshText } from "./zodiacSystem";

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
	scene.add( zodiacSystem );

	const radiusTop = 50;
	const radiusBottom = 50;  
	const height = 6;  
	const radialSegments = 60;

	const geometry = new THREE.CylinderGeometry(
	radiusTop, radiusBottom, height, radialSegments );
	const material = new THREE.MeshPhongMaterial({color: 0x44aa88});
	const cylinder = new THREE.Mesh( geometry, material );
	cylinder.position.x = 0;
	cylinder.position.y = -65;
	cylinder.position.z = 0;
	cylinder.rotation.x = Math.PI / 2;

	scene.add( cylinder );
	
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

	let char = '';
	let lastChar = '';
	let phrase = undefined;
	let lastPhrase = '';
	let playerPosition = 0;

	loadFont();

	function render( time ) {
		
		time *= 0.001;

		if ( resizeRendererToDisplaySize( renderer ) ) {

			const canvas = renderer.domElement;
			camera.aspect = canvas.clientWidth / canvas.clientHeight;
			camera.updateProjectionMatrix();

		}

		skyObjects.forEach( ( obj ) => {
			obj.rotation.z = time * 0.1;
		} );

		if ( flow ) {
			flow.moveAlongCurve( -0.0005 );
			if(player.video) {
				playerPosition = player.timer.position;
	
				phrase = player.video.findPhrase(playerPosition, { loose: true });
				if( phrase != null &&
					phrase.startTime < playerPosition && playerPosition < phrase.endTime 
					&& lastPhrase != phrase.text	
				){
					// char = player.video.findChar(playerPosition, { loose: true });
					lastPhrase = phrase.text;
					refreshText(phrase.text);
				}
			}
		}

		renderer.render( scene, camera );

		requestAnimationFrame( render );

	}

	requestAnimationFrame( render );

}

main();