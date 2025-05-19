
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  email: z.string().email({
    message: 'Please enter a valid email address.',
  }),
  password: z.string().min(6, {
    message: 'Password must be at least 6 characters.',
  }),
});

const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });
  
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    console.log(values);
    
    // Mock authentication - this would be replaced with actual auth
    if (values.email === 'admin@insa.com' && values.password === 'password') {
      toast({
        title: 'Login Successful',
        description: 'Welcome back, Admin!',
      });
      navigate('/admin');
    } else if (values.email === 'driver@insa.com' && values.password === 'password') {
      toast({
        title: 'Login Successful',
        description: 'Welcome back, Driver!',
      });
      navigate('/driver');
    } else if (values.email === 'employee@insa.com' && values.password === 'password') {
      toast({
        title: 'Login Successful',
        description: 'Welcome back!',
      });
      navigate('/dashboard');
    } else {
      toast({
        title: 'Login Failed',
        description: 'Invalid email or password.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Login</CardTitle>
        <CardDescription>
          Enter your credentials to access INSA-Wheels Tracker
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="your.email@insa.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              Login
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col items-center">
        <div className="text-sm text-muted-foreground">
          <span>Test accounts:</span>
          <ul className="mt-1 list-disc pl-5">
            <li>admin@insa.com / password</li>
            <li>driver@insa.com / password</li>
            <li>employee@insa.com / password</li>
          </ul>
        </div>
      </CardFooter>
    </Card>
  );
};

export default LoginForm;
