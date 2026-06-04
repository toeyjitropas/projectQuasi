import client from './client';

export const getEventSummary = (params) => client.get('/reports/event-summary', { params }).then(r => r.data);
export const getPayoutSummary = () => client.get('/reports/payout-summary').then(r => r.data);
export const getVendorBilling = (params) => client.get('/reports/vendor-billing', { params }).then(r => r.data);
export const getInvestorReport = (params) => client.get('/reports/investors', { params }).then(r => r.data);
