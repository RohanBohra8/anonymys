import {z} from "zod"

/* 
refer SignupSchema for explaination
*/

/*
ab jab sign in hoga toh kya kya chize check krege :  
identifier (better name for email)

*/
  
export const signInSchema = z.object({
    identifier: z.string(),
    password: z.string(),
})