#!/usr/bin/env bashio

if bashio::services.available "mqtt"; then
    bashio::log.info "MQTT service found, fetching credentials ..."
    if bashio::var.true "$(bashio::services 'mqtt' 'ssl')"; then
      MQTT_PREFIX="mqtts://";
    else
      MQTT_PREFIX="mqtt://";
    fi
    MQTT_HOST=$(bashio::services mqtt "host")
    export MQTT_PORT=$(bashio::services mqtt "port")
    export MQTT_USERNAME=$(bashio::services mqtt "username")
    export MQTT_PASSWORD=$(bashio::services mqtt "password")
    export MQTT_BROKER="${MQTT_PREFIX}${MQTT_HOST}:${MQTT_PORT}";
fi

if (bashio::config.has_value 'MQTT_BROKER'); then
  export MQTT_BROKER=$(bashio::config "MQTT_BROKER")
fi
if (bashio::config.has_value 'MQTT_OPTION_FILE'); then
  export MQTT_OPTION_FILE=/addon_config/$(bashio::config "MQTT_OPTION_FILE")
fi
if (bashio::config.has_value 'MQTT_CA_FILE'); then
  export MQTT_CA_FILE=/ssl/$(bashio::config "MQTT_CA_FILE")
fi
if (bashio::config.has_value 'MQTT_CERT_FILE'); then
  export MQTT_CERT_FILE=/ssl/$(bashio::config "MQTT_CERT_FILE")
fi
if (bashio::config.has_value 'MQTT_KEY_FILE'); then
  export MQTT_KEY_FILE=/ssl/$(bashio::config "MQTT_KEY_FILE")
fi
if (bashio::config.has_value 'MQTT_BASE_TOPIC'); then
  export MQTT_BASE_TOPIC=$(bashio::config "MQTT_BASE_TOPIC")
fi
if (bashio::config.has_value 'MQTT_USERNAME'); then
  export MQTT_USERNAME=$(bashio::config "MQTT_USERNAME")
fi
if (bashio::config.has_value 'MQTT_PASSWORD'); then
  export MQTT_PASSWORD=$(bashio::config "MQTT_PASSWORD")
fi
if (bashio::config.has_value 'MQTT_PORT'); then
  export MQTT_PORT=$(bashio::config "MQTT_PORT")
fi
if (bashio::config.has_value 'MQTT_CLIENT_ID'); then
  export MQTT_CLIENT_ID=$(bashio::config "MQTT_CLIENT_ID")
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
  export ECHONET_ALIAS_FILE=/addon_config/$(bashio::config "ECHONET_ALIAS_FILE")
fi
if (bashio::config.has_value 'ECHONET_LEGACY_MULTI_NIC_MODE'); then
  export ECHONET_LEGACY_MULTI_NIC_MODE=$(bashio::config "ECHONET_LEGACY_MULTI_NIC_MODE")
fi
if (bashio::config.has_value 'ECHONET_UNKNOWN_AS_ERROR'); then
  export ECHONET_UNKNOWN_AS_ERROR=$(bashio::config "ECHONET_UNKNOWN_AS_ERROR")
fi



INGRESS_PORT=$(bashio::addon.ingress_port)
INGRESS_URL=$(bashio::addon.ingress_url)
INGRESS_ENTRY=$(bashio::addon.ingress_entry)
export REST_API_PORT=$INGRESS_PORT
export REST_API_ROOT=$INGRESS_ENTRY

npm run start:built
