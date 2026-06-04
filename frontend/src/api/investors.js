import client from './client';

export const createInvestor = (eventId, data) => client.post(`/events/${eventId}/investors`, data).then(r => r.data);
export const updateInvestor = (id, data) => client.patch(`/investors/${id}`, data).then(r => r.data);
export const deleteInvestor = (id) => client.delete(`/investors/${id}`);
