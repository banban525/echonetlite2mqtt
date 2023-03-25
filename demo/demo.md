# Demo movies and settings examples

## Air conditioner ([Daikin AN-22YRS-W](https://www.ac.daikin.co.jp/roomaircon/2021/products/r_series))

![demo-aircon1](demo-AirCnditioner-daikin.gif)

### settings examples for Home Assistant

```yml
mqtt:
  climate:
    - name: "air-conditioner"
      icon: mdi:air-conditioner
      modes:
        - "off"
        - "cool"
        - "heat"
        - "dry"
        - "auto"
      mode_command_template: >-
        {% if value == 'off' %}
          {"operationStatus":"false"}
        {% elif value == 'cool' %}
          {"operationStatus":"true","operationMode":"cooling"}
        {% elif value == 'heat' %}
          {"operationStatus":"true","operationMode":"heating"}
        {% elif value == 'dry' %}
          {"operationStatus":"true","operationMode":"dehumidification"}
        {% elif value == 'auto' %}
          {"operationStatus":"true","operationMode":"auto"}
        {% else %}
          {}
        {% endif %}
      mode_command_topic: "echonetlite2mqtt/elapi/v2/devices/fe00-your-device-id-00000000000000/properties/set"
      temperature_state_topic: "echonetlite2mqtt/elapi/v2/devices/fe00-your-device-id-00000000000000/properties/targetTemperature"
      temperature_command_topic: "echonetlite2mqtt/elapi/v2/devices/fe00-your-device-id-00000000000000/properties/targetTemperature/set"
      current_temperature_topic: "echonetlite2mqtt/elapi/v2/devices/fe00-your-device-id-00000000000000/properties/roomTemperature"
      mode_state_topic: "echonetlite2mqtt/elapi/v2/devices/fe00-your-device-id-00000000000000/properties"
      mode_state_template: >-
        {% if value_json.operationStatus == 'false' %}
          off
        {% elif value_json.operationMode == 'cooling' %}
          cool
        {% elif value_json.operationMode == 'heating' %}
          heat
        {% elif value_json.operationMode == 'dehumidification' %}
          dry
        {% elif value_json.operationMode == 'auto' %}
          auto
        {% else %}
          off
        {% endif %}
```



## Air conditioner ([Mitsubishi MSZ-X255-W](https://www.mitsubishielectric.co.jp/ldg/wink/ssl/displayProduct.do?pid=251963&ccd=1040105711) with [MAC-900IF](https://www.mitsubishielectric.co.jp/ldg/wink/ssl/displayProduct.do?pid=310070))

![demo-aircon1](demo-AirCnditioner-mitsubishi.gif)

### settings examples for Home Assistant

```yml
mqtt:
  climate:
    - name: "air-conditioner"
      icon: mdi:air-conditioner
      modes:
        - "off"
        - "cool"
        - "heat"
        - "dry"
      mode_command_template: >-
        {% if value == 'off' %}
          {"operationStatus":"false"}
        {% elif value == 'cool' %}
          {"operationStatus":"true","operationMode":"cooling"}
        {% elif value == 'heat' %}
          {"operationStatus":"true","operationMode":"heating"}
        {% elif value == 'dry' %}
          {"operationStatus":"true","operationMode":"dehumidification"}
        {% else %}
          {}
        {% endif %}
      mode_command_topic: "echonetlite2mqtt/elapi/v2/devices/fe00-your-device-id-00000000000000/properties/set"
      temperature_state_topic: "echonetlite2mqtt/elapi/v2/devices/fe00-your-device-id-00000000000000/properties/targetTemperature"
      temperature_command_topic: "echonetlite2mqtt/elapi/v2/devices/fe00-your-device-id-00000000000000/properties/targetTemperature/set"
      current_temperature_topic: "echonetlite2mqtt/elapi/v2/devices/fe00-your-device-id-00000000000000/properties/roomTemperature"
      mode_state_topic: "echonetlite2mqtt/elapi/v2/devices/fe00-your-device-id-00000000000000/properties"
      mode_state_template: >-
        {% if value_json.operationStatus == 'false' %}
          off
        {% elif value_json.operationMode == 'cooling' %}
          cool
        {% elif value_json.operationMode == 'heating' %}
          heat
        {% elif value_json.operationMode == 'dehumidification' %}
          dry
        {% else %}
          off
        {% endif %}
```


## Air conditioner (Simulator [moekaden](https://github.com/SonyCSL/MoekadenRoom))

