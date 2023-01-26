import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import * as C from "cannon-es";

let rotX = 0.05;
let rotY = 0.05;

const meshes = [];
const bodies = [];

const renderer = new THREE.WebGLRenderer({ antialias: true });
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
);
// const orbit = new OrbitControls(camera,renderer.domElement);

let rotateAroundWorldAxis = function (object, axis, radians) {
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

camera.position.set(0, 10, 20);
// orbit.update();

const planeGeometry = new THREE.PlaneGeometry(20, 20);
const planeMaterial = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  side: THREE.DoubleSide,
});
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
scene.add(plane);
plane.rotation.x = -0.5 * Math.PI;
plane.receiveShadow = true;

const plGeom = new THREE.PlaneGeometry(100, 60);
const plMat = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  side: THREE.DoubleSide,
  transparent: true,
  opacity: 0,
});
const planeHelp = new THREE.Mesh(plGeom, plMat);
scene.add(planeHelp);
planeHelp.position.set(0, 10, 0);
plane.receiveShadow = true;
planeHelp.userData.help = true;

const boxGeometry = new THREE.BoxGeometry(5, 5, 5);
const boxMaterial = [
  new THREE.MeshStandardMaterial({ color: 0x0000ff }),
  new THREE.MeshStandardMaterial({ color: 0xe3ff00 }),
  new THREE.MeshStandardMaterial({ color: 0x1fc749 }),
  new THREE.MeshStandardMaterial({ color: 0xdd1816 }),
  new THREE.MeshStandardMaterial({ color: 0xdd16d0 }),
  new THREE.MeshStandardMaterial({ color: 0xfffcf8 }),
];
const box = new THREE.Mesh(boxGeometry, boxMaterial);
scene.add(box);

box.position.set(0, 10, 0);
box.castShadow = true;

const ambientLight = new THREE.AmbientLight(0x333333);
scene.add(ambientLight);

const directionLight = new THREE.DirectionalLight(0xffffff, 0.8);
scene.add(directionLight);
directionLight.position.set(-30, 50, 0);
directionLight.castShadow = true;
directionLight.shadow.camera.top = 20;
directionLight.shadow.camera.left = -20;
directionLight.shadow.camera.right = 20;
directionLight.shadow.camera.bottom = -20;

let isRotate = false;
const predPosition = new THREE.Vector2();
const mousePosition = new THREE.Vector2();
window.addEventListener("mousemove", function (e) {
  mousePosition.x = (e.clientX / window.innerWidth) * 2 - 1;
  mousePosition.y = -(e.clientY / window.innerHeight) * 2 + 1;
});

window.addEventListener("mouseup", function (e) {
  // console.log("Отпускание");
  isRotate = false;
});

window.addEventListener("mousedown", function (e) {
  predPosition.x = (e.clientX / window.innerWidth) * 2 - 1;
  predPosition.y = -(e.clientY / window.innerHeight) * 2 + 1;
  // console.log("Нажатие");
  isRotate = true;
});

window.addEventListener("keydown", function (e) {
  switch (e.key) {
    case "ArrowLeft": // если нажата клавиша влево
      boxBody.position.x -= 0.1;

      break;
    case "ArrowUp": // если нажата клавиша вверх
      boxBody.position.z -= 0.1;
      break;
    case "ArrowRight": // если нажата клавиша вправо
      boxBody.position.x += 0.1;
      break;
    case "ArrowDown": // если нажата клавиша вниз
      boxBody.position.z += 0.1;
      break;
  }
});

window.addEventListener("touchmove", function (e) {
  let touches = e.changedTouches;
  mousePosition.x = (touches[0].clientX / window.innerWidth) * 2 - 1;
  mousePosition.y = -(touches[0].clientY / window.innerHeight) * 2 + 1;
});

window.addEventListener("touchend", function (e) {
  // console.log("Отпускание");
  isRotate = false;
});

