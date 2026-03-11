import * as THREE from 'three';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { MinMaxGUIHelper } from './MinMaxGUIHelper.js';

function main() {
  const canvas = document.querySelector('#c');
  const view1Elem = document.querySelector('#view1');
  const view2Elem = document.querySelector('#view2');
  const renderer = new THREE.WebGLRenderer({antialias: true, canvas});
  //renderer.setSize(window.innerWidth, window.innerHeight);

  //create camera
  const fov = 75;
  const aspect = 2;
  const near = 0.1;
  const far = 1000;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.set(0, 5, 30);
  camera.lookAt(0, 0, 0);

  const cameraHelper = new THREE.CameraHelper(camera);

  function updateCamera() {
    camera.updateProjectionMatrix();
  }
  const gui = new GUI();
  gui.add(camera, 'fov', 1, 180);
  const minMaxGUIHelper = new MinMaxGUIHelper(camera, 'near', 'far', 0.1);
  gui.add(minMaxGUIHelper, 'min', 0.1, 50, 0.1).name('near');
  gui.add(minMaxGUIHelper, 'max', 0.1, 1000, 1).name('far');

  const controls = new OrbitControls( camera, view1Elem);
  controls.target.set(0,5,0);
  controls.update();

  const camera2 = new THREE.PerspectiveCamera(
    60, //fov
    2, //aspect
    0.1, //near
    500, //far
  );
  camera2.position.set(40,10,30);
  camera2.lookAt(0,5,0);

  const controls2 = new OrbitControls(camera2, view2Elem);
  controls.target.set(0,5,0);
  controls2.update();

  const scene = new THREE.Scene();
  scene.background = new THREE.Color ('black');
  scene.add( cameraHelper);

  //test box
  const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshPhongMaterial({color: 0x44aa88});
  const cube = new THREE.Mesh(cubeGeometry, material);
  //scene.add(cube);

//OBJECTS
  //grass base (plane)
  const grassGeo = new THREE.PlaneGeometry(1000, 1000);  // wide left-right, narrow depth
  const grassMaterial = new THREE.MeshPhongMaterial({color: 0x52a447});  // road gray
  const grass = new THREE.Mesh(grassGeo, grassMaterial);
  grass.rotation.x = -Math.PI / 2;  // lay flat
  grass.position.y = -2.2;            // push below the cubes
  grass.position.z = 6;
  scene.add(grass);

  //road (plane)
  const planeGeometry = new THREE.PlaneGeometry(1000, 8);  // wide left-right, narrow depth
  const planeMaterial = new THREE.MeshPhongMaterial({color: 0x888888});  // road gray
  const plane = new THREE.Mesh(planeGeometry, planeMaterial);
  plane.rotation.x = -Math.PI / 2;  // lay flat
  plane.position.y = -2;            // push below the cubes
  plane.position.z = 6;
  scene.add(plane);
  
  //sun (dodecahedron)
  const sunGeo = new THREE.DodecahedronGeometry( 4, 5 );
  const sunMaterial = new THREE.MeshPhongMaterial({color: 0xFFD300});
  const sun = new THREE.Mesh(sunGeo, sunMaterial);
  sun.position.y = 30;
  sun.position.z = -10;
  sun.position.x = 15;
  scene.add(sun);


  //CAR OBJECT
  const objects = []; //array to hold objects that will rotate
  const car = new THREE.Object3D();
  scene.add(car);
  //objects.push(car);

  //car base (square)
  const carMaterial = new THREE.MeshPhongMaterial({color: 0xBF0A30});
  const baseCarGeometry = new THREE.BoxGeometry(1.5, 0.5, 1);
  const baseCarMesh = new THREE.Mesh(baseCarGeometry, carMaterial);
  baseCarMesh.scale.set(3.5,3.5,3.5);
  baseCarMesh.position.x = 1.5;
  baseCarMesh.position.z = 4;
  baseCarMesh.position.y = -0.5;
  car.add(baseCarMesh);
  //objects.push(baseCarMesh);



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

  //skybox
  const loader = new THREE.TextureLoader();
  const skyTexture = loader.load('blue-sky.jpg');
  skyTexture.colorSpace = THREE.SRGBColorSpace;
  const skyGeo = new THREE.BoxGeometry(1000, 1000, 1000);
  const skyMat = new THREE.MeshBasicMaterial({ map: skyTexture, side: THREE.BackSide });
  const skyBox = new THREE.Mesh(skyGeo, skyMat);
  scene.add(skyBox);


  function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      renderer.setSize(width, height, false);
    }
    return needResize;
  }

  function setScissorForElement(elem) {
    const canvasRect = canvas.getBoundingClientRect();
    const elemRect = elem.getBoundingClientRect();
    const right = Math.min(elemRect.right, canvasRect.right) - canvasRect.left;
    const left = Math.max(0, elemRect.left - canvasRect.left);
    const bottom = Math.min(elemRect.bottom, canvasRect.bottom) - canvasRect.top;
    const top = Math.max(0, elemRect.top - canvasRect.top);
    const width = Math.min(canvasRect.width, right - left);
    const height = Math.min(canvasRect.height, bottom - top);
    const positiveYUpBottom = canvasRect.height - bottom;
    renderer.setScissor(left, positiveYUpBottom, width, height);
    renderer.setViewport(left, positiveYUpBottom, width, height);
    return width / height;
  }

  //function to animate
  function render(time) {
    time *= 0.001;

    resizeRendererToDisplaySize(renderer);

    //turn on scissor
    renderer.setScissorTest(true);

    // view1 - main camera (original view)
    {
      const aspect = setScissorForElement(view1Elem);

      //asjust camera for this aspect
      camera.aspect = aspect;
      camera.updateProjectionMatrix();
      cameraHelper.update();
      
      cameraHelper.visible = false;
      renderer.render(scene, camera);
    }

    // view2 - overview camera
    {
      const aspect = setScissorForElement(view2Elem);
      camera2.aspect = aspect;
      camera2.updateProjectionMatrix();
      cameraHelper.visible = true;
      renderer.render(scene, camera2);
    }
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);

  
} // end main

main(); // call main
