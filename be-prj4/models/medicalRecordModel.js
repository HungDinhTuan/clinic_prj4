import mongoose from "mongoose";

const medicalRecordSchema = new mongoose.Schema({
    appointmentId: {type: String, require: true},
    slotDate: {type: String, require: true},
    slotTime: {type: String, require: true},
    userData: {type: Object, require: true},
    userId: {type: String, require: true},
    doctorId: {type: String, require: true},
    doctorData: {type: Object, require: true},
    symptons: {type: String},
    diagnosis: {type: String},
    notes: {type: String},
    followUpdate: {type: String},
    prescribedMedicines: [{
        medicineId : {type: String, require: true},
        medicineData: {type: Object, require: true},
        dosage: {type: String, require: true},
        durations: {type: String, require: true},
        instructions: {type: String}
    }],
    // totalPriceTest: {type: Number, default: 0},
    // isPaid: {type: Boolean, default: false},
    orderedTests: [{
        testId: {type: String, require: true},
        medicalTestData: {type: Object, require: true},
        status: {
            type: String, 
            enum: ['pending', 'in-progress', 'completed', 'cancelled'],
            default: 'pending' 
        },
        result: { type: String },                      
        images: [{ type: String }],
        performedId: {type: String, require: true},
        testDoneAt: {type: Date},
        notes: {type: String},
        etc: {type: Date}
    }],
    isCompleted: {type: Boolean, default: false},
    completedAt: {type: Date}
}, {timestamps: true});

medicalRecordSchema.index({ userId: 1, createdAt: -1 });
medicalRecordSchema.index({ doctorId: 1 });

const medicalRecordModel = mongoose.models.medicalRecord || mongoose.model('medicalRecord', medicalRecordSchema);

export default medicalRecordModel