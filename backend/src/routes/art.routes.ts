import { Router } from 'express';
import { getArts } from '../controllers/art.controller';

const router = Router();

// Rota GET: /api/artes/
// Responsável por entregar o array de obras de arte para o jogo
router.get('/', getArts);

export default router;