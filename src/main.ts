// external dependencies
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// local from us provided utilities
import type * as utils from './lib/utils';
import RenderWidget from './lib/rendererWidget';
import { Application, createWindow } from './lib/window';

// helper lib, provides exercise dependent prewritten Code
import * as helper from './helper';

/*******************************************************************************
 * Linear Blend Skinning.
 ******************************************************************************/

import indices from './data/indices.json';
import weights from './data/weights.json';

import jump from './data/jump.json';
import swimming from './data/swimming.json';
import swing_dance from './data/swing_dance.json';

function initAnimation() {
    console.log("Intializing animation.");
   
}

function stepAnimation() {
    console.log("Step animation.");
    if(!settings.restpose){
        updateAnimation();
        linearBlendSkinning();
    }
    currentframe++;

}
function setRestpose(){
    for (let j = 0; j < skeletonRoot.children.length; j++) {
       
        const restposeMatrix = createMatrixFromArray(currentanimation.restpose[j]) as THREE.Matrix4;
        const bonePosition = new THREE.Vector3().setFromMatrixPosition(restposeMatrix);
        skeletonRoot.children[j].position.copy(bonePosition);
    }
    for (let i = 0; i < numVertices; i++) {
        const originalPosition = restPoseVertices[i];
        vertices.setXYZ(i, originalPosition.x, originalPosition.y, originalPosition.z);
    }

    elephant.geometry.setAttribute('position', vertices);

    elephant.geometry.attributes.position.needsUpdate=true;
}

/*******************************************************************************
 * Pendulum.
 ******************************************************************************/
let pendulumState = {
    position: new THREE.Vector3(50,0,0),
    velocity: new THREE.Vector3(), 
};
function initPendulum() {
    console.log("Intializing pendulum.");
    
}

function stepPendulum() {
    console.log("Step pendulum.");
    switch(settings.solverType) {
        case 'Euler':
            pendulumState = updateState(pendulumState, settings.step);
            break;
        case 'Trapezoid':
            pendulumState = updateStateTrapezoid(pendulumState, settings.step);
            break;
        default:
          
    }

}

/*******************************************************************************
 * The main application.
 ******************************************************************************/



/*******************************************************************************
 * Main entrypoint.
 ******************************************************************************/

var settings: helper.Settings;
var scene: THREE.Scene;
let wid: RenderWidget;
let elephant = helper.getElephant();
let skeletonRoot = new THREE.Object3D(); 
let currentanimation = jump;
let currentframe = 0;
let restpose = jump.restpose;
let box = helper.getBox();
let sphere = helper.getSphere();
let line = helper.getLine();
let sphere2 = helper.getSphere();
let line2 = helper.getLine();
const restPoseVertices: THREE.Vector3[] = [];
const vertices = elephant.geometry.getAttribute('position') as THREE.BufferAttribute;
const numVertices = vertices.count;

const GRAVITY = 9.81; 

