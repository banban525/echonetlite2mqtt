# ECHONETLite2MQTT

[![MIT License](https://img.shields.io/github/license/banban525/echonetlite2mqtt)](LICENSE)
[![github build](https://img.shields.io/github/workflow/status/banban525/echonetlite2mqtt/Build%20and%20Publish%20Docker)](https://github.com/banban525/echonetlite2mqtt/actions/workflows/action.yml)
[![Docker Hub](https://img.shields.io/docker/pulls/banban525/echonetlite2mqtt)](https://hub.docker.com/r/banban525/echonetlite2mqtt)

ECHONET Lite to MQTT bridge.

## Description


This application publishes ECHONET Lite devices to MQTT.
And uses MQTT to work with ECHONET Lite devices.
This will allow you to operate your ECHONET Lite device from a smart home application that supports MQTT.

![topimage](example/topimage.jpg)


The supported devices are as follows.

* Home air conditioner (ECHONET Lite class: 0x0130)
* Electric shutter (ECHONET Lite class: 0x0263)
* Electric water heater (ECHONET Lite class: 0x026b)
* JEM-A / HA terminal compatible switch (ECHONET Lite class 0x05fd)

The following devices will be supported in the future.

* Power distribution board (ECHONET Lite class: 0x0287)

## DEMO with Home Assistant

Air conditioner (Physical)

![demo-aircon1](example/demo1.gif)

Air conditioner (Simulator [moekaden](https://github.com/SonyCSL/MoekadenRoom))

![demo-aircon2](example/demo2.gif)

Electric shutter (Simulator [echonet-lite-kaden-emulator](https://github.com/banban525/echonet-lite-kaden-emulator))

![demo-shutter](example/demo3.gif)

JEM-A / HA terminal compatible switch (Simulator [echonet-lite-kaden-emulator](https://github.com/banban525/echonet-lite-kaden-emulator))

![demo-shutter](example/demo4.gif)

## How to use

### Use docker

1. Run the following command
```
docker run -d --net=host -e MQTT_BROKER="mqtt://your.mqtt.brocker" echonetlite2mqtt 
```
2. Open "http://(docker host):3000" in your browser. You can view the detected devices and logs.

Environment Variables

MQTT Options
* MQTT_BROKER ... MQTT Brocker's URL. starts with "mqtt://" or "mqtts://".
* MQTT_OPTION_FILE ... the MQTT option file path. The schema is [MQTT.js](https://github.com/mqttjs/MQTT.js) ClientOptions. (Default: empty)
* MQTT_CA_FILE ... The MQTT CA file path. If this file exists, it will be loaded and set as an "ca" option. (Default: not load)
* MQTT_CERT_FILE ... The MQTT cert file path. If this file exists, it will be loaded and set as an "cert" option. (Default: not load)
* MQTT_KEY_FILE ... The MQTT key file path. If this file exists, it will be loaded and set as an "key" option. (Default: not load)

REST API Options
* REST_API_HOST ... Host IP of the administrator page. If there are multiple IPs, specify them. (Default: 0.0.0.0)
* REST_API_PORT ... Admin page port number. (Default: 3000)

ECHONET Lite Options
* ECHONET_TARGET_NETWORK ... Specify the network for ECHONET Lite in the format "xxx.xxx.xxx.xxx/yy". (Default: Auto)

### Use Node.js

In writing


## HOW TO DEVELOP

In writing


## Third party use

* The images in the repository use materials such as "いらすとや" (https://www.irasutoya.com/).

## LISENCE

[MIT](LICENSE)

## Author

[banban525](https://github.com/banban525)

