import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const { timestamp, userAgent } = await request.json();
    
    // Get user IP address
    const forwarded = request.headers.get('x-forwarded-for');
    let ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'Unknown';
    
    // Get IP geolocation info
    let location = 'Unknown';
    let isLocalhost = false;
    
    // Check if local IP
    if (ip === '::1' || ip === '127.0.0.1' || ip === 'localhost') {
      isLocalhost = true;
      ip = `${ip} (Local Development)`;
      location = 'Local Test - Real location will be shown after deployment';
    } else if (ip && ip !== 'Unknown') {
      try {
        const geoResponse = await fetch(`http://ip-api.com/json/${ip}`);
        const geoData = await geoResponse.json();
        if (geoData.status === 'success') {
          location = `${geoData.city}, ${geoData.regionName}, ${geoData.country}`;
        }
      } catch (error) {
        console.error('Failed to get location:', error);
        location = 'Unable to get location';
      }
    }
    
    // Create email transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: false, // Use TLS
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
    
    // Send notification email to admin
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: process.env.EMAIL_TO,
      subject: '🔔 New Access Request Alert - Florida Roofing Pro',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1e293b;">New Access Request!</h2>
          <p style="color: #475569; font-size: 16px;">A user clicked the "Unlock Contractor Pricing" button</p>
          
          <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 8px 0;"><strong>Time:</strong> ${timestamp}</p>
            <p style="margin: 8px 0;"><strong>IP Address:</strong> ${ip}</p>
            <p style="margin: 8px 0;"><strong>Location:</strong> ${location}</p>
            <p style="margin: 8px 0;"><strong>User Agent:</strong> ${userAgent}</p>
          </div>
          
          <p style="color: #64748b; font-size: 14px;">
            Please check your inbox soon, the user may have already sent an access request email.
          </p>
          
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
          <p style="color: #94a3b8; font-size: 12px;">
            This email was automatically sent by the Florida Roofing Pro platform
          </p>
        </div>
      `,
    });
    
    return NextResponse.json({ 
      success: true,
      message: 'Notification email sent successfully'
    });
  } catch (error) {
    console.error('Email sending error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to send notification'
    }, { status: 500 });
  }
}