![demo-aircon2](demo-AirCnditioner-simulator.gif)

### settings examples for Home Assistant

```yml
mqtt:
  climate:
    - name: "emulator-aircon"
      icon: mdi:air-conditioner
      modes:
        - "off"
        - "cool"
        - "heat"
        - "dry"
        - "fan_only"
        - "auto"
      mode_command_template: >-
        {% if value == 'off' %}
          {"operationStatus":"false"}
        {% elif value == 'cool' %}
          {"operationStatus":"true","operationMode":"cooling"}
        {% elif value == 'heat' %}
          {"operationStatus":"true","operationMode":"heating"}
        {% elif value == 'dry' %}
          {"operationStatus":"true","operationMode":"dehumidification"}
        {% elif value == 'fan_only' %}
          {"operationStatus":"true","operationMode":"circulation"}
        {% elif value == 'auto' %}
          {"operationStatus":"true","operationMode":"auto"}
        {% else %}
          {}
        {% endif %}
      mode_command_topic: "echonetlite2mqtt/elapi/v2/devices/fe00000000000000000000000000000000_013001/properties/set"
      temperature_state_topic: "echonetlite2mqtt/elapi/v2/devices/fe00000000000000000000000000000000_013001/properties/targetTemperature"
      temperature_command_topic: "echonetlite2mqtt/elapi/v2/devices/fe00000000000000000000000000000000_013001/properties/targetTemperature/set"
      current_temperature_topic: "echonetlite2mqtt/elapi/v2/devices/fe00000000000000000000000000000000_001101/properties/value"
      mode_state_topic: "echonetlite2mqtt/elapi/v2/devices/fe00000000000000000000000000000000_013001/properties"
      mode_state_template: >-
        {% if value_json.operationStatus == 'false' %}
          off
        {% elif value_json.operationMode == 'cooling' %}
          cool
        {% elif value_json.operationMode == 'heating' %}
          heat
        {% elif value_json.operationMode == 'dehumidification' %}
          dry
        {% elif value_json.operationMode == 'circulation' %}
          fan_only
        {% elif value_json.operationMode == 'auto' %}
          auto
        {% else %}
          off
        {% endif %}
```


## Electric shutter ([LIXIL electric window shutter](https://www.lixil.co.jp/lineup/window/jshutter/))


![demo-shutter](demo_shutter_with_HomeAssistant.gif)

### settings examples for Home Assistant

```yml
mqtt:
  cover:
    - name: shutter1
      unique_id: shutter1
      command_topic: "echonetlite2mqtt/elapi/v2/devices/fe00-your-device-id-00000000000000/properties/openCloseOperation/set"
      device_class: shutter
      payload_close: "close"
      payload_open: "open"
      payload_stop: "stop"
      state_closed: "fullyClosed"
      state_closing: "closing"
      state_open: "fullyOpen"
      state_opening: "opening"
      state_stopped: "stoppedHalfway"
      state_topic: "echonetlite2mqtt/elapi/v2/devices/fe00-your-device-id-00000000000000/properties/openCloseStatus"
      optimistic: true
```



## Electric shutter (Simulator [echonet-lite-kaden-emulator](https://github.com/banban525/echonet-lite-kaden-emulator))

![demo-shutter](demo_shutter_simulator.gif)

### settings examples for Home Assistant

```yml
mqtt:
  cover:
    - name: shutter1
      command_topic: "echonetlite2mqtt/elapi/v2/devices/fe00-your-device-id-00000000000000/properties/openCloseOperation/set"
      device_class: shutter
      payload_close: "close"
      payload_open: "open"
      payload_stop: "stop"
      state_closed: "fullyClosed"
      state_closing: "closing"
      state_open: "fullyOpen"
      state_opening: "opening"
      state_stopped: "stoppedHalfway"
      state_topic: "echonetlite2mqtt/elapi/v2/devices/fe00-your-device-id-00000000000000/properties/openCloseStatus"
```



## Electric Window ([LIXIL Electric Window](https://www.lixil.co.jp/lineup/window/s/electric-items/))

![demo-shutter](demo-window.gif)


### settings examples for Home Assistant

```yml
mqtt:
  cover:
    - name: window1
      unique_id: window1
      command_topic: "echonetlite2mqtt/elapi/v2/devices/fe00-your-device-id-00000000000000/properties/openCloseOperation/set"
      device_class: window
      payload_close: "close"
      payload_open: "open"
      payload_stop: "stop"
      state_closed: "fullyClosed"
      state_closing: "closing"
      state_open: "fullyOpen"
      state_opening: "opening"
      state_stopped: "stoppedHalfway"
      state_topic: "echonetlite2mqtt/elapi/v2/devices/fe00-your-device-id-00000000000000/properties/openCloseStatus"
      optimistic: true
```






