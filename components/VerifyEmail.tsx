import React, { useEffect, useState } from 'react';
import { ApiService } from '../services/api';

export const VerifyEmail: React.FC = () => {
    const [status, setStatus] = useState<'verifying' | 'success' | 'error' | 'resending'>('verifying');
    const [message, setMessage] = useState('Verifying your email...');
    const [showResend, setShowResend] = useState(false);
    const [resendEmail, setResendEmail] = useState('');
    const [resendStatus, setResendStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

    useEffect(() => {
        const verify = async () => {
            // Get token from URL
            const urlParams = new URLSearchParams(window.location.search);
            const token = urlParams.get('token');

            if (!token) {
                setStatus('error');
                setMessage('Invalid verification link. No token found.');
                setShowResend(true);
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
                    setMessage('Email verified successfully! Logging you in...');

                    // Save token if returned to auto-login
                    if (data.token) {
                        localStorage.setItem('token', data.token);
                        // Redirect to the home/dashboard after a short delay
                        setTimeout(() => {
                            window.location.href = '/';
                        }, 2000);
                    }
                } else {
                    setStatus('error');
                    setMessage(data.error || 'Verification failed. Link may be expired.');
                    // Show resend button if token expired
                    if (data.expired) {
                        setShowResend(true);
                    }
                }
            } catch (err: any) {
                setStatus('error');
                setMessage('An error occurred during verification.');
            }
        };

        verify();
    }, []);

    const handleResendVerification = async () => {
        if (!resendEmail) {
            alert('Please enter your email address');
            return;
        }

        setResendStatus('sending');
        try {
            const response = await fetch('/api/auth/resend-verification', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: resendEmail })
            });

            const data = await response.json();

            if (response.ok) {
                setResendStatus('sent');
                setMessage('Verification email sent! Please check your inbox.');
            } else {
                setResendStatus('error');
                alert(data.error || 'Failed to send verification email');
            }
        } catch (err) {
            setResendStatus('error');
            alert('An error occurred. Please try again.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-900 text-gray-900 dark:text-gray-100 p-4 sm:p-6 md:p-8">
            <div className="bg-white dark:bg-dark-800 p-6 sm:p-8 md:p-10 rounded-2xl shadow-xl max-w-md w-full text-center border border-gray-200 dark:border-dark-700">
                <div className="mb-4 sm:mb-6 flex justify-center">
                    {status === 'verifying' && <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-primary-500"></div>}
                    {status === 'success' && <div className="text-4xl sm:text-5xl text-green-500">✅</div>}
                    {status === 'error' && <div className="text-4xl sm:text-5xl text-red-500">❌</div>}
                    {resendStatus === 'sent' && <div className="text-4xl sm:text-5xl text-blue-500">📧</div>}
                </div>

                <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">
                    {status === 'verifying' && 'Verifying...'}
                    {status === 'success' && 'Email Verified!'}
                    {status === 'error' && resendStatus !== 'sent' && 'Verification Failed'}
                    {resendStatus === 'sent' && 'Email Sent!'}
                </h2>

                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6 sm:mb-8">
                    {message}
                </p>

                {showResend && resendStatus !== 'sent' && (
                    <div className="mb-4 sm:mb-6">
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-3 sm:mb-4">
                            Enter your email to receive a new verification link:
                        </p>
                        <input
                            type="email"
                            value={resendEmail}
                            onChange={(e) => setResendEmail(e.target.value)}
                            placeholder="your@email.com"
                            className="w-full px-3 py-2 sm:px-4 sm:py-2.5 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg mb-2 sm:mb-3 bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <button
                            onClick={handleResendVerification}
                            disabled={resendStatus === 'sending'}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 sm:py-3 px-6 sm:px-8 text-sm sm:text-base rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {resendStatus === 'sending' ? 'Sending...' : 'Resend Verification Email'}
                        </button>
                    </div>
                )}

                {(status !== 'verifying' || resendStatus === 'sent') && (
                    <a
                        href="/"
                        className="inline-block bg-primary-500 hover:bg-primary-600 text-black font-bold py-2.5 sm:py-3 px-6 sm:px-8 text-sm sm:text-base rounded-xl transition-colors"
                    >
                        Go to Login
                    </a>
                )}
            </div>
        </div>
    );
};
