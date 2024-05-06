const { execSync } = require('child_process');

const compile = () => execSync('tsc --project tsconfig.json', {
  encoding: 'utf8',
});

const copyFiles = () => {
  execSync('cp package.json dist/');
  execSync('cp package-lock.json dist/');
};

const installDependencies = () => {
  execSync('npm install --production --prefix dist');
};

compile();
copyFiles();
installDependencies();