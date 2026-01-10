import validator from 'validator'
import bcrypt from 'bcrypt'
import { v2 as cloudinary } from 'cloudinary'
import doctorModel from '../models/doctorModel.js'
import jwt from 'jsonwebtoken'
import appointmentModel from '../models/appointmentModel.js'
import userModel from '../models/userModel.js'
import medicineModel from '../models/medicineModel.js'
import medicalTestModel from '../models/medicalTestModel.js'
import testingStaffModel from '../models/testingStaffModel.js'
import { uploadToCloudinary } from '../utils/cloudinaryUpload.js'
import nurseModel from '../models/nurseModel.js'

//api for adding doctor
const addDoctor = async (req, res) => {
    try {
        const { name, email, password, speciality, degree, experience, about, fees, address } = req.body;
        const imageFile = req.file;

        // checking for all data to add doctor
        if (!name || !email || !password || !speciality || !degree || !experience || !about || !fees || !address) {
            return res.status(403).json({
                success: false,
                message: "Missing details."
            });
        }

        // valid email format
        if (!validator.isEmail(email)) {
            return res.status(405).json({
                success: false,
                message: "Please enter a valid email."
            });
        }

        // valid strong pass
        if (password.length < 8) {
            return res.status(403).json({
                success: false,
                message: "Password has been length than 8 characters."
            });
        }

        // hashing doctor pass
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // upload image to cloudinary using streamifier
        const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" });
        const imageUrl = imageUpload.secure_url

        const doctorData = {
            name,
            email,
            image: imageUrl,
            password: hashedPassword,
            speciality,
            experience,
            about,
            fees,
            address: JSON.parse(address),
            date: Date.now(),
            degree
        }

        const newDoctor = new doctorModel(doctorData);
        await newDoctor.save()

        return res.json({
            success: true,
            message: "Doctor added"
        });

    } catch (e) {
        console.log(e)
        return res.status(400).json({
            success: false,
            message: e.message
        });
    }
}

// api for admin login
const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            const token = jwt.sign(email + password, process.env.JWT_SECRET_KEY);
            return res.json({
                success: true,
                token
            });
        } else {
            return res.status(401).json({
                success: false,
                message: "Failed to log in."
            });
        }
    } catch (e) {
        console.log(e)
        return res.status(400).json({
            success: false,
            message: e.message
        });
    }
}

//api to get all doctors
const getAllDoctors = async (req, res) => {
    try {
        const doctors = await doctorModel.find({}).select('-password');
        return res.json({
            success: true,
            doctors
        });
    } catch (e) {
        return res.status(400).json({
            success: false,
            message: e.message
        });
    }
}

// api get all appointments
const appointmentsAdmin = async (req, res) => {
    try {
        const appointments = await appointmentModel.find({ cancelled: false });
        return res.json({
            success: true,
            appointments
        })
    } catch (e) {
        console.log(e)
        return res.status(400).json({
            success: false,
            message: e.message
        });
    }
}

// api admin cancel appointment
const cancelAppointmentAdmin = async (req, res) => {
    try {
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
        console.log(e)
        return res.status(400).json({
            success: false,
            message: e.message
        });
    }
}

// api to get dasboard data for admin
const adminDashboard = async (req, res) => {
    try {
        const doctors = await doctorModel.find({});
        const users = await userModel.find({});
        const appointments = await appointmentModel.find({ cancelled: false });

        const dashData = {
            doctors: doctors.length,
            appointments: appointments.length,
            users: users.length,
            lastestAppointments: appointments.reverse().slice(0, 5)
        }

        res.json({
            success: true,
            dashData
        })

    } catch (e) {
        console.log(e)
        return res.status(400).json({
            success: false,
            message: e.message
        });
    }
}

// api add medicine
const addMedicine = async (req, res) => {
    try {
        const { name, genericName, category, form, manufacturer, description, indications, contraindications, sideEffects } = req.body;

        if (!name || !genericName || !category) {
            return res.status(403).json({
                success: false,
                message: "Missing deatils."
            });
        }

        const medicineData = {
            name,
            genericName,
            category,
            form,
            manufacturer,
            description,
            indications,
            contraindications,
            sideEffects
        }
        const newMedicine = new medicineModel(medicineData);
        await newMedicine.save();

        return res.json({
            success: true,
            message: "Medicine added"
        });
    } catch (e) {
        console.log(e)
        return res.status(400).json({
            success: false,
            message: e.message
        });
    }
}

