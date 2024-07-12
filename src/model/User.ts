import mongoose, { Schema, Document } from "mongoose";

/*
jab bhi js use krte hai toh data ka type yaha define krte hai 
toh typescript data ka type define krne ke liye interface ek common data type hai 
usme bs ek general format likhte hai ki koi bhi chiz ata hai toh voh kis fomat me hota hai
ab yeh schema ya interface bana rahe hai voh mongoose ka hi part hai, kyunki jana toh ise mongoDB me hi hai
thats why extends is used  
*/
export interface Message extends Document{
    content: string;
    createdAt: Date
}

/*
MessageSchema ko normal way mai bhi use krskte hai but humne jo upar schema banaya hai uska use toh krna padega na
toh humne upar ek jo custom Message name ka Datatype bana liya hai na use use krege 
toh hum krege ki MessageSchem jo hai voh ek Schema follow krega jisko hum ese specify krege 
:Schema<Message>
*/ 
const MessageSchema: Schema<Message> = new Schema({
    content: {
        type: String, //mongoose me String Capital me likhte hai
        required: true
    },
    createdAt: {
        type: Date,
        required: true,
        Default: Date.now
    }
})


/*
ab hume user ka Schema bana hoga toh easily upar vale ko coppy paste kr dege and modify it 

isme ek chiz interesting hai : har user ke pas messages hoge toh uske har message ka bhi ek document user ke schema me store hoga 
toh voh schema message name soe hga jiska type ek array hoga kyunki message bhot sare ho skte hai 
and voh array Meesage type ka hoga 
Message[]
*/ 
export interface User extends Document{
    username: string; //semicolon ata hai
    email: string;
    password: string;
    verifyCode: string;
    verifyCodeExpiry: Date;
    isVerified: boolean;
    isAcceptingMessage: boolean;
    messages: Message[]
}

/*
ab User type ka schema bhi bana lete hai 

to check validity of an email 'match' func of mongoose is used which takes 2 arguments
1st arg = RegExr (like a regular expression)
2nd arg = message to display is enterd email is not valid


*/
const UserSchema: Schema<User> = new Schema({
    username: {
        type: String,
        required: [true,"Username is required"], //dala hoga toh theek nhi toh message display ho jayga as an error
        trim: true, //kisine spaces diye toh trim krdo
        unique: true
    },
    email: {
        type: String,
        required: [true,"Email is required"],
        unique: true,
        match: [/.+\@.+..+/, "please use a valid email address"],
    },
    password: {
        type: String,
        required: [true,"Password is required"],
    },
    verifyCode: {
        type: String,
        required: [true,"Verify Code is required"],
    },
    verifyCodeExpiry: {
        type: Date,
        required: [true,"Verify Code Expiry is required"],
    },
    isVerified: {
        type: Boolean,
        default: false //by default koi bhi verfied nhi hoga
    },
    isAcceptingMessage: {
        type: Boolean,
        default: true
    },
    messages: [MessageSchema]
})


/*
ab isko export kese kiya jaye
becuz : nextjs me zada tar chize edge time par hi run ho rhi hoti hai 
normally pura souce code ek hi time run hoga bar bar run nhi hoga 
but next js me nhi pta hota ki app humara 1 bar bootup hua ya 2-3.. many time hua

Thast why nextjs me data thoda sa diffirent way me export krte hai
*/

/*
yha pe return hoke jo model ayega mongoose se uska return type User hona chahiye... koi bhi faltu sa nhi

1st part me dekhte hai ki agar mongoose me pehle se hi koi User schema ho toh laake do....
par voh user schema should be same AS humara created User schema (type script part hai)

2nd part me matlab monggose me nhi hai schema means first time hi bana rhe hai , bina type script ke ese likhte hai mongoose.model("User", UserSchema)
type scipt me hume schema ka model bhi batana hota hai model<User>
*/

const UserModel = (mongoose.models.User as mongoose.Model<User>) || (mongoose.model<User>("User", UserSchema))

export default UserModel;  