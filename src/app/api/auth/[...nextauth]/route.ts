//next auth part 
import NextAuth from 'next-auth/next';
import { authOptions } from './options';

//authOptions ko import krne ke bad 
// handler methods banayege  jo nextAuth me milega ko as an input in argument AuthOptions lega
const handler = NextAuth(authOptions);

// ab isi handler ko as a GET and POST export kr dege 
export { 
    handler as GET, 
    handler as POST 
};