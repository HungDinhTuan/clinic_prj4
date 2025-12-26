import express from 'express';
import { doctorList, loginDoctor, appointmentsDoctor, appointmentComplete, doctorDashboard, doctorProfile, updateDoctorProfile, createMedicalRecord, assignTests, prescribeMedicines } from '../controllers/doctorController.js';
import authDoctor from '../middlewares/authDoctor.js';
import { getAllMedicalTests, getAllMedicines } from '../controllers/adminController.js';

const doctorRoute = express.Router();

doctorRoute.get('/list', doctorList);
doctorRoute.post('/login', loginDoctor);
doctorRoute.get('/appointments', authDoctor, appointmentsDoctor);
doctorRoute.put('/complete-appointment', authDoctor, appointmentComplete);
doctorRoute.get('/dashboard', authDoctor, doctorDashboard);
doctorRoute.get('/profile', authDoctor, doctorProfile);
doctorRoute.get('/medicines', authDoctor, getAllMedicines);
doctorRoute.get('/medical-tests', authDoctor, getAllMedicalTests);
doctorRoute.put('/update-profile', authDoctor, updateDoctorProfile);
doctorRoute.post('/create-medical-record', authDoctor, createMedicalRecord);
doctorRoute.put('/assign-tests/:appointmentId', authDoctor, assignTests);
doctorRoute.put('/prescribe-medicines/:appointmentId', authDoctor, prescribeMedicines);

export default doctorRoute