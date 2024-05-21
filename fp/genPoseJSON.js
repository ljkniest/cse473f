const filepath = "./references/hands_up.jpg";
let outputpath = filepath.replace("jpg", "json");

let img;
let img_ready = false;
let pose_ready = false;
let pose;

function setup() {
  img = loadImage(filepath, onLoad);
  poseNet = ml5.poseNet(img, poseNetReady);
}

function onLoad() {
  img_ready = true;
}

function poseNetReady() {
  pose_ready = true;
  poseNet.singlePose(img, gotPose);
}

function gotPose(results) {
  if (results.length > 0) {
    pose = results[0].pose;
    saveJSON(pose, outputpath);
  }
}