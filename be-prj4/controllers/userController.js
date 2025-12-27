import validator from 'validator';
import bcrypt from 'bcrypt';
import userModel from '../models/userModel.js';
import jwt from 'jsonwebtoken';
import { v2 as cloudinary } from "cloudinary"
import doctorModel from '../models/doctorModel.js';
import appointmentModel from '../models/appointmentModel.js';
import { GoogleGenAI } from '@google/genai';
import medicalRecordModel from '../models/medicalRecordModel.js';

// api to register a user
const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        if (!validator.isEmail(email)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email format"
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters long"
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt);

        const userData = {
            name,
            email,
            password: hashPassword
        }

        const newUser = new userModel(userData);
        await newUser.save();

        const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET_KEY);

        return res.status(201).json({
            success: true,
            token
        });

    } catch (e) {
        return res.status(400).json({
            success: false,
            message: e.message
        });
    }
}

// api user login
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Fail to log in."
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY);
        return res.status(200).json({
            success: true,
            token
        });
    } catch (e) {
        return res.status(400).json({
            success: false,
            message: e.message
        });
    }
}

//api get user info
const getProfile = async (req, res) => {
    try {
        // const { token } = req.headers;
        // const token_decode = jwt.verify(token, process.env.JWT_SECRET_KEY);
        // const userData = await userModel.findById(token_decode.id).select('-password')
        // console.log(req.user);

        res.json({
            success: true,
            userData: req.user
        })
    } catch (e) {
        console.log(e);
        res.status(500).json({
            success: false,
            message: e.message
        })
    }
}

// api update user
const updateProfile = async (req, res) => {
    try {
        // const { token } = req.headers;
        // const token_decode = jwt.verify(token, process.env.JWT_SECRET_KEY);
        const { phone, email, address, dob, gender } = req.body;
        const imageFile = req.file;
        const userData = req.user;
        // console.log("userdata before update : ", userData);

        if (!phone || !dob || !address || !gender || !email) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            })
        }

        if (!validator.isMobilePhone(phone, "vi-VN")) {
            return res.status(400).json({
                success: false,
                message: "Invalid phone format"
            });
        }

        if (!validator.isEmail(email)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email format"
            });
        }

        // if (password.length < 8) {
        //     return res.status(400).json({
        //         success: false,
        //         message: "Password must be at least 8 characters long"
        //     });
        // }

        // const salt = await bcrypt.genSalt(10);
        // const hashPassword = await bcrypt.hash(password, salt);

        if (email !== userData.email) {
            const isEmailExists = await userModel.findOne({ email: email });
            if (isEmailExists) {
                return res.status(400).json({
                    success: false,
                    message: "Email is already taken"
                })
            };
        }

        let imageUrl = userData.image;
        if (imageFile) {
            //upload image to cloudinary
            const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
                resource_type: 'image'
            })
            imageUrl = imageUpload.secure_url;
            // await userModel.findByIdAndUpdate(userData.id, { image: imageUrl })
        }
        // else {
        //     const imageUrl = process.env.DEFAULT_USER_AVATAR;
        //     await userModel.findByIdAndUpdate(token_decode.id, { image: imageUrl })
        // }

        await userModel.findByIdAndUpdate(
            userData.id,
            {
                // name,
                /*password: hashPassword,*/
                phone,
                dob,
                address: JSON.parse(address),
                email,
                gender,
                image: imageUrl
            })

        res.json({
            success: true,
            message: "Profile has updated."
        })
    } catch (e) {
        console.log(e);
        res.status(500).json({
            success: false,
            message: e.message
        })
    }
}

// api book appointment
const bookAppointment = async (req, res) => {
    try {
        // const { token } = req.headers;
        // const token_decode = jwt.verify(token, process.env.JWT_SECRET_KEY);

        const { docId, slotDate, slotTime } = req.body;
        const userData = req.user;

        if (!docId || !slotDate || !slotTime) {
            return res.status(400).json({
                success: false,
                message: "Missing booking information"
            });
        }

        const docData = await doctorModel.findById(docId).select('-password');

        if (!docData) {
            return res.status(404).json({
                success: false,
                message: "Doctor not found"
            });
        }

        if (!docData.available) {
            return res.status(404).json({
                success: false,
                message: "Doctor not available"
            });
        }

        let slots_booked = docData.slots_booked;
        // cheking for slot available
        if (slots_booked[slotDate]) {
            if (slots_booked[slotDate].includes(slotTime)) {
                return res.status(404).json({
                    success: false,
                    message: "Slot not available"
                });
            } else {
                slots_booked[slotDate].push(slotTime)
            }
        } else {
            slots_booked[slotDate] = [];
            slots_booked[slotDate].push(slotTime);
        }

        delete docData.slots_booked;

        const appointmentData = {
            userId: userData.id,
            docId,
            userData,
            docData,
            amount: docData.fees,
            slotTime,
            slotDate,
            date: Date.now()
        }

        await Promise.all([
            new appointmentModel(appointmentData).save(),
            // save new slot data in docData
            doctorModel.findByIdAndUpdate(docId, { slots_booked })
        ]);

        res.json({
            success: true,
            message: "Appointment has booked."
        })
    } catch (e) {
        console.log(e);
        res.status(500).json({
            success: false,
            message: e.message
        })
    }
}

