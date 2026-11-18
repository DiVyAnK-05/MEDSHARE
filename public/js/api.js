/**
 * MedShare - Centralized Frontend API Client
 * All network calls go through this module.
 */

const API_BASE = '/api';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  
  const headers = {
    'Accept': 'application/json',
    ...options.headers
  };

  // If body is NOT FormData, set JSON Content-Type
  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const config = {
    ...options,
    headers,
    credentials: 'include' // Always send httpOnly cookies
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      const error = new Error(data.message || 'An error occurred with your request');
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    console.error(`[API Request Error] ${endpoint}:`, err);
    throw err;
  }
}

export const API = {
  // Public Impact Stats
  stats: {
    getPublic: () => request('/stats/public')
  },

  // Auth
  auth: {
    register: (userData) => request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    }),
    login: (credentials) => request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    }),
    logout: () => request('/auth/logout', {
      method: 'POST'
    }),
    getMe: () => request('/auth/me'),
    forgotPassword: (email) => request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email })
    }),
    resetPassword: (token, password) => request(`/auth/reset-password/${token}`, {
      method: 'POST',
      body: JSON.stringify({ password })
    })
  },

  // User Profile & Settings
  users: {
    updateProfile: (profileData) => request('/users/me', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    }),
    updatePassword: (currentPassword, newPassword) => request('/users/me/password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword })
    }),
    updateSettings: (settingsData) => request('/users/me/settings', {
      method: 'PUT',
      body: JSON.stringify(settingsData)
    })
  },

  // Donations
  donations: {
    create: (formData) => request('/donations', {
      method: 'POST',
      body: formData // Note: FormData contains photo file
    }),
    getMyDonations: () => request('/donations/mine'),
    cancel: (id) => request(`/donations/${id}`, {
      method: 'DELETE'
    })
  },

  // Public Verified Medicines
  medicines: {
    getAll: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/medicines?${query}`);
    },
    getById: (id) => request(`/medicines/${id}`)
  },

  // Requests
  requests: {
    create: (reqData) => request('/requests', {
      method: 'POST',
      body: JSON.stringify(reqData)
    }),
    getMyRequests: () => request('/requests/mine'),
    cancel: (id) => request(`/requests/${id}/cancel`, {
      method: 'PUT'
    })
  },

  // NGOs
  ngos: {
    getAll: () => request('/ngos'),
    apply: (applicationData) => request('/ngos/apply', {
      method: 'POST',
      body: JSON.stringify(applicationData)
    })
  },

  // Notifications
  notifications: {
    getAll: () => request('/notifications'),
    markAsRead: (id) => request(`/notifications/${id}/read`, {
      method: 'PUT'
    }),
    markAllAsRead: () => request('/notifications/read-all', {
      method: 'PUT'
    })
  },

  // Reports
  reports: {
    create: (reportData) => request('/reports', {
      method: 'POST',
      body: JSON.stringify(reportData)
    })
  },

  // Contact
  contact: {
    submit: (msgData) => request('/contact', {
      method: 'POST',
      body: JSON.stringify(msgData)
    })
  },

  // Admin Subsystem
  admin: {
    getStats: () => request('/admin/stats'),
    getDonations: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/admin/donations?${query}`);
    },
    verifyDonation: (id) => request(`/admin/donations/${id}/verify`, {
      method: 'PUT'
    }),
    rejectDonation: (id, reason) => request(`/admin/donations/${id}/reject`, {
      method: 'PUT',
      body: JSON.stringify({ reason })
    }),
    getRequests: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/admin/requests?${query}`);
    },
    updateRequestStatus: (id, status, adminNotes) => request(`/admin/requests/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, adminNotes })
    }),
    getUsers: () => request('/admin/users'),
    updateUserStatus: (id, isActive) => request(`/admin/users/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ isActive })
    }),
    getNgoApplications: () => request('/admin/ngo-applications'),
    reviewNgoApplication: (id, status, notes) => request(`/admin/ngo-applications/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status, notes })
    }),
    getReports: () => request('/admin/reports'),
    getContactMessages: () => request('/admin/contact-messages'),
    updateContactMessageStatus: (id, status) => request(`/admin/contact-messages/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    }),
    deleteContactMessage: (id) => request(`/admin/contact-messages/${id}`, {
      method: 'DELETE'
    })
  }
};
