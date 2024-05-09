// A3 - Lianne Kniest
// Inspired by https://www.adafruit.com/product/2809 example
// Outputs accelerometer data in m/2^2 in format "x, y"

#include <Wire.h>
#include <SPI.h>
#include <Adafruit_LIS3DH.h>
#include <Adafruit_Sensor.h>

// I2C
Adafruit_LIS3DH lis = Adafruit_LIS3DH();

void setup(void) {
  Serial.begin(115200);
  while (!Serial) delay(10);     // will pause Zero, Leonardo, etc until serial console opens

  Serial.println("LIS3DH test!");

  if (! lis.begin(0x18)) {   // change this to 0x19 for alternative i2c address
    Serial.println("Couldnt start");
    while (1) yield();
  }
  Serial.println("LIS3DH found!");

  lis.setRange(LIS3DH_RANGE_2_G);   // 2, 4, 8 or 16 G!

  Serial.print("Range = "); Serial.print(2 << lis.getRange());
  Serial.println("G");

  lis.setDataRate(LIS3DH_DATARATE_100_HZ);
}

void loop() {
  sensors_event_t event;
  lis.getEvent(&event);
  Serial.print(event.acceleration.x);
  Serial.print(", ");
  Serial.print(event.acceleration.y);
  Serial.println();
  delay(200);
}
