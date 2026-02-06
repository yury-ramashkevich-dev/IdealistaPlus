import puppeteerExtra from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import logger from '../utils/logger.js';

puppeteerExtra.use(StealthPlugin());

let browser = null;

async function getBrowser() {
  if (!browser || !browser.connected) {
    logger.info('Launching visible Chrome browser (solve CAPTCHA once if prompted)');
    browser = await puppeteerExtra.launch({
      headless: false,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-blink-features=AutomationControlled',
        '--window-size=1366,768',
        '--start-maximized'
      ],
      defaultViewport: null
    });

    // Keep a background tab open so browser doesn't close when scraping tabs are closed
    const keepAlive = await browser.newPage();
    await keepAlive.goto('about:blank');
  }
  return browser;
}

function hasCaptchaContent(html) {
  return html.includes('captcha-delivery.com') || html.includes('DataDome');
}

async function setupPage(browserInstance) {
  const page = await browserInstance.newPage();
  await page.setRequestInterception(true);
  page.on('request', (req) => {
    if (req.resourceType() === 'media') {
      req.abort();
    } else {
      req.continue();
    }
  });
  return page;
}

export async function scrapeProperty(url) {
  const startTime = Date.now();
  logger.info(`Scraping property: ${url}`);

  const browserInstance = await getBrowser();
  let page = await setupPage(browserInstance);

  try {
    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 45000
    });

    // Check for CAPTCHA
    let html = await page.content();
    if (hasCaptchaContent(html)) {
      logger.warn('CAPTCHA detected - waiting for user to solve it in the browser window...');

      const maxWait = 120000;
      const checkInterval = 2000;
      const waitStart = Date.now();

      // Wait for CAPTCHA to be solved (page will navigate)
      let captchaResolved = false;
      while (!captchaResolved) {
        if (Date.now() - waitStart > maxWait) {
          const error = new Error(
            'CAPTCHA timeout: Please solve the CAPTCHA in the Chrome window within 2 minutes.'
          );
          error.statusCode = 503;
          throw error;
        }

        await new Promise(resolve => setTimeout(resolve, checkInterval));

        try {
          html = await page.content();
          captchaResolved = !hasCaptchaContent(html);
        } catch {
          // Context destroyed = page navigated away from CAPTCHA = solved
          captchaResolved = true;
        }
      }

      logger.info('CAPTCHA resolved! Opening fresh page to scrape...');

      // Close the CAPTCHA page and open a fresh one.
      // The browser now has DataDome cookies from the solved CAPTCHA.
      try { await page.close(); } catch { /* already gone */ }

      page = await setupPage(browserInstance);
      await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: 45000
      });

      // Verify no CAPTCHA on the fresh page
      html = await page.content();
      if (hasCaptchaContent(html)) {
        const error = new Error(
          'CAPTCHA appeared again. Please try again — the session may need a fresh solve.'
        );
        error.statusCode = 503;
        throw error;
      }
    }

    // Wait for main content to load
    await page.waitForSelector('.info-data-price, .price-row, [class*="price"]', { timeout: 15000 })
      .catch(() => logger.warn('Price selector not found, continuing extraction'));

    // Small delay to let dynamic content settle
    await new Promise(resolve => setTimeout(resolve, 2000));

    const data = await page.evaluate(() => {
      const getText = (selector) => {
        const el = document.querySelector(selector);
        return el ? el.textContent.trim() : null;
      };

      const getTexts = (selector) => {
        return Array.from(document.querySelectorAll(selector))
          .map(el => el.textContent.trim())
          .filter(Boolean);
      };

      // Price
      const price = getText('.info-data-price') || getText('.price-row');

      // Title
      const title = getText('.main-info__title-main') || getText('.main-info__title');

      // Details from info-features
      const detailSpans = getTexts('.info-features span');
      let size = null;
      let rooms = null;
      let bathrooms = null;

      for (const span of detailSpans) {
        if (span.includes('m²')) size = span;
        else if (span.includes('hab')) rooms = span;
        else if (span.includes('baño')) bathrooms = span;
      }

      // Description
      const description = getText('.comment .adCommentsBody')
        || getText('.comment')
        || getText('.adCommentsBody');

      // Images
      const imageSet = new Set();
      document.querySelectorAll(
        '.detail-multimedia img, .detail-multimedia-gallery img, ' +
        '.carousel-img, img[src*="img3.idealista.com"], img[src*="img4.idealista.com"]'
      ).forEach(img => {
        const src = img.src || img.dataset?.src || img.getAttribute('data-lazy');
        if (src && src.startsWith('http')) {
          const fullSrc = src.replace(/\/S\d+x\d+\//, '/');
          imageSet.add(fullSrc);
        }
      });

      // Also check for images in picture elements
      document.querySelectorAll('picture source').forEach(source => {
        const srcset = source.srcset;
        if (srcset && srcset.includes('idealista.com')) {
          const src = srcset.split(',')[0].trim().split(' ')[0];
          imageSet.add(src);
        }
      });

      // Features
      const features = getTexts('.details-property_features li, .details-property-feature-one li');

      return {
        price,
        title,
        size,
        rooms,
        bathrooms,
        description,
        images: Array.from(imageSet),
        features
      };
    });

    const elapsed = Date.now() - startTime;
    logger.info(`Scraping completed in ${elapsed}ms - ${data.title || 'No title'}`);

    return {
      url,
      ...data,
      scrapedAt: new Date().toISOString()
    };
  } catch (error) {
    const elapsed = Date.now() - startTime;
    logger.error(`Scraping failed after ${elapsed}ms: ${error.message}`);
    throw error;
  } finally {
    try { await page.close(); } catch { /* already closed */ }
  }
}

export async function closeBrowser() {
  if (browser) {
    await browser.close();
    browser = null;
    logger.info('Browser instance closed');
  }
}
