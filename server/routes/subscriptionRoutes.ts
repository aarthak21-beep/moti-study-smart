import { Router } from 'express';
import crypto from 'crypto';
import { db, PaymentRecord } from '../db.js';
import { AuthRequest, requireAuth } from '../auth.js';

export const subscriptionRouter = Router();

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || 'rzp_test_moti_study_smart_2026';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'secret_moti_study_smart_verification_key';

// Get available subscription plans
subscriptionRouter.get('/plans', (req, res) => {
  res.json({
    plans: [
      {
        id: 'free',
        nameEn: 'Free Scholar',
        nameHi: 'निःशुल्क प्लान',
        nameMr: 'मोफत योजना (Free)',
        price: 0,
        currency: '₹',
        period: 'Lifetime',
        badgeEn: 'Basic Access',
        badgeMr: 'मूलभूत प्रवेश',
        featuresEn: [
          'Access to foundational video lectures',
          'Free chapter PDF revision summaries',
          'Daily 5-question practice quizzes',
          'State and national leaderboard visibility',
          'Standard community doubt support',
        ],
        featuresMr: [
          'मूलभूत व्हिडिओ व्याख्याने मोफत',
          'प्रत्येक प्रकरणाच्या संकलित उजळणी नोट्स',
          'दररोज ५ प्रश्नांची सराव चाचणी',
          'राज्यस्तरीय लीडरबोर्डमधील क्रमवारी',
          'मराठी, हिंदी व इंग्रजी भाषेमध्ये उपलब्ध',
        ],
        featuresHi: [
          'बुनियादी वीडियो लेक्चर्स का फ्री एक्सेस',
          'रिवीजन पीडीएफ सारांश',
          'दैनिक अभ्यास क्विज',
          'लीडरबोर्ड में रैंकिंग',
        ],
        ctaEn: 'Current Plan',
        ctaMr: 'सध्याची योजना',
      },
      {
        id: 'premium_monthly',
        nameEn: 'Moti Study Smart Pro',
        nameHi: 'मोती स्टडी स्मार्ट प्रो',
        nameMr: 'मोती स्टडी स्मार्ट प्रो (Premium)',
        price: 49,
        currency: '₹',
        period: '/ महिना (Per Month)',
        badgeEn: 'Most Popular • 7 Days Free Trial',
        badgeMr: 'सर्वोत्तम निवड • ७ दिवस मोफत चाचणी',
        trialDays: 7,
        featuresEn: [
          'Unlimited access to ALL HD video lectures',
          'Downloadable comprehensive PDF notes & question banks',
          'All full-length timed mock tests with in-depth solutions',
          'Priority doubt solving by subject toppers',
          'Offline reading mode & ad-free experience',
          'Complete coverage for MPSC, 12th HSC, CET, 10th & Coding',
        ],
        featuresMr: [
          'सर्व प्रिमियम व अतिमहत्त्वाच्या व्हिडिओ लेक्चर्सचा अमर्याद प्रवेश',
          'सर्व विषयांच्या संपूर्ण डाऊनलोड करण्यायोग्य रंगीत PDF नोट्स',
          'संपूर्ण गुणांसह टाइमरयुक्त सराव व मॉक टेस्ट्स (स्पष्टीकरणासह)',
          'तज्ज्ञ मार्गदर्शकांकडून शंका निरसन',
          'जाहिरातमुक्त व अतिजलद अभ्यास अनुभव',
          'केवळ ₹४९/महिना (दिवसाला ₹२ पेक्षाही कमी खर्च!)',
        ],
        featuresHi: [
          'सभी प्रीमियम वीडियो लेक्चर्स का असीमित एक्सेस',
          'डाउनलोड करने योग्य विस्तृत पीडीएफ नोट्स',
          'व्याख्या सहित सभी फुल-लेंथ मॉक टेस्ट',
          'विशेष डाउट सोल्विंग सपोर्ट',
        ],
        ctaEn: 'Start 7-Day Free Trial / Subscribe',
        ctaMr: '७ दिवस मोफत चाचणी सुरू करा / ₹४९ भरा',
      },
    ],
    razorpayKeyId: RAZORPAY_KEY_ID,
  });
});

// Activate 7-day free trial
subscriptionRouter.post('/start-trial', requireAuth, (req: AuthRequest, res) => {
  try {
    const user = req.user!;

    if (user.subscription.trialStartedAt) {
      return res.status(400).json({
        error: 'You have already used your 7-day free trial on this account.',
      });
    }

    if (user.subscription.plan === 'premium' && user.subscription.status === 'active') {
      return res.status(400).json({
        error: 'You already have an active Premium subscription.',
      });
    }

    const now = new Date();
    const expires = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const updatedSubscription = {
      plan: 'trial' as const,
      status: 'active' as const,
      trialStartedAt: now.toISOString(),
      trialExpiresAt: expires.toISOString(),
      autoRenew: false,
    };

    const updated = db.updateUser(user.id, { subscription: updatedSubscription });

    return res.json({
      message: '7-Day Free Trial activated successfully! Enjoy all premium lectures & PDF notes.',
      subscription: updated?.subscription,
      daysLeft: 7,
      expiresAt: expires.toISOString(),
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Trial activation failed' });
  }
});

// Create payment order for ₹49 subscription
subscriptionRouter.post('/create-order', requireAuth, (req: AuthRequest, res) => {
  try {
    const user = req.user!;
    const amount = 49; // ₹49
    const orderId = `order_moti_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;

    return res.json({
      orderId,
      amount: amount * 100, // in paise
      amountInRupees: amount,
      currency: 'INR',
      keyId: RAZORPAY_KEY_ID,
      user: {
        name: user.name,
        email: user.email,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to create order' });
  }
});

// Verify payment signature and upgrade to Premium
subscriptionRouter.post('/verify-payment', requireAuth, (req: AuthRequest, res) => {
  try {
    const user = req.user!;
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, isSimulation } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id) {
      return res.status(400).json({ error: 'Order ID and Payment ID are required' });
    }

    // Cryptographic signature check
    let isValid = false;
    if (isSimulation) {
      // In development/test mode or sandbox simulation
      isValid = true;
    } else if (razorpay_signature) {
      const generatedSignature = crypto
        .createHmac('sha256', RAZORPAY_KEY_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      isValid = generatedSignature === razorpay_signature;
    } else {
      isValid = false;
    }

    if (!isValid) {
      return res.status(400).json({ error: 'Payment signature verification failed. Untrusted payment.' });
    }

    // Grant 30 days of Premium subscription
    const now = new Date();
    const premiumExpiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const updatedSub = {
      plan: 'premium' as const,
      status: 'active' as const,
      premiumExpiresAt,
      autoRenew: true,
    };

    db.updateUser(user.id, { subscription: updatedSub });

    // Record payment record in audit log
    const paymentRecord: PaymentRecord = {
      id: `pay_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      userId: user.id,
      userEmail: user.email,
      userName: user.name,
      amount: 49,
      currency: 'INR',
      status: 'success',
      plan: 'monthly_premium',
      signature: razorpay_signature || 'simulated_sig',
      createdAt: now.toISOString(),
    };

    db.addPayment(paymentRecord);

    return res.json({
      message: 'Payment verified successfully! Welcome to Moti Study Smart Pro.',
      subscription: updatedSub,
      payment: paymentRecord,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Payment verification failed' });
  }
});
