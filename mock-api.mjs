import { createServer } from 'http';

const server = createServer((req, res) => {
  res.setHeader('Content-Type', 'application/json');

  if (req.url === '/api/me' && req.method === 'GET') {
    res.writeHead(200);
    res.end(JSON.stringify({
      id: 'test-user-123',
      email: 'test@edenvalley.com',
      firstName: 'Test',
      lastName: 'User',
    }));
    return;
  }

  if (req.url === '/api/auth/get-session' && req.method === 'GET') {
    res.writeHead(200);
    res.end(JSON.stringify({ data: { session: null, user: null } }));
    return;
  }

  res.writeHead(404);
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(3001, () => {
  console.log('Mock API running on http://localhost:3001');
});
