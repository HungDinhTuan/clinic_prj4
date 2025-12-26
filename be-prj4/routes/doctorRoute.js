import express from 'express';
import { doctorList, loginDoctor, appointmentsDoctor, appointmentComplete, doctorDashboard, doctorProfile, updateDoctorProfile, createMedicalRecord } from '../controllers/doctorController.js';
import authDoctor from '../middlewares/authDoctor.js';

const doctorRoute = express.Router();

doctorRoute.get('/list', doctorList);
doctorRoute.post('/login', loginDoctor);
doctorRoute.get('/appointments', authDoctor, appointmentsDoctor);
doctorRoute.put('/complete-appointment', authDoctor, appointmentComplete);
doctorRoute.get('/dashboard', authDoctor, doctorDashboard);
doctorRoute.get('/profile', authDoctor, doctorProfile);
doctorRoute.put('/update-profile', authDoctor, updateDoctorProfile);
doctorRoute.post('/create-medical-record', authDoctor, createMedicalRecord);

export default doctorRoute