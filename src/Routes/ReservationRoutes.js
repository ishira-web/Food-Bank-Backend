import express from 'express'
import { createReservation, getAllReservations, updateReservationStatus} from '../Controllers/ReservationController.js';

export const router = express.Router();

router.post('/create-reservation', createReservation);
router.get('/getall-reservations', getAllReservations);
router.patch('/update-reservation/:id',updateReservationStatus);
