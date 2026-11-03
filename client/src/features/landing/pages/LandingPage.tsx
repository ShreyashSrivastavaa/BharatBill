import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  FileText,
  Package,
  Users,
  BarChart3,
  Smartphone,
  Sparkles,
  ChevronRight,
  TrendingUp,
  Receipt,
  Layers,
  HelpCircle,
} from 'lucide-react';

export default function LandingPage() {
  const plans = [
    {
      name: 'Starter',
      price: '₹99',
      period: '/month',
      description: 'Ideal for small retail shops, independent traders and single counters.',
      popular: false,
      features: [
        'GST Compliant Invoicing',
        'Up to 100 Products',
        'Up to 50 Invoices / month',
        'Customer Directory',
        'Standard PDF Invoice Printing',
        'Email Support',
      ],
      cta: 'Start 30-Day Free Trial',
    },
    {
      name: 'Business',
      price: '₹199',
      period: '/month',
      description: 'Perfect for fast-growing wholesalers, hardware and electronics traders.',
      popular: true,
      features: [
        'Everything in Starter',
        'Unlimited Invoices & Products',
        'Up to 3 Staff User Accounts',
        'Purchase & Supplier Management',
        'Automated Stock Alerts',
        'Detailed Sales & GST Reports',
        'Priority WhatsApp & Email Support',
      ],
      cta: 'Start 30-Day Free Trial',
    },
    {
      name: 'Professional',
      price: '₹399',
      period: '/month',
      description: 'For established distributors with multiple counters and staff members.',
      popular: false,
      features: [
        'Everything in Business',
        'Up to 10 Staff Members',
        'Multiple Business Profiles',
        'Customer Ledger & Payment Tracking',
        'Custom Invoice Brand Logo & Terms',
        'Advanced Profit & Tax Analytics',
        'Dedicated Account Manager',
      ],
      cta: 'Start 30-Day Free Trial',
    },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-blue-600 selection:text-white">
      {/* ─── Top Navbar ──────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                ₹
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">
                Bharat<span className="text-blue-600">Bill</span>
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
              <a href="#features" className="hover:text-blue-600 transition-colors">
                Features
              </a>
              <a href="#preview" className="hover:text-blue-600 transition-colors">
                Preview
              </a>
              <a href="#pricing" className="hover:text-blue-600 transition-colors">
                Pricing
              </a>
              <a href="#faq" className="hover:text-blue-600 transition-colors">
                FAQ
              </a>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm font-semibold text-slate-700 hover:text-slate-900 px-3.5 py-2 rounded-xl transition-colors"
            >
              Log in
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl shadow-sm transition-colors"
            >
              Start Free Trial
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* ─── Hero Section ────────────────────────────────────────────────────── */}
      <section className="pt-16 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-blue-50/40 via-white to-white text-center">
        <div className="max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-6">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>GST Ready • Made for Indian Businesses</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-950 tracking-tight leading-[1.15]">
            GST Billing & Business Management for{' '}
            <span className="text-blue-600">Indian Businesses</span>
          </h1>

          {/* Subtext */}
          <p className="mt-6 text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Simple, lightning-fast GST invoicing, inventory tracking, and customer ledgers.
            Ditch complex legacy accounting software and run your shop with clarity.
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link
              to="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-all hover:shadow-lg"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="#pricing"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-base font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl shadow-xs transition-colors"
            >
              View Pricing (from ₹99/mo)
            </a>
          </div>

          <p className="mt-3 text-xs text-slate-500">
            ✓ 30-day free trial • No credit card required • Setup in under 2 minutes
          </p>
        </div>

        {/* ─── Hero Product Mockup Preview ─────────────────────────────────────── */}
        <div id="preview" className="mt-14 max-w-6xl mx-auto">
          <div className="relative rounded-3xl p-3 bg-gradient-to-b from-slate-200 via-slate-100 to-slate-200/80 shadow-2xl border border-slate-300">
            {/* Screen frame */}
            <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-inner border border-slate-800">
              {/* Window controls bar */}
              <div className="h-8 bg-slate-800/80 px-4 flex items-center gap-2 border-b border-slate-700/60">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="text-[11px] font-mono text-slate-400 mx-auto">
                  app.bharatbill.in/app/dashboard
                </span>
              </div>

              {/* Inside Dashboard Mockup Representation */}
              <div className="p-4 sm:p-6 bg-slate-50 text-left">
                {/* Mock Top bar */}
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-slate-900">Sharma Traders</span>
                    <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded font-mono">
                      FY 2026-27
                    </span>
                  </div>
                  <div className="text-xs text-slate-500">
                    GSTIN: <span className="font-mono font-semibold">27AADCB2230M1Z2</span>
                  </div>
                </div>

                {/* Mock KPI cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4">
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                    <p className="text-[11px] font-medium text-slate-500">Total Sales (Nov)</p>
                    <p className="text-lg sm:text-xl font-bold text-slate-900 mt-1">₹12,48,500</p>
                    <p className="text-[10px] text-emerald-600 font-semibold mt-1 flex items-center gap-0.5">
                      <TrendingUp className="w-3 h-3" /> +14.2% vs last month
                    </p>
                  </div>
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                    <p className="text-[11px] font-medium text-slate-500">Total Purchases</p>
                    <p className="text-lg sm:text-xl font-bold text-slate-900 mt-1">₹8,12,300</p>
                    <p className="text-[10px] text-slate-500 mt-1">42 Invoices recorded</p>
                  </div>
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                    <p className="text-[11px] font-medium text-slate-500">Receivables (To Collect)</p>
                    <p className="text-lg sm:text-xl font-bold text-amber-600 mt-1">₹1,85,400</p>
                    <p className="text-[10px] text-slate-500 mt-1">8 pending customer bills</p>
                  </div>
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                    <p className="text-[11px] font-medium text-slate-500">GST Collected (CGST+SGST)</p>
                    <p className="text-lg sm:text-xl font-bold text-blue-600 mt-1">₹1,89,750</p>
                    <p className="text-[10px] text-slate-500 mt-1">Ready for CA summary</p>
                  </div>
                </div>

                {/* Mock Invoices Table row preview */}
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
                  <div className="px-4 py-2.5 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">Recent Invoices</span>
                    <span className="text-[11px] text-blue-600 font-semibold">View all →</span>
                  </div>
                  <div className="divide-y divide-slate-100 text-xs">
                    <div className="p-3 flex items-center justify-between">
                      <div>
                        <span className="font-mono font-bold text-slate-900">INV-000348</span>
                        <span className="ml-3 font-medium text-slate-700">Metro Electronics, Pune</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-slate-900">₹45,200.00</span>
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-semibold rounded text-[10px]">
                          PAID
                        </span>
                      </div>
                    </div>
                    <div className="p-3 flex items-center justify-between">
                      <div>
                        <span className="font-mono font-bold text-slate-900">INV-000347</span>
                        <span className="ml-3 font-medium text-slate-700">Gupta Hardware, Thane</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-slate-900">₹18,500.00</span>
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-800 font-semibold rounded text-[10px]">
                          PARTIAL
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Feature Strip ───────────────────────────────────────────────────── */}
      <section className="py-12 bg-slate-900 text-white border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/30">
                <Receipt className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">GST Invoicing</h4>
                <p className="text-xs text-slate-400 mt-0.5">CGST, SGST & IGST split with HSN codes</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Inventory Control</h4>
                <p className="text-xs text-slate-400 mt-0.5">Real-time stock deduction & low-stock alerts</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center shrink-0 border border-purple-500/30">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Customer Ledger</h4>
                <p className="text-xs text-slate-400 mt-0.5">Track udhaar, credit balances & payments</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-600/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Business Reports</h4>
                <p className="text-xs text-slate-400 mt-0.5">Sales, purchases & tax reports ready for your CA</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Detailed Features Section ───────────────────────────────────────── */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold text-blue-600 tracking-wider uppercase">
            Everything your shop needs
          </span>
          <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-slate-900">
            Designed specifically for Indian trade & commerce
          </h2>
          <p className="mt-3 text-slate-600 text-sm sm:text-base">
            No complicated accounting jargon. Just clean, fast software that works on your counter laptop or phone.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-5">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Bulletproof GST Invoicing
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Auto-computes CGST and SGST for intra-state sales, or IGST for inter-state deals.
              Snapshots item rates, discounts, and round-offs so finalized invoices are permanently immutable.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-5">
              <Package className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Stock In & Out Tracking
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every invoice automatically deducts stock; recording purchases automatically increases it.
              Color-coded low-stock alerts let you restock before running out.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-5">
              <Receipt className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Customer & Supplier Khata
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Clear ledger for every party. Record cash, UPI, bank transfers, or partial credit.
              Outstanding balances turn green when clear and red when due.
            </p>
          </div>
        </div>
      </section>

      {/* ─── Pricing Section ─────────────────────────────────────────────────── */}
      <section id="pricing" className="py-20 bg-slate-50 border-t border-slate-200 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold text-blue-600 tracking-wider uppercase">
              Affordable & Transparent
            </span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-slate-900">
              Honest pricing for Indian business owners
            </h2>
            <p className="mt-3 text-slate-600 text-sm">
              All plans include 30-day free trial. No setup charges. No hidden fees.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((p) => (
              <div
                key={p.name}
                className={`relative bg-white rounded-3xl p-8 border flex flex-col justify-between transition-all ${
                  p.popular
                    ? 'border-blue-600 shadow-xl ring-2 ring-blue-600/10'
                    : 'border-slate-200 shadow-sm hover:shadow-md'
                }`}
              >
                {p.popular && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 bg-blue-600 text-white text-[11px] font-bold rounded-full uppercase tracking-wider shadow-sm">
                    Most Popular
                  </span>
                )}

                <div>
                  <h3 className="text-xl font-bold text-slate-900">{p.name}</h3>
                  <p className="mt-1 text-xs text-slate-500 min-h-[32px]">{p.description}</p>

                  <div className="mt-6 pb-6 border-b border-slate-100 flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-slate-950">{p.price}</span>
                    <span className="text-xs text-slate-500 font-medium">{p.period}</span>
                  </div>

                  <ul className="mt-6 space-y-3 text-xs text-slate-700">
                    {p.features.map((feat) => (
                      <li key={feat} className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100">
                  <Link
                    to="/register"
                    className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold transition-colors ${
                      p.popular
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                    }`}
                  >
                    {p.cta}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ Section ─────────────────────────────────────────────────────── */}
      <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-4">
          <div className="p-6 rounded-2xl bg-white border border-slate-200">
            <h4 className="text-sm font-bold text-slate-900">
              Is BharatBill a full Tally replacement?
            </h4>
            <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
              No. BharatBill is purpose-built for billing, inventory, and customer/supplier ledgers.
              It eliminates the complexity of double-entry ledger software so your counter sales are quick and accurate.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200">
            <h4 className="text-sm font-bold text-slate-900">
              Does BharatBill file my GST returns?
            </h4>
            <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
              No. BharatBill generates compliant GST invoices and gives you exportable reports (GSTR-1 format summary)
              that you can hand over to your chartered accountant or tax consultant for filing.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200">
            <h4 className="text-sm font-bold text-slate-900">
              Can I use it on mobile phone or tablet?
            </h4>
            <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
              Yes! BharatBill works seamlessly on desktop, counter laptops, tablets, and mobile browsers.
            </p>
          </div>
        </div>
      </section>

      {/* ─── Footer ──────────────────────────────────────────────────────────── */}
      <footer className="bg-slate-950 text-slate-400 py-12 border-t border-slate-900 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
              ₹
            </div>
            <span className="text-sm font-bold text-white">
              Bharat<span className="text-blue-500">Bill</span>
            </span>
            <span className="text-slate-600">| Simple billing. Smarter business.</span>
          </div>

          <p className="text-slate-500">
            © {new Date().getFullYear()} BharatBill Technologies. Made with pride for Indian businesses.
          </p>

          <div className="flex gap-4 text-slate-400">
            <a href="#" className="hover:text-white">Privacy</a>
            <a href="#" className="hover:text-white">Terms</a>
            <a href="#" className="hover:text-white">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
