import { NextRequest, NextResponse } from 'next/server';
import stripe, { createCheckoutSession, STRIPE_PRICES } from '@/app/lib/stripe';
import { createServerSupabase } from '@/app/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { plan, billingPeriod, userId } = await request.json();

    if (!plan || !billingPeriod || !userId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Get price ID
    const priceId = STRIPE_PRICES[plan as keyof typeof STRIPE_PRICES]?.[billingPeriod as 'monthly' | 'yearly'];
    
    if (!priceId) {
      return NextResponse.json(
        { error: 'Invalid subscription plan' },
        { status: 400 }
      );
    }

    // Find user's Stripe Customer ID
    const supabase = createServerSupabase();
    const { data: userData } = await supabase
      .from('users')
      .select('stripe_customer_id')
      .eq('id', userId)
      .single();

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Create Checkout Session
    const session = await createCheckoutSession({
      customerId: userData?.stripe_customer_id,
      priceId,
      userId,
      successUrl: `${baseUrl}/dashboard?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${baseUrl}/pricing?canceled=true`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Failed to create Checkout Session:', error);
    return NextResponse.json(
      { error: 'Failed to create payment session' },
      { status: 500 }
    );
  }
}
