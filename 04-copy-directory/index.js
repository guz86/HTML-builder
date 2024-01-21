const { mkdir } = require('fs/promises');
const { copyFile } = require('fs/promises');
const { readdir } = require('fs/promises');
const { unlink } = require('fs/promises');
const { stat } = require('fs/promises');
const path = require('path');

const folderPath = path.join(__dirname, 'files');
const projectFolder = path.join(__dirname, 'files-copy');

async function removeFiles() {
  try {
    await stat(projectFolder);
    const files = await readdir(projectFolder);
    for (const file of files) {
      await unlink(path.join(projectFolder, file));
    }
  } catch (err) {
    //console.error(err);
  }
}

async function makeDirectory() {
  try {
    await removeFiles();
    const dirCreation = await mkdir(projectFolder, { recursive: true });
    return dirCreation;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

async function copyFiles() {
  try {
    const files = await readdir(folderPath);
    for (const file of files) {
      await copyFile(
        path.join(folderPath, file),
        path.join(projectFolder, file),
      );
    }
  } catch (err) {
    console.error(err);
  }
}

async function main() {
  await makeDirectory();
  await copyFiles();
}

main().catch(console.error);
