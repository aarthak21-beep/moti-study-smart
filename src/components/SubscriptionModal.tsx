import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getTranslation } from '../i18n/translations';
import { api } from '../services/api';
import confetti from 'canvas-confetti';
import { X, Check, Crown, Sparkles, ShieldCheck, Zap, AlertCircle, ArrowRight } from 'lucide-react';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose }) => {
  const { user, language, isPremium, isTrial, refreshUser } = useAuth();
  const t = getTranslation(language);

  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState<any[]>([]);
  const [keyId, setKeyId] = useState('');
  const [paymentStep, setPaymentStep] = useState<'select' | 'processing' | 'success'>('select');
  const [statusMsg, setStatusMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      api
        .getSubscriptionPlans()
        .then((data) => {
          setPlans(data.plans);
          setKeyId(data.razorpayKeyId);
        })
        .catch((err) => console.error('Failed to load plans', err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // 1. Activate 7-day free trial
  const handleStartTrial = async () => {
    setLoading(true);
    setStatusMsg('');
    try {
      const res = await api.startFreeTrial();
      await refreshUser();
      setPaymentStep('success');
      setStatusMsg(res.message);
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    } catch (err: any) {
      setStatusMsg(err.message || 'Trial activation failed');
    } finally {
      setLoading(false);
    }
  };

  // 2. Pay ₹49 / Month via Razorpay (Simulation & Verification)
  const handleRazorpayPayment = async () => {
    setLoading(true);
    setPaymentStep('processing');
    try {
      // 1. Create order on backend
      const order = await api.createRazorpayOrder();

      // 2. Simulate Razorpay Checkout Dialog / Integration flow
      // In web preview environment, we simulate the payment confirmation window
      // and immediately verify the HMAC signature on the backend!
      setTimeout(async () => {
        try {
          const verifyRes = await api.verifyPayment({
            razorpay_order_id: order.orderId,
            razorpay_payment_id: `pay_rzp_${Date.now()}`,
            razorpay_signature: `sig_${Date.now()}_verified_hmac`,
            isSimulation: true,
          });

          await refreshUser();
          setPaymentStep('success');
          setStatusMsg(verifyRes.message);
          confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
        } catch (vErr: any) {
          setStatusMsg(vErr.message || 'Payment verification failed');
          setPaymentStep('select');
        } finally {
          setLoading(false);
        }
      }, 1500);
    } catch (err: any) {
      setStatusMsg(err.message || 'Order creation failed');
      setPaymentStep('select');
      setLoading(false);
    }
  };

  const hasTrialAlready = Boolean(user?.subscription?.trialStartedAt);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative p-6 sm:p-8 bg-gradient-to-br from-indigo-950 via-slate-900 to-amber-950/30 border-b border-slate-800 text-center">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold mb-3">
            <Crown className="w-3.5 h-3.5 fill-amber-400" />
            <span>Moti Study Smart Pro</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {t.subscription.title}
          </h2>
          <p className="text-sm text-slate-300 mt-1 max-w-lg mx-auto">
            {t.subscription.subtitle}
          </p>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 flex-1 overflow-y-auto space-y-6">
          {paymentStep === 'processing' && (
            <div className="py-12 text-center space-y-4">
              <div className="w-14 h-14 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <h4 className="text-lg font-bold">सुरक्षित रेझरपे पेमेंट प्रक्रिया सुरू आहे...</h4>
              <p className="text-xs text-slate-400">
                कृपया विंडो बंद करू नका. बॅकएंडवर पेमेंट पडताळणी केली जात आहे.
              </p>
            </div>
          )}

          {paymentStep === 'success' && (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                <Check className="w-8 h-8 stroke-[3]" />
              </div>
              <h3 className="text-2xl font-black text-white">अभिनंदन!</h3>
              <p className="text-sm text-emerald-300 font-medium max-w-md mx-auto">
                {statusMsg || 'तुमचा प्रिमियम प्लॅन यशस्वीरित्या सक्रिय झाला आहे!'}
              </p>
              <div className="pt-2">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-md"
                >
                  अभ्यास सुरू करा
                </button>
              </div>
            </div>
          )}

          {paymentStep === 'select' && (
            <>
              {/* Current Status banner */}
              {(isPremium || isTrial) && (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs text-amber-300">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span>
                      {isTrial ? t.subscription.activeTrial : t.subscription.activePremium}
                    </span>
                  </div>
                  {user?.subscription?.trialExpiresAt && (
                    <span className="font-mono text-[11px] text-slate-400">
                      {new Date(user.subscription.trialExpiresAt).toLocaleDateString()} पर्यंत
                    </span>
                  )}
                </div>
              )}

              {/* 2-Tier Pricing Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Free Plan */}
                <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      मूलभूत योजना
                    </span>
                    <h3 className="text-xl font-bold text-white mt-1">Free Scholar</h3>
                    <div className="text-2xl font-black text-white mt-2">
                      ₹0 <span className="text-xs font-normal text-slate-400">/ आयुष्यभरासाठी</span>
                    </div>

                    <ul className="mt-4 space-y-2.5 text-xs text-slate-300">
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>मूलभूत मोफत लेक्चर्सचा प्रवेश</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>संकलित उजळणी सारांश नोट्स</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>दैनिक ५-प्रश्नांचा सराव क्विज</span>
                      </li>
                      <li className="flex items-center gap-2 text-slate-500">
                        <X className="w-4 h-4 text-slate-600 shrink-0" />
                        <span>संपूर्ण प्रिमियम व्हिडिओ लॉक्ड</span>
                      </li>
                      <li className="flex items-center gap-2 text-slate-500">
                        <X className="w-4 h-4 text-slate-600 shrink-0" />
                        <span>हस्तलिखित PDF डाऊनलोड लॉक्ड</span>
                      </li>
                    </ul>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-800/80">
                    <span className="text-xs text-slate-400 block text-center font-medium">
                      सध्या सक्रिय असलेली मोफत आवृत्ती
                    </span>
                  </div>
                </div>

                {/* Premium Plan Card */}
                <div className="p-5 rounded-2xl bg-gradient-to-b from-amber-950/40 via-slate-900 to-indigo-950/40 border-2 border-amber-500/50 shadow-xl shadow-amber-500/10 flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute top-0 right-0 px-3 py-1 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-[10px] font-black uppercase tracking-wider rounded-bl-xl shadow-sm">
                    Recommended
                  </div>

                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      Moti Pro
                    </span>
                    <h3 className="text-xl font-black text-white mt-1">प्रिमियम संपूर्ण तयारी</h3>
                    <div className="flex items-baseline gap-1.5 mt-2">
                      <span className="text-3xl font-black text-amber-400">₹४९</span>
                      <span className="text-xs text-slate-400 font-medium">/ दर महिना (Per Month)</span>
                    </div>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      ⚡ दिवसाला ₹२ पेक्षाही कमी खर्च!
                    </span>

                    <ul className="mt-4 space-y-2.5 text-xs text-slate-200">
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-amber-400 shrink-0" />
                        <span className="font-medium">सर्व प्रिमियम व बोर्ड व्हिडिओंचा अमर्याद प्रवेश</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-amber-400 shrink-0" />
                        <span className="font-medium">रंगीत हस्तलिखित PDF नोट्स डाऊनलोड सुविधा</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-amber-400 shrink-0" />
                        <span className="font-medium">टायमरसह सर्व फुल-लेंथ सराव व मॉक टेस्ट्स</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-amber-400 shrink-0" />
                        <span className="font-medium">प्राधान्याने शंका निरसन व टॉपर्स मार्गदर्शन</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-amber-400 shrink-0" />
                        <span className="font-medium">जाहिरातमुक्त अतिजलद अभ्यास अनुभव</span>
                      </li>
                    </ul>
                  </div>

                  <div className="mt-6 pt-4 border-t border-amber-500/20 space-y-2">
                    {/* Trial CTA button if never used */}
                    {!hasTrialAlready && !isPremium && (
                      <button
                        onClick={handleStartTrial}
                        disabled={loading}
                        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/25 transition-all transform hover:scale-[1.02] flex items-center justify-center gap-1.5"
                      >
                        <Zap className="w-4 h-4 fill-slate-950" />
                        <span>७ दिवस मोफत चाचणी सुरू करा (₹०)</span>
                      </button>
                    )}

                    {/* Razorpay Monthly Subscription */}
                    <button
                      onClick={handleRazorpayPayment}
                      disabled={loading}
                      className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition-all flex items-center justify-center gap-1.5"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>रेझरपे द्वारे ₹४९ भरा (Razorpay Secure)</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Secure Trust Badge */}
              <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-center gap-2 text-center">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>
                  UPI (GPay, PhonePe, Paytm), डेबिट/क्रेडिट कार्ड व नेटबँकिंगद्वारे १००% सुरक्षित व्यवहार.
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
