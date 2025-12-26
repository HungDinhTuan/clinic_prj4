import express from 'express'
import {loginTestingStaff} from '../controllers/testingStaffController.js'
import authTestingStaff from '../middlewares/authTestingStaff.js'
import uploadMulti from '../middlewares/multerMulti.js';

const testingStaffRoute = express.Router();

testingStaffRoute.post('/login', loginTestingStaff);

export default testingStaffRoute