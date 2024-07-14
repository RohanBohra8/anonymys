import { resend } from "@/lib/resend";
//jo humne verification email template create kiaya tha using react-email voh leke aao
import VerificationEmail from "../../emails/VerificationEmail";
// ab hum API ka response bhi kuch na kuch bhejne vale hai toh hum usko standardize kr dete hai 
import { ApiResponse } from "@/types/ApiResponse";

// ab hume verification email send krna hai 
//emails humesha sync hote hai 
//time lete hai 

//promise return hoga of type ApiResponse jisme ApiResponse wali file me defined types hone hi chahiye 
export async function sendVerificationEmail(email: string, username: string, verifyCode: string) : Promise<ApiResponse> {
    //agar sare ke sare types ko follow krega toh success will be true and email will be sent  otherwise error  
    try{
        await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: email,
            subject: 'anonymys Verification code',
            react: VerificationEmail({username, otp: verifyCode}), // this is the component file me jake dekho args accept krrhe hai 
          });
        return {success: true, message: "verification Email sent successfully"}
    } catch(emailError){
        console.error("error Sending Verification email: ", emailError);
        return {success: false, message: "Failed to send verification Email"}
    }
}