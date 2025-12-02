import React, { useState } from 'react';
import axiosClient from '../api/axiosClient';

const CreateCourseModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({ title: '', description: '', category: '', level: 'Beginner', durationHours: 0, status: 'active' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosClient.post('/api/admin/courses', formData);
      setFormData({ title: '', description: '', category: '', level: 'Beginner', durationHours: 0, status: 'active' });
      onSuccess();
      onClose();
    } catch (err) {
      alert('Error: ' + (err.response?.data?.message || err.message));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal d-block" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Create Course</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <form onSubmit={handleSubmit}>
              <input type="text" name="title" placeholder="Course Title" value={formData.title} onChange={handleChange} required className="form-control mb-3" />
              <textarea name="description" placeholder="Description" value={formData.description} onChange={handleChange} className="form-control mb-3"></textarea>
              <input type="text" name="category" placeholder="Category" value={formData.category} onChange={handleChange} required className="form-control mb-3" />
              <select name="level" value={formData.level} onChange={handleChange} className="form-control mb-3">
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
              <input type="number" name="durationHours" placeholder="Duration (hours)" value={formData.durationHours} onChange={handleChange} className="form-control mb-3" />
              <select name="status" value={formData.status} onChange={handleChange} className="form-control mb-3">
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="archived">Archived</option>
              </select>
              <button type="submit" className="btn btn-primary w-100">Create</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateCourseModal;
