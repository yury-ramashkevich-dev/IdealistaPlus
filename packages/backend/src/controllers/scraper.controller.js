import { scrapeProperty } from '../services/puppeteer.service.js';
import { isValidIdealistaUrl, normalizeUrl } from '../utils/validation.js';
import logger from '../utils/logger.js';

export async function getProperty(req, res, next) {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'URL is required.'
      });
    }

    if (!isValidIdealistaUrl(url)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid URL. Must be an Idealista property URL (e.g. https://www.idealista.com/inmueble/12345678/).'
      });
    }

    const normalizedUrl = normalizeUrl(url);
    logger.info(`Property request received: ${normalizedUrl}`);

    const data = await scrapeProperty(normalizedUrl);

    res.json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
}
