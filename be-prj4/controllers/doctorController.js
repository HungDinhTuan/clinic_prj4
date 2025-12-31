import doctorModel from '../models/doctorModel.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import appointmentModel from '../models/appointmentModel.js'
import medicalRecordModel from '../models/medicalRecordModel.js'
import medicalTestModel from '../models/medicalTestModel.js'
import testingStaffModel from '../models/testingStaffModel.js'
import userModel from '../models/userModel.js'
import medicineModel from '../models/medicineModel.js'

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

        const appointments = await appointmentModel.find({ docId, cancelled: false, isCompleted: false });

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
        const { appointmentId } = req.body;

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

const createDiagnosis = async (req, res) => {
    try {
        const { symptons, diagnosis, testIds, appointmentId, notes } = req.body;
        const docData = req.doctor;

        if (!symptons || !diagnosis || !appointmentId) {
            return res.status(400).json({
                success: false,
                message: "Missing details."
            });
        }

        const appointmentData = await appointmentModel.findById(appointmentId);

        // Kiểm tra appointment trước khi sử dụng
        if (!appointmentData) {
            return res.status(404).json({
                success: false,
                message: "Appointment does not exist."
            });
        }

        // Kiểm tra quyền doctor
        if (appointmentData.docId.toString() !== docData._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "You do not have permission to create diagnosis for this appointment."
            });
        }

        const userId = appointmentData.userId;
        const userData = await userModel.findById(userId);

        if (!userData) {
            return res.status(404).json({
                success: false,
                message: "User does not exist."
            });
        }

        const slotDate = appointmentData?.slotDate;

        // assign tests to testing staffs
        let orderedTests = [];
        let errors = [];
        if (testIds && testIds.length > 0) {
            for (const testId of testIds) {
                const testData = await medicalTestModel.findById(testId);
                if (!testData) {
                    errors.push(`Medical test does not exist for id: ${testId}.`);
                    continue;
                }
                // find available testing staffs for this test category
                const testingStaffs = await testingStaffModel.find({ department: testData.category, available: true });
                if (testingStaffs.length === 0) {
                    errors.push(`No available testing staff for the test: ${testData.name}.`);
                    continue;
                }
                // find the testing staff with the least booked tests for this specific date
                let minTests = Infinity;
                let matchTestingStaff = null;
                testingStaffs.forEach(staff => {
                    const testCount = (staff.slots_booked[slotDate] || []).length;
                    if (testCount < minTests) {
                        minTests = testCount;
                        matchTestingStaff = staff;
                    }
                });
                // assign the test to the matched testing staff
                if (matchTestingStaff) {
                    const staffId = matchTestingStaff._id;
                    const updatedSlotsBooked = { ...matchTestingStaff.slots_booked };
                    if (!updatedSlotsBooked[slotDate]) {
                        updatedSlotsBooked[slotDate] = [];
                    }
                    const elemetOfSlotDate = `${testId}_${appointmentId}_${userId}`;
                    updatedSlotsBooked[slotDate].push(elemetOfSlotDate);
                    await testingStaffModel.findByIdAndUpdate(staffId, { slots_booked: updatedSlotsBooked });
                } else {
                    errors.push(`No available testing staff for the test: ${testData.name}.`);
                }
                let orderedTest = {
                    testId: testData._id,
                    medicalTestData: testData,
                    performedId: matchTestingStaff ? matchTestingStaff._id : null,
                    status: 'pending'
                };
                orderedTests.push(orderedTest);
            }
        }

        if (errors.length > 0) {
            return res.status(403).send({
                success: false,
                message: 'Some tests could not be assigned.',
                errors
            });
        }

        const medicalRecordData = {
            doctorId: docData._id,
            userId,
            symptons,
            diagnosis,
            appointmentId,
            slotDate: appointmentData.slotDate,
            slotTime: appointmentData.slotTime,
            userData,
            orderedTests,
            notes
        };

        const newMedicalRecord = new medicalRecordModel(medicalRecordData);
        await newMedicalRecord.save();

        // Set status based on whether tests were ordered
        appointmentData.isCompleted = orderedTests.length > 0 ? 'in-tests' : 'completed';
        await appointmentData.save();

        return res.json({
            success: true,
            message: "Create diagnosis successfully."
        });

    } catch (e) {
        console.log(e);
        res.status(403).send({
            success: false,
            message: e.message
        });
    }
}

