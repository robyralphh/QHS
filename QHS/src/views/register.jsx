import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosClient from "../axiosClient";
import { useStateContext } from "../Context/ContextProvider";

export default function Register() {
    const nameRef = useRef();
    const emailRef = useRef();
    const passwordRef = useRef();
    const navigate = useNavigate();
    const { setUser, setToken } = useStateContext();
    const [errors, setErrors] = useState(null); // State to store validation errors

    const Submit = (ev) => {
        ev.preventDefault();
        setErrors(null); // Clear previous errors

        const payload = {
            name: nameRef.current.value,
            email: emailRef.current.value,
            password: passwordRef.current.value,
        };

        axiosClient
            .post("/register", payload)
            .then(({ data }) => {
                // Optionally set user and token in context if the server returns them
                setUser(data.user);
                setToken(data.token);

                // Redirect to login page after successful registration
                navigate("../");
            })
            .catch((err) => {
                const response = err.response;
                if (response && response.status === 422) {
                    // Set validation errors
                    setErrors(response.data.errors);
                } else {
                    console.error("Registration failed:", err);
                }
            });
    };

    return (
        <div className="login-signup-form animated fadeInDown">
            <div className="form">
                <h1 className="title">Create A New Account</h1>
                {/* Display validation errors */}
                {errors && (
                    <div className="alert alert-danger">
                        {Object.keys(errors).map((key) => (
                            <p key={key}>{errors[key][0]}</p>
                        ))}
                    </div>
                )}
                <form onSubmit={Submit}>
                    <input ref={nameRef} type="text" placeholder="Name" required />
                    <input ref={emailRef} type="email" placeholder="Email" required />
                    <input ref={passwordRef} type="password" placeholder="Password" required />
                    <button className="btn btn-block">Register</button>
                    <p className="message">
                        Already Have An Account? <Link to="../">Login</Link>
                    </p>
                </form>
            </div>
        </div>
    );
}