// DrawTriangle.js (c) 2012 matsuda
function main() {  
  // Retrieve <canvas> element
  var canvas = document.getElementById('example');  
  if (!canvas) { 
    console.log('Failed to retrieve the <canvas> element');
    return false; 
  } 

  // Get the rendering context for 2DCG
  var ctx = canvas.getContext('2d');

  // Draw a blue rectangle
  ctx.fillStyle = "black"; //Sets to black
  ctx.fillRect(0, 0, canvas.width, canvas.height); // Fill a rectangle with the color

  //creates vector v1
  let v1 = new Vector3([2.25, 2.25, 0]);
  let v2 = new Vector3([7.00, 2.25, 0]);
  //calls drawVector function
  drawVector(ctx, v1, "red");
  drawVector(ctx, v2, "blue");

}

//FUNCTIONS
//creates drawVector function 
  function drawVector(ctx, v, color){
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    let X = 200;
    let Y = 200;
    let scale = 20;

    ctx.beginPath();
    ctx.moveTo(X, Y);
    ctx.lineTo(X + v.elements[0] * scale, Y - v.elements[1] * scale);
    ctx.stroke();
  }

  //creates drawButton function
  //called when button is clicked
  function handleDrawEvent(){
    var canvas = document.getElementById('example');
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = "black"; //Sets to black
    ctx.fillRect(0, 0, canvas.width, canvas.height); // Fill a rectangle with the color

    let x = parseFloat(document.getElementById("xInput").value);
    let y = parseFloat(document.getElementById("yInput").value);

    let v1 = new Vector3([x, y, 0]);
    drawVector(ctx, v1, "red");

    let x2 = parseFloat(document.getElementById("x2Input").value);
    let y2 = parseFloat(document.getElementById("y2Input").value);

    let v2 = new Vector3([x2, y2, 0]);
    drawVector(ctx, v2, "blue");
  }
