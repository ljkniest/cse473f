// Lianne Kniest Final Project Draft - Spring 2024

// Inspired and using code from:
// https://makeabilitylab.github.io/physcomp/communication/p5js-serial
// https://makeabilitylab.github.io/physcomp/communication/ml5js-serial.html#building-our-first-ml5js--arduino-app-nosetracker
// By Jon E. Froehlich
// @jonfroehlich
// http://makeabilitylab.io/
// 

// This code was also iterated on, inspired by, and partially sourced using
// ChatGPT 3.5 https://chatgpt.com


let video;
let constraints = {
  video: {
    mandatory: {
      minWidth: 640,
      minHeight: 480
    },
    optional: [{ maxFrameRate: 5 }]
  },
  audio: false
};

let serialOptions = { baudRate: 115200  };
let serial;

// game state
let scoreHtmlMsg;
const scoreStub = "Current score: ";
let score;
let poseLastUp;

// pose net variables
let poseNet;
let currentPoses;
let poseNetModelReady;
const poseNetOptions = {
  architecture: 'MobileNetV1',
  imageScaleFactor: 0.3,
  outputStride: 16,
  flipHorizontal: false,
  minConfidence: 0.5,
  maxPoseDetections: 5,
  scoreThreshold: 0.8,
  nmsRadius: 20,
  // detectionType: 'multiple',
  // chose single to avoid having to sort through multiple states
  detectionType: 'single',
  inputResolution: 513,
  multiplier: 0.75,
  quantBytes: 2,
};

function setup() {
  poseNetModelReady = false;

    // Setup Web Serial using serial.js
    serial = new Serial();
    serial.on(SerialEvents.CONNECTION_OPENED, onSerialConnectionOpened);
    serial.on(SerialEvents.CONNECTION_CLOSED, onSerialConnectionClosed);
    serial.on(SerialEvents.DATA_RECEIVED, onSerialDataReceived);
    serial.on(SerialEvents.ERROR_OCCURRED, onSerialErrorOccurred);
  
    // If we have previously approved ports, attempt to connect with them
    serial.autoConnectAndOpenPreviouslyApprovedPort(serialOptions);
  
    // Add in a lil <p> element to provide messages. This is optional
    pHtmlMsg = createP("Click anywhere on this page to open the serial connection dialog");
    pHtmlMsg.style('color', 'white');

  // PoseNet and camera init
  video = createCapture(constraints);
  video.hide();
  poseNet = ml5.poseNet(video, poseNetOptions, onPoseNetModelReady);
  poseNet.on('pose', onPoseDetected);
  createCanvas(640, 480);
  scoreHtmlMsg = createP("test");
  // game state
  score = 0;
  lastPoseUp = false;
}

/**
 * Callback function called by ml5.js PoseNet when the PoseNet model is ready
 * Will be called once and only once
 */
function onPoseNetModelReady() {
  console.log("The PoseNet model is ready...");
  poseNetModelReady = true;
  scoreHtmlMsg.html("Model is ready");
}

/**
 * Callback function called by ml5.js PosetNet when a pose has been detected
 */
function onPoseDetected(poses) {
  currentPoses = poses;
  // score += 1;
  scoreHtmlMsg.html(scoreStub + score);
  // scoreHtmlMsg.html(lastPoseUp);
}

function draw() {
  image(video, 0, 0, width, height);

  if(!poseNetModelReady){
    background(100);
    push();
    textSize(32);
    textAlign(CENTER);
    fill(255);
    noStroke();
    text("Waiting for PoseNet model to load...", width/2, height/2);
    pop();
  }
  
  // drawKeypoints();
  // drawSkeleton();
  // drawBoundingBox();

  // Iterate through all poses and print them out; check jumping jack status
  if(currentPoses) {
    for (let i = 0; i < currentPoses.length; i++) {
      pose = currentPoses[i]
      drawPose(pose, i);
      // check jumping jack status
      // console.log(lastPoseUp);
      if (lastPoseUp) {
        if (isPoseDown(pose.pose)) {
          console.log("up to down");
          lastPoseUp = false;
          score++;

          // If serial is open, transmit score
          if(serial.isOpen()){
            serial.writeLine(1); 
            console.log("sent serial1")
          }
          
        } 
      } else if (!lastPoseUp) {
        if(isPoseUp(pose.pose)) {
          console.log("down to up");
          lastPoseUp = true;
        }
      }
    }
  }

}

