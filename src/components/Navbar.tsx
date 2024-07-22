'use client' //imp

import React from 'react';
import Link from 'next/link';
/*ab yeh jo useSeesion hai  voh nextAuth se milega
yehi voh session hai jo humne backend me banaya tha using jwt
cuz mostly yeh seesion include hoga frontend me 
also we will import signOut from nextAuth yeh prebuilt hai shhyd */
import { useSession, signOut } from 'next-auth/react';
import { Button } from './ui/button';
import { User } from 'next-auth'; //this user is from nextAuth , not the one i created 

/* ab imp thing to note : jaha par bhi "use" keyword mile means yaha se data direct nhi loiya ja skta 
toh hook  ki madad se data lena padega  */

function Navbar() {
    //sbse pehle session se data nikalte hai 
    const { data: session } = useSession();
    //agar session me user hai toh use bhi leleo (humne hi user inject kiya tha session me remember)
    //note : data se hume user ki info ni nikal skte , user ki info bs user ya session ya token se hi milegi (DOCS PADHO NEXATAUH KI)
    const user : User = session?.user; //agara error aya incase in future toh assertion krdo "as User"

  return (
    <nav className="p-4 md:p-6 shadow-md bg-gray-900 text-white">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        <a href="#" className="text-xl font-bold mb-4 md:mb-0">
          True Feedback
        </a>
        {/* agar session hai toh yeh dikaho */}
        {session ? (
          <>
            <span className="mr-4">
              Welcome, {user?.username || user?.email}
            </span>
            <Button onClick={() => signOut()} className="w-full md:w-auto bg-slate-100 text-black" variant='outline'>
              Logout
            </Button>
          </>
        ) : (
          <Link href="/sign-in">
            <Button className="w-full md:w-auto bg-slate-100 text-black" variant={'outline'}>Login</Button>
          </Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;