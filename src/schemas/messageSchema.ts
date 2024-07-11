import {z} from "zod"

/* 
refer SignupSchema for explaination
*/

/*


*/
  
export const MessageSchema = z.object({
    content: z
    .string()
    .min(10, {message: "content must be atleast of 10 characters"})
    .max(300, {message: "content must be no mlonger than 300 characters"})

})