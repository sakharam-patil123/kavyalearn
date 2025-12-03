import React, { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";
import AppLayout from "../../components/AppLayout";
import CreateUserModal from "../../components/CreateUserModal";
import EditStudentModal from "../../components/EditStudentModal";



const AdminStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const loadStudents = async () => {
    try {
      const res = await axiosClient.get("/api/admin/users?role=student");

      // Expect backend to send enrolledCourses & achievements
      setStudents(res.data.data || res.data);
    } catch (err) {
      console.error("Failed loading students", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (studentId) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await axiosClient.delete(`/api/admin/users/${studentId}`);
        alert('Student deleted successfully');
        loadStudents();
      } catch (err) {
        alert('Error: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const handleEdit = (student) => {
    setSelectedStudent(student);
    setEditModalOpen(true);
  };

  useEffect(() => {
    loadStudents();
  }, []);

  if (loading) return <AppLayout><div style={{ padding: '20px', textAlign: 'center' }}>Loading students...</div></AppLayout>;

  return (
    <AppLayout showGreeting={false}>
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <h2>Student Management</h2>
        <button className="btn btn-primary" onClick={() => setCreateModalOpen(true)}>
          Add Student
        </button>
      </div>

      <CreateUserModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={loadStudents}
      />
      
      <EditStudentModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSuccess={loadStudents}
        student={selectedStudent}
      />

      {/* STUDENT TABLE */}
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Student Info</th>
            <th>Parent</th>
            <th>Courses</th>
            <th>Performance</th>
            <th>Achievements</th>
            <th style={{ width: '120px' }}>Actions</th>
          </tr>
        </thead>

        <tbody>
          {students.map((s) => (
            <tr key={s._id}>
              {/* STUDENT PERSONAL INFO */}
              <td>
                <strong>{s.fullName}</strong> <br />
                Email: {s.email} <br />
                Phone: {s.phone || "-"} <br />
                Gender: {s.gender || "Not set"} <br />
                Age: {s.age || "Not set"} <br />
                Address: {s.address || "Not available"} <br />
                Status:{" "}
                <span
                  className={`badge bg-${
                    s.status === "active" ? "success" : "danger"
                  }`}
                >
                  {s.status || "active"}
                </span>
              </td>

              {/* PARENT DETAILS */}
              <td>
                {s.parent ? (
                  <>
                    Name: {s.parent.fullName} <br />
                    Phone: {s.parent.phone} <br />
                    Email: {s.parent.email} <br />
                  </>
                ) : (
                  "No Parent Assigned"
                )}
              </td>

              {/* ENROLLED COURSES */}
              <td>
                {s.enrolledCourses?.length > 0 ? (
                  s.enrolledCourses.map((e) => (
                    <div
                      key={e._id}
                      style={{
                        padding: "6px",
                        borderBottom: "1px solid #ddd",
                        marginBottom: 5,
                      }}
                    >
                      <strong>{e.courseId?.title}</strong> <br />
                      Instructor: {e.instructorId?.fullName || "N/A"} <br />
                      Progress: {e.progressPercentage}% <br />
                      Completed: {e.completed ? "Yes" : "No"}
                    </div>
                  ))
                ) : (
                  <span className="text-muted">No courses purchased</span>
                )}
              </td>

              {/* PERFORMANCE SECTION */}
              <td>
                Total Courses: {s.enrolledCourses?.length || 0} <br />
                Completed Courses:{" "}
                {s.enrolledCourses?.filter((c) => c.completed).length || 0}{" "}
                <br />
                Avg Progress:{" "}
                {s.enrolledCourses?.length
                  ? (
                      s.enrolledCourses.reduce(
                        (acc, c) => acc + c.progressPercentage,
                        0
                      ) / s.enrolledCourses.length
                    ).toFixed(1)
                  : "0"}
                % <br />
                Last Active: {s.lastActive || "N/A"}
              </td>

              {/* ACHIEVEMENTS */}
              <td>
                {s.achievements?.length > 0 ? (
                  s.achievements.map((a, i) => (
                    <div key={i}>
                      🏅 {a.title} <br />
                      <small>{a.date}</small>
                      <hr />
                    </div>
                  ))
                ) : (
                  <span className="text-muted">No achievements</span>
                )}
              </td>

              {/* ACTIONS */}
              <td style={{ textAlign: 'center' }}>
                <button 
                  className="btn btn-sm btn-warning" 
                  onClick={() => handleEdit(s)}
                  style={{ marginRight: '5px' }}
                >
                  ✏️ Edit
                </button>
                <button 
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDelete(s._id)}
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

export default AdminStudents;
