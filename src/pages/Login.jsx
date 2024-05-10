import React, { useEffect, useState } from "react";
// import logo from "../assets/logo.svg";
// import privacy from "../assets/Vector (19).png";
import {  useNavigate } from "react-router-dom";
import '../App.css'
const Login = () => {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        showPassword: false,
    });
    const navigate = useNavigate();
    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };
    const togglePasswordVisibility = () => {
        setFormData({
            ...formData,
            showPassword: !formData.showPassword,
        });
    }
    const handleLogin = (e) => {
        e.preventDefault();
        const hardcodedEmail = "admin@gmail.com";
        const hardcodedPassword = "password";
        if (
            formData.email === hardcodedEmail &&
            formData.password === hardcodedPassword
        ) {
            navigate("/dashboard");
        } else {
            alert("Incorrect email or password");
        }
    };
    //texttttt
    const [text, setText] = useState('');
    useEffect(() => {
        const originalText = '“Unlock Efficiency and Be More Productive”';
        let index = 0;
        const intervalId = setInterval(() => {
            setText(originalText.substring(0, index + 1));
            index++;
            if (index === originalText.length) {
                setTimeout(() => {
                    setText(''); // Clear the text after a short delay
                    index = 0; // Reset the index for the next loop
                }, 1000); // Adjust this delay based on your preference
            }
        }, 100); // Adjust the interval for the desired speed
        return () => clearInterval(intervalId);
    }, []); // Empty dependency array ensures the effect runs only once
    const textBefore = text.substring(0, text.indexOf('Be More Productive'));
    const textAfter = text.substring(text.indexOf('Be More Productive'));
    return (
        <div className="h-[100vh]">
            <body class="dark:bg-slate-900 font-poppins overflow-hidden  bg-[#1F1F1F] flex h-full items-center ">
                <div class="  bg-[#1F1F1F] h-[100vh] flex w-[100%] rounded-xl shadow-sm dark:bg-gray-800 dark:border-gray-700">
                    <div class="m-3  bg-[#2C2C2C] rounded-2xl  w-[100%] h-[96vh]  sm:p-7">
                        <div>
                            {/* <img alt="logo" className="ml-3 mt-3 " src={logo} /> */}
                        </div>
                        <div class="text-center ">
                            <h1 class="block text-2xl 3xl:text-6xl pt-10 text-white font-semibold leading-[41px] text-[42px] tracking-wide dark:text-white">
                                Welcome to Chlk
                            </h1>
                            <p class="mt-6 leading-[25px] 3xl:mt-5 3xl:text-4xl text-3xl text-gray-300 dark:text-gray-400">
                                Please enter your details
                            </p>
                        </div>
                        <div class="mt-16 w-[50%]  flex justify-center items-center mx-auto">
                            <form onSubmit={handleLogin} className="w-[60%]">
                                <div class="grid w-full gap-y-8">

                                    <div>
                                        <div class="relative ">
                                            <input
                                                placeholder="Email "
                                                type="email"
                                                id="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                className={`py-3 px-4 block 3xl:text-xl 3xl:py-5 placeholder:3xl:text-lg w-full border-gray-200 rounded-md text-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 ${!formData.email
                                                    ? "border-none"
                                                    : formData.email.includes("@gmail.com")
                                                        ? "border-gray-200 focus:border-gray-400 focus:ring-gray-400"
                                                        : "border-red-500 focus:border-red-500 focus:ring-red-500"
                                                    }`}
                                                required
                                                aria-describedby="email-error"
                                            />
                                        </div>
                                        <p
                                            class="hidden text-xs text-red-600 mt-2"
                                            id="email-error"
                                        >
                                            Please include a valid email address so we can get back to
                                            you
                                        </p>
                                    </div>

                                    <div>


                                        <input
                                            placeholder="Password"
                                            type="password"
                                            id="password"
                                            name="password"
                                            value={formData.phoneNumber}
                                            onChange={handleInputChange}
                                            className={`py-3 px-4 block 3xl:text-xl 3xl:py-5 placeholder:3xl:text-lg w-full border-gray-200 rounded-md text-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 ${!formData.email
                                                ? "border-none"
                                                : formData.email.includes("@gmail.com")
                                                    ? "border-gray-200 focus:border-gray-400 focus:ring-gray-400"
                                                    : "border-red-500 focus:border-red-500 focus:ring-red-500"
                                                }`}
                                            required
                                            aria-describedby="email-error"
                                        />



                                    </div>
                                    <div class="relative flex justify-center">
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                navigate('/bypass')
                                                // if (!formData.email || !formData.password) {
                                                //     alert("Please enter both email and password");
                                                //     return;
                                                // }
                                                // handleLogin(e);
                                            }}
                                            type="submit"
                                            className="w-[100%]  py-3 px-4 3xl:py-5 3xl:text-xl inline-flex justify-center items-center gap-2 rounded-md border border-transparent leading-[21px] font-semibold bg-[#2B76BA] text-[#FFFFFF] hover:bg-[#2B76BA90] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all text-sm dark:focus:ring-offset-gray-800"
                                        >
                                            Login
                                        </button>
                                    </div>
                                    <div class="relative flex justify-center">
                                        <p className="text-sm 3xl:text-lg leading-[20px] text-[12px]  flex justify-center text-gray-300">
                                            Don't have an account?
                                        </p>
                                        <span
                                        onClick={()=>{navigate('/register')}}
                                            className="ml-2 font-semibold leading-5  3xl:text-xl text-gray-500"
                                        >
                                            Register
                                        </span>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>

                </div>
            </body>
        </div>
    );
};
export default Login;