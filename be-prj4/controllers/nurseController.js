import nurseModel from '../models/nurseModel.js';
import doctorModel from '../models/doctorModel.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { parseDateToSlotDate } from './doctorController.js';
import appointmentModel from '../models/appointmentModel.js';
import medicalRecordModel from '../models/medicalRecordModel.js';

//api change nurse availability
const changeNurseAvailability = async (req, res) => {
    try {
        const { nurseId } = req.body;

        const nurseData = await nurseModel.findById(nurseId);
        if (!nurseData) {
            return res.status(404).json({
                success: false,
                message: "Nurse not found"
            });
        }
        nurseData.available = !nurseData.available;
        await nurseData.save();
        return res.status(200).json({
            success: true,
            message: "Nurse availability updated successfully",
            nurseData
        });
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            success: false,
            message: e.message
        });
    }
}

// api login nurse
const loginNurse = async (req, res) => {
    try {
        const { email, password } = req.body;

        const nurseData = await nurseModel.findOne({ email });
        if (!nurseData) {
            return res.status(404).json({
                success: false,
                message: "Nurse not found"
            });
        }

        const isPasswordMatch = await bcrypt.compare(password, nurseData.password);
        if (!isPasswordMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        const token = jwt.sign({ id: nurseData._id }, process.env.JWT_SECRET_KEY);
        return res.status(200).json({
            success: true,
            token
        });
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            success: false,
            message: e.message
        });
    }
}

//api get profile
const getNurseProfile = async (req, res) => {
    try {
        const nurseData = req.nurse;
        return res.status(200).json({
            success: true,
            nurseData
        });
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            success: false,
            message: e.message
        });
    }
}

//api update profile
const updateNurseProfile = async (req, res) => {
    try {
        const nurseData = req.nurse;
        const { address, available } = req.body;
        const nurseId = nurseData._id;

        await nurseModel.findByIdAndUpdate(nurseId, { address, available });

        return res.status(200).json({
            success: true,
            message: "Nurse profile updated successfully"
        });
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            success: false,
            message: e.message
        });
    }
}

// api get all doctors in same category with nurse
const getDoctorsByNurseCategory = async (req, res) => {
    try {
        const nurseData = req.nurse;
        const speciality = nurseData.speciality;
        const doctors = await doctorModel.find({ speciality }).select('-password');
        return res.status(200).json({
            success: true,
            doctors
        });
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            success: false,
            message: e.message
        });
    }
}

// api get waiting list patients for nurse
const getWaitingPatients = async (req, res) => {
    try {
        const { docId } = req.body;
        const { date } = req.query;

        if (!docId) {
            return res.status(400).json({
                success: false,
                message: "Doctor ID is required"
            });
        }

        const doctorData = await doctorModel.findById(docId);
        if (!doctorData) {
            return res.status(404).json({
                success: false,
                message: "Doctor not found"
            });
        }

        const slotDate = parseDateToSlotDate(date);
        // Get appointments for the doctor
        const appointmentQuery = { docId, cancelled: false, isCompleted: 'pending' || 'in-tests' };
        // Filter by date if provided
        if (date) {
            appointmentQuery.slotDate = slotDate;
        }
        const appointments = await appointmentModel.find(appointmentQuery);
        // console.log(appointments);

        // sort appointments by slotDate
        appointments.sort((a, b) => {
            const [dayA, monthA, yearA] = a.slotDate.split('_').map(Number);
            const [dayB, monthB, yearB] = b.slotDate.split('_').map(Number);
            const dateA = new Date(yearA, monthA - 1, dayA);
            const dateB = new Date(yearB, monthB - 1, dayB);
            return dateA - dateB;
        });

        const medicalRecords = await medicalRecordModel.find({
            doctorId: docId,
            isCompleted: false
        }).populate({
            path: 'userId',
            select: 'name image dob phone gender'
        });
        
        // filter medical records where all ordered tests are completed
        let medicalRecordsTestsDone = medicalRecords.filter(record => {
            return record.orderedTests.every(test => test.status === 'completed');
        });

        // Filter medical records by date if provided
        if (date) {
            medicalRecordsTestsDone = medicalRecordsTestsDone.filter(record => record.slotDate === date);
        }
        // console.log('before sort', medicalRecordsTestsDone);

        // sort medical records done by testDoneAt
        medicalRecordsTestsDone.sort((a, b) => {
            const maxTestDoneAtA = a.orderedTests.length > 0 ? new Date(Math.max(...a.orderedTests.map(test => test.testDoneAt ? new Date(test.testDoneAt) : 0))) : new Date(0);
            const maxTestDoneAtB = b.orderedTests.length > 0 ? new Date(Math.max(...b.orderedTests.map(test => test.testDoneAt ? new Date(test.testDoneAt) : 0))) : new Date(0);
            return maxTestDoneAtA - maxTestDoneAtB;
        });
        // console.log('after sort', medicalRecordsTestsDone);

        const waitingPatients = [];
        let i = 0, j = 0;
        // if(appointments.length === 0) waitingPatients = medicalRecordsTestsDone;
        // if(medicalRecordsTestsDone.length === 0) waitingPatients = appointments;
        // merge two sorted arrays appointments and medicalRecordsTestsDone to get first two from appointments then one from medicalRecordsTestsDone
        while (i < appointments.length || j < medicalRecordsTestsDone.length) {
            if (i < appointments.length) {
                waitingPatients.push({ ...appointments[i].toObject(), from: 'appointment' });
                i++;
            }
            if (i < appointments.length) {
                waitingPatients.push({ ...appointments[i].toObject(), from: 'appointment' });
                i++;
            }
            if (j < medicalRecordsTestsDone.length) {
                waitingPatients.push({ ...medicalRecordsTestsDone[j].toObject(), userModel: medicalRecordsTestsDone[j].userId, from: 'medicalRecord' });
                j++;
            }
        }
        // console.log(waitingPatients);

        return res.status(200).json({
            success: true,
            waitingPatients,
            selectedDate: date || null
        });
    } catch (e) {
        console.log(e);
        res.status(403).send({
            success: false,
            message: e.message
        });
    }
}

// api patient check up
const patientCheckup = async (req, res) => {
    try {
        const { waitingPatients, index } = req.body;

        if ( Array.isArray(waitingPatients) === false || waitingPatients.length < 0 || index < 0 || index >= waitingPatients.length ) {
            return res.status(400).json({
                success: false,
                message: "Invalid input data"
            });
        }
        const item = waitingPatients.splice(index, 1)[0];
            waitingPatients.unshift(item);

            res.status(200).json({
                success: true,
                message: "Patient checkup completed",
                waitingPatients
            });
    } catch (e) {
        console.log(e);
        res.status(403).send({
            success: false,
            message: e.message
        });
    }
}

export { changeNurseAvailability, loginNurse, getDoctorsByNurseCategory, getWaitingPatients, getNurseProfile, updateNurseProfile, patientCheckup };