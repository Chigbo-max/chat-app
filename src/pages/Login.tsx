import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useMutation } from "@apollo/client/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";
import { LOGIN_MUTATION } from "@/graphql/queries";


export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

        {/* Password */}
        <div className="flex flex-col">
          <label htmlFor="password" className="text-sm mb-2 text-muted-foreground">
            Password
          </label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            className="bg-input text-foreground border-border focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Error message */}
        {error && <p className="text-destructive text-sm text-center">{error}</p>}

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