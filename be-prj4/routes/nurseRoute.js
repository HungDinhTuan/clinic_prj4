import express from 'express';
import { getDoctorsByNurseCategory, getWaitingPatients, loginNurse } from '../controllers/nurseController.js';
import authNurse from '../middlewares/authNurse.js';

const nurseRoute = express.Router();

nurseRoute.post('/login', loginNurse);
nurseRoute.get('/list-doctors', authNurse, getDoctorsByNurseCategory);
nurseRoute.get('/waiting-patients', authNurse, getWaitingPatients);

export default nurseRoute