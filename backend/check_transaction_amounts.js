const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { sequelize, Transaction, User } = require('./models');

async function checkAmounts() {
    try {
        await sequelize.authenticate();
        console.log('--- Transaction Amounts in DB ---');

        const transactions = await Transaction.findAll({
            include: [{ model: User, as: 'user', attributes: ['name', 'email'] }],
            order: [['createdAt', 'DESC']]
        });

        if (transactions.length === 0) {
            console.log('No transactions found.');
        } else {
            console.table(transactions.map(t => ({
                ID: t.id.substring(0, 8) + '...',
                User: t.user ? t.user.email : 'Unknown',
                Type: t.type,
                Amount: `MWK ${t.amount.toLocaleString()}`,
                Direction: t.direction,
                Status: t.status
            })));

            const total = transactions.reduce((sum, t) => sum + t.amount, 0);
            console.log(`\nTotal Volume: MWK ${total.toLocaleString()}`);
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await sequelize.close();
    }
}

checkAmounts();
