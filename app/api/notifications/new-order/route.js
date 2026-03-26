/**
 * New Order Email Notification API
 * 新訂單 Email 通知
 */

import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase/config';
import { doc, getDoc } from 'firebase/firestore';

// Default admin email for receiving order notifications
const DEFAULT_EMAIL = 'cliffchan1993@gmail.com';

export async function POST(request) {
    try {
        const orderData = await request.json();

        const {
            productName,
            productPrice,
            quantity,
            customerName,
            customerEmail,
            customerPhone,
            selectedOptions,
            productImage
        } = orderData;

        if (!productName || !customerName) {
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

        // Get notification settings from Firestore
        let recipients = [DEFAULT_EMAIL];
        let notificationsEnabled = true;
        
        try {
            const settingsDoc = await getDoc(doc(db, 'settings', 'notifications'));
            if (settingsDoc.exists()) {
                const settings = settingsDoc.data();
                
                // Check if notifications are enabled
                if (settings.enabled === false) {
                    console.log('Email notifications are disabled');
                    return NextResponse.json({ success: true, skipped: true });
                }
                
                // Determine environment and get appropriate recipients
                const isProduction = process.env.VERCEL_ENV === 'production';
                
                if (isProduction && settings.productionEmails?.length > 0) {
                    recipients = settings.productionEmails;
                } else if (!isProduction && settings.testingEmails?.length > 0) {
                    recipients = settings.testingEmails;
                }
            }
        } catch (err) {
            console.error('Failed to load notification settings:', err);
            // Continue with default recipient
        }

        // Format selected options
        const optionsHtml = selectedOptions && Object.keys(selectedOptions).length > 0
            ? Object.entries(selectedOptions)
                .map(([name, value]) => `<li>${name}: <strong>${value}</strong></li>`)
                .join('')
            : '';

        // Calculate total
        const total = (productPrice || 0) * (quantity || 1);

        // Admin notification email - 簡化版本，避免觸發垃圾郵件過濾
        const adminEmailHtml = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
                <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                    <div style="background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                        <!-- Header -->
                        <div style="text-align: center; margin-bottom: 30px;">
                            <h1 style="color: #10B981; font-size: 28px; margin: 0;">🎉 新訂單通知</h1>
                            <p style="color: #6B7280; margin-top: 8px;">LoyaultyClub</p>
                        </div>

                        <!-- Simple Order Info -->
                        <div style="background: #F0FDF4; border-radius: 12px; padding: 24px; margin-bottom: 24px; text-align: center;">
                            <p style="margin: 0; color: #166534; font-size: 18px;">
                                收到新訂單
                            </p>
                            <p style="margin: 12px 0 0 0; color: #1F2937; font-size: 24px; font-weight: bold;">
                                ${productName}
                            </p>
                            <p style="margin: 8px 0 0 0; color: #10B981; font-size: 18px;">
                                HK$${total}
                            </p>
                            ${optionsHtml ? `
                            <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #D1FAE5;">
                                <p style="margin: 0; color: #374151; font-size: 14px;">
                                    ${Object.entries(selectedOptions || {}).map(([name, value]) => `${name}: ${value}`).join(' | ')}
                                </p>
                            </div>
                            ` : ''}
                        </div>

                        <!-- CTA -->
                        <div style="text-align: center;">
                            <p style="color: #6B7280; margin: 0 0 16px 0;">
                                請登入後台查看訂單詳情
                            </p>
                            <a href="https://www.loyaultyclub.com/admin/reservations" 
                               style="display: inline-block; background: #4F46E5; color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                                查看訂單
                            </a>
                        </div>

                        <!-- Footer -->
                        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #E5E7EB;">
                            <p style="color: #9CA3AF; font-size: 12px; margin: 0;">
                                LoyaultyClub 系統通知
                            </p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `;

        // Send email via Resend
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${resendApiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                from: 'LoyaultyClub <noreply@loyaultyclub.com>',
                to: recipients,
                subject: `新訂單：${productName}`,
                html: adminEmailHtml,
            }),
        });

        const result = await response.json();

        if (!response.ok) {
            console.error('Resend API error:', result);
            return NextResponse.json(
                { error: '發送郵件失敗', details: result },
                { status: 500 }
            );
        }

        console.log('✅ Order notification email sent:', result.id);

        return NextResponse.json({
            success: true,
            messageId: result.id,
        });

    } catch (error) {
        console.error('Email notification error:', error);
        return NextResponse.json(
            { error: '發送通知失敗', details: error.message },
            { status: 500 }
        );
    }
}