function main() {
    var root = Application("Animation & Simulation");
    root.setLayout([["renderer"]]);
    root.setLayoutColumns(["100%"]);
    root.setLayoutRows(["100%"]);

    // -------------------------------------------------------------------------
    // create Settings and create GUI settings
    settings = new helper.Settings();
    helper.createGUI(settings);
    settings.addCallback(callback);

    // create RenderDiv
    var rendererDiv = createWindow("renderer");
    root.appendChild(rendererDiv);

    // create renderer
    var renderer = new THREE.WebGLRenderer({ antialias: true });

    // create scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);

    // create camera
    const camera = new THREE.PerspectiveCamera();
    helper.setupCamera(camera);

    // create camera controls
    var controls = new OrbitControls(camera, rendererDiv);
    controls.target.set(0, 50, 0);
    
//-----------------------------------------------------------------
    scene.add(box);
    scene.add(sphere);
    box.position.set(0, 75, 0);
    sphere.position.set(50, 0, 0);
    const points = [];
    points.push(box.position); 
    points.push(sphere.position); 
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    line.geometry = geometry;
    scene.add(line);
    scene.add(sphere);
    sphere2.position.set(50, -50, 0);
    const points2: THREE.Vector3[] = [];
    points.push(sphere.position); 
    points.push(sphere2.position); 
    const geometry2 = new THREE.BufferGeometry().setFromPoints(points2);
    line2.geometry = geometry2;
    scene.add(line2);
    sphere2.visible=settings.double;
    line2.visible=settings.double;


  //-----------------------------------------------------------------

    elephant.visible = settings.mesh;
    skeletonRoot.visible = settings.skeleton;
    scene.add(elephant);
    scene.add(skeletonRoot);
    restpose = jump.restpose;
    currentanimation = jump;


    for (let i = 0; i < numVertices; i++) {
        const x = vertices.getX(i);
        const y = vertices.getY(i);
        const z = vertices.getZ(i);
        restPoseVertices.push(new THREE.Vector3(x, y, z));
    }
    if (restpose && typeof restpose === 'object') {
     
        for (const boneName in restpose) {
            if (restpose.hasOwnProperty(boneName)) {
                let bone = restpose[boneName];
                let boneMatrix = createMatrixFromArray(bone);
     
                if (boneMatrix instanceof THREE.Matrix4) {
                    const bonePosition = new THREE.Vector3().setFromMatrixPosition(boneMatrix); 

       
                    const geometry = new THREE.SphereGeometry(1, 8, 8);
                    const material = new THREE.MeshBasicMaterial({ color: 0x000000 });
                    const boneSphere = new THREE.Mesh(geometry, material);

                 
                    boneSphere.position.copy(bonePosition);
                 
                    skeletonRoot.add(boneSphere);
     
                } 
            }
        }
    } 
    // -------------------------------------------------------------------------
    // create render widget
    wid = new RenderWidget(rendererDiv, renderer, camera, scene, controls);
    function reset(){
        setRestpose();
        pendulumState.position.set(50, 0, 0); 
        pendulumState.velocity.set(0, 0, 0); 
        box.position.set(0, 75, 0);
        sphere.position.set(50, 0, 0);
        const points = [];
        points.push(box.position); 
        points.push(sphere.position); 
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        line.geometry = geometry;
    }
    settings.reset=()=> reset();

    // initializes the default exercise
    callback({ key: "exercise", value: settings.exercise });
    wid.animate();
    function callback(changed: utils.KeyValuePair<helper.Settings>) {
        if (changed.key == 'exercise') {
            switch (changed.value) {
                case helper.Exercise.LBS:
                    wid.preRenderHook = stepAnimation;
                    initAnimation();
                    break;
                case helper.Exercise.pendulum:
                    wid.preRenderHook = stepPendulum;
                    
                    initPendulum();
                    break;
            }
         
            
        } 
        if(changed.key=='restpose'){
            if(changed.value==true){
                setRestpose();
                console.log("ada")
            }
        }
        if(settings.animation == 'Jump'){
            currentanimation = jump;
            currentframe=0;
        }
        if(settings.animation == 'Swimming'){
            currentanimation = swimming;
            currentframe=0;
        }
        if(settings.animation == 'Swing Dance'){
            currentanimation = swing_dance;
            currentframe=0;
        }
        elephant.visible = settings.mesh && settings.exercise == helper.Exercise.LBS;
    skeletonRoot.visible = settings.skeleton && settings.exercise == helper.Exercise.LBS;
    box.visible = settings.exercise == helper.Exercise.pendulum;
    sphere.visible = settings.exercise == helper.Exercise.pendulum;
    line.visible = settings.exercise == helper.Exercise.pendulum;
    sphere2.visible=settings.double;
    line2.visible=settings.double;
    }
}
function createMatrixFromArray(elements: number[]): THREE.Matrix4 | null {
    if (!elements || elements.length !== 16) {
        console.error('Invalid array of elements for matrix:', elements);
        return null;
    }

    const matrix = new THREE.Matrix4();
    matrix.set(
        elements[0], elements[4], elements[8], elements[12],
        elements[1], elements[5], elements[9], elements[13],
        elements[2], elements[6], elements[10], elements[14],
        elements[3], elements[7], elements[11], elements[15]
    );

    return matrix;
}
function computeGradient(position: THREE.Vector3): THREE.Vector3 {
    const gravityForce = new THREE.Vector3(0, -GRAVITY, 0);

    // Calculate the vector from the box to the object (springVector)
    const springVector = position.clone().sub(box.position);

    // Calculate the displacement from the rest length
    const displacement = springVector.length() - settings.radius; // Adjust for the radius

    // Calculate the spring force using Hooke's Law
    const springForceMagnitude = -settings.stiffness * displacement;
    const springForce = springVector.clone().normalize().multiplyScalar(springForceMagnitude);

    // Calculate the total force including gravity
    const totalForce = gravityForce.clone().add(springForce).multiplyScalar(settings.mass);

    // Calculate acceleration using Newton's second law (F = ma)
    const acceleration = totalForce.clone().divideScalar(settings.mass);

    return acceleration;
}


