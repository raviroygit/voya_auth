import { Schema, model, Document } from "mongoose";

export interface ISession extends Document {
  userId: string;
  sessionId: string;
  expiresAt: Date;
  isInvalidated: boolean;
  loggedOutAt?: Date;
  ipAddress: string;
  userAgent: string;
}

const sessionSchema = new Schema<ISession>(
  {
    userId: { type: String, required: true },
    sessionId: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
    isInvalidated: { type: Boolean, default: false },
    loggedOutAt: { type: Date, default: null },
    ipAddress: { type: String, required: true },
    userAgent: { type: String, required: true },
  },
  { timestamps: true }
);

// Auto-expire expired sessions
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Session = model<ISession>("Session", sessionSchema);
