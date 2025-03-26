import { FastifyRequest, FastifyReply } from "fastify";

/**
 * Higher-Order Function to catch async errors in Fastify routes.
 * @param fn - The route handler function
 * @returns A function that automatically catches errors and forwards them to Fastify error handling
 */
export const catchAsyncError =
  (fn: (req: FastifyRequest, reply: FastifyReply) => Promise<any>) =>
  async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      await fn(req, reply);
    } catch (error) {
      reply.send(error); 
    }
  };
