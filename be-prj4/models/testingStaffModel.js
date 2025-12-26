import mongoose from "mongoose";

const testingStaffSchema = new mongoose.Schema({
    name : {type:String, require:true},
    email : {type:String, require:true, unique:true},
    password : {type:String, require:true},
    image : {type:String, require:true},
    department : {type:String, require: true},
    qualification : {type:String, require:true},
    experience : {type:String, require:true},
    about : {type:String, require:true},
    available : {type:Boolean, default:true},
    address: { type: Object, default: { line1: '', line2: '' } },
    date: { type: Number, required: true },
    slots_booked: { type: Object, default: {} },
}, {minimize: false});

const testingStaffModel = mongoose.models.testingStaff || mongoose.model('testingStaff', testingStaffSchema);

export default testingStaffModel