function drawPose(pose, poseIndex){
  // console.log(JSON.stringify(pose));
  // Draw skeleton
  const skeletonColor = color(255, 255, 255, 128);
  stroke(skeletonColor); 
  strokeWeight(2);
  const skeleton = pose.skeleton;
  for (let j = 0; j < skeleton.length; j += 1) {
    const partA = skeleton[j][0];
    const partB = skeleton[j][1];
    line(partA.position.x, partA.position.y, partB.position.x, partB.position.y);
  }
  
  // Color configurations
  const kpFillColor = color(255, 255, 255, 200);
  const textColor = color(255, 255, 255, 230);
  const kpOutlineColor = color(0, 0, 0, 150);
  strokeWeight(1);

  const keypoints = pose.pose.keypoints;
  const kpSize = 10;
  const kpTextMargin = 2;
  let xPoseLeftMost = width;
  let xPoseRightMost = -1;
  let yPoseTop = height;
  let yPoseBottom = -1;
  // iterate through all keypoints in pose and draw
  for (let j = 0; j < keypoints.length; j += 1) {
    const kp = keypoints[j];

    // check for maximum extents to draw bounding bnox
    if(xPoseLeftMost > kp.position.x){
      xPoseLeftMost = kp.position.x;
    }else if(xPoseRightMost < kp.position.x){
      xPoseRightMost = kp.position.x;
    }

    if(yPoseBottom < kp.position.y){
      yPoseBottom = kp.position.y;
    }else if(yPoseTop > kp.position.y){
      yPoseTop = kp.position.y;
    }

    // draw keypoint
    fill(kpFillColor); 
    noStroke();
    circle(kp.position.x, kp.position.y, kpSize);

    // draw keypoint outline
    noFill();
    stroke(kpOutlineColor);
    circle(kp.position.x, kp.position.y, kpSize);

    // KEYPOINT DEBUG LABELS

    fill(textColor);
    textAlign(LEFT);
    let xText = kp.position.x + kpSize + kpTextMargin;
    let yText = kp.position.y;
    if(kp.part.startsWith("right")){
      textAlign(RIGHT);
      xText = kp.position.x - (kpSize + kpTextMargin);
    }
    textStyle(BOLD);
    text(kp.part, xText, yText);
    textStyle(NORMAL);
    yText += textSize();
    text(int(kp.position.x) + ", " + int(kp.position.y), xText, yText);


    // fill(textColor);
    // textAlign(LEFT);
    // let xText = kp.position.x + kpSize + kpTextMargin;
    // let yText = kp.position.y;
    // if(kp.part.startsWith("right")){
    //   textAlign(RIGHT);
    //   xText = kp.position.x - (kpSize + kpTextMargin);
    // }
    // textStyle(BOLD);
    // text(kp.part, xText, yText);
    // textStyle(NORMAL);  
  }

  const boundingBoxExpandFraction = 0.1;
  let boundingBoxWidth = xPoseRightMost - xPoseLeftMost;
  let boundingBoxHeight = yPoseBottom - yPoseTop;
  let boundingBoxXMargin = boundingBoxWidth * boundingBoxExpandFraction;
  let boundingBoxYMargin = boundingBoxHeight * boundingBoxExpandFraction;
  xPoseRightMost += boundingBoxXMargin / 2;
  xPoseLeftMost -= boundingBoxXMargin / 2;
  yPoseTop -= boundingBoxYMargin / 2;
  yPoseBottom += boundingBoxYMargin / 2;
  
  noStroke();
  fill(textColor);
  textStyle(BOLD);
  textAlign(LEFT, BOTTOM);
  // const strPoseNum = "Pose: " + (poseIndex + 1);
  // text(strPoseNum, xPoseLeftMost, yPoseTop - textSize() - 1);
  // const strWidth = textWidth(strPoseNum);
  textStyle(NORMAL);
  text("Confidence: " + nf(pose.pose.score, 0, 1), xPoseLeftMost, yPoseTop);

  noFill();
  stroke(kpFillColor);
  rect(xPoseLeftMost, yPoseTop, boundingBoxWidth + boundingBoxXMargin, 
    boundingBoxHeight + boundingBoxYMargin);
}

// functions to detect jumping jacks
const hipsShouldersAndHands = ["leftHip", "rightHip", "leftShouler", "rightShoulder", "leftWrist", "rightWrist"];
function isPoseUp(pose) {
  // console.log("check and see if up");
  // console.log(JSON.stringify(pose));
  // check to see that we have hip and hands
  // if (!hasKeypoints(pose, hipsShouldersAndHands)) {
    if (false) {
    // console.log("don't have keypoints");
    return false;
  } else {
    // console.log("have keypoints to check if up");
    // get keypoints we need and store
    let keypoints = pose.keypoints;
    let lHip = keypoints.find(k => k.part === "leftHip");
    let rHip = keypoints.find(k => k.part === "rightHip");
    let lShoulder = keypoints.find(k => k.part === "leftShoulder");
    let rShoulder = keypoints.find(k => k.part === "rightShoulder");
    let lHand = keypoints.find(k => k.part === "leftWrist");
    let rHand = keypoints.find(k => k.part === "rightWrist");

    // calculate hip to shoulder distance, make sure hands are "half a torso" above shoulders
    let lTorsoDelta = abs(lShoulder.position.y - lHip.position.y) / 2;
    let rTorsoDelta = abs(rShoulder.position.y - rHip.position.y) / 2;
    let lHandDelta = (lHand.position.y - lShoulder.position.y);
    let rHandDelta = (rHand.position.y-rShoulder.position.y);

    // console.log("lhand y: " + lHand.position.y + " lshoulder y: " + lShoulder.position.y);
    console.log("lhand delta: " + lHandDelta + " ltorso delta : " + lTorsoDelta);
    if ((lHandDelta > lTorsoDelta && lHandDelta > 0) || (rHandDelta > rTorsoDelta && rHandDelta > 0)) {
      return true;
    } else {
      return false;
    }
  }
}

