const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/scrape', async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).send('Falta parámetro url');

  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });

    // Aquí haces el scraping que necesites, por ejemplo:
    const content = await page.content();

    await browser.close();

    res.send(content);
  } catch (err) {
    console.error('Error scraping:', err);
    res.status(500).send('Error interno en el scraper');
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
