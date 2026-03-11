import * as THREE from 'three';

/* IGNORE THIS COMMENTED OUT CODE FOR NOW

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';


// inital scene creation
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
const controls = new OrbitControls( camera, renderer.domElement );
const loader = new GLTFLoader();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

//create a cube (green)
const geometry = new THREE.BoxGeometry( 1, 1, 1 );
const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
const cube = new THREE.Mesh( geometry, material );
scene.add( cube );

camera.position.z = 5;

function animate( time ) {
    cube.rotation.x = time / 2000;
    cube.rotation.y = time / 1000;
  renderer.render( scene, camera );
}
renderer.setAnimationLoop( animate );
*/

function main() {
  const canvas = document.querySelector('#c');
  const renderer = new THREE.WebGLRenderer({antialias: true, canvas});
  renderer.setSize(window.innerWidth, window.innerHeight);

  //create camera
  const fov = 75;
  const aspect = window.innerWidth / window.innerHeight;
  const near = 0.1;
  const far = 100;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.set(0, 5, 0);
  camera.lookAt(0, 0, 0);

  window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  });

  const scene = new THREE.Scene();

  //test box
  const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshPhongMaterial({color: 0x44aa88});
  const cube = new THREE.Mesh(cubeGeometry, material);
  //scene.add(cube);

  //plane (road)
  const planeGeometry = new THREE.PlaneGeometry(50, 3);  // wide left-right, narrow depth
  const planeMaterial = new THREE.MeshPhongMaterial({color: 0x888888});  // road gray
  const plane = new THREE.Mesh(planeGeometry, planeMaterial);
  plane.rotation.x = -Math.PI / 2;  // lay flat
  plane.position.y = -2;            // push below the cubes
  plane.position.z = 4;
  scene.add(plane);

  //const car = new THREE.Object3D();



  //light implementation
  const color = 0xFFFFFF;
  const intensity = 3;
  const light = new THREE.DirectionalLight(color, intensity);
  light.position.set(-1, 2, 4);
  scene.add(light);
  
//function to create a new material w specified color
  function makeCubeInstance(geometry, color, x) {
    const material = new THREE.MeshPhongMaterial({color});
 
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);
 
    cube.position.x = x;
 
    return cube;
  }

  /*
  const cubes = [
  makeCubeInstance(cubeGeometry, 0x44aa88,  0),
  makeCubeInstance(cubeGeometry, 0x8844aa, -2),
  makeCubeInstance(cubeGeometry, 0xaa8844,  2),
    ];
    */


//function to animate
  function render(time) {
    time *= 0.001;

    /*
    cubes.forEach((cube, ndx) => {
        const speed = 1 + ndx * .1;
        const rot = time * speed;
        cube.rotation.x = rot;
        cube.rotation.y = rot;
    })
    */
    renderer.render(scene, camera);

    requestAnimationFrame(render)
  }
  renderer.setAnimationLoop(render);

  


} // end main

main();
