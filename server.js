
const app = require("./app");
const dotenv = require("dotenv");
dotenv.config();

const connectToDB = require("./config/db");

connectToDB().then(()=>{
    app.on("error", (err)=>{
        console.log("app error");
    })
    app.listen(3000,()=>{
        console.log("Server is running on port 3000");
    })
}).catch((err) => {
    console.log("DB Error", err);
})

