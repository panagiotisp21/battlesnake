import express from 'express';

export const createApp = (handlers) => {
  const app = express();
  app.use(express.json());

  app.get('/', (req, res) => res.send(handlers.info()));

  app.post('/start', (req, res) => {
    handlers.start(req.body);
    res.send('ok');
  });

  app.post('/move', (req, res) => {
    const moveResponse = handlers.move(req.body);
    res.send(moveResponse);
  });

  app.post('/end', (req, res) => {
    handlers.end(req.body);
    res.send('ok');
  });

  return app;
};

export default function runServer(handlers) {
  const app = createApp(handlers);
  const port = process.env.PORT || 8080;
  app.listen(port, () => {
    console.log(`Starting Battlesnake at http://0.0.0.0:${port}...`);
  });
}
