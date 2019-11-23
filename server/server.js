const cors = require('cors');
const express = require('express');
const fetch = require('node-fetch');

const app = express();
app.use(cors());

// See https://duckduckgo.com/api.
app.get('/search/:query', async (req, res) => {
  const { query } = req.params;
  console.log('server.js query =', query);
  const encoded = encodeURIComponent(query);
  const url = `https://api.duckduckgo.com/?q=${encoded}&format=json&t=svelte-speech`;
  console.log('App.svelte search: url =', url);
  try {
    const result = await fetch(url);
    const json = await result.json();
    console.log('server.js x: json =', json);
    res.set('Content-Type', 'application/json');
    res.end(JSON.stringify(json));
  } catch (e) {
    console.error(e);
    res.status(500).send(e.message);
  }
});

const PORT = 1919;
app.listen(PORT, () => console.log('listening on', PORT));
