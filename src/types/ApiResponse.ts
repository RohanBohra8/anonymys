import { Message } from "@/model/User";

//this doesnt contains actual response of API but 
// it will contain ki kis type se humara response dikhna chahiye 
// jab bhi type define ho tab interface mostly 

/*
isAcceptingMessages isliye becuz kya pta kisi ko ek ke baad ek message bhejne ho 
ab voh boolean hai but '?' ayega (optional) kyunki zaruri nhi hai ki humesha ek se zada bhejga

*/
export interface ApiResponse {
    success: boolean;
    message: string;
    isAcceptingMessage?: boolean;
    messages?: Array<Message>; //
}

