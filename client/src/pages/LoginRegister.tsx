import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Mail, Lock, User, Gavel, ArrowRight } from 'lucide-react';
import { loginSchema, registerSchema } from '../schemas';
import { ZodError } from 'zod';

const LoginRegister: React.FC = () => {
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const { login, register, googleLogin } = useAuth();
  const navigate = useNavigate();

  // Form State
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      setError('Google login failed: No credential returned');
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      await googleLogin(credentialResponse.credential);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Google login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      if (isLogin) {
        loginSchema.parse({ email, password });
        setLoading(true);
        await login(email, password);
      } else {
        registerSchema.parse({ fullName: name, email, password, confirmPassword });
        setLoading(true);
        await register(name, email, password);
      }
      navigate('/');
    } catch (err: any) {
      if (err instanceof ZodError) {
        setError(err.errors[0].message);
      } else {
        setError(err.message || 'Authentication failed');
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center -mt-8 px-4">
      <div className="w-full max-w-5xl glass-card p-0 overflow-hidden flex flex-col md:flex-row shadow-[0_0_50px_rgba(59,130,246,0.1)]">
        
        {/* Left Side - Illustration */}
        <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-primary/20 to-secondary/20 p-12 flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
          
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-6 shadow-lg shadow-primary/30">
              <Gavel className="text-white w-6 h-6" />
            </div>
            <h2 className="text-4xl font-bold text-white leading-tight mb-4">
              Welcome to the Future of Bidding
            </h2>
            <p className="text-text-secondary text-lg">
              Experience real-time auctions with ultra-low latency, secure payments, and a premium interface designed for professionals.
            </p>
          </div>

          <div className="relative z-10 bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping"></span>
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Live Auction Active</p>
                  <p className="text-xs text-text-secondary">2,451 users online</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-danger/20 text-danger text-xs font-bold rounded-full border border-danger/30">
                00:45 Left
              </span>
            </div>
            <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary to-secondary w-3/4 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-white mb-2">
                {isLogin ? 'Sign In to BidMaster' : 'Create an Account'}
              </h3>
              <p className="text-text-secondary text-sm">
                {isLogin ? 'Enter your details to access your account' : 'Join the most advanced auction platform'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <AnimatePresence mode="popLayout">
                {!isLogin && (
                  <motion.div
                    key="name-input"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <Input 
                      label="Full Name" 
                      placeholder="John Doe" 
                      icon={User}
                      value={name}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                      required={!isLogin}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <Input 
                type="email"
                label="Email Address" 
                placeholder="you@example.com" 
                icon={Mail}
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                required
              />
              
              <Input 
                type="password"
                label="Password" 
                placeholder="••••••••" 
                icon={Lock}
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                required
              />

              {!isLogin && (
                <motion.div
                  key="confirm-password-input"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <Input 
                    type="password"
                    label="Confirm Password" 
                    placeholder="••••••••" 
                    icon={Lock}
                    value={confirmPassword}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                    required={!isLogin}
                  />
                </motion.div>
              )}

              {isLogin && (
                <div className="flex items-center justify-between mt-2">
                  <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer hover:text-white transition-colors">
                    <input type="checkbox" className="rounded bg-white/5 border-white/20 text-primary focus:ring-primary/50" />
                    Remember me
                  </label>
                  <a href="#" className="text-sm text-primary hover:text-blue-400 transition-colors">
                    Forgot password?
                  </a>
                </div>
              )}

              {error && (
                <div className="p-3 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm text-center">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full mt-4" isLoading={loading}>
                {isLogin ? 'Sign In' : 'Create Account'}
                {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
              </Button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-background text-text-secondary">Or continue with</span>
                </div>
              </div>

              <div className="mt-6 flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setError('Google login failed')}
                  theme="filled_black"
                  shape="rectangular"
                  text={isLogin ? 'signin_with' : 'signup_with'}
                  width="300"
                />
              </div>
            </div>

            <div className="mt-8 text-center text-sm text-text-secondary">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button 
                onClick={() => setIsLogin(!isLogin)}
                className="text-primary hover:text-blue-400 font-medium transition-colors"
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </div>

            {/* Demo Notice */}
            <div className="mt-8 p-4 rounded-xl bg-warning/10 border border-warning/20 text-center">
              <p className="text-xs text-warning/90">
                <span className="font-bold">Demo Access:</span> Any email/password will work. Use <span className="font-mono">admin@bidmaster.com</span> to test Admin features.
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default LoginRegister;
