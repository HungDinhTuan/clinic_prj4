import testingStaffModel from "../models/testingStaffModel.js"
import medicalRecordModel from "../models/medicalRecordModel.js"
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { v2 as cloudinary } from 'cloudinary'
import appointmentModel from "../models/appointmentModel.js"
import medicalTestModel from "../models/medicalTestModel.js"
import doctorModel from "../models/doctorModel.js"
import e from "express"

//api change avaibility testing staff
const changeAvailablityTS = async (req, res) => {
    try {
        const { testingStaffId } = req.body;

        const testingStaffData = await testingStaffModel.findById(testingStaffId);
        await testingStaffModel.findByIdAndUpdate(testingStaffId, { available: !testingStaffData.available });

        res.status(200).json({
            success: true,
            message: "Testing staff availablity changed successfully."
        });
    } catch (e) {
        console.log(e);
        res.status(405).json({
            success: false,
            message: e.message
        });
    }
}

//api login testing staff
const loginTestingStaff = async (req, res) => {
    try {
        const { email, password } = req.body;
        const testingStaff = await testingStaffModel.findOne({ email });

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        if (!testingStaff) {
            res.status(403).send({
                success: false,
                message: "Fail to log in."
            });
        }

        const isMatch = await bcrypt.compare(password, testingStaff.password);

        if (isMatch) {
            const token = jwt.sign({ id: testingStaff._id }, process.env.JWT_SECRET_KEY);

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

//api get pending tests for testing staff
const getPendingTests = async (req, res) => {
    try {
        const testingStaffData = req.testingStaff;
        const testingStaffId = testingStaffData._id;
        
        const medicalRecords = await medicalRecordModel.find({});

        const pendingTests = [];
        const errors = [];
        for (const record of medicalRecords) {
            for (const test of record.orderedTests) {
                if (test.performedId === testingStaffId && test.status === 'pending') {
                    const medicalTestInfo = await medicalTestModel.findById(test.testId);
                    if (!medicalTestInfo) {
                        errors.push(`Medical test with ID ${test.testId} not found.`);
                        continue;
                    }

                    const doctorData = await doctorModel.findById(record.doctorId);
                    if (!doctorData) {
                        errors.push(`Doctor with ID ${record.doctorId} not found.`);
                        continue;
                    }
                    pendingTests.push({
                        medicalRecordId: record._id,
                        medicalTestInfo,
                        appointmentId: record.appointmentId,
                        doctorId: record.doctorId,
                        doctorData: doctorData,
                        userId: record.userId,
                        userData: record.userData,
                        slotDate: record.slotDate,
                        slotTime: record.slotTime,
                        symptons: record.symptons,
                        diagnosis: record.diagnosis,
                        notes: record.notes,
                        testId: test._id,
                        performedId: test.performedId
                    });
                }
            }
        }
        if (errors.length > 0) {
            return res.status(500).json({
                success: false,
                message: "Some errors occurred.",
                errors
            });
        }

        res.status(200).json({
            success: true,
            pendingTests
        });
    } catch (e) {
        console.log(e);
        res.status(500).json({
            success: false,
            message: e.message
        });
    }
};

//api receiving medical test count ETC
const receivingMedicalTest = async (req, res) => {
    try {
        const { pendingTest } = req.body;
        const testingStaffData = req.testingStaff;

        if (!pendingTest) {
            return res.status(400).json({
                success: false,
                message: "Medical record ID is required."
            });
        }

        if (testingStaffData._id.toString() !== pendingTest.performedId.toString()) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to perform this test."
            });
        }

        // Update the test status to 'in-progress' and set etc
        let etcDate = new Date();
        const update = await medicalRecordModel.updateOne(
            { _id: pendingTest.medicalRecordId, "orderedTests._id": pendingTest.testId, "orderedTests.status": 'pending' },
            {
                $set: {
                    "orderedTests.$.status": 'in-progress',
                    "orderedTests.$.etc": new Date(etcDate.getTime() + (pendingTest.medicalTestInfo?.turnaroundTime || 0) * 3600000)
                }

            }
        );

        if (update.modifiedCount === 0) {
            return res.status(404).json({
                success: false,
                message: "Test not found or already in progress."
            });
        }

        res.status(200).json({
            success: true,
            message: "A medical test in progress.",
        });
    } catch (e) {
        console.log(e);
        res.status(500).json({
            success: false,
            message: e.message
        });
    }
}

