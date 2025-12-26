import mongoose from "mongoose";

const medicalTestSchema = new mongoose.Schema({
    name: {type: String, require: true, unique: true},
    description: {type: String},
    fees: {type: Number, require: true},
    category: {type: String, require: true},
    preparation: {type: String},
    turnaroundTime: {type: Number},
    unit: {type: String},
    normalRange: {type: String}
}, {minimize: false});

const medicalTestModel = mongoose.models.medicalTest || mongoose.model('medicalTest', medicalTestSchema);

export default medicalTestModel