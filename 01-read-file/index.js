const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'text.txt');
const readableStream = fs.createReadStream(filePath);

readableStream.on('error', (error) => {
  console.error(`Error reading the file: ${error.message}`);
});

readableStream.on('data', (chunk) => process.stdout.write(chunk));
