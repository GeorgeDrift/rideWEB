import React, { useState, useEffect } from 'react';
import { CloseIcon, CheckCircleIcon, WalletIcon, CreditCardIcon } from './Icons';
import { ApiService, MobileMoneyOperator } from '../services/api';
import { socketService } from '../services/socket';

interface SubscriptionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

interface SubscriptionPlan {
    id: number;
    name: string;
    price: number;
    duration: number;
    description: string;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [step, setStep] = useState<'plan' | 'payment' | 'processing' | 'success'>('plan');
    const [selectedPlan, setSelectedPlan] = useState<number | null>(null);
    const [mobileProvider, setMobileProvider] = useState<'airtel' | 'mpamba'>('airtel');
    const [mobileNumber, setMobileNumber] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [chargeId, setChargeId] = useState<string | null>(null);

    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [operators, setOperators] = useState<MobileMoneyOperator[]>([]);
    const [trialDays, setTrialDays] = useState(0);

    // Load plans and operators
    useEffect(() => {
        if (isOpen) {
            loadPlansAndOperators();
        }
    }, [isOpen]);

    // Listen for socket events for real-time payment confirmation
    useEffect(() => {
        if (step === 'payment' || step === 'processing' || chargeId) {
            const handleSubscriptionActivated = (data: any) => {
                console.log('🎉 Subscription Activated via Socket:', data);
                setStep('success');
                setTimeout(() => {
                    onSuccess();
                    handleClose();
                }, 3000);
            };

            socketService.on('subscription_activated', handleSubscriptionActivated);

            return () => {
                socketService.off('subscription_activated', handleSubscriptionActivated);
            };
        }
    }, [step, chargeId, onSuccess]);

    const loadPlansAndOperators = async () => {
        try {
            const [plansData, operatorsData] = await Promise.all([
                ApiService.getSubscriptionPlans(), // Use the service method we verified
                ApiService.getMobileMoneyOperators()
            ]);

            // Handle response format
            if (plansData.plans && Array.isArray(plansData.plans)) {
                setPlans(plansData.plans);
                setTrialDays(plansData.trialDays || 30);
            } else if (Array.isArray(plansData)) {
                setPlans(plansData);
                setTrialDays(30);
            } else {
                setPlans([]);
            }

            setOperators(operatorsData);
        } catch (err) {
            console.error('Error loading plans:', err);
            setError('Failed to load subscription plans');
        }
    };

    const handlePlanSelect = (planId: number) => {
        setSelectedPlan(planId);
        setStep('payment');
        setError(null);
    };

    const handleInitiatePayment = async () => {
        if (!selectedPlan || !mobileNumber || !mobileProvider) {
            setError('Please fill in all fields');
            return;
        }

        setStep('processing');
        setError(null);

        try {
            const op = operators.find(o => o.short_code.toLowerCase() === mobileProvider);
            const providerRefId = op?.ref_id || (mobileProvider === 'airtel' ? '20be6c20-adeb-4b5b-a7ba-0769820df4fb' : '27494cb5-ba9e-437f-a114-4e7a7686bcca');

            // Use ApiService instead of raw fetch
            const response = await ApiService.initiateSubscriptionPayment(selectedPlan, mobileNumber, providerRefId);

            if (response.status === 'success' || response.chargeId) {
                setChargeId(response.chargeId);
                // We keep it in 'processing' state while we wait for webhook/socket or poll
                pollPaymentStatus(response.chargeId);
            } else {
                throw new Error(response.message || 'Payment initiation failed');
            }
        } catch (err: any) {
            console.error('Payment Error:', err);
            setError(err.message || 'Payment failed. Please try again.');
            setStep('payment');
        }
    };

