import testingStaffModel from "../models/testingStaffModel.js"
import medicalRecordModel from "../models/medicalRecordModel.js"
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import cloudinary from '../config/cloudinary.js'
import appointmentModel from "../models/appointmentModel.js"

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
// const getPendingTests = async (req, res) => {
//     const testingStaffData = req.testingStaff;

//     try {
//         const medicalRecords = await medicalRecordModel.find({t});

//         const pendingTestsByTestingStaff = medicalRecords.filter(record => {
//             return record.orderedTests.some(test => test.performedBy?.toString() === testingStaffData._id.toString() && test.status === 'pending');
//         });
        
//         res.status(200).json({
//             success: true,
//             data: pendingTestsByTestingStaff
//         });
//     } catch (e) {
//         console.log(e);
//         res.status(500).json({
//             success: false,
//             message: e.message
//         });
//     }
// }
const getPendingTests = async (req, res) => {
    const testingStaffData = req.testingStaff;

    try {
        const pendingTests = await medicalRecordModel.aggregate([
            { $unwind: "$orderedTests" },
            { $match: { "orderedTests.performedId": testingStaffData._id, "orderedTests.status": 'pending' } }, 
            { $lookup: { from: 'users', localField: 'userId', foreignField: '_id', as: 'userData' } },
            { $lookup: { from: 'appointments', localField: 'appointmentId', foreignField: '_id', as: 'appointmentData' } },
            { $lookup: { from: 'medicaltests', localField: 'orderedTests.testId', foreignField: '_id', as: 'testData' } },
            { $project: {
                _id: 1,
                orderedTest: "$orderedTests",
                userData: { $arrayElemAt: ["$userData", 0] },
                appointmentData: { $arrayElemAt: ["$appointmentData", 0] },
                testData: { $arrayElemAt: ["$testData", 0] }
            }}
        ]);

        res.status(200).json({
            success: true,
            data: pendingTests
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
    const { medicalRecordId, result, notes } = req.body;
    const imageFiles = req.files;
    const testingStaffData = req.testingStaff;

    if (!medicalRecordId || !result || (!imageFiles && imageFiles.length === 0)) {
        return res.status(400).json({
            success: false,
            message: "All fields are required."
        });
    }

    const medicalRecordData = await medicalRecordModel.findById(medicalRecordId);
    if (!medicalRecordData) {
        return res.status(404).json({
            success: false,
            message: "Medical record does not exist."
        });
    }

    let orderedTests = medicalRecordData.orderedTests;
    let isTestAssigned = false;
    for (const orderedTest of orderedTests) {
        //check if the testing staff is assigned to this test and the test is still pending
        if (orderedTest.testingStaffId.toString() === testingStaffData._id.toString() && orderedTest.status === 'pending') {
            orderedTest.status = 'completed';
            orderedTest.result = result;
            orderedTest.testDoneAt = new Date();
            orderedTest.notes = notes;
            //upload images to cloudinary
            let imageUrls = [];
            for (const file of imageFiles) {
                const fileDataUri = bufferToDataUri(file);
                const uploadResult = await cloudinary.uploader.upload(fileDataUri, {
                    folder: 'medical_tests' 
                });
                imageUrls.push(uploadResult.secure_url);
            }
            orderedTest.images = imageUrls;
            await medicalRecordModel.findByIdAndUpdate(medicalRecordId, { orderedTests });
            isTestAssigned = true;
            break;
        }
    }

}

export { changeAvailablityTS, loginTestingStaff, getPendingTests, assignDetailsMedicalTest };