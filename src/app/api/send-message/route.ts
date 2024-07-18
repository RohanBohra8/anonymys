import UserModel from '@/model/User';
import dbConnect from '@/lib/dbConnect';
/*humne message ka model bhi banaya th avoh use krege */
import { Message } from '@/model/User';

/*ab ek post method banayege to send a message to a user 
messages koi bhi bhj skta hai toh zaruri nhi hai ki user loggedin ho 
tabhi toh mysterious ananymous app banega  */
export async function POST(request: Request) {
    //dataase connect
    await dbConnect();
  // requesst se values nikalo
  const { username, content } = await request.json();

  try {
    // findind and extracting the user from DB by username
    const user = await UserModel.findOne({ username }).exec();
    //user agar ni mila toh 
    if (!user) {
      return Response.json(
        { message: 'User not found', success: false },
        { status: 404 }
      );
    }
    // yha tak aagye toh matlab user mil gya 
    // Check if the user is accepting messages
    if (!user.isAcceptingMessage) {
      return Response.json(
        { message: 'User is not accepting messages', success: false },
        { status: 403 } // 403 Forbidden status
      );
    }
    // yha tak agye means user is accepting messages
    // means we are good to go to send a message
    // ab ek new message bna lete hai : refer message schema in user model
    const newMessage = { content, createdAt: new Date() };

    /*ab humne message toh bna liya toh ab hume pas user tha 
    toh use messages me hi push kr dete hai*/
    // Push the new message to the user's messages array
    user.messages.push(newMessage as Message);
    await user.save();
    // yha tak agye toh kaam ho gya 
    // toh krdo bs response true return
    return Response.json(
      { message: 'Message sent successfully', success: true },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error adding message:', error);
    return Response.json(
      { message: 'Internal server error', success: false },
      { status: 500 }
    );
  }
}