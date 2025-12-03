import React, { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';
import AppLayout from '../../components/AppLayout';
import CreateCourseModal from '../../components/CreateCourseModal';

const AdminCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

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

  useEffect(() => {
    loadCourses();
  }, []);

  if (loading) return <AppLayout><div style={{ padding: '20px', textAlign: 'center' }}>Loading courses...</div></AppLayout>;

  return (
    <AppLayout showGreeting={false}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2>Courses</h2>
        <button className="btn btn-primary" onClick={() => setModalOpen(true)}>Add Course</button>
      </div>
      <CreateCourseModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSuccess={loadCourses} />
      <table className="table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Category</th>
            <th>Level</th>
            <th>Status</th>
            <th>Duration (hrs)</th>
          </tr>
        </thead>
        <tbody>
          {courses.map((c) => (
            <tr key={c._id}>
              <td>{c.title}</td>
              <td>{c.category}</td>
              <td>{c.level}</td>
              <td>{c.status}</td>
              <td>{c.durationHours}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </AppLayout>
  );
};

export default AdminCourses;
