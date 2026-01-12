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

  //creates handleDrawOperationEvent function
  function handleDrawOperationEvent(){
    var canvas = document.getElementById('example');
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = "black"; //Sets to black
    ctx.fillRect(0, 0, canvas.width, canvas.height); // Fill a rectangle with the color

    //reads and calls v1 and v2
    let x = parseFloat(document.getElementById("xInput").value);
    let y = parseFloat(document.getElementById("yInput").value);
    let v1 = new Vector3([x, y, 0]);
    drawVector(ctx, v1, "red");

    let x2 = parseFloat(document.getElementById("x2Input").value);
    let y2 = parseFloat(document.getElementById("y2Input").value);
    let v2 = new Vector3([x2, y2, 0]);
    drawVector(ctx, v2, "blue");

    //reads operation
    let operation = document.getElementById("selectedOp").value;
    let scalar = parseFloat(document.getElementById("scalarInput").value);

    //diff operations
    //add
    if (operation == "add") {
      let v3 = new Vector3([v1.elements[0], v1.elements[1], 0]);
      v3.add(v2);
      drawVector(ctx, v3, "green");
    //sub
    } else if(operation == "sub"){
      let v3 = new Vector3([v1.elements[0], v1.elements[1], 0]);
      v3.sub(v2);
      drawVector(ctx, v3, "green");
    //div
    } else if(operation == "div"){
      let v3 = new Vector3([v1.elements[0], v1.elements[1], 0]).div(scalar);
      let v4 = new Vector3([v2.elements[0], v2.elements[1], 0]).div(scalar);
      drawVector(ctx, v3, "green");
      drawVector(ctx, v4, "green");
    //mult
    } else if (operation == "mul"){
      let v3 = new Vector3([v1.elements[0], v1.elements[1], 0]).mul(scalar);
      let v4 = new Vector3([v2.elements[0], v2.elements[1], 0]).mul(scalar);
      drawVector(ctx, v3, "green");
      drawVector(ctx, v4, "green");
    //mag
    } else if (operation == "mag"){
      //prints operations to console
      console.log("Magnitue V1:", v1.magnitude());
      console.log("Magnitude v2:", v2.magnitude());
    //norm
    } else if (operation == "norm"){
      let v3 = new Vector3([v1.elements[0], v1.elements[1], 0]).normalize();
      let v4 = new Vector3([v2.elements[0], v2.elements[1], 0]).normalize();
      drawVector(ctx, v3, "green");
      drawVector(ctx, v4, "green");
    //angle bw
    } else if(operation == "ang"){
      let angle = angleBetween(v1, v2);
      console.log("Angle:", angle);
    }

  }
      //angle between function
  function angleBetween(v1, v2){
    let dot = Vector3.dot(v1, v2);
    let mag1 = v1.magnitude();
    let mag2 = v2.magnitude();
    let cosA = dot / (mag1 * mag2);
    return Math.acos(cosA) * (180/Math.PI)
  }
