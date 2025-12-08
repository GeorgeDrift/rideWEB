
import React, { useState } from 'react';
import { ApiService } from '../services/api';
import { SteeringWheelIcon, GlobeIcon, CarIcon, LockIcon, MailIcon } from './Icons';
import { UserRole } from '../types';

interface LoginPageProps {
    onLogin: (role: UserRole) => void;
}

type RegistrationStep = 'role' | 'basic' | 'driver-details';

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);

    // Registration state
    const [registrationStep, setRegistrationStep] = useState<RegistrationStep>('role');
    const [selectedRole, setSelectedRole] = useState<'driver' | 'rider'>('rider');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');

    // Driver-specific state
    const [driverLicense, setDriverLicense] = useState<File | null>(null);
    const [licensePreview, setLicensePreview] = useState<string>('');
    const [airtelMoney, setAirtelMoney] = useState('');
    const [mpamba, setMpamba] = useState('');
    const [bankName, setBankName] = useState('');
    const [bankAccountNumber, setBankAccountNumber] = useState('');
    const [bankAccountName, setBankAccountName] = useState('');

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Login form submitted for:', email);
        setError('');
        if (!email || !password) {
            setError('Please enter both email and password');
            return;
        }

        setLoading(true);
        try {
            console.log('Calling ApiService.login...');
            const user = await ApiService.login(email, password);
            console.log('ApiService.login returned:', user);
            if (!user) throw new Error('Invalid login response');
            // Use the role returned by the server
            const role = (user.role || 'admin') as any;
            console.log('Calling onLogin with role:', role);
            onLogin(role);
        } catch (err: any) {
            console.error('Login error in component:', err);
            setError(err.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    // demo login removed — all logins now go through the server

    const handleGoogleLogin = () => {
        alert("Google Login provider not configured in this demo.");
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file type
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
            if (!validTypes.includes(file.type)) {
                setError('Only JPEG, PNG, and PDF files are allowed');
                return;
            }

            // Validate file size (5MB)
            if (file.size > 5 * 1024 * 1024) {
                setError('File size must be less than 5MB');
                return;
            }

            setDriverLicense(file);
            setError('');

            // Create preview for images
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setLicensePreview(reader.result as string);
                };
                reader.readAsDataURL(file);
            } else {
                setLicensePreview('');
            }
        }
    };

    const handleRegistration = async () => {
        setError('');
        setLoading(true);

        try {
            // Validate driver requirements
            if (selectedRole === 'driver') {
                if (!driverLicense) {
                    setError('Driver license is required');
                    setLoading(false);
                    return;
                }

                const hasPaymentMethod = airtelMoney || mpamba || (bankName && bankAccountNumber);
                if (!hasPaymentMethod) {
                    setError('At least one payment method is required');
                    setLoading(false);
                    return;
                }
            }

            // Prepare registration data
            const registrationData = {
                name,
                email,
                password,
                role: selectedRole,
                phone,
                ...(selectedRole === 'driver' && {
                    airtelMoneyNumber: airtelMoney,
                    mpambaNumber: mpamba,
                    bankName,
                    bankAccountNumber,
                    bankAccountName
                })
            };

            // Register user
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(registrationData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Registration failed');
            }

            // If driver, upload license
            if (selectedRole === 'driver' && driverLicense) {
                const formData = new FormData();
                formData.append('license', driverLicense);

                const uploadResponse = await fetch('/api/auth/upload-license', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${data.token}`,
                    },
                    body: formData,
                });

                if (!uploadResponse.ok) {
                    console.error('License upload failed');
                }
            }

            // Save token (so user becomes authenticated) and login
            if (data.token) localStorage.setItem('token', data.token);
            alert(data.message || 'Registration successful!');
            onLogin(selectedRole);
        } catch (err: any) {
            setError(err.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const resetRegistration = () => {
        setIsSignUp(false);
        setRegistrationStep('role');
        setSelectedRole('rider');
        setName('');
        setEmail('');
        setPassword('');
        setPhone('');
        setDriverLicense(null);
        setLicensePreview('');
        setAirtelMoney('');
        setMpamba('');
        setBankName('');
        setBankAccountNumber('');
        setBankAccountName('');
        setError('');
    };

    const renderRoleSelection = () => (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold mb-4">Choose your role</h3>
                <div className="grid grid-cols-2 gap-4">
                    <button
                        type="button"
                        onClick={() => setSelectedRole('rider')}
                        className={`p-6 rounded-xl border-2 transition-all ${selectedRole === 'rider'
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                            : 'border-gray-200 dark:border-dark-700 hover:border-primary-300'
                            }`}
                    >
                        <div className="text-4xl mb-2">🚶</div>
                        <div className="font-semibold">Passenger</div>
                        <div className="text-xs text-gray-500 mt-1">Book rides</div>
                    </button>
                    <button
                        type="button"
                        onClick={() => setSelectedRole('driver')}
                        className={`p-6 rounded-xl border-2 transition-all ${selectedRole === 'driver'
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                            : 'border-gray-200 dark:border-dark-700 hover:border-primary-300'
                            }`}
                    >
                        <div className="text-4xl mb-2">🚗</div>
                        <div className="font-semibold">Driver</div>
                        <div className="text-xs text-gray-500 mt-1">Offer rides</div>
                    </button>
                </div>
            </div>
            <button
                type="button"
                onClick={() => setRegistrationStep('basic')}
                className="w-full py-3 px-4 bg-primary-500 hover:bg-primary-600 text-black font-bold rounded-lg transition-colors"
            >
                Continue
            </button>
        </div>
    );

    const renderBasicInfo = () => (
        <div className="space-y-6">
            <div>
                <label className="block text-sm font-medium mb-1">Full Name</label>
                <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full px-4 py-3 bg-gray-50 dark:bg-dark-800 border border-gray-300 dark:border-dark-700 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    placeholder="John Doe"
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Email address</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MailIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="block w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-dark-800 border border-gray-300 dark:border-dark-700 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                        placeholder="name@example.com"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Phone Number</label>
                <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="block w-full px-4 py-3 bg-gray-50 dark:bg-dark-800 border border-gray-300 dark:border-dark-700 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    placeholder="+265 991 234 567"
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Password</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <LockIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="block w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-dark-800 border border-gray-300 dark:border-dark-700 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                        placeholder="••••••••"
                    />
                </div>
            </div>

            <div className="flex gap-3">
                <button
                    type="button"
                    onClick={() => setRegistrationStep('role')}
                    className="flex-1 py-3 px-4 border border-gray-300 dark:border-dark-700 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-dark-800 transition-colors"
                >
                    Back
                </button>
                <button
                    type="button"
                    onClick={() => {
                        if (selectedRole === 'driver') {
                            setRegistrationStep('driver-details');
                        } else {
                            handleRegistration();
                        }
                    }}
                    disabled={loading}
                    className="flex-1 py-3 px-4 bg-primary-500 hover:bg-primary-600 text-black font-bold rounded-lg transition-colors disabled:opacity-50"
                >
                    {loading ? 'Processing...' : selectedRole === 'driver' ? 'Continue' : 'Sign Up'}
                </button>
            </div>
        </div>
    );

    const renderDriverDetails = () => (
        <div className="space-y-6">
            <div>
                <label className="block text-sm font-medium mb-2">Driver's License</label>
                <div className="border-2 border-dashed border-gray-300 dark:border-dark-700 rounded-lg p-6 text-center">
                    {licensePreview ? (
                        <div className="space-y-3">
                            <img src={licensePreview} alt="License preview" className="max-h-40 mx-auto rounded" />
                            <button
                                type="button"
                                onClick={() => {
                                    setDriverLicense(null);
                                    setLicensePreview('');
                                }}
                                className="text-sm text-red-500 hover:text-red-600"
                            >
                                Remove
                            </button>
                        </div>
                    ) : driverLicense ? (
                        <div className="space-y-3">
                            <div className="text-4xl">📄</div>
                            <div className="text-sm font-medium">{driverLicense.name}</div>
                            <button
                                type="button"
                                onClick={() => setDriverLicense(null)}
                                className="text-sm text-red-500 hover:text-red-600"
                            >
                                Remove
                            </button>
                        </div>
                    ) : (
                        <div>
                            <input
                                type="file"
                                id="license-upload"
                                accept="image/jpeg,image/jpg,image/png,application/pdf"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                            <label
                                htmlFor="license-upload"
                                className="cursor-pointer inline-block px-4 py-2 bg-gray-100 dark:bg-dark-800 rounded-lg hover:bg-gray-200 dark:hover:bg-dark-700 transition-colors"
                            >
                                Choose File
                            </label>
                            <p className="text-xs text-gray-500 mt-2">JPEG, PNG, or PDF (max 5MB)</p>
                        </div>
                    )}
                </div>
            </div>

            <div>
                <h4 className="font-medium mb-3">Payment Details</h4>
                <p className="text-xs text-gray-500 mb-4">Provide at least one payment method</p>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Airtel Money Number</label>
                        <input
                            type="tel"
                            value={airtelMoney}
                            onChange={(e) => setAirtelMoney(e.target.value)}
                            className="block w-full px-4 py-3 bg-gray-50 dark:bg-dark-800 border border-gray-300 dark:border-dark-700 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                            placeholder="0991 234 567"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Mpamba Number</label>
                        <input
                            type="tel"
                            value={mpamba}
                            onChange={(e) => setMpamba(e.target.value)}
                            className="block w-full px-4 py-3 bg-gray-50 dark:bg-dark-800 border border-gray-300 dark:border-dark-700 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                            placeholder="0881 234 567"
                        />
                    </div>

                    <div className="pt-2 border-t border-gray-200 dark:border-dark-700">
                        <p className="text-sm font-medium mb-3">Bank Details</p>
                        <div className="space-y-3">
                            <input
                                type="text"
                                value={bankName}
                                onChange={(e) => setBankName(e.target.value)}
                                className="block w-full px-4 py-2 bg-gray-50 dark:bg-dark-800 border border-gray-300 dark:border-dark-700 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                                placeholder="Bank Name"
                            />
                            <input
                                type="text"
                                value={bankAccountNumber}
                                onChange={(e) => setBankAccountNumber(e.target.value)}
                                className="block w-full px-4 py-2 bg-gray-50 dark:bg-dark-800 border border-gray-300 dark:border-dark-700 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                                placeholder="Account Number"
                            />
                            <input
                                type="text"
                                value={bankAccountName}
                                onChange={(e) => setBankAccountName(e.target.value)}
                                className="block w-full px-4 py-2 bg-gray-50 dark:bg-dark-800 border border-gray-300 dark:border-dark-700 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                                placeholder="Account Holder Name"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
                    {error}
                </div>
            )}

            <div className="flex gap-3">
                <button
                    type="button"
                    onClick={() => setRegistrationStep('basic')}
                    className="flex-1 py-3 px-4 border border-gray-300 dark:border-dark-700 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-dark-800 transition-colors"
                >
                    Back
                </button>
                <button
                    type="button"
                    onClick={handleRegistration}
                    disabled={loading}
                    className="flex-1 py-3 px-4 bg-primary-500 hover:bg-primary-600 text-black font-bold rounded-lg transition-colors disabled:opacity-50"
                >
                    {loading ? 'Processing...' : 'Complete Registration'}
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen flex flex-col lg:flex-row bg-white dark:bg-dark-900 font-sans text-gray-900 dark:text-gray-100">
            {/* Left Side: Form */}
            <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24 bg-white dark:bg-dark-900 border-r border-gray-200 dark:border-dark-700 overflow-y-auto">
                <div className="mx-auto w-full max-w-sm lg:w-96">
                    <div>
                        <div className="flex items-center gap-3 mb-8">
                            <div className="bg-primary-500 rounded-xl h-10 w-10 flex items-center justify-center shadow-md">
                                <SteeringWheelIcon className="h-6 w-6 text-black" />
                            </div>
                            <span className="text-2xl font-extrabold tracking-tight">Ridex</span>
                        </div>

                        <h2 className="mt-6 text-3xl font-bold tracking-tight">
                            {isSignUp ? 'Create an account' : 'Welcome back'}
                        </h2>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            {isSignUp
                                ? registrationStep === 'role'
                                    ? 'Start your journey with us today.'
                                    : `Step ${registrationStep === 'basic' ? '2' : '3'} of ${selectedRole === 'driver' ? '3' : '2'}`
                                : 'Please enter your details to sign in.'}
                        </p>
                    </div>

                    <div className="mt-8">
                        {!isSignUp ? (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Email address</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <MailIcon className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="block w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-dark-800 border border-gray-300 dark:border-dark-700 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                                            placeholder="name@example.com"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Password</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <LockIcon className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="password"
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="block w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-dark-800 border border-gray-300 dark:border-dark-700 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-black bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors ${loading ? 'opacity-60 cursor-wait' : ''}`}
                                >
                                    {loading ? 'Signing in...' : 'Sign In'}
                                </button>
                            </form>
                        ) : (
                            <div>
                                {registrationStep === 'role' && renderRoleSelection()}
                                {registrationStep === 'basic' && renderBasicInfo()}
                                {registrationStep === 'driver-details' && renderDriverDetails()}
                            </div>
                        )}

                        {!isSignUp && (
                            <>
                                <div className="mt-6">
                                    <div className="relative">
                                        <div className="absolute inset-0 flex items-center">
                                            <div className="w-full border-t border-gray-200 dark:border-dark-700" />
                                        </div>
                                        <div className="relative flex justify-center text-sm">
                                            <span className="px-2 bg-white dark:bg-dark-900 text-gray-500">Or continue with</span>
                                        </div>
                                    </div>

                                    <div className="mt-6">
                                        <button
                                            onClick={handleGoogleLogin}
                                            className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white dark:bg-dark-800 border border-gray-300 dark:border-dark-700 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-dark-700 transition-all"
                                        >
                                            <svg className="h-5 w-5" viewBox="0 0 24 24">
                                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                            </svg>
                                            Continue with Google
                                        </button>
                                    </div>
                                </div>

                                {/* Demo credentials removed — login requires real user in PostgreSQL via backend /api/auth/login */}
                            </>
                        )}

                        <div className="mt-6 text-center">
                            <button
                                onClick={() => {
                                    if (isSignUp) {
                                        resetRegistration();
                                    } else {
                                        setIsSignUp(true);
                                    }
                                }}
                                className="text-sm font-medium text-primary-600 hover:text-primary-500"
                            >
                                {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side: Visuals */}
            <div className="hidden lg:block flex-1 relative" style={{ backgroundColor: '#121212' }}>
                <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-black opacity-90"></div>
                <div className="absolute inset-0" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80")', backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.3 }}></div>
                <div className="relative h-full flex flex-col justify-center px-12 text-white">
                    <h1 className="text-5xl font-bold mb-6 leading-tight">
                        The New Standard in <br />
                        <span className="text-primary-500">Mobility Management</span>
                    </h1>
                    <p className="text-lg text-gray-300 max-w-md mb-8">
                        Efficiently manage your fleet, track rides in real-time, and optimize revenue with our comprehensive dashboard.
                    </p>
                    <div className="flex gap-4">
                        <div className="flex items-center gap-2 text-sm font-medium bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                            <CarIcon className="h-5 w-5 text-primary-500" />
                            Ride Share
                        </div>
                        <div className="flex items-center gap-2 text-sm font-medium bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                            <GlobeIcon className="h-5 w-5 text-blue-400" />
                            Global Tracking
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
