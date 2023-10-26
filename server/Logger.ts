import { TransformableInfo } from "logform";
import winston from "winston";
import path from "path";

const myConsoleFormat = winston.format.printf((info: TransformableInfo) =>{
  
  if(info.category!==undefined)
  {
    return `${info.level.padEnd(5," ")} ${info.category} ${info.message}`;
  }
  else
  {
    return `${info.level.padEnd(5," ")} ${info.message}`;
  }
})

const logger = winston.createLogger({
  transports: [
    new winston.transports.Console({format: winston.format.combine(
        myConsoleFormat
      )}),
    new winston.transports.File({
      filename: "detail.log",
      dirname: path.resolve(__dirname, "..", "logs"),
      maxFiles: 5,
      maxsize: 1 * 1024*1024, //bytes
      tailable: true,
      format:winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )}),
  ],
});

const unhandledErrorLoggerForLogFile = winston.createLogger({
  format: winston.format.json(),
  exceptionHandlers: [
    new winston.transports.File({ filename: 'logs/exceptions.log' })
  ]    
});
const unhandledErrorLoggerForConsole = winston.createLogger({
  format: winston.format.cli(),
  exceptionHandlers: [
    new winston.transports.Console()
  ]    
});
  

export class Logger
{
  public static error = (category:string,text:string, meta:{[key:string]:unknown} = {})=>
  {
    if(category !== "")
    {
      meta["category"] = category;
    }
    logger.error(text, meta);
  }
  public static warn = (category:string,text:string, meta:{[key:string]:unknown} = {})=>
  {
    if(category !== "")
    {
      meta["category"] = category;
    }
    logger.warn(text, meta);
  }
  public static info = (category:string,text:string, meta:{[key:string]:unknown} = {})=>
  {
    if(category !== "")
    {
      meta["category"] = category;
    }
    logger.info(text, meta);
  }
  public static debug = (category:string,text:string, meta:{[key:string]:unknown} = {})=>
  {
    if(category !== "")
    {
      meta["category"] = category;
    }
    logger.debug(text, meta);
  }
}