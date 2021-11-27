import { CommonConverter, CustomAllConverters } from "./CustomConverter";
import { AllConvertersType, commonConverterType, CustomAllConvertersType, DefaultConverters } from "./interfaceType";

function MergeConverter<T>(x1:T, x2:Partial<T>):T & commonConverterType{
  const result:any = {};
  for(const property in x1){
    if(property in x2)
    {
      result[property] = x2[property];
    }
    else
    {
      result[property] = x1[property];
    }
  }  
  return result;
}

function MergeConverters(baseConvertersType: AllConvertersType, customConvertersType: Partial<CustomAllConvertersType>): AllConvertersType{
  const result:any = {};
  for(const property in baseConvertersType)
  {
    if(property in customConvertersType){
      result[property] = MergeConverter((baseConvertersType as any)[property], (customConvertersType as any)[property]);
    }
    else{
      result[property] = (baseConvertersType as any)[property];
    }
  }
  return result;
}


export const EchoNetConverter = MergeConverters(DefaultConverters, CustomAllConverters);
