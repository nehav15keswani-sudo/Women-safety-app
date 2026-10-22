import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  X,
  CreditCard,
  QrCode,
  Building2,
  Wallet,
  Sparkles,
  Lock,
  ArrowRight,
  Download,
  Heart,
  Crown,
  HeartHandshake,
  Check
} from 'lucide-react';
import {
  AUTOSOS_PLANS,
  AutoSosPlanTier,
  AutoSosSubscription,
  activateAutoSosPlan,
  getAutoSosSubscription
} from '../utils/paymentStorage';

interface AutoSosPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess?: (sub: AutoSosSubscription) => void;
}

export const AutoSosPaymentModal: React.FC<AutoSosPaymentModalProps> = ({
  isOpen,
  onClose,
  onPaymentSuccess,
}) => {
  const [selectedPlan, setSelectedPlan] = useState<AutoSosPlanTier>('women_free');
  const [paymentMethod, setPaymentMethod] = useState<'WomenFreeGrant' | 'UPI' | 'Card' | 'NetBanking' | 'Wallet'>('WomenFreeGrant');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState<string>('');
  const [completedSub, setCompletedSub] = useState<AutoSosSubscription | null>(null);

  // Form states for optional patron contribution
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  if (!isOpen) return null;

  const currentPlanObj = AUTOSOS_PLANS.find((p) => p.id === selectedPlan) || AUTOSOS_PLANS[0];

  const handleActivatePlan = async () => {
    setIsProcessing(true);

    if (selectedPlan === 'women_free') {
      setProcessingStep('Activating 100% Free Women Safety Shield...');
      await new Promise((r) => setTimeout(r, 500));
      setProcessingStep('Calibrating accelerometer & unlocking 1-Touch Lock Screen...');
      await new Promise((r) => setTimeout(r, 400));
    } else {
      setProcessingStep('Connecting to UPI / RuPay payment gateway...');
      await new Promise((r) => setTimeout(r, 600));
      setProcessingStep('Authorizing optional patron support donation...');
      await new Promise((r) => setTimeout(r, 500));
    }

    const sub = activateAutoSosPlan(
      selectedPlan,
      selectedPlan === 'women_free' ? 'WomenFreeGrant' : paymentMethod
    );

    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 150]);
    }

    setIsProcessing(false);
    setCompletedSub(sub);

    if (onPaymentSuccess) {
      onPaymentSuccess(sub);
    }
  };

  const handleDownloadReceipt = () => {
    if (!completedSub) return;
    const receiptText = `================================================
AEGIS WOMEN SAFETY - AUTO-SOS CERTIFICATE & INVOICE
================================================
Shield ID:      ${completedSub.transactionId}
Plan Name:      ${completedSub.planName}
Eligibility:    100% FREE FOR ALL WOMEN (Zero Cost Forever)
Amount Billed:  INR ₹${completedSub.amount}
Status:         ACTIVE (Verified 24/7 Protection)
Coverage:       Fall Detection, Struggle Sensor & 1-Touch Lock Screen
================================================
Aegis Women Safety Initiative • Emergency: 112 / 1091
================================================`;

    const blob = new Blob([receiptText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Aegis_Free_Women_Shield_${completedSub.transactionId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="payment-modal-title"
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fade-in"
    >
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Top Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-rose-600 via-rose-500 to-pink-600 text-white relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white shadow-inner shrink-0">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="payment-modal-title" className="text-xl font-black tracking-tight">
                  Auto-SOS: 100% Free for Women
                </h3>
              </div>
              <p className="text-xs text-rose-100 opacity-90 mt-0.5">
                Official Women Safety Charter • Free 24/7 Fall Detection &amp; 1-Touch Lockscreen
              </p>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {completedSub ? (
            /* SUCCESS CONFIRMATION / CERTIFICATE */
            <div className="space-y-4 text-center py-3 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center shadow-lg">
                <CheckCircle2 className="w-10 h-10 animate-bounce" />
              </div>

              <div>
                <h4 className="text-2xl font-black text-slate-900 dark:text-white">
                  Auto-SOS Free Shield Active!
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                  Auto-SOS is unlocked and 100% Free for you forever. Sudden falls, physical struggles, and 1-Touch Lock Screen triggers are active on your device.
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-left font-mono text-xs space-y-2">
                <div className="flex justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                  <span className="text-slate-500">Shield Certificate:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{completedSub.transactionId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Plan:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{completedSub.planName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Cost:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    ₹0 (100% Free for Women)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Duration:</span>
                  <span className="text-slate-900 dark:text-white">Permanent Free Access</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
                <button
                  onClick={handleDownloadReceipt}
                  className="flex-1 py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Shield Certificate</span>
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-3 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs shadow-md shadow-rose-600/20"
                >
                  Done &amp; Return to App
                </button>
              </div>
            </div>
          ) : (
            /* PLAN SELECTION WITH 100% FREE WOMEN ACCESS HIGHLIGHTED */
            <>
              {/* Official 100% Free for Women Policy Banner */}
              <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-extrabold text-sm">
                  <Heart className="w-4 h-4 text-rose-600 fill-current" />
                  <span>Women Safety Guarantee: Always ₹0 Free</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Personal safety is a fundamental human right. Under our safety initiative, all <strong>Auto-SOS fall and struggle detection, 1-touch lockscreen standby, and offline GPS SMS dispatches are 100% Free for women</strong>.
                </p>
              </div>

              {/* Plans Grid */}
              <div className="space-y-2.5">
                {AUTOSOS_PLANS.map((plan) => {
                  const isSelected = selectedPlan === plan.id;
                  return (
                    <div
                      key={plan.id}
                      onClick={() => {
                        setSelectedPlan(plan.id);
                        if (plan.id === 'women_free') {
                          setPaymentMethod('WomenFreeGrant');
                        } else {
                          setPaymentMethod('UPI');
                        }
                      }}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-rose-50/70 dark:bg-rose-950/40 border-rose-500 ring-2 ring-rose-500/20 shadow-sm'
                          : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            isSelected ? 'border-rose-600 bg-rose-600 text-white' : 'border-slate-400'
                          }`}>
                            {isSelected && <Check className="w-3 h-3" />}
                          </div>
                          <div>
                            <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                              {plan.name}
                            </h4>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400">
                              {plan.period}
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className={`text-base font-black ${
                            plan.price === 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'
                          }`}>
                            {plan.price === 0 ? '₹0 FREE' : `₹${plan.price}`}
                          </span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded font-extrabold bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300 block mt-0.5">
                            {plan.badge}
                          </span>
                        </div>
                      </div>

                      <ul className="mt-2.5 space-y-1 pl-6">
                        {plan.features.slice(0, 3).map((feat, idx) => (
                          <li key={idx} className="text-[11px] text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                            <Check className="w-3 h-3 text-emerald-500 shrink-0" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>

              {/* If Optional Patron Sponsor chosen, show UPI / Card input */}
              {selectedPlan !== 'women_free' && (
                <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      Sponsor via UPI (Google Pay, PhonePe, Paytm)
                    </span>
                    <span className="text-[10px] text-emerald-600 font-bold">Voluntary Ally Support</span>
                  </div>

                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="Enter UPI ID (e.g. 9876543210@paytm)"
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                  />
                </div>
              )}

              {/* Action Button */}
              <div className="pt-2">
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleActivatePlan}
                  className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-2xl font-black text-sm shadow-xl shadow-rose-600/30 flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span className="truncate text-xs">{processingStep}</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-5 h-5" />
                      <span>
                        {selectedPlan === 'women_free'
                          ? 'Activate 100% Free Auto-SOS for Women'
                          : `Sponsor ₹${currentPlanObj.price} & Support Women Safety`}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <p className="text-[11px] text-center text-slate-500 dark:text-slate-400 mt-2">
                  🔒 Zero Charges for Women • Instant 1-Touch Standby Activation
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
