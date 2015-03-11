var Vec = function(x, y, z){
  this.type = 'Vector';
  this.x = x;
  this.y = y;
  this.z = z;
}

Vec.prototype = {
  isub: function(other){
    this.x -= other.x;
    this.y -= other.y;
    this.z -= other.z;
    return this;
  },
  sub: function(other){
    return new Vec(
      this.x - other.x,
      this.y - other.y,
      this.z - other.z
    );
  },
  iadd: function(other){
    this.x += other.x;
    this.y += other.y;
    this.z += other.z;
    return this;
  },
  add: function(other){
    return new Vec(
      this.x + other.x,
      this.y + other.y,
      this.z + other.z
    );
  },

  imul: function(scalar){
    this.x *= scalar;
    this.y *= scalar;
    this.z *= scalar;
    return this;
  },
  mul: function(scalar){
    return new Vec(
      this.x * scalar,
      this.y * scalar,
      this.z * scalar
    )
  },
  idiv: function(scalar){
    this.x /= scalar;
    this.y /= scalar;
    this.z /= scalar;
    return this;
  },
  div: function(scalar){
    return new Vec(
      this.x / scalar,
      this.y / scalar,
      this.z / scalar
    )
  },

  normalized: function(){
    var x=this.x, y=this.y, z=this.z;
    var length = Math.sqrt(x*x + y*y + z*z)
    return new Vec(x/length, y/length, z/length);
  },
  normalize: function(){
    var x=this.x, y=this.y, z=this.z;
    var length = Math.sqrt(x*x + y*y + z*z)
    this.x = x/length;
    this.y = y/length;
    this.z = z/length;
    return this;
  },

  length: function(){
    return Math.sqrt(this.x*this.x + this.y*this.y + this.z*this.z);
  },

  distance: function(other){
    var x = this.x - other.x;
    var y = this.y - other.y;
    var z = this.z - other.z
    return Math.sqrt(x*x + y*y + z*z);
  },

  copy: function(){
    return new Vec(this.x, this.y, this.z);
  }
}

var camera, controls, scene, renderer, meshCenter;
var mesh = [];
var objBodies;

function animate() {
  requestAnimationFrame(animate);
  objBodies.step();
  renderer.render(scene,camera);
}
 
$(window).resize(function() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
 
var Simulation = function(obj){
    $(document).ready(function(){
        objBodies = obj;
        renderer = new THREE.WebGLRenderer({ antialiasing: true } );
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor( 0x404040);

        camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 5000);
        camera.position.set(0, 0, 1000);

        controls = new THREE.OrbitControls( camera );
        controls.damping = 0.2;
        controls.addEventListener( 'change', renderer );
        
        scene = new THREE.Scene();
     
        // init spheres    
        objBodies.init();
      
        //lines 
        var material = new THREE.LineBasicMaterial({color: 0x0000ff});
        var geometry = new THREE.Geometry();
        geometry.vertices.push(new THREE.Vector3(-5000, 0, 0));
        geometry.vertices.push(new THREE.Vector3(0, 0, 0));
        geometry.vertices.push(new THREE.Vector3(5000, 0, 0));
        var line = new THREE.Line(geometry, material);
        scene.add(line);
        geometry = new THREE.Geometry();
        geometry.vertices.push(new THREE.Vector3(0, -5000, 0));
        geometry.vertices.push(new THREE.Vector3(0, 0, 0));
        geometry.vertices.push(new THREE.Vector3(0, 5000, 0));
        line = new THREE.Line(geometry, material);
        scene.add(line);
        geometry = new THREE.Geometry();
        geometry.vertices.push(new THREE.Vector3(0, 0, -5000));
        geometry.vertices.push(new THREE.Vector3(0, 0, 0));
        geometry.vertices.push(new THREE.Vector3(0, 0, 5000));
        line = new THREE.Line(geometry, material);
        
        scene.add(line);

        // Lights
        var light = new THREE.AmbientLight(0x808080);
        scene.add(light);

        $("body").append(renderer.domElement);
        renderer.dot = function(position, i){
          mesh[i].position.x = position.x;
          mesh[i].position.y = position.y;
          mesh[i].position.z = position.z;
        };
        renderer.line = function(a, b, lineColor){
          var material = new THREE.LineBasicMaterial({color: lineColor, linewidth: 2});
          var geometry = new THREE.Geometry();
          geometry.vertices.push(new THREE.Vector3(a.x, a.y, a.z));
          geometry.vertices.push(new THREE.Vector3(b.x, b.y, b.z));
          var line = new THREE.Line(geometry, material);
          scene.add(line);
        };
        animate();
    });
}

 


var G = 1500.0;
var acceleration = function(center, body, mass){
    
    var direction = center.sub(body);
    var length = direction.length();
    var normal = direction.normalized();
    return normal.mul((G*mass)/Math.pow(length, 2));
};

var copy = function(){
    var result = {}
    for(name in this){
        if(this[name].type == 'Vector'){
            result[name] = this[name].copy();
        }
        else{
            result[name] = this[name];
        }
    }
    return result;
}

var MultiBody = function(obj){
    var bodies = [];
    for(var i = 0; i < obj.bodies.length; i++) {
      obj.bodies[i].copy = copy;
      bodies.push(obj.bodies[i].copy());
    }


    var simulation = new Simulation({
        init: function(){
          for(var i = 0;  i < bodies.length; i++) {
            console.log(bodies[i].color);
            var sphere = new THREE.SphereGeometry(bodies[i].radius, 16, 16);
            var material = new THREE.MeshBasicMaterial( { color: bodies[i].color, wireframe: true } );
            mesh.push(new THREE.Mesh(sphere, material));
            scene.add(mesh[i]);
          }
        },
        step: function(){
            var previous = [];
            for(var i = 0; i < bodies.length; i++) {
              previous.push(bodies[i].copy());
            }
            for(var i = 0; i < bodies.length; i++) {
              obj.step(previous, bodies, i);
              renderer.dot(bodies[i].position, i);
              renderer.line(previous[i].position, bodies[i].position, bodies[i].lineColor);
            }
        }
    });
};
