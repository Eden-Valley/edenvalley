import { createServer } from 'http';

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

const blueprints = {};
const matches = {};
const teams = {};

const server = createServer((req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

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
    if (!auth?.startsWith('Bearer ')) { res.writeHead(401); res.end(JSON.stringify({ error: 'Unauthorized' })); return; }
    const userId = auth.split(' ')[1];
    const bp = blueprints[userId] || { id: `${userId}-bp`, userId, cards: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    res.writeHead(200);
    res.end(JSON.stringify(bp));
    return;
  }

  if (pathname === '/api/blueprint' && req.method === 'PUT') {
    const auth = req.headers.authorization;
    if (!auth?.startsWith('Bearer ')) { res.writeHead(401); res.end(JSON.stringify({ error: 'Unauthorized' })); return; }
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
    if (!auth?.startsWith('Bearer ')) { res.writeHead(401); res.end(JSON.stringify({ error: 'Unauthorized' })); return; }
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

  if (pathname === '/api/match/status' && req.method === 'GET') {
    const auth = req.headers.authorization;
    if (!auth?.startsWith('Bearer ')) { res.writeHead(401); res.end(JSON.stringify({ error: 'Unauthorized' })); return; }
    const userId = auth.split(' ')[1];
    const m = matches[userId];
    res.writeHead(200);
    res.end(JSON.stringify(m || { status: 'unmatched' }));
    return;
  }

  if (pathname === '/api/match/suggestions' && req.method === 'GET') {
    const auth = req.headers.authorization;
    if (!auth?.startsWith('Bearer ')) { res.writeHead(401); res.end(JSON.stringify({ error: 'Unauthorized' })); return; }
    const userId = auth.split(' ')[1];
    const suggestions = [
      { id: 'sug-1', userId: 'user-2', firstName: 'Jane', lastName: 'Doe', role: 'doer', skills: ['React', 'Node.js', 'PostgreSQL'], vision: 'I want to build AI-powered education tools that adapt to each student.', matchScore: 88 },
      { id: 'sug-2', userId: 'user-3', firstName: 'Alex', lastName: 'Chen', role: 'thinker', skills: ['Product Design', 'Strategy', 'Marketing'], vision: 'Transforming how remote teams collaborate creatively.', matchScore: 76 },
    ];
    res.writeHead(200);
    res.end(JSON.stringify(suggestions));
    return;
  }

  if (pathname.startsWith('/api/match/request/') && req.method === 'POST') {
    const auth = req.headers.authorization;
    if (!auth?.startsWith('Bearer ')) { res.writeHead(401); res.end(JSON.stringify({ error: 'Unauthorized' })); return; }
    const userId = auth.split(' ')[1];
    matches[userId] = { status: 'pending' };
    res.writeHead(200);
    res.end(JSON.stringify(matches[userId]));
    return;
  }

  if (pathname.startsWith('/api/match/accept/') && req.method === 'POST') {
    const auth = req.headers.authorization;
    if (!auth?.startsWith('Bearer ')) { res.writeHead(401); res.end(JSON.stringify({ error: 'Unauthorized' })); return; }
    const userId = auth.split(' ')[1];
    matches[userId] = { status: 'matched', match: { id: 'match-1', userId: 'user-2', firstName: 'Jane', lastName: 'Doe', role: 'doer', skills: ['React'], vision: 'Building the future' } };
    res.writeHead(200);
    res.end(JSON.stringify(matches[userId]));
    return;
  }

  if (pathname.startsWith('/api/match/decline/') && req.method === 'POST') {
    const auth = req.headers.authorization;
    if (!auth?.startsWith('Bearer ')) { res.writeHead(401); res.end(JSON.stringify({ error: 'Unauthorized' })); return; }
    const userId = auth.split(' ')[1];
    matches[userId] = { status: 'unmatched' };
    res.writeHead(200);
    res.end(JSON.stringify(matches[userId]));
    return;
  }

  if (pathname === '/api/team' && req.method === 'GET') {
    const auth = req.headers.authorization;
    if (!auth?.startsWith('Bearer ')) { res.writeHead(401); res.end(JSON.stringify({ error: 'Unauthorized' })); return; }
    const userId = auth.split(' ')[1];
    const t = teams[userId] || [
      { id: `mem-${userId}`, userId, firstName: 'Test', lastName: 'User', role: 'CEO', joinedAt: new Date().toISOString() },
    ];
    res.writeHead(200);
    res.end(JSON.stringify(t));
    return;
  }

  if (pathname === '/api/team/invite' && req.method === 'POST') {
    const auth = req.headers.authorization;
    if (!auth?.startsWith('Bearer ')) { res.writeHead(401); res.end(JSON.stringify({ error: 'Unauthorized' })); return; }
    const userId = auth.split(' ')[1];
    let body = '';
    req.on('data', (chunk) => body += chunk);
    req.on('end', () => {
      const { email, role } = JSON.parse(body);
      const newMember = { id: uid(), userId: `invited-${uid()}`, firstName: email.split('@')[0], lastName: '', role, joinedAt: new Date().toISOString() };
      if (!teams[userId]) teams[userId] = [];
      teams[userId].push(newMember);
      res.writeHead(200);
      res.end(JSON.stringify(newMember));
    });
    return;
  }

  if (pathname.startsWith('/api/team/') && pathname.endsWith('/role') && req.method === 'PATCH') {
    const auth = req.headers.authorization;
    if (!auth?.startsWith('Bearer ')) { res.writeHead(401); res.end(JSON.stringify({ error: 'Unauthorized' })); return; }
    const userId = auth.split(' ')[1];
    const memberId = pathname.split('/')[3];
    let body = '';
    req.on('data', (chunk) => body += chunk);
    req.on('end', () => {
      const { role } = JSON.parse(body);
      let updated;
      if (teams[userId]) {
        teams[userId] = teams[userId].map((m) => {
          if (m.id === memberId) { updated = { ...m, role }; return updated; }
          return m;
        });
      }
      res.writeHead(200);
      res.end(JSON.stringify(updated || { error: 'Not found' }));
    });
    return;
  }

  if (pathname.startsWith('/api/team/') && req.method === 'DELETE') {
    const auth = req.headers.authorization;
    if (!auth?.startsWith('Bearer ')) { res.writeHead(401); res.end(JSON.stringify({ error: 'Unauthorized' })); return; }
    const userId = auth.split(' ')[1];
    const memberId = pathname.split('/').pop();
    if (teams[userId]) {
      teams[userId] = teams[userId].filter((m) => m.id !== memberId);
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
