const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Załaduj zmienne środowiskowe
dotenv.config();

// Modele
const Location = require('./models/Location');
const Table = require('./models/Table');
const Admin = require('./models/Admin');
const MenuCategory = require('./models/MenuCategory');
const MenuItem = require('./models/MenuItem');

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
    await MenuItem.deleteMany({});
    await MenuCategory.deleteMany({});
    
    console.log('🗑️ Usunięto istniejące dane');
    
    // Utwórz lokale
    const locations = await Location.create([
      {
        name: 'U Kelnerów',
        address: {
          street: 'al. Wyzwolenia 41/u3a',
          city: 'Szczecin',
          postalCode: '70-206'
        },
        phone: '+48 734 213 403',
        email: 'info@ukelnerow.pl',
        openingHours: {
          monday: { open: '12:00', close: '22:00' },
          tuesday: { open: '12:00', close: '22:00' },
          wednesday: { open: '12:00', close: '22:00' },
          thursday: { open: '12:00', close: '23:00' },
          friday: { open: '12:00', close: '24:00' },
          saturday: { open: '11:00', close: '24:00' },
          sunday: { open: '11:00', close: '21:00' }
        },
        totalTables: 10,
        maxCapacity: 50,
        description: 'Restauracja U Kelnerów w Szczecinie.'
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
      password: process.env.ADMIN_PASSWORD || 'Admin123!@$%',
      firstName: 'Administrator',
      lastName: 'Systemu',
      role: 'admin',
      locations: [] // Dostęp do wszystkich lokali
    });
    
    console.log('👤 Utworzono konto admina:', admin.email);
    
    // Utwórz konto managera
    const manager = await Admin.create({
      email: 'manager@restauracja.pl',
      password: 'Manager123!@$',
      firstName: 'Jan',
      lastName: 'Kowalski',
      role: 'manager',
      locations: [locations[0]._id] // Dostęp do lokalu
    });
    
    console.log('👤 Utworzono konto managera:', manager.email);
    
    // Utwórz kategorie menu
    const categories = await MenuCategory.create([
      {
        name: 'Przystawki',
        description: 'Rozpocznij swoją kulinarną przygodę',
        order: 1
      },
      {
        name: 'Zupy',
        description: 'Domowe receptury i świeże składniki',
        order: 2
      },
      {
        name: 'Dania główne',
        description: 'Serca naszej kuchni',
        order: 3
      },
      {
        name: 'Desery',
        description: 'Słodkie zakończenie',
        order: 4
      },
      {
        name: 'Napoje',
        description: 'Do wyboru do koloru',
        order: 5
      }
    ]);
    
    console.log('📋 Utworzono kategorie menu:', categories.map(c => c.name).join(', '));
    
    // Utwórz pozycje menu
    const itemsData = [
      // Przystawki
      { category: categories[0]._id, name: 'Tatar wołowy', description: 'Klasyczny tatar z polędwicy wołowej, podawany z żółtkiem, kaparami i korniszonami', price: 48.00, tags: ['szef poleca'], order: 1 },
      { category: categories[0]._id, name: 'Carpaccio z buraka', description: 'Marynowany burak z kozim serem, rukolą i orzechami włoskimi', price: 36.00, tags: ['vege'], order: 2 },
      { category: categories[0]._id, name: 'Śledź w oleju', description: 'Tradycyjny śledź matias z cebulką i ogórkiem kiszonym', price: 32.00, order: 3 },
      { category: categories[0]._id, name: 'Bruschetta z pomidorami', description: 'Chrupiące pieczywo z dojrzałymi pomidorami, bazylią i oliwą', price: 28.00, tags: ['vege'], order: 4 },
      
      // Zupy
      { category: categories[1]._id, name: 'Żurek staropolski', description: 'Na zakwasie, z białą kiełbasą i jajkiem', price: 26.00, order: 1 },
      { category: categories[1]._id, name: 'Krem z dyni', description: 'Z pestkami dyni, śmietanką i odrobiną imbiru', price: 24.00, tags: ['vege'], order: 2 },
      { category: categories[1]._id, name: 'Rosół z makaronem', description: 'Klarowny rosół z domowym makaronem i warzywami', price: 22.00, order: 3 },
      { category: categories[1]._id, name: 'Zupa pomidorowa', description: 'Ze świeżych pomidorów z ryżem lub makaronem', price: 20.00, tags: ['vege'], order: 4 },
      
      // Dania główne
      { category: categories[2]._id, name: 'Polędwica wołowa', description: 'Grillowana polędwica z sosem z zielonego pieprzu, puree ziemniaczanym i warzywami sezonowymi', price: 98.00, tags: ['szef poleca'], order: 1 },
      { category: categories[2]._id, name: 'Kaczka konfitowana', description: 'Udko kacze konfit z modrą kapustą i kluskami śląskimi', price: 78.00, order: 2 },
      { category: categories[2]._id, name: 'Łosoś na parze', description: 'Z sosem cytrynowo-kaparowym, szpinakiem i młodymi ziemniakami', price: 72.00, order: 3 },
      { category: categories[2]._id, name: 'Kotlet schabowy', description: 'Tradycyjny schabowy z ziemniakami i surówką z kapusty', price: 52.00, order: 4 },
      { category: categories[2]._id, name: 'Pierogi ruskie', description: 'Domowe pierogi z twarogiem i ziemniakami, podawane ze skwarkami', price: 38.00, tags: ['vege'], order: 5 },
      { category: categories[2]._id, name: 'Risotto z grzybami', description: 'Kremowe risotto z mieszanką leśnych grzybów i parmezanem', price: 56.00, tags: ['vege'], order: 6 },
      
      // Desery
      { category: categories[3]._id, name: 'Sernik nowojorski', description: 'Kremowy sernik na kruchym spodzie z sosem malinowym', price: 28.00, order: 1 },
      { category: categories[3]._id, name: 'Makowiec tradycyjny', description: 'Domowy makowiec z bakaliami i lukrem', price: 24.00, order: 2 },
      { category: categories[3]._id, name: 'Panna cotta', description: 'Włoski deser z wanilią i sosem z owoców leśnych', price: 26.00, order: 3 },
      { category: categories[3]._id, name: 'Szarlotka na ciepło', description: 'Z lodami waniliowymi i sosem karmelowym', price: 30.00, tags: ['szef poleca'], order: 4 },
      
      // Napoje
      { category: categories[4]._id, name: 'Kawa espresso', description: 'Włoska kawa z najlepszych ziaren arabiki', price: 12.00, order: 1 },
      { category: categories[4]._id, name: 'Herbata liściasta', description: 'Wybór herbat premium: czarna, zielona, owocowa', price: 14.00, order: 2 },
      { category: categories[4]._id, name: 'Lemoniada domowa', description: 'Świeżo wyciskana z cytryną, miętą i miodem', price: 16.00, order: 3 },
      { category: categories[4]._id, name: 'Wino - kieliszek', description: 'Selekcja win z naszej karty, zapytaj kelnera', price: 24.00, order: 4 }
    ];
    
    // Dodaj informację o twórcy do każdej pozycji
    itemsData.forEach(item => {
      item.createdBy = admin._id;
    });
    
    await MenuItem.create(itemsData);
    console.log(`🍽️ Utworzono ${itemsData.length} pozycji menu`);
    
    console.log('\n✅ Baza danych została zainicjowana!');
    
    // Loguj dane logowania TYLKO w development (bez haseł w produkcji)
    if (process.env.NODE_ENV === 'development') {
      console.log('\n📋 Dane logowania (tylko development):');
      console.log('   Admin: admin@restauracja.pl / [sprawdź .env lub użyj ADMIN_PASSWORD]');
      console.log('   Manager: manager@restauracja.pl / Manager123!@$');
    } else {
      console.log('\n📋 Konta zostały utworzone. Sprawdź zmienne środowiskowe dla danych logowania.');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Błąd seedowania:', error);
    process.exit(1);
  }
};

seedDatabase();
