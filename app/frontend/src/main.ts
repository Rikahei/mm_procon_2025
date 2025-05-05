import { player } from "./textalive-player";
import "./style.css";
import * as THREE from 'three';
import { skyObjects, skySystem } from "./skySystem";

async function main (){
  	// load text-alive player
  	await player;

	const canvas = document.querySelector( '#mainCanvas' );
	const renderer = new THREE.WebGLRenderer( { antialias: true, canvas } );

	const fov = 60;
	const aspect = 2; // the canvas default
	const near = 0.1;
	const far = 1000;
	const camera = new THREE.PerspectiveCamera( fov, aspect, near, far );
	camera.position.set( 0, 0, 50 );
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

	function render( time ) {

		time *= 0.001;

		if ( resizeRendererToDisplaySize( renderer ) ) {

			const canvas = renderer.domElement;
			camera.aspect = canvas.clientWidth / canvas.clientHeight;
			camera.updateProjectionMatrix();

		}

		skyObjects.forEach( ( obj ) => {
			obj.rotation.z = time * 0.3;
		} );

		renderer.render( scene, camera );

		requestAnimationFrame( render );

	}

	requestAnimationFrame( render );

}

main();