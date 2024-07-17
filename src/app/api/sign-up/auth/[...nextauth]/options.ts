//next-auth part
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
//user ko sign in karwayege toh bcrypt bhi lagega
import bcrypt from 'bcryptjs';
//db cuz database me jake hi toh dekhege hi user registerd hai ya ni 
import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/User';

//export krege 
/*
par isko banana kese hoga 
*/
export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            id: 'credentials',
            name: 'Credentials',
            //yeh hai main parameter yha pe hume credentails ka access milta hai
            credentials: {
                email: { label: "Email", type: "text"},
                password: { label: "Password", type: "password" }
              },
              // abhi next auth ko nhi pta ki authorize kese kiya jaye 
              //toh uske liye ek custom method desgin krna padega
              //which is an asyc fuction with return type oh a Promise of any
              //takes cerdentials as input 
              async authorize(credentials: any): Promise<any>{
                 /* directly toh access nhi kr skte pehle DB se puchna pafega kya mamle hai */
                 await dbConnect();
                 try{
                    /* DB me se UserModel me se data find kra 
                    $or means ek ek krke array me go through krega milta hai toh theek hai 
                    nhi toh rehne do 
                    */
                    const user = await UserModel.findOne({
                        $or: [
                          { email: credentials.identifier },
                          { username: credentials.identifier },
                        ],
                      });
                      // after fetching our data 
                      // ab user hi ni mila toh error throw krdo 
                      if (!user) {
                        throw new Error('No user found with this email');
                      }
                      //agar user verified hi nhi hai toh firse error throw krdo
                      //yehi isverified humne custom create kiya tha jo normally google auth me ni milega 
                      if (!user.isVerified) {
                        throw new Error('Please verify your account before logging in');
                      }
                      //ab sab kuch theek hai toh bs password ko check krlo match krta hai ya ni 
                      // bcrypt will compare credentials pass word with user pswd from DB
                      const isPasswordCorrect = await bcrypt.compare(
                        credentials.password,
                        user.password
                      );
                      // ab password correct hhai toh return krdo user ko
                      //nhi toh error trow krdo
                      if (isPasswordCorrect) {
                        return user;
                      } else {
                        throw new Error('Incorrect password');
                      }
                 } catch(err:any){
                    // throw new error is mendatory
                    /*
                    cuz docs says so
                    // If you return null then an error will be displayed advising the user to check their details.
                    */
                    throw new Error(err);
                 }
              }
              // ab yeh jo humne itna kiya uska result authOptions ko ja rha hai upar 
        })
    ],
    pages: {
        // we have overwritten a signin page from next auth docs
        signIn: '/sign-in',
      },
      session: {
        strategy: 'jwt',
      },
      secret: process.env.NEXTAUTH_SECRET,
      // ab hum callbascks krege jo hume return krke deti hai chize
      //so always remember to return thigs we are writing in the callback
      /*
        jwt arguments me jo user aya hai voh upar credentials me jo humne
        return kiya tha user vha se aya hai 
        normally token me bs id hoti hai , but hum usko aur powerful banyege 
        token me hum max to max data dal dege chahe usse load jada badh jay but DB queries reduce hogi
        isse hume jab chahe tab data nil skta hai token and session dono se 

      */
      callbacks: {
        async jwt({ token, user }) {
            //agar user hai toh usse data nikal ke token me inject krte hai 
          if (user) {
            token._id = user._id?.toString(); // Convert ObjectId to string
            token.isVerified = user.isVerified;
            token.isAcceptingMessages = user.isAcceptingMessages;
            token.username = user.username;
          }
          return token;
        },
        // ab token se chize nikal se session me dalege 
        async session({ session, token }) {
          if (token) {
            session.user._id = token._id;
            session.user.isVerified = token.isVerified;
            session.user.isAcceptingMessages = token.isAcceptingMessages;
            session.user.username = token.username;
          }
          return session;
        },
      },
}