import jwt from 'jsonwebtoken'
import testingStaffModel from '../models/testingStaffModel.js'

//testing staff authentication middleware
const authTestingStaff = async (req, res, next) => {
    try {
        const { ttoken } = req.headers;
        if (!ttoken) {
            return res.status(401).json({
                success: false,
                message: "Not authorized"
            })
        }
        const token_decode = jwt.verify(ttoken, process.env.JWT_SECRET_KEY);
        const isTestingStaffExists = await testingStaffModel.findById(token_decode.id).select('-password');
        if (!isTestingStaffExists) {
            return res.status(403).json({
                success: false,
                message: "You do not have permission."
            })
        }
        req.testingStaff = isTestingStaffExists;
        next();
    } catch (e) {
        console.log(e)
        return res.status(500).json({
            success: false,
            message: e.message
        });
    }
}

export default authTestingStaff