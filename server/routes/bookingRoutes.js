import { Router } from 'express';
import { createBookingHandler, getBookingsHandler } from '../controllers/bookingController.js';

const bookingRoutes = (io) => {
  const router = Router();

  router.post('/', createBookingHandler(io));
  router.get('/', getBookingsHandler);

  return router;
};

export default bookingRoutes;
