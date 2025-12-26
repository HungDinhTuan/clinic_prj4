import jwt from 'jsonwebtoken'
import userModel from '../models/userModel.js';

// user authentication middleware
const authUser = async (req, res, next) => {
    try {
        const { token } = req.headers;
        // console.log(token)
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Not authorized"
            })
        }
        const token_decode = jwt.verify(token, process.env.JWT_SECRET_KEY);
        const isUserExists = await userModel.findById(token_decode.id).select('-password')
        if (!isUserExists) {
            return res.status(403).json({
                success: false,
                message: "You do not have permission."
            })
        }
        req.user = isUserExists; // assign auth user to req
        next();
    } catch (e) {
        console.log(e)
        return res.status(500).json({
            success: false,
            message: e.message
        });
    }
}

export default authUser