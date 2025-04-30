import { player } from "./textalive-player";
import "./style.css";
import * as THREE from 'three';

async function main (){
  // load text-alive player
  await player;

	const canvas = document.querySelector( '#mainCanvas' );
	const renderer = new THREE.WebGLRenderer( { antialias: true, canvas } );

	const fov = 120;
	const aspect = 2; // the canvas default
	const near = 1;
	const far = 10;
	const camera = new THREE.PerspectiveCamera( fov, aspect, near, far );
	camera.position.z = 10;

	const scene = new THREE.Scene();

	{

		const color = 0xFFFFFF;
		const intensity = 3;
		const light = new THREE.DirectionalLight( color, intensity );
		light.position.set( - 1, 2, 4 );
		scene.add( light );

	}

	const radiusTop = 22;
	const radiusBottom = 22;  
	const height = 6;  
	const radialSegments = 60;

	const geometry = new THREE.CylinderGeometry(
		radiusTop, radiusBottom, height, radialSegments );

	function makeInstance( geometry, color ) {

		const material = new THREE.MeshPhongMaterial( { color } );

		const cylinder = new THREE.Mesh( geometry, material );
		scene.add( cylinder );

		cylinder.position.x = 0;
		cylinder.position.y = -30;
		cylinder.rotation.x = Math.PI / 2;

		return cylinder;

	}

	const cylinders = [
		makeInstance( geometry, 0x44aa88 ),
	];

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

		time *= 0.0001;

		if ( resizeRendererToDisplaySize( renderer ) ) {

			const canvas = renderer.domElement;
			camera.aspect = canvas.clientWidth / canvas.clientHeight;
			camera.updateProjectionMatrix();

		}

		cylinders.forEach( ( cylinder, ndx ) => {
			const speed = 1 + ndx * .1;
			const rot = time * speed;
			// cylinder.rotation.x = rot;
			cylinder.rotation.y = rot;

		} );

		renderer.render( scene, camera );

		requestAnimationFrame( render );

	}

	requestAnimationFrame( render );

}

main();