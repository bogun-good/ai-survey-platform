const { exec } = require('child_process');

// 2초 대기 후 브라우저 열기
setTimeout(() => {
  const url = 'http://localhost:3000';
  const startCommand = process.platform === 'win32' ? `start ${url}` : process.platform === 'darwin' ? `open ${url}` : `xdg-open ${url}`;
  exec(startCommand);
}, 2000);