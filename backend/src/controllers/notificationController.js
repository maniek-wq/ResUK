const Notification = require('../models/Notification');
const Admin = require('../models/Admin');

// @desc    Pobierz wszystkie powiadomienia dla zalogowanego admina
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = async (req, res) => {
  try {
    const { isRead, limit = 50, skip = 0 } = req.query;
    
    // Buduj query - powiadomienia dla wszystkich adminów lub konkretnego admina
    let query = {
      $or: [
        { recipient: null }, // Dla wszystkich adminów
        { recipient: req.admin._id } // Dla konkretnego admina
      ]
    };
    
    // Filtr odczytanych/nieodczytanych
    if (isRead !== undefined) {
      query.isRead = isRead === 'true';
    }
    
    const notifications = await Notification.find(query)
      .populate('reservation', 'customer date timeSlot status')
      .populate('location', 'name')
      .populate('readBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));
    
    const total = await Notification.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: notifications.length,
      total,
      data: notifications
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Błąd pobierania powiadomień'
    });
  }
};

// @desc    Pobierz liczbę nieprzeczytanych powiadomień
// @route   GET /api/notifications/unread/count
// @access  Private
exports.getUnreadCount = async (req, res) => {
  try {
    const query = {
      isRead: false,
      $or: [
        { recipient: null }, // Dla wszystkich adminów
        { recipient: req.admin._id } // Dla konkretnego admina
      ]
    };
    
    const count = await Notification.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Błąd pobierania liczby nieprzeczytanych powiadomień'
    });
  }
};

// @desc    Oznacz powiadomienie jako przeczytane
// @route   PATCH /api/notifications/:id/read
// @access  Private
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Powiadomienie nie znalezione'
      });
    }
    
    // Sprawdź czy admin ma dostęp do tego powiadomienia
    if (notification.recipient && 
        notification.recipient.toString() !== req.admin._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Brak uprawnień do tego powiadomienia'
      });
    }
    
    notification.isRead = true;
    notification.readAt = new Date();
    notification.readBy = req.admin._id;
    
    await notification.save();
    
    res.status(200).json({
      success: true,
      data: notification
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Błąd oznaczania powiadomienia jako przeczytane'
    });
  }
};

// @desc    Oznacz wszystkie powiadomienia jako przeczytane
// @route   PATCH /api/notifications/read-all
// @access  Private
exports.markAllAsRead = async (req, res) => {
  try {
    const query = {
      isRead: false,
      $or: [
        { recipient: null },
        { recipient: req.admin._id }
      ]
    };
    
    const result = await Notification.updateMany(
      query,
      {
        $set: {
          isRead: true,
          readAt: new Date(),
          readBy: req.admin._id
        }
      }
    );
    
    res.status(200).json({
      success: true,
      message: `Oznaczono ${result.modifiedCount} powiadomień jako przeczytane`,
      count: result.modifiedCount
    });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Błąd oznaczania wszystkich powiadomień jako przeczytane'
    });
  }
};

// @desc    Utwórz powiadomienie (helper function - używane wewnętrznie)
// @access  Internal
exports.createNotification = async (data) => {
  try {
    const {
      type = 'reservation_new',
      title,
      message,
      reservation = null,
      location = null,
      recipient = null, // null = dla wszystkich adminów
      metadata = {}
    } = data;
    
    const notification = await Notification.create({
      type,
      title,
      message,
      reservation,
      location,
      recipient,
      metadata
    });
    
    return notification;
  } catch (error) {
    console.error('Create notification error:', error);
    throw error;
  }
};

// @desc    Usuń powiadomienie
// @route   DELETE /api/notifications/:id
// @access  Private
exports.deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Powiadomienie nie znalezione'
      });
    }
    
    // Sprawdź uprawnienia
    if (notification.recipient && 
        notification.recipient.toString() !== req.admin._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Brak uprawnień do usunięcia tego powiadomienia'
      });
    }
    
    await notification.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Powiadomienie zostało usunięte'
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Błąd usuwania powiadomienia'
    });
  }
};
