import express from 'express';
import { loginTestingStaff, changeAvailablityTS, getPendingTests, updateTestResult } from '../controllers/testingStaffController.js';
import authTestingStaff from '../middlewares/authTestingStaff.js';
import uploadMulti from '../middlewares/multerMulti.js';
import { getAllMedicalTests } from '../controllers/adminController.js';

const testingStaffRoute = express.Router();

testingStaffRoute.post('/login', loginTestingStaff);
testingStaffRoute.put('/change-availability', authTestingStaff, changeAvailablityTS);
testingStaffRoute.get('/medical-tests', authTestingStaff, getAllMedicalTests);
testingStaffRoute.get('/pending-tests', authTestingStaff, getPendingTests);
testingStaffRoute.put('/update-test/:recordId/:testId', authTestingStaff, uploadMulti.array('images', 5), updateTestResult);

export default testingStaffRoute;