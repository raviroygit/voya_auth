import { Types } from "mongoose";

export interface IUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
  isVerified: boolean;
  refreshToken?: string;
  phone_number: string;
  address: string;
}

// Extend FastifyRequest correctly
declare module "fastify" {
  interface FastifyRequest {
    user?: IUser;
  }
}