// api get all medicines
const getAllMedicines = async (req, res) => {
    try {
        const medicines = await medicineModel.find({});
        return res.json({
            success: true,
            medicines
        });
    } catch (e) {
        console.log(e)
        return res.status(400).json({
            success: false,
            message: e.message
        });
    }
}

// api paging medicines
const pagingMedicines = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 8;
        const skip = (page - 1) * limit;

        const totalMedicines = await medicineModel.countDocuments();
        const medicines = await medicineModel.find({}).skip(skip).limit(limit);

        const totalPages = Math.ceil(totalMedicines / limit);

        res.json({
            success: true,
            medicines,
            currentPage: page,
            totalPages
        });
    } catch (e) {
        console.log(e)
        return res.status(400).json({
            success: false,
            message: e.message
        });
    }
}

// api edit medicine
const editMedicine = async (req, res) => {
    try {
        const { id, name, genericName, category, form, manufacturer, description, indications, contraindications, sideEffects } = req.body;

        const updatedMedicine = await medicineModel.findByIdAndUpdate(id, {
            name,
            genericName,
            category,
            form,
            manufacturer,
            description,
            indications,
            contraindications,
            sideEffects
        }, { new: true });

        if (!updatedMedicine) {
            return res.status(404).json({
                success: false,
                message: "Medicine not found"
            });
        }

        return res.json({
            success: true,
            message: "Medicine updated successfully"
        });
    } catch (e) {
        console.log(e)
        return res.status(400).json({
            success: false,
            message: e.message
        });
    }
}

//api find medicine by id
const findMedicineById = async (req, res) => {
    try {
        const { id } = req.params;
        const medicine = await medicineModel.findById(id);
        if (!medicine) {
            return res.status(404).json({
                success: false,
                message: "Medicine not found"
            });
        }
        return res.json({
            success: true,
            medicine
        });
    } catch (e) {
        console.log(e)
        return res.status(400).json({
            success: false,
            message: e.message
        });
    }
}

// delete medicine
const deleteMedicine = async (req, res) => {
    try {
        const { id } = req.body;
        const deletedMedicine = await medicineModel.findByIdAndDelete(id);

        if (!deletedMedicine) {
            return res.status(404).json({
                success: false,
                message: "Medicine not found"
            });
        }

        return res.json({
            success: true,
            message: "Medicine deleted successfully"
        });
    } catch (e) {
        console.log(e)
        return res.status(400).json({
            success: false,
            message: e.message
        });
    }
}

// api to add a medical test
const addMedicalTest = async (req, res) => {
    try {
        const { name, description, fees, category, preparation, turnaroundTime, unit, normalRange } = req.body;

        if (!name || !fees || !category) {
            return res.status(403).json({
                success: false,
                message: "Missing deatils."
            });
        }

        const medicalTestData = {
            name,
            description,
            fees,
            category,
            preparation,
            turnaroundTime,
            unit,
            normalRange
        }
        const newMedicalTest = new medicalTestModel(medicalTestData);
        await newMedicalTest.save();

        return res.json({
            success: true,
            message: "Medical Test added"
        });
    } catch (e) {
        console.log(e)
        return res.status(400).json({
            success: false,
            message: e.message
        });
    }
}

//api get all medical tests
const getAllMedicalTests = async (req, res) => {
    try {
        const medicalTests = await medicalTestModel.find({});
        return res.json({
            success: true,
            tests: medicalTests
        });
    } catch (e) {
        console.log(e)
        return res.status(400).json({
            success: false,
            message: e.message
        });
    }
}

// api paging medical tests
const pagingMedicalTests = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 8;
        const skip = (page - 1) * limit;

        const totalTests = await medicalTestModel.countDocuments();
        const tests = await medicalTestModel.find({}).skip(skip).limit(limit);

        const totalPages = Math.ceil(totalTests / limit);

        res.json({
            success: true,
            tests,
            currentPage: page,
            totalPages
        });
    } catch (e) {
        console.log(e)
        return res.status(400).json({
            success: false,
            message: e.message
        });
    }
}

// edit medical test
const editMedicalTest = async (req, res) => {
    try {
        const { id, name, description, fees, category, preparation, turnaroundTime, unit, normalRange } = req.body;

        const updatedTest = await medicalTestModel.findByIdAndUpdate(id, {
            name,
            description,
            fees,
            category,
            preparation,
            turnaroundTime,
            unit,
            normalRange
        }, { new: true });

        if (!updatedTest) {
            return res.status(404).json({
                success: false,
                message: "Medical test not found"
            });
        }

        return res.json({
            success: true,
            message: "Medical test updated successfully"
        });
    } catch (e) {
        console.log(e)
        return res.status(400).json({
            success: false,
            message: e.message
        });
    }
}

