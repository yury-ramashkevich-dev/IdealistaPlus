import { Router } from 'express';
import { getProperty } from '../controllers/scraper.controller.js';

const router = Router();

router.post('/property', getProperty);

export default router;
