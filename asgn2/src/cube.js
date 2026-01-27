//creates class Cirlce to create circles
class Cube {
  constructor() {
    this.type = 'cube';
    this.color = [1.0, 1.0, 1.0, 1.0];
    this.matrix = new Matrix4();
  }
  render() {
    //var xy = this.position;
    var rgba = this.color;
    //var size = this.size;  

    // Pass the color of a point to u_FragColor variable
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

    //Pass matrix to matrix attribute
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

    // Draw - front - GOOD
    drawTriangle3D([0, 0, 0,  1, 1, 0,  1, 0, 0]); 
    drawTriangle3D([0, 0, 0,  0, 1, 0,  1, 1, 0]);

    //Draw - top - GOOD
    //pass the color of a point to u_FragColor uniform variable
    gl.uniform4f(u_FragColor, rgba[0]*.9, rgba[1]*.9, rgba[2]*.9, rgba[3]);
    drawTriangle3D([0,1,0,   0, 1, 1,  1, 1, 1]);
    drawTriangle3D([0,1,0,   1, 1, 1,  1, 1, 0]);

    //other sides of cube (bottom, left, right, etc) - DO LATER

    //Draw - back - GOOD
    //pass the color of a point to u_FragColor uniform variable
    gl.uniform4f(u_FragColor, rgba[0]*.85, rgba[1]*.85, rgba[2]*.85, rgba[3]);
    drawTriangle3D([0,1,1,   1, 0, 1,  0, 0, 1]);
    drawTriangle3D([0,1,1,   1, 1, 1,  1, 0, 1]);

    //Draw - right side - GOOD
    //drawTriangle3D([1,0,0,   1, 1, 0,  1, 1, 1]); //top left
    //drawTriangle3D([1,0,0,   1, 1, 1,  1, 0, 1]); //bottom right


    //bottom side, left triangle
    //drawTriangle3D([0,0,1,   1, 0, 0,  1, 0, 1]);
  }


} // end cube class
