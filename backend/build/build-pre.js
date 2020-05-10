const path = require('path');
const colors = require('colors/safe');
const fs = require('fs');
const appConfig = require('../package.json');
const appVersion = appConfig.version;
const appDevVersion = appConfig.devVersion;


console.log(colors.cyan('\nRunning pre-build tasks'));

const vFilePath = path.join(__dirname + '/../src/environments/app.config.ts');

const src = `\nexport const appConfig = { version: '${appVersion}', devVersion: '${appDevVersion}' };\n`;

// ensure version module pulls value from package.json
fs.writeFile(vFilePath, src, {flat: 'w'}, function (err) {
    if (err) {
        return console.log(colors.red(err));
    }
    console.log(colors.green(`Updating application version ${colors.yellow(appVersion)}, devVersion ${colors.yellow(appDevVersion)} `));
    console.log(`${colors.green('Writing app config to ')}${colors.yellow(vFilePath)}\n\n`);
}); 

