'use client';

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
import { ApiResponse } from '@/types/ApiResponse';
import { zodResolver } from '@hookform/resolvers/zod';
import axios, { AxiosError } from 'axios';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { verifySchema } from '@/schemas/verifySchema';

//refer the sign-up file rohan for more understanding

export default function VerifyAccount() {
    /*sabse pehle router chahiye 
    iske kya hoga kahi pe bhi kisi ko bhi redirect kr skta hu */
  const router = useRouter();
  //ab data params se lege using useParams , isme hum type bhi metion kr skte hai 
  const params = useParams<{ username: string }>(); // removed <{ username: string }>
  //toast for message popup
  const { toast } = useToast();
  //ab hume form bhi use krna hoga useForm
  //verify schema use krege is bar bina default value ke , cuz code hai kya hi hoga
  const form = useForm<z.infer<typeof verifySchema>>({
    resolver: zodResolver(verifySchema),
  });
  /*ab submit ho jayga toh tab kya krna hai  ? uske liye onsubmit baayaeg 
  pura async hoga  */
  const onSubmit = async (data: z.infer<typeof verifySchema>) => {
    //now we got the data
    //so we will feed the data int o the params of /apiverify-code route
    // what are we sending/feeding = username, data.code
    try {
      const response = await axios.post<ApiResponse>(`/api/verify-code`, {
        username: params.username,
        code: data.code,
      });

      //kaah ho gya toh toast msg dedo ki success
      toast({
        title: 'Success',
        description: response.data.message,
      });
      // aur fir redirect ho jayge sign-in route pe 
      router.replace('/sign-in');
    } catch (error) {
        //ab agar error aa gya toh , means we are not able to feed
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: 'Verification Failed',
        description:
          axiosError.response?.data.message ??
          'An error occurred. Please try again.',
        variant: 'destructive',
      });
    }
  };

  
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
            Verify Your Account
          </h1>
          <p className="mb-4">Enter the verification code sent to your email</p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              name="code"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Verification Code</FormLabel>
                  <Input placeholder="code" {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Verify</Button>
          </form>
        </Form>
      </div>
    </div>
  );
}