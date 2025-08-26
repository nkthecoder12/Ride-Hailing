const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieparser = require('cookie-parser');

const app=express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cookieparser());
app.use(cors({credentials:true}));

app.listen(port,()=>{console.log("Server started on port 5000")});
