import { createServer } from 'http';

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

const blueprints = {};

const server = createServer((req, res) => {
  res.setHeader('Content-Type', 'application/json');

  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  if (pathname === '/api/me' && req.method === 'GET') {
    res.writeHead(200);
    res.end(JSON.stringify({
      id: 'test-user-123',
      email: 'test@edenvalley.com',
      firstName: 'Test',
      lastName: 'User',
      role: 'thinker',
      language: 'en',
      isValidated: true,
      hasBlueprint: false,
      matchStatus: 'unmatched',
    }));
    return;
  }

  if (pathname === '/api/auth/get-session' && req.method === 'GET') {
    res.writeHead(200);
    res.end(JSON.stringify({ data: { session: null, user: null } }));
    return;
  }

  if (pathname === '/api/blueprint' && req.method === 'GET') {
    const auth = req.headers.authorization;
    if (!auth?.startsWith('Bearer ')) {
      res.writeHead(401);
      res.end(JSON.stringify({ error: 'Unauthorized' }));
      return;
    }
    const userId = auth.split(' ')[1];
    const bp = blueprints[userId] || { id: `${userId}-bp`, userId, cards: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    res.writeHead(200);
    res.end(JSON.stringify(bp));
    return;
  }

  if (pathname === '/api/blueprint' && req.method === 'PUT') {
    const auth = req.headers.authorization;
    if (!auth?.startsWith('Bearer ')) {
      res.writeHead(401);
      res.end(JSON.stringify({ error: 'Unauthorized' }));
      return;
    }
    const userId = auth.split(' ')[1];
    let body = '';
    req.on('data', (chunk) => body += chunk);
    req.on('end', () => {
      const { cards } = JSON.parse(body);
      const now = new Date().toISOString();
      blueprints[userId] = {
        id: `${userId}-bp`,
        userId,
        cards: cards.map((c, i) => ({ ...c, id: c.id || uid(), order: i + 1 })),
        createdAt: blueprints[userId]?.createdAt || now,
        updatedAt: now,
      };
      res.writeHead(200);
      res.end(JSON.stringify(blueprints[userId]));
    });
    return;
  }

  if (pathname.startsWith('/api/blueprint/cards/') && req.method === 'DELETE') {
    const auth = req.headers.authorization;
    if (!auth?.startsWith('Bearer ')) {
      res.writeHead(401);
      res.end(JSON.stringify({ error: 'Unauthorized' }));
      return;
    }
    const userId = auth.split(' ')[1];
    const cardId = pathname.split('/').pop();
    if (blueprints[userId]) {
      blueprints[userId].cards = blueprints[userId].cards.filter((c) => c.id !== cardId);
      blueprints[userId].updatedAt = new Date().toISOString();
    }
    res.writeHead(204);
    res.end();
    return;
  }

  res.writeHead(404);
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(3001, () => {
  console.log('Mock API running on http://localhost:3001');
});
