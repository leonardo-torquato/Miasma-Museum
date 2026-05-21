// backend/src/routes/image.routes.ts
import { Router } from 'express';
import { getImage } from '../controllers/image.controller';

const router = Router();

// Rota GET: /api/imagens?src=<url-encoded>
router.get('/', getImage);

export default router;