window.addEventListener("touchstart", function (e) {
  let touches = e.changedTouches;
  predPosition.x = (touches[0].clientX / window.innerWidth) * 2 - 1;
  predPosition.y = -(touches[0].clientY / window.innerHeight) * 2 + 1;
  // console.log("Нажатие");
  isRotate = true;
});

const world = new C.World({
  gravity: new C.Vec3(0, -9.81, 0),
});

const groundBody = new C.Body({
  shape: new C.Box(new C.Vec3(10, 10, 0.1)),
  type: C.Body.STATIC,
  // mass: 10
});

const boxBody = new C.Body({
  mass: 10,
  shape: new C.Box(new C.Vec3(2.5, 2.5, 2.5)),
  position: new C.Vec3(0, 20, 0),
});

world.addBody(boxBody);

world.addBody(groundBody);
groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
const raycaster = new THREE.Raycaster();
const drag = () => {
  raycaster.setFromCamera(mousePosition, camera);
  const found = raycaster.intersectObjects(scene.children);
  if (found.length > 0 && isRotate) {
    for (let o of found) {
      if (o.object.userData.help) {
        boxBody.position.x = o.point.x;
        boxBody.position.y = o.point.y;
      }
    }
  }
};

const timeStep = 1 / 60;
let steps = 0;

meshes.push(box);
bodies.push(boxBody);
function animate(time) {
  world.step(timeStep);
  steps += 0.1;
  // groundBody.position.y = 10*Math.abs(Math.sin(steps))
  plane.position.copy(groundBody.position);
  plane.quaternion.copy(groundBody.quaternion);

  // console.log(boxBody.position.z, box.position.z)
  box.position.copy(boxBody.position);
  box.quaternion.copy(boxBody.quaternion);

  for (let i = 0; i < meshes.length; i++) {
    meshes[i].position.copy(bodies[i].position);
    meshes[i].quaternion.copy(bodies[i].quaternion);
  }

  for (let i = 0; i < meshes.length; i++) {
    if ( bodies[i].position.y <= -15 ||  bodies[i].position.z >= 5) {
      
        const box2 = new THREE.Mesh(boxGeometry, boxMaterial);
        scene.add(box2);

        box2.castShadow = true;
        const boxBody2 = new C.Body({
          mass: 10,
          shape: new C.Box(new C.Vec3(2.5, 2.5, 2.5)),
          position: new C.Vec3(0, 25, 0),
        });

        world.addBody(boxBody2);
        meshes.push(box2);
        bodies.push(boxBody2);
      
      bodies[i].position = new C.Vec3(0, 15, 0);
      bodies[i].velocity = new C.Vec3(0, 0, -1);

      // box.position.copy(boxBody.position);
    }
  }
  drag();
  // if(isRotate ){
  //   if(Math.abs(Math.abs(predPosition.x) - Math.abs(mousePosition.x)) > 0.1){
  //       if(predPosition.x < mousePosition.x){

  //         rotateAroundWorldAxis(box, new THREE.Vector3(0,1,0), rotX);
  //         boxBody.quaternion.copy(box.quaternion);

  //       }
  //       else if(predPosition.x > mousePosition.x){

  //         rotateAroundWorldAxis(box, new THREE.Vector3(0,1,0), -rotX);
  //         boxBody.quaternion.copy(box.quaternion);

  //       }
  //     }
  //     if(Math.abs(Math.abs(predPosition.y) - Math.abs(mousePosition.y)) > 0.1){
  //         if(predPosition.y < mousePosition.y){

  //           rotateAroundWorldAxis(box, new THREE.Vector3(1,0,0), -rotY);
  //           boxBody.quaternion.copy(box.quaternion);
  //         }
  //         else if(predPosition.y > mousePosition.y){

  //           rotateAroundWorldAxis(box, new THREE.Vector3(1,0,0), rotY);
  //           boxBody.quaternion.copy(box.quaternion);
  //         }
  //       }
  //}

  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

window.addEventListener("resize", function () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
