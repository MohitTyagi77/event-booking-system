import { Router } from 'express';
import {
  createEventHandler,
  deleteEventHandler,
  getEventByIdHandler,
  getEventsHandler,
  updateEventHandler
} from '../controllers/eventController.js';
import { adminOnly } from '../middleware/adminAuth.js';

const router = Router();

router.post('/', adminOnly, createEventHandler);
router.get('/', getEventsHandler);
router.get('/:id', getEventByIdHandler);
router.put('/:id', adminOnly, updateEventHandler);
router.delete('/:id', adminOnly, deleteEventHandler);

export default router;
