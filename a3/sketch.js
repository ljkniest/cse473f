// Lianne Kniest A3 - Spring 2024

// Inspired and using code from:
// https://makeabilitylab.github.io/physcomp/communication/p5js-serial
// By Jon E. Froehlich
// @jonfroehlich
// http://makeabilitylab.io/
// 

// This code was also iterated on, inspired by, and partially sourced using
// ChatGPT 3.5 https://chatgpt.com


// serial variable definitions
let pHtmlMsg;
let serialOptions = { baudRate: 115200  };
let serial;

let CANVAS_HEIGHT = 700;
let CANVAS_WIDTH = 1400;

// sensitivity of rotation modifier
let MS2_TO_DELTA = .002;

let rotation_x = 0;
let rotation_y = 0;

let dx = 0;
let dy = 0;

// shape selected
let selectedShape = "torus";

// size selected
let size = 100;

function setup() {
  createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT, WEBGL);

  // Setup Web Serial using serial.js
  serial = new Serial();
  serial.on(SerialEvents.CONNECTION_OPENED, onSerialConnectionOpened);
  serial.on(SerialEvents.CONNECTION_CLOSED, onSerialConnectionClosed);
  serial.on(SerialEvents.DATA_RECEIVED, onSerialDataReceived);
  serial.on(SerialEvents.ERROR_OCCURRED, onSerialErrorOccurred);

  // If we have previously approved ports, attempt to connect with them
  serial.autoConnectAndOpenPreviouslyApprovedPort(serialOptions);

  // add shape select buttons to page
  createButtons();
  // add size slider
  sizeSlider = createSlider(50, 400, 100); // min, max, initial value
  sizeSlider.position(10, 50);

  // Add in a lil <p> element to provide messages. This is optional
  pHtmlMsg = createP("Click anywhere on this page to open the serial connection dialog");
  pHtmlMsg.style('color', 'deeppink');
}

function draw() {
  background(220);

  rotation_x += dx;
  rotation_y += dy;
  
  // making sure object stays completely still causes jumpiness
  if (abs(rotation_x) < 0.0005) {
    rotation_x = 0;
  }
  if (abs(rotation_y) < 0.0005) {
    rotation_y = 0;
  }

  // Rotate around the Y/X-axis using callback-updated vals
  // Note: this is flipped in p5.js from the accelerometer.
  rotateX(rotation_y);
  rotateY(rotation_x);
  // Rotate around X-axis using callback-updated vals

// Draw selected shape
 size = sizeSlider.value();
  if (selectedShape === "box") {
    box(size);
  } else if (selectedShape === "cone") {
    cone(size);
  } else if (selectedShape === "torus") {
    torus(size / 2, size / 4);
  } else if (selectedShape === "plane") {
    plane(size, size);
  } else if (selectedShape === "sphere") {
    sphere(size / 2);
  } else if (selectedShape === "ellipsoid") {
    ellipsoid(size, size / 2, size * 0.75);
  } else if (selectedShape === "cylinder") {
    cylinder(size / 2, size);
  }
}

// shape select button creation functions
function createButtons() {
  let boxButton = createButton('Box');
  boxButton.position(10, 10);
  boxButton.mousePressed(() => {
    selectedShape = "box";
  });

  let coneButton = createButton('Cone');
  coneButton.position(70, 10);
  coneButton.mousePressed(() => {
    selectedShape = "cone";
  });

  let torusButton = createButton('Torus');
  torusButton.position(130, 10);
  torusButton.mousePressed(() => {
    selectedShape = "torus";
  });

  let planeButton = createButton('Plane');
  planeButton.position(190, 10);
  planeButton.mousePressed(() => {
    selectedShape = "plane";
  });

  let sphereButton = createButton('Sphere');
  sphereButton.position(250, 10);
  sphereButton.mousePressed(() => {
    selectedShape = "sphere";
  });

  let ellipsoidButton = createButton('Ellipsoid');
  ellipsoidButton.position(310, 10);
  ellipsoidButton.mousePressed(() => {
    selectedShape = "ellipsoid";
  });

  let cylinderButton = createButton('Cylinder');
  cylinderButton.position(370, 10);
  cylinderButton.mousePressed(() => {
    selectedShape = "cylinder";
  });
}


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
  let values = newData.split(', ');  // Split incoming line

  if (values.length > 1) {
    let incoming_x = parseFloat(values[0]);
    let incoming_y = parseFloat(values[1])
    dx = incoming_x * MS2_TO_DELTA;
    dy = incoming_y * MS2_TO_DELTA;
  }
}

/**
 * Called automatically by the browser through p5.js when mouse clicked
 */
function mouseClicked() {
  if (!serial.isOpen()) {
    serial.connectAndOpen(null, serialOptions);
  }
}