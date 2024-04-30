// ChatGPT was used in the editing and debugging of this code.
// --- general includes ---
// #include <SPI.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <Adafruit_LIS3DH.h>
#include <Adafruit_Sensor.h>
#include <FastLED.h>
#include "car.c"  // idk why including the .h file doesn't work

// --- sprites ---
#include <C:\Users\liann\OneDrive\Documents\Arduino\a2\racecar_sprite.c> 
#include <C:\Users\liann\OneDrive\Documents\Arduino\a2\cone.c> 
#include <C:\Users\liann\OneDrive\Documents\Arduino\a2\cone_sprite.c> 

// --- definitions ---
#define MOTOR_PIN 10
#define BUZZER_PIN 9
#define FASTER_BUTTON_PIN 2
#define NEW_GAME 0
#define PLAYING 1
#define GAME_OVER 2


// constants
#define SCREEN_WIDTH 128 // OLED display width, in pixels
#define SCREEN_HEIGHT 64 // OLED display height, in pixels
#define TRACK_WIDTH 35
#define TRACK_LENGTH 64
#define MAX_CONES 4
#define MAX_DY 10
#define MIN_DY 1
#define GAME_LENGTH_MS 30000
#define MAX_CONE_COUNT 20
// Declaration for an SSD1306 display connected to I2C (SDA, SCL pins)
#define OLED_RESET     4 // Reset pin # (or -1 if sharing Arduino reset pin)
#define DEBOUNCE_DELAY 50
#define CLICKTHRESHHOLD 80
volatile unsigned long last_click_time;
unsigned long game_start = 0;
unsigned long game_time = 0;
int cone_ctr;
int cones_hit;
int score;

// vibromotor constants
int vibration_start = 0;
int vibration_duration = 0;
uint8_t vibration_strength = 0;

// graphic items + game state
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);
Car* car;
Cone *cones[MAX_CONES] = {NULL};
int track_start_y;
volatile uint8_t cone_dy;
volatile uint8_t game_state;
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

  // ** init display
  // SSD1306_SWITCHCAPVCC = generate display voltage from 3.3V internally
  if(!display.begin(SSD1306_SWITCHCAPVCC, 0x3D)) { // Address 0x3D for 128x64
    Serial.println(F("SSD1306 allocation failed"));
  }

  // ** init accelerometer
  // inspired by https://learn.adafruit.com/adafruit-lis3dh-triple-axis-accelerometer-breakout/arduino
  if (!lis.begin(0x18)) {   // change this to 0x19 for alternative i2c address
    Serial.println("Couldnt start accelerometer");
  }
  last_click_time = millis();
  lis.setRange(LIS3DH_RANGE_2_G);   // 2, 4, 8 or 16 G!
  lis.setDataRate(LIS3DH_DATARATE_10_HZ);
  lis.setClick(2, CLICKTHRESHHOLD);
  // Clear the buffer
  display.clearDisplay();

  // get car ready
  car = create_car((display.width() / 2) - 5, 0, 0, RACECAR_WIDTH, 0, display.width());

  // ** init game state
  game_state = NEW_GAME;
}

void loop() {
  // Text boxes inspired by https://learn.adafruit.com/monochrome-oled-breakouts/arduino-library-and-examples
  switch (game_state) {
    case NEW_GAME:
      display.clearDisplay();
      // Set text size and color
      display.setTextSize(1);      // Normal 1:1 pixel scale
      display.setTextColor(SSD1306_WHITE); // Draw white text
      // Set text cursor position
      display.setCursor(0, 0);
      // Print text
      display.println("--Asseto Course-no--");
      display.println("Pass 20 cones");
      display.println("as fast as possible.");
      display.println("Hitting a cone is +5 seconds.");
      display.println();
      display.println("Push steering wheel");
      display.println("in to start.");
      display.display();
      break;
    case PLAYING:
      break;
    case GAME_OVER:
        display.clearDisplay();
      // Set text size and color
      display.setTextSize(1);      // Normal 1:1 pixel scale
      display.setTextColor(SSD1306_WHITE); // Draw white text
      // Set text cursor position
      display.setCursor(0, 0);
      // Print text
      display.println("Finish!");
      // display.println("Over :(");
      display.println();
      display.println("Your final time: ");
      display.print((game_time) / 1000 + (5 * cones_hit));
      display.print(" seconds");
      display.println();
      display.print("Cones hit: ");
      display.print(cones_hit);
      display.println();
      display.println("Push in wheel for");
      display.println("main menu.");
      display.display();
      break;
  }

  EVERY_N_MILLISECONDS(10) {
    if (game_state == PLAYING) {
      display.clearDisplay();
      draw_car();
      draw_cones();  
      display.display();
    }
  }

        // get wheel acceleration and map next viewport change
  EVERY_N_MILLISECONDS(50) {
    if (game_state == PLAYING) {
      lis.getEvent(&event);
      set_movement_vectors();
      update_x(car);
      check_collision();
      // Serial.println(car->dx);
    }
  }

  EVERY_N_MILLISECONDS(1000) {
    // Serial.println(game_state);
    if (game_state == PLAYING) {
      check_time();
      Serial.println(cone_ctr);
    }
  }


  EVERY_N_MILLISECONDS(500) {
    uint8_t click = lis.getClick();
    if (click & 0x10) {
      Serial.println("Click");
      if (millis() - last_click_time > 3000) {
        last_click_time = millis();
        advance_game_state();
      }
    }
  }

  // handle vibrations
  // written using ChatGPT 3.5
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
    update_dx(car, event.acceleration.x);
    update_dy(event.acceleration.y);
    move_cones();
    gen_cones();
    poll_collision();
}

void check_time() {
  if (cone_ctr >= MAX_CONE_COUNT) {
    advance_game_state();
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
          cone_ctr++;
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
          vibrate(100, 50);
          cones[i]->collided = 2; // set to dispatched
          cones_hit++;
      }
    }
  }
}


// Function to check collision between the car and cones
// This function was written by ChatGPT 3.5 using this prompt:
// Uow do I add collision detection to this for the cone and cars?
// *insert code*
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
          // cone collision!
          collide(cone);
          // cones_hit++;
      }
    }
  }
}

void initialize_game() {
  //  reset game state
  cone_dy = MIN_DY;
  track_start_y = 0;
  num_cones = 0;
  // score = 100;
  cones_hit = 0;
  cone_ctr = 0;
  game_start = millis();
}


void advance_game_state() {
    Serial.println("moving game state");
    game_state += 1;
    if (game_state == PLAYING) {
      initialize_game();
    }
    if (game_state == GAME_OVER) {
      game_time = millis() - game_start;
      for (int i = 0; i < num_cones; i++) {
        if (cones[i] != NULL) {
          free(cones[i]);
          cones[i] = NULL;
        }
      }
    }
    if (game_state > GAME_OVER) {
      game_state = NEW_GAME;
    }
  // }
}


void update_dy(float accelerometer) {
  cone_dy += (int) (accelerometer * 0.2);
  if (cone_dy > MAX_DY) {
    cone_dy = MAX_DY;
  }
  if (cone_dy < MIN_DY) {
    cone_dy = MIN_DY;
  }
  // Serial.println(accelerometer * 0.1);
}

