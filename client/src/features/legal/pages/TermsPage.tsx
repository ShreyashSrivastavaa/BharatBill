import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white p-8 sm:p-12 rounded-2xl shadow-sm border border-slate-200">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-blue-600 hover:text-blue-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Terms & Conditions</h1>
            <p className="text-xs text-slate-500">Last updated: November 2026</p>
          </div>
        </div>

        <div className="prose prose-sm text-slate-600 space-y-4 text-xs leading-relaxed">
          <p>
            Welcome to BharatBill ("the Platform", "we", "us", "our"). By registering for or using our GST billing and accounting services, you agree to be bound by the following Terms & Conditions.
          </p>

          <h2 className="text-sm font-bold text-slate-900 pt-4">1. Use of Services</h2>
          <p>
            BharatBill provides online GST-compliant invoicing, inventory tracking, reporting, and accounting management for Indian businesses. You agree to provide accurate business, PAN, and GSTIN information during registration.
          </p>

          <h2 className="text-sm font-bold text-slate-900 pt-4">2. Account Responsibility & Multi-Tenancy</h2>
          <p>
            You are responsible for maintaining the confidentiality of your login credentials and for all activities carried out under your business workspace.
          </p>

          <h2 className="text-sm font-bold text-slate-900 pt-4">3. Subscription & Billing</h2>
          <p>
            Subscription plans are billed in advance on a recurring monthly or annual basis via authorized payment gateways (Razorpay). Prices are listed in Indian Rupees (INR) and are inclusive/exclusive of applicable GST as indicated at checkout.
          </p>

          <h2 className="text-sm font-bold text-slate-900 pt-4">4. Compliance Disclaimer</h2>
          <p>
            BharatBill is an accounting tool that generates GST tax invoices. Users remain solely responsible for timely tax payments, GST filing, and accuracy of figures entered into the platform.
          </p>

          <h2 className="text-sm font-bold text-slate-900 pt-4">5. Governing Law & Jurisdiction</h2>
          <p>
            These terms are governed by the laws of India. Any disputes arising shall be subject to the exclusive jurisdiction of the competent courts in India.
          </p>
        </div>
      </div>
    </div>
  );
}
