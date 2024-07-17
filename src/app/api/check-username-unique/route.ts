import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/User';
import { z } from 'zod';
import { usernameValidation } from '@/schemas/signUpSchema';


/* ab jab bhi zod use krege toh hume schema chahiye hoga , voh hai kha pe ? 
 schemas folder me signup schema hai (kyunki usi me schema hai username validation ka)*/

 /* ab humare pas validation ke loye username schema hai toh isse hum 
 actiually me query schema banate hai 
 mean jab hume check krna ho yeh wala variable yua objet toh uska ek syntax hota hai 
 toh isis me hum check krwate hai */

const UsernameQuerySchema = z.object({
  username: usernameValidation,
});


/* ek simple sa get method likhna hai jiske through koi bhi mujhe agar yeh uername bheje toh hukm
usko check krke bta ske ki yeh valid username hai ya nhi 
take jab user apna username choose kr rha ho toh usi time use niche pata chal jay ki username taken hai 
toh isi ke liye hume kuch fast process chahiye hoga
*/


export async function GET(request: Request) {
  await dbConnect();
  //TODO: use this in all other routes
// zarurat ni hjia par good practice
  //   if(request.method !== "GET"){
//     return Response.json(
//         {
//           success: false,
//           message: 'Method not allowed',
//         },
//         { status: 405 }
//       );
//   }

    /*
    ab hum username jo bhi user as in input dalega toh use check krege ? 
    URL se check krege toh use url me query hoti hai '?' wali vahi se extract krege 

    */

  try {
    //localhost:300/api/checkuernameunique?username=rohan?phone=android
    const { searchParams } = new URL(request.url); //extracting entire url
    // searchParam me se apni(user) ki query nikal lete hai 
    const queryParams = {
      username: searchParams.get('username'), //user name yaha se ayega 
    };
    // ab query params toh a gyt toh ab isko validate kese kra jay 
    // validate by using zod 
    const result = UsernameQuerySchema.safeParse(queryParams); // check krega ki safely value pass hui toh hume voh mil jaygi 
    // TODO : console.log(result); to check kya kya milta hai hume

    // now, agar username result ni mila toh kya ho 
    if (!result.success) {
        // bhot sare erros hote hai toh bs username ke errors ko hi nikal rhe hai hum 
        // agar ni hoga error toh empty error mil jayga 
      const usernameErrors = result.error.format().username?._errors || [];
      
      // ab response return kr dege 
      return Response.json(
        {
          success: false,
          //agar errors ki length >7 hui toh comma laga ke dedo nhi toh msg print 
          message:
            usernameErrors?.length > 0
              ? usernameErrors.join(', ')
              : 'Invalid query parameters',
        },
        { status: 400 }
      );
    }

    //now ab aar humare pas correct username mil gya toh ab kya krege 
    // console log krege toh hi pta chalega result se kya nikalna tha 
    const { username } = result.data;
    // AB SAME OLD CHIZ , db se nikalo 
    //check kro hai ki ni 

    const existingVerifiedUser = await UserModel.findOne({
      username,
      isVerified: true,
    });
    // agar dono chie hai toh user existing hai pehle se hi
    //hai toh return krdo alredy taken hai 
    if (existingVerifiedUser) {
      return Response.json(
        {
          success: false,
          message: 'Username is already taken',
        },
        { status: 200 }
      );
    }
    // nhi toh bta do ki unique hai name
    return Response.json(
      {
        success: true,
        message: 'Username is unique',
      },
      { status: 200 }
    );
  } catch (error) {
    // error display krwa lia console log se 
    //fir response bhj dege varna kese kam chalega 
    console.error('Error checking username:', error);
    return Response.json(
      {
        success: false,
        message: 'Error checking username',
      },
      { status: 500 }
    );
  }
}