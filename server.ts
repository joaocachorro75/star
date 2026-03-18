import express from 'express';
import { createServer as createViteServer } from 'vite';
import Database from 'better-sqlite3';
import jwt from 'jsonwebtoken';
import path from 'path';

const JWT_SECRET = 'super-secret-key-for-star-app';
const ADMIN_USER = 'admin';
const ADMIN_PASS = 'admin123';

async function startServer() {
  const app = express();
  app.use(express.json());

  // Initialize SQLite
  const db = new Database('./database.sqlite');

  // Create tables first
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY,
      appName TEXT,
      logoUrl TEXT,
      whatsappNumber TEXT,
      evolutionApiEnabled INTEGER DEFAULT 0,
      evolutionApiUrl TEXT DEFAULT '',
      evolutionApiInstance TEXT DEFAULT '',
      evolutionApiKey TEXT DEFAULT ''
    );
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT,
      price REAL,
      isMonthly INTEGER,
      description TEXT,
      icon TEXT
    );
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      date TEXT,
      clientName TEXT,
      clientPhone TEXT,
      total REAL,
      status TEXT
    );
    CREATE TABLE IF NOT EXISTS order_items (
      orderId TEXT,
      productId TEXT,
      quantity INTEGER,
      FOREIGN KEY(orderId) REFERENCES orders(id)
    );
  `);

  // Seed data
  const settingsCount = db.prepare('SELECT COUNT(*) as count FROM settings').get() as { count: number };
  if (settingsCount.count === 0) {
    db.prepare('INSERT INTO settings (id, appName, logoUrl, whatsappNumber) VALUES (1, ?, ?, ?)').run('Star', '', '5511999999999');
  }

  const productsCount = db.prepare('SELECT COUNT(*) as count FROM products').get() as { count: number };
  if (productsCount.count === 0) {
    const defaultProducts = [
      { id: '1', name: 'Lojas Virtuais', price: 499, isMonthly: 0, description: 'E-commerce completo e moderno com gestão de estoque.', icon: 'shopping-cart' },
      { id: '2', name: 'Landing Pages', price: 299, isMonthly: 0, description: 'Páginas de alta conversão para seus produtos ou serviços.', icon: 'layout' },
      { id: '3', name: 'Agentes WhatsApp IA', price: 199, isMonthly: 1, description: 'Atendimento automatizado 24/7 com inteligência artificial.', icon: 'bot' },
      { id: '4', name: 'Cardápios Online', price: 399, isMonthly: 0, description: 'Sistema de vendas e pedidos por bairro para delivery.', icon: 'utensils' },
    ];
    const insertProduct = db.prepare('INSERT INTO products (id, name, price, isMonthly, description, icon) VALUES (?, ?, ?, ?, ?, ?)');
    for (const p of defaultProducts) {
      insertProduct.run(p.id, p.name, p.price, p.isMonthly, p.description, p.icon);
    }
  }

  // Auth middleware
  const authenticate = (req: any, res: any, next: any) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    try {
      jwt.verify(token, JWT_SECRET);
      next();
    } catch (err) {
      res.status(401).json({ error: 'Invalid token' });
    }
  };

  // API Routes
  app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    if (username === ADMIN_USER && password === ADMIN_PASS) {
      const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1d' });
      res.json({ token });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  });

  app.get('/api/settings', (req, res) => {
    const settings = db.prepare('SELECT * FROM settings WHERE id = 1').get() as any;
    if (settings) {
      settings.evolutionApiEnabled = Boolean(settings.evolutionApiEnabled);
    }
    res.json(settings);
  });

  app.put('/api/settings', authenticate, (req, res) => {
    const { appName, logoUrl, whatsappNumber, evolutionApiEnabled, evolutionApiUrl, evolutionApiInstance, evolutionApiKey } = req.body;
    db.prepare(`
      UPDATE settings 
      SET appName = ?, logoUrl = ?, whatsappNumber = ?, 
          evolutionApiEnabled = ?, evolutionApiUrl = ?, evolutionApiInstance = ?, evolutionApiKey = ? 
      WHERE id = 1
    `).run(
      appName, logoUrl, whatsappNumber, 
      evolutionApiEnabled ? 1 : 0, evolutionApiUrl || '', evolutionApiInstance || '', evolutionApiKey || ''
    );
    res.json({ success: true });
  });

  app.get('/api/products', (req, res) => {
    const products = db.prepare('SELECT * FROM products').all() as any[];
    res.json(products.map(p => ({ ...p, isMonthly: Boolean(p.isMonthly) })));
  });

  app.put('/api/products/:id', authenticate, (req, res) => {
    const { price } = req.body;
    db.prepare('UPDATE products SET price = ? WHERE id = ?').run(price, req.params.id);
    res.json({ success: true });
  });

  app.get('/api/orders', authenticate, (req, res) => {
    const orders = db.prepare('SELECT * FROM orders ORDER BY date DESC').all() as any[];
    for (const order of orders) {
      order.products = db.prepare('SELECT productId, quantity FROM order_items WHERE orderId = ?').all(order.id);
    }
    res.json(orders);
  });

  app.post('/api/orders', async (req, res) => {
    const { clientName, clientPhone, products, total } = req.body;
    const id = Math.random().toString(36).substring(2, 9).toUpperCase();
    const date = new Date().toISOString();
    const status = 'pending';

    db.prepare('INSERT INTO orders (id, date, clientName, clientPhone, total, status) VALUES (?, ?, ?, ?, ?, ?)').run(id, date, clientName, clientPhone, total, status);
    const insertItem = db.prepare('INSERT INTO order_items (orderId, productId, quantity) VALUES (?, ?, ?)');
    for (const p of products) {
      insertItem.run(id, p.productId, p.quantity);
    }

    // Send Evolution API Notification
    const settings = db.prepare('SELECT * FROM settings WHERE id = 1').get() as any;
    if (settings && settings.evolutionApiEnabled && settings.evolutionApiUrl && settings.evolutionApiInstance && settings.evolutionApiKey) {
      try {
        const productDetails = products.map((p: any) => `- ${p.quantity}x Produto ID: ${p.productId}`).join('\n');
        const messageToAdmin = `*Novo Pedido Recebido!* 🚀\n\n*ID:* #${id}\n*Cliente:* ${clientName}\n*Telefone:* ${clientPhone}\n*Total:* R$ ${total}\n\n*Acesse o painel para ver mais detalhes.*`;
        
        const url = `${settings.evolutionApiUrl.replace(/\/$/, '')}/message/sendText/${settings.evolutionApiInstance}`;
        
        await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': settings.evolutionApiKey
          },
          body: JSON.stringify({
            number: settings.whatsappNumber,
            text: messageToAdmin
          })
        });
      } catch (error) {
        console.error('Erro ao enviar notificação Evolution API:', error);
      }
    }

    res.json({ id, date, status });
  });

  app.put('/api/orders/:id/status', authenticate, (req, res) => {
    const { status } = req.body;
    db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, req.params.id);
    res.json({ success: true });
  });

  // Vite middleware
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const PORT = 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
