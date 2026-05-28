import { Router } from 'express';
import { getNodes, createNode, deleteNode, scaleNode } from '../controllers/nodeController';

const router = Router();

router.get('/', getNodes);
router.post('/', createNode);
router.delete('/:id', deleteNode);
router.post('/:id/scale', scaleNode);

export default router;
