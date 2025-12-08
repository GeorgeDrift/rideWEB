import React, { useState } from 'react';

interface NegotiationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmitOffer: (price: number, message: string) => void;
    originalPrice: number;
    minPrice?: number;
    maxPrice?: number;
    vehicleDetails: {
        name: string;
        type: 'share' | 'hire';
        origin?: string;
        destination?: string;
    };
    negotiationHistory?: Array<{
        offeredBy: string;
        offeredPrice: number;
        message: string;
        status: string;
        createdAt: string;
    }>;
}

const NegotiationModal: React.FC<NegotiationModalProps> = ({
    isOpen,
    onClose,
    onSubmitOffer,
    originalPrice,
    minPrice,
    maxPrice,
    vehicleDetails,
    negotiationHistory = []
}) => {
    const [offeredPrice, setOfferedPrice] = useState(originalPrice);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [showNegotiationInput, setShowNegotiationInput] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = () => {
        setError('');

        // Validation
        if (offeredPrice <= 0) {
            setError('Please enter a valid price');
            return;
        }

        if (minPrice && offeredPrice < minPrice) {
            setError(`Minimum price is MWK ${minPrice.toLocaleString()}`);
            return;
        }

        if (maxPrice && offeredPrice > maxPrice) {
            setError(`Maximum price is MWK ${maxPrice.toLocaleString()}`);
            return;
        }

        onSubmitOffer(offeredPrice, message);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-[#FACC15] to-[#EAB308] text-black p-6 rounded-t-lg">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-2xl font-bold">Negotiate Price</h2>
                            <p className="text-black/70 mt-1 font-medium">
                                {vehicleDetails.type === 'share'
                                    ? `${vehicleDetails.origin} → ${vehicleDetails.destination}`
                                    : vehicleDetails.name}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-black hover:bg-black/10 rounded-full p-2 transition"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="p-6">
                    {/* Original Price */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-100">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600 font-medium">Original Price:</span>
                            <span className="text-2xl font-bold text-gray-900">
                                MWK {originalPrice.toLocaleString()}
                            </span>
                        </div>
                        {minPrice && maxPrice && (
                            <p className="text-sm text-gray-500 mt-2">
                                Negotiable range: MWK {minPrice.toLocaleString()} - MWK {maxPrice.toLocaleString()}
                            </p>
                        )}
                    </div>

                    {/* Main Actions */}
                    {!showNegotiationInput ? (
                        <div className="space-y-4">
                            <button
                                onClick={() => onSubmitOffer(originalPrice, 'Price accepted')}
                                className="w-full py-4 bg-black text-[#FACC15] font-bold rounded-xl hover:bg-gray-900 transition shadow-lg flex items-center justify-center gap-2"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Accept Price (MWK {originalPrice.toLocaleString()})
                            </button>

                            <button
                                onClick={() => setShowNegotiationInput(true)}
                                className="w-full py-4 bg-white border-2 border-[#FACC15] text-black font-bold rounded-xl hover:bg-[#FACC15]/10 transition"
                            >
                                Negotiate / Counter Offer
                            </button>
                        </div>
                    ) : (
                        <div className="animate-fadeIn">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-gray-800">Make Counter Offer</h3>
                                <button
                                    onClick={() => setShowNegotiationInput(false)}
                                    className="text-gray-500 text-sm hover:text-gray-800"
                                >
                                    Cancel Negotiation
                                </button>
                            </div>

                            {/* Offer Input */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Your Offer (MWK)
                                </label>
                                <input
                                    type="number"
                                    value={offeredPrice}
                                    onChange={(e) => setOfferedPrice(Number(e.target.value))}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FACC15] focus:border-transparent text-lg outline-none"
                                    placeholder="Enter your offer"
                                    autoFocus
                                />
                                {error && (
                                    <p className="text-red-500 text-sm mt-2">{error}</p>
                                )}
                            </div>

                            {/* Message */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Message (Optional)
                                </label>
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FACC15] focus:border-transparent outline-none"
                                    rows={3}
                                    placeholder="Add a message to the driver..."
                                />
                            </div>

                            <button
                                onClick={handleSubmit}
                                className="w-full py-4 bg-[#FACC15] text-black font-bold rounded-xl hover:bg-[#EAB308] transition shadow-lg"
                            >
                                Submit Counter Offer
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NegotiationModal;
