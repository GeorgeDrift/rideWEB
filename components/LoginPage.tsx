
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
        // Minimum loading time for UX
        await new Promise(resolve => setTimeout(resolve, 2000));
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
            const errorMessage = err.message || 'Login failed';
            setError(errorMessage);
            alert("Login Error: " + errorMessage); // Explicit alert as requested
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
        // Minimum loading time for UX
        await new Promise(resolve => setTimeout(resolve, 2000));

        try {
            // Validate driver requirements
            if (selectedRole === 'driver') {
                if (!driverLicense) {
                    setError('Driver license is required');
                    setLoading(false);
                    return;
                }

                const hasPaymentMethod = phone || airtelMoney || mpamba;
                if (!hasPaymentMethod) {
                    setError('WhatsApp number or mobile money number is required');
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
                    mpambaNumber: mpamba
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

            // Check if response is valid JSON
            const contentType = response.headers.get("content-type");
            let data;
            if (contentType && contentType.indexOf("application/json") !== -1) {
                data = await response.json();
            } else {
                // Read text to debug (likely HTML error from Nginx)
                const text = await response.text();
                console.error("Server returned non-JSON:", text);
                throw new Error(`Server Error (${response.status}): The server is not reachable or misconfigured.`);
            }

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
            if (data.token) {
                localStorage.setItem('token', data.token);
                alert(data.message || 'Registration successful!');
                onLogin(selectedRole);
            }
        } catch (err: any) {
            console.error("Registration error:", err);
            const errorMessage = err.message || 'Registration failed';
            setError(errorMessage);
            alert("Error: " + errorMessage); // Explicit alert as requested
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
                <h4 className="font-medium mb-3">Contact & Payment Details</h4>
                <p className="text-xs text-gray-500 mb-4">WhatsApp number for marketplace contact + Mobile Money for payouts</p>

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
                        <p className="text-sm font-medium mb-3 flex items-center gap-2">
                            <svg className="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                            </svg>
                            WhatsApp Number (for client contact)
                        </p>
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="block w-full px-4 py-3 bg-gray-50 dark:bg-dark-800 border border-gray-300 dark:border-dark-700 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                            placeholder="+265 991 234 567"
                        />
                        <p className="text-xs text-gray-500 mt-1">This number will be used for marketplace WhatsApp contact</p>
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
            <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24 bg-white dark:bg-dark-900 border-r border-gray-200 dark:border-700 overflow-y-auto">
                <div className="mx-auto w-full max-w-sm lg:w-96">
                    <div>
                        <h1 className="text-4xl font-extrabold mb-8 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                            RideX
                        </h1>
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
