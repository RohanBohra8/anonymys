'use client';
/*useFrom zodResolver Link yeh sab lagega ... see nextjs from docs */
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useDebounceValue, useDebounceCallback } from 'usehooks-ts';
import Link from 'next/link';
import { useState, useEffect } from 'react';


import { Button } from '@/components/ui/button';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import axios, { AxiosError } from 'axios';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { signUpSchema } from '@/schemas/signUpSchema';
import { ApiResponse } from '@/types/ApiResponse';



/*ab sabse pehle toh hume kuch fields chahiye hogi
jese username , yeh ek tricky field hai 
kyunki isme hum thode thode interveal pe check krna chahege jese jese user type krega ,ki username uniquely available hai ya ni 
agar har ek keybaord button press pe krege toh boht saari request bhjni pad skti hai backend ko
so we need to control it  - this is what is called debouncing  */


const page = () => {
  //use state create for setting username
  const [username, setUsername] = useState('');
  /*iske bad username hai available ya ni uska ek mssg toh ayega humare pass
  jese hi hum req bhjeege backend pe toh kuch na kuch toh ayega  */
  const [usernameMessage, setUsernameMessage] = useState('');
  /*hume ek loader chahiye hoga ki jab ek request bhejege toh us state ko manage krne ke liye */
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  /*upar se niche dekha toh hume from ko submit bhi krna hoga toh use liye bhi ek state chahiye */
  const [isSubmitting, setIsSubmitting] = useState(false);

  //ab hume hook chahiye hoga kyunki abhi tak jo kam kioya voh toh theek hai
  //lekin username ko bhi bhjna padega kahi na kahi aur voh usenmane vapas bhi ayega
  //use liye useHook-ts liberary use krege
 
  /*useDebunce kya kehta hai ?  - aap jo bhi value hai voh rakh skte ho
  jha pe bhi rakhna hai voh sab kr skte ho
  lekin jese hi humne useDebounce hook use kra toh immidiently voh value se ni hogi , voh value jitna time mention kroge utne time ke baad set hogi
  */
  const debounced = useDebounceCallback(setUsername, 300); //username jese hi set hoga vese hi value nikal lo
  //toast use krne ke liye toat le liye
  const { toast } = useToast();
  //use router use krlia - user ko idhar udhar bhejne ke liye
  const router = useRouter();

  //zod implementation ... similar to jo phele kiya tha 
  /*form valriable ka name kuch bhi ho skta hai
   ab yeh useFrom ka kaam hi yeh hai ki iske andar hum resolver add kr skte hai
   "z" infer kr skta hai ki kis type ki values mere pas ayegi (completely optional hai)*/
  const form = useForm<z.infer<typeof signUpSchema>>({
    //added a resolver : using zodresolver which needs a schema as argument
    resolver: zodResolver(signUpSchema),
    //jab bhi ek form design krege toh ek aur step hota hai : form ki default state kya rahegi
    //thatswhy we used defaulValues
    defaultValues: {
      username: '',
      email: '',
      password: '',
    },
  });

  /*useEffect hook hum is liye likh rhe hai taki me chahta hu ki username me jab value uski change ho(user usme value enter kre) tab
  debouncing toh hum krege lekin debouncing ke bad ek request ko jani chahiye backend me
  jo mujhe yeh btaye ki username availble hai ya ni aur iska intezaam 
  humne kr rkha hai : check-username route humne banaya tha  jo get method ke search krta hai aur btata hai 
  ki humare pas username available hai ya ni */
  
  /*yeh use kab kab hoga jab page rload ho tab 
  aur jab jab username nhi balki debounced username ki value change ho */
  // use effect take callback and dependency array as arg
  useEffect(() => {
    // DB se baatchit krege tabhi async hai 
    //isme debounced user nane ki zarurtat ni hai , directly username se krlo
    const checkUsernameUnique = async () => {
      if (username) {
        //ab hum check kr rhe hai username toh checking state ko true krege 
        setIsCheckingUsername(true);//abhi chal rhi hai checking 
        setUsernameMessage(''); // Reset message
        try {
          //tODO handle apiResponse
          const response = await axios.get<ApiResponse>(
            `/api/check-username-unique?username=${username}`
          ); //checking the exact debounced username value in DB using get method 
          
          // ab humare pas response aa hi jata hai acche se ki username exist krta hai ya ni 
          // toh set krlo acche se
          setUsernameMessage(response.data.message); //setted

        } catch (error) {
          //error ayio toh axios me ese krte hai handle
          // case the error as axiosError and handle it 
          // data type bhi define krdia humne message ka <ApiResponse>
          const axiosError = error as AxiosError<ApiResponse>;
          // ab error aa hi gyio hai toh krdo ise bhi set 
          setUsernameMessage(
            axiosError.response?.data.message ?? 'Error checking username'
          );
        } finally {
          // finally humesha chalta hai 
          // end me checking user name state false krdo , kyunki khtm ho gya na ab saab
          setIsCheckingUsername(false);
        }
      }
    };
    // ab jab checkUsernameUnique method ban gya toh use run bhi kara dete hai 
    checkUsernameUnique();
  }, [username]);


  /* ab hum dekhte hai ki humara submit method kese kam krega 
   isme logo ko problem hoti hai : onsbumit define krna jo handle submit me jati hai */
   /* onSubmit async method me hume milta hai data 
   yeh data kaha se ata hai ? : handle submit se 
   ab is data ko vapas se infer krwa skte hai zod se (optional) */
   const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
    // submit kr rhe hai toh set krke bta do ki hum submit kr rhe hai  
    setIsSubmitting(true);
    try {

      const response = await axios.post<ApiResponse>('/api/sign-up', data);
      // ab humaer pas response hai toh toast use krlete hai 
      toast({
        title: 'Success',
        description: response.data.message,
      });

      //asb ho gya toh hum redirect ho jayge ispe
      router.replace(`/verify/${username}`);
      // AB END ME SUBMITTING FLASE KR DEGE
      setIsSubmitting(false);
    } catch (error) {
      console.error('Error during sign-up:', error);

      const axiosError = error as AxiosError<ApiResponse>;

      // Default error message
      let errorMessage = axiosError.response?.data.message;
      ('There was a problem with your sign-up. Please try again.');

      toast({
        title: 'Sign Up Failed',
        description: errorMessage,
        variant: 'destructive',
      });

      setIsSubmitting(false);
    }
  };
 

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-800">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
            Join True Feedback
          </h1>
          <p className="mb-4">Sign up to start your anonymous adventure</p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              name="username"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <Input
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      debounced(e.target.value);
                    }}
                  />
                  {isCheckingUsername && <Loader2 className="animate-spin" />}
                  {!isCheckingUsername && usernameMessage && (
                    <p
                      className={`text-sm ${
                        usernameMessage === 'Username is unique'
                          ? 'text-green-500'
                          : 'text-red-500'
                      }`}
                    >
                      {usernameMessage}
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="email"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <Input {...field} name="email" />
                  <p className='text-muted text-gray-400 text-sm'>We will send you a verification code</p>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="password"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <Input type="password" {...field} name="password" />
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className='w-full' disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Please wait
                </>
              ) : (
                'Sign Up'
              )}
            </Button>
          </form>
        </Form> 
        <div className="text-center mt-4">
          <p>
            Already a member?{' '}
            <Link href="/sign-in" className="text-blue-600 hover:text-blue-800">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default page;





/*
/ this entire part was removed in step 9 to add whats there above 
import { useSession, signIn, signOut } from "next-auth/react"

export default function Component() {
  const { data: session } = useSession()
  if (session) {
    return (
      <>
        Signed in as {session.user.email} <br />
        <button onClick={() => signOut()}>Sign out</button>
      </>
    )
  }
  return (
    <>
      Not signed in <br />
      <button className="bg-orange-500 p-x-4 py-1 m-4 rounded" onClick={() => signIn()}>Sign in</button>
    </>
  )
}

*/