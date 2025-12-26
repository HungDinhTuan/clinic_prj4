import jwt from 'jsonwebtoken'

// admin authentication middleware
const authAdmin = async (req, res, next) => {
    try{
        const {atoken} = req.headers
        // console.log(atoken)
        if(!atoken) {
            return res.status(401).json({
                success: false,
                message: "Not authorized"
            })
        }
        const token_decode = jwt.verify(atoken, process.env.JWT_SECRET_KEY)
        // console.log(token_decode)
        if(token_decode !== (process.env.ADMIN_EMAIL + process.env.ADMIN_PASSWORD)){
            return res.status(403).json({
                success: false,
                message: "You do not have permission."
            })
        }
        next();
    }catch(e){
        console.log(e)
        return res.status(400).json({
            success: false,
            message: e.message
        });
    }
}

export default authAdmin