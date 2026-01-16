//COLOREDPOINT.JS
// Vertex Shader Program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform float u_Size;
  void main() {
    gl_Position = a_Position;
    //gl_PointSize = 20.0;
    gl_PointSize = u_Size;
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

//GlOBALS (RELATED TO UI)
let g_selectedColor = [1.0, 1.0, 1.0, 1.0];
let g_selectedSize = 5;

//function to set up WebGL
function setUpWebGL(){
      // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  gl = getWebGLContext(canvas);
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

  //Get the storage location of u_Size
  u_Size = gl.getUniformLocation(gl.program, 'u_Size');
  if (!u_Size) {
    console.log('Failed to get the storage location of u_Size');
    return;
  }
}// end function 

//Actions for HTML UI Elements
function actionsforHTML(){
  //Buttons - Colors
  document.getElementById('green').onclick = function() {g_selectedColor = [0.0, 1.0, 0.0, 1.0]; };
  document.getElementById('red').onclick = function() {g_selectedColor = [1.0, 0.0, 0.0, 1.0]; };

  //Sliders - Colors
  document.getElementById('redSlide').addEventListener('mouseup', function(){g_selectedColor[0] = this.value/100;});
  document.getElementById('greenSlide').addEventListener('mouseup', function(){g_selectedColor[1] = this.value/100;});
  document.getElementById('blueSlide').addEventListener('mouseup', function(){g_selectedColor[2] = this.value/100;});

  //Slider - Shape Size
  document.getElementById('sizeSlide').addEventListener('mouseup', function(){g_selectedSize = this.value;});


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

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);
}

var g_points = [];  // The array for the position of a mouse press
var g_colors = [];  // The array to store the color of a point
var g_sizes = []; //The array to store the size of a point

// click function
function click(ev) {
  // extracts the event click and returns it in WebGL coords
  let [x, y] = convertCoordEventToGL(ev);

  // Store the coordinates to g_points array
  g_points.push([x, y]);
  // Store the coordinates to g_points array
  
  g_colors.push(g_selectedColor.slice());

  g_sizes.push(g_selectedSize);

  /*
  if (x >= 0.0 && y >= 0.0) {      // First quadrant
    g_colors.push([1.0, 0.0, 0.0, 1.0]);  // Red
  } else if (x < 0.0 && y < 0.0) { // Third quadrant
    g_colors.push([0.0, 1.0, 0.0, 1.0]);  // Green
  } else {                         // Others
    g_colors.push([1.0, 1.0, 1.0, 1.0]);  // White
  }
  */

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
    // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  var len = g_points.length;
  for(var i = 0; i < len; i++) {
    var xy = g_points[i];
    var rgba = g_colors[i];
    var size = g_sizes[i];

    // Pass the position of a point to a_Position variable
    gl.vertexAttrib3f(a_Position, xy[0], xy[1], 0.0);
    // Pass the color of a point to u_FragColor variable
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    //Pass the size of a point to u_Size variable
    gl.uniform1f(u_Size, size);
    // Draw
    gl.drawArrays(gl.POINTS, 0, 1);

  }
}
