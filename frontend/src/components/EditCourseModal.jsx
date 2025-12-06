import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';

const EditCourseModal = ({ isOpen, onClose, onSuccess, course }) => {
  const [formData, setFormData] = useState({ title: '', description: '', category: '', level: 'Beginner', durationHours: 0, price: 0, status: 'active' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (course && isOpen) {
      setFormData({
        title: course.title || '',
        description: course.description || '',
        category: course.category || '',
        level: course.level || 'Beginner',
        durationHours: course.durationHours || (course.duration ? parseInt(course.duration) : 0),
        price: course.price || 0,
        status: course.status || 'active'
      });
    }
  }, [course, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem('token');
    console.log('Token from localStorage:', token ? 'EXISTS' : 'MISSING');
    console.log('Updating course:', course._id, 'with data:', formData);
    try {
      const response = await axiosClient.put(`/api/admin/courses/${course._id}`, formData);
      console.log('Update success response:', response.data);
      setFormData({ title: '', description: '', category: '', level: 'Beginner', durationHours: 0, price: 0, status: 'active' });
      onSuccess();
      onClose();
      alert('Course updated successfully');
    } catch (err) {
      console.error('Update error:', err);
      alert('Error: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !course) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h5 className="modal-title">Edit Course</h5>
          <button type="button" className="btn-close" onClick={onClose}>×</button>
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
            <input type="number" name="price" placeholder="Price" value={formData.price} onChange={handleChange} className="form-control mb-3" />
            <select name="status" value={formData.status} onChange={handleChange} className="form-control mb-3">
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Updating...' : 'Update Course'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditCourseModal;
