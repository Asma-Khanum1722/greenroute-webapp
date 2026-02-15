import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Bus, ShieldCheck, User, Loader2 } from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { toast } from "sonner";

export default function Auth() {
  const [role, setRole] = useState<"admin" | "driver">("driver");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Verify role in Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid));
      
      if (!userDoc.exists()) {
        throw new Error("User profile not found in database.");
      }

      const userData = userDoc.data();
      
      if (userData.role !== role) {
        toast.error(`Unauthorized: This account is not a ${role}`);
        await auth.signOut();
        setLoading(false);
        return;
      }

      toast.success(`Welcome back, ${userData.name || 'User'}`);
      if (userData.role === "admin") navigate("/admin");
      else navigate("/driver");
      
    } catch (error: any) {
      console.error("Login Error:", error);
      toast.error(error.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="fixed inset-0 noise-overlay pointer-events-none z-0" />
      
      <Card className="w-full max-w-md glass-card relative z-10 border-primary/20">
        <CardHeader className="text-center">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Bus className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-display">GreenRoute Systems</CardTitle>
          <CardDescription>Select your portal and sign in</CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="flex gap-4 mb-6">
            <Button 
              variant={role === "driver" ? "default" : "outline"} 
              className="flex-1 gap-2"
              onClick={() => setRole("driver")}
            >
              <User className="w-4 h-4" /> Driver
            </Button>
            <Button 
              variant={role === "admin" ? "default" : "outline"} 
              className="flex-1 gap-2"
              onClick={() => setRole("admin")}
            >
              <ShieldCheck className="w-4 h-4" /> Admin
            </Button>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Input 
                type="email" 
                placeholder="Email Address" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="bg-foreground/5 border-foreground/10" 
              />
            </div>
            <div className="space-y-2">
              <Input 
                type="password" 
                placeholder="Password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="bg-foreground/5 border-foreground/10" 
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Authenticating...
                </>
              ) : (
                `Login as ${role === "admin" ? "Administrator" : "Bus Driver"}`
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
