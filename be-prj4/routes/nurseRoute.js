import express from 'express';
import { getDoctorsByNurseCategory, getNurseProfile, getWaitingPatients, loginNurse, patientCheckup, updateNurseProfile } from '../controllers/nurseController.js';
import authNurse from '../middlewares/authNurse.js';
import { searchMedicalRecords } from '../controllers/doctorController.js';

const nurseRoute = express.Router();

nurseRoute.post('/login', loginNurse);
nurseRoute.get('/list-doctors', authNurse, getDoctorsByNurseCategory);
nurseRoute.post('/waiting-patients', authNurse, getWaitingPatients);
nurseRoute.post('/search-medical-records', authNurse, searchMedicalRecords);
nurseRoute.get('/get-nurse-profile', authNurse, getNurseProfile);
nurseRoute.put('/update-nurse-profile', authNurse, updateNurseProfile);
nurseRoute.post('/patient-checkup', authNurse, patientCheckup);

export default nurseRoute