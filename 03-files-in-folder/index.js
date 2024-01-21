const { readdir } = require('fs/promises');
const path = require('path');
const { stat } = require('fs/promises');

const folderPath = path.join(__dirname, 'secret-folder');

const listFiles = async () => {
  try {
    const files = await readdir(folderPath, { withFileTypes: true });
    for (const file of files) {
      const fileStats = await stat(path.join(folderPath, file.name));
      if (fileStats.isFile()) {
        const pathName = path.basename(file.name, path.extname(file.name));
        const extendName = path.extname(file.name).slice(1);
        const fileSize = (fileStats.size / 1024).toFixed(3);
        console.log(`${pathName} - ${extendName} - ${fileSize}kb`);
      }
    }
  } catch (err) {
    console.error(err);
  }
};
listFiles();
