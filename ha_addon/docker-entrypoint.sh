#!/usr/bin/with-contenv bashio

export MQTT_OPTION_FILE=/localconfig/echonetlite2mqtt/config.json

declare MQTT_PREFIX
declare MQTT_HOST
declare MQTT_PORT
declare MQTT_USERNAME
declare MQTT_PASSWORD
declare MQTT_BROKER

if ! bashio::services.available "mqtt"; then
    bashio::log.error "No internal MQTT service found"
else
    bashio::log.info "MQTT service found, fetching credentials ..."
    if bashio::var.true "$(bashio::services 'mqtt' 'ssl')"; then
      MQTT_PREFIX="mqtts://";
    else
      MQTT_PREFIX="mqtt://";
    fi
    MQTT_HOST=$(bashio::services mqtt "host")
    MQTT_PORT=$(bashio::services mqtt "port")
    MQTT_USERNAME=$(bashio::services mqtt "username")
    MQTT_PASSWORD=$(bashio::services mqtt "password")
fi

if (! bashio::config.is_empty 'mqtt'); then
  if (bashio::config.true 'mqtt.ssl'); then
    MQTT_PREFIX="mqtts://";
  else
    MQTT_PREFIX="mqtt://";
  fi
  if (bashio::config.has_value 'mqtt.host'); then
    MQTT_HOST=$(bashio::config "mqtt.host")
  fi
  if (bashio::config.has_value 'mqtt.port'); then
    MQTT_PORT=$(bashio::config "mqtt.port")
  fi
  if (bashio::config.has_value 'mqtt.username'); then
    MQTT_USERNAME=$(bashio::config "mqtt.username")
  fi
  if (bashio::config.has_value 'mqtt.password'); then
    MQTT_PASSWORD=$(bashio::config "mqtt.password")
  fi
fi

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

mkdir -p `dirname $MQTT_OPTION_FILE`

cat << EOD > $MQTT_OPTION_FILE
{
  "port": ${MQTT_PORT},
  "username": "${MQTT_USERNAME}",
  "password": "${MQTT_PASSWORD}"
}
EOD

INGRESS_URL=$(bashio::addon.ingress_url)
INGRESS_ENTRY=$(bashio::addon.ingress_entry)
export REST_API_ROOT=$INGRESS_ENTRY
bashio::log.info "REST_API_ROOT=$REST_API_ROOT"

npm run start:built
