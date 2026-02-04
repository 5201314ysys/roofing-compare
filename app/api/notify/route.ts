import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const { timestamp, userAgent } = await request.json();
    
    // 获取用户IP地址
    const forwarded = request.headers.get('x-forwarded-for');
    let ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'Unknown';
    
    // 获取IP地理位置信息
    let location = 'Unknown';
    let isLocalhost = false;
    
    // 检查是否为本地IP
    if (ip === '::1' || ip === '127.0.0.1' || ip === 'localhost') {
      isLocalhost = true;
      ip = `${ip} (本地开发环境)`;
      location = '本地测试 - 部署到线上后将显示真实位置';
    } else if (ip && ip !== 'Unknown') {
      try {
        const geoResponse = await fetch(`http://ip-api.com/json/${ip}`);
        const geoData = await geoResponse.json();
        if (geoData.status === 'success') {
          location = `${geoData.city}, ${geoData.regionName}, ${geoData.country}`;
        }
      } catch (error) {
        console.error('Failed to get location:', error);
        location = '无法获取地理位置';
      }
    }
    
    // 创建邮件发送器
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: false, // 使用 TLS
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
    
    // 发送通知邮件到管理员
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: process.env.EMAIL_TO,
      subject: '🔔 New Access Request Alert - Florida Roofing Pro',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1e293b;">新的访问请求！</h2>
          <p style="color: #475569; font-size: 16px;">有用户点击了 "Unlock Contractor Pricing" 按钮</p>
          
          <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 8px 0;"><strong>时间:</strong> ${timestamp}</p>
            <p style="margin: 8px 0;"><strong>IP地址:</strong> ${ip}</p>
            <p style="margin: 8px 0;"><strong>地理位置:</strong> ${location}</p>
            <p style="margin: 8px 0;"><strong>用户代理:</strong> ${userAgent}</p>
          </div>
          
          <p style="color: #64748b; font-size: 14px;">
            请尽快查看您的收件箱，用户可能已经发送了访问请求邮件。
          </p>
          
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
          <p style="color: #94a3b8; font-size: 12px;">
            此邮件由 Florida Roofing Pro 平台自动发送
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
