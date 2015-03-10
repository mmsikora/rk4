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

var camera, scene, renderer, meshCenter;
var mesh = [];
var objB;

function animate() {
  requestAnimationFrame(animate);
  objB.step();
  renderer.render(scene,camera);
}
 
$(window).resize(function() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
 
$(document).keydown(function(e) {                                              
  var msg;                                                                     
  switch(e.which) {                                                            
    case 37:  //left                                                           
      scene.rotation.y += Math.PI/32;                                                                                                  
      break;                                                                   
    case 38: //up                                                              
      scene.rotation.x += Math.PI/32;                                                                                 
      break;                                                                   
    case 39: //right                                                           
      scene.rotation.y -= Math.PI/32;                                                                                                   
      break;                                                                   
    case 40: //down                                                            
      scene.rotation.x -= Math.PI/32;                                                                                
      break;                                                                   
    default: return;                                                           
  }                                                                            
  e.preventDefault(); //prevents the default action (scroll / movecaret)       
}); 

var Simulation = function(obj){
    $(document).ready(function(){
        renderer = new THREE.WebGLRenderer();
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor( 0x404040);

        camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000);
        camera.position.set(0, 0, 1000);
        
        scene = new THREE.Scene();
        
        // Sphere
        for(var i = 0;  i < 2; i++) {
          var sphere = new THREE.SphereGeometry(5, 32, 32);
          var material = new THREE.MeshBasicMaterial( { color: 0xff00aa, wireframe: true } );
          mesh.push(new THREE.Mesh(sphere, material));
          scene.add(mesh[i]);
        }
        //Center 
        var sphere = new THREE.SphereGeometry(10, 32, 32);
        var material = new THREE.MeshBasicMaterial( { color: 0xffaa00, wireframe: true } );
        meshCenter = new THREE.Mesh(sphere, material);
        scene.add(meshCenter);
      
        //lines 
        material = new THREE.LineBasicMaterial({color: 0x0000ff});
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

/*
        var node = $('#' + id);
        var canvas = node[0];
        var interval, context, last_time;
        if(canvas && canvas.getContext){
            context = canvas.getContext('2d');
            context.fillStyle = 'rgba(40,40,40,1.0)';
            context.fillRect(0, 0, canvas.width, canvas.height);
*/
            renderer.dot = function(position, radius, i){
                var x = position.x, y = position.y, z = position.z;
                if(i == 2) {
                  meshCenter.position.x = x;   
                  meshCenter.position.y = y;   
                  meshCenter.position.z = z;   
                } else {
                  mesh[i].position.x = x;
                  mesh[i].position.y = y;
                  mesh[i].position.z = z;
                }
                if(!radius){
                    radius = 1.0;
                }
                //var gradient = context.createRadialGradient(x, y, radius, x, y, radius);
                //gradient.addColorStop(0, 'rgba(173,255,42,1.0)');
                //gradient.addColorStop(1, 'rgba(173,255,42,0.0)');
                //context.fillStyle = gradient;
                //context.beginPath();
                //context.arc(x, y, radius, 0, Math.PI*2, false);
                //context.fill();
            };
            renderer.line = function(a, b){
              var material = new THREE.LineBasicMaterial({color: 0x0000ff, linewidth: 2});
              var geometry = new THREE.Geometry();
              geometry.vertices.push(new THREE.Vector3(a.x, a.y, a.z));
              geometry.vertices.push(new THREE.Vector3(b.x, b.y, b.z));
              var line = new THREE.Line(geometry, material);
              scene.add(line);
        
                //context.strokeStyle = 'rgba(173,255,42,0.8)';
                //context.lineWidth = 0.5;
                //context.beginPath();
                //context.moveTo(a.x, a.y);
                //context.lineTo(b.x, b.y);
                //context.stroke();
            };
            obj.init();
            objB = obj;
            animate();
            //var interval, last_time;

            //renderer.hover(
             //   function(){
              //      if(!interval){
                //        last_time = (new Date().getTime());
                  //      interval = setInterval(function(){
                    //        var current_time = (new Date()).getTime();
                      //      var delta = current_time - last_time;
                    //        last_time = current_time;
                            //obj.step(delta);
                      //      obj.step();
                      //      renderer.render(scene, camera);
                   //     }, 10);
           //         }
              //  },
              //  function(){
              //      if(interval){
              //          clearInterval(interval);
              //          interval = null;
              //      }
              //  }
            //);
            /*
              .click(function(){
                context.fillStyle = 'rgba(40,40,40,1.0)';
                context.fillRect(0, 0, canvas.width, canvas.height);
                obj.init(context);
            });

        }
*/
    });
}

 


var G = 1500.0;
var acceleration = function(center, body){
    
    var direction = center.sub(body);
    var length = direction.length();
    var normal = direction.normalized();
    return normal.mul(G/Math.pow(length, 2));
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
    console.log(bodies.length);

    var center = new Vec(400, 200, 0);

    var simulation = new Simulation({
        init: function(){
            //for(var i = 0; i < obj.bodies.length; i++) {
            //  bodies[i] = obj.bodies[i].copy();
            //}
            //renderer.dot(center, 5);
            //console.log(obj.body.position);
            /*still needs to be delt with*/
            //context.dot(center, 5);
            //context.dot(obj.body.position, 1);
            renderer.dot(center, 5, 2);
        },
        step: function(){
            for(var i = 0; i < bodies.length; i++) {
              var previous = bodies[i].copy();
              obj.step(center, bodies[i]);
              renderer.dot(bodies[i].position, 5, i);
              renderer.line(previous.position, bodies[i].position);
            }
            //console.log(body.position);
            /*still needs to be delt with*/
            //context.line(previous.position, body.position);
        }
    });
};
