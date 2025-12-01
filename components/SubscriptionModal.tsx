import React, { useState, useEffect } from 'react';
import { CloseIcon, CheckCircleIcon, WalletIcon, CreditCardIcon } from './Icons';
import { ApiService, MobileMoneyOperator } from '../services/api';

interface SubscriptionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

interface SubscriptionPlan {
    name: string;
    price: number;
    duration: number;
    description: string;
}

interface SubscriptionPlans {
    monthly: SubscriptionPlan;
    yearly: SubscriptionPlan;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [step, setStep] = useState<'plan' | 'payment' | 'processing' | 'success'>('plan');
    const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');
    const [mobileProvider, setMobileProvider] = useState<'airtel' | 'mpamba'>('airtel');
    const [mobileNumber, setMobileNumber] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [chargeId, setChargeId] = useState<string | null>(null);

    const [plans, setPlans] = useState<SubscriptionPlans | null>(null);
    const [operators, setOperators] = useState<MobileMoneyOperator[]>([]);
    const [trialDays, setTrialDays] = useState(0);

    // Load plans and operators
    useEffect(() => {
        if (isOpen) {
            loadPlansAndOperators();
        }
    }, [isOpen]);

    const loadPlansAndOperators = async () => {
        try {
            const [plansData, operatorsData] = await Promise.all([
                fetch('/api/subscriptions/plans', {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                }).then(r => r.json()),
                ApiService.getMobileMoneyOperators()
            ]);

            setPlans(plansData.plans);
            setTrialDays(plansData.trialDays || 0);
            setOperators(operatorsData);
        } catch (err) {
            console.error('Error loading plans:', err);
            setError('Failed to load subscription plans');
        }
    };

    const handlePlanSelect = (plan: 'monthly' | 'yearly') => {
        setSelectedPlan(plan);
        setStep('payment');
        setError(null);
    };

    const handleInitiatePayment = async () => {
        if (!mobileNumber) {
            setError('Please enter your mobile number');
            return;
        }

        setError(null);
        setStep('processing');

        try {
            const provider = operators.find(op =>
                op.code.toLowerCase() === mobileProvider
            );

            if (!provider) {
                throw new Error('Mobile money provider not found');
            }

            const response = await fetch('/api/subscriptions/initiate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    plan: selectedPlan,
                    mobileNumber,
                    providerRefId: provider.ref_id
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Payment initiation failed');
            }

            setChargeId(data.chargeId);

            // Start polling for payment verification
            pollPaymentStatus(data.chargeId);

        } catch (err) {
            console.error('Payment error:', err);
            setError(err instanceof Error ? err.message : 'Payment failed');
            setStep('payment');
        }
    };

