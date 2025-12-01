import React from 'react';

interface PickupConfirmationProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    rideDetails: {
        id: string;
        type: 'share' | 'hire';
        origin: string;
        destination: string;
        pickupLocation: string;
        pickupTime: string;
        acceptedPrice: number;
        driver: {
            name: string;
            phone: string;
            rating: number;
            vehicleModel?: string;
            vehiclePlate?: string;
        };
        paymentType: 'online' | 'physical';
    };
}

const PickupConfirmation: React.FC<PickupConfirmationProps> = ({
    isOpen,
    onClose,
    onConfirm,
    rideDetails
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 rounded-t-lg">
                    <div className="flex items-center gap-3 mb-2">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h2 className="text-2xl font-bold">Request Approved!</h2>
                    </div>
                    <p className="text-green-100">Your {rideDetails.type} request has been approved</p>
                </div>

                <div className="p-6">
                    {/* Trip Details */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                        <h3 className="font-medium text-gray-900 mb-3">Trip Details</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">From:</span>
                                <span className="font-medium text-gray-900">{rideDetails.origin}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">To:</span>
                                <span className="font-medium text-gray-900">{rideDetails.destination}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Pickup Location:</span>
                                <span className="font-medium text-gray-900">{rideDetails.pickupLocation}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Pickup Time:</span>
                                <span className="font-medium text-gray-900">{rideDetails.pickupTime}</span>
                            </div>
                            <div className="flex justify-between pt-2 border-t border-gray-200">
                                <span className="text-gray-900 font-medium">Total Amount:</span>
                                <span className="text-xl font-bold text-green-600">
                                    MWK {rideDetails.acceptedPrice.toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Driver Details */}
                    <div className="bg-blue-50 rounded-lg p-4 mb-6">
                        <h3 className="font-medium text-gray-900 mb-3">Driver Information</h3>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                {rideDetails.driver.name.charAt(0)}
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">{rideDetails.driver.name}</p>
                                <div className="flex items-center">
                                    {[...Array(5)].map((_, i) => (
                                        <svg
                                            key={i}
                                            className={`w-4 h-4 ${i < Math.floor(rideDetails.driver.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                        >
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    ))}
                                    <span className="text-sm text-gray-600 ml-1">{rideDetails.driver.rating}</span>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                <span className="text-gray-900">{rideDetails.driver.phone}</span>
                            </div>
                            {rideDetails.driver.vehicleModel && (
                                <div className="flex items-center gap-2">
                                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                                    </svg>
                                    <span className="text-gray-900">
                                        {rideDetails.driver.vehicleModel} ({rideDetails.driver.vehiclePlate})
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Payment Info */}
                    <div className={`rounded-lg p-4 mb-6 ${rideDetails.paymentType === 'online' ? 'bg-blue-50' : 'bg-green-50'
                        }`}>
                        <h3 className="font-medium text-gray-900 mb-2">Payment Method</h3>
                        <p className="text-sm text-gray-700">
                            {rideDetails.paymentType === 'online'
                                ? '💳 Online Payment (Airtel Money, Mpamba, or Bank)'
                                : '💵 Cash Payment at Pickup'}
                        </p>
                    </div>

                    {/* Important Notice */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                        <div className="flex gap-3">
                            <svg className="w-6 h-6 text-yellow-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <div>
                                <p className="font-medium text-yellow-900 mb-1">Important</p>
                                <p className="text-sm text-yellow-800">
                                    Please arrive at the pickup location on time. Contact the driver if you need to make any changes.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                        >
                            Close
                        </button>
                        <button
                            onClick={onConfirm}
                            className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                        >
                            Confirm Pickup
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PickupConfirmation;
