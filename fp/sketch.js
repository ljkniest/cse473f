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

// video configurations
// const width = 1280;
// const height = 720;
// const width = 640;
// const height = 480;

let video;
let constraints = {
  video: {
    mandatory: {
      minWidth: 640,
      minHeight: 480
    },
    optional: [{ maxFrameRate: 10 }]
  },
  audio: false
};

// game state
let scoreHtmlMsg;
const scoreStub = "Current score: ";
let score;

// pose net variables
let poseNet;
let currentPoses;
let poseNetModelReady;
const poseNetOptions = {
  architecture: 'MobileNetV1',
  imageScaleFactor: 0.3,
  outputStride: 16,
  flipHorizontal: true,
  minConfidence: 0.5,
  maxPoseDetections: 5,
  scoreThreshold: 0.5,
  nmsRadius: 20,
  // detectionType: 'multiple',
  detectionType: 'single',
  inputResolution: 513,
  multiplier: 0.75,
  quantBytes: 2,
};

function setup() {
  poseNetModelReady = false;
  // PoseNet and camera init
  video = createCapture(constraints);
  video.hide();
  poseNet = ml5.poseNet(video, poseNetOptions, onPoseNetModelReady);
  poseNet.on('pose', onPoseDetected);
  createCanvas(640, 480);
  scoreHtmlMsg = createP("test");
  score = 0;
  // console.log("handsup: " + JSON.stringify(generatePoseAngles(handsup)));
  // console.log("handsdown: " + JSON.stringify(generatePoseAngles(handsdown)));
}


//handsup: {"leftElbowAngle":-72.63918909170312,"rightElbowAngle":-112.21609317291504,"leftHipAngle":90.34881337944101,"rightHipAngle":90.97220672165206} sketch.js:528:11
//handsdown: {"leftElbowAngle":61.76252831580433,"rightElbowAngle":123.50516622898327,"leftHipAngle":93.23373830456356,"rightHipAngle":89.06335303251583} sketch.js:529:11

/**
 * Callback function called by ml5.js PoseNet when the PoseNet model is ready
 * Will be called once and only once
 */
function onPoseNetModelReady() {
  print("The PoseNet model is ready...");
  poseNetModelReady = true;
  scoreHtmlMsg.html("new pose");
}

/**
 * Callback function called by ml5.js PosetNet when a pose has been detected
 */
function onPoseDetected(poses) {
  currentPoses = poses;
  score += 1;
  scoreHtmlMsg.html(scoreStub + score);
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

  // Iterate through all poses and print them out
  if(currentPoses){
    // scoreHtmlMsg.html((JSON.stringify(generatePoseAngles(currentPoses[0].pose))));
    for (let i = 0; i < currentPoses.length; i++) {
      drawPose(currentPoses[i], i);
    }
  }
}

function drawPose(pose, poseIndex){
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
  
  // Draw keypoints with text
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
  for (let j = 0; j < keypoints.length; j += 1) {
    // A keypoint is an object describing a body part (like rightArm or leftShoulder)
    const kp = keypoints[j];

    // check for maximum extents
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

    fill(kpFillColor); 
    noStroke();
    circle(kp.position.x, kp.position.y, kpSize);

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

    yText += textSize();
    text(nf(kp.score, 1, 2), xText, yText);
    //console.log(keypoint);
    // Only draw an ellipse is the pose probability is bigger than 0.2
    //if (keypoint.score > 0.2) {

    noFill();
    stroke(kpOutlineColor);
    circle(kp.position.x, kp.position.y, kpSize);
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
  const strPoseNum = "Pose: " + (poseIndex + 1);
  text(strPoseNum, xPoseLeftMost, yPoseTop - textSize() - 1);
  const strWidth = textWidth(strPoseNum);
  textStyle(NORMAL);
  text("Confidence: " + nf(pose.pose.score, 0, 1), xPoseLeftMost, yPoseTop);

  noFill();
  stroke(kpFillColor);
  rect(xPoseLeftMost, yPoseTop, boundingBoxWidth + boundingBoxXMargin, 
    boundingBoxHeight + boundingBoxYMargin);
}


// A function to draw ellipses over the detected keypoints
function drawKeypoints() {
  // Loop through all the poses detected
  for (let i = 0; i < poses.length; i += 1) {
    // For each pose detected, loop through all the keypoints
    const pose = poses[i].pose;
    for (let j = 0; j < pose.keypoints.length; j += 1) {
      // A keypoint is an object describing a body part (like rightArm or leftShoulder)
      const keypoint = pose.keypoints[j];
      // Only draw an ellipse is the pose probability is bigger than 0.2
      if (keypoint.score > 0.2) {
        fill(255, 0, 0, 150);
        noStroke();
        ellipse(keypoint.position.x, keypoint.position.y, 10, 10);
      }
    }
  }
}

// A function to draw the skeletons
function drawSkeleton() {
  // Loop through all the skeletons detected
  for (let i = 0; i < poses.length; i += 1) {
    const skeleton = poses[i].skeleton;
    // For every skeleton, loop through all body connections
    for (let j = 0; j < skeleton.length; j += 1) {
      const partA = skeleton[j][0];
      const partB = skeleton[j][1];
      stroke(255, 0, 0, 50);
      line(partA.position.x, partA.position.y, partB.position.x, partB.position.y);
    }
  }
}

function generatePoseAngles(keypoints) {
  // Find keypoints for elbows, hips, and shoulders
  const leftElbow = keypoints["leftElbow"];
  const rightElbow = keypoints["rightElbow"];
  const leftKnee = keypoints["leftKnee"];
  const rightKnee = keypoints["rightKnee"];
  const leftShoulder = keypoints["leftShoulder"];
  const rightShoulder = keypoints["rightShoulder"];
  const leftWrist = keypoints["leftWrist"];
  const rightWrist = keypoints["rightWrist"];

  // Check if all required keypoints are present
  if (leftElbow && rightElbow && leftKnee && rightKnee && leftShoulder && rightShoulder && leftWrist && rightWrist) {
    // Calculate angles for elbows
    const leftElbowAngle = Math.atan2(leftWrist.y - leftShoulder.y, leftWrist.x - leftShoulder.x);
    const rightElbowAngle = Math.atan2(rightWrist.y - rightShoulder.y, rightWrist.x - rightShoulder.x);

    // Calculate angles for hips
    const leftHipAngle = Math.atan2(leftKnee.y - leftShoulder.y, leftKnee.x - leftShoulder.x);
    const rightHipAngle = Math.atan2(rightKnee.y - rightShoulder.y, rightKnee.x - rightShoulder.x);

    // Convert angles to degrees
    const degrees = angle => angle * (180 / Math.PI);

    return {
      leftElbowAngle: degrees(leftElbowAngle),
      rightElbowAngle: degrees(rightElbowAngle),
      leftHipAngle: degrees(leftHipAngle),
      rightHipAngle: degrees(rightHipAngle)
    };
  } else {
    // Handle the case where any of the required keypoints are missing
    return null;
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
  // if (!serial.isOpen()) {
  //   serial.connectAndOpen(null, serialOptions);
  // }
}

