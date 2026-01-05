import appointmentModel from "../models/appointmentModel.js";
import doctorModel from "../models/doctorModel.js";
import transactionModel from "../models/transationModel.js"
import axios from 'axios'

// verify payment from external api
const verifyPaymentFromTransaction = async (content, amount) => {
    try {
        const data = await axios.get(process.env.API_CHECK_PAYMENT);

        if (!data || !data.data || !Array.isArray(data.data.data)) {
            return null;
        }

        const transactions = data.data.data;
        const key = content.slice(0, 20);

        const matched = transactions.find(t =>
            t.transaction_content.includes(key) && Number(t.amount_in) >= Number(amount)
        );

        return matched || null;
    } catch (e) {
        console.log('Error verifying payment:', e);
        return null;
    }
};

//api check transation
const checkTransition = async (req, res) => {
    try {
        const userData = req.user;
        const { appointmentId } = req.body;

        if (!appointmentId) {
            return res.status(400).json({
                success: false,
                message: "appointmentId is required"
            });
        }

        const appointmentData = await appointmentModel.findById(appointmentId).populate('docId', 'name image speciality address');

        if (userData.id !== appointmentData.userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized."
            });
        }

        if (appointmentData.payment) {
            return res.json({
                success: true,
                message: "Appointment already paid",
                payment: true,
                alreadyPaid: true
            })
        }

        const content = `${appointmentId}${appointmentData.userId}`
        const amount = appointmentData.amount
        const qrCodeURL = `${process.env.URL_VIETQR}/${process.env.BANK_ID}-${process.env.ACCOUNT_N0}-${process.env.TEMPALTE_URL_QRCODE}.png?amount=${amount}&addInfo=${content}`;

        const matched = await verifyPaymentFromTransaction(content, amount);

        if (!matched) {
            return res.json({
                success: false,
                message: "Not found transation.",
                qrCodeURL,
                content,
                amount,
                payment: false
            });
        }

        const transationData = {
            code_transaction: matched.code_transaction,
            transaction_content: matched.transaction_content,
            amount_in: matched.amount_in,
            created_at: matched.created_at,
            account_no: matched.account_no,
            // code_check: matched.code_check,
            userId: userData.id,
            docId: appointmentData.docId,
            slotDate: appointmentData.slotDate,
            slotTime: appointmentData.slotTime
        }

        await Promise.all([
            appointmentModel.findByIdAndUpdate(appointmentId, { payment: true }),
            new transactionModel(transationData).save()
        ])

        return res.json({
            success: true,
            message: "Transations successful",
            qrCodeURL,
            content,
            amount,
            payment: true,
            alreadyPaid: false  
        });
    } catch (e) {
        console.log(e);
        res.status(500).json({
            success: false,
            message: e.message
        })
    }
}

export { checkTransition };