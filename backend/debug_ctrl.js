
try {
    const drivers = require('./controllers/driverController');
    console.log('Keys:', Object.keys(drivers));
    console.log('getTransactions type:', typeof drivers.getTransactions);
    console.log('getMarketplaceHire type:', typeof drivers.getMarketplaceHire);
} catch (e) {
    console.error(e);
}
