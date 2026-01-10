import jwt from 'jsonwebtoken'
import nurseModel from '../models/nurseModel.js';

// nurse authentication middleware
const authNurse = async (req, res, next) => {
    try {
        const { ntoken } = req.headers;
        // console.log(ntoken)
        if (!ntoken) {
            return res.status(401).json({   
                success: false,
                message: "Not authorized"
            })
        }
        const token_decode = jwt.verify(ntoken, process.env.JWT_SECRET_KEY);
        const isNurseExists = await nurseModel.findById(token_decode.id).select('-password')
        if (!isNurseExists) {
            return res.status(403).json({
                success: false,
                message: "You do not have permission."
            })
        }
        req.nurse = isNurseExists; // assign auth nurse to req
        next();
    } catch (e) {
        console.log(e)
        return res.status(500).json({
            success: false,
            message: e.message
        });
    }
}

export default authNurse;