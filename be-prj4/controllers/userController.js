import validator from 'validator';
import bcrypt from 'bcrypt';
import userModel from '../models/userModel.js';
import jwt from 'jsonwebtoken';
import { v2 as cloudinary } from "cloudinary"
import doctorModel from '../models/doctorModel.js';
import appointmentModel from '../models/appointmentModel.js';
import { GoogleGenAI } from '@google/genai';
import medicalRecordModel from '../models/medicalRecordModel.js';
import userNotSignModel from '../models/userNotSignModel.js';
import { uploadToCloudinary } from '../utils/cloudinaryUpload.js';

// Validate additional user info for non-signed users
const validateAdditionalUserInfo = (name, email, phone, gender, dob, address, relationship) => {
    const infomations = [name, email, phone, gender, dob, address, relationship];
    const allInfoProvided = infomations.every(info => !!info);
    const noneInfoProvided = infomations.every(info => !info);
    return { allInfoProvided, noneInfoProvided };
};

// Validate email and phone
const validateContactInfo = (email, phone) => {
    if (email && !validator.isEmail(email)) {
        return { valid: false, message: "Invalid email format" };
    }
    if (phone && !validator.isMobilePhone(phone, "vi-VN")) {
        return { valid: false, message: "Invalid phone format" };
    }
    return { valid: true };
};

// Create userNotSign record
const createUserNotSignRecord = async (name, email, phone, gender, dob, address, relationship, userId, userData) => {
    try {
        const userNotSignInfo = {
            name,
            email,
            phone,
            gender,
            dob,
            relationship,
            address: JSON.parse(address),
            userIdRelation: userId,
            userDataRelation: userData
        };
        const newRecord = new userNotSignModel(userNotSignInfo);
        await newRecord.save();
        return newRecord;
    } catch (e) {
        throw new Error(`Failed to create user record: ${e.message}`);
    }
};

// Check slot availability
const checkSlotAvailability = (docData, slotDate, slotTime) => {
    const slots_booked = docData.slots_booked || {};
    const bookedSlots = slots_booked[slotDate] || [];
    return !bookedSlots.includes(slotTime);
};

// Update doctor slots
const updateDoctorSlots = (docData, slotDate, slotTime) => {
    const slots_booked = { ...docData.slots_booked };
    if (!slots_booked[slotDate]) {
        slots_booked[slotDate] = [];
    }
    slots_booked[slotDate].push(slotTime);
    return slots_booked;
};

