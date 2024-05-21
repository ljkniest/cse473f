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

let pHtmlMsg;
let serialOptions = { baudRate: 115200  };
let serial;

// pose net variables
let video
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
  scoreThreshold: 0.5,
  nmsRadius: 20,
  detectionType: 'single',
  inputResolution: 513,
  multiplier: 0.75,
  quantBytes: 2,
};

function setup() {
  poseNetModelReady = false;

  // Setup Web Serial using serial.js
  // serial = new Serial();
  // serial.on(SerialEvents.CONNECTION_OPENED, onSerialConnectionOpened);
  // serial.on(SerialEvents.CONNECTION_CLOSED, onSerialConnectionClosed);
  // serial.on(SerialEvents.DATA_RECEIVED, onSerialDataReceived);
  // serial.on(SerialEvents.ERROR_OCCURRED, onSerialErrorOccurred);
  
  // If we have previously approved ports, attempt to connect with them
  // serial.autoConnectAndOpenPreviouslyApprovedPort(serialOptions);
  
  // Add in a lil <p> element to provide messages. This is optional
  // pHtmlMsg = createP("Click anywhere on this page to open the serial connection dialog");

  // PoseNet and camera init
  video = createCapture(VIDEO);
  video.hide();
  poseNet = ml5.poseNet(video, poseNetOptions, onPoseNetModelReady);
  poseNet.on('pose', onPoseDetected);
  createCanvas(640, 480);
}

function draw() {
  background(100);
  if(!poseNetModelReady){
    textSize(32);
    textAlign(CENTER);
    fill(255);
    noStroke();
    text("Waiting for PoseNet model to load...", width/2, height/2);
  }
   
  image(video, 0, 0); // draw the video to the screen at 0,0
  // if(currentPoses){
  //   for(let human of currentPoses){
  //     fill("red"); // red nose
  //     noStroke();
  //     circle(human.pose.nose.x, human.pose.nose.y, 40);
  //   }
  // }
    // Iterate through all poses and print them out
  if(currentPoses){
    for (let i = 0; i < currentPoses.length; i++) {
      drawPose(currentPoses[i], i);
    }
  }
}

function onPoseNetModelReady() {
  console.log("PoseNet inited");
  poseNetModelReady = true;
}


/**
 * Callback function called by ml5.js PosetNet when a pose has been detected
 */
function onPoseDetected(poses) {
  console.log("On new poses detected!");
  currentPoses = poses;
  // if(currentPoses){
  //   let strHuman = " human";
  //   if(currentPoses.length > 1){
  //     strHuman += 's';
  //   }
  //   text("We found " + currentPoses.length + strHuman);
  // }
  // Iterate through all poses and print them out
  if(currentPoses){
    for (let i = 0; i < currentPoses.length; i++) {
      drawPose(currentPoses[i], i);
    }
  }
}

function drawPose(pose, poseIndex) {
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
  const kpSize = 5;
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
  for (let i = 0; i < poses.length; i += 1) {
    const skeleton = poses[i].skeleton;
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
  // if (!serial.isOpen()) {
  //   serial.connectAndOpen(null, serialOptions);
  // }
}