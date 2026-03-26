'use client'

import { useState, useEffect } from 'react';
import { Bell, Save, Plus, Trash2, Mail, TestTube } from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export default function NotificationManagement() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [testing, setTesting] = useState(false);
    const [testResult, setTestResult] = useState(null);
    
    // Notification settings
    const [settings, setSettings] = useState({
        // Testing environment emails
        testingEmails: ['cliffchan1993@gmail.com'],
        // Production environment emails  
        productionEmails: ['cliffchan1993@gmail.com', 'loyaultyclub@gmail.com'],
        // Enable/disable notifications
        enabled: true
    });

    // New email input
    const [newTestingEmail, setNewTestingEmail] = useState('');
    const [newProductionEmail, setNewProductionEmail] = useState('');

    // Load settings from Firestore
    useEffect(() => {
        const loadSettings = async () => {
            try {
                const docRef = doc(db, 'settings', 'notifications');
                const docSnap = await getDoc(docRef);
                
                if (docSnap.exists()) {
                    setSettings(docSnap.data());
                }
            } catch (error) {
                console.error('Failed to load notification settings:', error);
            } finally {
                setLoading(false);
            }
        };
        loadSettings();
    }, []);

    // Save settings to Firestore
    const handleSave = async () => {
        setSaving(true);
        try {
            const docRef = doc(db, 'settings', 'notifications');
            await setDoc(docRef, {
                ...settings,
                updatedAt: new Date().toISOString()
            });
            alert('Settings saved successfully!');
        } catch (error) {
            console.error('Failed to save settings:', error);
            alert('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    // Add email to list
    const addEmail = (type) => {
        const email = type === 'testing' ? newTestingEmail : newProductionEmail;
        if (!email || !email.includes('@')) {
            alert('Please enter a valid email');
            return;
        }
        
        const key = type === 'testing' ? 'testingEmails' : 'productionEmails';
        if (settings[key].includes(email)) {
            alert('Email already exists');
            return;
        }
        
        setSettings(prev => ({
            ...prev,
            [key]: [...prev[key], email]
        }));
        
        if (type === 'testing') {
            setNewTestingEmail('');
        } else {
            setNewProductionEmail('');
        }
    };

    // Remove email from list
    const removeEmail = (type, email) => {
        const key = type === 'testing' ? 'testingEmails' : 'productionEmails';
        setSettings(prev => ({
            ...prev,
            [key]: prev[key].filter(e => e !== email)
        }));
    };

    // Send test email
    const sendTestEmail = async () => {
        setTesting(true);
        setTestResult(null);
        try {
            const response = await fetch('/api/notifications/test', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ test: true })
            });
            const result = await response.json();
            
            if (response.ok) {
                setTestResult({ success: true, message: 'Test email sent successfully!' });
            } else {
                setTestResult({ success: false, message: result.error || 'Failed to send test email' });
            }
        } catch (error) {
            setTestResult({ success: false, message: 'Failed to send test email' });
        } finally {
            setTesting(false);
        }
    };

    // Check current environment
    const isProduction = process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' || 
                         process.env.NODE_ENV === 'production';

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <Bell className="w-8 h-8 text-green-600" />
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Notification Management</h1>
                        <p className="text-slate-500 text-sm">Configure email notifications for new orders</p>
                    </div>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 bg-green-600 text-white px-6 py-2.5 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                >
                    <Save size={18} />
                    {saving ? 'Saving...' : 'Save Settings'}
                </button>
            </div>

            {/* Current Environment */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">Current Environment</h2>
                <div className="flex items-center gap-3">
                    <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                        isProduction 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-yellow-100 text-yellow-700'
                    }`}>
                        {isProduction ? '🚀 Production' : '🧪 Testing / Development'}
                    </span>
                    <span className="text-slate-500 text-sm">
                        {isProduction 
                            ? 'Emails will be sent to Production list' 
                            : 'Emails will be sent to Testing list only'}
                    </span>
                </div>
            </div>

            {/* Enable/Disable */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-800">Email Notifications</h2>
                        <p className="text-slate-500 text-sm">Send email notifications when new orders are received</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={settings.enabled}
                            onChange={(e) => setSettings(prev => ({ ...prev, enabled: e.target.checked }))}
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                </div>
            </div>

            {/* Testing Emails */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
                <div className="flex items-center gap-2 mb-4">
                    <TestTube className="w-5 h-5 text-yellow-600" />
                    <h2 className="text-lg font-semibold text-slate-800">Testing Environment Emails</h2>
                </div>
                <p className="text-slate-500 text-sm mb-4">
                    These emails will receive notifications in development/testing mode
                </p>
                
                {/* Email List */}
                <div className="space-y-2 mb-4">
                    {settings.testingEmails.map((email, index) => (
                        <div key={index} className="flex items-center justify-between bg-yellow-50 px-4 py-2 rounded-lg">
                            <div className="flex items-center gap-2">
                                <Mail size={16} className="text-yellow-600" />
                                <span className="text-slate-700">{email}</span>
                            </div>
                            <button
                                onClick={() => removeEmail('testing', email)}
                                className="text-red-500 hover:text-red-700 p-1"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                </div>
                
                {/* Add Email */}
                <div className="flex gap-2">
                    <input
                        type="email"
                        value={newTestingEmail}
                        onChange={(e) => setNewTestingEmail(e.target.value)}
                        placeholder="Add email address..."
                        className="flex-1 border border-slate-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    />
                    <button
                        onClick={() => addEmail('testing')}
                        className="flex items-center gap-2 bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition"
                    >
                        <Plus size={18} />
                        Add
                    </button>
                </div>
            </div>

            {/* Production Emails */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
                <div className="flex items-center gap-2 mb-4">
                    <Mail className="w-5 h-5 text-green-600" />
                    <h2 className="text-lg font-semibold text-slate-800">Production Environment Emails</h2>
                </div>
                <p className="text-slate-500 text-sm mb-4">
                    These emails will receive notifications in production mode
                </p>
                
                {/* Email List */}
                <div className="space-y-2 mb-4">
                    {settings.productionEmails.map((email, index) => (
                        <div key={index} className="flex items-center justify-between bg-green-50 px-4 py-2 rounded-lg">
                            <div className="flex items-center gap-2">
                                <Mail size={16} className="text-green-600" />
                                <span className="text-slate-700">{email}</span>
                            </div>
                            <button
                                onClick={() => removeEmail('production', email)}
                                className="text-red-500 hover:text-red-700 p-1"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                </div>
                
                {/* Add Email */}
                <div className="flex gap-2">
                    <input
                        type="email"
                        value={newProductionEmail}
                        onChange={(e) => setNewProductionEmail(e.target.value)}
                        placeholder="Add email address..."
                        className="flex-1 border border-slate-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <button
                        onClick={() => addEmail('production')}
                        className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                    >
                        <Plus size={18} />
                        Add
                    </button>
                </div>
            </div>

            {/* Test Email */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">Test Notification</h2>
                <p className="text-slate-500 text-sm mb-4">
                    Send a test email to verify your notification settings are working correctly
                </p>
                
                <button
                    onClick={sendTestEmail}
                    disabled={testing}
                    className="flex items-center gap-2 bg-slate-800 text-white px-6 py-2.5 rounded-lg hover:bg-slate-900 transition disabled:opacity-50"
                >
                    <Mail size={18} />
                    {testing ? 'Sending...' : 'Send Test Email'}
                </button>
                
                {testResult && (
                    <div className={`mt-4 p-4 rounded-lg ${
                        testResult.success 
                            ? 'bg-green-50 text-green-700' 
                            : 'bg-red-50 text-red-700'
                    }`}>
                        {testResult.message}
                    </div>
                )}
            </div>
        </div>
    );
}
