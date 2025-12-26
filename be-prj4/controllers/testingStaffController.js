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

const updateMedicaTestToMedicalRecord = async () => {

}

export { changeAvailablityTS, loginTestingStaff, updateMedicaTestToMedicalRecord }