const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/scrape', async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).json({ error: 'No URL provided' });

  try {
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      headless: true,
    });
    const page = await browser.newPage();

    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

    // Espera para que redirecciones se completen
    await page.waitForTimeout(5000);

    const finalUrl = page.url();

    if (finalUrl !== url) {
      await page.goto(finalUrl, { waitUntil: 'networkidle2', timeout: 30000 });
    }

    const videoLink = await page.evaluate(() => {
      const video = document.querySelector('video');
      if (video) return video.src;

      const source = document.querySelector('video source');
      return source ? source.src : null;
    });

    await browser.close();

    if (!videoLink) {
      return res.status(404).json({ error: 'No video found on page' });
    }

    res.json({ videoLink });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
