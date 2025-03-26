import { FastifyReply, FastifyRequest } from "fastify";

export const next=(reply:FastifyReply, error:any)=>{
 reply.status(error.statusCode).send({success:false,message:error.message});
}