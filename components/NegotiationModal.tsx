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
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-lg">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-2xl font-bold">Negotiate Price</h2>
                            <p className="text-blue-100 mt-1">
                                {vehicleDetails.type === 'share'
                                    ? `${vehicleDetails.origin} → ${vehicleDetails.destination}`
                                    : vehicleDetails.name}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white hover:bg-blue-800 rounded-full p-2 transition"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="p-6">
                    {/* Original Price */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Original Price:</span>
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

                    {/* Offer Input */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Your Offer (MWK)
                        </label>
                        <input
                            type="number"
                            value={offeredPrice}
                            onChange={(e) => setOfferedPrice(Number(e.target.value))}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                            placeholder="Enter your offer"
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
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            rows={3}
                            placeholder="Add a message to the driver..."
                        />
                    </div>

                    {/* Negotiation History */}
                    {negotiationHistory.length > 0 && (
                        <div className="mb-6">
                            <h3 className="text-sm font-medium text-gray-700 mb-3">Negotiation History</h3>
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                {negotiationHistory.map((item, index) => (
                                    <div key={index} className="bg-gray-50 rounded-lg p-3 text-sm">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="font-medium text-gray-900">
                                                {item.offeredBy === 'You' ? 'You' : 'Driver'}
                                            </span>
                                            <span className="text-blue-600 font-semibold">
                                                MWK {item.offeredPrice.toLocaleString()}
                                            </span>
                                        </div>
                                        {item.message && (
                                            <p className="text-gray-600 text-xs">{item.message}</p>
                                        )}
                                        <span className={`text-xs ${item.status === 'accepted' ? 'text-green-600' :
                                            item.status === 'rejected' ? 'text-red-600' :
                                                'text-gray-500'
                                            }`}>
                                            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                        >
                            Submit Offer
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NegotiationModal;
