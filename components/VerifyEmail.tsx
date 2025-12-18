import React, { useEffect, useState } from 'react';
import { ApiService } from '../services/api';

export const VerifyEmail: React.FC = () => {
    const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
    const [message, setMessage] = useState('Verifying your email...');

    useEffect(() => {
        const verify = async () => {
            // Get token from URL
            const urlParams = new URLSearchParams(window.location.search);
            const token = urlParams.get('token');

            if (!token) {
                setStatus('error');
                setMessage('Invalid verification link. No token found.');
                return;
            }

            try {
                const response = await fetch('/api/auth/verify-email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token })
                });

                const data = await response.json();

                if (response.ok) {
                    setStatus('success');
                    setMessage('Email verified successfully! You can now close this tab or return to login.');
                    // Optional: Save token if auto-login is desired
                    // if (data.token) localStorage.setItem('token', data.token);
                } else {
                    setStatus('error');
                    setMessage(data.error || 'Verification failed. Link may be expired.');
                }
            } catch (err: any) {
                setStatus('error');
                setMessage('An error occurred during verification.');
            }
        };

        verify();
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-900 text-gray-900 dark:text-gray-100 p-4">
            <div className="bg-white dark:bg-dark-800 p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-gray-200 dark:border-dark-700">
                <div className="mb-6 flex justify-center">
                    {status === 'verifying' && <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>}
                    {status === 'success' && <div className="text-5xl text-green-500">✅</div>}
                    {status === 'error' && <div className="text-5xl text-red-500">❌</div>}
                </div>

                <h2 className="text-2xl font-bold mb-4">
                    {status === 'verifying' && 'Verifying...'}
                    {status === 'success' && 'Email Verified!'}
                    {status === 'error' && 'Verification Failed'}
                </h2>

                <p className="text-gray-600 dark:text-gray-400 mb-8">
                    {message}
                </p>

                {status !== 'verifying' && (
                    <a
                        href="/"
                        className="inline-block bg-primary-500 hover:bg-primary-600 text-black font-bold py-3 px-8 rounded-xl transition-colors"
                    >
                        Go to Login
                    </a>
                )}
            </div>
        </div>
    );
};
