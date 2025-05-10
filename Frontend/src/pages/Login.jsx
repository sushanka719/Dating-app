import React, { useState, useEffect } from "react";
import styles from "../styles/Login.module.css";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../store/reducers/authSlice";
import { useDispatch, useSelector } from "react-redux";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  console.log(isAuthenticated)

  // Redirect to dating app after successful login
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dating-app"); // Redirect if user is logged in
    }
  }, [isAuthenticated, navigate]); // Runs when isAuthenticated changes

  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent form reload
    dispatch(login(formData)); // Dispatch login action
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginBox}>
        <h2 className={styles.title}>Welcome Back!</h2>
        <p className={styles.subtitle}>Log in to continue</p>

        <form className={styles.loginForm} onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            className={styles.input}
            value={formData.email}
            onChange={(e) =>
              setFormData((prevState) => ({ ...prevState, email: e.target.value }))
            }
          />
          <input
            type="password"
            placeholder="Password"
            className={styles.input}
            value={formData.password}
            onChange={(e) =>
              setFormData((prevState) => ({ ...prevState, password: e.target.value }))
            }
          />
          <button type="submit" className={styles.loginButton}>Log In</button>
        </form>

        <p className={styles.forgotPassword}>
          <a href="/forgot-password" className={styles.link}>Forgot password?</a>
        </p>

        <p className={styles.signupText}>
          Don't have an account? <Link to="/signup" className={styles.signupLink}>Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
