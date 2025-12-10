
import React, { useState, useEffect } from 'react';
import { ApiService } from '../services/api';

interface SubscriptionPlan {
    id: number;
    name: string;
    price: number;
    duration: number;
    description: string;
    isActive: boolean;
}

export const SubscriptionManagement: React.FC = () => {
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCreateMode, setIsCreateMode] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        duration: '',
        description: ''
    });

    useEffect(() => {
        loadPlans();
    }, []);

    const loadPlans = async () => {
        try {
            setLoading(true);
            const response = await ApiService.getSubscriptionPlans();
            // Ensure we handle both response formats (plan object or array)
            if (response.plans) {
                // Check if it's the old object format or new array format
                if (Array.isArray(response.plans)) {
                    setPlans(response.plans);
                } else {
                    // Convert old object format to array if necessary (fallback)
                    setPlans(Object.values(response.plans));
                }
            } else if (Array.isArray(response)) {
                setPlans(response);
            }
        } catch (error) {
            console.error('Failed to load plans', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (plan: SubscriptionPlan) => {
        setEditingPlan(plan);
        setFormData({
            name: plan.name,
            price: plan.price.toString(),
            duration: plan.duration.toString(),
            description: plan.description || ''
        });
        setIsCreateMode(false);
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setFormData({
            name: '',
            price: '',
            duration: '30',
            description: ''
        });
        setIsCreateMode(true);
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                name: formData.name,
                price: parseFloat(formData.price),
                duration: parseInt(formData.duration),
                description: formData.description
            };

            if (isCreateMode) {
                await ApiService.createSubscriptionPlan(payload);
            } else if (editingPlan) {
                await ApiService.updateSubscriptionPlan(editingPlan.id, payload);
            }

            setIsModalOpen(false);
            loadPlans();
        } catch (error) {
            console.error('Failed to save plan', error);
            alert('Failed to save plan');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Subscription Plans</h1>
                <button
                    onClick={handleCreate}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                >
                    + Add New Plan
                </button>
            </div>

            {loading ? (
                <div className="text-center py-10">Loading plans...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {plans.map((plan) => (
                        <div key={plan.id} className="bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700 p-6 shadow-sm">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{plan.name}</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{plan.duration} Days</p>
                                </div>
                                <span className={`px-2 py-1 text-xs rounded-full ${plan.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {plan.isActive ? 'Active' : 'Inactive'}
                                </span>
                            </div>

                            <div className="text-2xl font-bold text-primary-600 mb-4">
                                MWK {plan.price.toLocaleString()}
                            </div>

                            <p className="text-gray-600 dark:text-gray-300 text-sm mb-6 min-h-[40px]">
                                {plan.description}
                            </p>

                            <button
                                onClick={() => handleEdit(plan)}
                                className="w-full py-2 border border-gray-300 dark:border-dark-600 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-dark-700 transition"
                            >
                                Edit Plan
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-dark-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
                        <div className="p-6 border-b border-gray-100 dark:border-dark-700">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                {isCreateMode ? 'Create New Plan' : 'Edit Plan'}
                            </h2>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Plan Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price (MWK)</label>
                                    <input
                                        type="number"
                                        required
                                        value={formData.price}
                                        onChange={e => setFormData({ ...formData, price: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Duration (Days)</label>
                                    <input
                                        type="number"
                                        required
                                        value={formData.duration}
                                        onChange={e => setFormData({ ...formData, duration: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                                <textarea
                                    rows={3}
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none resize-none"
                                />
                            </div>

                            <div className="flex space-x-3 mt-6 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-dark-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-700 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-medium"
                                >
                                    {isCreateMode ? 'Create Plan' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
