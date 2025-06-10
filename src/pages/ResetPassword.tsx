// src/pages/ResetPassword.tsx

import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axiosInstance from '../utils/axiosConfig'; // Adjust import as necessary
import { Button } from "@/components/ui/button";
import Header from '@/components/Header'; 

const ResetPassword = () => {
    const [newPassword, setNewPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const handleResetPassword = async (e) => {
        e.preventDefault();
        const token = new URLSearchParams(location.search).get('token');
        console.log('Token from URL:', token);
        console.log('New Password:', newPassword); // Log the new password

        try {
            setIsLoading(true);

            // Create the payload
            const payload = { token, newPassword };
            console.log('Payload being sent:', payload); // Log the payload

            // Send the request to the backend
            await axiosInstance.post('/auth/reset-password', payload);
            toast.success('Password has been reset successfully!');
            navigate('/login');
        } catch (error) {
            console.error('Error resetting password:', error.response?.data); // Log the error response
            toast.error('Failed to reset password.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-background">
            <Header />
            <div className="flex items-center justify-center flex-1">
                <form onSubmit={handleResetPassword} className="bg-white p-6 rounded shadow-md">
                    <h2 className="text-lg font-bold mb-4">Reset Password</h2>
                    <input
                        type="password"
                        placeholder="Enter new password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        className="border border-gray-300 p-2 rounded w-full mb-4"
                    />
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? "Resetting in..." : "Reset Password"}
                    </Button>
                </form>
            </div></div>

    );
};

export default ResetPassword;