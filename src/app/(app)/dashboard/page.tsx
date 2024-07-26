'use client';

import { MessageCard } from '@/components/MessageCard';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { Message } from '@/model/User';
import { ApiResponse } from '@/types/ApiResponse';
import { zodResolver } from '@hookform/resolvers/zod';
import axios, { AxiosError } from 'axios';
import { Loader2, RefreshCcw } from 'lucide-react';
import { User } from 'next-auth';
import { useSession } from 'next-auth/react';
import React, { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { acceptMessageSchema } from '@/schemas/acceptMessageSchema';

function UserDashboard() {
  //messages set krne ke liye use state joki initialy emoty array hoga
  const [messages, setMessages] = useState<Message[]>([]);
  //state manage krni hai toh loading bhi ayegi 
  //abh yeh oading state toh lab hai jab me messages fetch kr rha hu
  const [isLoading, setIsLoading] = useState(false);
  // yeh dusre case ke liye loading state 
  const [isSwitchLoading, setIsSwitchLoading] = useState(false);

  //toast bhi needed hai for msg display
  const { toast } = useToast();

  //for optimistic ui : ab yeh method jab bhi run krega toh isko message id chahiye 
  /* ab jab hi yeh func call hoga toh setmessages jisse array
  me changes hoge uska use krege and vapas se array me message dalege 
  but filtering krwake*/
  const handleDeleteMessage = (messageId: string) => {
    //adding messages using setmessages bia filtering
    setMessages(messages.filter((message) => message._id !== messageId));
  };

  // ab hume session chahiye cuz userdashboard hai usse related chize hi hogi
  const { data: session } = useSession();

  //ab humare pass zada kam ni hai but ek form hai jisme handle krna hai 
  const form = useForm({
    resolver: zodResolver(acceptMessageSchema),
  });

  /*ab humare pas jo form aya hai voh kafi powerful hai toh usse aur chize extract kr skte hai
  ab jab bhi form se chize extarct krte hai toh iske liye humne 
  register ko bhi extract krna padta hai jo form ko submit krwane me help krega */
  const { register, watch, setValue } = form; //study docs
  //ab hume wathc ko na inject krna padta hai ki kis chiz me watch krne wala hu
  //watch is a method 
  const acceptMessages = watch('acceptMessages');


  /*acceptmessages status ko fetch krne ke loyue callback func */
  const fetchAcceptMessages = useCallback(async () => {
    //sabse pehle loading truee kr dete hai switch ki 
    setIsSwitchLoading(true);
    try {
      /*get karo aur request kro axios ko 
      ki apkoek api bhji hai */
      const response = await axios.get<ApiResponse>('/api/accept-messages');
      //using setValue we update the immidiate value of setMessages 
      setValue('acceptMessages', response.data.isAcceptingMessage); //TODODODODODOD

    } catch (error) {
      //ab error catch krke krlo kaam 
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: 'Error',
        description:
          axiosError.response?.data.message ??
          'Failed to fetch message settings',
        variant: 'destructive',
      });
    } finally {
      //ab jab sara kaam ho jay toh is switch loading ko wapas false krdena 
      setIsSwitchLoading(false);
    }
  }, [setValue, toast]); // isko bhi dependency array chahiye hoti hai 
  //thats why we used setValue , taki value me jo bhi changes hoe toh vapas yeh fuc run krke optimize kr dega 

  //ab sare ke sare messages ko fetch krege 
  //yeh boolean value bydefault false lii hai taki aagar fetch ni ho paya
  const fetchMessages = useCallback(
    async (refresh: boolean = false) => {
      //jb tak fetch hoge tab tk loading hogi
      setIsLoading(true);
      setIsSwitchLoading(false);
      try {
        const response = await axios.get<ApiResponse>('/api/get-messages');
        setMessages(response.data.messages as Message[]);//added as scersion here //new messages jo fetch kiye hai voh set esages se set krege aga raaye toh theek nhi toh empty array[]
        //by default refresh false hai but agar true hui toh taost msg bhdo error ka
        if (refresh) {
          toast({
            title: 'Refreshed Messages',
            description: 'Showing latest messages',
          });
        }
      } catch (error) {
        const axiosError = error as AxiosError<ApiResponse>;
        toast({
          title: 'Error',
          description:
            axiosError.response?.data.message ?? 'Failed to fetch messages',
          variant: 'destructive',
        });
      } finally {
        //ab finally sab kam ho gya toh loading flase kr dege 
        setIsLoading(false);
        setIsSwitchLoading(false);
      }
    },
    [setIsLoading, setMessages, toast] // ab in 3 cases pe yeh func run hoga
  );

  // Fetch initial state from the server
  useEffect(() => {
    //if there is no session or no user in session then return
    if (!session || !session.user) return;

    fetchMessages();

    fetchAcceptMessages();
  }, [session, setValue, toast, fetchAcceptMessages, fetchMessages]);

  // Handle switch change
  /* ab humne user ki state toh le li thi but use change ni kiya tha , is liye hai yeh */
  const handleSwitchChange = async () => {
    try {
      //axios se request bhjo
      //fetch kro
      //value set kro
      // fir toast krawdo
      const response = await axios.post<ApiResponse>('/api/accept-messages', {
        acceptMessages: !acceptMessages,
      }); //  acceptMessages: !acceptMessages => this means true hai toh flasr krdo and vice versa
      setValue('acceptMessages', !acceptMessages);
      toast({
        title: response.data.message,
        variant: 'default',
      });
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: 'Error',
        description:
          axiosError.response?.data.message ??
          'Failed to update message settings',
        variant: 'destructive',
      });
    }
  };

  // ek choti si chiz hume yha e dekhni hai 
  /*condition check krke double return krna hai  
  agar session nhi hai ya session ke andar user nhi hai 
  toh hu yha oe user ko aage proceed hi ni krna chahte toh yhi oe hi return 
  kredete hai */
  if (!session || !session.user) {
    return <div>Please login</div>; // simple div bhj do
  }

  const { username } = session.user as User;

  // to find where is the user
  //base url ko construct krege
  //TODO : googel and learn more about this (base url ko nikalna)
  const baseUrl = `${window.location.protocol}//${window.location.host}`; //since its a client component , i=window obj can be accessed
  // now profile url bana rhe hai hum using baseurl that we found
  const profileUrl = `${baseUrl}/u/${username}`;

  /*copy tp clipbaord is easy 
  using navigator access clipbaord and use write text method
  and write profile url
  then send toast msg*/
  const copyToClipboard = () => {
    navigator.clipboard.writeText(profileUrl);
    toast({
      title: 'URL Copied!',
      description: 'Profile URL has been copied to clipboard.',
    });
  };

  return (
    <div className="my-8 mx-4 md:mx-8 lg:mx-auto p-6 bg-white rounded w-full max-w-6xl">
      <h1 className="text-4xl font-bold mb-4">User Dashboard</h1>

      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Copy Your Unique Link</h2>{' '}
        <div className="flex items-center">
          <input
            type="text"
            value={profileUrl}
            disabled
            className="input input-bordered w-full p-2 mr-2"
          />
          <Button onClick={copyToClipboard}>Copy</Button>
        </div>
      </div>

      <div className="mb-4">
        <Switch
          {...register('acceptMessages')}
          checked={acceptMessages}
          onCheckedChange={handleSwitchChange}
          disabled={isSwitchLoading}
        />
        <span className="ml-2">
          Accept Messages: {acceptMessages ? 'On' : 'Off'}
        </span>
      </div>
      <Separator />

      <Button
        className="mt-4"
        variant="outline"
        onClick={(e) => {
          e.preventDefault();
          fetchMessages(true);
        }}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <RefreshCcw className="h-4 w-4" />
        )}
      </Button>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        {messages.length > 0 ? (
          // removed index from prop
          messages.map((message) => (
            <MessageCard
              key={message._id as string} //did assertion here
              message={message as Message & {_id: string}} //did assertion here message -> mesage.id
              onMessageDelete={handleDeleteMessage}
            />
          ))
        ) : (
          <p>No messages to display.</p>
        )}
      </div>
    </div>
  );
}

export default UserDashboard;