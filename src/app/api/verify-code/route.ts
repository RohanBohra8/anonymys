import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/User';


// TODO : ZOD krna yaha hai just like usernameunique wala
// syntax mostly same as check username unique route 
export async function POST(request: Request) {
  // Connect to the database
  await dbConnect();


  try {
    const { username, code } = await request.json();
    /* kabhi kabhi url se jo chize ati hai voh itni asani se milti nhi hai 
    toh in chizo ko kabhi kabhi decode kr lena chahiye  */
    
    const decodedUsername = decodeURIComponent(username);// yeh methods username leke unencoded verson send krta hai of decoded component 
    // same databse se username find kiya 
    const user = await UserModel.findOne({ username: decodedUsername });
    // agar username nhi mila toh 
    if (!user) {
      return Response.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }
    // aur agar mil gya toh yeh krege 
    // Check if the code is correct and not expired (code theek ho aur uski expiry abhi se zada ho)
    const isCodeValid = user.verifyCode === code; // user ke andar se nikal liya verifyCode
    const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date(); // check is expired (new current date ko expirty date se comapre kr kia (data base ke expire code ki validy jada honi chaiye))

    // agar sab thik hai sab toh save krdo user do after setting its status as verified true 
    //
    if (isCodeValid && isCodeNotExpired) {
      // Update the user's verification status
      user.isVerified = true;
      await user.save();
        // after saving return true(sab badiya hua)
      return Response.json(
        { success: true, message: 'Account verified successfully' },
        { status: 200 }
      );
    } else if (!isCodeNotExpired) { // agar code expire ho gya 
      // Code has expired
      return Response.json(
        {
          success: false,
          message:
            'Verification code has expired. Please sign up again to get a new code.',
        },
        { status: 400 }
      );
    } else {
      // Code is incorrect
      return Response.json(
        { success: false, message: 'Incorrect verification code' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error verifying user:', error);
    return Response.json(
      { success: false, message: 'Error verifying user' },
      { status: 500 }
    );
  }
}