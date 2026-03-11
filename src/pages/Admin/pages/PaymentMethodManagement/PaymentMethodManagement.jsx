import React, { useState, useEffect, useCallback } from 'react';
import { CreditCard, Users, RefreshCw, AlertCircle, Shield, Calendar, Mail, MapPin, Star, CheckCircle } from 'lucide-react';
import useStudentOrderManagement from '../../../../hooks/api/useStudentOrderManagement';
import AdminPageLayout from '../../../../components/AdminPageLayout';

const PaymentMethodManagement = () => {
  const {
    loading,
    error,
    paymentMethods,
    getPaymentMethods,
    clearError
  } = useStudentOrderManagement();

  // Load payment methods on component mount
  useEffect(() => {
    getPaymentMethods();
  }, [getPaymentMethods]);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    try {
      await getPaymentMethods();
    } catch (err) {
      console.error('Failed to refresh payment methods:', err);
    }
  }, [getPaymentMethods]);

  return (
    <AdminPageLayout
      title="Payment Methods"
      description="Manage payment methods and billing information"
    >
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Payment Methods
          </h2>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <div>
                <h3 className="font-medium">Error</h3>
                <p>{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600 dark:text-gray-400">Loading payment methods...</span>
          </div>
        )}

        {/* Payment Methods List */}
        {!loading && !error && paymentMethods.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Payment Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Card Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Bank Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Contact Info
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Created
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {paymentMethods.map((method) => (
                    <tr key={method.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center">
                            <Users className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {method.customerFullName}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              ID: {method.customerId}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <Shield className="w-4 h-4 text-blue-500" />
                          <span className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            {method.paymentTypeName || 'Credit Card'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {method.cardBrand && (
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <CreditCard className="w-4 h-4 text-green-500" />
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {method.cardBrand}
                              </span>
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                              {method.cardHolderName}
                            </div>
                            <div className="text-xs font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                              ••••• {method.cardNumber.slice(-4)}
                            </div>
                            {method.cardExpiryMonth && method.cardExpiryYear && (
                              <div className="text-xs text-orange-600 dark:text-orange-400 flex items-center space-x-1">
                                <Calendar className="w-3 h-3" />
                                <span>Expires: {method.cardExpiryMonth}/{method.cardExpiryYear}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {method.bankName && (
                          <div className="space-y-2">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {method.bankName}
                            </div>
                            <div className="text-xs font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                              {method.bankAccountNumber}
                            </div>
                            {method.bankRoutingNumber && (
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                Routing: {method.bankRoutingNumber}
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2 text-sm text-gray-900 dark:text-white">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span>{method.email}</span>
                          </div>
                          {(method.address || method.city || method.state || method.zip) && (
                            <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                              <MapPin className="w-3 h-3" />
                              <span>
                                {method.city && method.city}
                                {method.state && `, ${method.state}`}
                                {method.zip && ` ${method.zip}`}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {method.isDefault ? (
                            <>
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              <span className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                Default
                              </span>
                            </>
                          ) : (
                            <>
                              <Star className="w-4 h-4 text-gray-400" />
                              <span className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                                Secondary
                              </span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span>{new Date(method.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(method.createdAt).toLocaleTimeString()}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && paymentMethods.length === 0 && (
          <div className="text-center py-12">
            <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-full inline-block mb-3">
              <CreditCard className="w-8 h-8 text-gray-400 dark:text-gray-500" />
            </div>
            <p className="text-gray-600 dark:text-gray-300 font-medium">No payment methods found</p>
          </div>
        )}
      </div>
    </AdminPageLayout>
  );
};

export default PaymentMethodManagement;
