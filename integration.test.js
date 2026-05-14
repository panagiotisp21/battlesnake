import request from 'supertest';
import { createApp } from './server.js';
import * as handlers from './index.js';

describe('Battlesnake API Integration', () => {
  let app;

  beforeAll(() => {
    // This loads the ACTUAL Express app logic from server.js
    app = createApp(handlers);
  });

  const mockState = {
    game: { id: 'test' },
    turn: 1,
    board: {
      height: 11,
      width: 11,
      food: [{ x: 5, y: 5 }],
      snakes: [
        {
          id: 'me',
          body: [
            { x: 0, y: 0 },
            { x: 0, y: 1 },
          ],
          head: { x: 0, y: 0 },
        },
      ],
    },
    you: {
      id: 'me',
      body: [
        { x: 0, y: 0 },
        { x: 0, y: 1 },
      ],
      head: { x: 0, y: 0 },
      length: 2,
    },
  };

  test('GET / should trigger the info branch', async () => {
    const response = await request(app).get('/');
    expect(response.statusCode).toBe(200);
    // Verifying the full team author string
    expect(response.body.author).toBe(
      'Alexios Kalmpouros, Panagiotis Peppas, Albert Jefferson Abuy, Ydnar Nick Rico',
    );
  });

  test('POST /start should trigger the start branch', async () => {
    const response = await request(app).post('/start').send(mockState);
    expect(response.statusCode).toBe(200);
    expect(response.text).toBe('ok');
  });

  test('POST /move should trigger the move branch', async () => {
    const response = await request(app).post('/move').send(mockState);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('move');
  });

  test('POST /end should trigger the end branch', async () => {
    const response = await request(app).post('/end').send(mockState);
    expect(response.statusCode).toBe(200);
    expect(response.text).toBe('ok');
  });
});
