import express from 'express';
import { loginTestingStaff, changeAvailablityTS, assignDetailsMedicalTest, getPendingTests } from '../controllers/testingStaffController.js';
import authTestingStaff from '../middlewares/authTestingStaff.js';
import uploadMulti from '../middlewares/multerMulti.js';

const testingStaffRoute = express.Router();

testingStaffRoute.post('/login', loginTestingStaff);
testingStaffRoute.put('/change-availability', authTestingStaff, changeAvailablityTS);
testingStaffRoute.get('/pending-tests', authTestingStaff, getPendingTests);
testingStaffRoute.put('/assign-test', authTestingStaff, uploadMulti('images'), assignDetailsMedicalTest);

export default testingStaffRoute;