const prescribedMedicines = async (req, res) => {
    try {
        const { medicalRecordId, medicines, followUpDate } = req.body;
        const doctorData = req.doctor;
        // console.log(medicines);

        if (!medicalRecordId || !medicines || medicines.length === 0 || !followUpDate) {
            return res.status(403).json({
                success: false,
                message: "Missing details."
            });
        }

        const medicalRecordData = await medicalRecordModel.findById(medicalRecordId);
        if (!medicalRecordData) {
            return res.status(403).json({
                success: false,
                message: "Medical record does not exist."
            });
        }
        // console.log(medicalRecordData);
        const appointmentData = await appointmentModel.findById(medicalRecordData.appointmentId);
        if (!appointmentData) {
            return res.status(403).json({
                success: false,
                message: "Appointment does not exist."
            });
        }

        let prescribedMedicines = [];
        let errors = [];
        for (const med of medicines) {
            // console.log(med);
            const medicineData = await medicineModel.findById(med.medicineId);
            // console.log(med.medicineId);
            // console.log(medicineData);

            if (!medicineData) {
                errors.push(`Medicine does not exist for id: ${med.medicineId}.`);
                continue;
            }
            prescribedMedicines.push({
                medicineId: med.medicineId,
                medicineData,
                frequency: med.frequency,
                dosage: med.dosage,
                durations: med.durations,
                instructions: med.instructions
            });
        }
        if (errors.length > 0) {
            return res.status(403).send({
                success: false,
                message: 'Some medicines could not be added.',
                errors
            });
        }
        medicalRecordData.prescribedMedicines = prescribedMedicines;
        medicalRecordData.followUpDate = followUpDate;
        medicalRecordData.isCompleted = true;
        // medicalRecordData.findByIdAndUpdate(medicalRecordId, { prescribedMedicines, followUpDate });
        await medicalRecordData.save();
        appointmentData.isCompleted = 'completed';
        await appointmentData.save();

        const currentMedicalRecord = await medicalRecordModel.findById(medicalRecordId);

        res.status(200).json({
            success: true,
            message: "Medicines prescribed successfully.",
            currentMedicalRecord
        });
    } catch (e) {
        console.log(e);
        res.status(500).send({
            success: false,
            message: e.message
        });
    }
}

const getWaitingPatients = async (req, res) => {
    try {
        const docData = req.doctor;
        const docId = docData._id;

        const appointments = await appointmentModel.find({ docId, cancelled: false, isCompleted: 'pending' || 'in-tests' });
        // console.log(appointments);

        // sort appointments by slotDate
        appointments.sort((a, b) => {
            const [dayA, monthA, yearA] = a.slotDate.split('_').map(Number);
            const [dayB, monthB, yearB] = b.slotDate.split('_').map(Number);
            const dateA = new Date(yearA, monthA - 1, dayA);
            const dateB = new Date(yearB, monthB - 1, dayB);
            return dateA - dateB;
        });

        const medicalRecords = await medicalRecordModel.find({ doctorId: docId, isCompleted: false }).populate({
            path: 'userId',
            select: 'name image dob phone gender'
        });

        // filter medical records where all ordered tests are completed
        const medicalRecordsTestsDone = medicalRecords.filter(record => {
            return record.orderedTests.every(test => test.status === 'completed');
        });
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

export { changeAvailablityD, doctorList, loginDoctor, appointmentsDoctor, appointmentComplete, doctorDashboard, doctorProfile, updateDoctorProfile, createDiagnosis, prescribedMedicines, getWaitingPatients }