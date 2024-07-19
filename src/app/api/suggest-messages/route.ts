import OpenAI from 'openai';
/*jab bhi hum chat gpt se baat krte hai jo text likha hua ata hai voh ek ek words me ata hai 
jese jese response generate hota hai usko hum stream krete rehte hai */
import { OpenAIStream, StreamingTextResponse } from 'ai';

import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/*next js me ai tko integrate krna difficult tha , kyunki yeh edge time hai toh iska 
runtime bhi tricky hai 
toh yha oe inhone runtime edge krdia hai taki voh trickyness handle ho sake */
export const runtime = 'edge';

//post func ko suggest krega messages
export async function POST(req: Request) {
  try {
    //promt banaya 
    const prompt =
      "Create a list of three open-ended and engaging questions formatted as a single string. Each question should be separated by '||'. These questions are for an anonymous social messaging platform, like Qooh.me, and should be suitable for a diverse audience. Avoid personal or sensitive topics, focusing instead on universal themes that encourage friendly interaction. For example, your output should be structured like this: 'What’s a hobby you’ve recently started?||If you could have dinner with any historical figure, who would it be?||What’s a simple thing that makes you happy?'. Ensure the questions are intriguing, foster curiosity, and contribute to a positive and welcoming conversational environment.";


    const response = await openai.completions.create({
      model: 'gpt-3.5-turbo-instruct',
      max_tokens: 50, //isse bill jada ayega 
      stream: true,
      prompt,
    });

    const stream = OpenAIStream(response);
    
    return new StreamingTextResponse(stream);
  } catch (error) {
    /*yha pe error thoda sa issue hai kyunki hume check krna padta hai yha pe
    direct bhi handle kr skte hai but not a good practice
    yhge is liye krte hai is agar humare 
    error jo hai uska tyoe hum check kr skte hai 
    ki voh kya ek instance hia oopen.API erro ka 
    toh usse hum values nikal skte hai alag alag tarike ki*/
    if (error instanceof OpenAI.APIError) {
      // OpenAI API error handling
      const { name, status, headers, message } = error;
      return NextResponse.json({ name, status, headers, message }, { status });
    } else {
      // General error handling
      console.error('An unexpected error occurred:', error);
      throw error;
    }
  }
}