//api my appoitments
const listAppointments = async (req, res) => {
    try {
        const userData = req.user;
        // console.log('list appointments user : ',userData);

        const appointments = await appointmentModel.find({ userId: userData.id, cancelled: false })

        if (!appointments) {
            return res.status(400).json({
                success: false,
                message: "Missing booking information"
            });
        }

        res.json({
            success: true,
            appointments
        })
    } catch (e) {
        console.log(e);
        res.status(500).json({
            success: false,
            message: e.message
        })
    }
}

// api cancel appointment
const cancelAppointment = async (req, res) => {
    try {
        const userData = req.user;
        const { appointmentId } = req.body;

        if (!appointmentId) {
            return res.status(400).json({
                success: false,
                message: "Missing booking information"
            });
        }

        const appointmentData = await appointmentModel.findById(appointmentId);

        if (!appointmentData) {
            return res.status(400).json({
                success: false,
                message: "Missing booking information"
            });
        }

        //verify appointment user
        if (appointmentData.userId !== userData.id) {
            return res.status(400).json({
                success: false,
                message: "You can not cancel this booking."
            });
        }

        const { docId, slotDate, slotTime } = appointmentData;
        const docData = await doctorModel.findById(docId);
        let slots_booked = docData.slots_booked;
        // console.log("before : ", slots_booked);
        slots_booked[slotDate] = slots_booked[slotDate].filter(s => s !== slotTime);
        // console.log("after : ",slots_booked);


        await Promise.all([
            appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true }),
            // delete booking in doctor data
            doctorModel.findByIdAndUpdate(docId, { slots_booked })
        ]);

        res.json({
            success: true,
            message: "Appointment has cancelled."
        })
    } catch (e) {
        console.log(e);
        res.status(500).json({
            success: false,
            message: e.message
        })
    }
}

// api book appointment with AI assistance
const bookAppointmentWithAI = async (req, res) => {
    try {
        const userData = req.user;
        const { slotDate, slotTime, symptom } = req.body;
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

        if (!slotDate || !slotTime || !symptom) {
            return res.status(400).json({
                success: false,
                message: "Missing booking information"
            });
        }

        // valid symptom
        const validationSymptomPrompt = `Mô tả của người dùng có liên quan đến y tế, sức khỏe hay muốn đặt lịch khám hay không. Respond with only 'valid'. If it's nonsense, unrelated to health, or not descriptive of any symptoms, respond with only 'invalid'. Text: ${symptom}`;
        const validationResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: validationSymptomPrompt
        });
        const validationResult = validationResponse.text.trim().toLowerCase();

        if (validationResult !== 'valid') {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid description of your symptoms."
            });
        }

        const specialityData = [
            'General physician',
            'Gynecologist',
            'Dermatologist',
            'Pediatricians',
            'Neurologist',
            'Gastroenterologist'
        ];

        let specialityPrompt = specialityData.map(s => ` ${s}`).join(', ');

        const prompt = `Based on the symptoms: ${symptom}, which medical specialty would be most appropriate? Available specialties are: ${specialityPrompt}. Please respond with only the name of the specialty.`;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt
        });
        const specialty = response.text.trim();

        const doctors = await doctorModel.find({ speciality: specialty, available: true }).select('-password');
        
        if (doctors.length === 0) {
            return res.status(404).json({
                success: false,
                message: `No available doctors found for the specialty: ${specialty}`
            });
        }

        let matchDoctor = null;
        
        const availableDoctors = doctors.filter(doc => {
            const bookedSlots = doc.slots_booked[slotDate] || [];
            return !bookedSlots.includes(slotTime);
        })

        if (availableDoctors.length === 0) {
            return res.status(404).json({
                success: false,
                message: `No doctors available for the selected slot: ${slotDate} at ${slotTime}`
            });
        }

        let minBookings = Infinity;
        availableDoctors.forEach(doc => {
            const bookingsCount = (doc.slots_booked[slotDate] || []).length;
            if (bookingsCount < minBookings) {
                minBookings = bookingsCount;
                matchDoctor = doc;
            }
        })

        const appointment = {
            userId: userData.id,
            docId: matchDoctor._id,
            userData,
            docData: matchDoctor,
            amount: matchDoctor.fees,
            slotTime,
            slotDate,
            date: Date.now()
        }

        return res.json({
            success: true,
            appointment
        })
    } catch (e) {
        console.log(e);
        res.status(500).json({
            success: false,
            message: e.message
        })
    }
}

// api get medical records by user id
// const getMedicalRecordByUserId = async (req, res) => {
//     try {
//         const userData = req.user;
//         const medicalRecords = await medicalRecordModel.find({ userId: userData.id });
//         return res.json({
//             success: true,
//             medicalRecords
//         });
//     } catch (e) {
//         console.log(e);
//         res.status(500).json({
//             success: false,
//             message: e.message
//         });
//     }
// }
const getMedicalRecordByUserId = async (req, res) => {
    try {
        const userData = req.user;
        const medicalRecords = await medicalRecordModel.find({ userId: userData.id })
            .sort({ createdAt: -1 }) 
            .populate({ path: 'doctorId', select: 'name speciality image' })
            .populate({ path: 'orderedTests.testId', select: 'name price category' })
            .populate({ path: 'prescribedMedicines.medicineId', select: 'name category form' });

        return res.json({
            success: true,
            medicalRecords
        });
    } catch (e) {
        console.log(e);
        res.status(500).json({
            success: false,
            message: e.message
        });
    }
};

export { registerUser, loginUser, getProfile, updateProfile, bookAppointment, listAppointments, cancelAppointment, bookAppointmentWithAI, getMedicalRecordByUserId };