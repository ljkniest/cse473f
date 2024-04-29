// --- general includes ---
#include <SPI.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <Adafruit_LIS3DH.h>
#include <Adafruit_Sensor.h>
#include <FastLED.h>
// #include <C:\Users\liann\OneDrive\Documents\Arduino\a2\car.h> 
#include "car.c"  //idk why including the .h file doesn't work

// --- sprites ---
#include <C:\Users\liann\OneDrive\Documents\Arduino\a2\racecar_sprite.c> 
#include <C:\Users\liann\OneDrive\Documents\Arduino\a2\track.c> 

// --- definitions ---
#define MOTOR_PIN 10
#define BUZZER_PIN 9

// constants
#define SCREEN_WIDTH 128 // OLED display width, in pixels
#define SCREEN_HEIGHT 64 // OLED display height, in pixels
#define TRACK_WIDTH 35
#define TRACK_LENGTH 400
// #define TRACK_LENGTH_PIXELS 800 // divide by two for real length
// Declaration for an SSD1306 display connected to I2C (SDA, SCL pins)
#define OLED_RESET     4 // Reset pin # (or -1 if sharing Arduino reset pin)


// vibromotor constants
int vibration_start = 0;
int vibration_duration = 0;
uint8_t vibration_strength = 0;

// graphic items
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);
Car* car;
// uint8_t track[TRACK_LENGTH * 2];
// int track_start_x;
int track_start_y;
int track_dy;

// SPI/accelerometer items
// software SPI
// Adafruit_LIS3DH lis = Adafruit_LIS3DH(LIS3DH_CS, LIS3DH_MOSI, LIS3DH_MISO, LIS3DH_CLK);
Adafruit_LIS3DH lis = Adafruit_LIS3DH();
volatile sensors_event_t event;

void setup() {
  // ** microcontoller init
  Serial.begin(9600);
  Serial.println("online!");

  pinMode(MOTOR_PIN, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);

  // ** init display
  // SSD1306_SWITCHCAPVCC = generate display voltage from 3.3V internally
  if(!display.begin(SSD1306_SWITCHCAPVCC, 0x3D)) { // Address 0x3D for 128x64
    Serial.println(F("SSD1306 allocation failed"));
    // for(;;); // Don't proceed, loop forever
  }

  // ** init accelerometer
  if (!lis.begin(0x18)) {   // change this to 0x19 for alternative i2c address
    Serial.println("Couldnt start accelerometer");
    // while (1) yield();
  }
  lis.setRange(LIS3DH_RANGE_2_G);   // 2, 4, 8 or 16 G!
  lis.setDataRate(LIS3DH_DATARATE_10_HZ);
  // Clear the buffer
  display.clearDisplay();

  // ** init game state
  car = create_car(display.width() / 2, 0, 0, RACECAR_WIDTH, 0, display.width(), STRAIGHT);
  // get_track();
  track_dy = 1;
  // track_start_y = 0;
}

void loop() {

  // draw graphics
  display.clearDisplay();
  draw_car();
  // draw_static_car();
  // draw_track();
  display.display();
  // delay(1000); 
  EVERY_N_MILLISECONDS(5000) {
    // vibrate(250, 100);
  }


  // get wheel acceleration and map next viewport change
  EVERY_N_MILLISECONDS(50) {
    lis.getEvent(&event);
    set_movement_vectors();
    update_x(car);
    // Serial.println(car->x);
    Serial.println(car->dx);
  }


  // decide next game state


  // handle vibrations
  if (vibration_duration > 0) {
    if (millis() - vibration_start >= vibration_duration) {
      digitalWrite(MOTOR_PIN, LOW);
      vibration_duration = 0;
      vibration_start = 0;
    } else {
      digitalWrite(MOTOR_PIN, vibration_strength);
    }
  }
}

