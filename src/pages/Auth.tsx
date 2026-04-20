import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Bus, ShieldCheck, User, Loader2, Users } from "lucide-react";
import { auth, db, googleProvider } from "@/lib/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function Auth() {
  const [role, setRole] = useState<"admin" | "driver" | "passenger">("driver");
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleGoogleAuth = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Check if user exists in Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid));
      
      if (!userDoc.exists()) {
        // New user - automatically set as passenger
        await setDoc(doc(db, "users", user.uid), {
          email: user.email,
          role: "passenger",
          name: user.displayName || "Passenger",
          createdAt: new Date().toISOString()
        });
        toast.success("Welcome to GreenRoute!");
      }

      // Route based on role
      const finalDoc = await getDoc(doc(db, "users", user.uid));
      const role = finalDoc.data()?.role;
      
      if (role === "admin") navigate("/admin");
      else if (role === "driver") navigate("/driver");
      else navigate("/passenger");
      
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        // Sign Up Logic (Passengers only)
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, "users", cred.user.uid), {
          email,
          role: "passenger",
          name: name || "Passenger",
          createdAt: new Date().toISOString()
        });
        toast.success("Account created successfully!");
        navigate("/passenger");
      } else {
        // Login Logic
        const cred = await signInWithEmailAndPassword(auth, email, password);
        const userDoc = await getDoc(doc(db, "users", cred.user.uid));
        
        if (!userDoc.exists()) throw new Error("User profile not found in database.");
        
        const userData = userDoc.data();
        if (userData.role === "admin") navigate("/admin");
        else if (userData.role === "driver") navigate("/driver");
        else navigate("/passenger");
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-6 bg-[url('/grid.svg')] bg-center">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="glass-card p-8 relative overflow-hidden backdrop-blur-xl border-white/5 shadow-2xl">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 rounded-full blur-3xl" />
          
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20">
              <Bus className="w-8 h-8 text-primary" />
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-display font-bold text-white mb-2">GreenRoute Systems</h1>
            <p className="text-muted-foreground">Select your portal and sign in</p>
          </div>

          {!isSignUp && (
            <div className="flex gap-2 p-1 bg-white/5 rounded-xl mb-8 border border-white/10">
              <button 
                onClick={() => setRole("driver")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg transition-all ${role === "driver" ? "bg-primary text-black font-semibold shadow-lg shadow-primary/20" : "text-white/60 hover:text-white hover:bg-white/5"}`}
              >
                <div className="p-1 px-2 rounded-md"><Users size={16} /></div>
                <span>Driver</span>
              </button>
              <button 
                onClick={() => setRole("admin")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg transition-all ${role === "admin" ? "bg-primary text-black font-semibold shadow-lg shadow-primary/20" : "text-white/60 hover:text-white hover:bg-white/5"}`}
              >
                <div className="p-1 px-2 rounded-md"><ShieldCheck size={16} /></div>
                <span>Admin</span>
              </button>
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-4">
            {isSignUp && (
              <div className="space-y-2">
                <Input 
                  placeholder="Full Name" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-white/5 border-white/10 h-12 text-white focus:ring-primary/20 placeholder:text-white/30"
                  required
                />
              </div>
            )}
            <div className="space-y-2">
              <Input 
                type="email" 
                placeholder="Email Address" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/5 border-white/10 h-12 text-white focus:ring-primary/20 placeholder:text-white/30"
                required
              />
            </div>
            <div className="space-y-2">
              <Input 
                type="password" 
                placeholder="Password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-white/5 border-white/10 h-12 text-white focus:ring-primary/20 placeholder:text-white/30"
                required
              />
            </div>
            <Button 
              type="submit" 
              className="w-full h-12 text-lg font-bold bg-primary hover:bg-primary/90 text-black transition-all shadow-lg shadow-primary/10 mt-2"
              disabled={loading}
            >
              {loading ? "Processing..." : (isSignUp ? "Create Passenger Account" : `Login as ${role.charAt(0).toUpperCase() + role.slice(1)}`)}
            </Button>
          </form>

          {!isSignUp && role === "passenger" && (
            <>
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-white/10"></span>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-[#121212] px-2 text-white/40">Or continue with</span>
                </div>
              </div>

              <Button 
                onClick={handleGoogleAuth}
                variant="outline"
                className="w-full h-12 border-white/10 hover:bg-white/5 text-white gap-3 transition-all"
                disabled={loading}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </Button>
            </>
          )}

          {isSignUp && (
             <Button 
                onClick={handleGoogleAuth}
                variant="outline"
                className="w-full mt-6 h-12 border-white/10 hover:bg-white/5 text-white gap-3 transition-all"
                disabled={loading}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Sign up with Google
              </Button>
          )}

          <div className="mt-8 text-center">
            <button 
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-primary/80 hover:text-primary transition-colors hover:underline"
            >
              {isSignUp ? "Already have an account? Sign in" : "Need an account? Sign up as Passenger"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
