#include <esp_now.h>
#include <WiFi.h>
#include "esp_wifi.h"

bool myData = 0;

#define buzzerpin 18

void OnDataRecv(const esp_now_recv_info_t *info,
                const uint8_t *incomingData,
                int len) {

  memcpy(&myData, incomingData, sizeof(myData));

  Serial.print("Received Value: ");

  Serial.println(myData);

  if (myData == 1) {

    Serial.println("ALERT RECEIVED");

    digitalWrite(buzzerpin, HIGH);
  }

  else {

    Serial.println("SAFE");

    digitalWrite(buzzerpin, LOW);
  }
}

void setup() {

  WiFi.mode(WIFI_STA);

  WiFi.disconnect();

  delay(1000);

  esp_wifi_set_channel(6, WIFI_SECOND_CHAN_NONE);

  Serial.begin(115200);

  delay(1000);

  pinMode(buzzerpin, OUTPUT);

  digitalWrite(buzzerpin, LOW);

  Serial.print("Receiver MAC Address: ");

  Serial.println(WiFi.macAddress());

  if (esp_now_init() != ESP_OK) {

    Serial.println("ESP NOW INIT FAILED");

    return;
  }

  esp_now_register_recv_cb(OnDataRecv);

  Serial.println("ESP NOW READY");
}

void loop() {

}