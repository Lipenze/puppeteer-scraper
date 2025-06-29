const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/scrape', async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).send('Falta el parámetro ?url');

  try {
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });

    // Puedes adaptar esto al contenido que buscas:
    const result = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a'));
      return links.map(link => link.href).filter(href => href.includes('.mp4') || href.includes('m3u8'));
    });

    await browser.close();
    res.json({ links: result });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error en el scraping');
  }
});

app.get('/', (req, res) => {
  res.send('Servidor Puppeteer funcionando 🟢');
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
