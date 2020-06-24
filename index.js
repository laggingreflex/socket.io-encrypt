const Cryptr = require('cryptr');
const { emit, on, off, send } = require('./symbol');
const reservedEvents = require('./reserved-events');

module.exports = (secret) => (socket, next) => {
  const handlers = new Map();
  const cryptr = new Cryptr(secret);

  const encrypt = args => {
    const encrypted = [];
    let ack
    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      if (i === args.length - 1 && typeof arg === 'function') {
        ack = arg;
      } else {
        encrypted.push(cryptr.encrypt(JSON.stringify(arg)));
      }

    }
    if (!encrypted.length) return args;
    args = [{ encrypted }];
    if (ack) args.push(ack);
    return args;
  };

  const decrypt = encrypted => {
    try {
      return encrypted.map(a => JSON.parse(cryptr.decrypt(a)))
    } catch (e) {
      const error = new Error(`Couldn't decrypt. Wrong secret used on client or invalid data sent. (${e.message})`);
      error.code = 'ERR_DECRYPTION_ERROR';
      throw error;
    }
  };

  socket[emit] = socket.emit;
  socket[on] = socket.on;
  socket[off] = socket.off;

  socket.emit = (event, ...args) => {
    if (reservedEvents.includes(event)) return socket[emit](event, ...args);

    return socket[emit](event, ...encrypt(args));
  };

  socket.on = (event, handler) => {
    if (reservedEvents.includes(event)) return socket[on](event, handler);

    const newHandler = function(...args) {
      if (args[0] && args[0].encrypted) {
        try {
          args = decrypt(args[0].encrypted);
        } catch (error) {
          socket[emit]('error', error);
          return;
        }
      }
      return handler.call(this, ...args);
    };
    
    handlers.set(handler, newHandler);
    return socket[on](event, newHandler);
  };

  socket.off = (event, handler) => {
    if (reservedEvents.includes(event)) return socket[off](event, handler);

    if (handlers.has(handler)) {
      return socket[off](event, handlers.get(handler));
    }
    
    return socket[off](event, handler);
  }

  if (next) next();
  return socket;
};
