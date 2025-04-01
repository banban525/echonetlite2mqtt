import { OpenAPIV3_1 } from "openapi-types";
import { DeviceStore } from "./DeviceStore";
import { EchoNetOpenApiConverter } from "./EchoNetPropertyConverter";
import { Device, Property } from "./Property";
import { ElDeviceDescription } from "./MraTypes";
import { URL } from "url";


export class RestApiOpenApiConverter{

  echoNetOpenApiConverter = new EchoNetOpenApiConverter();
  

  createOpenApiJson = (deviceStore:DeviceStore): OpenAPIV3_1.Document =>
  {
    const result:OpenAPIV3_1.Document = {
      openapi:'3.1.0',
      info:{
        title:'ECHONETLite2MQTT Web API',
        version: "1.1.0"
      },
      paths: {},
      webhooks:{
        onMessage:this.getWebSocketWebHook()
      },
      components:{
        schemas:{},
        responses:{
          NotFound:{
            description:""
          }
        }
      }
    };

    if(result.paths === undefined)
    {
      result.paths = {};
    }
    result.paths[`/api/status`] = this.getSystemStatus();
    result.paths[`/api/logs`] = this.getLogs();
    result.paths[`/api/serverevents`] = this.getServerEvents();

    result.paths['/elapi'] = this.getApiVersionList();
    result.paths['/elapi/v1'] = this.GetServiceList();
    result.paths['/elapi/v1/devices'] = this.getDeviceList();

    // デバイスによって形が違うのでデバイスのエンドポイントごとに定義を作る
    for(const device of deviceStore.getAll())
    {
      result.paths[`/elapi/v1/devices/${device.name}`] = this.getDeviceInfo(device);
      result.paths[`/elapi/v1/devices/${device.name}/properties`] = this.getDeviceProperties(device);
      result.paths[`/elapi/v1/devices/${device.name}/properties/request`] = this.getDeviceRequestProperties(device);

      result.paths[`/elapi/v1/devices/${device.name}/properties/{propertyName}`] = this.getDeviceGetSetProperty(device);
      result.paths[`/elapi/v1/devices/${device.name}/properties/{propertyName}/request`] = this.getDeviceRequestProperty(device);

      if(device.id !== device.name)
      {
        result.paths[`/elapi/v1/devices/${device.id}`] = result.paths[`/elapi/v1/devices/${device.name}`];
        result.paths[`/elapi/v1/devices/${device.id}/properties`] = result.paths[`/elapi/v1/devices/${device.name}/properties`];
        result.paths[`/elapi/v1/devices/${device.id}/properties/request`] = result.paths[`/elapi/v1/devices/${device.name}/properties/request`];

        result.paths[`/elapi/v1/devices/${device.id}/properties/{propertyName}`] = result.paths[`/elapi/v1/devices/${device.name}/properties/{propertyName}`];
        result.paths[`/elapi/v1/devices/${device.id}/properties/{propertyName}/request`] = result.paths[`/elapi/v1/devices/${device.name}/properties/{propertyName}/request`];
      }
    }

    
    if(result.components!=null && result.components.schemas!=null)
    {
      result.components.schemas["ApiDeviceSummary"] = this.getComponentsApiDeviceSummary();
      result.components.schemas["ApiDevice"] = this.getComponentsApiDevice();
      result.components.schemas["ApiDeviceProperty"] = this.getComponentsApiDeviceProperty();
      result.components.schemas["ApiDevicePropertyValue"] = this.getComponentsApiDevicePropertyValue();


      // デバイスタイプごとのオブジェクト型を追加
      const allDevices = deviceStore.getAll();
      const deviceTypes = Array.from(new Set(allDevices.map(_=>_.deviceType)));
      for(const deviceType of deviceTypes)
      {
        result.components.schemas[deviceType+"Object"] = this.getComponentsDeviceTypeObject(allDevices.find(_=>_.deviceType === deviceType)!.schema);

        result.components.schemas["ApiDevice_"+deviceType] = this.getComponentsApiDeviceForDeviceType(allDevices.find(_=>_.deviceType === deviceType)!.schema);
      }
    }
    
    return result;
  }

  
  getComponentsApiDeviceSummary = ():OpenAPIV3_1.SchemaObject =>
  {
    return {
      type:'object',
      description: 'Device summary information',
      properties:{
        id:{type:'string', description:'Device-specific ID'},
        name:{type:'string'},
        deviceType:{type:'string', description:'Device type'},
        eoj:{type:'string', description:'ECHONET Lite object code'},
        ip:{type:'string', description:'IP address of the device'},
        mqttTopics:{type:'string', description:'Base MQTT topic for the device'},
        protocol:{
          type:'object',
          properties:{
            type:{type:'string', description:'ECHONET Lite version number'},
            version:{type:'string', description: 'Appendix release number'}
          },
          required:['type','version']
        },
        manufacturer:{
          description: 'Manufacturer information',
          type:'object',
          properties:{
            code:{type:'string', description:'Manufacturer code'},
            descriptions:{
              description: 'Manufacturer name',
              type:'object',
              properties:{
                ja:{type:'string'},
                en:{type:'string'}
              },
              required:['ja','en']
            }
          },
          required:['code','descriptions']
        }
      },
      required:['id','name','deviceType','eoj','ip','mqttTopics','protocol','manufacturer']
    };
  }

