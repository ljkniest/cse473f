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
#define FASTER_PIN 2
#define SLOWER_PIN 3

// constants
#define SCREEN_WIDTH 128 // OLED display width, in pixels
#define SCREEN_HEIGHT 64 // OLED display height, in pixels
#define TRACK_WIDTH 35
#define TRACK_LENGTH 64
#define MAX_CONES 4
#define MAX_DY 20
#define MIN_DY 1
#define DEBOUNCE_DELAY 50
#define MAX_BRIGHTNESS 255
#define LED_DURATION_MS 250
// #define TRACK_LENGTH_PIXELS 800 // divide by two for real length
// Declaration for an SSD1306 display connected to I2C (SDA, SCL pins)
#define OLED_RESET     4 // Reset pin # (or -1 if sharing Arduino reset pin)

// button debounces
volatile unsigned long last_faster_debounce = 0;
volatile unsigned long last_slower_debounce = 0;

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
  // while (!Serial);
  Serial.println("online!");

  pinMode(MOTOR_PIN, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);

  attachInterrupt(digitalPinToInterrupt(FASTER_PIN), faster, FALLING);
  attachInterrupt(digitalPinToInterrupt(SLOWER_PIN), slower, FALLING);

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

  // ** init buttons

  // ** init game state
  car = create_car((display.width() / 2) - RACECAR_WIDTH, 0, 0, RACECAR_WIDTH, 0, display.width());
  display.display();
  Serial.println("display car");
  cone_dy = MIN_DY;
  track_start_y = 0;
  num_cones = 0;
  Serial.println("Exit setup"); 
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
  // EVERY_N_MILLISECONDS(5000) {
  //   // vibrate(250, 100);
  // }

  // get wheel acceleration and map next viewport change
  EVERY_N_MILLISECONDS(50) {
    // Serial.println("Set vectors");
    lis.getEvent(&event);
    set_movement_vectors();
    update_x(car);
    check_collision();
    // if (millis() - faster_last_fire <= LED_DURATION_MS) {
    //   analogWrite(FASTER_LED, MAX_BRIGHTNESS);
    // } else {
    //   analogWrite(FASTER_LED, 0);
    // }
    // if (millis() - slower_last_fire <= LED_DURATION_MS) {
    //   analogWrite(SLOWER_LED, MAX_BRIGHTNESS);
    // } else {
    //   analogWrite(SLOWER_LED, 0);
    // }
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

// draws the car based on the car object positioning
void draw_car() {
  // Serial.println("draw car");
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
  // if (millis() % 10 == 0) {
  //   // Serial.print("\t\tX: "); Serial.print(event.acceleration.x);
  //   // Serial.print(" \tY: "); Serial.print(event.acceleration.y);
  //   // Serial.print(" \tZ: "); Serial.print(event.acceleration.z);
  //   // Serial.println(" m/s^2 ");
  //   // Serial.println(car->x);
  // }
  if (millis() % 10) {
    update_dx(car, event.acceleration.x);
    // Serial.println(event.acceleration.x);
  }
  if (millis() % 100) {
    // track_start_y = min(track_start_y + cone_dy, TRACK_LENGTH * 2);
    move_cones();
    gen_cones();
    poll_collision();
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
  if (num_cones < MAX_CONES) {
    if (millis() % 10) {
      int index = random(0, MAX_CONES);
      if (cones[index] == NULL) {
        uint8_t x_index = (uint8_t)random(0, SCREEN_WIDTH - CONE_WIDTH);
        uint8_t y_index = 0;
        // Check if the newly generated cone overlaps with any existing cone
        int overlap = 0;
        for (int i = 0; i < MAX_CONES; i++) {
          if (cones[i] != NULL && abs(cones[i]->x - x_index) < CONE_WIDTH) {
            overlap = 1;
            break;
          }
        }
        // Add the cone to the array only if there is no overlap
        if (!overlap) {
          cones[index] = create_cone(x_index, y_index);
          num_cones++;
        }
      }
    }
  }
}

void poll_collision() {
  for (int i = 0; i < MAX_CONES; i++) {
    if (cones[i] != NULL) {
      if (cones[i]->collided == 1) {
          tone(9, 440, 200);
          vibrate(200, 50);
          cones[i]->collided = 2; // set to dispatched
      }
    }
  }
}


// Function to check collision between the car and cones
void check_collision() {
  for (int i = 0; i < MAX_CONES; i++) {
    Cone* cone = cones[i];
    if (cone != NULL) {
      // Check if the car and cone overlap in the x-axis
      if (car->x <= cone->x + CONE_WIDTH &&
          car->x + RACECAR_WIDTH >= cone->x &&
          // Check if the car and cone overlap in the y-axis
          SCREEN_HEIGHT - RACECAR_HEIGHT - 5 <= cone->y + CONE_HEIGHT &&
          SCREEN_HEIGHT - 5 >= cone->y) {
        // Collision detected, handle it here (e.g., play a sound, vibrate, etc.)
        // For example, stop the car
        // car->dx = 0;
        // car->turn = STRAIGHT; // Reset the car's turn state
        // You may also remove the cone from the array or change its position
        // free(cone);
        // cones[i] = NULL;
          collide(cone);
      }
    }
  }
}

// make cones fall faster to appear as though car has accelerated
void faster() {
  if ((millis() - last_faster_debounce) > DEBOUNCE_DELAY) {
    last_faster_debounce = millis();
    cone_dy = min(MAX_DY, cone_dy + 1);
    tone(9, 300, 100);
  }
  // Serial.println(cone_dy);
  // faster_last_fire = millis();
}

// make cones go slower to appear as though car has deccelerated
void slower() {
  if ((millis() - last_slower_debounce) > DEBOUNCE_DELAY) {
    last_slower_debounce = millis();
    cone_dy = max(MIN_DY, cone_dy - 1);
    tone(9, 300, 100);
  }
  // Serial.println(cone_dy);
  // slower_last_fire = millis();
}

