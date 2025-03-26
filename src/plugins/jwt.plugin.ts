import fp from 'fastify-plugin';
import fastifyJWT from '@fastify/jwt';
import config from '../config/config';

export const jwtPlugin = fp(async (fastify, opts) => {
  await fastify.register(fastifyJWT, {
    secret: config.jwt.secret,
    sign: { expiresIn: config.jwt.accessTokenTtl }
  });
  fastify.log.info('fastify-jwt plugin registered');
});
