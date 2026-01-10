import mongoose from "mongoose";

const nurseSchema = new mongoose.Schema({
    name: { type: String, require: true },
    email: { type: String, require: true, unique: true },
    password: { type: String, require: true },
    image: { type: String, require: true },
    speciality: { type: String, require: true },
    degree: { type: String, require: true },
    experience: { type: String, require: true },
    about: { type: String, require: true },
    available: { type: Boolean, default: true },
    address: { type: Object, default: {} }
}, { minimize: false })

const nurseModel = mongoose.models.nurse || mongoose.model('nurse', nurseSchema)

export default nurseModel