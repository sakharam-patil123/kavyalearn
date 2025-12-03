import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';

const EditStudentModal = ({ isOpen, onClose, onSuccess, student }) => {
  const [formData, setFormData] = useState({ fullName: '', email: '', phone: '', status: 'active' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (student && isOpen) {
      setFormData({
        fullName: student.fullName || '',
        email: student.email || '',
        phone: student.phone || '',
        status: student.status || 'active'
      });
    }
  }, [student, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem('token');
    console.log('Token from localStorage:', token ? 'EXISTS' : 'MISSING');
    console.log('Updating student:', student._id, 'with data:', formData);
    try {
      const response = await axiosClient.put(`/api/admin/users/${student._id}`, formData);
      console.log('Update success response:', response.data);
      setFormData({ fullName: '', email: '', phone: '', status: 'active' });
      onSuccess();
      onClose();
      alert('Student updated successfully');
    } catch (err) {
      console.error('Update error:', err);
      alert('Error: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !student) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h5 className="modal-title">Edit Student</h5>
          <button type="button" className="btn-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            <input type="text" name="fullName" placeholder="Full Name" value={formData.fullName} onChange={handleChange} required className="form-control mb-3" />
            <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required className="form-control mb-3" disabled />
            <input type="tel" name="phone" placeholder="Phone" value={formData.phone} onChange={handleChange} className="form-control mb-3" />
            <select name="status" value={formData.status} onChange={handleChange} className="form-control mb-3">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Updating...' : 'Update Student'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditStudentModal;
