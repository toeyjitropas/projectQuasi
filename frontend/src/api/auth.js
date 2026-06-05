import client from './client';

export const login             = (email, password) => client.post('/auth/login', { email, password }).then(r => r.data);
export const getMe             = () => client.get('/auth/me').then(r => r.data);
export const getUsers          = () => client.get('/auth/users').then(r => r.data);
export const createUser        = (email, password, role = 'VIEWER') => client.post('/auth/users', { email, password, role }).then(r => r.data);
export const deleteUser        = (id) => client.delete(`/auth/users/${id}`);
export const resetUserPassword = (id, password) => client.patch(`/auth/users/${id}/password`, { password });
export const changeMyPassword  = (currentPassword, newPassword) => client.patch('/auth/me/password', { currentPassword, newPassword });
