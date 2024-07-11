import {z} from "zod"

/* 
ab humare pas jab user signup kr rha hai na toh jada chize toh check ho ni rhi
sirf 2-3 check kr rhe hai 
username 
email
password
toh hum validation ke sath sath usko export bhi kr dege
*/

export const usernameValidation = z
    .string()
    .min(2,"Username must be atleast 2 characters")
    .max(20, "Username must be less than or equal to 20 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username must not contain special character")
  

//upar object isliye use nhi liya because upar ek hi value thi jisko validate krna tha
//idhar multiple hogi 
export const signUpSchema = z.object({
    username: usernameValidation, // uspar banaye ve ko use kr lia direct
    email: z.string().email({message:"Invalid email adress"}),
    password: z.string().min(6,{message: "paswword must be atleast 6 characters"})
})