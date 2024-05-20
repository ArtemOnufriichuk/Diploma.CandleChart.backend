import http from 'http';
import express from 'express';
import { Server } from 'socket.io';

import { getCryptoPrice, setManipulated, unsetManipulated } from './manipulation_crypto';

export let io: Server;

export const runServerAndWS: (app: express.Application) => void = (app: express.Application) => {
  const server: http.Server = http.createServer(app);
  io = new Server(server, { cors: { origin: process.env.CORS_ORIGIN } });
  setInterval(() => {
    io.emit('sendPrice', getCryptoPrice());
  }, 2000);
  io.on('connection', (socket) => {
    socket.on('manipulateCrypto', ({ pair, amount, seconds }) => {
      try {
        setManipulated(pair, amount);
        setTimeout(() => {
          unsetManipulated(pair);
        }, seconds * 1000);
      } catch (e) {
        console.error(e);
      }
    });
  });
  server.listen(process.env.PORT, () => {
    console.log(`Application is running on port ${process.env.PORT}...`);
  });
};
