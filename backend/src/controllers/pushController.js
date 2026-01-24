const Admin = require('../models/Admin');
const pushService = require('../services/pushNotification.service');

// @desc    Pobierz publiczny klucz VAPID
// @route   GET /api/push/public-key
// @access  Public
exports.getPublicKey = (req, res) => {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  
  if (!publicKey) {
    return res.status(503).json({
      success: false,
      message: 'Web Push nie jest skonfigurowane'
    });
  }

  res.status(200).json({
    success: true,
    publicKey
  });
};

// @desc    Zarejestruj subscription push dla admina
// @route   POST /api/push/subscribe
// @access  Private
exports.subscribe = async (req, res) => {
  try {
    console.log('[PushController] Rejestracja subscription dla admina:', req.admin?.email);
    const { subscription, deviceInfo, userAgent } = req.body;

    // Walidacja subscription
    if (!pushService.validateSubscription(subscription)) {
      console.log('[PushController] Nieprawidłowy format subscription:', subscription);
      return res.status(400).json({
        success: false,
        message: 'Nieprawidłowy format subscription'
      });
    }

    const admin = await Admin.findById(req.admin._id);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin nie znaleziony'
      });
    }

    // Sprawdź czy subscription już istnieje (po endpoint)
    const existingIndex = admin.pushSubscriptions.findIndex(
      sub => sub.endpoint === subscription.endpoint
    );

    if (existingIndex !== -1) {
      // Aktualizuj istniejące subscription
      admin.pushSubscriptions[existingIndex] = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth
        },
        deviceInfo: deviceInfo || '',
        userAgent: userAgent || req.headers['user-agent'] || '',
        createdAt: admin.pushSubscriptions[existingIndex].createdAt || new Date()
      };
    } else {
      // Dodaj nowe subscription
      admin.pushSubscriptions.push({
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth
        },
        deviceInfo: deviceInfo || '',
        userAgent: userAgent || req.headers['user-agent'] || '',
        createdAt: new Date()
      });
    }

    await admin.save();
    console.log(`[PushController] ✅ Subscription zapisane dla ${admin.email}, ilość urządzeń: ${admin.pushSubscriptions.length}`);

    res.status(200).json({
      success: true,
      message: 'Subscription zarejestrowane',
      deviceCount: admin.pushSubscriptions.length
    });
  } catch (error) {
    console.error('[PushController] ❌ Subscribe push error:', error);
    res.status(500).json({
      success: false,
      message: 'Błąd rejestracji subscription'
    });
  }
};

// @desc    Usuń subscription push
// @route   DELETE /api/push/unsubscribe
// @access  Private
exports.unsubscribe = async (req, res) => {
  try {
    const { endpoint } = req.body;

    if (!endpoint) {
      return res.status(400).json({
        success: false,
        message: 'Endpoint jest wymagany'
      });
    }

    const admin = await Admin.findById(req.admin._id);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin nie znaleziony'
      });
    }

    const initialLength = admin.pushSubscriptions.length;
    admin.pushSubscriptions = admin.pushSubscriptions.filter(
      sub => sub.endpoint !== endpoint
    );

    if (admin.pushSubscriptions.length === initialLength) {
      return res.status(404).json({
        success: false,
        message: 'Subscription nie znalezione'
      });
    }

    await admin.save();

    res.status(200).json({
      success: true,
      message: 'Subscription usunięte',
      deviceCount: admin.pushSubscriptions.length
    });
  } catch (error) {
    console.error('Unsubscribe push error:', error);
    res.status(500).json({
      success: false,
      message: 'Błąd usuwania subscription'
    });
  }
};

// @desc    Pobierz listę zarejestrowanych urządzeń admina
// @route   GET /api/push/devices
// @access  Private
exports.getDevices = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id).select('pushSubscriptions');
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin nie znaleziony'
      });
    }

    const devices = admin.pushSubscriptions.map(sub => ({
      endpoint: sub.endpoint,
      deviceInfo: sub.deviceInfo,
      userAgent: sub.userAgent,
      createdAt: sub.createdAt
    }));

    res.status(200).json({
      success: true,
      count: devices.length,
      data: devices
    });
  } catch (error) {
    console.error('Get devices error:', error);
    res.status(500).json({
      success: false,
      message: 'Błąd pobierania urządzeń'
    });
  }
};
