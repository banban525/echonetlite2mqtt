# ECHONETLite2MQTT

[![MIT License](https://img.shields.io/github/license/banban525/echonetlite2mqtt)](LICENSE)
[![GitHub Workflow Build Status](https://img.shields.io/github/actions/workflow/status/banban525/echonetlite2mqtt/action.yml)
](https://github.com/banban525/echonetlite2mqtt/actions/workflows/action.yml)
[![GitHub Workflow Test Status](https://img.shields.io/github/actions/workflow/status/banban525/echonetlite2mqtt/test.yml?label=test)
](https://github.com/banban525/echonetlite2mqtt/actions/workflows/test.yml)
[![Docker Hub](https://img.shields.io/docker/pulls/banban525/echonetlite2mqtt)](https://hub.docker.com/r/banban525/echonetlite2mqtt)

ECHONET Lite to MQTT bridge.

## Description


This application publishes ECHONET Lite devices to MQTT.
And uses MQTT to work with ECHONET Lite devices.
This will allow you to operate your ECHONET Lite device from a smart home application that supports MQTT.

![topimage](images/topimage.jpg)


The supported devices are as follows.
* Emergency button (0x0003)
* Human detection sensor (0x0007)
* Temperature sensor (0x0011)
* Humidity sensor (0x0012)
* Bath heating status sensor (0x0016)
* CO2 sensor (0x001B)
* VOC sensor (0x001D)
* Electric energy sensor (0x0022)
* Current sensor (0x0023)
* Illuminance sensor (0x00D0)
* Home air conditioner (0x0130)
* Ventilation fan (0x0133)
* Air conditioner ventilation fan (0x0134)
* Air cleaner (0x0135)
* Package-type commercial air conditioner (indoor unit) (except those for facilities) (0x0156)
* Package-type commercial air conditioner (outdoor unit) (0x0157)
* Electrically operated rain sliding door/shutter (0x0263)
* Electrically operated window (0x0265)
* Electric water heater (0x026B)
* Electric lock (0x026F)
* Instantaneous water heater (0x0272)
* Bathroom heater dryer (0x0273)
* Household solar power generation (0x0279)
* Cold or hot water heat source equipment (0x027A)
* Floor heater (0x027B)
* Fuel cell (0x027C)
* Storage battery (0x027D)
* EV charger and discharger (0x027E)
* Watt-hour meter (0x0280)
* Water flowmeter (0x0281)
* Gas meter (0x0282)
* Power distribution board metering (0x0287)
* Low-voltage smart electric energy meter (0x0288)
* High-voltage smart electric energy meter (0x028A)
* Smart electric energy meter for sub-metering (0x028D)
* General lighting (0x0290)
* Mono functional lighting (0x0291)
* EV Charger (0x02A1)
* Lighting system (0x02A3)
* Extended lighting system (0x02A4)
* Hybrid water heater (0x02A6)
* Refrigerator (0x03B7)
* Cooking heater (0x03B9)
* Rice cooker (0x03BB)
* Commercial showcase (0x03CE)
* Washer and dryer (0x03D3)
* Commercial show case outdoor unit (0x03D4)
* Switch (supporting JEM-A/HA terminals) (0x05FD)
* Controller (0x05FF)
* Television (0x0602)


## DEMO

![demo-webui](demo/demo_webUI.gif)

![demo-aircon](demo/demo-AirCnditioner-daikin.gif)

### [more demo movies and settings examples](demo/demo.md)

## How to use

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
```

3. Run the following command to start the service.

```
npm start -- --MqttBroker "mqtt://your.mqtt.brocker"
```

4. Open "http://localhost:3000" in your browser. You can view the detected devices and logs.



### Environment Variables and Commandline Parameters

MQTT Options

|  Environment Variables | Commandline Parameter | Description |
| ------------------     | --------------------- | ----------- |
|  `MQTT_BROKER`       | `--MqttBroker`     | MQTT Brocker's URL. starts with "mqtt://" or "mqtts://".  |
|  `MQTT_OPTION_FILE`  | `--MqttOptionFile` | the MQTT option file path. The schema is [MQTT.js](https://github.com/mqttjs/MQTT.js) ClientOptions. (Default: empty)  |
|  `MQTT_CA_FILE`      | `--MqttCaFile`     | The MQTT CA file path. If this file exists, it will be loaded and set as an "ca" option. (Default: not load)  |
|  `MQTT_CERT_FILE`    | `--MqttCertFile`   | The MQTT cert file path. If this file exists, it will be loaded and set as an "cert" option. (Default: not load)  |
|  `MQTT_KEY_FILE`     | `--MqttKeyFile`    |  The MQTT key file path. If this file exists, it will be loaded and set as an "key" option. (Default: not load)  |
| `MQTT_BASE_TOPIC`    | `--MqttBaseTopic`  | MQTT topic prefix. (Default:"echonetlite2mqtt/elapi/v2/devices") |


REST API Options

|  Environment Variables | Commandline Parameter | Description |
| ------------------     | --------------------- | ----------- |
| `REST_API_HOST` | `--RestApiHost` | Host IP of the administrator page. If there are multiple IPs, specify them. (Default: 0.0.0.0) |
| `REST_API_PORT` | `--RestApiPort` | Admin page port number. (Default: 3000) |


ECHONET Lite Options

|  Environment Variables | Commandline Parameter | Description |
| ------------------     | --------------------- | ----------- |
| `ECHONET_TARGET_NETWORK` | `--echonetTargetNetwork` | Specify the network for ECHONET Lite in the format "000.000.000.000/00". (Default: Auto) |
| `ECHONET_ALIAS_FILE`   | `--echonetAliasFile`  | The file path for alias option file. (Defalt: (empty)) |
| `ECHONET_INTERVAL_TO_GET_PROPERTIES` | `--echonetIntervalToGetProperties` | Specifies the time interval for acquiring ECHONET Lite properties. (Unit: ms) (Default: 100) |

### Alias Option File Format

You can alias device Ids using `ECHONET_ALIAS_FILE` ( or `--echonetAliasFile` ) option.
This option specifies the path of the Alias Option File.

The Alias ​​Option File is a Json file with the following format:
```
{
  "aliases":[
    {
      "id":"fe00-your-device-id-00000000000000",
      "name":"alias name"
    },

...

    {
      "id":"fe0000251c4190000081e5bb0000000000",
      "name":"shutter"
    },
    {
      "id":"fe000008dcfe23ba1ff000000000000000",
      "name":"airconditioner-living"
    }
  ]
}
```


## How to migrate from version 1.x to version 2.x

the major changes from version 1.x to version 2.x:
* (1) Default MQTT topic name changed from "echonetlite2mqtt/elapi/v1" to "echonetlite2mqtt/elapi/v2".
* (2) The Id has changed on some devices.
* (3) The property "schema" specification changed.
* (4) Redesigned the web front end.

If you want to keep compatibility with version 1.x as much as possible, you can use the `MQTT_BASE_TOPIC` (or `--MqttBaseTopic` ) option for (1) and the `ECHONET_ALIAS_FILE` ( or `--echonetAliasFile` ) option for (2).

```
docker run -d --net=host -e MQTT_BROKER="mqtt://your.mqtt.brocker" -e MQTT_BASE_TOPIC="echonetlite2mqtt/elapi/v1/devices" -e ECHONET_ALIAS_FILE=/app/configure/alias.json -v (some folder):/app/configure banban525/echonetlite2mqtt 

or 

npm start -- --MqttBroker "mqtt://your.mqtt.brocker" --MqttBaseTopic "echonetlite2mqtt/elapi/v1/devices" --echonetAliasFile ./alias.json
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
echonetlite2mqtt/elapi/v2/devices/fe00-your-device-id-00000000000000/properties/roomTemperature/request
```

### I want to specify the set temperature of the air conditioner in units of 0.5 degrees.

This is not possible as the ECHONET Lite "Set temperature value" (ja:温度設定値) specification is in units of 1 degree.

See specs below.
* (ja) https://echonet.jp/spec_g/#standard-05
* (en) https://echonet.jp/spec-en/#standard-05

## Third party use

* The images in the repository use materials such as "いらすとや" (https://www.irasutoya.com/).
* Machine Readable Appendix (MRA) Version 1.1.1 is ​​used as the definition of ECHONET Lite. (https://echonet.jp/spec_mra_rp1/)

## LISENCE

[MIT](LICENSE)

## Author

[banban525](https://github.com/banban525)