function updateState(currentState: { position: THREE.Vector3; velocity: THREE.Vector3; }, stepSize: number): { position: THREE.Vector3; velocity: THREE.Vector3; } {
   
    const gradient = computeGradient(currentState.position);

   
    currentState.position.add(currentState.velocity.clone().multiplyScalar(stepSize));
    currentState.velocity.add(gradient.clone().multiplyScalar(stepSize));

  
    updateVisualization(currentState.position);

    return currentState;
}
function updateStateTrapezoid(currentState: { position: THREE.Vector3; velocity: THREE.Vector3; }, stepSize: number): { position: THREE.Vector3; velocity: THREE.Vector3; } {
    const gradientInitial = computeGradient(currentState.position);

   
    const positionIntermediate = currentState.position.clone().add(currentState.velocity.clone().multiplyScalar(stepSize));
    const gradientIntermediate = computeGradient(positionIntermediate);
    
   
    const averageGradient = gradientInitial.clone().add(gradientIntermediate).multiplyScalar(0.5);
    currentState.velocity.add(averageGradient.clone().multiplyScalar(stepSize));
    currentState.position.add(currentState.velocity.clone().multiplyScalar(stepSize));
  
    updateVisualization(currentState.position);

    return currentState;
}

function updateVisualization(position: THREE.Vector3) {

    sphere.position.copy(position);

   
    const points = [];
    points.push(box.position); 
    points.push(position.clone()); 
    line.geometry.setFromPoints(points);
    line.geometry.attributes.position.needsUpdate = true;
}


function updateAnimation() {
   if(currentframe>currentanimation.frames.length-1){
    currentframe=0;
   }

        for (let j = 0; j < skeletonRoot.children.length; j++) {
            const matrix = createMatrixFromArray(currentanimation.frames[currentframe][j]) as THREE.Matrix4;
 
          
            const bonePosition = new THREE.Vector3().setFromMatrixPosition(matrix);
        

            skeletonRoot.children[j].position.copy(bonePosition);

        }
       

    
}
function linearBlendSkinning() {
  
    const emptyVerticesArray = new Float32Array(numVertices * 3); 

    // Create an empty BufferAttribute for vertices
    const emptyVerticesAttribute = new THREE.BufferAttribute(emptyVerticesArray, 3); 
    
    for (let i = 0; i < numVertices; i++) {
        let finalPosition = new THREE.Vector3();

        for (let j = 0; j < indices[i].length; j++) {
            let boneIndex = indices[i][j];
            let boneWeight = weights[i][j];

            
            let restPoseMatrix = createMatrixFromArray(restpose[boneIndex]) as THREE.Matrix4;

        
           
            let vertexPosition = restPoseVertices[i];

  
            let temp =vertexPosition.clone().applyMatrix4(restPoseMatrix.clone().invert());
            let matrix = createMatrixFromArray(currentanimation.frames[currentframe][boneIndex]) as THREE.Matrix4;
            temp.applyMatrix4(matrix.clone());

            finalPosition.addScaledVector(temp.clone(), boneWeight);
        }

        emptyVerticesAttribute.setXYZ(i, finalPosition.x, finalPosition.y, finalPosition.z);
    }
    elephant.geometry.setAttribute('position', emptyVerticesAttribute);

    elephant.geometry.attributes.position.needsUpdate=true;
}

// call main entrypoint
main();