## Electric Water Heater ([Mitsubishi electric water heater SRT-S375A](https://www.mitsubishielectric.co.jp/ldg/wink/ssl/displayProduct.do?pid=309056&ccd=10501120) with [GT-HEM4](https://www.mitsubishielectric.co.jp/ldg/wink/ssl/displayProduct.do?pid=309179&ccd=10501170) )


![demo-waterheater](demo_waterheater.gif)

### settings examples for Home Assistant

```yml
mqtt:
  sensor:
   - name: "WaterHeater_Remains"
     state_topic: "echonetlite2mqtt/elapi/v2/devices/fe00-your-device-id-00000000000000/properties/remainingWater"
     unit_of_measurement: "L"
     icon: mdi:water-boiler
   - name: "WaterHeater_State"
     state_topic: "echonetlite2mqtt/elapi/v2/devices/fe00-your-device-id-00000000000000/properties/bathOperationStatusMonitor"
  switch:
    - name: "WaterHeater_Auto"
      unique_id: waterHeater_auto
      state_topic: "echonetlite2mqtt/elapi/v2/devices/fe00-your-device-id-00000000000000/properties"
      value_template: >-
        {% if value_json.bathOperationStatusMonitor == 'noOperation' %}
          false
        {% else %}
          true
        {% endif %}
      command_topic: "echonetlite2mqtt/elapi/v2/devices/fe00-your-device-id-00000000000000/properties/automaticBathOperation/set"
      payload_on: "true"
      payload_off: "false"
      state_on: "true"
      state_off: "false"
      optimistic: false
      qos: 0
      retain: false
```



## Power Distribution Board Metering ([Panasonic BHM87261B2](https://www2.panasonic.biz/scvb/a2A/opnItemDetail?use_obligation=scva&contents_view_flg=1&catalog_view_flg=1&item_cd=BHM87261B2&item_no=BHM87261B2&b_cd=301&hinban_kbn=1&s_hinban_key=BHM87261B2&s_end_flg=&vcata_flg=1))

![demo-energy](demo-energy.jpg) ![demo-energy](demo-energy2.jpg)


### settings examples for Home Assistant

```yml
mqtt:
  sensor:
   - name: "energy channel 1"
     unique_id: energy_channel1
     state_topic: "echonetlite2mqtt/elapi/v2/devices/fe00-your-device-id-00000000000000/properties/measurementChannel1"
     unit_of_measurement: "kWh"
     value_template: "{{ value_json.electricEnergy * 0.01 }}"
     state_class: "total_increasing"
     device_class: "energy"
   - name: "Energy StudyRoom Aircon"
     unique_id: energy_channel2
     state_topic: "echonetlite2mqtt/elapi/v2/devices/fe00-your-device-id-00000000000000/properties/measurementChannel2"
     unit_of_measurement: "kWh"
     value_template: "{{ value_json.electricEnergy * 0.01 }}"
     state_class: "total_increasing"
     device_class: "energy"
     // ... and more
sensor:
 - platform: statistics
   unique_id: energy_channel1_instantaneous
   name: "energy channel 1"
   entity_id: sensor.energy_channel1
   state_characteristic: change
   sampling_size: 2
   precision: 2
 - platform: statistics
   unique_id: energy_channel2_instantaneous
   name: "energy channel 2"
   entity_id: sensor.energy_channel2
   state_characteristic: change
   sampling_size: 2
   precision: 2
   // ... and more

```





## JEM-A / HA terminal compatible switch (Simulator [echonet-lite-kaden-emulator](https://github.com/banban525/echonet-lite-kaden-emulator))

![demo-jem-a-switch](demo-jem-a-switch.gif)


### settings examples for Home Assistant

```yml
mqtt:
  lock:
    - name: Frontdoor-lock
      state_topic: "echonetlite2mqtt/elapi/v2/devices/fe00-your-device-id-00000000000000/properties/operationStatus"
      command_topic: "echonetlite2mqtt/elapi/v2/devices/fe00-your-device-id-00000000000000/properties/operationStatus/set"
      payload_lock: "false"
      payload_unlock: "true"
      state_locked: "false"
      state_unlocked: "true"
      optimistic: false
      qos: 1
      retain: true
```

