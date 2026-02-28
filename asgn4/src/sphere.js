class Sphere{
    constructor(){
        this.type = "sphere";
        //this.position = [0.0, 0.0, 0.0];
        //this.size = 5.0;
        //this.segments = 10;
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
        this.textureNum = -2;
        this.verts32 = new Float32Array([]);
    }

    render(){
        //var xy = this.position;
        var rgba = this.color;
        //var size = this.size;

        //passes the texture number
        gl.uniform1i(u_whichTexture, this.textureNum);

        //passes the color of a point to u_FragColor uniform variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        //passes the matrix to u_ModelMatrix attribute
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        var d = Math.PI/10;
        //var uv = [0,0,  0,0,  0,0,  0,0,  0,0,  0,0];

        for (var t=0; t<Math.PI; t+=d){
            for (var r=0; r<(2*Math.PI); r+=d){
                var p1 = [Math.sin(t)*Math.cos(r), Math.sin(t)*Math.sin(r), Math.cos(t)];

                var p2 = [Math.sin(t+d)*Math.cos(r), Math.sin(t+d)*Math.sin(r), Math.cos(t+d)];
                var p3 = [Math.sin(t)*Math.cos(r+d), Math.sin(t)*Math.sin(r+d), Math.cos(t)];
                var p4 = [Math.sin(t+d)*Math.cos(r+d), Math.sin(t+d)*Math.sin(r+d), Math.cos(t+d)];

                var v = [];
                var uv = [];
                v=v.concat(p1); uv=uv.concat([0,0]);
                v=v.concat(p2); uv=uv.concat([0,0]);
                v=v.concat(p4); uv=uv.concat([0,0]);

                gl.uniform4f(u_FragColor, 1,1,1,1);
                drawTriangle3DUVNormal(v, uv, v);

                v=[]; uv =[];
                v=v.concat(p1); uv=uv.concat([0,0]);
                v=v.concat(p4); uv=uv.concat([0,0]);
                v=v.concat(p3); uv=uv.concat([0,0]);
                gl.uniform4f(u_FragColor, 1,0,0,1);
                drawTriangle3DUVNormal(v, uv, v);

            }
        }
    }

}// end sphere class