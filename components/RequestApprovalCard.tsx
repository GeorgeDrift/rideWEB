import React, { useState } from 'react';

interface RequestApprovalCardProps {
    request: {
        id: string;
        type: 'share' | 'hire';
        origin: string;
        destination: string;
        offeredPrice: number;
        date: string;
        time?: string;
        rider: {
            name: string;
            rating: number;
            phone: string;
            avatar?: string;
        };
        negotiations?: Array<{
            offeredPrice: number;
            message: string;
            createdAt: string;
        }>;
    };
    onApprove: (requestId: string, counterOffer?: number) => void;
    onReject: (requestId: string) => void;
    onCounterOffer: (requestId: string, price: number, message: string) => void;
}

const RequestApprovalCard: React.FC<RequestApprovalCardProps> = ({
    request,
    onApprove,
    onReject,
    onCounterOffer
}) => {
    const [showCounterOffer, setShowCounterOffer] = useState(false);
    const [counterPrice, setCounterPrice] = useState(request.offeredPrice);
    const [counterMessage, setCounterMessage] = useState('');

    const handleCounterOffer = () => {
        onCounterOffer(request.id, counterPrice, counterMessage);
        setShowCounterOffer(false);
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6 mb-4 border-l-4 border-blue-500">
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
                <div>
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-2">
                        {request.type === 'share' ? 'Ride Share' : 'For Hire'}
                    </span>
                    <h3 className="text-lg font-bold text-gray-900">
                        {request.origin} → {request.destination}
                    </h3>
                    <p className="text-sm text-gray-600">
                        {request.date} {request.time && `at ${request.time}`}
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-gray-600">Offered Price</p>
                    <p className="text-2xl font-bold text-green-600">
                        MWK {request.offeredPrice.toLocaleString()}
                    </p>
                </div>
            </div>

            {/* Rider Info */}
            <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {request.rider.name.charAt(0)}
                </div>
                <div className="flex-1">
                    <p className="font-medium text-gray-900">{request.rider.name}</p>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                                <svg
                                    key={i}
                                    className={`w-4 h-4 ${i < Math.floor(request.rider.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                            ))}
                            <span className="text-sm text-gray-600 ml-1">{request.rider.rating}</span>
                        </div>
                        <span className="text-sm text-gray-500">• {request.rider.phone}</span>
                    </div>
                </div>
            </div>

            {/* Negotiation History */}
            {request.negotiations && request.negotiations.length > 0 && (
                <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Previous Offers:</p>
                    <div className="space-y-2">
                        {request.negotiations.slice(0, 2).map((neg, idx) => (
                            <div key={idx} className="text-sm bg-gray-50 p-2 rounded">
                                <span className="font-medium">MWK {neg.offeredPrice.toLocaleString()}</span>
                                {neg.message && <span className="text-gray-600"> - {neg.message}</span>}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Counter Offer Section */}
            {showCounterOffer ? (
                <div className="mb-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <h4 className="font-medium text-gray-900 mb-3">Make Counter Offer</h4>
                    <div className="grid gap-3 mb-3">
                        <div>
                            <label className="block text-sm text-gray-700 mb-1">Counter Price (MWK)</label>
                            <input
                                type="number"
                                value={counterPrice}
                                onChange={(e) => setCounterPrice(Number(e.target.value))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-700 mb-1">Message (Optional)</label>
                            <textarea
                                value={counterMessage}
                                onChange={(e) => setCounterMessage(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                rows={2}
                                placeholder="Explain your counter offer..."
                            />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowCounterOffer(false)}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleCounterOffer}
                            className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                        >
                            Send Counter Offer
                        </button>
                    </div>
                </div>
            ) : (
                /* Action Buttons */
                <div className="flex gap-3">
                    <button
                        onClick={() => onReject(request.id)}
                        className="flex-1 px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition font-medium"
                    >
                        Decline
                    </button>
                    <button
                        onClick={() => setShowCounterOffer(true)}
                        className="flex-1 px-4 py-2 border border-yellow-300 text-yellow-700 rounded-lg hover:bg-yellow-50 transition font-medium"
                    >
                        Counter Offer
                    </button>
                    <button
                        onClick={() => onApprove(request.id)}
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                    >
                        Accept
                    </button>
                </div>
            )}
        </div>
    );
};

export default RequestApprovalCard;
