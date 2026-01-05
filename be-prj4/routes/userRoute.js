import express from 'express'
import { registerUser, loginUser, getProfile, updateProfile, bookAppointment, listAppointments, cancelAppointment, findDoctorWithAI, getMedicalRecordByUserId } from '../controllers/userController.js'
import authUser from '../middlewares/authUser.js';
import upload from '../middlewares/multer.js';

const userRouter = express.Router();

userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);
userRouter.get('/get-profile', authUser, getProfile);
userRouter.put('/update-profile', upload.single('image'), authUser, updateProfile);
userRouter.post('/booking-appointment', authUser, bookAppointment);
userRouter.get('/my-appointments', authUser, listAppointments);
userRouter.put('/cancel-appointment', authUser, cancelAppointment);
userRouter.post('/find-doctor', authUser, findDoctorWithAI);
userRouter.get('/medical-records', authUser, getMedicalRecordByUserId);

export default userRouter