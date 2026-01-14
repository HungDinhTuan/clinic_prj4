import express from 'express'
import { addDoctor, loginAdmin, getAllDoctors, appointmentsAdmin, cancelAppointmentAdmin, adminDashboard, addMedicine, getAllMedicines, editMedicine, deleteMedicine, findMedicineById, addMedicalTest, getAllMedicalTests, editMedicalTest, deleteMedicalTest, findMedicalTestById, addTestingStaff, getAllTestingStaff, pagingMedicalTests, pagingMedicines, addNurse, getAllNurses } from '../controllers/adminController.js'
import { changeAvailablityD } from '../controllers/doctorController.js'
import { changeAvailablityTS } from '../controllers/testingStaffController.js'
import upload from '../middlewares/multer.js'
import authAdmin from '../middlewares/authAdmin.js'
import { changeNurseAvailability } from '../controllers/nurseController.js'
import { searchMedicalRecords } from '../controllers/doctorController.js'

const adminRoute = express.Router();

adminRoute.post('/login', loginAdmin);
adminRoute.post('/add-doctor', authAdmin, upload.single('image'), addDoctor);
adminRoute.get('/all-doctors', authAdmin, getAllDoctors);
adminRoute.put('/change-availability-doctor', authAdmin, changeAvailablityD);
adminRoute.put('/change-availability-nurse', authAdmin, changeNurseAvailability);
adminRoute.post('/add-testing-staff', authAdmin, upload.single('image'),addTestingStaff);
adminRoute.get('/all-testing-staffs', authAdmin, getAllTestingStaff);
adminRoute.put('/change-availability-testing-staff', authAdmin, changeAvailablityTS);
adminRoute.get('/appointments', authAdmin, appointmentsAdmin);
adminRoute.put('/cancel-appointment', authAdmin, cancelAppointmentAdmin);
adminRoute.get('/dashboard', authAdmin, adminDashboard);
adminRoute.post('/add-medicine', authAdmin, addMedicine);
adminRoute.get('/medicines', authAdmin, getAllMedicines);
adminRoute.get('/medicines-paging', authAdmin, pagingMedicines);
adminRoute.get('/medicine/:id', authAdmin, findMedicineById);
adminRoute.put('/update-medicine', authAdmin, editMedicine);
adminRoute.delete('/delete-medicine', authAdmin, deleteMedicine);
adminRoute.post('/add-medical-test', authAdmin, addMedicalTest);
adminRoute.get('/medical-tests', authAdmin, getAllMedicalTests);
adminRoute.get('/medical-tests-paging', authAdmin, pagingMedicalTests);
adminRoute.put('/update-medical-test', authAdmin, editMedicalTest);
adminRoute.get('/medical-test/:id', authAdmin, findMedicalTestById);
adminRoute.delete('/delete-medical-test', authAdmin, deleteMedicalTest);
adminRoute.post('/add-nurse', authAdmin, upload.single('image'), addNurse);
adminRoute.get('/all-nurses', authAdmin, getAllNurses);
adminRoute.post('/search-medical-records', authAdmin, searchMedicalRecords);

export default adminRoute