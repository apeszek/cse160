//COLOREDPOINT.JS
// Vertex Shader Program
console.log("JS FILE LOADED"); //debugging in console.log

var VSHADER_SOURCE = `
  precision mediump float;
  attribute vec4 a_Position;
  attribute vec2 a_UV;
  varying vec2 v_UV;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;
  void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  varying vec2 v_UV;
  uniform vec4 u_FragColor;
  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1;
  uniform int u_whichTexture;
  void main() {
    if (u_whichTexture == -2){                    //use color
      gl_FragColor = u_FragColor;

    } else if (u_whichTexture == -1){             //use UV debug color
      gl_FragColor = vec4(v_UV, 1.0, 1.0);

    } else if (u_whichTexture == 0){             //use texture0 - sky
      gl_FragColor = texture2D(u_Sampler0, v_UV);

    } else if (u_whichTexture == 1){              //use texture1 - minecraft block
      gl_FragColor = texture2D(u_Sampler1, v_UV);
    
    } else {                                      //error, put red
      gl_FragColor = vec4(1, .2, .2, 1);
    }
    
  }`

// GLOBAL VARIABLES
let canvas;
let gl;
let a_Position;
let a_UV;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_ProjectionMatrix;
let u_ViewMatrix;
let u_GlobalRotateMatrix;
let u_Sampler0;
let u_Sampler1;
let u_whichTexture;

//CONST FOR SHAPES
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

//GlOBALS (RELATED TO UI)
let g_selectedColor = [1.0, 1.0, 1.0, 1.0];
let g_selectedSize = 20;
let g_selectedType = POINT;
let g_selectedSeg = 10; 

let g_globalAngle = 0;
let g_globalAngleX = 0;
let g_globalAngleY = 0;

//GLOBALS (animation and slider movement)
let g_legMove = 0;
let g_baseTailMove = 0;
let g_upperTailMove = 0;
let g_furTail = 0;
let g_animation = false;
let g_mouseIn = false;

//PERFORMANCE VARIABLES
var g_startTime = performance.now()/1000.0;
var g_seconds = performance.now()/1000.0-g_startTime;

//CAMERA + MAP VARIABLES
let newCam;
let g_mouseLastX = null;
let g_mouseLastY = null;
let g_mouseSensitivity = 0.3;
let g_mouseDown = false;

let g_map = [];
let worldSize = 32;
let worldBlocks = [];

let skyCube;
let groundCube;

//creates the array for the map
function createMap(){
  for (let x = 0; x < worldSize; x++){
    g_map[x] = [];
    for (let z = 0; z < worldSize; z++){
      if (x == 0 || z == 0 || x == worldSize-1 || z == worldSize -1){
        g_map[x][z] = 3;
      } else {
        g_map[x][z] = 0;
      }
    }
  }
  for (let x = 1; x < worldSize - 1; x++){
    for (let z = 1; z < worldSize - 1; z++){
      if (Math.random() < 0.07){
        g_map[x][z] = Math.floor(Math.random()*3)+1;
      }
    }
  }
}



//function to set up WebGL
function setUpWebGL(){
      // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  gl = canvas.getContext('webgl');

  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
  gl.enable(gl.DEPTH_TEST);
} 

