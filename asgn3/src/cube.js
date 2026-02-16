//creates class cube to create 3D cubes
class Cube {
  constructor() {
    this.type = 'cube';
    this.color = [1.0, 1.0, 1.0, 1.0];
    this.matrix = new Matrix4();
    this.textureNum = -1;
  }
  render() {
    var rgba = this.color;  

    //pass the texture number
    gl.uniform1i(u_whichTexture, this.textureNum);

    // Pass the color of a point to u_FragColor variable
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

    //Pass matrix to matrix attribute
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

    // Draw: front - GOOD - MINECRAFT
    drawTriangle3DUV( [ 0,0,0,  1,1,0,  1,0,0], [0,0,  1,1,  1,0]); //new function
    drawTriangle3DUV([0, 0, 0,  0, 1, 0,  1, 1, 0], [0,0, 0, 1,  1,1]);
    
    //Draw: right - GOOD -  
    gl.uniform4f(u_FragColor, rgba[0]*.97, rgba[1]*.97, rgba[2]*.97, rgba[3]);
    drawTriangle3DUV([1,0,0,   1, 1, 0,  1, 1, 1], [0,0, 0,1, 1,1]); 
    drawTriangle3DUV([1,0,0,   1, 1, 1,  1, 0, 1], [0,0, 1,1, 1,0]); 
    
    //Draw: top - GOOD
    //pass the color of a point to u_FragColor uniform variable
    gl.uniform4f(u_FragColor, rgba[0]*.9, rgba[1]*.9, rgba[2]*.9, rgba[3]);
    drawTriangle3DUV([0,1,0,   1, 1, 1,  0, 1, 1], [0,0, 1,1, 0,1]);
    drawTriangle3DUV([0,1,0,   1, 1, 0,  1, 1, 1], [0,0, 1,0, 1,1]);

    //Draw: back - GOOD - MINECRAFT
    //pass the color of a point to u_FragColor uniform variable
    gl.uniform4f(u_FragColor, rgba[0]*.9, rgba[1]*.9, rgba[2]*.9, rgba[3]);
    drawTriangle3DUV([0,0,1, 1,1,1, 1,0,1], [0,0, 1,1, 1,0]);
    drawTriangle3DUV([0,0,1, 0,1,1, 1,1,1], [0,0, 0,1, 1,1]);

    //Draw: bottom - GOOD
    gl.uniform4f(u_FragColor, rgba[0]*.95, rgba[1]*.95, rgba[2]*.95, rgba[3]);
    drawTriangle3D([0,0,0,   1, 0, 1,  1, 0, 0]);
    drawTriangle3D([1,0,1,   0, 0, 1,  0, 0, 0]);

    //Draw: left - GOOD - MINECRAFT
    gl.uniform4f(u_FragColor, rgba[0]*.97, rgba[1]*.97, rgba[2]*.97, rgba[3]);

    drawTriangle3DUV([0,0,0, 0,0,1, 0,1,1], [0,0, 1,0, 1,1]);
    drawTriangle3DUV([0,0,0, 0,1,1, 0,1,0],[0,0, 1,1, 0,1]);

  } // end render 


} // end cube class
