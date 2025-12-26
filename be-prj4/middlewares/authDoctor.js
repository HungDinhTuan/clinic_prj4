import jwt from 'jsonwebtoken'
import doctorModel from '../models/doctorModel.js';

// doctor authentication middleware
const authDoctor = async (req, res, next) => {
    try {
        const { dtoken } = req.headers;
        // console.log(dtoken)
        if (!dtoken) {
            return res.status(401).json({
                success: false,
                message: "Not authorized"
            })
        }
        const token_decode = jwt.verify(dtoken, process.env.JWT_SECRET_KEY);
        const isDoctorExists = await doctorModel.findById(token_decode.id).select('-password')
        if (!isDoctorExists) {
            return res.status(403).json({
                success: false,
                message: "You do not have permission."
            })
        }
        req.doctor = isDoctorExists; // assign auth doc to req
        next();
    } catch (e) {
        console.log(e)
        return res.status(500).json({
            success: false,
            message: e.message
        });
    }
}

export default authDoctor