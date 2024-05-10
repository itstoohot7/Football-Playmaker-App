
import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";

const OtpScreen = () => {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const navigate = useNavigate();

    const handleChange = (index, value) => {
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
    };

    const handleSubmit = () => {
        const enteredOtp = otp.join('');
        // You can perform validation or submit the OTP here
        navigate('/login')
        console.log('Entered OTP:', enteredOtp);
    };

    return (
        <div className="flex flex-col w-full items-center justify-center min-h-screen  bg-[#1F1F1F]">
          <div className='w-[25%] flex flex-col items-center justify-center'>
          <h1 className="text-2xl text-white font-bold mb-4">Enter OTP</h1>
            <div className="flex justify-center mb-8">
                {otp.map((value, index) => (
                    <input
                        key={index}
                        type="text"
                        maxLength={1}
                        className="w-12 h-12 rounded-md border border-gray-300 mx-1 text-center focus:outline-none"
                        value={value}
                        onChange={(e) => handleChange(index, e.target.value)}
                    />
                ))}
            </div>
            <div class="relative flex w-full justify-center">
                <button
                    onClick={handleSubmit}
                    type="submit"
                    className="w-[100%]  py-3 px-4 3xl:py-5 3xl:text-xl inline-flex justify-center items-center gap-2 rounded-md border border-transparent leading-[21px] font-semibold bg-[#2B76BA] text-[#FFFFFF] hover:bg-[#2B76BA90] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all text-sm dark:focus:ring-offset-gray-800"
                >
                    Submit
                </button>
            </div>
          </div>
        </div>
    );
};

export default OtpScreen;