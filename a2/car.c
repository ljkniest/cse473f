#include "car.h"

extern Car* create_car(int x, int dx, int yaw, int width, int min, int max) {
    Car* car = (Car*)malloc(sizeof(Car));
    car->x = x;
    car->dx = dx;
    car->yaw = yaw;
    car->car_width = width;
    car->x_min = 0;
    car->x_max = max - width;
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
