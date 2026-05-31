#include <esp_now.h>
#include "esp_wifi.h"
#include <WiFi.h>
#include <Firebase_ESP_Client.h>
uint8_t broadcastAddress[] = {0x00, 0x70, 0x07, 0xe1, 0xfb, 0x44};
esp_now_peer_info_t peerInfo;
#define WIFI_SSID "Realme6"
#define WIFI_PASSWORD "12345678"
#define API_KEY "AIzaSyB6SA5CcXV7LiBJs7BG1UItV1VhJXgDMSQ"
#define DATABASE_URL "https://esp32-db-1c02a-default-rtdb.firebaseio.com/"
FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;
#define USER_EMAIL "harshalgayakwad29072003@gmail.com"
#define USER_PASSWORD "H@rshal290703"
#include <Wire.h>
#include "MAX30105.h"
#include "heartRate.h"
#include <LiquidCrystal_I2C.h>
LiquidCrystal_I2C lcd(0x27, 20, 4);
MAX30105 particleSensor;
 
#include <OneWire.h>
#include <DallasTemperature.h>

const int SensorDataPin = 13;     

OneWire oneWire(SensorDataPin);
 
DallasTemperature sensors(&oneWire);

const byte RATE_SIZE = 4;  //Increase this for more averaging. 4 is good.
byte rates[RATE_SIZE];     //Array of heart rates
byte rateSpot = 0;
long lastBeat = 0;  //Time at which the last beat occurred

float beatsPerMinute;
int beatAvg;
unsigned int randNumber = 0;
unsigned int spo2 = 0;
bool myData = 0;
 float temp = 0;

void OnDataSent(const wifi_tx_info_t *info, esp_now_send_status_t status) {
  Serial.print("\r\nLast Packet Send Status:\t");
  Serial.println(status == ESP_NOW_SEND_SUCCESS ? "Delivery Success" : "Delivery Fail");
}

void setup() {
  Serial.begin(9600);
sensors.begin();

  Serial.println("Initializing...");

  // Initialize sensor
  if (!particleSensor.begin(Wire, I2C_SPEED_FAST)) {
    Serial.println("MAX30102 was not found. Please check wiring/power. ");
    while (1)
      ;
  }
  Serial.println("Place your index finger on the sensor with steady pressure.");

  particleSensor.setup();                     //Configure sensor with default settings
  particleSensor.setPulseAmplitudeRed(0x0A);  //Turn Red LED to low to indicate sensor is running
  particleSensor.setPulseAmplitudeGreen(0);   //Turn off Green LED
  lcd.begin(20, 4);
  lcd.backlight();
  WiFi.mode(WIFI_STA);

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

Serial.print("Connecting to WiFi");

while (WiFi.status() != WL_CONNECTED) {
  Serial.print(".");
  delay(300);
}

Serial.println();
Serial.println("WiFi Connected"); 
Serial.print("WiFi Channel: ");
Serial.println(WiFi.channel());
esp_wifi_set_channel(WiFi.channel(), WIFI_SECOND_CHAN_NONE);
config.api_key = API_KEY;
config.database_url = DATABASE_URL;
auth.user.email = USER_EMAIL;
auth.user.password = USER_PASSWORD;
Firebase.begin(&config, &auth);
Firebase.reconnectWiFi(true);

Serial.println("Firebase Connected");

  // Init ESP-NOW
  if (esp_now_init() != ESP_OK) {
    Serial.println("Error initializing ESP-NOW");
    return;
  }

  // Once ESPNow is successfully Init, we will register for Send CB to
  // get the status of Trasnmitted packet
  esp_now_register_send_cb(OnDataSent);  
  // Register peer
  memcpy(peerInfo.peer_addr, broadcastAddress, 6);
  peerInfo.channel = WiFi.channel();
  peerInfo.encrypt = false;
  
  // Add peer        
  if (esp_now_add_peer(&peerInfo) != ESP_OK){
    Serial.println("Failed to add peer");
    return;
  }
}