//function to connect variables to GLSL
function connectVariablesToGLSL(){
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // Get the storage location of a_Position 
  // Getting the pointer position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // Get the storage location of a_UV 
  // Getting the pointer position
  a_UV = gl.getAttribLocation(gl.program, 'a_UV');
  if (a_UV < 0) {
    console.log('Failed to get the storage location of a_UV');
    return;
  }
  // Get the storage location of u_FragColor
  // Getting the javascript variable that a_position is using
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  //Get the storage location of u_ModelMatrix
  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }

  //Get the storage location of u_GlobalRotateMatrix
  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if (!u_GlobalRotateMatrix) {
    console.log('Failed to get the storage location of u_GlobalRotateMatrix');
    return;
  }

  //Get the storage location of u_viewMatrix
  u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  if (!u_ViewMatrix) {
    console.log('Failed to get the storage location of u_ViewMatrix');
    return;
  }

  //Get the storage location of u_ProjectionMatrix
  u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
  if (!u_ProjectionMatrix) {
    console.log('Failed to get the storage location of u_ProjectionMatrix');
    return;
  }

  //get the storage location of u_Sampler0
  u_Sampler0 = gl.getUniformLocation(gl.program, "u_Sampler0");
  if (!u_Sampler0){
    console.log("Failed to get the storage location of u_Sampler0");
    return;
  }
  //get the storage location of u_Sampler1
  u_Sampler1 = gl.getUniformLocation(gl.program, "u_Sampler1");
  if (!u_Sampler1){
    console.log("Failed to get the storage location of u_Sampler1");
    return;
  }

    //get the storage location of u_whichTexture
  u_whichTexture = gl.getUniformLocation(gl.program, "u_whichTexture");
  if (!u_whichTexture){
    console.log("Failed to get the storage location of u_whichTexture");
    return;
  }

  //set up initival value for matrix to identify
  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);

}// end function to connect variable to GLSL

//Actions for HTML UI Elements
function actionsforHTML(){
  //Buttons - Animation on/off
  document.getElementById('animateLegMovementOn').onclick = function() {g_animation = true;};
  document.getElementById('animateLegMovementOff').onclick = function() {g_animation = false;};

  //Slider - Tail Movement + leg movement
  document.getElementById('legMove').addEventListener('mousemove',function() {g_legMove = this.value; renderScene();});
  document.getElementById('baseTailMove').addEventListener('mousemove',function() {g_baseTailMove = this.value; renderScene();});
  document.getElementById('upperTailMove').addEventListener('mousemove',function() {g_upperTailMove = this.value; renderScene();});
  document.getElementById('furTail').addEventListener('mousemove',function() {g_furTail = this.value; renderScene();});

  //Slider - Angle
  //document.getElementById('angleSlide').addEventListener('mouseup', function(){g_globalAngle = this.value; renderAllShapes(); });
  document.getElementById('angleSlide').addEventListener('mousemove', function(){g_globalAngle = this.value; renderScene(); });
}

function initTextures(gl, textureNum){
  var image = new Image();
  if (!image){
    console.log("Failed to create the image object");
    return false;
  }
  if (textureNum == 0){
    image.onload = function(){sendTextureToGLSL(image, 0);};
    image.src = "worldSky1.jpg";
    console.log("sky image");
    return true;
  } else if (textureNum == 1){
    image.onload = function(){sendTextureToGLSL(image, 1);};
    image.src = "minecraft.jpg";
    console.log("minecraft image");
    return true;
  }
}//ends initTextures function

function sendTextureToGLSL(image, textureNum){
  var texture = gl.createTexture();
  if (!texture){
    console.log("Failed to create the texture object");
    return false;
  }
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);


  if (textureNum == 0){       //sky texture
    gl.activeTexture(gl.TEXTURE0);
  } else if (textureNum == 1){     //minecraft texture
    gl.activeTexture(gl.TEXTURE1);
  }
    //bind texture object to the target
    gl.bindTexture(gl.TEXTURE_2D, texture);

    //changes img to even dimensions
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    //set the texture parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    //set the texture image
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  
  if (textureNum == 0){     //sky texture
    //set the texture unit0 to the sampler
    gl.uniform1i(u_Sampler0, 0); 
  } else if (textureNum == 1){      //minecraft texture
    //set the texture unit1 to the sampler
    gl.uniform1i(u_Sampler1, 1);
  }

  console.log("finished loadTexture");
}//ends loadTexture function

