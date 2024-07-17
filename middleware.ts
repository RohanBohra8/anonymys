// yeh file exaclty nextjs ki documentation me mil jati hai in middleawre section 
// middle ware ki file actualy me hoti kha hai  ? kaha rakhi jati hai yheh file  
// jaha pe bhi humara main src folder hai uske root folder me rakhi jati hai 

// middleware - jane se pehle milke jana (api handle hone se pehle intermediatory mil ke jana)


import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
export { default } from 'next-auth/middleware'; // this is imp , as mentioned in nextjs docs 

//config file = kaha kaha pe middleware run ho
export const config = {
  matcher: ['/dashboard/:path*', '/sign-in', '/sign-up', '/', '/verify/:path*'],
};

// actually me jo sara kaam krta hai voh yehi method krta hai 
// muje bas 2 chize chaiye token and url 
// konse url pe ho uske basis pe hi toh kahi na kahi tumhe redirect krunga 

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const url = request.nextUrl;

  /*
  ab hume redirection ki stratergy chchiye 
  means agar token hai toh kha kha ja skte hai 
  agar token nhi hai toh kha kha ja skte ho
  */
  // Redirect to dashboard if the user is already authenticated
  // and trying to access sign-in, sign-up, or home page
  if (
    token &&
    (url.pathname.startsWith('/sign-in') ||
      url.pathname.startsWith('/sign-up') ||
      url.pathname.startsWith('/verify') ||
      url.pathname === '/')
  ) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (!token && url.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  return NextResponse.next();
}