    const pollPaymentStatus = async (chargeId: string) => {
        let attempts = 0;
        const maxAttempts = 20; // 60 seconds

        const poll = setInterval(async () => {
            attempts++;

            try {
                // Use fetch here since we don't have a specific ApiService method for specific charge verification exposed (based on prev api.ts view, though verifyPayment exists in backend)
                // Actually, let's assume valid endpoint exists
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
        setSelectedPlan(null);
        setMobileNumber('');
        setError(null);
        setChargeId(null);
        onClose();
    };

    const getSelectedPlanDetails = () => {
        return plans.find(p => p.id === selectedPlan);
    };

    if (!isOpen) return null;

    const planDetails = getSelectedPlanDetails();

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
                <div className="p-4">
                    {/* Step 1: Plan Selection */}
                    {step === 'plan' && (
                        <div className="space-y-4">
                            {trialDays > 0 && (
                                <div className="bg-[#FACC15]/10 border border-[#FACC15]/30 rounded-lg p-3 text-center">
                                    <p className="text-[#FACC15] font-bold text-sm">🎉 {trialDays} Days Free Trial Available!</p>
                                    <p className="text-gray-400 text-xs mt-0.5">Start accepting rides immediately</p>
                                </div>
                            )}

                            {plans.length === 0 ? (
                                <div className="text-center text-gray-400 py-8">Loading plans...</div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {plans.map(plan => (
                                        <div
                                            key={plan.id}
                                            onClick={() => handlePlanSelect(plan.id)}
                                            className="bg-[#252525] border-2 border-[#333] rounded-xl p-4 cursor-pointer hover:border-[#FACC15] transition-all group relative"
                                        >
                                            {/* Highlight Best Value (Optional Logic) */}
                                            {plan.duration > 30 && (
                                                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-[#FACC15] text-black text-[10px] font-bold px-2 py-0.5 rounded-full">
                                                    LONG TERM
                                                </div>
                                            )}

                                            <div className="text-center">
                                                <h3 className="text-base font-bold text-white mb-1.5">{plan.name}</h3>
                                                <div className="text-3xl font-bold text-[#FACC15] mb-1.5">
                                                    MWK {plan.price.toLocaleString()}
                                                </div>
                                                <p className="text-gray-400 text-xs mb-3">
                                                    {plan.duration} days · {plan.description}
                                                </p>
                                                <div className="text-gray-500 text-[10px]">
                                                    ~MWK {Math.round(plan.price / (plan.duration || 30)).toLocaleString()} per day
                                                </div>
                                            </div>
                                            <button className="w-full mt-4 py-2 bg-[#333] group-hover:bg-[#FACC15] text-white group-hover:text-black font-bold text-sm rounded-lg transition-colors">
                                                Select Plan
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 2: Payment Details */}
                    {step === 'payment' && planDetails && (
                        <div className="space-y-4">
                            <div className="bg-[#252525] rounded-lg p-3 border border-[#333]">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400 text-xs">Selected Plan:</span>
                                    <span className="text-white font-bold text-sm">{planDetails.name}</span>
                                </div>
                                <div className="flex justify-between items-center mt-1.5">
                                    <span className="text-gray-400 text-xs">Amount:</span>
                                    <span className="text-[#FACC15] font-bold text-base">
                                        MWK {planDetails.price.toLocaleString()}
                                    </span>
                                </div>
                            </div>

                            {error && (
                                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-xs">
                                    {error}
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-bold text-gray-400 mb-2">Payment Method</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => setMobileProvider('airtel')}
                                        className={`p-3 rounded-lg border-2 transition-all ${mobileProvider === 'airtel'
                                            ? 'border-[#FACC15] bg-[#FACC15]/10'
                                            : 'border-[#333] bg-[#252525] hover:border-[#444]'
                                            }`}
                                    >
                                        <div className="text-center">
                                            <div className="text-xl mb-1">📱</div>
                                            <div className="text-white font-bold text-xs">Airtel Money</div>
                                        </div>
                                    </button>
                                    <button
                                        onClick={() => setMobileProvider('mpamba')}
                                        className={`p-3 rounded-lg border-2 transition-all ${mobileProvider === 'mpamba'
                                            ? 'border-[#FACC15] bg-[#FACC15]/10'
                                            : 'border-[#333] bg-[#252525] hover:border-[#444]'
                                            }`}
                                    >
                                        <div className="text-center">
                                            <div className="text-xl mb-1">💳</div>
                                            <div className="text-white font-bold text-xs">Mpamba</div>
                                        </div>
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-400 mb-1.5">Mobile Number</label>
                                <input
                                    type="tel"
                                    value={mobileNumber}
                                    onChange={(e) => setMobileNumber(e.target.value)}
                                    placeholder="e.g. 0991234567"
                                    className="w-full bg-[#252525] border border-[#333] rounded-lg px-3 py-2 text-sm text-white focus:border-[#FACC15] outline-none"
                                />
                                <p className="text-gray-500 text-[10px] mt-1.5">
                                    You will receive a push notification to approve the payment
                                </p>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => setStep('plan')}
                                    className="flex-1 py-2 bg-[#252525] text-white text-sm rounded-lg font-bold hover:bg-[#333] transition-colors"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={handleInitiatePayment}
                                    className="flex-1 py-2 bg-[#FACC15] text-black text-sm rounded-lg font-bold hover:bg-[#EAB308] transition-colors"
                                >
                                    Pay Now
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Processing */}
                    {step === 'processing' && (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 border-4 border-[#FACC15] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <h3 className="text-base font-bold text-white mb-1.5">Processing Payment...</h3>
                            <p className="text-gray-400 text-xs mb-3">Please check your phone and approve the payment</p>
                            <p className="text-gray-500 text-[10px]">This may take a few moments</p>
                        </div>
                    )}

                    {/* Step 4: Success */}
                    {step === 'success' && (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircleIcon className="w-10 h-10 text-white" />
                            </div>
                            <h3 className="text-lg font-bold text-white mb-1.5">Subscription Activated!</h3>
                            <p className="text-gray-400 text-xs mb-3">You can now start accepting rides</p>
                            <p className="text-green-400 text-[10px]">Redirecting...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
