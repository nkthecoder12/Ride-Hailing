const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieparser = require('cookie-parser');
const connectDB = require('./config/db');
const authRoutes = require('./src/routes/auth.routes');

dotenv.config();

const app=express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cookieparser());
app.use(cors({credentials:true}));
app.use('/api/auth',authRoutes);

connectDB().then(() => {
    app.listen(port,()=>{console.log(`Server started on port ${port}`)});
});
