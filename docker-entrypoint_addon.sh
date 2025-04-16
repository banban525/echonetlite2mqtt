#!/usr/bin/env bashio


if (bashio::config.has_value 'MQTT_CA_FILE'); then
  export MQTT_CA_FILE=$(bashio::config "MQTT_CA_FILE")
fi
if (bashio::config.has_value 'MQTT_CERT_FILE'); then
  export MQTT_CERT_FILE=$(bashio::config "MQTT_CERT_FILE")
fi
if (bashio::config.has_value 'MQTT_KEY_FILE'); then
  export MQTT_KEY_FILE=$(bashio::config "MQTT_KEY_FILE")
fi
if (bashio::config.has_value 'MQTT_BASE_TOPIC'); then
  export MQTT_BASE_TOPIC=$(bashio::config "MQTT_BASE_TOPIC")
fi
if (bashio::config.has_value 'REST_API_HOST'); then
  export REST_API_HOST=$(bashio::config "REST_API_HOST")
fi
if (bashio::config.has_value 'REST_API_PORT'); then
  export REST_API_PORT=$(bashio::config "REST_API_PORT")
fi
if (bashio::config.has_value 'ECHONET_TARGET_NETWORK'); then
  export ECHONET_TARGET_NETWORK=$(bashio::config "ECHONET_TARGET_NETWORK")
fi
if (bashio::config.has_value 'ECHONET_DEVICE_IP_LIST'); then
  export ECHONET_DEVICE_IP_LIST=$(bashio::config "ECHONET_DEVICE_IP_LIST")
fi
if (bashio::config.has_value 'ECHONET_COMMAND_TIMEOUT'); then
  export ECHONET_COMMAND_TIMEOUT=$(bashio::config "ECHONET_COMMAND_TIMEOUT")
fi
if (bashio::config.has_value 'ECHONET_DISABLE_AUTO_DEVICE_DISCOVERY'); then
  export ECHONET_DISABLE_AUTO_DEVICE_DISCOVERY=$(bashio::config "ECHONET_DISABLE_AUTO_DEVICE_DISCOVERY")
fi
if (bashio::config.has_value 'ECHONET_ALIAS_FILE'); then
  export ECHONET_ALIAS_FILE=$(bashio::config "ECHONET_ALIAS_FILE")
fi
if (bashio::config.has_value 'ECHONET_LEGACY_MULTI_NIC_MODE'); then
  export ECHONET_LEGACY_MULTI_NIC_MODE=$(bashio::config "ECHONET_LEGACY_MULTI_NIC_MODE")
fi
if (bashio::config.has_value 'ECHONET_UNKNOWN_AS_ERROR'); then
  export ECHONET_UNKNOWN_AS_ERROR=$(bashio::config "ECHONET_UNKNOWN_AS_ERROR")
fi

export MQTT_BROKER="${MQTT_PREFIX}${MQTT_HOST}:${MQTT_PORT}";
bashio::log.info "MQTT_BROKER=$MQTT_BROKER"
bashio::log.info "MQTT_USRNAME=$MQTT_USERNAME"


INGRESS_URL=$(bashio::addon.ingress_url)
INGRESS_ENTRY=$(bashio::addon.ingress_entry)
export REST_API_ROOT=$INGRESS_ENTRY
bashio::log.info "REST_API_ROOT=$REST_API_ROOT"

npm run start:built