//MAIN
function main() {
  console.log("main runs");
  //calls function to set up webGL
  setUpWebGL();

  //calls function to set up GLSL
  connectVariablesToGLSL();

  //calls HTML action function
  actionsforHTML();

    //sky implementation
  skyCube = new Cube();
  skyCube.color = [1.0, 1.0, 1.0, 1.0];
  skyCube.textureNum = 0;
  skyCube.matrix.scale(100,100,100);
  skyCube.matrix.translate(-0.5, -0.5, -0.5);
  
  //ground implementation
  groundCube = new Cube();
  groundCube.color = [0.4, 0.7, 0.0, 1.0];
  groundCube.textureNum = -2;
  groundCube.matrix.translate(0, -1, 0.0);
  groundCube.matrix.scale(worldSize, 0.01, worldSize);
  groundCube.matrix.translate(-0.5, 0, -0.5);

  createMap();

  buildWorld();

  newCam = new Camera(canvas);

  document.onkeydown = keydown;

  //camera rotation with mouse
  canvas.onmousedown = (ev) => {g_mouseDown = true; g_mouseLastX = ev.clientX; g_mouseLastY = ev.clientY;};
  canvas.onmouseup = () => {g_mouseDown = false; g_mouseLastX = null; g_mouseLastY = null;};
  canvas.onmouseleave = () => g_mouseDown = false;
  canvas.onmousemove = mouseMove;

  //load textures
  initTextures(gl,0);
  initTextures(gl,1);

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  requestAnimationFrame(tick);
}

//mouseMove function 
function mouseMove(ev){
  if (!g_mouseDown) return;

  if (g_mouseLastX == null){
    g_mouseLastX = ev.clientX;
    g_mouseLastY = ev.clientY;
    return;
  }
  let x = ev.clientX - g_mouseLastX;
  let y = ev.clientY - g_mouseLastY;

  g_mouseLastX = ev.clientX;
  g_mouseLastY = ev.clientY;

  newCam.panRight(x * g_mouseSensitivity);

  renderScene()
}

//tick function
function tick(){
  g_seconds = performance.now()/1000.0;
  //console.log(g_seconds);

  updateAnimationAngles();

  renderScene();

  requestAnimationFrame(tick);
}

function updateAnimationAngles() {
  if (g_animation) {
    g_legMove = (30*Math.sin(g_seconds));
  }
}

/*
// click function
function click(ev) {
  // extracts the event click and returns it in WebGL coords
  let [x, y] = convertCoordEventToGL(ev);

  //pushes the new data to a new point
  let point;
  if (g_selectedType == POINT){
    point = new Point();
  } else if (g_selectedType == TRIANGLE){
    point = new Triangle();
  } else if (g_selectedType == CIRCLE){
    point = new Circle();
    point.segments = g_selectedSeg;
  }
  point.position = [x,y];
  point.color = g_selectedColor.slice();
  point.size = g_selectedSize;
  g_stack = [];
  g_shapesList.push(point);

  //calls function to renderAllShapes
  // draws every shape supposed to be in the screen
  renderScene();
}

*/

function keydown(ev){
  if (ev.keyCode == 65){  //if a, move left
    newCam.moveLeft();
  } else if (ev.keyCode == 68){   //if d, move right
    newCam.moveRight();
  } else if (ev.keyCode == 87){  //if w, move forward
    newCam.moveForward();
  } else if (ev.keyCode == 83){   //if s, move backwards
    newCam.moveBackwards();
  } else if (ev.keyCode == 81){   //if q, turn to the left
    newCam.panLeft();
  } else if (ev.keyCode == 69){   //uf e, turn to the right
    newCam.panRight();
  } else if (ev.keyCode == 49 || ev.keyCode == 97){  //if 1, add block
    addBlock();
  } else if (ev.keyCode == 48 || ev.keyCode == 96) {    //if 0, remove block
    removeBlock();
  }  
  renderScene();
  console.log(ev.keyCode);
}

function convertCoordEventToGL(ev){
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

  return ([x,y]);
}
//function to find the block in front of the camera (to add and delete)
function getBlock(){
  let x = newCam.at.elements[0] - newCam.eye.elements[0];
  let z = newCam.at.elements[2] - newCam.eye.elements[2];

  let len = Math.hypot(x, z);
  x /=len;
  z /= len;

  const targetX = newCam.eye.elements[0] + x;
  const targetZ = newCam.eye.elements[2] + z;

  return{
    x: Math.floor(targetX + worldSize/2),
    z: Math.floor(targetZ + worldSize/2)
  };
}

