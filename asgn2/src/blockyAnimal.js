//COLOREDPOINT.JS
// Vertex Shader Program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  void main() {
    gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  }`

// GLOBAL VARIABLES
let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_GlobalRotateMatrix;

const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

//GlOBALS (RELATED TO UI)
let g_selectedColor = [1.0, 1.0, 1.0, 1.0];
let g_selectedSize = 20;
let g_selectedType = POINT;
let g_selectedSeg = 10; 
let g_globalAngle = 0;
let g_legMove = 0;


// initializes array to store the shapes
var g_shapesList = [];
var g_stack = [];

//function to set up WebGL
function setUpWebGL(){
      // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  //gl = getWebGLContext(canvas);
  gl = canvas.getContext('webgl', { preserveDrawingBuffer: true});
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

  //set up initival value for matrix to identify
  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);

}// end function to connect variable to GLSL

//Actions for HTML UI Elements
function actionsforHTML(){
  //Slider - Leg Movement
  document.getElementById('legMove').addEventListener('mousemove',function() {g_legMove = this.value; renderScene();});

  //Slider - Angle
  //document.getElementById('angleSlide').addEventListener('mouseup', function(){g_globalAngle = this.value; renderAllShapes(); });
  document.getElementById('angleSlide').addEventListener('mousemove', function(){g_globalAngle = this.value; renderScene(); });
}

//implements function for undo button
function undo() {
  if (g_shapesList.length == 0){
    return;
  }
  const last = g_shapesList.pop();
  g_stack.push(last);

  renderScene();
}

//implements function for redo button
function redo(){
  if (g_stack.length == 0){
    return;
  }
  const shape = g_stack.pop();
  g_shapesList.push(shape);
  
  renderScene();
}

//MAIN
function main() {
  //calls function to set up webGL
  setUpWebGL();

  //calls function to set up GLSL
  connectVariablesToGLSL();

  //calls HTML action function
  actionsforHTML();

  // Register function (event handler) to be called on a mouse press
  // calls click function,
  canvas.onmousedown = click;

  canvas.onmousemove = function(ev) { if (ev.buttons == 1) {click(ev) }};

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  renderScene();
}

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

function convertCoordEventToGL(ev){
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

  return ([x,y]);
}

//function to render all shapes
function renderScene(){
  //checks time at start of function
  var startTime = performance.now();
  
  //pass the matrix to the u_ModelMatrix attribute
  var globalRotMat=new Matrix4().rotate(g_globalAngle, 0, 1, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  //draws the body - cylinder
  var body = new cylinder();
  body.color = [0.92, 0.73, 0.549, 1.0];
  body.a = 0.4;       // x-radius
  body.b = 0.3;      // z-radius
  body.height = 1.1;
  body.segments = 25;
  // transforms body
  body.matrix.scale(0.9, 1.0, 0.9);
  body.matrix.translate(-0.2, -0.2, 0.0);
  body.matrix.rotate(90, 1, 0, 0);
  body.render();

  //draws head - cube
  var head = new Cube();
  head.color = [0.85, 0.66, 0.47, 1.0];
  head.matrix.scale(0.3, 0.35, 0.3);
  head.matrix.translate(-1.1, 0, -.5);
  head.matrix.rotate(0, 1, 0, 0);
  head.render();

  //draws horns 
  //left 
  var leftHornTop = new Cube();
  leftHornTop.color = [0.6, 0.4, 0.2, 1.0];
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
  //legLower1.matrix.rotate(-45, 1, 0, 0);
  legLower1.matrix.scale(0.1, 0.2, 0.1);
  legLower1.matrix.translate(0.1, -4, 1.2);
  legLower1.matrix.rotate(0, 1, 0, 0);
  legLower1.render();

  var legLower2 = new Cube();
  legLower2.color = [0.95, 0.75, 0.57, 1.0];
  //legLower1.matrix.rotate(-45, 1, 0, 0);
  legLower2.matrix.scale(0.1, 0.2, 0.1);
  legLower2.matrix.translate(-4.2, -4, 1.2);
  legLower2.matrix.rotate(0, 1, 0, 0);
  legLower2.render();

  var legLower3 = new Cube();
  legLower3.color = [0.95, 0.75, 0.57, 1.0];
  //legLower1.matrix.rotate(-45, 1, 0, 0);
  legLower3.matrix.scale(0.1, 0.2, 0.1);
  legLower3.matrix.translate(0.1, -4, 7.0);
  legLower3.matrix.rotate(0, 1, 0, 0);
  legLower3.render();

  var legLower4 = new Cube();
  legLower4.color = [0.95, 0.75, 0.57, 1.0];
  //legLower1.matrix.rotate(-45, 1, 0, 0);
  legLower4.matrix.scale(0.1, 0.2, 0.1);
  legLower4.matrix.translate(-4.2, -4, 7.0);
  legLower4.matrix.rotate(0, 1, 0, 0);
  legLower4.render();

  //hoofs (second joint)
  var hoof1 = new Cube();
  hoof1.color = [0.95, 0.95, 0.95, 1.0];
  //legLower1.matrix.rotate(-45, 1, 0, 0);
  hoof1.matrix.scale(0.1, 0.1, 0.1);
  hoof1.matrix.translate(0.1, -9, 1.2);
  hoof1.matrix.rotate(0, 1, 0, 0);
  hoof1.render();

  var hoof2 = new Cube();
  hoof2.color = [0.95, 0.95, 0.95, 1.0];
  //legLower1.matrix.rotate(-45, 1, 0, 0);
  hoof2.matrix.scale(0.1, 0.1, 0.1);
  hoof2.matrix.translate(-4.2, -9, 1.2);
  hoof2.matrix.rotate(0, 1, 0, 0);
  hoof2.render();

  var hoof3 = new Cube();
  hoof3.color = [0.95, 0.95, 0.95, 1.0];
  //legLower1.matrix.rotate(-45, 1, 0, 0);
  hoof3.matrix.scale(0.1, 0.1, 0.1);
  hoof3.matrix.translate(0.1, -9, 7.0);
  hoof3.matrix.rotate(0, 1, 0, 0);
  hoof3.render();

  var hoof4 = new Cube();
  hoof4.color = [0.95, 0.95, 0.95, 1.0];
  //legLower1.matrix.rotate(-45, 1, 0, 0);
  hoof4.matrix.scale(0.1, 0.1, 0.1);
  hoof4.matrix.translate(-4.2, -9, 7.0);
  hoof4.matrix.rotate(0, 1, 0, 0);
  hoof4.render();



  //TAIL
  //draws tail - cube
  var upperTail = new Cube();
  upperTail.color = [0.6, 0.4, 0.2, 1.0];
  upperTail.matrix.rotate(45, -45, 0, 0);
  upperTail.matrix.scale(0.05, 0.5, 0.05);
  upperTail.matrix.translate(-3.2, -3, 11);
  //upperTail.render();

  var baseTail = new Cube();
  baseTail.color = [0.6, 0.4, 0.2, 1.0];
  baseTail.matrix.rotate(90, 0, 0, 1);
  baseTail.matrix.scale(0.05, 0.5, 0.05);
  baseTail.matrix.translate(2, 1, 1);
  baseTail.render();


  //COME BACK TO THIS
  //gl.disable(gl.DEPTH_TEST); // so it always appears on top
// (optional) stop global rotation from affecting overlay
  //let id = new Matrix4();
  //gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, id.elements);
  //gl.uniformMatrix4fv(u_ModelMatrix, false, id.elements);
  //lighter color on stomach 
  var belly = new Circle
  belly.color = [0.9, 0.9, 0.9, 1.0];
  belly.position = [-0.05, -0.2];
  belly.size = 30;
  belly.segments = 30;
  //belly.render();

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
