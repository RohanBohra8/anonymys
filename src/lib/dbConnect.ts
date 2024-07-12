import mongoose from "mongoose";

/*
sbse pehle hum mongoose ko le aye toh theek hai 

ab agar database se connection agar humare pas ata hai toh 
yha pe typescript use krege thoda sa ki databaw connection ke bad jo muje object aa rha hai 
uski muje kya value chahiye aur uska type kya hai
*/ 

//this question mark? is optional means agar return humarepas hota hai toh theek hai nhi toh ayegi toh number ke format me hi ayegi
type ConnectionObject = {
    isConnected?: number
}

//ek variable connection jiska type ConnectionObject hai which is empty initally
const connection: ConnectionObject = {}

/*
why async used ? 
humara database alag hi duniya me hai 
access krte time connection fail bhi ho skta hai 
is liye use kiya 
*/
/*
ab database se humare pas kuch return bhi toh hoga 
toh voh value jo return hogi voh ek promise hoga
aur ab promise ka return type bhi kuch bhi ho skta hai is lye void
*/
// here void means we dotntcare what type of data we are getting in return
async function dbConnect(): Promise<void> {
    //IMPORTANT!!!  database connection check krlo ki kya pata pehle se hi connected ho
    if(connection.isConnected) {
        console.log("Already connected to database");
        return;
    }

    //incase agar database already connected nhi tha toh hum newly connect krege
    try {
        //database dusri duniya me hai ....intezar (await) krna hi padega 
        // mongoose ka use krke connect krege apne database url pe || agar nhi aya toh koi alternate use ho jayga
        const db = await mongoose.connect(process.env.MONGODB_URI || "", {})

        //now the db variable we got.... we will get few things out of it 
        //upar jo isConnected ka type number tha voh yehi se extract kr rhe hai hum
        connection.isConnected = db.connections[0].readyState
        console.log("DB Connected Successfully");
    } catch(error) {
        //ab process connect hi nhi hua toh usko gracefully exit krdege
        console.log("DB Connection Failed ", error)
        process.exit(1);
    }
}

//now we export our database connection

export default dbConnect;