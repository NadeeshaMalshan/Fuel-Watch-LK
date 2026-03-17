
const fs = require('fs');
const path = require('path');

function checkPackage(pkg) {
  const pkgPath = path.resolve('node_modules', pkg, 'package.json');
  if (fs.existsSync(pkgPath)) {
    const data = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    console.log(`Package: ${pkg}`);
    console.log(`Version: ${data.version}`);
    console.log(`Main: ${data.main}`);
    console.log(`Module: ${data.module}`);
    console.log(`Exports: ${JSON.stringify(data.exports, null, 2)}`);
  } else {
    console.log(`Package: ${pkg} NOT FOUND`);
  }
}

checkPackage('sonner');
checkPackage('react-router');
checkPackage('react-router-dom');
