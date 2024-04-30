#include<stdio.h>
#include<stdlib.h>

typedef struct
{
  uint8_t x;
  uint8_t y;
  uint8_t collided;
} Cone;

// typedef enum {
//   NOT_COLLIDED = 0,
//   COLLIDED = 1,
//   DISPATCHED = 2
// } ConeCollision;

extern Cone* create_cone(uint8_t x, uint8_t y) {
    Cone* cone = (Cone*)malloc(sizeof(Cone));
    cone->x = x;
    cone->y = y;
    cone->collided = 0;
    return cone;
}

extern void update_coords(Cone* cone, uint8_t x, uint8_t y) {
  cone->x = x;
  cone->y = y;
}

extern void collide(Cone* cone) {
  if (cone->collided == 0) {
    cone->collided = 1;
  }
}
