import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, RefreshCw } from 'lucide-react';

export default function RefundPolicyPage() {
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
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <RefreshCw className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Refund & Cancellation Policy</h1>
            <p className="text-xs text-slate-500">Merchant standard policy for Razorpay Payment Gateway</p>
          </div>
        </div>

        <div className="prose prose-sm text-slate-600 space-y-4 text-xs leading-relaxed">
          <p>
            BharatBill is a software-as-a-service (SaaS) subscription platform. Please read our cancellation and refund policies carefully before subscribing.
          </p>

          <h2 className="text-sm font-bold text-slate-900 pt-4">1. 7-Day Money Back Guarantee</h2>
          <p>
            If you are dissatisfied with BharatBill for any technical reason, you can request a 100% refund within 7 days of initial subscription activation.
          </p>

          <h2 className="text-sm font-bold text-slate-900 pt-4">2. Subscription Cancellation</h2>
          <p>
            You may cancel your monthly or annual subscription at any time via the billing settings. Once cancelled, your account will remain active until the end of the current billing cycle without further renewal charges.
          </p>

          <h2 className="text-sm font-bold text-slate-900 pt-4">3. Refund Processing</h2>
          <p>
            Approved refunds will be initiated within 5 to 7 business days and credited directly to the original payment source (UPI / NetBanking / Debit Card / Credit Card) through Razorpay.
          </p>

          <h2 className="text-sm font-bold text-slate-900 pt-4">4. Contact Information</h2>
          <p>
            For any billing inquiries, cancellation requests, or assistance, contact our support team at billing@bharatbill.in.
          </p>
        </div>
      </div>
    </div>
  );
}
