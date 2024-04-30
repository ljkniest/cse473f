#include<stdio.h>
#include<stdlib.h>

typedef struct
{
  uint8_t x;
  uint8_t y;
} Cone;

extern Cone* create_cone(uint8_t x, uint8_t y) {
    Cone* cone = (Cone*)malloc(sizeof(Cone));
    cone->x = x;
    cone->y = y;
    return cone;
}

extern void update_coords(Cone* cone, uint8_t x, uint8_t y) {
  cone->x = x;
  cone->y = y;
}
