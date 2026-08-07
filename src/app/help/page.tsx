'use client';

import { useState } from 'react';
import { 
  QuestionMarkCircleIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  BookOpenIcon,
  PhoneIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const faqs = [
    {
      question: "How do I reset my password?",
      answer: "You can reset your password by going to Settings > Security > Change Password. You'll receive a reset link via email.",
      category: "Account"
    },
    {
      question: "How do I enable two-factor authentication?",
      answer: "Navigate to your Profile > Security tab and click 'Enable' next to Two-Factor Authentication. Follow the setup instructions.",
      category: "Security"
    },
    {
      question: "How do I manage notifications?",
      answer: "Go to your Profile > Notifications tab to customize your notification preferences for emails and system updates.",
      category: "Settings"
    },
    {
      question: "How do I export my data?",
      answer: "You can export your data from the Settings page. Go to Settings > Data Management > Export Data.",
      category: "Data"
    },
    {
      question: "How do I add new users to the system?",
      answer: "Navigate to User Management > Register User to add new users to the system. You'll need administrator privileges.",
      category: "User Management"
    },
    {
      question: "How do I check system health?",
      answer: "You can check system health from the dashboard or go to Settings > System Health for detailed information.",
      category: "System"
    }
  ];

  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const supportChannels = [
    {
      title: "Live Chat",
      description: "Get instant help from our support team",
      icon: ChatBubbleLeftRightIcon,
      color: "bg-blue-500",
      action: "Start Chat"
    },
    {
      title: "Email Support",
      description: "Send us a detailed message",
      icon: EnvelopeIcon,
      color: "bg-green-500",
      action: "Send Email"
    },
    {
      title: "Phone Support",
      description: "Call us during business hours",
      icon: PhoneIcon,
      color: "bg-purple-500",
      action: "Call Now"
    },
    {
      title: "Documentation",
      description: "Browse our comprehensive guides",
      icon: BookOpenIcon,
      color: "bg-orange-500",
      action: "View Docs"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <QuestionMarkCircleIcon className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Help</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Support Channels Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-4">
              {supportChannels.map((channel, index) => (
                <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className={`p-2 rounded-lg ${channel.color} text-white`}>
                      <channel.icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 text-sm">{channel.title}</h3>
                      <p className="text-xs text-gray-600">{channel.description}</p>
                    </div>
                  </div>
                  <button className="w-full bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium">
                    {channel.action}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ Section */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Frequently Asked Questions</h2>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search FAQ..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                  <QuestionMarkCircleIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </div>

              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {filteredFaqs.map((faq, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-all duration-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 text-sm mb-2">{faq.question}</h3>
                        <p className="text-xs text-gray-600 leading-relaxed">{faq.answer}</p>
                      </div>
                      <span className="ml-4 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                        {faq.category}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 