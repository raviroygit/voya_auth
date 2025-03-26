import config from "../config/config";
import { IUser, User } from "../models/user.model";
import { generateToken, generateNumericOTP } from "../utils/crypto.util";
import { deleteCache, getCache, setCache } from "../utils/redis/cache";
import { sendMagicLinkEmail, sendOTPEmail } from "./email.service";

export class AuthService {
  /**
   * Sends a magic link email for first-time signup.
   * The magic token is stored in Redis with a TTL.
   */
  async sendMagicLink(
    email: string,
    name: string,
    phone_number: string
  ): Promise<void> {
    const token = generateToken();
    const key = `magicToken:${token}`;
    // Store the magic token in Redis with TTL (in seconds)
    await setCache(key, { email, name, phone_number }, config.magicLink.ttl);

    const link = `${config.app.baseUrl}/auth/magic?token=${token}`;
    await sendMagicLinkEmail(email, link);
  }

  /**
   * Verifies the magic link token and creates (or retrieves) the user.
   * Deletes the token from the cache after verification.
   */
  async verifyMagicLink(token: string): Promise<IUser | null> {
    const key = `magicToken:${token}`;
    const email = await getCache(key);
    if (!email) return null;

    // Invalidate the token once it is used
    await deleteCache(key);

    // Find or create a user record in MongoDB
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ name: "New User", email, isVerified: true });
      await user.save();
    } else {
      // Update the user as verified if necessary
      if (!user.isVerified) {
        user.isVerified = true;
        await user.save();
      }
    }
    return user;
  }

  /**
   * Sends an OTP to the user's email for subsequent logins.
   * The OTP is cached in Redis with a TTL.
   */
  async sendOTP(email: string): Promise<void> {
    const code = generateNumericOTP(6);
    const key = `otp:${email}`;
    // Store the OTP in Redis with TTL (in seconds)
    await setCache(key, code, config.otp.ttl);

    await sendOTPEmail(email, code);
  }

  /**
   * Verifies the OTP and returns the user if valid.
   * Deletes the OTP from the cache after successful verification.
   */
  async verifyOTP(email: string, code: string): Promise<IUser | null> {
    const key = `otp:${email}`;
    const storedCode = await getCache(key);
    if (!storedCode || storedCode !== code) return null;

    // Invalidate the OTP after verification
    await deleteCache(key);

    // Find the user in MongoDB
    const user = await User.findOne({ email });
    console.log("user", user);
    return user;
  }

  /**
   * Updates a user's refresh token.
   * In production, this should be stored persistently.
   */
  async updateRefreshToken(user: IUser, refreshToken: any): Promise<void> {
    user.refreshToken = refreshToken;
    await user.save();
  }

  /**
   * Validates the provided refresh token for a user.
   */
  async validateRefreshToken(
    userId: string,
    token: string
  ): Promise<IUser | null> {
    const user = await User.findById(userId);
    if (!user || user.refreshToken !== token) {
      return null;
    }
    return user;
  }
}
