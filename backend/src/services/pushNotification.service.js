const webpush = require('web-push');
const Admin = require('../models/Admin');

let isInitialized = false;

/**
 * Inicjalizuje serwis push z kluczami VAPID
 */
const initialize = () => {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || 'mailto:admin@restauracja.pl';

  if (!publicKey || !privateKey) {
    console.warn('⚠️ VAPID keys nie są ustawione. Web Push Notifications nie będą działać.');
    console.warn('   Uruchom: npx web-push generate-vapid-keys');
    console.warn('   I dodaj klucze do .env');
    return false;
  }

  webpush.setVapidDetails(subject, publicKey, privateKey);
  isInitialized = true;
  console.log('✅ Web Push Notifications zainicjalizowane');
  return true;
};

/**
 * Waliduje subscription
 */
const validateSubscription = (subscription) => {
  if (!subscription || typeof subscription !== 'object') {
    return false;
  }

  if (!subscription.endpoint || typeof subscription.endpoint !== 'string') {
    return false;
  }

  if (!subscription.keys || typeof subscription.keys !== 'object') {
    return false;
  }

  if (!subscription.keys.p256dh || !subscription.keys.auth) {
    return false;
  }

  return true;
};

/**
 * Wysyła powiadomienie push do pojedynczego subscription
 */
const sendNotification = async (subscription, payload) => {
  if (!isInitialized) {
    console.warn('[PushService] ⚠️ Web Push nie jest zainicjalizowane');
    return { success: false, error: 'Not initialized' };
  }

  if (!validateSubscription(subscription)) {
    console.warn('[PushService] ⚠️ Nieprawidłowe subscription');
    return { success: false, error: 'Invalid subscription' };
  }

  try {
    console.log('[PushService] Wysyłam push do:', subscription.endpoint.substring(0, 50) + '...');
    await webpush.sendNotification(subscription, JSON.stringify(payload));
    console.log('[PushService] ✅ Push wysłany pomyślnie');
    return { success: true };
  } catch (error) {
    console.error('[PushService] ❌ Push notification error:', error.message);
    
    // Jeśli subscription wygasło (410 Gone), zwróć specjalny kod
    if (error.statusCode === 410) {
      console.log('[PushService] Subscription wygasło (410 Gone)');
      return { success: false, error: 'Subscription expired', statusCode: 410 };
    }
    
    return { success: false, error: error.message, statusCode: error.statusCode };
  }
};

/**
 * Wysyła powiadomienie do wszystkich urządzeń konkretnego admina
 */
const sendToAdmin = async (adminId, payload) => {
  try {
    const admin = await Admin.findById(adminId);
    if (!admin || !admin.pushSubscriptions || admin.pushSubscriptions.length === 0) {
      return { success: true, sent: 0, failed: 0 };
    }

    let sent = 0;
    let failed = 0;
    const expiredSubscriptions = [];

    for (const subscription of admin.pushSubscriptions) {
      const sub = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth
        }
      };

      const result = await sendNotification(sub, payload);
      
      if (result.success) {
        sent++;
      } else {
        failed++;
        
        // Jeśli subscription wygasło, oznacz do usunięcia
        if (result.statusCode === 410) {
          expiredSubscriptions.push(subscription.endpoint);
        }
      }
    }

    // Usuń wygasłe subscription
    if (expiredSubscriptions.length > 0) {
      admin.pushSubscriptions = admin.pushSubscriptions.filter(
        sub => !expiredSubscriptions.includes(sub.endpoint)
      );
      await admin.save();
      console.log(`🗑️ Usunięto ${expiredSubscriptions.length} wygasłych subscription dla admina ${adminId}`);
    }

    return { success: true, sent, failed };
  } catch (error) {
    console.error('Error sending push to admin:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Wysyła powiadomienie do wszystkich adminów
 */
const sendToAllAdmins = async (payload) => {
  try {
    console.log('[PushService] Wysyłanie powiadomienia do wszystkich adminów...');
    
    const admins = await Admin.find({ 
      isActive: true,
      pushSubscriptions: { $exists: true, $ne: [] }
    });

    console.log(`[PushService] Znaleziono ${admins.length} adminów z pushSubscriptions`);

    if (admins.length === 0) {
      console.log('[PushService] Brak adminów z zarejestrowanymi subscription');
      return { success: true, totalAdmins: 0, totalSent: 0 };
    }

    let totalSent = 0;
    let totalFailed = 0;

    for (const admin of admins) {
      const result = await sendToAdmin(admin._id, payload);
      if (result.success) {
        totalSent += result.sent || 0;
        totalFailed += result.failed || 0;
      }
    }

    return { 
      success: true, 
      totalAdmins: admins.length, 
      totalSent, 
      totalFailed 
    };
  } catch (error) {
    console.error('Error sending push to all admins:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Wysyła powiadomienie do adminów z określoną rolą
 */
const sendToRole = async (role, payload) => {
  try {
    const admins = await Admin.find({ 
      role,
      isActive: true,
      pushSubscriptions: { $exists: true, $ne: [] }
    });

    if (admins.length === 0) {
      return { success: true, totalAdmins: 0, totalSent: 0 };
    }

    let totalSent = 0;
    let totalFailed = 0;

    for (const admin of admins) {
      const result = await sendToAdmin(admin._id, payload);
      if (result.success) {
        totalSent += result.sent || 0;
        totalFailed += result.failed || 0;
      }
    }

    return { 
      success: true, 
      totalAdmins: admins.length, 
      totalSent, 
      totalFailed 
    };
  } catch (error) {
    console.error(`Error sending push to role ${role}:`, error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  initialize,
  validateSubscription,
  sendNotification,
  sendToAdmin,
  sendToAllAdmins,
  sendToRole,
  isInitialized: () => isInitialized
};
