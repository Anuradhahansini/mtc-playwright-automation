const express = require('express');

function createApp() {
  const app = express();

  app.get('/', (req, res) => {
    res.send('Hello, world!');
  });

  app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  return app;
}

if (require.main === module) {
  const port = process.env.PORT || 3000;
  createApp().listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}

module.exports = { createApp };
