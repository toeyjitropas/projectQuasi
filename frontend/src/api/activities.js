import client from './client';

export const createActivity = (eventId, data) => client.post(`/events/${eventId}/activities`, data).then(r => r.data);
export const updateActivity = (id, data) => client.patch(`/activities/${id}`, data).then(r => r.data);
export const deleteActivity = (id) => client.delete(`/activities/${id}`);
