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
  const car = new THREE.Object3D();
  scene.add(car);

  //car base (square)
  const carMaterial = new THREE.MeshPhongMaterial({color: 0xBF0A30});
  const baseCarGeometry = new THREE.BoxGeometry(1.5, 0.8, 1);
  const baseCarMesh = new THREE.Mesh(baseCarGeometry, carMaterial);
  baseCarMesh.scale.set(3.0,3.0,3.0);
  baseCarMesh.position.x = 1.5;
  baseCarMesh.position.z = 4;
  baseCarMesh.position.y = -0.45;
  car.add(baseCarMesh);

  //car front (square)
  const carFrontGeo = new THREE.BoxGeometry(0.7, 0.5, 1);
  const carFrontMesh = new THREE.Mesh(carFrontGeo, carMaterial);
  carFrontMesh.scale.set(3.0, 3.0, 3.0);
  carFrontMesh.position.x = -1.75;
  carFrontMesh.position.z = 4;
  carFrontMesh.position.y = -0.9;
  car.add(carFrontMesh);

  //general headlight material/geometry
  const headlightOuterGeo = new THREE.CylinderGeometry(2, 2, 1, 50);
  const headlightOuterMaterial = new THREE.MeshPhongMaterial({color: 0xFF9913});
  const headlightInnerGeo = new THREE.CylinderGeometry(1, 1, 1.2, 50);
  const headlightInnerMaterial = new THREE.MeshPhongMaterial({color: 0xFFAD00});

  //function to create a headlight at (x,y,z)
  function makeHeadlights(x, y, z) {
      const headlightOuter = new THREE.Mesh(headlightOuterGeo, headlightOuterMaterial);

      //outer headlight
      headlightOuter.scale.set(0.2, 0.2, 0.2);
      headlightOuter.rotation.z = Math.PI /2;
      headlightOuter.position.set(x, y, z);
      
      //add inner headlight
      const headlightInner = new THREE.Mesh(headlightInnerGeo, headlightInnerMaterial);
      headlightOuter.add(headlightInner);

      //spotlight shooting from inner headlight
      const spotlight = new THREE.SpotLight(0xffffaa, 50, 30, Math.PI / 8, 0.3);
      spotlight.position.set(x, y, z);
      const spotTarget = new THREE.Object3D();
      spotTarget.position.set(x - 10, y, z);
      car.add(spotTarget);
      spotlight.target = spotTarget;
      car.add(spotlight);

      car.add(headlightOuter);
      return headlightOuter;
  }

  //make both headlights
  const headlights = [
     makeHeadlights(-2.8, -0.9, 3.3),  //right
     makeHeadlights(-2.8, -0.9, 4.8),  //left
  ];


  //general tire material/geometry
  const tireGeo = new THREE.CylinderGeometry(4, 4, 2, 33);
  const rimGeo = new THREE.CylinderGeometry(2, 2, 2.1, 7); 

  //function to create a tire at (x, y, z)
  function makeTire(x, y, z) {
    const tireMat = new THREE.MeshPhongMaterial({color: 0x222222});
    const rimMat = new THREE.MeshPhongMaterial({color: 0xcccccc});

    //create tire
    const tire = new THREE.Mesh(tireGeo, tireMat);
    tire.scale.set(0.15, 0.15, 0.15);
    tire.rotation.x = Math.PI / 2;
    tire.position.set(x, y, z);

    //add rim
    const rim = new THREE.Mesh(rimGeo, rimMat);
    tire.add(rim);

    scene.add(tire);
    return tire;
  }

  const tires = [
    makeTire(-0.5, -1.4, 2.4),  //front right
    makeTire(-0.5, -1.4, 5.6),  //front left
    makeTire(3.0,  -1.4, 2.4),  //back right
    makeTire(3.0,  -1.4, 5.6),  //back left
  ];


  //LIGHT IMPLEMENTATION
  //ambient lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  //directional light coming from sun
  const color = 0xFFFFFF;
  const intensity = 3;
  const light = new THREE.DirectionalLight(color, intensity);
  light.position.set(15, 30, -10);
  light.target.position.set(0, 0, 0);
  scene.add(light);
  scene.add(light.target);


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

    // animate sun rotation
    sun.rotation.y = time * 0.5;
    sun.rotation.x = time * 0.3;

    // animate tire rotation
    for (const tire of tires) {
      tire.rotation.y = time * 2;
    }

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
