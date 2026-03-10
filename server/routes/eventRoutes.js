import { Router } from 'express';
import {
  createEventHandler,
  deleteEventHandler,
  getEventByIdHandler,
  getEventsHandler,
  updateEventHandler
} from '../controllers/eventController.js';

const router = Router();

router.post('/', createEventHandler);
router.get('/', getEventsHandler);
router.get('/:id', getEventByIdHandler);
router.put('/:id', updateEventHandler);
router.delete('/:id', deleteEventHandler);

export default router;
