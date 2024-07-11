import {z} from "zod"

/* 
refer SignupSchema for explaination
*/

/*
accept jab user message krega toh jada kuch nhi dekhege bas ek hi:  
acceptMessages

*/
  
export const acceptMessageSchema = z.object({
    acceptMessages: z.boolean(),
    
})