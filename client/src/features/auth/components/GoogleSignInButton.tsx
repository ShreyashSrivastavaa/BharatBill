import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useBusinessStore } from '@/stores/businessStore';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Loader2, Sparkles, X, KeyRound, Check } from 'lucide-react';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (parent: HTMLElement, options: any) => void;
          prompt: (notification?: any) => void;
        };
      };
    };
  }
}

interface GoogleSignInButtonProps {
  label?: string;
  redirect?: string;
}

export function GoogleSignInButton({
  label = 'Sign in with Google',
  redirect = '/app/dashboard',
}: GoogleSignInButtonProps) {
  const navigate = useNavigate();
  const { loginWithGoogle } = useAuth();
  const { setCurrentBusiness, setBusinesses } = useBusinessStore();

  const [loading, setLoading] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [mockEmail, setMockEmail] = useState('princevij04@gmail.com');
  const [mockName, setMockName] = useState('Prince Singh');
  const [gsiLoaded, setGsiLoaded] = useState(false);

  const googleBtnContainerRef = useRef<HTMLDivElement>(null);
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

  // Handle successful Google token response
  const handleGoogleCredentialResponse = async (
    idToken: string,
    extra?: { email?: string; name?: string },
  ) => {
    setLoading(true);
    try {
      const data = await loginWithGoogle({
        idToken,
        email: extra?.email,
        name: extra?.name,
      });

      toast.success(`Welcome, ${data.user.name || data.user.email}!`);

      // Fetch user's businesses to route appropriately
      try {
        const { data: bizData } = await api.get('/businesses');
        if (bizData?.data && Array.isArray(bizData.data) && bizData.data.length > 0) {
          setBusinesses(bizData.data);
          setCurrentBusiness(bizData.data[0]);
          navigate(redirect);
        } else {
          navigate('/onboarding');
        }
      } catch {
        navigate('/onboarding');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Google authentication failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!googleClientId) return;

    const checkGsi = () => {
      if (window.google?.accounts?.id && googleBtnContainerRef.current) {
        try {
          window.google.accounts.id.initialize({
            client_id: googleClientId,
            callback: (response: any) => {
              if (response?.credential) {
                handleGoogleCredentialResponse(response.credential);
              }
            },
          });

          // Render official Google button into container
          googleBtnContainerRef.current.innerHTML = '';
          const containerWidth = googleBtnContainerRef.current.parentElement?.offsetWidth || 384;
          window.google.accounts.id.renderButton(googleBtnContainerRef.current, {
            theme: 'outline',
            size: 'large',
            width: Math.min(containerWidth, 400),
            text: label.toLowerCase().includes('up') ? 'signup_with' : 'signin_with',
            shape: 'rectangular',
            logo_alignment: 'left',
          });
          setGsiLoaded(true);
        } catch (e) {
          console.warn('Google Identity Services init notice:', e);
        }
      }
    };

    if (window.google?.accounts?.id) {
      checkGsi();
    } else {
      const interval = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(interval);
          checkGsi();
        }
      }, 150);
      return () => clearInterval(interval);
    }
  }, [googleClientId, label]);

  const handleClick = () => {
    if (googleClientId && window.google?.accounts?.id) {
      window.google.accounts.id.prompt();
    } else {
      setShowConfigModal(true);
    }
  };

  const handleDevMockSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowConfigModal(false);
    await handleGoogleCredentialResponse('dev-mock-token', {
      email: mockEmail,
      name: mockName,
    });
  };

  return (
    <>
      <div className="w-full flex justify-center">
        {/* Container where Google's official GSI button renders */}
        <div
          ref={googleBtnContainerRef}
          className={`w-full flex justify-center ${gsiLoaded ? 'block' : 'hidden'}`}
        />

        {/* Custom styled button when GSI button is loading or in dev mock mode */}
        {!gsiLoaded && (
          <button
            type="button"
            onClick={handleClick}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-slate-300 rounded-xl shadow-sm bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin text-slate-600" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            )}
            <span>{loading ? 'Connecting with Google...' : label}</span>
          </button>
        )}
      </div>

      {/* Dev / OAuth Setup Modal (Used if clicked before credentials or for quick testing) */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Google Sign-In</h3>
                    <p className="text-xs text-slate-500">Development & Production Ready</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowConfigModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4 space-y-4">
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 text-xs text-emerald-900">
                  <p className="font-semibold mb-1 flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-600" />
                    Google Client ID Configured
                  </p>
                  <p className="text-emerald-800 leading-relaxed font-mono truncate">
                    {googleClientId}
                  </p>
                </div>

                <form onSubmit={handleDevMockSignIn} className="space-y-3 pt-1">
                  <div className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Quick Dev Testing (One-Click)
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Account Email
                    </label>
                    <input
                      type="email"
                      value={mockEmail}
                      onChange={(e) => setMockEmail(e.target.value)}
                      required
                      className="w-full text-sm px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={mockName}
                      onChange={(e) => setMockName(e.target.value)}
                      required
                      className="w-full text-sm px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowConfigModal(false)}
                      className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-colors"
                    >
                      <Check className="w-4 h-4" />
                      Sign In as {mockName.split(' ')[0]}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
