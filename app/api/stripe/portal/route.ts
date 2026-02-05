import { NextRequest, NextResponse } from 'next/server';
import { createCustomerPortalSession } from '@/app/lib/stripe';
import { createServerSupabase } from '@/app/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing user ID' },
        { status: 400 }
      );
    }

    // Get user's Stripe Customer ID
    const supabase = createServerSupabase();
    const { data: userData } = await supabase
      .from('users')
      .select('stripe_customer_id')
      .eq('id', userId)
      .single();

    if (!userData?.stripe_customer_id) {
      return NextResponse.json(
        { error: 'User has no Stripe customer record' },
        { status: 400 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Create customer portal session
    const session = await createCustomerPortalSession({
      customerId: userData.stripe_customer_id,
      returnUrl: `${baseUrl}/dashboard?tab=subscription`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Failed to create customer portal session:', error);
    return NextResponse.json(
      { error: 'Failed to create customer portal session' },
      { status: 500 }
    );
  }
}
