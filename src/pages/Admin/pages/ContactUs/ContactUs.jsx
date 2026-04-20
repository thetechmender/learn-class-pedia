import React, { useState, useCallback, useEffect } from 'react';
import { useToast } from '../../../../hooks/utils/useToast';
import { useContactUs } from '../../../../hooks/api/useContactUs';
import { Search, X, Mail, Phone, User, MessageSquare, Calendar, Filter, Inbox, Eye, ChevronDown, ChevronUp } from 'lucide-react';
import AdminPageLayout from '../../../../components/AdminPageLayout';

const ContactUs = () => {
  const { toast } = useToast();
  const {
    contactList,
    inquiryOptions,
    loading,
    error,
    filters,
    fetchContactInformation,
    fetchInquiryOptions,
    updateFilters,
    clearFilters,
    applyFilters,
  } = useContactUs();

  const [showFilters, setShowFilters] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [expandedRows, setExpandedRows] = useState({});

  // Initial fetch
  useEffect(() => {
    fetchContactInformation();
    fetchInquiryOptions();
  }, [fetchContactInformation, fetchInquiryOptions]);

  // Handle filter input changes
  const handleFilterChange = useCallback((field, value) => {
    updateFilters({ [field]: value });
  }, [updateFilters]);

  // Apply filters
  const handleApplyFilters = useCallback(() => {
    applyFilters();
  }, [applyFilters]);

  // Clear all filters
  const handleClearFilters = useCallback(() => {
    clearFilters();
    fetchContactInformation();
  }, [clearFilters, fetchContactInformation]);

  // Toggle row expansion
  const toggleRowExpand = (id) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Get inquiry type color
  const getInquiryColor = (inquiryName) => {
    const colors = {
      'Personal Guidance': 'bg-purple-100 text-purple-700 border-purple-200',
      'Custom Course Planning': 'bg-blue-100 text-blue-700 border-blue-200',
      'Pricing Model': 'bg-green-100 text-green-700 border-green-200',
      'Team Plan': 'bg-orange-100 text-orange-700 border-orange-200',
      'Upgrading Subscription': 'bg-pink-100 text-pink-700 border-pink-200',
      'Technical Glitches': 'bg-red-100 text-red-700 border-red-200',
      'Other Problem': 'bg-gray-100 text-gray-700 border-gray-200',
    };
    return colors[inquiryName] || 'bg-slate-100 text-slate-700 border-slate-200';
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Format phone number with country code
  const formatPhone = (countryCode, phoneNumber) => {
    if (!phoneNumber) return 'N/A';
    const code = countryCode ? `+${countryCode} ` : '';
    return `${code}${phoneNumber}`;
  };

  // Count active filters
  const activeFilterCount = Object.values(filters).filter(v => v && v.toString().trim() !== '').length;

  return (
    <AdminPageLayout
      title="Contact Inquiries"
      subtitle={`${contactList.length} inquiry${contactList.length !== 1 ? 'ies' : 'y'} received`}
      icon={Inbox}
      loading={loading}
    >
      {/* Toast Notification */}
      {toast.show && (
        <div
          className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ${
            toast.type === 'success'
              ? 'bg-green-500 text-white'
              : 'bg-red-500 text-white'
          }`}
        >
          <div className="flex items-center space-x-2">
            <span className="font-medium">{toast.message}</span>
          </div>
        </div>
      )}

      {/* Filters Section */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 mb-6">
        <div className="flex flex-col xl:flex-row xl:justify-end gap-4">
          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-colors duration-200 shadow-sm ${
              showFilters
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
            {showFilters && (
              <span className="ml-2 px-2 py-1 bg-white/20 rounded-full text-xs">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-6 border-t border-gray-200 animate-fadeIn">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Full Name</label>
              <input
                type="text"
                placeholder="Enter full name"
                value={filters.fullName}
                onChange={(e) => handleFilterChange('fullName', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Email Address</label>
              <input
                type="text"
                placeholder="Enter email address"
                value={filters.emailAddress}
                onChange={(e) => handleFilterChange('emailAddress', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Phone Number</label>
              <input
                type="text"
                placeholder="Enter phone number"
                value={filters.phoneNumber}
                onChange={(e) => handleFilterChange('phoneNumber', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Inquiry Type</label>
              <select
                value={filters.inquiryOptionId}
                onChange={(e) => handleFilterChange('inquiryOptionId', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
              >
                <option value="">All Types</option>
                {inquiryOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Contact Cards */}
      {contactList.length > 0 ? (
        <div className="space-y-4">
          {contactList.map((contact) => {
            const isExpanded = expandedRows[contact.id];
            const inquiryClass = getInquiryColor(contact.inquiryOptionName);

            return (
              <div
                key={contact.id}
                className={`bg-white rounded-xl shadow-sm border transition-all duration-200 overflow-hidden ${
                  isExpanded ? 'border-blue-300 shadow-md' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {/* Card Header - Always Visible */}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    {/* Left: Avatar & Main Info */}
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg">
                        {contact.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="text-lg font-semibold text-gray-900">{contact.fullName}</h3>
                          <span className={`px-3 py-1 text-xs font-medium rounded-full border ${inquiryClass}`}>
                            {contact.inquiryOptionName || 'General Inquiry'}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-1 mt-2 text-sm text-gray-600">
                          <div className="flex items-center gap-1.5">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span className="truncate">{contact.emailaddress}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span>{formatPhone(contact.countryCode, contact.phoneNumber)}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span>{formatDate(contact.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleRowExpand(contact.id)}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title={isExpanded ? 'Collapse' : 'View message'}
                      >
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Message Preview (when collapsed) */}
                  {!isExpanded && (
                    <div className="mt-3 pl-16">
                      <p className="text-gray-600 text-sm line-clamp-2">{contact.message}</p>
                    </div>
                  )}
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="border-t border-gray-100 bg-gray-50/50 px-5 py-4">
                    <div className="pl-16">
                      <div className="flex items-center gap-2 mb-3">
                        <MessageSquare className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-gray-700">Message</span>
                      </div>
                      <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                        <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{contact.message}</p>
                      </div>
                      <div className="mt-4 flex justify-end">
                        <button
                          onClick={() => toggleRowExpand(contact.id)}
                          className="text-sm text-gray-500 hover:text-gray-700 font-medium"
                        >
                          Show Less
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <Inbox className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No contact inquiries found
          </h3>
          <p className="text-gray-500 max-w-md mx-auto">
            {filters.fullName || filters.emailAddress || filters.phoneNumber || filters.inquiryOptionId
              ? 'Try adjusting your search filters to find what you\'re looking for.'
              : 'When students submit contact forms, they will appear here.'}
          </p>
          {(filters.fullName || filters.emailAddress || filters.phoneNumber || filters.inquiryOptionId) && (
            <button
              onClick={handleClearFilters}
              className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
            >
              Clear All Filters
            </button>
          )}
        </div>
      )}

      {/* Full Detail Modal */}
      {selectedContact && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                  {selectedContact.fullName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{selectedContact.fullName}</h3>
                  <p className="text-sm text-gray-500">Contact Inquiry #{selectedContact.id}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedContact(null)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Email</label>
                  <div className="flex items-center gap-2 text-gray-900">
                    <Mail className="w-4 h-4 text-blue-600" />
                    {selectedContact.emailaddress}
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Phone</label>
                  <div className="flex items-center gap-2 text-gray-900">
                    <Phone className="w-4 h-4 text-blue-600" />
                    {formatPhone(selectedContact.countryCode, selectedContact.phoneNumber)}
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Inquiry Type</label>
                <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full border ${getInquiryColor(selectedContact.inquiryOptionName)}`}>
                  {selectedContact.inquiryOptionName || 'General Inquiry'}
                </span>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Message
                </label>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{selectedContact.message}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  Submitted on {formatDate(selectedContact.createdAt)}
                </div>
              </div>
            </div>

            <div className="flex justify-end p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
              <button
                onClick={() => setSelectedContact(null)}
                className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminPageLayout>
  );
};

export default ContactUs;
