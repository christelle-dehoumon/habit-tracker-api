
// Habit Tracker API - Serveur principal
// (version avec interface + métriques Prometheus)


const express = require('express');
const { Pool } = require('pg');
const promClient = require('prom-client');

// Configuration de l'application
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());


// Métriques Prometheus

const register = new promClient.Registry();
register.setDefaultLabels({ app: 'habit-tracker-api' });
promClient.collectDefaultMetrics({ register });

// Compteur du nombre total de requêtes HTTP (par méthode + route + statut)
const httpRequestsTotal = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Nombre total de requêtes HTTP reçues',
  labelNames: ['method', 'route', 'status'],
  registers: [register],
});

// Histogramme de la durée des requêtes HTTP
const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Durée des requêtes HTTP en secondes',
  labelNames: ['method', 'route'],
  buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5],
  registers: [register],
});

// Middleware qui mesure chaque requête (à placer avant les routes)
app.use((req, res, next) => {
  const end = httpRequestDuration.startTimer({ method: req.method, route: req.route?.path || req.path });
  res.on('finish', () => {
    httpRequestsTotal.inc({ method: req.method, route: req.route?.path || req.path, status: res.statusCode });
    end();
  });
  next();
});

// Endpoint exposant les métriques (Prometheus vient scraper ici)
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});


// Endpoint "info" : le message sur l'interface

app.get('/api/info', (req, res) => {
  res.json({
    message: ' Automation CI/CD pipeline with Jenkins and Docker Compose',
    version: '1.1.0'
  });
});


// Interface (fichiers statiques)

app.use(express.static('public'));

// Configuration de la connexion PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Initialisation de la base de données
const initDatabase = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS habits (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        frequency VARCHAR(50) DEFAULT 'daily',
        streak INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error.message);
  }
};


// Routes

app.get('/', (req, res) => {
  res.json({
    name: 'Habit Tracker API',
    version: '1.0.0',
    message: 'CI/CD pipeline with Jenkins and Docker Compose',
    endpoints: {
      'GET /health': 'Check API health status',
      'GET /habits': 'List all habits',
      'GET /habits/:id': 'Get a habit by ID',
      'POST /habits': 'Create a new habit',
      'PUT /habits/:id': 'Update a habit',
      'DELETE /habits/:id': 'Delete a habit',
      'GET /metrics': 'Prometheus metrics'
    }
  });
});

app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'error', database: 'disconnected' });
  }
});

app.get('/habits', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM habits ORDER BY created_at DESC');
    res.json({
      count: result.rows.length,
      habits: result.rows
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/habits/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM habits WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Habit not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/habits', async (req, res) => {
  try {
    const { name, description, frequency } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Field "name" is required' });
    }

    const result = await pool.query(
      'INSERT INTO habits (name, description, frequency) VALUES ($1, $2, $3) RETURNING *',
      [name, description || null, frequency || 'daily']
    );

    res.status(201).json({
      message: 'Habit created successfully',
      habit: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/habits/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, frequency, streak } = req.body;

    const result = await pool.query(
      `UPDATE habits 
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           frequency = COALESCE($3, frequency),
           streak = COALESCE($4, streak)
       WHERE id = $5 RETURNING *`,
      [name, description, frequency, streak, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Habit not found' });
    }

    res.json({
      message: 'Habit updated successfully',
      habit: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/habits/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM habits WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Habit not found' });
    }

    res.json({
      message: 'Habit deleted successfully',
      habit: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Démarrage du serveur

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  setTimeout(initDatabase, 3000);
});
