import Stripe from 'stripe';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-01-27.acacia',
});

export default stripe;

// Price ID configuration (need to create in Stripe Dashboard)
export const STRIPE_PRICES = {
  basic: {
    monthly: process.env.STRIPE_BASIC_MONTHLY_PRICE_ID || 'price_basic_monthly',
    yearly: process.env.STRIPE_BASIC_YEARLY_PRICE_ID || 'price_basic_yearly',
  },
  pro: {
    monthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID || 'price_pro_monthly',
    yearly: process.env.STRIPE_PRO_YEARLY_PRICE_ID || 'price_pro_yearly',
  },
  enterprise: {
    monthly: process.env.STRIPE_ENTERPRISE_MONTHLY_PRICE_ID || 'price_enterprise_monthly',
    yearly: process.env.STRIPE_ENTERPRISE_YEARLY_PRICE_ID || 'price_enterprise_yearly',
  },
};

// Subscription plans configuration
export const SUBSCRIPTION_PLANS = {
  free: {
    name: 'Free',
    description: 'Perfect for personal exploration',
    features: [
      '10 searches per month',
      'Basic company information',
      'Save up to 5 companies',
    ],
    prices: {
      monthly: 0,
      yearly: 0,
    },
  },
  basic: {
    name: 'Basic',
    description: 'Ideal for small businesses and individuals',
    features: [
      '100 searches per month',
      'View detailed pricing info',
      '20 price unlocks per month',
      'Save up to 50 companies',
      'Email price alerts',
    ],
    prices: {
      monthly: 9,
      yearly: 86, // ~20% discount
    },
  },
  pro: {
    name: 'Professional',
    description: 'Ideal for medium businesses and procurement teams',
    features: [
      '1,000 searches per month',
      'Unlimited price unlocks',
      'Full company background reports',
      'Save up to 500 companies',
      'Price trend analysis',
      'Data export functionality',
      'Priority customer support',
    ],
    prices: {
      monthly: 29,
      yearly: 278, // ~20% discount
    },
  },
  enterprise: {
    name: 'Enterprise',
    description: 'Ideal for large enterprises and institutional clients',
    features: [
      'Unlimited searches',
      'Unlimited price unlocks',
      'Full company background reports',
      'Unlimited saved companies',
      'Advanced data analytics',
      'API access',
      'Dedicated account manager',
      'Custom data reports',
    ],
    prices: {
      monthly: 99,
      yearly: 950, // ~20% discount
    },
  },
};

// Create Checkout Session
export async function createCheckoutSession({
  customerId,
  priceId,
  userId,
  successUrl,
  cancelUrl,
}: {
  customerId?: string;
  priceId: string;
  userId: string;
  successUrl: string;
  cancelUrl: string;
}) {
  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      userId,
    },
  };

  if (customerId) {
    sessionParams.customer = customerId;
  } else {
    sessionParams.customer_creation = 'always';
  }

  const session = await stripe.checkout.sessions.create(sessionParams);
  return session;
}

// Create Customer Portal Session
export async function createCustomerPortalSession({
  customerId,
  returnUrl,
}: {
  customerId: string;
  returnUrl: string;
}) {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
  return session;
}

// Cancel subscription
export async function cancelSubscription(subscriptionId: string) {
  const subscription = await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  });
  return subscription;
}

// Reactivate subscription
export async function reactivateSubscription(subscriptionId: string) {
  const subscription = await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: false,
  });
  return subscription;
}

// Get subscription info
export async function getSubscription(subscriptionId: string) {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  return subscription;
}

// Get customer info
export async function getCustomer(customerId: string) {
  const customer = await stripe.customers.retrieve(customerId);
  return customer;
}
