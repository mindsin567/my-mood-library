import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
const emailSchema = z.string().email('Please enter a valid email address');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');
const Auth = () => {
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const { signIn, signUp, user } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();
    useEffect(() => {
        if (user) {
            navigate('/');
        }
    }, [user, navigate]);
    const validateForm = () => {
        const newErrors = {};
        const emailResult = emailSchema.safeParse(email);
        if (!emailResult.success) {
            newErrors.email = emailResult.error.errors[0].message;
        }
        const passwordResult = passwordSchema.safeParse(password);
        if (!passwordResult.success) {
            newErrors.password = passwordResult.error.errors[0].message;
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm())
            return;
        setIsLoading(true);
        try {
            if (isSignUp) {
                const { error } = await signUp(email, password, displayName);
                if (error) {
                    if (error.message.includes('already registered')) {
                        toast({
                            title: 'Account exists',
                            description: 'This email is already registered. Please sign in instead.',
                            variant: 'destructive'
                        });
                    }
                    else {
                        toast({
                            title: 'Sign up failed',
                            description: error.message,
                            variant: 'destructive'
                        });
                    }
                }
                else {
                    toast({
                        title: 'Welcome to MindIn!',
                        description: 'Your account has been created successfully.'
                    });
                }
            }
            else {
                const { error } = await signIn(email, password);
                if (error) {
                    toast({
                        title: 'Sign in failed',
                        description: 'Invalid email or password. Please try again.',
                        variant: 'destructive'
                    });
                }
            }
        }
        catch {
            toast({
                title: 'Error',
                description: 'Something went wrong. Please try again.',
                variant: 'destructive'
            });
        }
        finally {
            setIsLoading(false);
        }
    };
    return (<div className="min-h-screen hero-gradient flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center overflow-hidden">
            <img src="/favicon.png" alt="Mindi" className="w-10 h-10 object-contain"/>
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground">Mindi</h1>
            <p className="text-sm text-muted-foreground">Your wellness companion</p>
          </div>
        </div>

        {/* Auth Card */}
        <div className="card-feature">
          <h2 className="text-2xl font-semibold text-foreground mb-2 text-center">
            {isSignUp ? 'Create your account' : 'Welcome back'}
          </h2>
          <p className="text-muted-foreground text-center mb-6">
            {isSignUp ? 'Start your mental wellness journey' : 'Continue your wellness journey'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (<div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"/>
                  <Input id="displayName" type="text" placeholder="Your name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="pl-10"/>
                </div>
              </div>)}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"/>
                <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" required/>
              </div>
              {errors.email && (<p className="text-sm text-destructive">{errors.email}</p>)}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"/>
                <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10" required/>
              </div>
              {errors.password && (<p className="text-sm text-destructive">{errors.password}</p>)}
            </div>

            <Button type="submit" variant="hero" size="lg" className="w-full" disabled={isLoading}>
              {isLoading ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button type="button" onClick={() => {
            setIsSignUp(!isSignUp);
            setErrors({});
        }} className="text-sm text-primary hover:underline">
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>
        </div>
      </div>
    </div>);
};
export default Auth;
