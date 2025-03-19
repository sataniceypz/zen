const http = require('http');

const port = process.env.PORT || 8080;

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Server is running successfully!\n');
});

server.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
