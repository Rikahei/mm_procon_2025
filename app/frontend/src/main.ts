import { player, video } from "./textalive-player";
import "./style.css";
import * as THREE from 'three';
import { skyObjects, skySystem } from "./skySystem";
import { uniforms, textGroup, zodiacSystem, loadFont, createText, refreshText } from "./zodiacSystem";

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
	let meshControl = 0;
	let charTemp = '';
	let charPosition = 0;
	let fixPosition = 0;

	let uniforms = {
		amplitude: { value: 0.0 }
	};
	let shaderMaterial = new THREE.ShaderMaterial( {
		uniforms: uniforms,
		vertexShader: document.getElementById( 'vertexshader' ).textContent,
		fragmentShader: document.getElementById( 'fragmentshader' ).textContent
	} );

	let movingMaterial = shaderMaterial.clone();
	movingMaterial.uniforms.amplitude.value = 0.1;

	loadFont();

	function render( time ) {
		const canvas = renderer.domElement;
		time *= 0.001;

		if ( resizeRendererToDisplaySize( renderer ) ) {

			camera.aspect = canvas.clientWidth / canvas.clientHeight;
			camera.updateProjectionMatrix();

		}

		skyObjects.forEach( ( obj ) => {
			obj.rotation.z = time * 0.1;
		} );
		if ( uniforms ) {
			if(player.video) {
				playerPosition = player.timer.position;
				phrase = player.video.findPhrase(playerPosition, { loose: true });
				char = player.video.findChar(playerPosition, { loose: true });
				
				if( char != null &&
					char.startTime < playerPosition && playerPosition < char.endTime 
					&& lastChar != char.text	
				){
					lastChar = char.text;
					if(charTemp.material){
						textGroup.remove(charTemp);
						let charFix = createText(char.text, shaderMaterial);
						charFix.position.y = 10;
						charFix.position.x = fixPosition;
						textGroup.add(charFix);
						fixPosition = fixPosition + 5;
					}
					charTemp = createText(char.text, movingMaterial);
					charTemp.position.y = 10;
					charTemp.position.x = charPosition;
					textGroup.add(charTemp);
					charPosition = charPosition + 5;
					meshControl = 100 * Math.random();
				}

				if(meshControl >= 0.02){
					meshControl = (phrase.endTime - playerPosition) / 5000;
					movingMaterial.uniforms.amplitude.value = meshControl;
				}else{
					movingMaterial.uniforms.amplitude.value = 0;
				}

				if( phrase != null &&
					phrase.startTime - 100 < playerPosition && playerPosition < phrase.endTime 
					&& lastPhrase != phrase.text	
				){
					lastPhrase = phrase.text;
					textGroup.clear();
					charPosition = -Math.abs( (phrase.charCount / canvas.clientWidth) * 1000 * 3 + 2 );
					fixPosition = -Math.abs( (phrase.charCount / canvas.clientWidth) * 1000 * 3 + 2 );
				}
			}
		}
		zodiacSystem.add(textGroup);
		renderer.render( scene, camera );

		requestAnimationFrame( render );

	}

	requestAnimationFrame( render );

}

main();