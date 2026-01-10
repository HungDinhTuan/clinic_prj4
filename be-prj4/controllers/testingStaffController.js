import testingStaffModel from "../models/testingStaffModel.js"
import medicalRecordModel from "../models/medicalRecordModel.js"
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { v2 as cloudinary } from 'cloudinary'
import appointmentModel from "../models/appointmentModel.js"
import medicalTestModel from "../models/medicalTestModel.js"
import doctorModel from "../models/doctorModel.js"
import e from "express"
import { uploadMultipleToCloudinary } from "../utils/cloudinaryUpload.js"

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

// api testing staff profile
const getTestingStaffProfile = async (req, res) => {
    try {
        const testingStaffData = req.testingStaff;

        res.status(200).json({
            success: true,
            testingStaffData
        });
    } catch (e) {
        console.log(e);
        res.status(500).json({
            success: false,
            message: e.message
        });
    }
}

// api update testing staff profile
const updateTestingStaffProfile = async (req, res) => {
    try {
        const testingStaffData = req.testingStaff;
        const testingStaffId = testingStaffData._id;
        const {address, available} = req.body;

        await testingStaffModel.findByIdAndUpdate(testingStaffId, {address, available});

        res.status(200).json({
            success: true,
            message: "Testing staff profile updated successfully."
        });
    } catch (e) {
        console.log(e);
        res.status(500).json({
            success: false,
            message: e.message
        });
    }
};

// api get dashboard data for testing staff
const getTestingStaffDashData = async (req, res) => {
    try {
        const testingStaffData = req.testingStaff;
        const testingStaffId = testingStaffData._id;

        const medicalRecords = await medicalRecordModel.find({ "orderedTests.performedId": testingStaffId });

        let totalTests = [];
        let completedTests = 0;
        let earnings = 0;

        for (const record of medicalRecords) {
            for (const test of record.orderedTests) {
                if (test.performedId.toString() === testingStaffId.toString()) {
                    totalTests.push(test);
                    earnings += test ? test.medicalTestData.price : 0;
                    if (test.status === 'completed') {
                        completedTests += 1;
                    }
                }
            }
        }

        res.status(200).json({
            success: true,
            dashData: {
                totalTests,
                completedTests,
                earnings
            }
        });
    } catch (e) {
        console.log(e);
        res.status(500).json({
            success: false,
            message: e.message
        });
    }
};

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
                if (test.performedId.toString() === testingStaffId?.toString() && test.status === 'pending') {
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
        const { status } = req.query; // Get status parameter from query string ('in-progress' or 'completed')

        // Determine which status to filter by
        let testStatus = 'in-progress'; // default
        if (status === 'completed') {
            testStatus = 'completed';
        }

        const medicalRecords = await medicalRecordModel.find({
            "orderedTests.performedId": testingStaffId,
            "orderedTests.status": testStatus
        });

        const waitingResults = [];
        const errors = [];
        for (const record of medicalRecords) {
            for (const test of record.orderedTests) {
                if (test.performedId?.toString() === testingStaffId.toString() && test.status === testStatus) {
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
                        etc: test.etc,
                        testStatus: test.status
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
            waitingResults,
            selectedStatus: testStatus
        });
    } catch (e) {
        console.log(e);
        res.status(500).json({
            success: false,
            message: e.message
        });
    }
};

// api show detail test result by id
const getDetailTestResultById = async (req, res) => {
    try {
        const { medicalRecordId, testId } = req.body;
        const testingStaffData = req.testingStaff;

        if (!medicalRecordId || !testId) {
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

        let testData = medicalRecordData.orderedTests.find(test => test._id.toString() === testId && test.performedId.toString() === testingStaffData._id.toString());
        if (!testData) {
            return res.status(404).json({
                success: false,
                message: "Test not found for this testing staff."
            });
        }

        const userData = medicalRecordData.userData;
        const doctorData = medicalRecordData.doctorData;

        testData = { ...testData._doc, userData, doctorData };

        res.status(200).json({
            success: true,
            testData
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
        if (imageFiles.length > 0) {
            const uploadResults = await uploadMultipleToCloudinary(imageFiles, { folder: 'medical_tests' });
            imageUrls = uploadResults.map(result => result.secure_url);
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

export { changeAvailablityTS, loginTestingStaff, getPendingTests, getWaitingResults, assignDetailsMedicalTest, receivingMedicalTest, getDetailTestResultById, getTestingStaffProfile, getTestingStaffDashData, updateTestingStaffProfile };