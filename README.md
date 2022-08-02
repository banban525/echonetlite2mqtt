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

### Environment Variables and Commandline Parameters

MQTT Options

|  Environment Variables | Commandline Parameter | Description |
| ------------------     | --------------------- | ----------- |
|  `MQTT_BROKER`       | `--MqttBroker`     | MQTT Brocker's URL. starts with "mqtt://" or "mqtts://".  |
|  `MQTT_OPTION_FILE`  | `--MqttOptionFile` | the MQTT option file path. The schema is [MQTT.js](https://github.com/mqttjs/MQTT.js) ClientOptions. (Default: empty)  |
|  `MQTT_CA_FILE`      | `--MqttCaFile`     | The MQTT CA file path. If this file exists, it will be loaded and set as an "ca" option. (Default: not load)  |
|  `MQTT_CERT_FILE`    | `--MqttCertFile`   | The MQTT cert file path. If this file exists, it will be loaded and set as an "cert" option. (Default: not load)  |
|  `MQTT_KEY_FILE`     | `--MqttKeyFile`    |  The MQTT key file path. If this file exists, it will be loaded and set as an "key" option. (Default: not load)  |



REST API Options

|  Environment Variables | Commandline Parameter | Description |
| ------------------     | --------------------- | ----------- |
| `REST_API_HOST` | `--RestApiHost` | Host IP of the administrator page. If there are multiple IPs, specify them. (Default: 0.0.0.0) |
| `REST_API_PORT` | `--RestApiPort` | Admin page port number. (Default: 3000) |


ECHONET Lite Options

|  Environment Variables | Commandline Parameter | Description |
| ------------------     | --------------------- | ----------- |
| `ECHONET_TARGET_NETWORK` | `--echonetTargetNetwork` | Specify the network for ECHONET Lite in the format "000.000.000.000/00". (Default: Auto) |


### Use docker

1. Run the following command
```
docker run -d --net=host -e MQTT_BROKER="mqtt://your.mqtt.brocker" banban525/echonetlite2mqtt 
```
2. Open "http://(docker host):3000" in your browser. You can view the detected devices and logs.


### Use Node.js

1. clone this repository.

```
git clone https://github.com/banban525/echonetlite2mqtt.git
```

2. Run the following command to initialize in ripository root directory.

```
cd echonetlite2mqtt
npm install
cd ./front
npm install
npm run build
cd ..
```

3. Run the following command to start the service.

```
npm start -- --MqttBroker "mqtt://your.mqtt.brocker"
```

## FAQ

### How to change MQTT broker connection options

You can set connection options in the json file.
The schema of the json file is [Client Options in mqtt.js](https://github.com/mqttjs/MQTT.js#client).

For example, if you want to specify a username and password:

1. Save the connection options file in any folder. (Example: /(any folder)/config.json)

```
{
  "port": 1883,
  "username": "your-username",
  "password": "your-password"
}
```

2. [docker]Mount the configuration file with the -v option and set the file path with MQTT_OPTION_FILE.

```shell:commandline
docker run -d --net=host \ 
-v /(any folder)/config.json:/app/config/config.json \
-e MQTT_OPTION_FILE=/app/config/config.json \
-e MQTT_BROKER="mqtt://your.mqtt.brocker" \
banban525/echonetlite2mqtt
```

3. [node.js] Use the `--MqttOptionFile` option to set the file path of the configuration file.

```
npm start -- --MqttBroker "mqtt://your.mqtt.brocker" --MqttOptionFile /(any folder)/config.json
```

### Property values are not updated automatically

#### (1) This application may not work properly if the execution environment has multiple IPs.

If your execution environment has multiple IPs, try the environment variable `ECHONET_TARGET_NETWORK` or the command line parameter `--echonetTargetNetwork` .
* Example 1: `-e ECHONET_TARGET_NETWORK "192.168.1.0/24" `
* Example 2: `--echonetTargetNetwork "192.168.1.0/24"`

#### (2) ECHONET Lite devices may not automatically send property values.

You can reload the properties on the web screen.
If you can reload from the web screen, you can manually update the properties by sending an MQTT topic.

For example, if you want to update the room temperature value of an air conditioner, send the following MQTT topic.
(Replace "fe00-your-device-id-00000000000000" with your device ID.)
```
echonetlite2mqtt/elapi/v1/devices/fe00-your-device-id-00000000000000/properties/roomTemperature/request
```

### I want to specify the set temperature of the air conditioner in units of 0.5 degrees.

This is not possible as the ECHONET Lite "Set temperature value" (ja:温度設定値) specification is in units of 1 degree.

See specs below.
(ja) https://echonet.jp/spec_g/#standard-05
(en) https://echonet.jp/spec-en/#standard-05

## Third party use

* The images in the repository use materials such as "いらすとや" (https://www.irasutoya.com/).

## LISENCE

[MIT](LICENSE)

## Author

[banban525](https://github.com/banban525)

