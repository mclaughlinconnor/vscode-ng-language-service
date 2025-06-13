const fs = require('fs');
const packageJson = require('./package.json');

delete packageJson.resolutions['minipass-flush@^1.0.5'];
delete packageJson.resolutions['minipass-sized@^1.0.3'];
delete packageJson.resolutions['minipass-pipeline@^1.2.4'];

fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2), 'utf-8');