    const pollPaymentStatus = async (chargeId: string) => {
        let attempts = 0;
        const maxAttempts = 20; // 60 seconds

        const poll = setInterval(async () => {
            attempts++;

            try {
                const response = await fetch(`/api/subscriptions/verify/${chargeId}`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });

                const data = await response.json();

                if (data.status === 'success') {
                    clearInterval(poll);
                    setStep('success');
                    setTimeout(() => {
                        onSuccess();
                        handleClose();
                    }, 3000);
                } else if (data.status === 'failed') {
                    clearInterval(poll);
                    setError('Payment failed. Please try again.');
                    setStep('payment');
                } else if (attempts >= maxAttempts) {
                    clearInterval(poll);
                    setError('Payment verification timeout. Please check your subscription status.');
                    setStep('payment');
                }
            } catch (err) {
                console.error('Verification error:', err);
                if (attempts >= maxAttempts) {
                    clearInterval(poll);
                    setError('Unable to verify payment. Please contact support.');
                    setStep('payment');
                }
            }
        }, 3000);
    };

    const handleClose = () => {
        setStep('plan');
        setSelectedPlan('monthly');
        setMobileNumber('');
        setError(null);
        setChargeId(null);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-[#1E1E1E] rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[#2A2A2A] shadow-2xl">
                {/* Header */}
                <div className="p-6 border-b border-[#2A2A2A] flex justify-between items-center sticky top-0 bg-[#1E1E1E] z-10">
                    <h2 className="text-2xl font-bold text-white">Subscribe to RideX</h2>
                    <button onClick={handleClose} className="text-gray-400 hover:text-white transition-colors">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Step 1: Plan Selection */}
                    {step === 'plan' && plans && (
                        <div className="space-y-6">
                            {trialDays > 0 && (
                                <div className="bg-[#FACC15]/10 border border-[#FACC15]/30 rounded-xl p-4 text-center">
                                    <p className="text-[#FACC15] font-bold">🎉 {trialDays} Days Free Trial Available!</p>
                                    <p className="text-gray-400 text-sm mt-1">Start accepting rides immediately</p>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Monthly Plan */}
                                <div
                                    onClick={() => handlePlanSelect('monthly')}
                                    className="bg-[#252525] border-2 border-[#333] rounded-2xl p-6 cursor-pointer hover:border-[#FACC15] transition-all group"
                                >
                                    <div className="text-center">
                                        <h3 className="text-xl font-bold text-white mb-2">{plans.monthly.name}</h3>
                                        <div className="text-4xl font-bold text-[#FACC15] mb-2">
                                            MWK {(plans.monthly.price ?? 0).toLocaleString()}
                                        </div>
                                        <p className="text-gray-400 text-sm mb-4">{plans.monthly.description}</p>
                                        <div className="text-gray-500 text-xs">
                                            ~MWK {Math.round((plans.monthly.price ?? 0) / 30).toLocaleString()} per day
                                        </div>
                                    </div>
                                    <button className="w-full mt-6 py-3 bg-[#333] group-hover:bg-[#FACC15] text-white group-hover:text-black font-bold rounded-xl transition-colors">
                                        Select Plan
                                    </button>
                                </div>

                                {/* Yearly Plan */}
                                <div
                                    onClick={() => handlePlanSelect('yearly')}
                                    className="bg-[#252525] border-2 border-[#FACC15] rounded-2xl p-6 cursor-pointer hover:border-[#FACC15] hover:shadow-[0_0_30px_rgba(250,204,21,0.3)] transition-all group relative"
                                >
                                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-[#FACC15] text-black text-xs font-bold px-3 py-1 rounded-full">
                                        BEST VALUE
                                    </div>
                                    <div className="text-center">
                                        <h3 className="text-xl font-bold text-white mb-2">{plans.yearly.name}</h3>
                                        <div className="text-4xl font-bold text-[#FACC15] mb-2">
                                            MWK {(plans.yearly.price ?? 0).toLocaleString()}
                                        </div>
                                        <p className="text-gray-400 text-sm mb-4">{plans.yearly.description}</p>
                                        <div className="text-green-400 text-xs font-bold">
                                            Save MWK {(((plans.monthly.price ?? 0) * 12) - (plans.yearly.price ?? 0)).toLocaleString()}
                                        </div>
                                    </div>
                                    <button className="w-full mt-6 py-3 bg-[#FACC15] text-black font-bold rounded-xl hover:bg-[#EAB308] transition-colors">
                                        Select Plan
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Payment Details */}
                    {step === 'payment' && plans && (
                        <div className="space-y-6">
                            <div className="bg-[#252525] rounded-xl p-4 border border-[#333]">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400">Selected Plan:</span>
                                    <span className="text-white font-bold">{plans[selectedPlan].name}</span>
                                </div>
                                <div className="flex justify-between items-center mt-2">
                                    <span className="text-gray-400">Amount:</span>
                                    <span className="text-[#FACC15] font-bold text-xl">
                                        MWK {(plans[selectedPlan].price ?? 0).toLocaleString()}
                                    </span>
                                </div>
                            </div>

                            {error && (
                                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm">
                                    {error}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-bold text-gray-400 mb-3">Payment Method</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => setMobileProvider('airtel')}
                                        className={`p-4 rounded-xl border-2 transition-all ${mobileProvider === 'airtel'
                                                ? 'border-[#FACC15] bg-[#FACC15]/10'
                                                : 'border-[#333] bg-[#252525] hover:border-[#444]'
                                            }`}
                                    >
                                        <div className="text-center">
                                            <div className="text-2xl mb-2">📱</div>
                                            <div className="text-white font-bold text-sm">Airtel Money</div>
                                        </div>
                                    </button>
                                    <button
                                        onClick={() => setMobileProvider('mpamba')}
                                        className={`p-4 rounded-xl border-2 transition-all ${mobileProvider === 'mpamba'
                                                ? 'border-[#FACC15] bg-[#FACC15]/10'
                                                : 'border-[#333] bg-[#252525] hover:border-[#444]'
                                            }`}
                                    >
                                        <div className="text-center">
                                            <div className="text-2xl mb-2">💳</div>
                                            <div className="text-white font-bold text-sm">Mpamba</div>
                                        </div>
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-400 mb-2">Mobile Number</label>
                                <input
                                    type="tel"
                                    value={mobileNumber}
                                    onChange={(e) => setMobileNumber(e.target.value)}
                                    placeholder="e.g. 0991234567"
                                    className="w-full bg-[#252525] border border-[#333] rounded-xl px-4 py-3 text-white focus:border-[#FACC15] outline-none"
                                />
                                <p className="text-gray-500 text-xs mt-2">
                                    You will receive a push notification to approve the payment
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setStep('plan')}
                                    className="flex-1 py-3 bg-[#252525] text-white rounded-xl font-bold hover:bg-[#333] transition-colors"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={handleInitiatePayment}
                                    className="flex-1 py-3 bg-[#FACC15] text-black rounded-xl font-bold hover:bg-[#EAB308] transition-colors"
                                >
                                    Pay Now
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Processing */}
                    {step === 'processing' && (
                        <div className="text-center py-12">
                            <div className="w-20 h-20 border-4 border-[#FACC15] border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                            <h3 className="text-xl font-bold text-white mb-2">Processing Payment...</h3>
                            <p className="text-gray-400 mb-4">Please check your phone and approve the payment</p>
                            <p className="text-gray-500 text-sm">This may take a few moments</p>
                        </div>
                    )}

                    {/* Step 4: Success */}
                    {step === 'success' && (
                        <div className="text-center py-12">
                            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircleIcon className="w-12 h-12 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">Subscription Activated!</h3>
                            <p className="text-gray-400 mb-4">You can now start accepting rides</p>
                            <p className="text-green-400 text-sm">Redirecting...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
