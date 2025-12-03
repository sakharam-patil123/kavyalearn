import React, { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';
import AppLayout from '../../components/AppLayout';
import CreateCourseModal from '../../components/CreateCourseModal';
import EditCourseModal from '../../components/EditCourseModal';

const AdminCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  const loadCourses = async () => {
    try {
      const res = await axiosClient.get('/api/admin/courses');
      setCourses(res.data.data || res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (courseId) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        await axiosClient.delete(`/api/admin/courses/${courseId}`);
        alert('Course deleted successfully');
        loadCourses();
      } catch (err) {
        alert('Error: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const handleEdit = (course) => {
    setSelectedCourse(course);
    setEditModalOpen(true);
  };

  useEffect(() => {
    loadCourses();
  }, []);

  if (loading) return <AppLayout><div style={{ padding: '20px', textAlign: 'center' }}>Loading courses...</div></AppLayout>;

  return (
    <AppLayout showGreeting={false}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2>Courses</h2>
        <button className="btn btn-primary" onClick={() => setCreateModalOpen(true)}>Add Course</button>
      </div>
      <CreateCourseModal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} onSuccess={loadCourses} />
      <EditCourseModal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} onSuccess={loadCourses} course={selectedCourse} />
      <table className="table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Category</th>
            <th>Level</th>
            <th>Status</th>
            <th>Duration (hrs)</th>
            <th style={{ width: '120px' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {courses.map((c) => (
            <tr key={c._id}>
              <td>{c.title}</td>
              <td>{c.category}</td>
              <td>{c.level}</td>
              <td>{c.status}</td>
              <td>{c.durationHours || (c.duration ? c.duration.split(' ')[0] : '0')}</td>
              <td style={{ textAlign: 'center' }}>
                <button 
                  className="btn btn-sm btn-warning" 
                  onClick={() => handleEdit(c)}
                  style={{ marginRight: '5px' }}
                >
                  ✏️ Edit
                </button>
                <button 
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDelete(c._id)}
                >
                  🗑️ Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </AppLayout>
  );
};

export default AdminCourses;
