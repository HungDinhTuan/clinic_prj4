import mongoose from "mongoose";

const userNotSignSchema = new mongoose.Schema({
    name: { type: String, require: true },
    email: { type: String, require: true },
    // password: { type: String, require: true },
    // image: { type: String, default: process.env.DEFAULT_USER_AVATAR },
    address: { type: Object, default: { line1: '', line2: '' } },
    gender: { type: String, require: true },
    dob: { type: String, require: true },
    phone: { type: String, require: true },
    relationship: { type: String, require: true },
    userIdRelation: { type: String, default: '' },
    userDataRelation: { type: Object, default: {} },
})

const userNotSignModel = mongoose.models.userNotSign || mongoose.model('userNotSign', userNotSignSchema)

export default userNotSignModel