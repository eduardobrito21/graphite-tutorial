// API routes

const app = { get: (path, handler) => console.log(`Registered GET ${path}`) };

app.get('/users/:id', (req, res) => {
  res.json({ id: req.params.id, name: 'Alice' });
});

// Exercise: add the GET /notes/:userId route below this line
