// db connection har ek route me chalta hai cuz net js edge running hai 
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";

//jab bhi nextjs me api likte hai ese likte hai 
//using async

/* 
express me hum btate teh ki konsa method use hoga 
jese POST GET PUT , aur upar se hum url bhi dete the jese api/get/method_name
par yaha pe url already handled hai api/signup/route (folder structure)
*/
//request of type Request nad POST uz server pe saman de reh hai 
export async function POST(request: Request)
{   
    //sbse pehle DB connect krwa do
    await dbConnect()

    try{
        //await lagana hi lagana hai (classic mistake)
        const {username, email, password} = await request.json() //json se chize extract krli
        //kya koi esa user hai jiska username bhi hai aur voh verified bhi hai
        
        const existingUserVerifiedByUsername = await UserModel.findOne({
            username,
            isverified:true //voh username lake do jo verified hai
        })

        if(existingUserVerifiedByUsername) {
            return Response.json({
                success:false, //registration nhi ho paya kyunki already registerd hai
                message:"username is already taken"
            },{status:400})
        }
        
        //1)isbar user lake do agar email exist krta hai toh
        const existingUserByEmail = await UserModel.findOne({email})
        //verifyCode generate
        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString()
        
        //agar user already exist krta hai toh humare pas 2-3 conditions ayegi
        if(existingUserByEmail) {

            //agar existing user verified hai toh
            if(existingUserByEmail.isVerified) {
                return Response.json({
                    success:false,
                    message:"User already exist wiht this email" 
                }, {status: 400})
                
            } else {
                //user existing hai leking verified nhi hai
                //toh vapas se vahi nivahe wala hash password, verifyCode, expiryCode, 
                //then last save in DB krna hoga check in below condition for better understanding through comments
                const hashedPassword = await bcrypt.hash(password,10)
                //user exist krta hai par ho skta hai ki user ko uska password yad na ho ya change krna chahta ho
                //toh new password set kr dege
                existingUserByEmail.password = hashedPassword; //inbuilt func
                existingUserByEmail.verifyCode = verifyCode;
                existingUserByEmail.verifyCodeExpiry = new Date(Date,now() + 3600000) //1 hour ++
                await existingUserByEmail.save()
            }
        } else {
            //iska matlab user aya hi pehli bar hai
            //2) encrypt the password
            const hashedPassword = await bcrypt.hash(password,10)
            //3) expiry date bhi set krlete hai
            /*
            interesenting thing : even tho we have const we are still doing changes in it below
            becuz of the new keyword we are getting a object (expiryDate) in return and 
            object ke iche let const var kuch bhi ho , object memory ke andar ek reference point hai joki ek area hai 
            jiske andar ki values change ho skti hai
            */
            const expiryDate = new Date()
            expiryDate.setHours(expiryDate.getHours() + 1) //inbuit method to set time
            //4) save user in database
            const newUser = new UserModel({
                username,
                email,
                hashedPassword,
                verifyCode,
                expiryDate,
                isVerified: false,
                isAcceptingMessage: true,
                messages: []
            })
            await newUser.save()
            

        }
        //ab user save ho gya hai toh uske bad verification email bhi toh bhjna padega 
        /*
        pehle toh await krege then jo method tha humare pas sendVerificationEmail
        */
        const emailResponse = await sendVerificationEmail( email, username, verifyCode )
        //agar humare pas response successful nhi hua toh 
        if(!emailResponse.success){
            return Response.json({
                success:false, //email response nhi aa paya hai
                message:emailResponse //jo emailResponse hai usme bhi message hota hai
            }, {status: 500})
            //agar finally resonse sahi raha toh return true krdo
            return Response.json({
                success:true, //email response nhi aa paya hai
                message:"User registered successfully. Please verify your email." //jo emailResponse hai usme bhi message hota hai
            }, {status: 201})
        }
    } catch(error){
        console.log("Error Registering User",error); //yeh terminal pe dikhega 
        //yeh response frontend pe dikhega  
        return Response.json(
            {
                success: false,
                message: "Error registering user"
            },
            {
                status: 500
            }
        )
    }
}