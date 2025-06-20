import express from 'express'
import { confirmReservation, createReservation, getAllReservations, rejectReservation } from '../Controllers/ReservationController.js';

export const router = express.Router();

router.post('/', createReservation);
router.get('/', getAllReservations);
router.patch('/:reservationId/confirm', confirmReservation);
router.patch('/:reservationId/reject', rejectReservation);