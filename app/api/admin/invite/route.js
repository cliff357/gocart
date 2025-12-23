/**
 * Admin Invite Email API
 * 發送管理員邀請郵件
 */

import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const { email, invitedBy } = await request.json();

        if (!email) {
            return NextResponse.json(
                { error: '缺少必要參數' },
                { status: 400 }
            );
        }

        const resendApiKey = process.env.RESEND_API_KEY;
        
        if (!resendApiKey) {
            console.error('RESEND_API_KEY not configured');
            return NextResponse.json(
                { error: 'Email 服務未配置' },
                { status: 500 }
            );
        }

        // 網站 URL
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.loyaultyclub.com';
        const adminLoginUrl = `${siteUrl}/admin/login`;

        // 使用 Resend 發送郵件
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${resendApiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                from: 'LoyaultyClub <noreply@loyaultyclub.com>',
                to: [email],
                subject: '🎉 您已被邀請成為 LoyaultyClub 管理員',
                html: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="utf-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    </head>
                    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
                        <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                            <div style="background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                                <!-- Logo -->
                                <div style="text-align: center; margin-bottom: 30px;">
                                    <h1 style="color: #4F46E5; font-size: 28px; margin: 0;">🐷 LoyaultyClub</h1>
                                    <p style="color: #6B7280; margin-top: 8px;">陶豬管理系統</p>
                                </div>

                                <!-- Content -->
                                <div style="text-align: center;">
                                    <h2 style="color: #1F2937; font-size: 24px; margin-bottom: 16px;">
                                        您已被邀請成為管理員！
                                    </h2>
                                    
                                    <p style="color: #4B5563; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
                                        ${invitedBy ? `<strong>${invitedBy}</strong> 邀請您加入 LoyaultyClub 管理團隊。` : '您已被邀請加入 LoyaultyClub 管理團隊。'}
                                    </p>

                                    <div style="background: #EEF2FF; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                                        <p style="color: #4338CA; margin: 0; font-size: 14px;">
                                            ⚠️ 請使用此電子郵件地址登入：
                                        </p>
                                        <p style="color: #1E40AF; font-weight: bold; font-size: 18px; margin: 8px 0 0 0;">
                                            ${email}
                                        </p>
                                    </div>

                                    <!-- CTA Button -->
                                    <a href="${adminLoginUrl}" 
                                       style="display: inline-block; background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); color: white; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-size: 16px; font-weight: 600; margin-bottom: 24px;">
                                        🔐 立即登入管理後台
                                    </a>

                                    <p style="color: #9CA3AF; font-size: 14px; margin-top: 24px;">
                                        或複製以下連結到瀏覽器：
                                    </p>
                                    <p style="color: #6B7280; font-size: 12px; word-break: break-all;">
                                        ${adminLoginUrl}
                                    </p>
                                </div>

                                <!-- Footer -->
                                <div style="border-top: 1px solid #E5E7EB; margin-top: 32px; padding-top: 24px; text-align: center;">
                                    <p style="color: #9CA3AF; font-size: 12px; margin: 0;">
                                        此郵件由系統自動發送，請勿直接回覆。
                                    </p>
                                    <p style="color: #9CA3AF; font-size: 12px; margin-top: 8px;">
                                        © ${new Date().getFullYear()} LoyaultyClub. All rights reserved.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </body>
                    </html>
                `,
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            console.error('Resend API error:', error);
            return NextResponse.json(
                { error: '發送郵件失敗' },
                { status: 500 }
            );
        }

        const result = await response.json();
        console.log('✅ Email sent successfully:', result);

        return NextResponse.json({ 
            success: true, 
            message: '邀請郵件已發送',
            id: result.id 
        });

    } catch (error) {
        console.error('Failed to send invite email:', error);
        return NextResponse.json(
            { error: '發送郵件時發生錯誤' },
            { status: 500 }
        );
    }
}
