import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
    code_transaction : {type:String, require:true},
    transaction_content : {type:String, require:true},
    amount_in : {type:Number, require:true},
    created_at : {type:String, require:true},
    account_no : {type:String, require:true},
    // code_check : {type:String, require:true},
    userId : {type:String, require:true},
    docId : {type:String, require:true},
    slotDate: {type: String, require: true},
    slotTime: {type: String, require: true}
}, {minimize:false})

const transactionModel = mongoose.models.transaction || mongoose.model('transaction', transactionSchema)

export default transactionModel