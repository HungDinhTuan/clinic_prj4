import express from 'express'
import authUser from '../middlewares/authUser.js';
import { checkTransition } from '../controllers/paymentController.js';

const paymentRoute = express.Router();

paymentRoute.post('/check-transition', authUser, checkTransition);

export default paymentRoute;