// draws the car on the bottom middle of the screen but does not display
void draw_static_car() {
  // display.drawBitmap((SCREEN_WIDTH/2) - RACECAR_WIDTH, RACECAR_HEIGHT, racecar, RACECAR_WIDTH, RACECAR_HEIGHT, WHITE);
  display.drawBitmap((SCREEN_WIDTH/2) - (RACECAR_WIDTH / 2), SCREEN_HEIGHT - RACECAR_HEIGHT - 5, racecar, RACECAR_WIDTH, RACECAR_HEIGHT, WHITE);
}

// draws the car based on the car object positioning
void draw_car() {
  // display.drawBitmap((SCREEN_WIDTH/2) - RACECAR_WIDTH, RACECAR_HEIGHT, racecar, RACECAR_WIDTH, RACECAR_HEIGHT, WHITE);
  display.drawBitmap(car->x, SCREEN_HEIGHT - RACECAR_HEIGHT - 5, racecar, RACECAR_WIDTH, RACECAR_HEIGHT, WHITE);
}

// void draw_track() {
//     // Scale track boundaries to fit within the screen dimensions
//     // float scaleX = (float)SCREEN_WIDTH / TRACK_WIDTH;
//     // float scaleY = (float)SCREEN_HEIGHT / 2; // Since the track has top and bottom boundaries
//     int array_index = track_start_y;
//     // Draw left boundary
//     for (int row = 0; row < SCREEN_HEIGHT; row++) {
//         display.drawPixel(track[array_index], row, SSD1306_WHITE);
//         display.drawPixel(track[array_index + 1], row, SSD1306_WHITE);
//         array_index += 2;
//     }
// }


// turns on the vibromotor for the duration in ms listed, strength as 0-255
void vibrate(int duration, uint8_t strength) {
  vibration_start = millis();
  vibration_duration = duration;
  vibration_strength = strength;
}

// take acceleration data and modify viewport change vector
void set_movement_vectors() {
  if (millis() % 10 == 0) {
    // Serial.print("\t\tX: "); Serial.print(event.acceleration.x);
    // Serial.print(" \tY: "); Serial.print(event.acceleration.y);
    // Serial.print(" \tZ: "); Serial.print(event.acceleration.z);
    // Serial.println(" m/s^2 ");
    // Serial.println(car->x);
  }
  if (millis() % 10) {
    update_dx(car, event.acceleration.x);
    // track_start_y += track_dy;
    // track_start_y += dy;
    // Serial.println(event.acceleration.x);
  }
}


// void get_track() {
//     // Initialize track boundaries
//     // uint8_t[] track = (uint8_t *)malloc((TRACK_LENGTH) * sizeof(uint8_t));
//     // init beginning of track in center
//     uint8_t center = TRACK_WIDTH / 2;
//     uint8_t half_car = RACECAR_WIDTH / 2;
//     uint8_t buffer = 5;
//     for (int i = 0; i < RACECAR_HEIGHT * 2; i+=2) {
//         track[i] = center - half_car - buffer;
//         // track[i + 1] = center + half_car + buffer;
//     }

//     // Generate left boundary
//     uint8_t left_boundary = center - half_car - buffer; // Initial position of left boundary
//     // uint8_t right_boundary = center + half_car + buffer;
//     for (int row = 0; row < (TRACK_LENGTH * 2) - (RACECAR_HEIGHT * 2); row++) {
//         if (row % 15 == 0) {
//             // Randomly adjust left boundary every 20 pixels
//             left_boundary += rand() % 5 - 2; // Adjust within [-2, 2]
//             if (left_boundary < 1)
//             {
//               left_boundary = 1;
//             }
//             if (left_boundary > TRACK_WIDTH - RACECAR_WIDTH - 1)
//             {
//               left_boundary = TRACK_WIDTH - RACECAR_WIDTH - 1;
//             } 
//         }
//         track[row * 2] = left_boundary;
//     }

//     // Generate right boundary
//     for (int row = 0; row < (TRACK_LENGTH * 2); row++) {
//         track[row * 2 + 1] = track[row * 2] + RACECAR_WIDTH + buffer;
//     }
// }

