import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './configs/mongoDb.js';
import userRouter from './routes/userRoutes.js';
import imageRouter from './routes/imageRoutes.js';

//app config

const PORT = process.env.PORT || 4000;

const app = express();

//middlewares
app.use(express.json())
app.use(cors());
connectDB();
//API routes

app.get('/', (req,res)=>{
    
    res.status(200).send('Hello World!');
})

app.use('/api/user',userRouter)
app.use('/api/image',imageRouter)

app.listen(PORT, ()=> {
    console.log(`Server is running on port ${PORT}`);
});