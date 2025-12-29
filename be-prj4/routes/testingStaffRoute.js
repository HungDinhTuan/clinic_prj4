import express from 'express';
import { loginTestingStaff, changeAvailablityTS, assignDetailsMedicalTest, getPendingTests, receivingMedicalTest, getWaitingResults } from '../controllers/testingStaffController.js';
import authTestingStaff from '../middlewares/authTestingStaff.js';
import uploadMulti from '../middlewares/multerMulti.js';

const testingStaffRoute = express.Router();

testingStaffRoute.post('/login', loginTestingStaff);
testingStaffRoute.put('/change-availability', authTestingStaff, changeAvailablityTS);
testingStaffRoute.get('/pending-tests', authTestingStaff, getPendingTests);
testingStaffRoute.get('/waiting-results', authTestingStaff, getWaitingResults);
testingStaffRoute.put('/received-tests', authTestingStaff, receivingMedicalTest);
testingStaffRoute.put('/assign-test', authTestingStaff, uploadMulti.array('images', 5), assignDetailsMedicalTest);

export default testingStaffRoute;