const express= require("express");
const userRouter = require("./routes/user.routes");

const dotenv = require("dotenv");
dotenv.config();

const connectToDB = require("./config/db");
connectToDB();

const cookieParser = require("cookie-parser");

const indexRouter = require("./routes/index.route");

const app = express();
const port = 3000;


app.use(cookieParser());

app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.set("view engine","ejs");

app.use('/',indexRouter);
app.use('/user',userRouter);

app.listen(port,()=>{
    console.log(`Server is Running on ${port}`);
})