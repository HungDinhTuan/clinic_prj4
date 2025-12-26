import mongoose from "mongoose";

const medicineSchema = new mongoose.Schema({
    name: {type: String, require: true, unique: true},
    genericName : {type: String, require: true},
    category: {type: String, require: true},
    form: {type: String},
    manufacturer: {type: String},
    description: {type: String},
    indications: {type: String},
    contraindications: {type: String},
    sideEffects: {type: String}
}, {minimize: false});

const medicineModel = mongoose.models.medicine || mongoose.model('medicine', medicineSchema);

export default medicineModel