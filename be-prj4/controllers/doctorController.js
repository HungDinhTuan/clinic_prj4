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

// const createMedicalRecord = async (req, res) => {
//     try {
//         const { userId, symptoms, diagnosis } = req.body;
//         const docData = req.doctor;

//         if (!userId || !symptoms || !diagnosis) {
//             return res.status(403).json({
//                 success: false,
//                 message: "Missing details."
//             });
//         }

//         const medicalRecordData = {
//             doctorId: docData._id,
//             userId,
//             symptoms,
//             diagnosis
//         }

//         const newMedicalRecord = new medicalRecordModel(medicalRecordData);
//         await newMedicalRecord.save();

//         return res.json({
//             success: true,
//             message: "Create successfull."
//         });

//     } catch (e) {
//         console.log(e);
//         res.status(403).send({
//             success: false,
//             message: e.message
//         });
//     }
// }

// API tạo medical record cơ bản
const createMedicalRecord = async (req, res) => {
    try {
        const { appointmentId, symptoms, diagnosis } = req.body;
        const doctor = req.doctor;

        const appointment = await appointmentModel.findById(appointmentId);
        if (!appointment || appointment.docId.toString() !== doctor._id.toString()) {
            return res.status(403).json({ success: false, message: "Unauthorized" });
        }

        const existingRecord = await medicalRecordModel.findOne({ appointmentId });
        if (existingRecord) {
            return res.status(400).json({ success: false, message: "Record already exists" });
        }

        const newRecord = new medicalRecordModel({
            appointmentId,
            userId: appointment.userId,
            doctorId: doctor._id,
            symptoms,
            diagnosis
        });
        await newRecord.save();

        res.json({ success: true, record: newRecord });
    } catch (e) {
        console.log(e);
        res.status(500).json({ success: false, message: e.message });
    }
};

// API gán tests (tìm staff least busy)
const assignTests = async (req, res) => {
    try {
        const { appointmentId } = req.params;
        const { testIds } = req.body; // Mảng ID test
        const doctor = req.doctor;

        const record = await medicalRecordModel.findOne({ appointmentId, doctorId: doctor._id });
        if (!record) {
            return res.status(404).json({ success: false, message: "Record not found" });
        }

        for (const testId of testIds) {
            const test = await medicalTestModel.findById(testId);
            if (!test) continue;

            // Tìm all staff matching department = test.category, available: true
            const staffs = await testingStaffModel.find({ department: test.category, available: true });

            // Aggregation đếm pending per staff
            const pendingCounts = await medicalRecordModel.aggregate([
                { $unwind: "$orderedTests" },
                { $match: { "orderedTests.status": "pending" } },
                { $group: { _id: "$orderedTests.performedBy", count: { $sum: 1 } } }
            ]);

            let minCount = Infinity;
            let selectedStaff = null;
            staffs.forEach(staff => {
                const count = pendingCounts.find(p => p._id.toString() === staff._id.toString())?.count || 0;
                if (count < minCount) {
                    minCount = count;
                    selectedStaff = staff;
                }
            });

            if (!selectedStaff) {
                return res.status(404).json({ success: false, message: `No available staff for ${test.category}` });
            }

            record.orderedTests.push({
                testId,
                performedBy: selectedStaff._id,
                status: 'pending'
            });
        }

        await record.save();
        res.json({ success: true, message: "Tests assigned" });
    } catch (e) {
        console.log(e);
        res.status(500).json({ success: false, message: e.message });
    }
};

// API kê đơn medicines
const prescribeMedicines = async (req, res) => {
    try {
        const { appointmentId } = req.params;
        const { medicines } = req.body; // Mảng {medicineId, dosage, frequency, duration, instructions}
        const doctor = req.doctor;

        const record = await medicalRecordModel.findOne({ appointmentId, doctorId: doctor._id });
        if (!record) {
            return res.status(404).json({ success: false, message: "Record not found" });
        }

        record.prescribedMedicines.push(...medicines);

        // Kiểm tra nếu all tests completed, set completed
        const allTestsCompleted = record.orderedTests.length === 0 || record.orderedTests.every(test => test.status === "completed");
        if (allTestsCompleted) {
            record.isCompleted = true;
            record.completedAt = new Date();
            await appointmentModel.findByIdAndUpdate(appointmentId, { isCompleted: true });
        }

        await record.save();
        res.json({ success: true, message: "Prescription added" });
    } catch (e) {
        console.log(e);
        res.status(500).json({ success: false, message: e.message });
    }
};

export { changeAvailablityD, doctorList, loginDoctor, appointmentsDoctor, appointmentComplete, doctorDashboard, doctorProfile, updateDoctorProfile, createMedicalRecord, assignTests, prescribeMedicines }