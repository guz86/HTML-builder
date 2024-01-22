const { readdir, copyFile, stat, rm, mkdir } = require('fs/promises');
const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, 'project-dist');

async function removeBundle() {
  try {
    const bundleStats = await stat(bundlePath);
    if (bundleStats.isDirectory()) {
      await rm(bundlePath, { recursive: true });
    }
  } catch (err) {
    if (err.code !== 'ENOENT') {
      console.error(err);
    }
  }
}

async function createBundle() {
  try {
    await mkdir(bundlePath, { recursive: true });
  } catch (err) {
    console.error(err);
  }
}

const templateFile = path.join(__dirname, 'template.html');
const componentsPath = path.join(__dirname, 'components');

let template;

async function readTemplate() {
  try {
    template = await fs.promises.readFile(templateFile, 'utf-8');
  } catch (err) {
    console.error(err);
  }
}

async function readComponents() {
  try {
    await readTemplate();

    const files = await readdir(componentsPath, { withFileTypes: true });

    for (const file of files) {
      const fileComponentsPath = path.join(componentsPath, file.name);
      const fileStats = await stat(fileComponentsPath);
      if (fileStats.isFile() && path.extname(file.name) === '.html') {
        const content = await fs.promises.readFile(fileComponentsPath, 'utf-8');
        const fileName = path.basename(file.name, path.extname(file.name));

        template = template.replace(`{{${fileName}}}`, content);
      }
    }
  } catch (err) {
    console.error(err);
  }
}

async function createIndexFile(content) {
  try {
    const indexPath = path.join(bundlePath, 'index.html');
    await fs.promises.writeFile(indexPath, content);
  } catch (err) {
    console.error(err);
  }
}

const stylesPath = path.join(__dirname, 'styles');
const outputBundleFile = path.join(__dirname, 'project-dist', 'style.css');

async function createStyles() {
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

const assetsPath = path.join(bundlePath, 'assets');
async function makeAssets() {
  try {
    await mkdir(assetsPath, { recursive: true });
  } catch (err) {
    console.error(err);
    throw err;
  }
}

async function makeDirectory(dirPath) {
  try {
    const dirCreation = await mkdir(dirPath, { recursive: true });
    return dirCreation;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

const folderPath = path.join(__dirname, 'assets');

async function copyAssets(source, destination) {
  try {
    await makeAssets();
    const assetsFiles = await readdir(source);

    for (const file of assetsFiles) {
      const sourcePath = path.join(source, file);
      const destinationPath = path.join(destination, file);
      const stats = await stat(sourcePath);

      if (stats.isDirectory()) {
        await makeDirectory(destinationPath);
        await copyAssets(sourcePath, destinationPath);
      } else {
        const destinationFile = path.join(destination, file);
        await copyFile(sourcePath, destinationFile);
      }
    }
  } catch (err) {
    console.error(err);
  }
}

async function main() {
  await removeBundle();
  await createBundle();
  await copyAssets(folderPath, assetsPath);
  await readComponents();
  await createIndexFile(template);
  await createStyles();
}

main().catch(console.error);
