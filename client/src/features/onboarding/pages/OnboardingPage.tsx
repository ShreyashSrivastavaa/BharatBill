import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBusinessStore } from '@/stores/businessStore';
import { INDIAN_STATES, BUSINESS_TYPES } from '@/lib/constants';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import {
  Building2,
  MapPin,
  Phone,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  Loader2,
} from 'lucide-react';

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { setCurrentBusiness, setBusinesses } = useBusinessStore();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [legalName, setLegalName] = useState('');
  const [type, setType] = useState('PROPRIETORSHIP');
  const [hasGstin, setHasGstin] = useState(true);
  const [gstin, setGstin] = useState('');
  const [pan, setPan] = useState('');

  const [state, setState] = useState('Maharashtra');
  const [stateCode, setStateCode] = useState('27');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [address, setAddress] = useState('');

  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [financialYearStart, setFinancialYearStart] = useState(4); // April

  const handleStateChange = (selectedStateName: string) => {
    setState(selectedStateName);
    const found = INDIAN_STATES.find((s) => s.name === selectedStateName);
    if (found) {
      setStateCode(found.gstCode);
      // Auto-prefix GSTIN state code if user hasn't typed much
      if (gstin.length < 2) {
        setGstin(found.gstCode);
      }
    }
  };

  const handleGstinChange = (val: string) => {
    const uppercase = val.toUpperCase().slice(0, 15);
    setGstin(uppercase);
    // Auto-extract PAN from GSTIN (chars 3 to 12)
    if (uppercase.length >= 12) {
      setPan(uppercase.slice(2, 12));
    }
    // Auto-detect state if first 2 digits match a state
    if (uppercase.length >= 2) {
      const code = uppercase.slice(0, 2);
      const found = INDIAN_STATES.find((s) => s.gstCode === code);
      if (found) {
        setState(found.name);
        setStateCode(found.gstCode);
      }
    }
  };

  const handleNext = () => {
    if (step === 1) {
      if (!name.trim()) {
        toast.error('Please enter your business trade name');
        return;
      }
      if (hasGstin && gstin && gstin.length !== 15) {
        toast.error('GSTIN must be exactly 15 characters');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!state || !stateCode) {
        toast.error('Please select your business state');
        return;
      }
      setStep(3);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        name: name.trim(),
        legalName: legalName.trim() || undefined,
        type,
        gstin: hasGstin && gstin ? gstin.trim().toUpperCase() : undefined,
        pan: pan ? pan.trim().toUpperCase() : undefined,
        state,
        stateCode,
        city: city.trim() || undefined,
        pincode: pincode.trim() || undefined,
        address: address.trim() || undefined,
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        financialYearStart,
      };

      const { data } = await api.post('/businesses', payload);
      const createdBusiness = data.data;

      // Update state stores
      setCurrentBusiness(createdBusiness);
      setBusinesses([createdBusiness]);

      toast.success('🎉 Business setup complete! Welcome to BharatBill.');
      navigate('/app/dashboard');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to save business details. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-md">
              ₹
            </div>
            <span className="text-2xl font-bold tracking-tight text-slate-900">
              Bharat<span className="text-blue-600">Bill</span>
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome! Set up your business profile</h1>
          <p className="mt-1 text-sm text-slate-600">
            This information will appear on your GST tax invoices and reports.
          </p>
        </div>

        {/* Stepper Progress */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-8">
          <div className="grid grid-cols-3 gap-2">
            <div
              className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                step === 1
                  ? 'bg-blue-50 border border-blue-200 text-blue-700'
                  : step > 1
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'text-slate-400'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                  step === 1
                    ? 'bg-blue-600 text-white'
                    : step > 1
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                {step > 1 ? <CheckCircle2 className="w-4 h-4" /> : '1'}
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-medium">Step 1</p>
                <p className="text-sm font-semibold">Business Info</p>
              </div>
            </div>

            <div
              className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                step === 2
                  ? 'bg-blue-50 border border-blue-200 text-blue-700'
                  : step > 2
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'text-slate-400'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                  step === 2
                    ? 'bg-blue-600 text-white'
                    : step > 2
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                {step > 2 ? <CheckCircle2 className="w-4 h-4" /> : '2'}
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-medium">Step 2</p>
                <p className="text-sm font-semibold">Address & State</p>
              </div>
            </div>

            <div
              className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                step === 3
                  ? 'bg-blue-50 border border-blue-200 text-blue-700'
                  : 'text-slate-400'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                  step === 3 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
                }`}
              >
                3
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-medium">Step 3</p>
                <p className="text-sm font-semibold">Contact & FY</p>
              </div>
            </div>
          </div>
        </div>

        {/* Wizard Form and Live Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Form */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200">
            {step === 1 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2 text-slate-900 font-semibold text-lg">
                  <Building2 className="w-5 h-5 text-blue-600" />
                  Business Identity
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Business / Trade Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Sharma Traders"
                    className="mt-1 block w-full px-3 py-2.5 sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Legal Name (if different)
                  </label>
                  <input
                    type="text"
                    value={legalName}
                    onChange={(e) => setLegalName(e.target.value)}
                    placeholder="e.g. Sharma Traders Private Limited"
                    className="mt-1 block w-full px-3 py-2.5 sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-slate-900"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700">
                      Business Type
                    </label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="mt-1 block w-full px-3 py-2.5 sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-slate-900 bg-white"
                    >
                      {BUSINESS_TYPES.map((bt) => (
                        <option key={bt.value} value={bt.value}>
                          {bt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <div className="flex justify-between items-center">
                      <label className="block text-sm font-medium text-slate-700">
                        GSTIN Registered?
                      </label>
                      <button
                        type="button"
                        onClick={() => setHasGstin(!hasGstin)}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        {hasGstin ? 'I don\'t have GSTIN' : 'I have GSTIN'}
                      </button>
                    </div>
                    {hasGstin ? (
                      <input
                        type="text"
                        maxLength={15}
                        value={gstin}
                        onChange={(e) => handleGstinChange(e.target.value)}
                        placeholder="27AADCB2230M1Z2"
                        className="mt-1 block w-full px-3 py-2.5 sm:text-sm font-mono uppercase border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-slate-900"
                      />
                    ) : (
                      <div className="mt-1 px-3 py-2.5 bg-slate-100 rounded-xl text-xs text-slate-500">
                        Unregistered / Composition scheme
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    PAN Number
                  </label>
                  <input
                    type="text"
                    maxLength={10}
                    value={pan}
                    onChange={(e) => setPan(e.target.value.toUpperCase())}
                    placeholder="AADCB2230M"
                    className="mt-1 block w-full px-3 py-2.5 sm:text-sm font-mono uppercase border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-slate-900"
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2 text-slate-900 font-semibold text-lg">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  Address & Tax Jurisdiction
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-slate-700">
                      State *
                    </label>
                    <select
                      value={state}
                      onChange={(e) => handleStateChange(e.target.value)}
                      className="mt-1 block w-full px-3 py-2.5 sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-slate-900 bg-white"
                    >
                      {INDIAN_STATES.map((s) => (
                        <option key={s.gstCode} value={s.name}>
                          {s.name} ({s.gstCode})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700">
                      State Code
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={stateCode}
                      className="mt-1 block w-full px-3 py-2.5 sm:text-sm bg-slate-100 border border-slate-300 rounded-xl font-mono text-center font-bold text-slate-700"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700">City</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Mumbai"
                      className="mt-1 block w-full px-3 py-2.5 sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700">Pincode</label>
                    <input
                      type="text"
                      maxLength={6}
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      placeholder="400001"
                      className="mt-1 block w-full px-3 py-2.5 sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Shop / Office Address
                  </label>
                  <textarea
                    rows={3}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Shop No. 12, APMC Market, Vashi"
                    className="mt-1 block w-full px-3 py-2 sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-slate-900"
                  />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2 text-slate-900 font-semibold text-lg">
                  <Phone className="w-5 h-5 text-blue-600" />
                  Contact & Invoicing Preferences
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700">
                      Business Phone
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="9876543210"
                      className="mt-1 block w-full px-3 py-2.5 sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700">
                      Billing Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="billing@sharmatraders.in"
                      className="mt-1 block w-full px-3 py-2.5 sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Financial Year Cycle
                  </label>
                  <div className="mt-1 p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-blue-900">
                        Standard Indian Financial Year (April 1 to March 31)
                      </p>
                      <p className="text-xs text-blue-700 mt-0.5">
                        Invoices will be sequentially numbered per financial year (e.g. FY 2026-27).
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3">
                  <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-emerald-900">
                      Includes 30-Day Free Trial (Starter Plan)
                    </p>
                    <p className="text-xs text-emerald-700 mt-0.5">
                      Full access to GST billing, stock management, and reports. No card required.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="mt-8 pt-4 border-t border-slate-100 flex justify-between items-center">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
              ) : (
                <div />
              )}

              {step < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-colors"
                >
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-colors disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Setting up...
                    </>
                  ) : (
                    <>
                      Complete Setup & Open Dashboard
                      <CheckCircle2 className="w-4 h-4" />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Live Preview Card */}
          <div className="lg:col-span-5">
            <div className="sticky top-6">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Live Invoice Header Preview
              </p>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div className="border-b border-slate-100 pb-4 mb-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">
                        {name || 'Your Business Name'}
                      </h3>
                      {legalName && (
                        <p className="text-xs text-slate-500 mt-0.5">{legalName}</p>
                      )}
                    </div>
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded">
                      TAX INVOICE
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600">
                  {address && <p>{address}</p>}
                  <p>
                    {city ? `${city}, ` : ''}
                    {state} {pincode ? `- ${pincode}` : ''}
                  </p>
                  <p className="font-semibold text-slate-800">
                    State Code: <span className="font-mono">{stateCode}</span>
                  </p>
                  {hasGstin && gstin && (
                    <p className="font-semibold text-slate-800">
                      GSTIN: <span className="font-mono text-blue-700">{gstin}</span>
                    </p>
                  )}
                  {pan && (
                    <p className="text-slate-600">
                      PAN: <span className="font-mono">{pan}</span>
                    </p>
                  )}
                  {phone && <p>Phone: {phone}</p>}
                  {email && <p>Email: {email}</p>}
                </div>

                <div className="mt-6 pt-4 border-t border-dashed border-slate-200 flex justify-between text-xs text-slate-400">
                  <span>Invoice No: INV-000001</span>
                  <span>Date: {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
