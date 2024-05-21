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


// Jumping jack reference poses

const handsup = {
  "score": 0.9306352909873513,
  "keypoints": [
    {
      "score": 0.9800858497619629,
      "part": "nose",
      "position": {
        "x": 309.5385077213035,
        "y": 89.79581484071011
      }
    },
    {
      "score": 0.9572776556015015,
      "part": "leftEye",
      "position": {
        "x": 322.0734283803502,
        "y": 89.14966865272373
      }
    },
    {
      "score": 0.9482304453849792,
      "part": "rightEye",
      "position": {
        "x": 303.72636490758754,
        "y": 80.83841880471789
      }
    },
    {
      "score": 0.6805757284164429,
      "part": "leftEar",
      "position": {
        "x": 320.4151340588521,
        "y": 97.4711781067607
      }
    },
    {
      "score": 0.7744254469871521,
      "part": "rightEar",
      "position": {
        "x": 286.9518140503405,
        "y": 86.97744406614785
      }
    },
    {
      "score": 0.9773386120796204,
      "part": "leftShoulder",
      "position": {
        "x": 345.0269789640078,
        "y": 130.89385867582686
      }
    },
    {
      "score": 0.9907568097114563,
      "part": "rightShoulder",
      "position": {
        "x": 276.5215945707685,
        "y": 129.9616974708171
      }
    },
    {
      "score": 0.9791560173034668,
      "part": "leftElbow",
      "position": {
        "x": 401.5279593263619,
        "y": 91.2625395184825
      }
    },
    {
      "score": 0.9420381784439087,
      "part": "rightElbow",
      "position": {
        "x": 221.8118084265564,
        "y": 107.1918318336576
      }
    },
    {
      "score": 0.9240142703056335,
      "part": "leftWrist",
      "position": {
        "x": 369.5342898832685,
        "y": 52.50307788180933
      }
    },
    {
      "score": 0.9297556281089783,
      "part": "rightWrist",
      "position": {
        "x": 242.51462943822958,
        "y": 46.697033833900775
      }
    },
    {
      "score": 0.9946882724761963,
      "part": "leftHip",
      "position": {
        "x": 333.9163956104086,
        "y": 258.1368555447471
      }
    },
    {
      "score": 0.9961801767349243,
      "part": "rightHip",
      "position": {
        "x": 291.21861320525295,
        "y": 255.94870956955253
      }
    },
    {
      "score": 0.9951890707015991,
      "part": "leftKnee",
      "position": {
        "x": 343.7131034168288,
        "y": 346.70723644212063
      }
    },
    {
      "score": 0.9878189563751221,
      "part": "rightKnee",
      "position": {
        "x": 272.90428547543775,
        "y": 343.12279608463035
      }
    },
    {
      "score": 0.8580520153045654,
      "part": "leftAnkle",
      "position": {
        "x": 360.5298896522374,
        "y": 426.0619452213035
      }
    },
    {
      "score": 0.9052168130874634,
      "part": "rightAnkle",
      "position": {
        "x": 261.1966690479086,
        "y": 417.88006140564204
      }
    }
  ],
  "nose": {
    "x": 309.5385077213035,
    "y": 89.79581484071011,
    "confidence": 0.9800858497619629
  },
  "leftEye": {
    "x": 322.0734283803502,
    "y": 89.14966865272373,
    "confidence": 0.9572776556015015
  },
  "rightEye": {
    "x": 303.72636490758754,
    "y": 80.83841880471789,
    "confidence": 0.9482304453849792
  },
  "leftEar": {
    "x": 320.4151340588521,
    "y": 97.4711781067607,
    "confidence": 0.6805757284164429
  },
  "rightEar": {
    "x": 286.9518140503405,
    "y": 86.97744406614785,
    "confidence": 0.7744254469871521
  },
  "leftShoulder": {
    "x": 345.0269789640078,
    "y": 130.89385867582686,
    "confidence": 0.9773386120796204
  },
  "rightShoulder": {
    "x": 276.5215945707685,
    "y": 129.9616974708171,
    "confidence": 0.9907568097114563
  },
  "leftElbow": {
    "x": 401.5279593263619,
    "y": 91.2625395184825,
    "confidence": 0.9791560173034668
  },
  "rightElbow": {
    "x": 221.8118084265564,
    "y": 107.1918318336576,
    "confidence": 0.9420381784439087
  },
  "leftWrist": {
    "x": 369.5342898832685,
    "y": 52.50307788180933,
    "confidence": 0.9240142703056335
  },
  "rightWrist": {
    "x": 242.51462943822958,
    "y": 46.697033833900775,
    "confidence": 0.9297556281089783
  },
  "leftHip": {
    "x": 333.9163956104086,
    "y": 258.1368555447471,
    "confidence": 0.9946882724761963
  },
  "rightHip": {
    "x": 291.21861320525295,
    "y": 255.94870956955253,
    "confidence": 0.9961801767349243
  },
  "leftKnee": {
    "x": 343.7131034168288,
    "y": 346.70723644212063,
    "confidence": 0.9951890707015991
  },
  "rightKnee": {
    "x": 272.90428547543775,
    "y": 343.12279608463035,
    "confidence": 0.9878189563751221
  },
  "leftAnkle": {
    "x": 360.5298896522374,
    "y": 426.0619452213035,
    "confidence": 0.8580520153045654
  },
  "rightAnkle": {
    "x": 261.1966690479086,
    "y": 417.88006140564204,
    "confidence": 0.9052168130874634
  }
}