  getComponentsApiDevice = ():OpenAPIV3_1.SchemaObject =>
  {
    return {
      type:'object',
      description: 'Device information',
      properties:{
        id:{type:'string', description:'Device-specific ID'},
        eoj:{type:'string', description:'ECHONET Lite object code'},
        name:{type:'string', description:'Device id or alias name'},
        actions:{
          type:'array',
          description:'This property is unused. Always an empty array.',
          items:{
            type:'object',
          }
        },
        deviceType:{type:'string', description:'Device type'},
        events:{ type:'array', items:{type:'object'}, description:'This property is unused. Always an empty array.'},
        descriptions:{
          type:'object',
          properties:{
            ja:{type:'string'},
            en:{type:'string'}
          },
          required:['ja','en']
        },
        properties:{
          type:'array', 
          items:{$ref:'#/components/schemas/ApiDeviceProperty'}, 
        },
        ip:{type:'string', description:'IP address of the device'},
        mqttTopics:{type:'string', description:'Base MQTT topic for the device'}
      },
      required:['id','eoj','name','actions','deviceType','events','descriptions','properties','ip','mqttTopics']
    };
  }

  
  getComponentsApiDeviceForDeviceType = (schema:ElDeviceDescription):OpenAPIV3_1.SchemaObject =>
  {
    const valuesSchema:OpenAPIV3_1.SchemaObject = {
      type:'object', 
      description:'Current property values. The key is the property name. The value is the json value.',
      properties:{},
      required:[]
    };
    for(const prop of schema.elProperties)
    {
      if(valuesSchema.properties===undefined){ continue; }
      if(valuesSchema.required===undefined){ continue; }

      valuesSchema.properties[prop.shortName] = {
        $ref:'#/components/schemas/ApiDevicePropertyValue'
      }
      valuesSchema.required.push(prop.shortName);
    }

    return {
      description: 'Device information for ' + schema.shortName,
      allOf:[
        {$ref:'#/components/schemas/ApiDevice'},
        {
          properties:{
            propertyValues:{
              $ref:`#/components/schemas/${schema.shortName}Object`
            },
            values:valuesSchema
          },
          required:['propertyValues','values']
        }
      ]
    };
  }

  getComponentsApiDeviceProperty = ():OpenAPIV3_1.SchemaObject =>
  {
    return {
      type:'object',
      description: 'Device property information',
      properties:{
        epc:{type:'string', description:'ECHONET Lite property code. It is a 2-digit HEX starting from "0x".'},
        descriptions:{
          type:'object',
          properties:{
            ja:{type:'string'},
            en:{type:'string'}
          },
          required:['ja','en']
        },
        epcAtomic:{type:'string', description:'An EPC that requires "Atomic operation" as ECHONET Lite.'},
        note:{
          description:'Additional information related to properties',
          type:'object',
          properties:{
            ja:{type:'string'},
            en:{type:'string'}
          },
          required:['ja','en']
        },
        observable:{type:'boolean', description:'This indicates whether status changes can be notified or not. Corresponds to INF of ECHONET Lite'},
        writable:{type:'boolean', description:'This indicates whether writing is possible or not. Corresponds to SET of ECHONET Lite'},
        schema:{type:'object', description:'Property type schema'},
        urlParameters:{type:'array', items:{type:'string'}, description:'This property is unused. Always an empty array.'},
        mqttTopics:{type:'string', description:'MQTT topic for the property'},
        name:{type:'string', description:'Property name'}
      },
      required:['epc','descriptions','epcAtomic','note','observable','writable','schema','urlParameters','mqttTopics','name']
    }
  }

