import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './config/mongodb.js';
import connectCloudinary from './config/cloudinary.js';
import adminRoute from './routes/adminRoute.js';
import doctorRoute from './routes/doctorRoute.js';
import userRouter from './routes/userRoute.js';
import paymentRoute from './routes/paymentRoute.js'
import testingStaffRoute from './routes/testingStaffRoute.js';
import nurseRoute from './routes/nurseRoute.js';

//api config
const app = express();
const port = process.env.PORT || 4000;
connectDB();
connectCloudinary();

//middlewares
app.use(express.json());
app.use(cors());

//api endpoints
app.get('/', (req, res) => {
    res.send('Hello world')
})

app.use('/api/admin', adminRoute);
app.use('/api/doctor', doctorRoute);
app.use('/api/testing-staff', testingStaffRoute);
app.use('/api/user', userRouter);
app.use('/api/nurse', nurseRoute);
app.use('/api/payment', paymentRoute);

app.listen(port, () => console.log("Server started : ", port));