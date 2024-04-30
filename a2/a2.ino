// --- general includes ---
// #include <SPI.h>
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
#include <C:\Users\liann\OneDrive\Documents\Arduino\a2\cone.c> 
#include <C:\Users\liann\OneDrive\Documents\Arduino\a2\cone_sprite.c> 

// --- definitions ---
#define MOTOR_PIN 10
#define BUZZER_PIN 9

// constants
#define SCREEN_WIDTH 128 // OLED display width, in pixels
#define SCREEN_HEIGHT 64 // OLED display height, in pixels
#define TRACK_WIDTH 35
#define TRACK_LENGTH 64
#define MAX_CONES 4
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
Cone *cones[MAX_CONES] = {NULL};
int track_start_y;
uint8_t cone_dy;

uint8_t num_cones;

// SPI/accelerometer items
Adafruit_LIS3DH lis = Adafruit_LIS3DH();
volatile sensors_event_t event;

void setup() {
  // ** microcontoller init
  Serial.begin(9600);
  while (!Serial) ;
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
  // draw_static_car();  // show during boot to confirm that the get_track is what crashes and not the whole damn thing
  display.display();
  Serial.println("display car");
  cone_dy = 1;
  track_start_y = 0;
  num_cones = 0;
  Serial.println("Exit setup");
  // for(int i = 0; i < (TRACK_LENGTH * 2); i++) {
  //   // Serial.println(track[i]);
  // }
  
}

void loop() {
  // Serial.println("loop");
  // draw graphics
  display.clearDisplay();
  // Serial.println("cleared display");
  draw_car();
  draw_cones();  
  // draw_static_car();
  // draw_track();
  display.display();
  // delay(1000); 
  EVERY_N_MILLISECONDS(5000) {
    // vibrate(250, 100);
    // Serial.println("loop");
  }


  // get wheel acceleration and map next viewport change
  EVERY_N_MILLISECONDS(50) {
    // Serial.println("Set vectors");
    lis.getEvent(&event);
    set_movement_vectors();
    update_x(car);
    // Serial.print("Num cones: ");
    // Serial.print(num_cones);
    // Serial.println();
    // Serial.println(car->x);
    // Serial.println(car->dx);
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
// void draw_static_car() {
//   // display.drawBitmap((SCREEN_WIDTH/2) - RACECAR_WIDTH, RACECAR_HEIGHT, racecar, RACECAR_WIDTH, RACECAR_HEIGHT, WHITE);
//   display.drawBitmap((SCREEN_WIDTH/2) - (RACECAR_WIDTH / 2), SCREEN_HEIGHT - RACECAR_HEIGHT - 5, racecar, RACECAR_WIDTH, RACECAR_HEIGHT, WHITE);
// }

// draws the car based on the car object positioning
void draw_car() {
  // Serial.println("draw car");
  // display.drawBitmap((SCREEN_WIDTH/2) - RACECAR_WIDTH, RACECAR_HEIGHT, racecar, RACECAR_WIDTH, RACECAR_HEIGHT, WHITE);
  display.drawBitmap(car->x, SCREEN_HEIGHT - RACECAR_HEIGHT - 5, racecar, RACECAR_WIDTH, RACECAR_HEIGHT, WHITE);
}

void draw_cones() {
  for ( int i = 0; i < MAX_CONES; i++) {
    Cone* cone_ptr = cones[i];
    if (cone_ptr != NULL) {
      display.drawBitmap(cone_ptr->x, cone_ptr->y, cone_sprite, CONE_WIDTH, CONE_HEIGHT, WHITE);
    }
  }
}



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
    // Serial.println(event.acceleration.x);
  }
  if (millis() % 100) {
    // track_start_y = min(track_start_y + cone_dy, TRACK_LENGTH * 2);
    move_cones();
    gen_cones();
  }
}


void move_cones() {
  for (int cone_num = 0; cone_num < num_cones; cone_num++) {
    Cone* cone_ptr = cones[cone_num];
    // Serial.println("checking cones");
    if (cone_ptr != NULL) {
      uint8_t new_y = cone_ptr->y + cone_dy;
      if (new_y + CONE_HEIGHT > SCREEN_HEIGHT) {
        free(cone_ptr);
        cones[cone_num] = NULL;
        num_cones--;
      } else {
        update_coords(cone_ptr, cone_ptr->x, new_y);
      }
    }
  }
}

void gen_cones() {
  if (num_cones <= MAX_CONES) {
    if(millis() % 10) {
      int index = random(0, 3);
      if (cones[index] == NULL) {
        uint8_t x_index = (uint8_t) random(0, SCREEN_WIDTH - CONE_WIDTH);
        cones[index] = create_cone(x_index, 0);
        num_cones += 1;
      }
    }
  }
}