  getComponentsApiDevicePropertyValue = ():OpenAPIV3_1.SchemaObject =>
  {
    return {
      type:'object',
      description: 'Device property value information',
      properties:{
        name:{type:'string', description:'Property name'},
        value:{type:'object', description:'Property value. The value type is different for each property.'},
        updated:{type:'string', description:'Last updated date and time (UTC). format is YYYY-MM-DD HH:mm:ssZ'}
      },
      required:['name','value','updated']
    }
  }

  getComponentsDeviceTypeObject = (schema:ElDeviceDescription):OpenAPIV3_1.SchemaObject =>
  {
    const properties:{[key:string]:OpenAPIV3_1.SchemaObject} = {};
    for(const prop of schema.elProperties)
    {
      const schema = this.echoNetOpenApiConverter.toOpenApiSchema(prop.data);
      schema.description = prop.descriptions?.en ?? "";
      properties[prop.shortName] = schema;
    }
    return {
      type:'object',
      description: `${schema.shortName} object`,
      properties:properties,
      required:[]
    };
  }

  getSystemStatus = ():OpenAPIV3_1.PathItemObject =>
  {
    return {
      get:{
        summary:'Obtaining system status',
        description:'Obtaining system status',
        tags:[`System`],
        responses:{
          '200':{
            description:'',
            content:{
              'application/json':{
                schema:{
                  type:'object',
                  properties:{
                    mqttState:{
                      type:'string', 
                      description:'connection status for MQTT broker',
                      enum:['Disconnected','Connected','NotConfigure']
                    },
                    systemVersion:{
                      type:'string', 
                      description:'system version'
                    },
                    devices:{
                      type:'array',
                      description:'Device list',
                      items:{
                        $ref:'#/components/schemas/ApiDeviceSummary'
                      }
                    }
                  },
                  required:['status','updated','devices']
                }
              }
            }
          }
        }
      }
    };
  }

  getLogs = ():OpenAPIV3_1.PathItemObject =>
  {
    return {
      get:{
        summary:'Obtaining logs',
        description:'Obtaining logs',
        tags:[`System`],
        responses:{
          '200':{
            description:'',
            content:{
              'application/json':{
                schema:{
                  type:'array',
                  items:{
                    type:'object',
                    properties:{
                      id:{type:'integer', description:'Log Id. It is a unique number in the system.'},
                      datetime:{type:'string', description:'Log date and time (UTC). format is YYYY-MM-DD HH:mm:ssZ'},
                      message:{type:'string', description:'Log message'}
                    },
                    required:['level','message','updated']
                  }
                }
              }
            }
          }
        }
      }
    };
  }

  getServerEvents = ():OpenAPIV3_1.PathItemObject =>
  {
    return {
      get:{
        summary:'Subscribe to server-sent events',
        deprecated:true,
        description:`This endpoint is deprecated. Use the WebSocket server for server-sent events.

This endpoint establishes a connection to the server to receive real-time events via Server-Sent Events (SSE).  
Clients should include an 'Accept' header with 'text/event-stream', and the response will remain open for streaming events.  
Events will be sent in the following format:
- event: <event-type>
- data: stringified JSON object

To close the connection, the client can simply terminate the request.

### Event Types

- 'systemUpdated': Notifies about changes in the system state.
- 'logUpdated': Notifies when a new log entry is added.
- 'deviceUpdated': Notifies about changes related to a device.  
  In this case, the "data" field is passed. For "data", the device ID is notified in JSON expressed as a string like '{"event":"deviceUpdated", "id":"deviceId"}'.

### Example

\`\`\`
event: systemUpdated
data: {"event":"systemUpdated", "id":""}
\`\`\`

\`\`\`
event: logUpdated
data: {"event":"logUpdated", "id":""}
\`\`\`

\`\`\`
event: deviceUpdated
data: {"event":"deviceUpdated", "id":"fe00-your-device-id-00000000000000"}
\`\`\`

`,
        tags:[`System`],
        responses:{
          '200':{
            description:'Stream of server-sent events',
            content:{
              'text/event-stream':{
                schema:{
                  type:'object',
                  properties:{
                    event:{
                      type:'string',
                      description:'Event type',
                      enum:['systemUpdated','logUpdated','deviceUpdated'],
                      example:'deviceUpdated'
                    },
                    data:{
                      type:'string',
                      description:'JSON string containing the property "event" and "id".',
                      example:'{"event":"deviceUpdated", "id":"fe00-your-device-id-00000000000000"}'
                    }
                  },
                  required:['event']
                }
              }
            }
          }
        }
      }
    };
  }