// api to register a user
const registerUser = async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;
        if (!name || !email || !password || !phone) {
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

        if (!validator.isMobilePhone(phone, "vi-VN")) {
            return res.status(400).json({
                success: false,
                message: "Invalid phone format"
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt);

        const userData = {
            name,
            email,
            password: hashPassword,
            phone
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
        const { token } = req.headers;
        const token_decode = jwt.verify(token, process.env.JWT_SECRET_KEY);
        const userData = await userModel.findById(token_decode.id).select('-password')
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
            //upload image to cloudinary using streamifier
            const imageUpload = await uploadToCloudinary(imageFile.buffer, imageFile.originalname, {
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
        const { docId, slotDate, slotTime, name, email, phone, gender, dob, address, relationship } = req.body;
        const userData = req.user;

        // Validate required fields
        if (!docId || !slotDate || !slotTime) {
            return res.status(400).json({
                success: false,
                message: "Missing booking information"
            });
        }

        // Validate contact info
        const contactValidation = validateContactInfo(email, phone);
        if (!contactValidation.valid) {
            return res.status(400).json({
                success: false,
                message: contactValidation.message
            });
        }

        // Validate additional user info (all or none)
        const { allInfoProvided, noneInfoProvided } = validateAdditionalUserInfo(name, email, phone, gender, dob, address, relationship);
        if (!(allInfoProvided || noneInfoProvided)) {
            return res.status(400).json({
                success: false,
                message: "Missing booking for additional information"
            });
        }

        // Fetch doctor data
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

        // Check slot availability
        if (!checkSlotAvailability(docData, slotDate, slotTime)) {
            return res.status(400).json({
                success: false,
                message: "Slot not available"
            });
        }

        // Update slots
        const updatedSlots = updateDoctorSlots(docData, slotDate, slotTime);

        // Prepare appointment data
        const appointmentData = {
            userId: userData.id,
            docId,
            userData,
            docData: { ...docData.toObject(), slots_booked: undefined },
            amount: docData.fees,
            slotTime,
            slotDate,
            date: Date.now()
        };

        // Handle non-signed user data
        let userNotSignId = null;
        if (allInfoProvided) {
            try {
                let userNotSignData = await userNotSignModel.findOne({ name, email, phone, dob, relationship, gender, address: JSON.parse(address) });

                if (Object.keys(userNotSignData || {}).length === 0) {
                    userNotSignData = await createUserNotSignRecord(name, email, phone, gender, dob, address, relationship, userData.id, userData);
                }

                userNotSignId = userNotSignData._id;
                appointmentData.userIdNotSign = userNotSignId;
                appointmentData.userDataNotSign = {
                    name,
                    email,
                    phone,
                    gender,
                    dob,
                    address: JSON.parse(address),
                    relationship
                };
            } catch (e) {
                console.error("Error handling non-signed user:", e);
            }
        }

        // Save appointment and update doctor slots in parallel
        await Promise.all([
            new appointmentModel(appointmentData).save(),
            doctorModel.findByIdAndUpdate(docId, { slots_booked: updatedSlots })
        ]);

        res.json({
            success: true,
            message: "Appointment has booked successfully."
        });
    } catch (e) {
        console.log(e);
        res.status(500).json({
            success: false,
            message: e.message
        });
    }
}

// api book appointment with AI assistance
const findDoctorWithAI = async (req, res) => {
    try {
        const userData = req.user;
        const { slotDate, slotTime, symptom, name, email, phone, gender, dob, address, relationship } = req.body;
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

        // Validate required fields
        if (!slotDate || !slotTime || !symptom) {
            return res.status(400).json({
                success: false,
                message: "Missing booking information"
            });
        }

        // Validate contact info
        const contactValidation = validateContactInfo(email, phone);
        if (!contactValidation.valid) {
            return res.status(400).json({
                success: false,
                message: contactValidation.message
            });
        }

        // Validate additional user info (all or none)
        const { allInfoProvided, noneInfoProvided } = validateAdditionalUserInfo(name, email, phone, gender, dob, address, relationship);
        if (!(allInfoProvided || noneInfoProvided)) {
            return res.status(400).json({
                success: false,
                message: "Either provide all or none of the additional information"
            });
        }

        // Validate symptom with AI
        const validationSymptomPrompt = `Is the user's description related to health, medical issues, or booking an appointment? Respond with only 'valid' or 'invalid'. Text: ${symptom}`;
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

        // Get specialty recommendation from AI
        const specialityList = ['General physician', 'Gynecologist', 'Dermatologist', 'Pediatricians', 'Neurologist', 'Gastroenterologist'];
        const specialityPrompt = `Based on the symptoms: ${symptom}, which medical specialty would be most appropriate? Available specialties: ${specialityList.join(', ')}. Respond with only the specialty name.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: specialityPrompt
        });
        const recommendedSpecialty = response.text.trim();

        // Find doctors with exact specialty match (case-insensitive)
        const doctors = await doctorModel.find({
            speciality: { $regex: `^${recommendedSpecialty}$`, $options: 'i' },
            available: true
        }).select('-password');

        if (doctors.length === 0) {
            return res.status(404).json({
                success: false,
                message: `No available doctors found for specialty: ${recommendedSpecialty}`
            });
        }

        // Filter doctors with available slots
        const availableDoctors = doctors.filter(doc => checkSlotAvailability(doc, slotDate, slotTime));

        if (availableDoctors.length === 0) {
            return res.status(404).json({
                success: false,
                message: `No doctors available for the selected slot on ${slotDate} at ${slotTime}`
            });
        }

        // Find doctor with least bookings (load balancing)
        let matchDoctor = availableDoctors[0];
        let minBookings = (matchDoctor.slots_booked[slotDate] || []).length;

        for (let i = 1; i < availableDoctors.length; i++) {
            const bookingsCount = (availableDoctors[i].slots_booked[slotDate] || []).length;
            if (bookingsCount < minBookings) {
                minBookings = bookingsCount;
                matchDoctor = availableDoctors[i];
            }
        }

        // Prepare appointment data (without saving to DB - just return recommendation)
        const appointmentData = {
            userId: userData.id,
            docId: matchDoctor._id,
            userData,
            docData: matchDoctor.toObject ? matchDoctor.toObject() : matchDoctor,
            amount: matchDoctor.fees,
            slotTime,
            slotDate,
            date: Date.now()
        };

        // Include non-signed user data if provided
        if (allInfoProvided) {
            appointmentData.userDataNotSign = {
                name,
                email,
                phone,
                gender,
                dob,
                address: JSON.parse(address),
                relationship
            };
        }

        return res.json({
            success: true,
            message: "Doctor recommended successfully",
            appointment: appointmentData
        });
    } catch (e) {
        console.log(e);
        res.status(500).json({
            success: false,
            message: e.message
        });
    }
}

//api my appoitments
const listAppointments = async (req, res) => {
    try {
        const userData = req.user;

        // Fetch all non-cancelled appointments for the user
        const appointments = await appointmentModel.find({
            userId: userData.id,
            cancelled: false,
            isCompleted: { $ne: "completed" }
        });

        // If no appointments, return empty array
        if (appointments.length === 0) {
            return res.json({
                success: true,
                appointments: []
            });
        }

        // Fetch pending medical records for this user
        const medicalRecords = await medicalRecordModel.find({
            userId: userData.id,
            isCompleted: false
        });

        // Create a Map for quick lookup: appointmentId -> medicalRecord (O(m) instead of O(n*m))
        const medicalRecordMap = new Map();
        medicalRecords.forEach(record => {
            medicalRecordMap.set(record.appointmentId.toString(), record);
        });

        // Merge appointments with their pending medical records (if any)
        const appointmentsWithRecords = appointments.map(appointment => {
            const appointmentObj = appointment.toObject();
            const pendingRecord = medicalRecordMap.get(appointment._id.toString());

            // Only add pendingMedicalRecord if it exists
            if (pendingRecord) {
                appointmentObj.pendingMedicalRecord = pendingRecord;
            }

            return appointmentObj;
        });

        res.json({
            success: true,
            appointments: appointmentsWithRecords
        });
    } catch (e) {
        console.log(e);
        res.status(500).json({
            success: false,
            message: e.message
        });
    }
};

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

// api get medical records by user id
const getMedicalRecordByUserId = async (req, res) => {
    try {
        const userData = req.user;
        const medicalRecords = await medicalRecordModel.find({ userId: userData.id, isCompleted: true })
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

export { registerUser, loginUser, getProfile, updateProfile, bookAppointment, listAppointments, cancelAppointment, findDoctorWithAI, getMedicalRecordByUserId, updateDoctorSlots };