function addBlock(){
  const {x, z} = getBlock();
  if (x < 0 || x >= worldSize || z <0 || z >= worldSize){
    return;
  }
  if (g_map[x][z] < 4){
    g_map[x][z]++;
    buildWorld();
  }
}

function removeBlock(){
  const {x, z} = getBlock();
  if (x < 0 || x >= worldSize || z <0 || z >= worldSize){
    return;
  }
  if (g_map[x][z] > 0){
    g_map[x][z]--
    buildWorld();
  }
}
//function to draw the map
function buildWorld(){
  worldBlocks = [];
  const size = 0.9;
  const offset = worldSize/2;


  for (let x = 0; x < worldSize; x++){
    for (let z = 0; z < worldSize; z++){
      let height = g_map[x][z];
        for (let y = 0; y < height; y++){
          var blocks = new Cube();
          blocks.textureNum = 1;
          blocks.matrix.setTranslate((x - offset) * size,
                  y * size - 1,
                  (z - offset) * size);

          blocks.matrix.scale(size, size, size);
          worldBlocks.push(blocks);
        }
      }
    }
  }

function drawMap(){
  for (let block of worldBlocks){
    block.render();
  }
}

//function to render all shapes
function renderScene(){
  //checks time at start of function
  var startTime = performance.now();


  //pass matrix to projection and view
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, newCam.projMat.elements);
  gl.uniformMatrix4fv(u_ViewMatrix, false, newCam.viewMat.elements);
  
  //pass the matrix to the u_ModelMatrix attribute
  var globalRotMat=new Matrix4().rotate(g_globalAngle, 0, 1, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  // Clear <canvas>
  gl.enable(gl.DEPTH_TEST);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  skyCube.render();
  groundCube.render();
  //calls function to draw the map of walls
  drawMap();

  /*
  var testCube = new Cube();
  testCube.textureNum = 1;
  testCube.matrix.translate(-3, 0, 0);
  //testCube.render();

  //draws the body - cylinder
  var body = new cylinder();
  body.color = [0.92, 0.73, 0.549, 1.0];
  body.textureNum = -2;
  body.a = 0.4;       // x-radius
  body.b = 0.3;      // z-radius
  body.height = 1.1;
  body.segments = 25;
  // transforms body
  body.matrix.scale(0.85, 1.0, 0.85);
  body.matrix.translate(-0.2, -0.2, 0.0);
  body.matrix.rotate(90, 1, 0, 0);
  body.render();

  //draws head - cube
  var head = new Cube();
  head.color = [0.85, 0.66, 0.47, 1.0];
  head.textureNum = -2;
  head.matrix.scale(0.3, 0.35, 0.3);
  head.matrix.translate(-1.1, 0, -.5);
  head.matrix.rotate(0, 1, 0, 0);
  head.render();

  //draws horns 
  //left 
  var leftHornTop = new Cube();
  leftHornTop.color = [0.6, 0.4, 0.2, 1.0];
  //leftHorn.textureNum = -2;
  leftHornTop.matrix.rotate(45, 0, 1, 0);
  leftHornTop.matrix.rotate(5, 0, 0, 1);
  leftHornTop.matrix.rotate(-30, 1, 0, 0);
  leftHornTop.matrix.scale(0.05, 0.3, 0.05);
  leftHornTop.matrix.rotate(-45, 1, 0, 0);
  leftHornTop.matrix.translate(-6, 4.9, -2.5);
  leftHornTop.render();

  var leftHornBase = new Cube();
  leftHornBase.color = [0.6, 0.4, 0.2, 1.0];
  leftHornBase.matrix.set(head.matrix);
  leftHornBase.matrix.rotate(90, 0, 0, 1);
  leftHornBase.matrix.scale(0.2, 0.8, 0.2);
  leftHornBase.matrix.translate(3.9, 0, 0.2);
  leftHornBase.render();

  //right side
  var rightHornBase = new Cube();
  rightHornBase.color = [0.6, 0.4, 0.2, 1.0];
  rightHornBase.matrix.set(head.matrix);
  rightHornBase.matrix.rotate(90, 0, 0, 1);
  rightHornBase.matrix.scale(0.2, 0.8, 0.2);
  rightHornBase.matrix.translate(3.9, -2.2, 0.2);
  rightHornBase.render();

  var rightHornTop = new Cube(); 
  rightHornTop.color = [0.6, 0.4, 0.2, 1.0];
  rightHornTop.matrix.rotate(-45, 0, 1, 0);
  rightHornTop.matrix.rotate(-5, 0, 0, 1);
  rightHornTop.matrix.rotate(-30, 1, 0, 0);
  rightHornTop.matrix.scale(0.05, 0.3, 0.05);
  rightHornTop.matrix.rotate(-45, 1, 0, 0);
  rightHornTop.matrix.translate(-0.4, 1.44, 0.2);
  rightHornTop.render();

  //draws legs (upper) - cube
  var legUpper1 = new Cube();
  legUpper1.color = [0.85, 0.66, 0.47, 1.0];
  legUpper1.matrix.scale(0.17, 0.32, 0.17);
  legUpper1.matrix.translate(-0.15, -2, 0.5);
  legUpper1.matrix.rotate(0, 1, 0, 0);
  legUpper1.render();

  var legUpper2 = new Cube();
  legUpper2.color = [0.85, 0.66, 0.47, 1.0];
  legUpper2.matrix.scale(0.17, 0.32, 0.17);
  legUpper2.matrix.translate(-2.7, -2, 0.5);
  legUpper2.matrix.rotate(0, 1, 0, 0);
  legUpper2.render();

  var legUpper3 = new Cube();
  legUpper3.color = [0.85, 0.66, 0.47, 1.0];
  legUpper3.matrix.scale(0.17, 0.32, 0.17);
  legUpper3.matrix.translate(-2.7, -2, 4.0);
  legUpper3.matrix.rotate(0, 1, 0, 0);
  legUpper3.render();

  var legUpper4 = new Cube();
  legUpper4.color = [0.85, 0.66, 0.47, 1.0];
  legUpper4.matrix.scale(0.17, 0.32, 0.17);
  legUpper4.matrix.translate(-0.15, -2, 4.0);
  legUpper4.matrix.rotate(0, 1, 0, 0);
  legUpper4.render();

  //lower sections of legs (below joint)
  var legLower1 = new Cube();
  legLower1.color = [0.95, 0.75, 0.57, 1.0];
  legLower1.matrix.scale(0.1, 0.2, 0.1);
  legLower1.matrix.translate(0.1, -4, 1.2);
  legLower1.matrix.rotate(0, 1, 0, 0);
  legLower1.matrix.rotate(g_legMove, 1, 0, 0);
  var legLower1Coords = new Matrix4(legLower1.matrix);
  legLower1.render();

  var legLower2 = new Cube();
  legLower2.color = [0.95, 0.75, 0.57, 1.0];
  legLower2.matrix.scale(0.1, 0.2, 0.1);
  legLower2.matrix.translate(-4.2, -4, 1.2);
  legLower2.matrix.rotate(0, 1, 0, 0);
  legLower2.matrix.rotate(g_legMove, 1, 0, 0);
  var legLower2Coords = new Matrix4(legLower2.matrix);
  legLower2.render();

  var legLower3 = new Cube();
  legLower3.color = [0.95, 0.75, 0.57, 1.0];
  legLower3.matrix.scale(0.1, 0.2, 0.1);
  legLower3.matrix.translate(0.1, -4, 7.0);
  legLower3.matrix.rotate(0, 1, 0, 0);  
  legLower3.matrix.rotate(-g_legMove, 1, 0, 0);
  var legLower3Coords = new Matrix4(legLower3.matrix);
  legLower3.render();

  var legLower4 = new Cube();
  legLower4.color = [0.95, 0.75, 0.57, 1.0];
  legLower4.matrix.scale(0.1, 0.2, 0.1);
  legLower4.matrix.translate(-4.2, -4, 7.0);
  legLower4.matrix.rotate(0, 1, 0, 0);
  legLower4.matrix.rotate(-g_legMove, 1, 0, 0);
  var legLower4Coords = new Matrix4(legLower4.matrix);
  legLower4.render();

  //hoofs (second joint)
  var hoof1 = new Cube();
  hoof1.color = [0.95, 0.95, 0.95, 1.0];
  hoof1.matrix.scale(0.1, 0.1, 0.1);
  hoof1.matrix.translate(0.1, -9, 1.2);
  hoof1.matrix.rotate(0, 1, 0, 0);
  hoof1.matrix = legLower1Coords;
  hoof1.matrix.translate(0, -0.5, 0); 
  hoof1.matrix.scale(1, 0.5, 1);
  hoof1.render();

  var hoof2 = new Cube();
  hoof2.color = [0.95, 0.95, 0.95, 1.0];
  hoof2.matrix.scale(0.1, 0.1, 0.1);
  hoof2.matrix.translate(-4.2, -9, 1.2);
  hoof2.matrix.rotate(0, 1, 0, 0);
  hoof2.matrix = legLower2Coords;
  hoof2.matrix.translate(0, -0.5, 0); 
  hoof2.matrix.scale(1, 0.5, 1);
  hoof2.render();

  var hoof3 = new Cube();
  hoof3.color = [0.95, 0.95, 0.95, 1.0];
  hoof3.matrix.scale(0.1, 0.1, 0.1);
  hoof3.matrix.translate(0.1, -9, 7.0);
  hoof3.matrix.rotate(0, 1, 0, 0);
  hoof3.matrix = legLower3Coords;
  hoof3.matrix.translate(0, -0.5, 0); 
  hoof3.matrix.scale(1, 0.5, 1);
  hoof3.render();

  var hoof4 = new Cube();
  hoof4.color = [0.95, 0.95, 0.95, 1.0];
  hoof4.matrix.scale(0.1, 0.1, 0.1);
  hoof4.matrix.translate(-4.2, -9, 7.0);
  hoof4.matrix.rotate(0, 1, 0, 0);
  hoof4.matrix = legLower4Coords;
  hoof4.matrix.translate(0, -0.5, 0); 
  hoof4.matrix.scale(1, 0.5, 1);
  hoof4.render();

  //TAIL
  //draws tail - cube
  var baseTail = new Cube();
  baseTail.color = [0.6, 0.4, 0.2, 1.0];
  baseTail.matrix.translate(-0.15, 0.1, 0.85);
  baseTail.matrix.rotate(90, 0, 0, 1);
  baseTail.matrix.rotate(g_baseTailMove, 1, 0, 0);
  baseTail.matrix.scale(0.07, 0.07, 0.2);
  var baseTailCoords = new Matrix4(baseTail.matrix);
  baseTail.render();

  var upperTail = new Cube();
  upperTail.color = [0.6, 0.4, 0.2, 1.0];
  upperTail.matrix = baseTailCoords;
  upperTail.matrix.translate(0, 0, 1);
  upperTail.matrix.rotate(-35, 0, 0, 1);
  upperTail.matrix.rotate(100, 1, 0, 0);
  upperTail.matrix.scale(1, 0.5, 4);
  upperTail.matrix.rotate(g_upperTailMove, 0, 1, 0);
  var upperTailCoords = new Matrix4(upperTail.matrix);
  upperTail.render();

  //bottom of tail
  var furBall = new Cube();
  furBall.color = [0.75, 0.75, 0.75, 1];
  furBall.matrix = upperTailCoords;
  furBall.matrix.rotate(0, 0, 1, 0);
  furBall.matrix.scale(1, 1, 0.4);
  furBall.matrix.translate(0, 0, 2);
  furBall.matrix.rotate(g_furTail, 0, 1, 0);
  furBall.render();
*/


  //checks the time at the end of the function (performance indicator)
  var duration = performance.now() - startTime;
  sendTextToHTML("fps: " + Math.floor(10000/duration)/10, "numdot");

} // ends renderAllShapes functions


//set the text of a HTML element function
function sendTextToHTML(text, htmlID) {
  var htmlElm = document.getElementById(htmlID);
  if (!htmlElm){
    console.log("Failed to get " + htmlID + " from HTML");
    return;
  }
  htmlElm.innerHTML = text;
}
