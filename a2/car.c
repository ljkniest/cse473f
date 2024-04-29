// #include <C:\Users\liann\OneDrive\Documents\Arduino\a2\car.h> 
#include "car.h"


// typedef enum {
//   STRAIGHT = 0,
//   LEFT_1 = 1,
//   LEFT_2 = 2,
//   RIGHT_1 = 3,
//   RIGHT_2 = 4
// } TURN;

// typedef struct
// {
//     int x;
//     int yaw; 
//     int car_width;
//     int x_min;
//     int x_max;
//     TURN turn;
// } Car;


// float YAW_MODIFIER = 1.0;
// float VX_MODIFIER = 1.0;

extern Car* create_car(int x, int dx, int yaw, int width, int min, int max, TURN turn) {
    Car* car = (Car*)malloc(sizeof(Car));
    car->x = x;
    car->dx = dx;
    car->yaw = yaw;
    car->car_width = width;
    car->x_min = 0;
    car->x_max = max - width;
    car->turn = turn;
    return car;
}

// Function to update x based on dx
void update_x(Car* car) {
    // Calculate yaw change based on accelerometer reading
    int dx = car->dx;
    int new_x = car->x + dx;
    int min = car->x_min;
    int max = car->x_max;
    if (new_x < min) {
      new_x = min;
      tone(9, 440, 100);
    } else if (new_x > max) {
      new_x = max;
      tone(9, 440, 100);
    }
    // Update car's x position
    car->x = new_x;
}

// update dx based on accelerometer
extern void update_dx(Car* car, float accelerometer) {
  car->dx = (int) (accelerometer * DX_MAX * DX_MODIFIER);
  // Serial.println(accelerometer);
}

// // Function to update yaw based on accelerometer reading
// void update_yaw(Car *car, int vx) {
//     // Calculate yaw change based on accelerometer reading
//     int yaw_change = (int)(YAW_MODIFIER * vx * -1);

//     // Update car's yaw
//     car->yaw += yaw_change;
// }

// void set_turn(Car* car, int yaw) {
//   // straight

//   // 
//   if (yaw > 0) {

//   }
// }