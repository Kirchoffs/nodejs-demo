import { spawn } from 'child_process';
const command = 'node';
const args = ['./dist/index.js'];

const child = spawn(command, args, {
  stdio: ['pipe', 'pipe', 'inherit'],
});

const request = {
  jsonrpc: '2.0',
  id: 1,
  method: 'initialize',
  params: {},
};

child.stdout.on('data', data => {
  console.log(`Server response: ${data.toString()}`);
});

child.stdin.write(JSON.stringify(request) + '\n');

setTimeout(() => {
  child.stdin.end();
}, 1000);
