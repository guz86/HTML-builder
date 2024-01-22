const { readdir, stat, unlink } = require('fs/promises');
const fs = require('fs');

const path = require('path');

const stylesPath = path.join(__dirname, 'styles');
const outputBundleFile = path.join(__dirname, 'project-dist', 'bundle.css');

async function removeBundle() {
  try {
    const bundleStats = await stat(outputBundleFile);
    if (bundleStats.isFile()) {
      await unlink(outputBundleFile);
    }
  } catch (err) {
    if (err.code !== 'ENOENT') {
      console.error(err);
    }
  }
}

async function createBundle() {
  try {
    const files = await readdir(stylesPath, { withFileTypes: true });
    const output = fs.createWriteStream(outputBundleFile);
    let pendingReads = 0;
    for (const file of files) {
      const fileStylesPath = path.join(stylesPath, file.name);
      const fileStats = await stat(fileStylesPath);
      if (fileStats.isFile() && path.extname(file.name) === '.css') {
        pendingReads++;
        const readableStream = fs.createReadStream(fileStylesPath, 'utf-8');

        readableStream.on('data', (chunk) => {
          output.write(chunk);
        });

        readableStream.on('end', () => {
          pendingReads--;
          if (pendingReads === 0) {
            output.end();
          }
        });

        readableStream.on('error', (error) => {
          console.log('Error', error.message);
          pendingReads--;
          if (pendingReads === 0) {
            output.end();
          }
        });
      }
    }
  } catch (err) {
    console.error(err);
  }
}

async function main() {
  await removeBundle();
  await createBundle();
}

main().catch(console.error);
