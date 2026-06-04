import client from './client';

export const uploadImages = (eventId, formData) =>
  client.post(`/events/${eventId}/images`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data);
export const getImageUrl = (id) => client.get(`/images/${id}/url`).then(r => r.data.url);
export const deleteImage = (id) => client.delete(`/images/${id}`);
