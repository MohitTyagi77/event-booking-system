import { Router } from 'express';
import { createBookingHandler, getBookingsHandler } from '../controllers/bookingController.js';
import { adminOnly } from '../middleware/adminAuth.js';

const bookingRoutes = (io) => {
  const router = Router();

  router.post('/', createBookingHandler(io));
  router.get('/', adminOnly, getBookingsHandler);

  return router;
};

export default bookingRoutes;
