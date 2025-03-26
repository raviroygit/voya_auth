import fastifyRateLimit from "@fastify/rate-limit";

export function setupRateLimiter(fastify: any) {
  fastify.register(fastifyRateLimit, {
    max: 100,
    timeWindow: "30 minute",
    keyGenerator: (req:any) => req.ip,
    errorResponseBuilder: () => ({
      message: "Too many login attempts. Try again later.",
    }),
  });
}
