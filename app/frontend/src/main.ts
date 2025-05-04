import { player } from "./textalive-player";
import "./style.css";
import * as THREE from 'three';

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
	const skyObjects = [];
	{
		const color = 0xFFFFFF;
		const intensity = 3;
		const light = new THREE.DirectionalLight( color, intensity );
		light.position.set( - 1, 2, 4 );
		scene.add( light );
	}

	const skySystem = new THREE.Object3D();
	skySystem.position.set( 0, -65, 0 );
	scene.add( skySystem );
	skyObjects.push( skySystem );

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
	// skyObjects.push( cylinder );

	const boxWidth = 3;  
	const boxHeight = 3;  
	const boxDepth = 3; 
	const boxGeo = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);

	const boxMaterial = new THREE.MeshPhongMaterial({color: 'white'});
	const Box = new THREE.Mesh( boxGeo, boxMaterial );
	Box.position.x = 0;
	Box.position.y = -100;
	Box.position.z = -20;
	Box.rotation.x = Math.PI / 2;

	skySystem.add( Box );
	skyObjects.push( Box );

	const starsGeo = new THREE.DodecahedronGeometry(0.1, 1);
	const starsSpace = 150;
	const spaceFix = 20;
	for (let i = 0; i < 200; i++) {
		const star = new THREE.Mesh(starsGeo, new THREE.MeshLambertMaterial({ color: Math.random() * 0xffffff }));
		
		star.position.x = Math.random() * starsSpace - spaceFix;
		star.position.y = Math.random() * starsSpace - spaceFix;
		star.position.z = Math.random() * starsSpace - spaceFix - 20;

		star.rotation.x = Math.random() * 2 * Math.PI;
		star.rotation.y = Math.random() * 2 * Math.PI;
		star.rotation.z = Math.random() * 2 * Math.PI;

		star.scale.x, star.scale.y, star.scale.z = Math.random() + 1.5;
		
		skySystem.add(star);
		skyObjects.push( star );
	}

	// add an AxesHelper to each node
	// skyObjects.forEach( ( node ) => {
	// 	const axes = new THREE.AxesHelper();
	// 	axes.material.depthTest = false;
	// 	axes.renderOrder = 1;
	// 	node.add( axes );
	// } );
	
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