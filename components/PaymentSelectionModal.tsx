import React, { useState } from 'react';

interface PaymentSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectPayment: (paymentType: 'online' | 'physical' | 'later') => void | Promise<void>;
    amount: number;
    rideDetails: {
        type: 'share' | 'hire';
        origin: string;
        destination: string;
        driverName: string;
    };
}

const PaymentSelectionModal: React.FC<PaymentSelectionModalProps> = ({
    isOpen,
    onClose,
    onSelectPayment,
    amount,
    rideDetails
}) => {
    const [selectedMethod, setSelectedMethod] = useState<'online' | 'physical' | 'later' | null>(null);

    if (!isOpen) return null;

    const handleConfirm = async () => {
        if (selectedMethod) {
            await onSelectPayment(selectedMethod);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
                {/* Header */}
                <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 rounded-t-lg">
                    <h2 className="text-2xl font-bold">Select Payment Method</h2>
                    <p className="text-green-100 mt-1">Choose how you want to pay</p>
                </div>

                <div className="p-6">
                    {/* Trip Details */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-600">Trip:</span>
                            <span className="font-medium text-gray-900">
                                {rideDetails.origin} → {rideDetails.destination}
                            </span>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-600">Driver:</span>
                            <span className="font-medium text-gray-900">{rideDetails.driverName}</span>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                            <span className="text-gray-900 font-medium">Total Amount:</span>
                            <span className="text-2xl font-bold text-green-600">
                                MWK {amount.toLocaleString()}
                            </span>
                        </div>
                    </div>

                    {/* Payment Options */}
                    <div className="space-y-3 mb-6">
                        {/* Online Payment */}
                        <button
                            onClick={() => setSelectedMethod('online')}
                            className={`w-full p-4 rounded-lg border-2 transition ${selectedMethod === 'online'
                                ? 'border-blue-600 bg-blue-50'
                                : 'border-gray-200 hover:border-blue-300'
                                }`}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedMethod === 'online' ? 'border-blue-600' : 'border-gray-300'
                                    }`}>
                                    {selectedMethod === 'online' && (
                                        <div className="w-3 h-3 rounded-full bg-blue-600" />
                                    )}
                                </div>
                                <div className="flex-1 text-left">
                                    <div className="font-medium text-gray-900">Pay Online</div>
                                    <div className="text-sm text-gray-500">Airtel Money, Mpamba, or Bank</div>
                                </div>
                                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                            </div>
                        </button>

                        {/* Physical Payment */}
                        <button
                            onClick={() => setSelectedMethod('physical')}
                            className={`w-full p-4 rounded-lg border-2 transition ${selectedMethod === 'physical'
                                ? 'border-green-600 bg-green-50'
                                : 'border-gray-200 hover:border-green-300'
                                }`}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedMethod === 'physical' ? 'border-green-600' : 'border-gray-300'
                                    }`}>
                                    {selectedMethod === 'physical' && (
                                        <div className="w-3 h-3 rounded-full bg-green-600" />
                                    )}
                                </div>
                                <div className="flex-1 text-left">
                                    <div className="font-medium text-gray-900">Pay with Cash</div>
                                    <div className="text-sm text-gray-500">Pay driver directly at pickup</div>
                                </div>
                                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                        </button>

                        {/* Pay Later Option (for rideshare) */}
                        {rideDetails.type === 'share' && (
                            <button
                                onClick={() => setSelectedMethod('later')}
                                className={`w-full p-4 rounded-lg border-2 transition ${selectedMethod === 'later'
                                    ? 'border-yellow-600 bg-yellow-50'
                                    : 'border-gray-200 hover:border-yellow-300'
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedMethod === 'later' ? 'border-yellow-600' : 'border-gray-300'
                                        }`}>
                                        {selectedMethod === 'later' && (
                                            <div className="w-3 h-3 rounded-full bg-yellow-600" />
                                        )}
                                    </div>
                                    <div className="flex-1 text-left">
                                        <div className="font-medium text-gray-900">Pay Later</div>
                                        <div className="text-sm text-gray-500">Pay after trip completion</div>
                                    </div>
                                    <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </button>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleConfirm}
                            disabled={!selectedMethod}
                            className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            Confirm
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentSelectionModal;
