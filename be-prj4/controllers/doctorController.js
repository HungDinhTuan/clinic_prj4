import doctorModel from '../models/doctorModel.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import appointmentModel from '../models/appointmentModel.js'
import medicalRecordModel from '../models/medicalRecordModel.js'

const changeAvailablityD = async (req, res) => {
    try {
        const { docId } = req.body;

        const docData = await doctorModel.findById(docId);
        await doctorModel.findByIdAndUpdate(docId, { available: !docData.available });

        res.status(200).json({
            success: true,
            message: "Doctor availablity changed successfully."
        });
    } catch (e) {
        console.log(e);
        res.status(405).json({
            success: false,
            message: e.message
        });
    }
}

const doctorList = async (req, res) => {
    try {
        const doctors = await doctorModel.find({/*available: true*/ }).select(['-password', '-email']);

        res.status(200).json({
            success: true,
            doctors
        })
    } catch {
        console.log(e);
        res.status(403).json({
            success: false,
            message: e.message
        });
    }
}

// api doctor login
const loginDoctor = async (req, res) => {
    try {
        const { email, password } = req.body;
        const doctor = await doctorModel.findOne({ email });

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        if (!doctor) {
            res.status(403).send({
                success: false,
                message: "Fail to log in."
            });
        }

        const isMatch = await bcrypt.compare(password, doctor.password);

        if (isMatch) {
            const token = jwt.sign({ id: doctor._id }, process.env.JWT_SECRET_KEY);

            res.json({
                success: true,
                token
            });
        } else {
            res.status(403).send({
                success: false,
                message: "Fail to log in."
            });
        }

    } catch (e) {
        console.log(e);
        res.status(403).send({
            success: false,
            message: e.message
        });
    }
}

// api to get doctor appointments
const appointmentsDoctor = async (req, res) => {
    try {
        const doctorData = req.doctor;
        const docId = doctorData._id;

        const appointments = await appointmentModel.find({ docId }, { cancelled: false }, { isCompleted: false });

        res.json({
            success: true,
            appointments: appointments.reverse()
        });

    } catch (e) {
        console.log(e);
        res.status(403).send({
            success: false,
            message: e.message
        });
    }
}

// api to mark appointment completed for doctor panel
const appointmentComplete = async (req, res) => {
    try {
        const doctorData = req.doctor;
        const appointmentId = req.body;

        if (!appointmentId) {
            res.status(403).send({
                success: false,
                message: "This appointment isn't exists."
            });
        }

        const appointmentData = await appointmentModel.findById(appointmentId);

        if (!appointmentData) {
            res.status(403).send({
                success: false,
                message: "This appointment isn't exists."
            });
        }

        if (doctorData._id != appointmentData.docId) {
            res.status(401).send({
                success: false,
                message: "You do not have permission."
            });
        }

        await appointmentModel.findByIdAndUpdate(appointmentId, { isCompleted: true });

        return res.json({
            success: true,
            message: "Appointment Completed"
        });

    } catch (e) {
        console.log(e);
        res.status(403).send({
            success: false,
            message: e.message
        });
    }
}

// api get dashboard data for doctor panel
const doctorDashboard = async (req, res) => {
    try {
        const docData = req.doctor;
        const docId = docData._id;

        const appointments = await appointmentModel.find({ docId }, { cancelled: false });

        let earnings = 0;
        let patients = [];
        appointments.map((item) => {
            if (item.isCompleted || item.payment) {
                earnings += item.amount;
            }
            if (!patients.includes(item.userId)) {
                patients.push(item.userId);
            }
        });

        const dashData = {
            earnings,
            appointments: appointments.length,
            patients: patients.length,
            lastestAppointments: appointments.reverse().slice(0, 5)
        }

        res.json({
            success: true,
            dashData
        });

    } catch (e) {
        console.log(e);
        res.status(403).send({
            success: false,
            message: e.message
        });
    }
}

// api profile doctor
const doctorProfile = async (req, res) => {
    try {
        const docData = req.doctor;

        res.json({
            success: true,
            docData
        });
    } catch (e) {
        console.log(e);
        res.status(403).send({
            success: false,
            message: e.message
        });
    }
}

// api update doctor profile
const updateDoctorProfile = async (req, res) => {
    try {
        const docData = req.doctor;
        const { address, available } = req.body;
        const docId = docData._id;

        await doctorModel.findByIdAndUpdate(docId, { address, available });

        res.json({
            success: true,
            message: "Profile updated"
        });

    } catch (e) {
        console.log(e);
        res.status(403).send({
            success: false,
            message: e.message
        });
    }
}

const createMedicalRecord = async (req, res) => {
    try {
        const { userId, symptoms, diagnosis } = req.body;
        const docData = req.doctor;

        if (!userId || !symptoms || !diagnosis) {
            return res.status(403).json({
                success: false,
                message: "Missing details."
            });
        }

        const medicalRecordData = {
            doctorId: docData._id,
            userId,
            symptoms,
            diagnosis
        }

        const newMedicalRecord = new medicalRecordModel(medicalRecordData);
        await newMedicalRecord.save();

        return res.json({
            success: true,
            message: "Create successfull."
        });

    } catch (e) {
        console.log(e);
        res.status(403).send({
            success: false,
            message: e.message
        });
    }
}

const createMedicalTestToMedicalRecord = async () => {

}

const createMedicineToMedicaRecord = async () => {

}

export { changeAvailablityD, doctorList, loginDoctor, appointmentsDoctor, appointmentComplete, doctorDashboard, doctorProfile, updateDoctorProfile, createMedicalRecord, createMedicalTestToMedicalRecord, createMedicineToMedicaRecord }