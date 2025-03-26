import { FastifyReply } from "fastify";
import log from "./logger";

// Custom Error Class
class Errorhandler extends Error {
  statusCode: number;
  data?: any;

  constructor(message: string, statusCode: number = 500, data?: any) {
    super(message);
    this.statusCode = statusCode;
    this.data = data;
    Error.captureStackTrace(this, this.constructor);
  }
}



export { Errorhandler };
