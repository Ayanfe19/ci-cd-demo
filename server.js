const http = require('http');

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok' }));
    return;
  }

  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(`
    <html>
      <head><title>CI/CD is fun</title></head>
      <body style="font-family: sans-serif; text-align: center; margin-top: 15%;">
        <h1>🚀 CI/CD is fun!</h1>
        <p>Built with GitHub Actions → Docker Hub → Azure Container Instances</p>
        <p><small>Version: ${process.env.APP_VERSION || 'dev'}</small></p>
      </body>
    </html>
  `);
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown — good practice to teach for containers
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => process.exit(0));
});
