class cylinder {
  constructor() {
    this.type = 'cylinder';
    this.color = [1, 1, 1, 1];
    this.matrix = new Matrix4();

    // ellipse radii (x and z)
    this.a = 0.5;
    this.b = 0.3;

    // height in y
    this.height = 1.0;

    // smoothness
    this.segments = 24;
  }

  render() {
    const rgba = this.color;

    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

    const seg = Math.max(3, Math.floor(this.segments));
    const step = (2 * Math.PI) / seg;

    for (let i = 0; i < seg; i++) {
      const t1 = i * step;
      const t2 = (i + 1) * step;

      const x1 = this.a * Math.cos(t1);
      const z1 = this.b * Math.sin(t1);
      const x2 = this.a * Math.cos(t2);
      const z2 = this.b * Math.sin(t2);

      // --- SIDE (two triangles per slice) ---
      gl.uniform4f(u_FragColor, rgba[0]*0.95, rgba[1]*0.95, rgba[2]*0.95, rgba[3]);
      drawTriangle3D([ x1,0,z1,   x2,0,z2,   x2,this.height,z2 ]);
      drawTriangle3D([ x1,0,z1,   x2,this.height,z2,   x1,this.height,z1 ]);

      // --- TOP CAP (triangle fan) ---
      gl.uniform4f(u_FragColor, rgba[0]*0.90, rgba[1]*0.90, rgba[2]*0.90, rgba[3]);
      drawTriangle3D([ 0,this.height,0,   x2,this.height,z2,   x1,this.height,z1 ]);

      // --- BOTTOM CAP (triangle fan, flipped winding) ---
      gl.uniform4f(u_FragColor, rgba[0]*0.85, rgba[1]*0.85, rgba[2]*0.85, rgba[3]);
      drawTriangle3D([ 0,0,0,   x1,0,z1,   x2,0,z2 ]);
    }
  }
}
