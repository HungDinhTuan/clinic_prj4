import express from 'express';
import { doctorList, loginDoctor, appointmentsDoctor, appointmentComplete, doctorDashboard, doctorProfile, updateDoctorProfile, createDiagnosis, prescribedMedicines, getWaitingPatients, getMedicalTestsDone, getMedicalRecordsDoneByUserId, getWaitingTestsResult, searchMedicalRecords } from '../controllers/doctorController.js';
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
doctorRoute.post('/create-diagnosis', authDoctor, createDiagnosis);
doctorRoute.put('/prescription-medicines', authDoctor, prescribedMedicines);
doctorRoute.post('/medical-tests-done', authDoctor, getMedicalTestsDone);
doctorRoute.get('/waiting-patients', authDoctor, getWaitingPatients);
doctorRoute.post('/medical-record', authDoctor, getMedicalRecordsDoneByUserId);
doctorRoute.get('/waiting-tests-result', authDoctor, getWaitingTestsResult);
doctorRoute.post('/search-medical-records', authDoctor, searchMedicalRecords);

export default doctorRoute