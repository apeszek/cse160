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

// initializes array to store the shapes
var g_shapesList = [];
var g_stack = [];

//function to set up WebGL
function setUpWebGL(){
      // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  gl = canvas.getContext('webgl', { preserveDrawingBuffer: true});
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
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
  //Buttons - Colors
  document.getElementById('green').onclick = function() {g_selectedColor = [0.0, 1.0, 0.0, 1.0]; };
  document.getElementById('red').onclick = function() {g_selectedColor = [1.0, 0.0, 0.0, 1.0]; };
 
  //Buttons - Clear, Redo, Undo
  document.getElementById('clear').onclick = function() {g_shapesList = []; g_stack = []; renderAllShapes();};
  document.getElementById('undo').onclick = undo;
  document.getElementById('redo').onclick = redo;


  //Buttons - Shape 
  document.getElementById('point').onclick = function() {g_selectedType = POINT; };
  document.getElementById('triangle').onclick = function() {g_selectedType = TRIANGLE; };
  document.getElementById('circle').onclick = function() {g_selectedType = CIRCLE; };

  //Sliders - Colors
  document.getElementById('redSlide').addEventListener('mouseup', function(){g_selectedColor[0] = this.value/100;});
  document.getElementById('greenSlide').addEventListener('mouseup', function(){g_selectedColor[1] = this.value/100;});
  document.getElementById('blueSlide').addEventListener('mouseup', function(){g_selectedColor[2] = this.value/100;});

  //Slider - Angle
  //document.getElementById('angleSlide').addEventListener('mouseup', function(){g_globalAngle = this.value; renderAllShapes(); });
  document.getElementById('angleSlide').addEventListener('mousemove', function(){g_globalAngle = this.value; renderAllShapes(); });
}

//implements function for undo button
function undo() {
  if (g_shapesList.length == 0){
    return;
  }
  const last = g_shapesList.pop();
  g_stack.push(last);

  renderAllShapes();
}

//implements function for redo button
function redo(){
  if (g_stack.length == 0){
    return;
  }
  const shape = g_stack.pop();
  g_shapesList.push(shape);
  
  renderAllShapes();
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

  //Transparency values
  //gl.enable(gl.BLEND);
  //gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  //gl.clear(gl.COLOR_BUFFER_BIT);

  renderAllShapes();
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
  renderAllShapes();
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
function renderAllShapes(){

  //pass the matrix to the u_ModelMatrix attribute
  var globalRotMat=new Matrix4().rotate(g_globalAngle, 0, 1, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  //draw test triangle 
  //drawTriangle3D([ -1.0, 0.0, 0.0,  -0.5, -1.0, 0.0,  0.0, 0.0, 0.0]);

  //draws the body (red)
  var body = new Cube();
  body.color = [1.0, 0.0, 0.0, 1.0];
  body.matrix.translate(-0.25, -0.5, 0.0);
  body.matrix.scale(0.5, 1, 0.5);
  //body.render();

  //draws the arm (yellow)
  var leftArm = new Cube();
  leftArm.color = [1.0, 1.0, 0.0, 1.0];
  leftArm.matrix.setTranslate(0.7, 0, 0);
  leftArm.matrix.rotate(45, 0, 0, 1);
  leftArm.matrix.scale(0.25, 0.7, 0.5);
  //leftArm.render();

  //draws test box (purple)
  var leftArm = new Cube();
  leftArm.color = [1.0, 0.0, 1.0, 1.0];
  leftArm.matrix.translate(0, 0, -.5, 0);
  leftArm.matrix.rotate(-30, 1, 0, 0);
  leftArm.matrix.scale(0.5, 0.5, 0.5);
  leftArm.render();
}
