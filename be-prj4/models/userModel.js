import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, require: true },
    email: { type: String, require: true, unique: true },
    password: { type: String, require: true },
    image: { type: String, default: process.env.DEFAULT_USER_AVATAR },
    address: { type: Object, default: { line1: '', line2: '' } },
    gender: { type: String, default: "Not Selected" },
    dob: { type: String, default: "Not Selected" },
    phone: { type: String, default: "0000000000" },
})

const userModel = mongoose.models.user || mongoose.model('user', userSchema)

export default userModel