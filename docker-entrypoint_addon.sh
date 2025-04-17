#!/usr/bin/env bashio

if (bashio::config.has_value 'mqtt.broker'); then
  export MQTT_BROKER=$(bashio::config "mqtt.broker")
fi
if (bashio::config.has_value 'MQTT_OPTION_FILE'); then
  export MQTT_OPTION_FILE=/addon_config/$(bashio::config "MQTT_OPTION_FILE")
fi
if (bashio::config.has_value 'mqtt.ca_file'); then
  export MQTT_CA_FILE=/ssl/$(bashio::config "mqtt.ca_file")
fi
if (bashio::config.has_value 'mqtt.cert_file'); then
  export MQTT_CERT_FILE=/ssl/$(bashio::config "mqtt.cert_file")
fi
if (bashio::config.has_value 'mqtt.key_file'); then
  export MQTT_KEY_FILE=/ssl/$(bashio::config "mqtt.key_file")
fi
if (bashio::config.has_value 'mqtt.base_topic'); then
  export MQTT_BASE_TOPIC=$(bashio::config "mqtt.base_topic")
fi
if (bashio::config.has_value 'echonet.target_network'); then
  export ECHONET_TARGET_NETWORK=$(bashio::config "echonet.target_network")
fi
if (bashio::config.has_value 'echonet.device_ip_list'); then
  export ECHONET_DEVICE_IP_LIST=$(bashio::config "echonet.device_ip_list")
fi
if (bashio::config.has_value 'echonet.command_timeout'); then
  export ECHONET_COMMAND_TIMEOUT=$(bashio::config "echonet.command_timeout")
fi
if (bashio::config.has_value 'echonet.disable_auto_device_discovery'); then
  export ECHONET_DISABLE_AUTO_DEVICE_DISCOVERY=$(bashio::config "echonet.disable_auto_device_discovery")
fi
if (bashio::config.has_value 'echonet.alias_file'); then
  export ECHONET_ALIAS_FILE=/addon_config/$(bashio::config "echonet.alias_file")
fi
if (bashio::config.has_value 'echonet.legacy_multi_nic_mode'); then
  export ECHONET_LEGACY_MULTI_NIC_MODE=$(bashio::config "echonet.legacy_multi_nic_mode")
fi
if (bashio::config.has_value 'echonet.unknown_as_error'); then
  export ECHONET_UNKNOWN_AS_ERROR=$(bashio::config "echonet.unknown_as_error")
fi



INGRESS_PORT=$(bashio::addon.ingress_port)
INGRESS_URL=$(bashio::addon.ingress_url)
INGRESS_ENTRY=$(bashio::addon.ingress_entry)
export REST_API_PORT=INGRESS_PORT
export REST_API_ROOT=$INGRESS_ENTRY

npm run start:built
