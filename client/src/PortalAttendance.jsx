import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';

function PortalAttendance() {
  const [students, setStudents] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    if (!token) return;

    fetch('http://localhost:5000/get-students', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setStudents(data);
          setFiltered(data);
        }
      })
      .catch((err) => console.error(err));

    const payload = JSON.parse(atob(token.split('.')[1]));
    setIsAdmin(payload.isAdmin);
  }, []);

  const handleSearch = () => {
    const term = search.toLowerCase();
    setFiltered(
      students.filter(
        (s) =>
          s.firstName.toLowerCase().includes(term) ||
          s.lastName.toLowerCase().includes(term)
      )
    );
  };

  const handleAttendanceChange = (studentId, status) => {
    const token = sessionStorage.getItem('token');
    fetch('http://localhost:5000/update-attendance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        admissionNum: studentId,
        attended: status === 'Present',
      }),
    })
      .then((res) => res.json())
      .then((data) => console.log(data))
      .catch((err) => console.error(err));
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Attendance</h2>

      <div className="mb-6">
        <label className="block text-gray-700 font-semibold mb-2">Search Student</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student name"
            className="w-full px-4 py-2 border rounded-md"
          />
          <button onClick={handleSearch} className="bg-emerald-600 text-white px-4 py-2 rounded">
            <FontAwesomeIcon icon={faSearch} />
          </button>
        </div>
      </div>

      <ul className="space-y-4">
        {filtered
          .sort((a, b) => a.lastName.localeCompare(b.lastName))
          .map((student) => (
            <li
              key={student.admissionNum}
              className="flex justify-between items-center border p-4 rounded-md shadow"
            >
              <span>
                {student.firstName} {student.lastName} ({student.admissionNum})
              </span>
              <select
                defaultValue={
                  student.attendance?.[0]?.attended === true
                    ? 'Present'
                    : student.attendance?.[0]?.attended === false
                    ? 'Absent'
                    : 'Late'
                }
                onChange={(e) => handleAttendanceChange(student.admissionNum, e.target.value)}
                className="border rounded px-3 py-1"
              >
                <option value="Present">Present</option>
                <option value="Late">Late</option>
                <option value="Absent">Absent</option>
              </select>
            </li>
          ))}
      </ul>
    </div>
  );
}

export default PortalAttendance;
