/* getServerSessionmethod is given by next auth
jo bhi session hai voh backnd se mil jata hai isme
ab yeh session apne aap nhi chalta isko chahiye hota hai 
authOptions jisme credential providers hai */
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/options';
import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/User';
/* hume jo session lagega usme bhi ek user hota hia toh next-auth se bhi ek 
user ko import kr lege */
import { User } from 'next-auth';


/*  pehle ek post request banate hai jisme jo currently logged in user hai 
voh jese hi toggle pe click kre toh toggle flip hao jayga
means tehy are accepting or not accepting messages  */
export async function POST(request: Request) {
  // Connect to the database
  await dbConnect();


  /*ab sabse pehla kaam hai ki mujhe currently logged in user chahiye 
  jo milega mujhe getServerSeesion se aur isko auth options chahiye  */
  const session = await getServerSession(authOptions);
  /*ab ssession milne ka yeh matlab ni hai ki user mil gya 
  toh hum session me se optionally user nikalege
  hume kese pta isme user hai ? -> kyunki humne hi usme dala tha in auth option files */
  // is user ka type : User hai 
  const user: User = session?.user; //as User
  // ab session ya uske andar user nhi hua toh 
  // return 401 resonse (means user logged in hi nhi hai)
  if (!session || !session.user) {
    return Response.json(
      { success: false, message: 'Not authenticated' },
      { status: 401 }
    );
  }

  // yha tak aa gye means user mil gya 
  /* ba mujhe chaciye ID cuz data base me ID se hi toh chize
  nikaluga */
  const userId = user._id;
  // request lege 
  const { acceptMessages } = await request.json();

  try {
    // Update the user's message acceptance status
    // user find kra then update kra in Database
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { isAcceptingMessages: acceptMessages },
      { new: true /* isse hoga yeh ki jo return value milegi voh updated milegi */ }
    );

    //if user mila bhi hai ya ni ? 
    if (!updatedUser) {
      // User not found
      return Response.json(
        {
          success: false,
          message: 'Unable to find user to update message acceptance status',
        },
        { status: 404 }
      );
    }
    // yha tak aagye means updated user mil gya 
    // Successfully updated message acceptance status
    return Response.json(
      {
        success: true,
        message: 'Message acceptance status updated successfully',
        updatedUser,
      },
      { status: 200 }
    );
  } catch (error) { 
    console.error('Error updating message acceptance status:', error);
    return Response.json(
      { success: false, message: 'Error updating message acceptance status' },
      { status: 500 }
    );
  }
}

/*  ab ek get request banate hai jisme hum database se 
querry krke status bhj dete hai ki msg accept kr rha hai ya ni   */
export async function GET(request: Request) {
  // Connect to the database
  await dbConnect();

  //asme as above session waala kaam
  // Get the user session
  const session = await getServerSession(authOptions);
  const user = session?.user;// as User (assert krhe hai )

  // Check if the user is authenticated
  if (!session || !user) {
    return Response.json(
      { success: false, message: 'Not authenticated' },
      { status: 401 }
    );
  }

  try {
    // Retrieve the user from the database using the ID
    const foundUser = await UserModel.findById(user._id);

    // ab user hi ni aya toh 
    if (!foundUser) {
      // User not found
      return Response.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }
    // yha tak aagye toh means user mil gya 
    // Return the user's message acceptance status
    return Response.json(
      {
        success: true,
        isAcceptingMessages: foundUser.isAcceptingMessage, // User model jo model folder me banaya tha uday isAcceptingMessage hi hai 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error retrieving message acceptance status:', error);
    return Response.json(
      { success: false, message: 'Error retrieving message acceptance status' },
      { status: 500 }
    );
  }
}