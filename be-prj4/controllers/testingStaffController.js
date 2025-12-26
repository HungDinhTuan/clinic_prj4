import testingStaffModel from "../models/testingStaffModel.js"
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

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

// API lấy pending tests cho staff
const getPendingTests = async (req, res) => {
    try {
        const staff = req.testingStaff; // Từ auth middleware
        const records = await medicalRecordModel.aggregate([
            { $unwind: "$orderedTests" },
            { $match: { "orderedTests.performedBy": staff._id, "orderedTests.status": "pending" } },
            { $lookup: { from: "users", localField: "userId", foreignField: "_id", as: "patientData" } },
            { $lookup: { from: "medicaltests", localField: "orderedTests.testId", foreignField: "_id", as: "testData" } },
            { $project: { 
                _id: 1, 
                orderedTest: "$orderedTests", 
                patient: { $arrayElemAt: ["$patientData", 0] }, 
                test: { $arrayElemAt: ["$testData", 0] } 
            } }
        ]);

        res.json({ success: true, pendingTests: records });
    } catch (e) {
        console.log(e);
        res.status(500).json({ success: false, message: e.message });
    }
};

// API cập nhật test result với multi images
const updateTestResult = async (req, res) => {
    try {
        const { recordId, testId } = req.params;
        const { result, notes } = req.body;
        const staff = req.testingStaff;
        const images = [];

        // Upload images to Cloudinary
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const uploadResult = await new Promise((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream({ resource_type: 'image' }, (err, result) => {
                        if (err) reject(err);
                        else resolve(result.secure_url);
                    });
                    stream.end(file.buffer);
                });
                images.push(uploadResult);
            }
        }

        // Cập nhật orderedTest cụ thể
        const update = await medicalRecordModel.updateOne(
            { _id: recordId, "orderedTests._id": testId, "orderedTests.performedBy": staff._id },
            { 
                $set: { 
                    "orderedTests.$.status": "completed",
                    "orderedTests.$.result": result,
                    "orderedTests.$.notes": notes,
                    "orderedTests.$.images": images,
                    "orderedTests.$.performedAt": new Date()
                } 
            }
        );

        if (update.modifiedCount === 0) {
            return res.status(404).json({ success: false, message: "Test not found or unauthorized" });
        }

        // Kiểm tra nếu all tests completed, set medicalRecord isCompleted nếu có medicines
        const record = await medicalRecordModel.findById(recordId);
        const allTestsCompleted = record.orderedTests.every(test => test.status === "completed");
        if (allTestsCompleted && record.prescribedMedicines.length > 0) {
            record.isCompleted = true;
            record.completedAt = new Date();
            await record.save();
        }

        res.json({ success: true, message: "Test updated" });
    } catch (e) {
        console.log(e);
        res.status(500).json({ success: false, message: e.message });
    }
};

export { changeAvailablityTS, loginTestingStaff, getPendingTests, updateTestResult };