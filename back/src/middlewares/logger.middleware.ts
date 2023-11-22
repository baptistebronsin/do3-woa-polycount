import { Request, Response, NextFunction } from 'express';
import moment from 'moment';
import { v4 as uuidv4 } from 'uuid';


const getProcessingTimeInMS = (time: [number, number]): string => {
  return `${(time[0] * 1000 + time[1] / 1e6).toFixed(2)}ms`;
}

/**
 * add logs for an API endpoint using the following pattern
 *  [id][timestamp] method:url START
 *  [id][timestamp] method:url response.statusCode END processing
 *
 * @param req Express.Request
 * @param res Express.Response
 * @param next Express.NextFunction
 */
const logger = (req: Request, res: Response, next: NextFunction) => {
  // generate unique identifier
  const id: string = uuidv4();

  // get timestamp
  const timestamp: string = moment(new Date()).format("DD-MM-YYYY HH:mm:ss");

  // get api endpoint
  const { method, url } = req;

  // log start of the execution process
  const start: [number, number] = process.hrtime();
  const text_id: string = `[${id}]`;
  const time_stamp_text: string =  `[${timestamp}]`;
  console.log(`${text_id}${time_stamp_text} ${method}:${url} START`);

  // trigger once a response is sent to the client
  res.once('finish', () => {
    // log end of the execution process
    const end: [number, number] = process.hrtime(start);
    const end_text: string = `END:${getProcessingTimeInMS(end)}`;
    console.log(`${text_id}${time_stamp_text} ${method}:${url} ${res.statusCode} ${end_text}`);
  });

  // execute next middleware/event handler
  next();
};

export default logger;