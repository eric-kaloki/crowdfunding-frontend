import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '@/contexts/AuthContext'; // Import useAuth to access setUser
import { URL } from '../utils/shared';
import Header from '@/components/Header';
import axiosInstance from '@/utils/axiosConfig';

const OTPVerificationPage = () => {
  const { login } = useAuth(); // Add login function
  const location = useLocation();
  const navigate = useNavigate();
  const { email, fromLogin } = location.state || {}; // Get email and fromLogin flag
  const [otp, setOtp] = useState(['', '', '', '', '', '']); // Array to hold OTP digits

  const handleChange = (e, index) => {
    const newOtp = [...otp];
    newOtp[index] = e.target.value;
    setOtp(newOtp);

    // Move to the next input if current input is filled
    if (e.target.value && index < otp.length - 1) {
      document.getElementById(`otp-input-${index + 1}`).focus();
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    const otpString = otp.join(''); // Convert array to string
    
    try {
      const response = await axiosInstance.post('/auth/verify-otp', {
        email,
        otp: otpString
      });
      
      const data = response.data;
      
      if (data.success) {
        // Check if this verification came from login flow
        if (fromLogin && data.token && data.user) {
          // Auto-login the user
          localStorage.setItem('token', data.token);
          login(data.token, data.user);
          
          toast.success('Account verified and logged in successfully!');
          
          // Navigate based on user role
          if (data.user.role === 'admin') {
            navigate('/admin-dashboard');
          } else if (data.user.role === 'organization') {
            navigate('/organization-dashboard');
          } else {
            navigate('/client-dashboard');
          }
        } else {
          // Regular verification from signup
          toast.success('Email verified successfully! You can now login.');
          navigate('/login');
        }
      } else {
        toast.error(data.message || 'Invalid or expired OTP');
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      toast.error('An error occurred during verification');
    }
  };
  const handleResendOTP = async () => {
    try {
      const response = await fetch(`${URL}api/auth/resend-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }), // Assuming you have the email in your state
      });
      
      const data = await response.json();
      
      if (data.success) {
        console.log('OTP has been sent to your email!');
        toast.success('OTP has been sent to your email!');
      } else {
        toast.error(data.message || 'Failed to resend OTP');
      }
    } catch (error) {
      toast.error('An error occurred while resending OTP');
    }
  };
  

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <div className="flex items-center justify-center flex-1">
      <div className="relative bg-white px-6 pt-10 pb-9 shadow-xl mx-auto w-full max-w-lg rounded-2xl">
        <div className="mx-auto flex w-full max-w-md flex-col space-y-16">
          <div className="flex flex-col items-center justify-center text-center space-y-2">
            <div className="font-semibold text-3xl">
              <p>{fromLogin ? 'Account Verification' : 'Email Verification'}</p>
            </div>
            <div className="flex flex-row text-sm font-medium text-gray-400">
              <p>
                {fromLogin 
                  ? `Please verify your account to complete login. Code sent to ${email}`
                  : `We have sent a verification code to ${email}`
                }
              </p>
            </div>
          </div>

          <div>
            <form onSubmit={handleVerifyOTP}>
              <div className="flex flex-col space-y-16">
                <div className="flex flex-row items-center justify-between mx-auto w-full max-w-xs space-x-2">
                  {otp.map((digit, index) => (
                    <div className="w-16 h-16" key={index}>
                      <input
                        id={`otp-input-${index}`}
                        className="w-full h-full flex flex-col items-center justify-center text-center p-1 outline-none rounded-xl border border-gray-200 text-lg bg-white focus:bg-gray-50 focus:ring-1 ring-blue-700"
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleChange(e, index)}
                        inputMode="text"
                      />
                    </div>
                  ))}
                </div>

                <div className="flex flex-col space-y-5">
                  <div>
                    <button 
                      className="flex flex-row items-center justify-center text-center w-full border rounded-xl outline-none py-5 bg-black text-white text-sm shadow-sm transition duration-300 ease-in-out hover:bg-gray-800 active:scale-95"
                    >
                      Verify OTP
                    </button>
                  </div>

                  <div className="flex flex-row items-center justify-center text-center text-sm font-medium space-x-1 text-gray-500">
                    <p>Didn't receive code?</p><a onClick={handleResendOTP} className="flex flex-row items-center text-blue-600 cursor-pointer">Resend</a>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default OTPVerificationPage;
