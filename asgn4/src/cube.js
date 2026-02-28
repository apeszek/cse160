//creates class cube to create 3D cubes
class Cube {
  constructor() {
    this.type = 'cube';
    this.color = [1.0, 1.0, 1.0, 1.0];
    this.matrix = new Matrix4();
    this.textureNum = -1;
    this.cubeVerts32 = new Float32Array([
      0,0,0,  1,1,0,  1,0,0,
      0,0,0,  0,1,0,  1,1,0,
      0,1,1,  0,1,1,  1,1,1,
      0,1,0,  1,1,1,  1,1,0,
      1,1,0,  1,1,1,  1,0,0,
      1,0,0,  1,1,1,  1,0,1,
      0,1,0,  0,1,1,  0,0,0,
      0,0,0,  0,1,1,  0,0,1,
      0,0,0,  0,0,1,  1,0,1,
      0,0,0,  1,0,1,  1,0,0,
      0,0,1,  1,1,1,  1,0,1,
      0,0,1,  0,1,1,  1,1,1,
    ]);
    this.cubeVerts = [
      0,0,0,  1,1,0,  1,0,0,
      0,0,0,  0,1,0,  1,1,0,
      0,1,0,  0,1,1,  1,1,1,
      0,1,0,  1,1,1,  1,1,0,
      1,1,0,  1,1,1,  1,0,0,
      1,0,0,  1,1,1,  1,0,1,
      0,1,0,  0,1,1,  0,0,0,
      0,0,0,  0,1,1,  0,0,1,
      0,0,0,  0,0,1,  1,0,1,
      0,0,0,  1,0,1,  1,0,0,
      0,0,1,  1,1,1,  1,0,1,
      0,0,1,  0,1,1,  1,1,1
    ];
  }
  render() {
    var rgba = this.color;  

    //pass the texture number
    gl.uniform1i(u_whichTexture, this.textureNum);

    // Pass the color of a point to u_FragColor variable
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

    //Pass matrix to matrix attribute
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

    // Draw: front - GOOD
    drawTriangle3DUVNormal([ 0,0,0,  1,1,0,  1,0,0], [0,0,  1,1,  1,0], [0,0,-1,   0,0,-1,   0,0,-1]); //new function
    drawTriangle3DUVNormal([0, 0, 0,  0, 1, 0,  1, 1, 0], [0,0, 0, 1,  1,1], [0,0,-1,  0,0,-1,  0,0,-1]);
    
    //Draw: right - GOOD
    gl.uniform4f(u_FragColor, rgba[0]*.97, rgba[1]*.97, rgba[2]*.97, rgba[3]);
    drawTriangle3DUVNormal([1,0,0,   1, 1, 0,  1, 1, 1], [0,0, 0,1, 1,1], [1,0,0,  1,0,0,  1,0,0]); 
    drawTriangle3DUVNormal([1,0,0,   1, 1, 1,  1, 0, 1], [0,0, 1,1, 1,0], [1,0,0,  1,0,0,  1,0,0]); 
    
    //Draw: bottom - GOOD
    //pass the color of a point to u_FragColor uniform variable
    gl.uniform4f(u_FragColor, rgba[0]*.9, rgba[1]*.9, rgba[2]*.9, rgba[3]);
    drawTriangle3DUVNormal([0,1,0,   1, 1, 0,  1, 1, 1], [0,0, 1,0, 1,1], [0,1,0,  0,1,0,  0,1,0]);
    drawTriangle3DUVNormal([0,1,0,   1, 1, 1,  0, 1, 1], [0,0, 1,1, 0,1], [0,1,0,  0,1,0,  0,1,0]);

    //Draw: back - GOOD
    //pass the color of a point to u_FragColor uniform variable
    gl.uniform4f(u_FragColor, rgba[0]*.9, rgba[1]*.9, rgba[2]*.9, rgba[3]);
    drawTriangle3DUVNormal([0,0,1, 1,1,1, 1,0,1], [0,0, 1,1, 1,0], [0,0,1,  0,0,1,  0,0,1]);
    drawTriangle3DUVNormal([0,0,1, 0,1,1, 1,1,1], [0,0, 0,1, 1,1], [0,0,1,  0,0,1,  0,0,1]);

    //Draw: top - GOOD
    gl.uniform4f(u_FragColor, rgba[0]*.95, rgba[1]*.95, rgba[2]*.95, rgba[3]);
    drawTriangle3DUVNormal([0,0,0,   0, 0, 1,  1, 0, 1], [0,0,  1,1,  1,0], [0,-1,0,  0,-1,0,  0,-1,0]);
    drawTriangle3DUVNormal([0,0,0,   1, 0, 1,  1, 0, 0], [0,0,  1,0,  0,1], [0,-1,0,  0,-1,0,  0,-1,0]);

    //Draw: left - GOOD
    gl.uniform4f(u_FragColor, rgba[0]*.97, rgba[1]*.97, rgba[2]*.97, rgba[3]);
    drawTriangle3DUVNormal([0,0,0, 0,0,1, 0,1,1], [0,0, 1,0, 1,1], [-1,0,0,  -1,0,0,  -1,0,0]);
    drawTriangle3DUVNormal([0,0,0, 0,1,1, 0,1,0],[0,0, 1,1, 0,1], [-1,0,0,  -1,0,0,  -1,0,0]);

  } // end render 
  
  renderFast() {
    var rgba = this.color;

    gl.uniform1i(u_whichTexture, -2);

    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

    var allVerts = [];

    //front
    allVerts = allVerts.concat([0,0,0,  1,1,0,  1,0,0]);
    allVerts = allVerts.concat([0,0,0,  0,1,0,  1,1,0]);

    //top
    allVerts = allVerts.concat([0,1,0,  0,1,1,  1,1,1]);
    allVerts = allVerts.concat([0,1,0,  1,1,1,  1,1,0]);

    //right
    allVerts = allVerts.concat([1,1,0,  0,1,1,  1,0,0]);
    allVerts = allVerts.concat([1,0,0,  1,1,1,  1,0,1]);

    //left
    allVerts = allVerts.concat([0,1,0,  0,1,1,  0,0,0]);
    allVerts = allVerts.concat([0,0,0,  0,1,1,  0,0,1]);


  }

} // end cube class
