import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useMutation } from "@apollo/client/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { REGISTER_MUTATION } from "@/graphql/queries";

export default function Register() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  interface AuthResult {
    register: {
      accessToken: string;
      refreshToken: string;
      user: { id: string; username: string; email: string; avatar?: string };
    };
  }

  const [register, { loading }] = useMutation<AuthResult>(REGISTER_MUTATION, {
    onCompleted: (data) => {
      localStorage.setItem("accessToken", data.register.accessToken);
      localStorage.setItem("refreshToken", data.register.refreshToken);
      localStorage.setItem("user", JSON.stringify(data.register.user));
      navigate("/");
    },
    onError: (err) => setError(err.message),
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!username || !email || !password) {
      setError("Username, email and password are required.");
      return;
    }

    await register({ variables: { input: { username, email, password } } });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4 p-8 border rounded-xl bg-card shadow-sm">
        <h1 className="text-2xl font-bold text-foreground">Register</h1>

        <div>
          <label htmlFor="username" className="text-sm mb-2 block text-muted-foreground">Username</label>
          <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Your username" required />
        </div>

        <div>
          <label htmlFor="email" className="text-sm mb-2 block text-muted-foreground">Email</label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
        </div>

        <div>
          <label htmlFor="password" className="text-sm mb-2 block text-muted-foreground">Password</label>
          <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
        </div>

        {error ? <p className="text-destructive text-sm">{error}</p> : null}

        <Button type="submit" className="w-full" disabled={loading}>
          <UserPlus className="mr-2 h-4 w-4" />
          {loading ? "Creating account..." : "Register"}
        </Button>

        <p className="text-sm text-muted-foreground">
          Already have an account? <Link to="/login" className="text-primary">Login</Link>
        </p>
      </form>
    </div>
  );
}
