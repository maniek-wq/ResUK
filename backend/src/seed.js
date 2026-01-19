const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Załaduj zmienne środowiskowe
dotenv.config();

// Modele
const Location = require('./models/Location');
const Table = require('./models/Table');
const Admin = require('./models/Admin');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/restauracja');
    console.log('✅ MongoDB połączono');
  } catch (error) {
    console.error('❌ Błąd połączenia:', error.message);
    process.exit(1);
  }
};

const seedDatabase = async () => {
  await connectDB();
  
  try {
    // Wyczyść istniejące dane
    await Location.deleteMany({});
    await Table.deleteMany({});
    await Admin.deleteMany({});
    
    console.log('🗑️ Usunięto istniejące dane');
    
    // Utwórz lokale
    const locations = await Location.create([
      {
        name: 'Restauracja Złota - Centrum',
        address: {
          street: 'ul. Złota 15',
          city: 'Warszawa',
          postalCode: '00-019'
        },
        phone: '+48 22 123 45 67',
        email: 'centrum@restauracjazlota.pl',
        openingHours: {
          monday: { open: '12:00', close: '22:00' },
          tuesday: { open: '12:00', close: '22:00' },
          wednesday: { open: '12:00', close: '22:00' },
          thursday: { open: '12:00', close: '23:00' },
          friday: { open: '12:00', close: '24:00' },
          saturday: { open: '11:00', close: '24:00' },
          sunday: { open: '11:00', close: '21:00' }
        },
        totalTables: 15,
        maxCapacity: 60,
        description: 'Elegancka restauracja w sercu Warszawy z wyjątkową kuchnią polską i europejską.'
      },
      {
        name: 'Restauracja Złota - Mokotów',
        address: {
          street: 'ul. Puławska 152',
          city: 'Warszawa',
          postalCode: '02-624'
        },
        phone: '+48 22 987 65 43',
        email: 'mokotow@restauracjazlota.pl',
        openingHours: {
          monday: { open: '12:00', close: '22:00' },
          tuesday: { open: '12:00', close: '22:00' },
          wednesday: { open: '12:00', close: '22:00' },
          thursday: { open: '12:00', close: '22:00' },
          friday: { open: '12:00', close: '23:00' },
          saturday: { open: '11:00', close: '23:00' },
          sunday: { open: '11:00', close: '21:00' }
        },
        totalTables: 12,
        maxCapacity: 50,
        description: 'Przytulny lokal na Mokotowie z tarasem i ogrodem.'
      }
    ]);
    
    console.log('📍 Utworzono lokale:', locations.map(l => l.name).join(', '));
    
    // Utwórz stoliki dla każdego lokalu
    const tablesData = [];
    
    for (const location of locations) {
      const numTables = location.totalTables;
      
      for (let i = 1; i <= numTables; i++) {
        let seats, zone;
        
        if (i <= 4) {
          seats = 2;
          zone = 'sala_glowna';
        } else if (i <= 8) {
          seats = 4;
          zone = 'sala_glowna';
        } else if (i <= 10) {
          seats = 6;
          zone = 'ogrodek';
        } else if (i <= 12) {
          seats = 8;
          zone = 'vip';
        } else {
          seats = 4;
          zone = 'bar';
        }
        
        tablesData.push({
          location: location._id,
          tableNumber: i,
          seats,
          zone,
          description: `Stolik nr ${i} - ${seats} miejsca`
        });
      }
    }
    
    await Table.create(tablesData);
    console.log(`🪑 Utworzono ${tablesData.length} stolików`);
    
    // Utwórz konto admina
    const admin = await Admin.create({
      email: process.env.ADMIN_EMAIL || 'admin@restauracja.pl',
      password: process.env.ADMIN_PASSWORD || 'Admin123!',
      firstName: 'Administrator',
      lastName: 'Systemu',
      role: 'admin',
      locations: [] // Dostęp do wszystkich lokali
    });
    
    console.log('👤 Utworzono konto admina:', admin.email);
    
    // Utwórz konto managera
    const manager = await Admin.create({
      email: 'manager@restauracja.pl',
      password: 'Manager123!',
      firstName: 'Jan',
      lastName: 'Kowalski',
      role: 'manager',
      locations: [locations[0]._id] // Dostęp tylko do Centrum
    });
    
    console.log('👤 Utworzono konto managera:', manager.email);
    
    console.log('\n✅ Baza danych została zainicjowana!');
    console.log('\n📋 Dane logowania:');
    console.log('   Admin: admin@restauracja.pl / Admin123!');
    console.log('   Manager: manager@restauracja.pl / Manager123!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Błąd seedowania:', error);
    process.exit(1);
  }
};

seedDatabase();
