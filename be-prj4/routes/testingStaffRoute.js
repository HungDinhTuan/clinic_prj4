import express from 'express';
import { loginTestingStaff, changeAvailablityTS, assignDetailsMedicalTest, getPendingTests, receivingMedicalTest, getWaitingResults, getDetailTestResultById, getTestingStaffProfile, getTestingStaffDashData, updateTestingStaffProfile } from '../controllers/testingStaffController.js';
import authTestingStaff from '../middlewares/authTestingStaff.js';
import uploadMulti from '../middlewares/multerMulti.js';
import { searchMedicalRecords } from '../controllers/doctorController.js';

const testingStaffRoute = express.Router();

testingStaffRoute.post('/login', loginTestingStaff);
testingStaffRoute.put('/change-availability', authTestingStaff, changeAvailablityTS);
testingStaffRoute.get('/pending-tests', authTestingStaff, getPendingTests);
testingStaffRoute.get('/waiting-results', authTestingStaff, getWaitingResults);
testingStaffRoute.put('/received-tests', authTestingStaff, receivingMedicalTest);
testingStaffRoute.put('/assign-test', authTestingStaff, uploadMulti.array('images', 5), assignDetailsMedicalTest);
testingStaffRoute.post('/test-result', authTestingStaff, getDetailTestResultById);
testingStaffRoute.get('/profile', authTestingStaff, getTestingStaffProfile);
testingStaffRoute.put('/profile', authTestingStaff, updateTestingStaffProfile);
testingStaffRoute.get('/dashboard', authTestingStaff, getTestingStaffDashData);
testingStaffRoute.post('/search-medical-records', authTestingStaff, searchMedicalRecords);

export default testingStaffRoute;