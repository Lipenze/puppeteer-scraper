const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/scrape', async (req, res) => {
  let browser;
  try {
    browser = await puppeteer.launch({
      executablePath: '/usr/bin/google-chrome', // Chrome ya instalado en Render
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();

    // Aquí pones la URL que quieres scrapear
    const url = req.query.url;
    if (!url) {
      return res.status(400).send('Falta parámetro url');
    }

    await page.goto(url, { waitUntil: 'networkidle2' });

    // Ejemplo: obtener todos los enlaces de video en la página
    const videos = await page.evaluate(() => {
      // Cambia este selector según la web que scrapees
      const links = Array.from(document.querySelectorAll('a'));
      return links
        .map(a => a.href)
        .filter(href => href && href.match(/\.(mp4|webm|ogg)$/));
    });

    res.json({ videos });

  } catch (error) {
    console.error(error);
    res.status(500).send('Error scraping');
  } finally {
    if (browser) {
      await browser.close();
    }
  }
});

app.listen(PORT, () => {
  console.log(`Server escuchando en puerto ${PORT}`);
});
