const fs = require('fs');
const path = require('path');

const appsDir = path.join(process.cwd(), 'apps');
const webDir = path.join(appsDir, 'web');

try {
  if (!fs.existsSync(appsDir)) {
    fs.mkdirSync(appsDir, { recursive: true });
  }
  if (!fs.existsSync(webDir)) {
    fs.symlinkSync('..', webDir, 'junction');
    console.log("Created symlink workaround for next-on-pages monorepo WASM bug");
  }
} catch (e) {
  console.log("Symlink creation failed, ignoring: ", e.message);
}
