//camera class implementation
class Camera{
    constructor(canvas){
        this.fov = 60;
        this.eye = new Vector3([0, 0, 0]);
        this.at = new Vector3([0, 0, 1]);
        this.up = new Vector3([0, 1, 0]);

        //view matrix
        this.viewMat = new Matrix4();
        this.viewMat.setLookAt(this.eye.elements[0], this.eye.elements[1], this.eye.elements[2],
                                this.at.elements[0], this.at.elements[1], this.at.elements[2],
                                this.up.elements[0], this.up.elements[1], this.up.elements[2]);

        //pass the projection matrix
        this.projMat = new Matrix4();
        this.projMat.setPerspective(this.fov, canvas.width/canvas.height, 0.1, 1000); //change first num to zoom out
    }
    updateView(){
        this.viewMat.setLookAt(this.eye.elements[0], this.eye.elements[1], this.eye.elements[2],
                                this.at.elements[0], this.at.elements[1], this.at.elements[2],
                                this.up.elements[0], this.up.elements[1], this.up.elements[2]);

    }

    moveForward(speed = 0.2) {
        let f = new Vector3(this.at.elements);
        f.sub(this.eye);
        f.normalize();
        f.mul(speed);
        this.eye.add(f);
        this.at.add(f);
        this.updateView();
    }

    moveBackwards(speed = 0.2) {
        let b = new Vector3(this.eye.elements);
        b.sub(this.at);
        b.normalize();
        b.mul(speed);
        this.eye.add(b);
        this.at.add(b);
        this.updateView();
    }

    moveLeft(speed = 0.2) {
        let f = new Vector3(this.at.elements);
        f.sub(this.eye);
        f.normalize();

        let s = Vector3.cross(this.up,f);
        s.normalize();
        s.mul(speed);
        this.eye.add(s);
        this.at.add(s);
        this.updateView();
    }

    moveRight(speed = 0.2) {
        let f = new Vector3(this.at.elements);
        f.sub(this.eye);
        f.normalize();

        let s = Vector3.cross(f, this.up);
        s.normalize();
        s.mul(speed);
        this.eye.add(s);
        this.at.add(s);
        this.updateView();
    }

    panLeft(alpha = 5){
        let f = new Vector3(this.at.elements);
        f.sub(this.eye);

        let rotation = new Matrix4();
        rotation.setRotate(alpha, this.up.elements[0], this.up.elements[1], this.up.elements[2]);

        let fPrime = rotation.multiplyVector3(f);

        this.at = new Vector3(this.eye.elements);
        this.at.add(fPrime);

        this.updateView();
    }

    panRight(alpha = 5){
        let f = new Vector3(this.at.elements);
        f.sub(this.eye);

        let rotation = new Matrix4();
        rotation.setRotate(-alpha, this.up.elements[0], this.up.elements[1], this.up.elements[2]);

        let fPrime = rotation.multiplyVector3(f);

        this.at = new Vector3(this.eye.elements);
        this.at.add(fPrime);

        this.updateView();
    }

}//end camera class