# socket.io-encrypt

Patches `socket.emit` and and `socket.on` functions to send encrypted and decrypt messages using **[cryptr]**.

[cryptr]: https://github.com/MauriceButler/cryptr

## Install

```
npm i socket.io-encrypt
```

## Usage

### **`client`**

```js
const SocketIO = require('socket.io-client')
const encrypt = require('socket.io-encrypt')

const socket = SocketIO(SERVER_URL)
encrypt('secret')(socket)

socket.emit('message', {/* will be encrypted */})
```

### **`server`**

```js
const SocketIO = require('socket.io')
const encrypt = require('socket.io-encrypt')

const io = SocketIO({})
io.use(encrypt(secret))

io.on('connect', socket => {

  socket.on('message', data /* decrypted */ => { ... })
  socket.on('error', console.error /* handle decryption errors */)

})
```
