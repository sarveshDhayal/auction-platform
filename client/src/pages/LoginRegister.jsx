import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Mail, Lock, User, Gavel, ArrowRight, Github } from 'lucide-react';

const LoginRegister = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        if (!name) throw new Error('Name is required');
        await register(name, email, password);
      }
      // Redirect is handled by ProtectedRoute automatically if user state changes, 
      // or we can explicitly let AuthContext handle navigation.
      // Assuming AuthContext navigates or ProtectedRoute picks it up.
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center -mt-8">
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

          <div className="relative z-10 glass rounded-xl p-6 border-white/20">
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
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <Input 
                      label="Full Name" 
                      placeholder="John Doe" 
                      icon={User}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
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
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              
              <Input 
                type="password"
                label="Password" 
                placeholder="••••••••" 
                icon={Lock}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

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

            <div className="mt-6 flex items-center gap-4">
              <div className="h-px bg-white/10 flex-1"></div>
              <span className="text-xs text-text-secondary uppercase tracking-wider">Or continue with</span>
              <div className="h-px bg-white/10 flex-1"></div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <Button variant="outline" className="w-full gap-2">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                Google
              </Button>
              <Button variant="outline" className="w-full gap-2">
                <Github className="w-5 h-5" />
                GitHub
              </Button>
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
