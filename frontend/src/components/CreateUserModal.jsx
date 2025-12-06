import React, { useState } from 'react';
import axiosClient from '../api/axiosClient';

const CreateUserModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '', role: 'student', phone: '', status: 'active' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    console.log('Token from localStorage:', token ? 'EXISTS' : 'MISSING');
    console.log('Form data being submitted:', formData);
    try {
      const response = await axiosClient.post('/api/admin/users', formData);
      console.log('Success response:', response.data);
      alert('Student created successfully!');
      setFormData({ fullName: '', email: '', password: '', role: 'student', phone: '', status: 'active' });
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error details:', err);
      console.error('Error status:', err.response?.status);
      console.error('Error message:', err.response?.data?.message);
      alert('Error: ' + (err.response?.data?.message || err.message));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h5 className="modal-title">Create User</h5>
          <button type="button" className="btn-close" onClick={onClose}></button>
        </div>
        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            <input type="text" name="fullName" placeholder="Full Name" value={formData.fullName} onChange={handleChange} required className="form-control mb-3" />
            <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required className="form-control mb-3" />
            <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required className="form-control mb-3" />
            <select name="role" value={formData.role} onChange={handleChange} className="form-control mb-3">
              <option value="student">Student</option>
              <option value="parent">Parent</option>
              <option value="instructor">Instructor</option>
            </select>
            <input type="tel" name="phone" placeholder="Phone" value={formData.phone} onChange={handleChange} className="form-control mb-3" />
            <button type="submit" className="btn btn-primary w-100">Create</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateUserModal;
