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
  public static error = (category:string,text:string)=>
  {
    if(category === "")
    {
      logger.error(text);
    }
    else
    {
      logger.error(text, {category});
    }
  }
  public static warn = (category:string,text:string)=>
  {
    if(category === "")
    {
      logger.warn(text);
    }
    else
    {
      logger.warn(text, {category});
    }
  }
  public static info = (category:string,text:string)=>
  {
    if(category === "")
    {
      logger.info(text);
    }
    else
    {
      logger.info(text, {category});
    }
  }
  public static debug = (category:string,text:string)=>
  {
    if(category === "")
    {
      logger.debug(text);
    }
    else
    {
      logger.debug(text, {category});
    }
  }
}