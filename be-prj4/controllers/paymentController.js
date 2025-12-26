import appointmentModel from "../models/appointmentModel.js";
import transactionModel from "../models/transationModel.js"
import axios from 'axios'

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
                alreadyPaid : true
            })
        }

        const content = `${appointmentId}${appointmentData.userId}`
        const amount = appointmentData.amount
        const qrCodeURL = `${process.env.URL_VIETQR}/${process.env.BANK_ID}-${process.env.ACCOUNT_N0}-${process.env.TEMPALTE_URL_QRCODE}.png?amount=${amount}&addInfo=${content}`;

        const data = await axios.get('https://script.google.com/macros/s/AKfycbx5XpI769A7af0UhdWKdaFGtXCaEeBLIWaClx9CZrdFPITRH0KlWkxbHETHBfesi0iw9w/exec');

        if (!data || !data.data || !Array.isArray(data.data.data)) {
            return res.status(500).json({
                success: false,
                message: 'Error system',
                qrCodeURL,
                content,
                amount,
                payment: false
            })
        }

        const transactions = data.data.data;
        const key = content.slice(0, 20);
        // console.log("transactions : ", transactions);
        // console.log("content : ", content);
        // console.log("amount : ", amount);

        const matched = transactions.find(t =>
            t.transaction_content.includes(key) && Number(t.amount_in) >= Number(amount)
        )

        // console.log("matched : ", matched);

        if (!matched) {
            return res.json({
                success: false,
                message: "Not found transation.",
                qrCodeURL,
                content,
                amount,
                payment : false
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
            payment : true,
            alreadyPaid : false
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