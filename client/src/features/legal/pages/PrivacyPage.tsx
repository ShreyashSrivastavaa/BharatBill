import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';

export default function PrivacyPage() {
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
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Privacy Policy</h1>
            <p className="text-xs text-slate-500">In compliance with Digital Personal Data Protection (DPDP) Act, 2023</p>
          </div>
        </div>

        <div className="prose prose-sm text-slate-600 space-y-4 text-xs leading-relaxed">
          <p>
            BharatBill is committed to safeguarding the privacy and confidential financial data of our users, their clients, and associated parties.
          </p>

          <h2 className="text-sm font-bold text-slate-900 pt-4">1. Data We Collect</h2>
          <p>
            We collect personal identity details (Name, Email, Mobile number), business registration details (Business Legal Name, GSTIN, State code, Address), and commercial invoice data (item transactions, pricing, payments).
          </p>

          <h2 className="text-sm font-bold text-slate-900 pt-4">2. Purpose of Collection</h2>
          <p>
            Information collected is strictly utilized to render invoicing services, compute authoritative GST tax breakdowns, generate GSTR-1 compatible reports, and process subscription payments.
          </p>

          <h2 className="text-sm font-bold text-slate-900 pt-4">3. Data Isolation & Security</h2>
          <p>
            All tenant records are logically partitioned using multi-tenant architecture and authenticated with cryptographic JWTs and hashed passwords (Argon2id). Data is encrypted in transit via TLS/HTTPS.
          </p>

          <h2 className="text-sm font-bold text-slate-900 pt-4">4. Data Deletion & Export</h2>
          <p>
            Users maintain the right to export their customer, sales, and purchase records at any time or request complete account erasure by contacting privacy@bharatbill.in.
          </p>
        </div>
      </div>
    </div>
  );
}
