const { User } = require('./models');

(async () => {
    try {
        const user = await User.findOne({ where: { email: 'per985402@gmail.com' } });
        if (!user) {
            console.log('User not found');
            process.exit(1);
        }

        console.log('--- Driver Details ---');
        console.log(`Email: ${user.email}`);
        console.log(`Payout Method: ${user.payoutMethod}`);
        console.log(`Bank Name: ${user.bankName}`);
        console.log(`Bank Account Number: ${user.bankAccountNumber}`);
        console.log(`Bank Account Name: ${user.bankAccountName}`);
        console.log(`Airtel Money Number: ${user.airtelMoneyNumber}`);
        console.log(`Mpamba Number: ${user.mpambaNumber}`);

        process.exit(0);
    } catch (error) {
        console.error('Diagnostic failed:', error);
        process.exit(1);
    }
})();
