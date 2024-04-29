#ifndef CAR_H
#define CAR_H
#include<stdio.h>
#include<stdlib.h>

#define DX_MAX 10
#define DX_MODIFIER 0.3

typedef enum {
  STRAIGHT = 0,
  LEFT_1 = 1,
  LEFT_2 = 2,
  RIGHT_1 = 3,
  RIGHT_2 = 4
} TURN;

typedef struct
{
    int x;
    int dx;
    int yaw; 
    int car_width;
    int x_min;
    int x_max;
    TURN turn;
} Car;


extern Car* create_car(int x, int dx, int yaw, int width, int min, int max, TURN turn);
extern void update_x(Car* car);
extern void update_dx(Car* car, float accelerometer);
extern void update_yaw(Car* car, int vx);
extern void update_turn(Car* car, int yaw);

#endif /* CAR_H */