const handsdown = {
  "score": 0.9742184842334074,
  "keypoints": [
    {
      "score": 0.9990899562835693,
      "part": "nose",
      "position": {
        "x": 327.19335177529183,
        "y": 60.78056602626458
      }
    },
    {
      "score": 0.996737539768219,
      "part": "leftEye",
      "position": {
        "x": 334.6422437378405,
        "y": 53.85543645124028
      }
    },
    {
      "score": 0.9957283139228821,
      "part": "rightEye",
      "position": {
        "x": 317.7151287390564,
        "y": 56.427396187986375
      }
    },
    {
      "score": 0.8753852844238281,
      "part": "leftEar",
      "position": {
        "x": 350.13918865515564,
        "y": 63.88897966318095
      }
    },
    {
      "score": 0.8426753878593445,
      "part": "rightEar",
      "position": {
        "x": 305.6652024562257,
        "y": 59.67944430933852
      }
    },
    {
      "score": 0.9982958436012268,
      "part": "leftShoulder",
      "position": {
        "x": 369.8227368069066,
        "y": 120.03687758390078
      }
    },
    {
      "score": 0.999189555644989,
      "part": "rightShoulder",
      "position": {
        "x": 288.524725650535,
        "y": 112.59780824416342
      }
    },
    {
      "score": 0.9926909804344177,
      "part": "leftElbow",
      "position": {
        "x": 394.9892844114786,
        "y": 176.0158149927043
      }
    },
    {
      "score": 0.9939461946487427,
      "part": "rightElbow",
      "position": {
        "x": 249.4148794686284,
        "y": 166.58898498297665
      }
    },
    {
      "score": 0.988639235496521,
      "part": "leftWrist",
      "position": {
        "x": 421.5639819430934,
        "y": 216.38253891050584
      }
    },
    {
      "score": 0.9682605862617493,
      "part": "rightWrist",
      "position": {
        "x": 215.8680576665856,
        "y": 222.3485568154183
      }
    },
    {
      "score": 0.9991025924682617,
      "part": "leftHip",
      "position": {
        "x": 349.15882630107006,
        "y": 239.09263284289887
      }
    },
    {
      "score": 0.995391845703125,
      "part": "rightHip",
      "position": {
        "x": 297.305219479572,
        "y": 240.6779699659533
      }
    },
    {
      "score": 0.9965837597846985,
      "part": "leftKnee",
      "position": {
        "x": 357.85414640077823,
        "y": 331.8726440904669
      }
    },
    {
      "score": 0.9808268547058105,
      "part": "rightKnee",
      "position": {
        "x": 292.10080632903697,
        "y": 331.3313168774319
      }
    },
    {
      "score": 0.9749730229377747,
      "part": "leftAnkle",
      "position": {
        "x": 359.4170643847276,
        "y": 409.9399243069066
      }
    },
    {
      "score": 0.9641972780227661,
      "part": "rightAnkle",
      "position": {
        "x": 287.03617081104085,
        "y": 419.6209265564202
      }
    }
  ],
  "nose": {
    "x": 327.19335177529183,
    "y": 60.78056602626458,
    "confidence": 0.9990899562835693
  },
  "leftEye": {
    "x": 334.6422437378405,
    "y": 53.85543645124028,
    "confidence": 0.996737539768219
  },
  "rightEye": {
    "x": 317.7151287390564,
    "y": 56.427396187986375,
    "confidence": 0.9957283139228821
  },
  "leftEar": {
    "x": 350.13918865515564,
    "y": 63.88897966318095,
    "confidence": 0.8753852844238281
  },
  "rightEar": {
    "x": 305.6652024562257,
    "y": 59.67944430933852,
    "confidence": 0.8426753878593445
  },
  "leftShoulder": {
    "x": 369.8227368069066,
    "y": 120.03687758390078,
    "confidence": 0.9982958436012268
  },
  "rightShoulder": {
    "x": 288.524725650535,
    "y": 112.59780824416342,
    "confidence": 0.999189555644989
  },
  "leftElbow": {
    "x": 394.9892844114786,
    "y": 176.0158149927043,
    "confidence": 0.9926909804344177
  },
  "rightElbow": {
    "x": 249.4148794686284,
    "y": 166.58898498297665,
    "confidence": 0.9939461946487427
  },
  "leftWrist": {
    "x": 421.5639819430934,
    "y": 216.38253891050584,
    "confidence": 0.988639235496521
  },
  "rightWrist": {
    "x": 215.8680576665856,
    "y": 222.3485568154183,
    "confidence": 0.9682605862617493
  },
  "leftHip": {
    "x": 349.15882630107006,
    "y": 239.09263284289887,
    "confidence": 0.9991025924682617
  },
  "rightHip": {
    "x": 297.305219479572,
    "y": 240.6779699659533,
    "confidence": 0.995391845703125
  },
  "leftKnee": {
    "x": 357.85414640077823,
    "y": 331.8726440904669,
    "confidence": 0.9965837597846985
  },
  "rightKnee": {
    "x": 292.10080632903697,
    "y": 331.3313168774319,
    "confidence": 0.9808268547058105
  },
  "leftAnkle": {
    "x": 359.4170643847276,
    "y": 409.9399243069066,
    "confidence": 0.9749730229377747
  },
  "rightAnkle": {
    "x": 287.03617081104085,
    "y": 419.6209265564202,
    "confidence": 0.9641972780227661
  }
}




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
  flipHorizontal: false,
  minConfidence: 0.5,
  maxPoseDetections: 5,
  scoreThreshold: 0.8,
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
  console.log(JSON.stringify(generatePoseAngles(handsup)));
  console.log(JSON.stringify(generatePoseAngles(handsdown)));
}

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
    scoreHtmlMsg.html((JSON.stringify(generatePoseAngles(currentPoses[0].pose))));
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
  // Find keypoints for elbows and hips
  const leftElbow = keypoints["leftElbow"];
  const rightElbow = keypoints["rightElbow"];
  const leftHip = keypoints["leftHip"];
  const rightHip = keypoints["rightHip"];

  // Calculate angles if all keypoints are found
  if (leftElbow && rightElbow && leftHip && rightHip) {
    // Calculate angles for elbows
    const leftElbowAngle = Math.atan2(leftElbow.y - leftHip.y, leftElbow.x - leftHip.x);
    const rightElbowAngle = Math.atan2(rightElbow.y - rightHip.y, rightElbow.x - rightHip.x);

    // Calculate angles for hips
    const leftHipAngle = Math.atan2(leftHip.y - keypoints["leftShoulder"].y, leftHip.x - keypoints["leftShoulder"].x);
    const rightHipAngle = Math.atan2(rightHip.y - keypoints["rightShoulder"].y, rightHip.x - keypoints["rightShoulder"].x);

    // Convert angles to degrees
    const degrees = angle => angle * (180 / Math.PI);

    return {
      leftElbowAngle: degrees(leftElbowAngle),
      rightElbowAngle: degrees(rightElbowAngle),
      leftHipAngle: degrees(leftHipAngle),
      rightHipAngle: degrees(rightHipAngle)
    };
  } else {
    // Handle the case where any of the keypoints are not found
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