//api get waiting results for testing staff
const getWaitingResults = async (req, res) => {
    try {
        const testingStaffData = req.testingStaff;
        const testingStaffId = testingStaffData._id;
        const medicalRecords = await medicalRecordModel.find({
            "orderedTests.performedId": testingStaffId,
            "orderedTests.status": 'in-progress'
        });

        const waitingResults = [];
        const errors = [];
        for (const record of medicalRecords) {
            for (const test of record.orderedTests) {
                if (test.performedId?.toString() === testingStaffId.toString() && test.status === 'in-progress') {
                    const medicalTestInfo = await medicalTestModel.findById(test.testId);
                    if (!medicalTestInfo) {
                        errors.push(`Medical test with ID ${test.testId} not found.`);
                        continue;
                    }

                    const doctorData = await doctorModel.findById(record.doctorId);
                    if (!doctorData) {
                        errors.push(`Doctor with ID ${record.doctorId} not found.`);
                        continue;
                    }
                    waitingResults.push({
                        medicalRecordId: record._id,
                        medicalTestInfo,
                        appointmentId: record.appointmentId,
                        doctorId: record.doctorId,
                        doctorData: doctorData,
                        userId: record.userId,
                        userData: record.userData,
                        slotDate: record.slotDate,
                        slotTime: record.slotTime,
                        symptons: record.symptons,
                        diagnosis: record.diagnosis,
                        notes: record.notes,
                        testId: test._id,
                        performedId: test.performedId,
                        etc: test.etc
                    });
                }
            }
        }
        if (errors.length > 0) {
            return res.status(500).json({
                success: false,
                message: "Some errors occurred.",
                errors
            });
        }

        res.status(200).json({
            success: true,
            waitingResults
        });
    } catch (e) {
        console.log(e);
        res.status(500).json({
            success: false,
            message: e.message
        });
    }
};

//convert buffer to data uri
const bufferToDataUri = (file) => {
    return `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
};

//api assign details of medical test
const assignDetailsMedicalTest = async (req, res) => {
    try {
        const { medicalRecordId, result, notes } = req.body;
        const imageFiles = req.files || [];
        const testingStaffData = req.testingStaff;

        if (!medicalRecordId || !result || imageFiles.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Required fields missing."
            });
        }

        const medicalRecordData = await medicalRecordModel.findById(medicalRecordId);
        if (!medicalRecordData) {
            return res.status(404).json({
                success: false,
                message: "Medical record does not exist."
            });
        }

        const appointmentData = await appointmentModel.findById(medicalRecordData.appointmentId);
        if (!appointmentData) {
            return res.status(404).json({
                success: false,
                message: "Associated appointment does not exist."
            });
        }

        let imageUrls = [];
        for (const file of imageFiles) {
            const fileDataUri = bufferToDataUri(file);
            const uploadResult = await cloudinary.uploader.upload(fileDataUri, {
                folder: 'medical_tests'
            });
            imageUrls.push(uploadResult.secure_url);
        }

        // Atomic update with $set for matching elem
        const update = await medicalRecordModel.updateOne(
            { _id: medicalRecordId, "orderedTests.performedId": testingStaffData._id, "orderedTests.status": 'in-progress' },
            {
                $set: {
                    "orderedTests.$.status": 'completed',
                    "orderedTests.$.result": result,
                    "orderedTests.$.testDoneAt": new Date(),
                    "orderedTests.$.notes": notes,
                    "orderedTests.$.images": imageUrls
                }
            }
        )

        if (update.modifiedCount === 0) {
            return res.status(403).json({
                success: false,
                message: "No pending test found for this staff."
            });
        }
        appointmentData.isCompleted = 'tests-done';
        await appointmentData.save();

        res.status(200).json({
            success: true,
            message: "Test details assigned successfully."
        });
    } catch (e) {
        console.log(e);
        res.status(500).json({
            success: false,
            message: e.message
        });
    }
};

export { changeAvailablityTS, loginTestingStaff, getPendingTests, getWaitingResults, assignDetailsMedicalTest, receivingMedicalTest };