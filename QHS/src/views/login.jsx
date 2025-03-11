import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosClient from "../axiosClient";
import { useStateContext } from "../Context/ContextProvider";

export default function Login() {
    const emailRef = useRef();
    const passwordRef = useRef();
    const { setUser, setToken } = useStateContext();

    const [error, setError] = useState(null); // State to manage error messages

    const Submit = (ev) => {
        ev.preventDefault();
        const payload = {
            email: emailRef.current.value,
            password: passwordRef.current.value,
        };

        axiosClient
            .post("/login", payload)
            .then(({ data }) => {
                // Set user and token in context
                setUser(data.user);
                setToken(data.token);
            })
            .catch((err) => {
                const response = err.response;
                if (response && response.status === 422) {
                    // Handle validation errors
                    setError("Invalid email or password. Please try again.");
                } else {
                    // Handle other errors
                    setError("Invalid email or password. Please try again.");
                    console.error("Login failed:", err);
                }
            });
    };

    return (
        <div className="login-signup-form animated fadeInDown">
            <div className="form">
                <h1 className="title">Login To Your Account</h1>
                {error && <div className="alert alert-danger">{error}</div>} {/* Display error message */}
                <form onSubmit={Submit}>
                    <input ref={emailRef} type="email" placeholder="Email" />
                    <input ref={passwordRef} type="password" placeholder="Password" />
                    <button className="btn btn-block">Login</button>
                    <p className="message">
                        Not Registered? <Link to="register">Create a new account</Link>
                    </p>
                </form>
            </div>
        </div>
    );
}