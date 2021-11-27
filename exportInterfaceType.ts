import all from "./device_descriptions_v1.3.0/all_device_descriptions_v1.3.0.json"
import  { DevicePropertySchema, MixedTypePropertySchema } from "./AllDeviceDescriptions";
import { device } from "./Property";


interface ParserInfo{
  returnType:string;
  parser:string;
}
  

function exportType(schema: DevicePropertySchema): ParserInfo{
  if("type" in schema)
  {
    if(schema.type === "boolean")
    {
      return {returnType:"boolean",parser:"DefaultConverter<boolean>"};
    }
    if(schema.type === "number")
    {
      return {returnType:"Number",parser:"DefaultConverter<number>"};
    }
    if(schema.type === "string")
    {
      if(schema.values === undefined)
      {
        if(schema.format!=undefined)
        {
          return {returnType:"string",parser:"DefaultConverter<string>"};
        }
        else
        {
          return {returnType:"string",parser:"UnknownConverter<string>"};
        }
      }
      const returnType = schema.values.map(_=>`"${_.value}"`).join("|");
      return {returnType:returnType,parser:`DefaultConverter<${returnType}>`};
    }
    if(schema.type === "null")
    {
      return {returnType:"any",parser:"DefaultConverter<any>"};
    }
    if(schema.type === "array")
    {
      const itemSchema = schema.items;
      const returnType = "(" + exportType(itemSchema).returnType + ")[]";
      return {returnType:returnType, parser:`UnknownConverter<${returnType}>`};
    }
    if(schema.type === "object"){
      const properties:string[] = [];
      for(const propertyName in schema.properties)
      {
        const itemSchema = schema.properties[propertyName];
        const propertyType = exportType(itemSchema);
        properties.push(`${propertyName}:${propertyType.returnType}`);
      }
      const returnType = "{" + properties.join(",") + "}";
      return {returnType:returnType,parser:`UnknownConverter<${returnType}>`};
    }
  }
  else
  {
    const mixedSchema = schema as MixedTypePropertySchema;
    if(mixedSchema.oneOf === undefined)
    {
      throw new Error("フォーマットエラー");
    }

    const exportTypes = mixedSchema.oneOf.map((_)=>exportType(_));
    const returnType = exportTypes.map(_=>_.returnType).join("|");
    const parser = exportTypes.filter(_=>_.parser.startsWith("DefaultConverter") === false).length === 0? `DefaultConverter<${returnType}>` : `UnknownConverter<${returnType}>`;
    return {returnType:returnType,parser:parser};
  }
  throw new Error("フォーマットエラー");
}

interface InterfaceType{
  name:string;
  comment: string;
  properties:InterfaceTypeProperty[];
}
interface InterfaceTypeProperty{
  name:string;
  type:string;
  parser:string;
  error?:string;
}
//const interfaceType:InterfaceType[] = [];
interface AliaseType{
  name:string;
  type:string;
}

const deviceInterfaceTypes:InterfaceType[] = [];
const aliaseTypes:AliaseType[] = [];


const device = all.common;
const deviceInterfaceType:InterfaceType = {name:"common", comment:device.descriptions.ja, properties:[]};
deviceInterfaceTypes.push(deviceInterfaceType);

for(const propertyName in device.properties){
  const property = device.properties[propertyName];
  const schema = property.schema;
  let propertyType: ParserInfo;
  try
  {
    propertyType = exportType(schema);
  }
  catch(e)
  {
    deviceInterfaceType.properties.push({
      name:propertyName,
      type:"any, // Json data error",
      parser: "undefined",
      error: "json data error"
    });
    continue;
  }

  if(propertyType.returnType.length > 10)
  {
    const newPropertyType = `Type_${device.deviceType}_${propertyName}`;
    aliaseTypes.push({
      name:newPropertyType,
      type:propertyType.returnType
    });
    propertyType = {
      returnType: newPropertyType,
      parser: propertyType.parser
    }
  }
  deviceInterfaceType.properties.push({
    name:propertyName,
    type:propertyType.returnType,
    parser: propertyType.parser,
  });
}

for(const device of all.devices)
{
  const deviceInterfaceType:InterfaceType = {
    name:device.deviceType + "",
    comment:device.descriptions.ja + " eoj:" + device.eoj,
    properties:[]
  }
  deviceInterfaceTypes.push(deviceInterfaceType);
  for(const propertyName in device.properties){
    const property = device.properties[propertyName];
    const schema = property.schema;
    let propertyType: ParserInfo;
    try
    {
      propertyType = exportType(schema);
    }
    catch(e)
    {
      deviceInterfaceType.properties.push({
        name:propertyName,
        type:"any",
        parser: "undefined",
        error: "json data error"
      });
      continue;
    }

    if(propertyType.returnType.length > 10)
    {
      const newPropertyType = `Type_${device.deviceType}_${propertyName}`;
      aliaseTypes.push({
        name:newPropertyType,
        type:propertyType.returnType
      });
      propertyType = {
        returnType: newPropertyType,
        parser: propertyType.parser
      }
    }
    deviceInterfaceType.properties.push({
      name:propertyName,
      type:propertyType.returnType,
      parser: propertyType.parser
    });
  }
}

console.log(`import { Converter, DefaultConverter, UnknownConverter } from "./echoNetLiteParser";`)
console.log("");
for(const aliaseType of aliaseTypes)
{
  console.log(`export type ${aliaseType.name} = ${aliaseType.type};`);
}
console.log("");
for(const deviceInterfaceType of deviceInterfaceTypes)
{
  console.log(`// ${deviceInterfaceType.comment}`);
  console.log(`export interface ${deviceInterfaceType.name}ConverterType {`);
  for(const property of deviceInterfaceType.properties){
    if(property.error !== undefined){
      console.log(`  // ${property.name}:any;  // ${property.error}`);
      continue;
    }
    console.log(`  ${property.name}:Converter<${property.type}>;`);
  }
  console.log(`}`);
}

for(const deviceInterfaceType of deviceInterfaceTypes)
{
  console.log(`// ${deviceInterfaceType.comment}`);
  console.log(`const Default${deviceInterfaceType.name}:${deviceInterfaceType.name}ConverterType = {`);
  for(const property of deviceInterfaceType.properties){
    if(property.error !== undefined){
      continue;
    }
    console.log(`  ${property.name}:new ${property.parser}(),`);
  }
  console.log(`};`);
}

console.log(`export interface CustomAllConvertersType {`);
for(const deviceInterfaceType of deviceInterfaceTypes)
{
  console.log(`  ${deviceInterfaceType.name} : Partial<${deviceInterfaceType.name}ConverterType>;`);
}
console.log(`}`);


console.log(`export interface AllConvertersType {`);
for(const deviceInterfaceType of deviceInterfaceTypes)
{
  console.log(`  ${deviceInterfaceType.name} : ${deviceInterfaceType.name}ConverterType;`);
}
console.log(`}`);


console.log(`export const DefaultConverters : AllConvertersType = {`);
for(const deviceInterfaceType of deviceInterfaceTypes)
{
  console.log(`  ${deviceInterfaceType.name} : Default${deviceInterfaceType.name},`);
}
console.log(`};`)
