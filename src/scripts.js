import * as THREE from "three";
// import {OrbitControls}  from 'three/examples/jsm/controls/OrbitControls';


let rotX = 0.05;
let rotY = 0.05;

const renderer = new THREE.WebGLRenderer({antialias:true});
renderer.shadowMap.enabled = true;

renderer.setSize(window.innerWidth, window.innerHeight);
console.log(window.innerWidth, window.innerHeight);
// renderer.setClearColor(0xF2F1FF, 1);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
)
// const orbit = new OrbitControls(camera,renderer.domElement);

let rotateAroundWorldAxis = function(object, axis, radians) {
  let rotWorldMatrix = new THREE.Matrix4();
  rotWorldMatrix.makeRotationAxis(axis.normalize(), radians);

  // let currentPos = new THREE.Vector4(object.position.x, object.position.y, object.position.z, 1);
  // let newPos = currentPos.applyMatrix4(rotWorldMatrix);

  rotWorldMatrix.multiply(object.matrix);
  object.matrix = rotWorldMatrix;
  object.rotation.setFromRotationMatrix(object.matrix);

  // object.position.x = newPos.x;
  // object.position.y = newPos.y;
  // object.position.z = newPos.z;
};



camera.position.set(0,10,20);
// orbit.update();


const planeGeometry = new THREE.PlaneGeometry(20,10);
const planeMaterial = new THREE.MeshStandardMaterial({color:0xFFFFFF,
  side: THREE.DoubleSide
});
const plane = new THREE.Mesh(planeGeometry,planeMaterial);
scene.add(plane);
plane.rotation.x = -0.5*Math.PI;
plane.receiveShadow = true;


const boxGeometry = new THREE.BoxGeometry(5,5,5);
const boxMaterial = [
    new THREE.MeshStandardMaterial({color: 0x0000FF}),
    new THREE.MeshStandardMaterial({color: 0xE3FF00}),
    new THREE.MeshStandardMaterial({color: 0x1FC749}),
    new THREE.MeshStandardMaterial({color: 0xDD1816}),
    new THREE.MeshStandardMaterial({color: 0xDD16D0}),
    new THREE.MeshStandardMaterial({color: 0xFFFCF8})

] 
const box = new THREE.Mesh(boxGeometry,boxMaterial);
scene.add(box);

box.position.set(0,10,0);
box.castShadow = true;

const ambientLight = new THREE.AmbientLight(0x333333);
scene.add(ambientLight);

const directionLight = new THREE.DirectionalLight(0xFFFFFF,0.8);
scene.add(directionLight);
directionLight.position.set(-30,50,0);
directionLight.castShadow = true;
directionLight.shadow.camera.top = 15;

let isRotate = false;
const predPosition = new THREE.Vector2();
const mousePosition = new THREE.Vector2();
window.addEventListener("mousemove",function(e){
  mousePosition.x =   (e.clientX/ window.innerWidth) * 2 -1;
  mousePosition.y = -(e.clientY/ window.innerHeight) * 2 +1;
})

window.addEventListener("mouseup",function(e){
  // console.log("Отпускание");
  isRotate = false;
  
})

window.addEventListener("mousedown",function(e){
  predPosition.x =   (e.clientX/ window.innerWidth) * 2 -1;
  predPosition.y = -(e.clientY/ window.innerHeight) * 2 +1;
  // console.log("Нажатие");
  isRotate = true;
})






window.addEventListener("touchmove",function(e){
  let touches = e.changedTouches;
  mousePosition.x =   (touches[0].clientX/ window.innerWidth) * 2 -1;
  mousePosition.y = -(touches[0].clientY/ window.innerHeight) * 2 +1;
})

window.addEventListener("touchend",function(e){
  // console.log("Отпускание");
  isRotate = false;
  
})

window.addEventListener("touchstart",function(e){
  
  let touches = e.changedTouches;
  predPosition.x =   (touches[0].clientX/ window.innerWidth) * 2 -1;
  predPosition.y = -(touches[0].clientY/ window.innerHeight) * 2 +1;
  // console.log("Нажатие");
  isRotate = true;
})


function animate(){


  if(isRotate ){
    if(Math.abs(Math.abs(predPosition.x) - Math.abs(mousePosition.x)) > 0.1){
        if(predPosition.x < mousePosition.x){

          rotateAroundWorldAxis(box, new THREE.Vector3(0,1,0), rotX);
          
        }
        else if(predPosition.x > mousePosition.x){

          rotateAroundWorldAxis(box, new THREE.Vector3(0,1,0), -rotX);
        
        }
      }  
      if(Math.abs(Math.abs(predPosition.y) - Math.abs(mousePosition.y)) > 0.1){   
          if(predPosition.y < mousePosition.y){

            rotateAroundWorldAxis(box, new THREE.Vector3(1,0,0), -rotY);
            
          }
          else if(predPosition.y > mousePosition.y){

            rotateAroundWorldAxis(box, new THREE.Vector3(1,0,0), rotY);
            
          }
        }
  }
 
  renderer.render(scene,camera);
}


renderer.setAnimationLoop(animate);

window.addEventListener("resize", function(){
  camera.aspect = window.innerWidth/ window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
})
