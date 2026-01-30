const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Modele
const Location = require('../models/Location');
const Table = require('../models/Table');
const Admin = require('../models/Admin');
const MenuCategory = require('../models/MenuCategory');
const MenuItem = require('../models/MenuItem');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/restauracja');
    console.log('✅ MongoDB połączono');
  } catch (error) {
    console.error('❌ Błąd połączenia:', error.message);
    throw error;
  }
};

exports.seedDatabase = async () => {
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
          thursday: { open: '12:00', close: '22:00' },
          friday: { open: '12:00', close: '23:00' },
          saturday: { open: '12:00', close: '23:00' },
          sunday: { open: '12:00', close: '22:00' }
        },
        maxCapacity: 80,
        isActive: true
      },
      {
        name: 'U kelnerów - Mokotów',
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
          saturday: { open: '12:00', close: '23:00' },
          sunday: { open: '12:00', close: '22:00' }
        },
        maxCapacity: 60,
        isActive: true
      }
    ]);
    
    console.log(`📍 Utworzono lokale: ${locations.map(l => l.name).join(', ')}`);
    
    // Utwórz stoliki dla każdego lokalu
    const tablesData = [];
    locations.forEach((location, locIndex) => {
      const capacity = location.maxCapacity;
      const tablesPerLocation = Math.floor(capacity / 4); // ~4 osoby na stolik
      
      for (let i = 1; i <= tablesPerLocation; i++) {
        const seats = [2, 4, 6][Math.floor(Math.random() * 3)]; // Losowa liczba miejsc
        tablesData.push({
          location: location._id,
          number: i,
          capacity: seats,
          isActive: true
        });
      }
    });
    
    await Table.create(tablesData);
    console.log(`🪑 Utworzono ${tablesData.length} stolików`);
    
    // Utwórz konta admin
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@restauracja.pl';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin123!';
    
    const admin = await Admin.create({
      email: adminEmail,
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'System',
      role: 'admin',
      isActive: true
    });
    
    console.log(`👤 Utworzono konto admina: ${adminEmail}`);
    
    const manager = await Admin.create({
      email: 'manager@restauracja.pl',
      password: 'Manager123!',
      firstName: 'Manager',
      lastName: 'System',
      role: 'manager',
      locations: [locations[0]._id], // Manager ma dostęp tylko do pierwszego lokalu
      isActive: true
    });
    
    console.log(`👤 Utworzono konto managera: manager@restauracja.pl`);
    
    // Utwórz kategorie menu
    const categories = await MenuCategory.create([
      { name: 'Przystawki', description: 'Rozpocznij swoją kulinarną przygodę', order: 1, isActive: true, createdBy: admin._id },
      { name: 'Zupy', description: 'Rozgrzewające i aromatyczne', order: 2, isActive: true, createdBy: admin._id },
      { name: 'Dania główne', description: 'Wykwintne dania główne', order: 3, isActive: true, createdBy: admin._id },
      { name: 'Desery', description: 'Słodkie zakończenie', order: 4, isActive: true, createdBy: admin._id },
      { name: 'Napoje', description: 'Wybór napojów', order: 5, isActive: true, createdBy: admin._id }
    ]);
    
    console.log(`📋 Utworzono kategorie menu: ${categories.map(c => c.name).join(', ')}`);
    
    // Utwórz pozycje menu
    const itemsData = [
      // Przystawki
      { category: categories[0]._id, name: 'Tatar z wołowiny', description: 'Świeży tatar z żółtkiem i kaparami', price: 45.00, tags: ['szef poleca'], order: 1 },
      { category: categories[0]._id, name: 'Karpaccio', description: 'Cienko pokrojona wołowina z rukolą i parmezanem', price: 42.00, order: 2 },
      { category: categories[0]._id, name: 'Sałatka z kozim serem', description: 'Mieszanka sałat z kozim serem i orzechami', price: 38.00, tags: ['vege'], order: 3 },
      
      // Zupy
      { category: categories[1]._id, name: 'Rosół domowy', description: 'Tradycyjny rosół z makaronem', price: 28.00, order: 1 },
      { category: categories[1]._id, name: 'Zupa krem z pomidorów', description: 'Kremowa zupa z bazylią i grzankami', price: 32.00, tags: ['vege'], order: 2 },
      { category: categories[1]._id, name: 'Żurek', description: 'Tradycyjny żurek z jajkiem i kiełbasą', price: 30.00, order: 3 },
      
      // Dania główne
      { category: categories[2]._id, name: 'Stek wołowy', description: 'Polędwica wołowa 200g z warzywami i sosem', price: 85.00, tags: ['szef poleca'], order: 1 },
      { category: categories[2]._id, name: 'Łosoś grillowany', description: 'Świeży łosoś z warzywami i sosem cytrynowym', price: 72.00, order: 2 },
      { category: categories[2]._id, name: 'Kaczka po pekińsku', description: 'Kaczka z sosem hoisin i plackami', price: 88.00, tags: ['szef poleca'], order: 3 },
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
    
    return {
      success: true,
      message: 'Baza danych została zaseedowana',
      data: {
        locations: locations.length,
        tables: tablesData.length,
        admins: 2,
        categories: categories.length,
        items: itemsData.length
      }
    };
  } catch (error) {
    console.error('❌ Błąd seedowania:', error);
    throw error;
  }
};