function isPoseDown(pose) {
  // check to see that we have hip and hands
  // if (!hasKeypoints(pose, hipsShouldersAndHands)) {
  if (false) {
    return false;
  } else {
    // get keypoints we need and store
    let keypoints = pose.keypoints;
    let lHip = keypoints.find(k => k.part === "leftHip");
    let rHip = keypoints.find(k => k.part === "rightHip");
    let lShoulder = keypoints.find(k => k.part === "leftShoulder");
    let rShoulder = keypoints.find(k => k.part === "rightShoulder");
    let lHand = keypoints.find(k => k.part === "leftWrist");
    let rHand = keypoints.find(k => k.part === "rightWrist");

    // calculate hip to shoulder distance, make sure hands are "half a torso" below shoulders
    // let lTorsoDelta = abs(lShoulder.position.y - lHip.position.y) / 2;
    // let rTorsoDelta = abs(rShoulder.position.y - rHip.position.y) / 2;
    let lHandDelta = (lHand.position.y - lShoulder.position.y);
    let rHandDelta = (rHand.position.y-rShoulder.position.y);

    // console.log("lhand delta: " + lHandDelta + " rhand delta : " + rHandDelta);
    if (lHandDelta < 0 || rHandDelta < 0 ) {
      return true;
    } else {
      return false;
    }
  }
}


// see if the pose containts the parts in array keypointsToCheck
function hasKeypoints(pose, keypointsToCheck) {
  if (!pose || !pose.keypoints) {
    return false;
  }
  return keypointsToCheck.every(keypoint => 
      pose.keypoints.some(k => k.part === keypoint)
  );
}



// From ml5 example at https://github.com/ml5js/ml5-library/blob/main/examples/p5js/PoseNet/PoseNet_webcam/sketch.js
// A function to draw ellipses over the detected keypoints
function drawKeypoints() {
  // Loop through all the poses detected
  for (let i = 0; i < currentPoses.length; i += 1) {
    // For each pose detected, loop through all the keypoints
    const pose = currentPoses[i].pose;
    for (let j = 0; j < pose.keypoints.length; j += 1) {
      // A keypoint is an object describing a body part (like rightArm or leftShoulder)
      const keypoint = pose.keypoints[j];
      // Only draw an ellipse is the pose probability is bigger than 0.2
      if (keypoint.score > 0.2) {
        fill(255, 0, 0);
        noStroke();
        ellipse(keypoint.position.x, keypoint.position.y, 10, 10);
      }
    }
  }
}

// A function to draw the skeletons
function drawSkeleton() {
  // Loop through all the skeletons detected
  for (let i = 0; i < currentPoses.length; i += 1) {
    const skeleton = currentPoses[i].skeleton;
    // For every skeleton, loop through all body connections
    for (let j = 0; j < skeleton.length; j += 1) {
      const partA = skeleton[j][0];
      const partB = skeleton[j][1];
      stroke(255, 0, 0);
      line(partA.position.x, partA.position.y, partB.position.x, partB.position.y);
    }
  }
}

// ----- Web serial library code -----
/**
 * Callback function by serial.js when there is an error on web serial
 * 
 * @param {} eventSender 
 */
 function onSerialErrorOccurred(eventSender, error) {
  console.log("onSerialErrorOccurred", error);
  pHtmlMsg.html(error);
}

/**
 * Callback function by serial.js when web serial connection is opened
 * 
 * @param {} eventSender 
 */
function onSerialConnectionOpened(eventSender) {
  console.log("onSerialConnectionOpened");
  pHtmlMsg.html("Serial connection opened successfully");
}

/**
 * Callback function by serial.js when web serial connection is closed
 * 
 * @param {} eventSender 
 */
function onSerialConnectionClosed(eventSender) {
  console.log("onSerialConnectionClosed");
  pHtmlMsg.html("onSerialConnectionClosed");
}

/**
 * Callback function serial.js when new web serial data is received
 * 
 * @param {*} eventSender 
 * @param {String} newData new data received over serial
 */
function onSerialDataReceived(eventSender, newData) {
  console.log("onSerialDataReceived", newData);
  pHtmlMsg.html("onSerialDataReceived: " + newData);
}

/**
 * Called automatically by the browser through p5.js when mouse clicked
 */
function mouseClicked() {
  if (!serial.isOpen()) {
    serial.connectAndOpen(null, serialOptions);
  }
}

