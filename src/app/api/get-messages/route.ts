import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/User';
import mongoose from 'mongoose';
import { User } from 'next-auth';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/options';

/* ab is get route ka itna sa kaam hai ki yeh saare ke saare msges currently login user ke 
messages lake do 
ab yeh toh dekh lege ki msg lake do par usse pehle yeh dekho ki 
aap logged in ho ki nhi */
/* yeh tricky hai kyunki jo humne Usermodel me interface banaya tha usme messages ka type Message[] array tha 
jo ki apne aap me ek docuemt type ka tha */

export async function GET(request: Request) {
  //DB se connet krwaya 
  await dbConnect();
  // same kaam session liye user nikalne ke liye 
  const session = await getServerSession(authOptions);
  // ab isme se user hai toh nikala 
  const _user: User = session?.user;

  // agar session ya usme user ni aa paya toh 
  if (!session || !_user) {
    return Response.json(
      { success: false, message: 'Not authenticated' },
      { status: 401 }
    );
  }
  // aur ab agar aa gya toh 
   /* _user._id yeh jo yah humne isko callbacks wale par taken ya session me
   isko string me convert kr dia tha  
   yeh chiz aggregation me dikkat krti hai 
   isse bachne ke liye isko convert krege mongoose.Types.ObjectId(_user._id) ese
   toh yeh agar string me bhi hoga toh jo convert hoke jayga 
   voh hoaga mongoose ka object id (which is our goal)*/
  const userId = new mongoose.Types.ObjectId(_user._id);
 
  try {
    /* ab hum actually me user ke mssges ko lana chahte hai 
    jo apne according lane ke liye aggregation use kiya 
    
    syntac dekhlo aggragation pipeline ka : niche*/
    const user = await UserModel.aggregate([
      { $match: { _id: userId } }, //1st pipeline : boht sare user hoskte hai toh un user me se ek esa user lake do jiski id match krti ho
      { $unwind: '$messages' }, //2nd pipeline : arrays ko unwind kro: jese hi unwind karoge array ko toh voh un array ko open krke dedega(search googel) 
      { $sort: { 'messages.createdAt': -1 } },//3rd pipeline : ab unwinded essages ko sort kro ulte order me 
      { $group: { _id: '$_id', messages: { $push: '$messages' } } }, //4th pipeline : grouping krdo un sorted messages ki by parameter _id,messages
    ]).exec();

    // agar hai hi ni toh matlab aggregation se kuch ni mila 
    // so we return false response
    if (!user || user.length === 0) {
      return Response.json(
        { message: 'User not found', success: false },
        { status: 404 }
      );
    }
    /*yha tak aa gye means mil gya user
    so as a response hum messages bhejege
    aggregation re return type array milta hai uska first index i.e [0]  usme se messages nikal leke hum
    vahi return hoga */
    return Response.json(
      { messages: user[0].messages },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error('An unexpected error occurred:', error);
    return Response.json(
      { message: 'Internal server error', success: false },
      { status: 500 }
    );
  }
}