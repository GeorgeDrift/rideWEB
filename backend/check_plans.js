
const { SubscriptionPlans } = require('./models');

(async () => {
    try {
        const plans = await SubscriptionPlans.findAll();
        console.log(JSON.stringify(plans, null, 2));
    } catch (e) {
        console.error(e);
    }
})();