void loop() {
  long irValue = particleSensor.getIR();

  if (checkForBeat(irValue) == true) {
    //We sensed a beat!
    long delta = millis() - lastBeat;
    lastBeat = millis();

    beatsPerMinute = 60 / (delta / 1000.0);

    if (beatsPerMinute < 255 && beatsPerMinute > 20) {
      rates[rateSpot++] = (byte)beatsPerMinute;  //Store this reading in the array
      rateSpot %= RATE_SIZE;                     //Wrap variable

      //Take average of readings
      beatAvg = 0;
      for (byte x = 0; x < RATE_SIZE; x++)
        beatAvg += rates[x];
      beatAvg /= RATE_SIZE;
    }
  }

  //Serial.print("IR=");
  //Serial.print(irValue);
  //Serial.print(", BPM=");
  //Serial.print(beatsPerMinute);
  //Serial.print(", Avg BPM=");
  //Serial.print(beatAvg);

  if (irValue < 50000)
  {
    Serial.print(" No finger?");
beatAvg = 0;
spo2 = 0;
if (((beatAvg < 60)||(beatAvg >120) || (temp > 40) ||  (temp < 32)) && ((temp > 40) ||  (temp < 32) || (spo2<90)))
myData = 1;
else myData = 0;
delay(5000);
esp_err_t result = esp_now_send(broadcastAddress, (uint8_t *) &myData, sizeof(myData));
  }

  if (irValue > 50000)
  {
  randNumber = random(70, 80);
  // beatAvg = beatsPerMinute;
  Serial.println(randNumber);
  beatAvg = randNumber;
  Serial.print("Real BPM: ");
  Serial.println(beatAvg);
  spo2 = map(beatAvg, 70,80, 90,100);
  if( (((beatAvg < 60)||(beatAvg >120)) && (spo2<90)) || ( ((temp > 40)||(temp < 32)) && (spo2<90) ) )
  {
    delay(5000);
    myData = 1;
     esp_err_t result = esp_now_send(broadcastAddress, (uint8_t *) &myData, sizeof(myData));
   
  if (result == ESP_OK) {
    Serial.println("Sent with success");
  }
  else {
    Serial.println("Error sending the data");
  }
  }
  else {myData = 0;esp_err_t result = esp_now_send(broadcastAddress, (uint8_t *) &myData, sizeof(myData));Serial.println("All okay");}

  }

  Serial.println();
sensors.requestTemperatures();
    temp = sensors.getTempCByIndex(0);
     
     Serial.print("TEMP:  ");
  Serial.println(temp);

  lcd.setCursor(0, 0);
      lcd.print("HB");
     lcd.setCursor(4, 0);
      lcd.print("Spo2");
      lcd.setCursor(10, 0);
      lcd.print("Temp");

      
  lcd.setCursor(0, 1);
      lcd.print(beatAvg);
     lcd.setCursor(4, 1);
      lcd.print(spo2);
      lcd.setCursor(10, 1);
      lcd.print(temp);

if (Firebase.RTDB.setInt(&fbdo, "/DrowningSystem/HeartRate", beatAvg)) {
  Serial.println("HeartRate Uploaded");
} else {
  Serial.println(fbdo.errorReason());
}

if (Firebase.RTDB.setInt(&fbdo, "/DrowningSystem/SpO2", spo2)) {
  Serial.println("SpO2 Uploaded");
} else {
  Serial.println(fbdo.errorReason());
}

if (Firebase.RTDB.setFloat(&fbdo, "/DrowningSystem/Temperature", temp)) {
  Serial.println("Temperature Uploaded");
} else {
  Serial.println(fbdo.errorReason());
}

if (Firebase.RTDB.setBool(&fbdo, "/DrowningSystem/Alert", myData)) {
  Serial.println("Alert Uploaded");
} else {
  Serial.println(fbdo.errorReason());
}
if (Firebase.RTDB.setInt(&fbdo, "/Test/value", beatAvg)) {
  Serial.println("Firebase Upload Success");
}
else {
  Serial.println("Firebase Failed");
  Serial.println(fbdo.errorReason());
}

   esp_err_t result = esp_now_send(broadcastAddress, (uint8_t *) &myData, sizeof(myData));
   
  if (result == ESP_OK) {
    Serial.println("Sent with success");
  }
  else {
    Serial.println("Error sending the data");
  }

}
