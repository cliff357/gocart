/**
 * Remote Config API
 * 用於更新 Firebase Remote Config 的顏色設定
 */

import { NextResponse } from 'next/server';
import admin from 'firebase-admin';

// 初始化 Firebase Admin SDK
function getAdminApp() {
    if (admin.apps.length > 0) {
        return admin.apps[0];
    }
    
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    
    if (!serviceAccountKey) {
        console.error('❌ FIREBASE_SERVICE_ACCOUNT_KEY 環境變數未設置');
        return null;
    }
    
    try {
        const serviceAccount = JSON.parse(serviceAccountKey);
        
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            projectId: serviceAccount.project_id || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        });
        
        console.log('✅ Firebase Admin SDK 已初始化');
        return admin.apps[0];
    } catch (err) {
        console.error('❌ Firebase Admin SDK 初始化失敗:', err.message);
        return null;
    }
}

export async function POST(request) {
    try {
        const { colors } = await request.json();
        
        if (!colors) {
            return NextResponse.json({ error: '缺少顏色資料' }, { status: 400 });
        }

        const app = getAdminApp();
        
        if (!app) {
            return NextResponse.json({ 
                error: 'Firebase Admin SDK 未配置',
                hint: '請確保 FIREBASE_SERVICE_ACCOUNT_KEY 環境變數已設置'
            }, { status: 500 });
        }

        const remoteConfig = admin.remoteConfig();
        
        // 獲取當前模板
        let template;
        try {
            template = await remoteConfig.getTemplate();
        } catch (err) {
            // 如果沒有模板，創建新的
            template = {
                parameters: {},
                conditions: [],
            };
        }
        
        // 確保 parameters 存在
        if (!template.parameters) {
            template.parameters = {};
        }
        
        // 更新 site_colors 參數
        template.parameters['site_colors'] = {
            defaultValue: {
                value: JSON.stringify(colors)
            },
            description: '網站配色設定 - 由 Color Picker 更新'
        };
        
        // 發布更新
        const updatedTemplate = await remoteConfig.publishTemplate(template);
        
        console.log('✅ Remote Config 已更新:', colors);
        
        return NextResponse.json({ 
            success: true, 
            message: '配色已推送到 Remote Config',
            colors 
        });
        
    } catch (error) {
        console.error('❌ Remote Config 更新失敗:', error);
        return NextResponse.json({ 
            error: error.message || '更新失敗',
            details: error.code || 'unknown'
        }, { status: 500 });
    }
}

// GET: 讀取 Remote Config
export async function GET() {
    try {
        const app = getAdminApp();
        
        if (!app) {
            return NextResponse.json({ 
                error: 'Firebase Admin SDK 未配置'
            }, { status: 500 });
        }

        const remoteConfig = admin.remoteConfig();
        const template = await remoteConfig.getTemplate();
        
        const siteColors = template.parameters?.site_colors?.defaultValue?.value;
        
        console.log('📦 Remote Config site_colors:', siteColors);
        
        if (siteColors) {
            try {
                // 嘗試直接解析
                const parsed = JSON.parse(siteColors);
                return NextResponse.json({ 
                    success: true,
                    colors: parsed
                });
            } catch (parseErr) {
                // 嘗試修正格式（將 JS 對象格式轉為 JSON）
                try {
                    // 移除換行和多餘空格
                    let fixed = siteColors.trim();
                    // 將單引號轉為雙引號
                    fixed = fixed.replace(/'/g, '"');
                    // 為 key 加上雙引號
                    fixed = fixed.replace(/(\w+):/g, '"$1":');
                    // 移除尾部逗號
                    fixed = fixed.replace(/,\s*}/g, '}');
                    
                    console.log('🔧 修正後:', fixed);
                    const parsed = JSON.parse(fixed);
                    return NextResponse.json({ 
                        success: true,
                        colors: parsed
                    });
                } catch (e) {
                    console.error('❌ JSON 解析失敗:', siteColors);
                    return NextResponse.json({ 
                        success: false,
                        error: 'Remote Config 格式錯誤',
                        raw: siteColors
                    }, { status: 500 });
                }
            }
        }
        
        return NextResponse.json({ 
            success: true,
            colors: null,
            message: '尚未設置配色'
        });
        
    } catch (error) {
        console.error('❌ 讀取 Remote Config 失敗:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
