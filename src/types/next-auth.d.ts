// next auth humare existing user model ko access nhi krne deta toh iske liye humne alag se model banaya 
import 'next-auth';

//next auth ke pre delared module ko redeclare kr rhe hai 
declare module 'next-auth' {
    /* 
    apka jo session interface tha voh toh hoga par usko apne loye redeclare kr rha hu 
    please dont mind  
    */
  interface Session {
    user: {
      _id?: string;
      isVerified?: boolean;
      isAcceptingMessages?: boolean;
      username?: string;
    } & DefaultSession['user'];
    //yeh sab toh ayega hi and default session honga na usme mujhe ek key chaiye joki user hogi 
  }
    /* 
    apka jo user interface tha voh toh hoga par usko apne loye redeclare kr rha hu 
    please dont mind  
    */
  interface User {
    _id?: string;
    isVerified?: boolean;
    isAcceptingMessages?: boolean;
    username?: string;
  }
}

//this belows shows that this enire custom model of next-auth we creatd 
// where it will be going 

declare module 'next-auth/jwt' {
interface JWT {
    _id?: string;
    isVerified?: boolean;
    isAcceptingMessages?: boolean;
    username?: string;
  }
}