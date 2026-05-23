const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const [, , target, ...args] = process.argv;

if (!target) {
  console.error('Missing target module path.');
  process.exit(1);
}

const existingNodeOptions = process.env.NODE_OPTIONS ? `${process.env.NODE_OPTIONS} ` : '';
const env = {
  ...process.env,
  NODE_OPTIONS: `${existingNodeOptions}--max-old-space-size=4096`,
};

const resolveTarget = (modulePath) => {
  const nodeModulesPath = path.resolve(__dirname, '..', 'node_modules', modulePath);
  if (fs.existsSync(nodeModulesPath)) {
    return nodeModulesPath;
  }

  return require.resolve(modulePath);
};

const child = spawn(process.execPath, [resolveTarget(target), ...args], {
  stdio: 'inherit',
  env,
});

child.on('exit', (code) => {
  process.exit(code ?? 1);
});

child.on('error', (error) => {
  console.error(error);
  process.exit(1);
});
