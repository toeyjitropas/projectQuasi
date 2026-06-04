import client from './client';

export const getEventTypes     = () => client.get('/event-types').then(r => r.data);
export const createEventType   = (data) => client.post('/event-types', data).then(r => r.data);
export const updateEventType   = (id, data) => client.patch(`/event-types/${id}`, data).then(r => r.data);
export const deleteEventType   = (id) => client.delete(`/event-types/${id}`);

export const getVendors        = () => client.get('/vendors').then(r => r.data);
export const createVendor      = (data) => client.post('/vendors', data).then(r => r.data);
export const updateVendor      = (id, data) => client.patch(`/vendors/${id}`, data).then(r => r.data);
export const deleteVendor      = (id) => client.delete(`/vendors/${id}`);

export const getVendorRoles    = () => client.get('/vendor-roles').then(r => r.data);
export const createVendorRole  = (data) => client.post('/vendor-roles', data).then(r => r.data);
export const updateVendorRole  = (id, data) => client.patch(`/vendor-roles/${id}`, data).then(r => r.data);
export const deleteVendorRole  = (id) => client.delete(`/vendor-roles/${id}`);

export const getInvestorMasters   = () => client.get('/investor-masters').then(r => r.data);
export const createInvestorMaster = (data) => client.post('/investor-masters', data).then(r => r.data);
export const updateInvestorMaster = (id, data) => client.patch(`/investor-masters/${id}`, data).then(r => r.data);
export const deleteInvestorMaster = (id) => client.delete(`/investor-masters/${id}`);
