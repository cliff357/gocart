/**
 * Test Email Notification API
 */

import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase/config';
import { doc, getDoc } from 'firebase/firestore';

export async function POST(request) {
    try {
        const resendApiKey = process.env.RESEND_API_KEY;
        
        if (!resendApiKey) {
            return NextResponse.json(
                { error: 'Email service not configured' },
                { status: 500 }
            );
        }

        // Get notification settings from Firestore
        let recipients = ['cliffchan1993@gmail.com']; // Default fallback
        
        try {
            const settingsDoc = await getDoc(doc(db, 'settings', 'notifications'));
            if (settingsDoc.exists()) {
                const settings = settingsDoc.data();
                
                if (!settings.enabled) {
                    return NextResponse.json(
                        { error: 'Email notifications are disabled' },
                        { status: 400 }
                    );
                }
                
                // Determine environment
                const isProduction = process.env.VERCEL_ENV === 'production' || 
                                    process.env.NODE_ENV === 'production';
                
                recipients = isProduction 
                    ? (settings.productionEmails || recipients)
                    : (settings.testingEmails || recipients);
            }
        } catch (err) {
            console.error('Failed to load notification settings:', err);
            // Continue with default recipients
        }

        // Test email template
        const testEmailHtml = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
                <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                    <div style="background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                        <div style="text-align: center;">
                            <h1 style="color: #10B981; font-size: 28px; margin: 0;">✅ Test Email</h1>
                            <p style="color: #6B7280; margin-top: 16px;">
                                This is a test email from LoyaultyClub notification system.
                            </p>
                            <p style="color: #6B7280; margin-top: 8px;">
                                If you received this email, your notification settings are working correctly!
                            </p>
                            <p style="color: #9CA3AF; margin-top: 24px; font-size: 12px;">
                                Sent at: ${new Date().toISOString()}
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
                subject: '✅ Test Notification - LoyaultyClub',
                html: testEmailHtml,
            }),
        });

        const result = await response.json();

        if (!response.ok) {
            console.error('Resend API error:', result);
            return NextResponse.json(
                { error: 'Failed to send email', details: result },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            messageId: result.id,
            recipients: recipients
        });

    } catch (error) {
        console.error('Test email error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
