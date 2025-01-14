const mongoose =  require("mongoose");

async function connectToDB(){
    try {
        console.log(process.env.MONGO_URI);
        const connectionInstance = await mongoose.connect(`${process.env.MONGO_URI}/datacove`);
        console.log("Connected to DB", connectionInstance.connection.host);
    } catch (error) {
        throw error;
    }
}

module.exports =  connectToDB;