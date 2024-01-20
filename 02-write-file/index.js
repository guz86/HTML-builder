const EventEmitter = require('events');
const fs = require('fs');
const path = require('path');

const emitter = new EventEmitter();
emitter.on('start', () => console.log('welcome'));
emitter.emit('start');

const outputFilePath = path.join(__dirname, 'trololololo.txt');
const output = fs.createWriteStream(outputFilePath);

process.stdin.on('data', (chunk) => {
  if (chunk.toString().trim().toLowerCase() === 'exit') {
    process.exit();
  } else {
    output.write(chunk);
  }
});

process.on('SIGINT', () => {
  process.exit();
});

process.on('exit', () => {
  console.log('trolololo!');
  output.end();
});

process.stdin.on('error', (err) => {
  console.error(`Error reading from console: ${err.message}`);
});

process.stdin.resume();
