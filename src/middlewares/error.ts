import { FastifyRequest, FastifyReply } from "fastify";
import { Errorhandler } from "../utils/ErrorHandler";
import log from "../utils/logger";

// Global Fastify Error Handler
export const ErrorMiddleware = (reply: FastifyReply, error: any) => {
    if (error instanceof Errorhandler) {

        error.statusCode = error.statusCode || 500;
        error.message = error.message || "Internal server error";
      
        // wrong mongodb id error
        if (error.name === "CastError") {
          const message = `Resource not found. Invalid`;
          error = new Errorhandler(message, 400);
        }
      
        // Duplicate key error
        if (error.code === 11000) {
          const message = `Duplicate ${Object.keys(error.keyValue)} entered`;
          error = new Errorhandler(message, 400);
        }
      
        // wrong jwt error
        if (error.name === "JsonWebTokenError") {
          const message = `Json web token is invalid, try again`;
          error = new Errorhandler(message, 400);
        }
      
        //JWT expired error
        if (error.name === "TokenExpiredError") {
          const message = `Json web token is expired, try again`;
          error = new Errorhandler(message, 400);
        }

      log.warn(error.message, error.data);
      return reply.status(error.statusCode).send({
        success: false,
        message: error.message,
        ...(error.data && { data: error.data }),
      });

    }
  

    log.error("Unhandled error", error);
    return reply.status(500).send({
      success: false,
      message: "Internal Server Error",
    });
  };