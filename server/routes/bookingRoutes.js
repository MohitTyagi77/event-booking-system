import { Router } from 'express';
import { createBookingHandler, getBookingByIdHandler, getBookingsHandler } from '../controllers/bookingController.js';
import { adminOnly } from '../middleware/adminAuth.js';

const bookingRoutes = (io) => {
  const router = Router();

  router.post('/', createBookingHandler(io));
  router.get('/:id', getBookingByIdHandler);
  router.get('/', adminOnly, getBookingsHandler);

  return router;
};

export default bookingRoutes;
