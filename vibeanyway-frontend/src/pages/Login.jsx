import { useState } from "react";
import { auth, googleProvider } from "../firebase";
import {
  signInWithEmailAndPassword,
  signInWithPopup
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "./Login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleRedirect = (user) => {
    const isAdmin = user.email === "admin@gmail.com";
    sessionStorage.setItem("admin", isAdmin.toString());
    navigate(isAdmin ? "/admin" : "/search");
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      handleRedirect(result.user);
    } catch (err) {
      alert("❌ " + err.message);
    }
  };

  const handleGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      handleRedirect(result.user);
    } catch (err) {
      alert("❌ " + err.message);
    }
  };

  return (
    <div className="login-page">
      <div className="login-box">
        <h2>Login</h2>
        <form onSubmit={handleEmailLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="login-btn">Login with Email</button>
        </form>

        <button onClick={handleGoogle} className="google-btn">Sign in with Google</button>

        <p className="signup-link">
          Don’t have an account?{" "}
        <strong> <span className="link" onClick={() => navigate("/signup")}>Register</span></strong> 
        </p>
      </div>
    </div>
  );
}