// api find medical test by id
const findMedicalTestById = async (req, res) => {
    try {
        const { id } = req.params;
        const medicalTest = await medicalTestModel.findById(id);
        if (!medicalTest) {
            return res.status(404).json({
                success: false,
                message: "Medical test not found"
            });
        }
        return res.json({
            success: true,
            medicalTest
        });
    } catch (e) {
        console.log(e)
        return res.status(400).json({
            success: false,
            message: e.message
        });
    }
}

// delete medical test
const deleteMedicalTest = async (req, res) => {
    try {
        const { id } = req.body;
        const deletedTest = await medicalTestModel.findByIdAndDelete(id);
        if (!deletedTest) {
            return res.status(404).json({
                success: false,
                message: "Medical test not found"
            });
        }
        return res.json({
            success: true,
            message: "Medical test deleted successfully"
        });
    } catch (e) {
        console.log(e)
        return res.status(400).json({
            success: false,
            message: e.message
        });
    }
}

//api add testing staff
const addTestingStaff = async (req, res) => {
    try {
        const { name, email, password, department, qualification, experience, about, address } = req.body;
        const imageFile = req.file;

        if (!name || !email || !password || !department || !qualification || !experience || !about || !address) {
            return res.status(403).json({
                success: false,
                message: "Missing details."
            });
        }

        if (!validator.isEmail(email)) {
            return res.status(405).json({
                success: false,
                message: "Please enter a valid email."
            });
        }

        if (password.length < 8) {
            return res.status(403).json({
                success: false,
                message: "Password has been length than 8 characters."
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" });
        const imageUrl = imageUpload.secure_url;

        const testingStaffData = {
            name,
            email,
            image: imageUrl,
            password: hashedPassword,
            department,
            qualification,
            experience,
            about,
            address: JSON.parse(address),
            date: Date.now()
        };

        const newTestingStaff = new testingStaffModel(testingStaffData);
        await newTestingStaff.save();

        return res.json({
            success: true,
            message: "Testing staff added"
        });
    } catch (e) {
        console.log(e)
        return res.status(400).json({
            success: false,
            message: e.message
        });
    }
}

// api to get all test staff
const getAllTestingStaff = async (req, res) => {
    try {
        const testingStaffs = await testingStaffModel.find({}).select('-password');
        return res.json({
            success: true,
            testingStaffs
        })
    } catch (e) {
        res.status(400).json({
            success: false,
            message: e.message
        });
    }
}

// api add nurse
const addNurse = async (req, res) => {
    try {
        const { name, email, password, speciality, degree, experience, about, address } = req.body;
        const imageFile = req.file;

        if (!name || !email || !password || !speciality || !degree || !experience || !about || !address) {
            return res.status(403).json({
                success: false,
                message: "Missing details."
            });
        }

        if (!imageFile) {
            return res.status(403).json({
                success: false,
                message: "Please upload nurse image."
            });
        }

        if (!validator.isEmail(email)) {
            return res.status(405).json({
                success: false,
                message: "Please enter a valid email."
            });
        }

        if (password.length < 8) {
            return res.status(403).json({
                success: false,
                message: "Password has been length than 8 characters."
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" });
        const imageUrl = imageUpload.secure_url;

        const nurseData = {
            name,
            email,
            image: imageUrl,
            password: hashedPassword,
            speciality,
            degree,
            experience,
            about,
            address: JSON.parse(address),
            date: Date.now()
        };

        const newNurse = new nurseModel(nurseData);
        await newNurse.save();

        return res.json({
            success: true,
            message: "Nurse added"
        });
    } catch (e) {
        console.log(e)
        return res.status(400).json({
            success: false,
            message: e.message
        });
    }
}

const getAllNurses = async (req, res) => {
    try {
        const nurses = await nurseModel.find({}).select('-password');

        return res.json({
            success: true,
            nurses
        });
    } catch (e) {
        console.log(e)
        return res.status(400).json({
            success: false,
            message: e.message
        });
    }
}

export { addDoctor, loginAdmin, getAllDoctors, appointmentsAdmin, cancelAppointmentAdmin, adminDashboard, addMedicine, getAllMedicines, pagingMedicines, editMedicine, deleteMedicine, findMedicineById, addMedicalTest, getAllMedicalTests, pagingMedicalTests, editMedicalTest, findMedicalTestById, deleteMedicalTest, addTestingStaff, getAllTestingStaff, addNurse, getAllNurses }