  getApiVersionList = ():OpenAPIV3_1.PathItemObject =>
  {
    return {
      get:{
        summary:'Obtaining API version list',
        description:'Obtaining API version list',
        tags:[`System`],
        responses:{
          '200':{
            description:'',
            content:{
              'application/json':{
                schema:{
                  type:'array',
                  items:{
                    type:'object',
                    properties:{
                      id:{type:'string'},
                      status:{type:'string'},
                      updated:{type:'string'}
                    },
                    required:['id','status','updated']
                  }
                }
              }
            }
          }
        }
      }
    };
  }

  GetServiceList = ():OpenAPIV3_1.PathItemObject =>
  {
    return {
      get:{
        summary:'Obtaining target service type list',
        description:'Obtaining target service type list',
        tags:[`System`],
        responses:{
          '200':{
            description:'',
            content:{
              'application/json':{
                schema:{
                  type:'array',
                  items:{
                    type:'object',
                    properties:{
                      name:{type:'string', description:'Service name'},
                      descriptions:{
                        type:'object',
                        properties:{
                          ja:{type:'string'},
                          en:{type:'string'}
                        },
                        required:['ja','en']
                      },
                      total:{type:'number', description:'Number of objects in the service'}
                    },
                    required:['name','descriptions','total']
                  }
                }
              }
            }
          }
        }
      }
    };
  }

  // ApiDeviceSummaryのArrayを返す
  // GET /elapi/v1/devices
  getDeviceList = ():OpenAPIV3_1.PathItemObject =>
  {
    return{
      get:{
        summary:'Obtaining device list',
        description:'Obtaining device list',
        tags:[`System`],
        responses:{
          '200':{
            description:'',
            content:{
              'application/json':{
                schema:{
                  type:'array',
                  items:{
                    $ref:'#/components/schemas/ApiDeviceSummary'
                  }
                }
              }
            }
          }
        }
      }
    };
  }
  
  // GET /elapi/v1/devices/:deviceId → ApiDeviceを返す
  private getDeviceInfo = (device:Device):OpenAPIV3_1.PathItemObject =>
  {
    return {
      get:{
        summary:'Obtaining device information',
        description:'Obtaining device information',
        tags:[`${device.name}`],
        responses:{
          '200':{
            description:'',
            content:{
              'application/json':{
                schema:{
                  $ref:'#/components/schemas/ApiDevice_'+device.deviceType
                }
              }
            }
          }
        }
      }
    };
  }

  // プロパティの一括GETエンドポイント
  // GET /elapi/v1/devices/:deviceId/properties 
  private getDeviceProperties = (device: Device):OpenAPIV3_1.PathItemObject =>
  {
    const schemaName = device.deviceType + "Object";

    return {
      get:{
        summary:'Get device properties',
        description:'Get device properties',
        tags:[`${device.name}`],
        responses:{
          '200':{
            description:'',
            content:{
              'application/json':{
                schema:{
                  $ref:`#/components/schemas/${schemaName}`
                }
              }
            }
          }
        }
      }
    };
    
  }

