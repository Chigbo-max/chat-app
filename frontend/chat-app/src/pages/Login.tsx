import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useMutation } from "@apollo/client/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LogIn, Eye, EyeOff, AlertCircle } from "lucide-react";
import { LOGIN_MUTATION } from "@/graphql/queries";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  interface AuthResult {
    login: {
      accessToken: string;
      refreshToken: string;
      user: { id: string; username: string; email: string; avatar?: string };
    };
  }

  const [login, { loading }] = useMutation<AuthResult>(LOGIN_MUTATION, {
    onCompleted: (data) => {
      localStorage.setItem("accessToken", data.login.accessToken);
      localStorage.setItem("refreshToken", data.login.refreshToken);
      localStorage.setItem("user", JSON.stringify(data.login.user));
      navigate("/");
    },
    onError: (err) => setError(err.message),
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    await login({ variables: { input: { email, password } } });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-4 transition-colors duration-300">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-6 p-8 rounded-2xl bg-card shadow-lg border border-border"
      >
        <h1 className="text-3xl font-bold text-foreground text-center">Login</h1>

        {/* Improved Error Message Display */}
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/5 text-destructive text-sm border border-destructive/100 animate-in fade-in zoom-in duration-200">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* Email */}
        <div className="flex flex-col">
          <label htmlFor="email" className="text-sm mb-2 text-muted-foreground">
            Email
          </label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            className="bg-input text-foreground border-border focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Password with Visibility Toggle */}
        <div className="flex flex-col">
          <label htmlFor="password" className="text-sm mb-2 text-muted-foreground">
            Password
          </label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="bg-input text-foreground border-border focus:border-primary focus:ring-1 focus:ring-primary pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-slate-900 focus:text-slate-900 transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-2 focus:ring-primary/50 transition"
          disabled={loading}
        >
          <LogIn className="h-5 w-5" />
          {loading ? "Logging in..." : "Login"}
        </Button>

        {/* Register link */}
        <p className="text-center text-sm text-muted-foreground">
          Don’t have an account?{" "}
          <Link to="/register" className="text-primary hover:underline">
            Register
          </Link>
        </p>
      </form>
    </div>
  );
}