const mongoose  = require("mongoose");

const userSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true,
        trim:true,
        lowercase:true,
        unique:true,
        minlength:[3,"Username must be atleast 3 character long!"]
    },
    email:{
        type:String,
        required:true,
        trim:true,
        lowercase:true,
        unique:true,
        minlength:[13,"Email must be atleast 13 character long!"]
    },
    password:{
        type:String,
        required:true,
        trim:true,
        minlength:[5,"Password must be atleast 5 character long!"]
    }
})

const user = mongoose.model("user",userSchema);
module.exports =  user;