import client from './client';

export const trainModel = () => client.post('/analytics/train').then(r => r.data);
export const predictCost = (data) => client.post('/analytics/predict', data).then(r => r.data);
