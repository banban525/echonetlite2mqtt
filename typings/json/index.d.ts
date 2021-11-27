declare module "*/device_descriptions_v1.3.0/all_device_descriptions_v1.3.0.json" {
   
    export interface BooleanPropertySchema
    {
        type:"boolean";
        values:{
            value: boolean,
            descriptions: {
                "ja": string,
                "en": string
            },
            edt?: string}[]
    }
    
    export interface StringPropertySchema{
        type: "string",
        format?: "date-time"|"date"|"time";
        enum?: string[];
        values?:{
            value:string,
            descriptions:{
                ja:string,
                en:string
            },
            edt?:string
        }[]
    }
    export interface NumberPropertySchema{
        type: "number",
        unit?: string,
        minimum?: number,
        maximum?: number,
        multipleOf?: number
    }
    export interface NullPropertySchema{
        type: "null",
        edt?: string
    }
    export interface ArrayPropertySchema{
        type: "array",
        minItems?: number;
        maxItems?: number;
        items: DevicePropertySchema;
    }
    export interface ObjectPropertySchema{
        type: "object",
        properties:{ [key: string]: DevicePropertySchema }
    }
    export interface MixedTypePropertySchema{
        oneOf:DevicePropertySchema[]
    }
    export type DevicePropertySchema = BooleanPropertySchema|StringPropertySchema|NumberPropertySchema|NullPropertySchema|ArrayPropertySchema|ObjectPropertySchema|MixedTypePropertySchema;
    export interface DeviceProperty{
        epc:string;
        descriptions:{
            ja:string;
            en:string;
        },
        writable:boolean;
        observable: boolean;
        schema:DevicePropertySchema;
    }
    export interface DeviceType{
        deviceType:string;
        eoj:string;
        descriptions:{
            ja:string;
            en:string;
        },
        properties:{ [key: string]: DeviceProperty }
    }
    
    export interface AllDeviceDescriptions{
        metaData:{
            title:string;
            date:string;
            version:string;
            copyright:string;
        },
        common:DeviceType;
        devices:DeviceType[];
    }

    const value:AllDeviceDescriptions;
    export = value;
}  