  // プロパティの一括リクエストエンドポイント
  // /elapi/v1/devices/:deviceId/properties/request
  private getDeviceRequestProperties = (device: Device):OpenAPIV3_1.PathItemObject =>
  {
    const schemaName = device.deviceType + "Object";

    const requestProperties:{[key:string]:any} ={};
    for(const prop of device.properties.filter(_=>_.readable))
    {
      const schema:OpenAPIV3_1.SchemaObject = {
        type:'string',
        description: 'The property to request update. The value can be anything.'
      }
      schema.description = prop.descriptions.en;
      requestProperties[prop.name] = schema;
    }

    return{
      put:{
        summary:'Request properties update',
        description:'Request properties update',
        tags:[`${device.name}`],
        requestBody:{
          required: true,
          content:{
            'application/json':{
              schema:{
                $ref:`#/components/schemas/${schemaName}`
              }
            }
          }
        },
        responses:{
          '200':{
            description:'',
            content:{
              'application/json':{
                schema:{
                  type:'object'
                }
              }
            }
          }
        }
      }
    };
  }

  // プロパティのGet/Setエンドポイント
  // GET /elapi/v1/devices/:deviceId/properties/:propertyName
  // PUT /elapi/v1/devices/:deviceId/properties/:propertyName
  private getDeviceGetSetProperty = (device: Device):OpenAPIV3_1.PathItemObject =>
  {
    const result:OpenAPIV3_1.PathItemObject = {};

    const schemaName = device.deviceType + "Object";
    const getPropertyList = device.properties.filter(_=>_.readable);
    if(getPropertyList.length > 0)
    {
      result.get = {
        summary: 'Get property',
        description: 'Get property',
        tags:[`${device.name}`],
        parameters:[
          {
            name:'propertyName',
            description:'Property name',
            in:'path',
            required:true,
            schema:{
              type:'string',
              enum:getPropertyList.map(_=>_.name)
            }
          }
        ],
        responses:{
          '200':{
            description:'',
            content:{
              'application/json':{
                schema:{
                  $ref:`#/components/schemas/${schemaName}`
                }
              }
            }
          }
        }
      }
    }

    const putPropertyList = device.properties.filter(_=>_.writable);
    if(putPropertyList.length > 0)
    {
      result.put = {
        summary: 'Set property',
        description: 'Set property',
        tags:[`${device.name}`],
        parameters:[
          {
            name:'propertyName',
            description:'Property name',
            in:'path',
            required:true,
            schema:{
              type:'string',
              enum:putPropertyList.map(_=>_.name)
            }
          }
        ],
        requestBody:{
          required: true,
          content:{
            'application/json':{
              schema:{
                $ref:`#/components/schemas/${schemaName}`
              }
            }
          }
        },
        responses:{
          '200':{
            description:'',
            content:{
              'application/json':{
                schema:{
                  $ref:`#/components/schemas/${schemaName}`
                }
              }
            }
          },
          '404':{
            description:''
          }
        }
      }
    }

    return result;
  }

  // プロパティのRequestエンドポイント
  // PUT /elapi/v1/devices/:deviceId/properties/:propertyName/request
  private getDeviceRequestProperty = (device: Device):OpenAPIV3_1.PathItemObject =>
  {
    const getPropertyList = device.properties.filter(_=>_.readable);

    return {
      put:{
        summary:'request a property update',
        description:'request a property update',
        tags:[`${device.name}`],
        parameters:[
          {
            name:'propertyName',
            description:'Property name',
            in:'path',
            required:true,
            schema:{
              type:'string',
              enum: getPropertyList.map(_=>_.name)
            }
          }
        ],
        responses:{
          '200':{
            description:'',
            content:{
              'application/json':{
                schema:{
                  type:'object'
                }
              }
            }
          }
        }
      }
    };
  }
  
  // WebSocket用End Pointを返す
  private getWebSocketWebHook = ():OpenAPIV3_1.PathItemObject =>
  {
    return {
      post: {
        summary: 'Receive a message from the server',
        description: 'Receive a message from the server',
        tags:['Webhook'],
        responses:{
          '200':{
            description:'',
            content:{
              'application/json':{
                schema:{
                  type:'object',
                  properties:{
                    data:{
                      type:'string', 
                      description:'the event data. The value is a JSON string containing the property "event" and "id".',
                      example:'{"event":"deviceUpdated", "id":"fe00-your-device-id-00000000000000"}'
                    }
                  },
                  required:['data']
                }
              }
            }
          }
        }
      }
    };
  }
  
}