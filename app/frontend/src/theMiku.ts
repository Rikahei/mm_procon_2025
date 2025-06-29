import * as THREE from 'three';
import {THREE_GetGifTexture} from "threejs-gif-texture";
import MikuM11 from "../public/images/M11.gif";
import MikuA2 from "../public/images/A2.gif";
import MikuM3 from "../public/images/M3.gif";
import MikuW2 from "../public/images/W2.gif";

export { theMiku, mikuMaterial, loadMiku };

let theMiku;

// Load Miku
let mikuMaterial = new THREE.MeshBasicMaterial({
	transparent: true,
	opacity: 1,
});
theMiku = new THREE.Mesh(new THREE.PlaneGeometry(18, 18), mikuMaterial);
theMiku.position.z = 20;
theMiku.scale.set(0.65, 0.65, 0.65);

let lastStatus = -1;
let guiLocked = 0;
function loadMiku(mikuStatus = 0, guiRequest = 0) {
    // unlock to change gif
    if(guiRequest > 0 || guiRequest == -1) guiLocked = 0;
    if(lastStatus == mikuStatus || guiLocked > 0) return;
	const mikuArr = [MikuM11, MikuM3, MikuA2, MikuW2];
	THREE_GetGifTexture(mikuArr[mikuStatus]).then( texture => { 
		texture.colorSpace = THREE.SRGBColorSpace;
		mikuMaterial.needsUpdate = true;
    	mikuMaterial.map = texture;
	});
	lastStatus = mikuStatus;
    // lock at after change gif
    if(guiRequest > 0) {
        guiLocked = guiRequest;
    }
}