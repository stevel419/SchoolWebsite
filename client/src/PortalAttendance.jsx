import React, { useEffect, useState } from 'react';

function PortalAttendance() {
  const [roster, setRoster] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtered, setFiltered] = useState([]);
  const [expanded, setExpanded] = useState(new Set());
  const [filterForm, setFilterForm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [isAdmin, setIsAdmin] = useState(false);
  const [teacherSubjects, setTeacherSubjects] = useState([]);

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    if (!token) return;

    const payload = JSON.parse(atob(token.split('.')[1]));
    setIsAdmin(payload.isAdmin);
    if (!payload.isAdmin && payload.subjects) {
      setTeacherSubjects(payload.subjects); // assumes array of subjects
    }

    fetch('http://localhost:3000/get-students', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        setRoster(data);
        setFiltered(data);
      });
  }, []);

  const toggleStudentExpansion = (admissionNum) => {
    setExpanded(prev => {
      const newSet = new Set(prev);
      if (newSet.has(admissionNum)) newSet.delete(admissionNum);
      else newSet.add(admissionNum);
      return newSet;
    });
  };

  const handleSearch = () => {
    const term = searchTerm.toLowerCase();
    const result = roster.filter(
      s =>
        s.firstName.toLowerCase().includes(term) ||
        s.lastName.toLowerCase().includes(term)
    );
    setFiltered(result);
  };

  const handleAttendanceChange = async (admissionNum, subject, status) => {
    const token = sessionStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:3000/update-attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          admissionNum,
          subject,
          attended: status === 'Present'
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
    } catch (err) {
      console.error(err.message);
    }
  };

  const getFilteredSortedRoster = () => {
    let result = filtered;
    if (filterForm) result = result.filter(s => s.form === Number(filterForm));
    return result.sort((a, b) => {
      switch (sortBy) {
        case 'form': return a.form - b.form;
        case 'dateOfBirth': return new Date(a.dateOfBirth) - new Date(b.dateOfBirth);
        case 'name': default:
          return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
      }
    });
  };

  const uniqueForms = [...new Set(roster.map(s => s.form))].sort();
  const displayRoster = getFilteredSortedRoster();

  return (
    <section className="pt-40 pb-20 px-4 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Attendance</h1>
        <p className="text-gray-600">Search for students or update daily attendance</p>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Search Student</h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Search by student name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
          <button
            onClick={handleSearch}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-md transition"
          >
            Search Student
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
          <h2 className="text-2xl font-semibold text-gray-800">
            Roster ({displayRoster.length} students)
          </h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={filterForm}
              onChange={(e) => setFilterForm(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">All Forms</option>
              {uniqueForms.map(f => <option key={f} value={f}>Form {f}</option>)}
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="name">Sort by Name</option>
              <option value="form">Sort by Form</option>
              <option value="dateOfBirth">Sort by Age</option>
            </select>
          </div>
        </div>

        {displayRoster.map((student, idx) => (
          <div key={idx} className="border rounded-lg shadow-sm mb-4">
            <div
              className="p-4 cursor-pointer hover:bg-gray-50"
              onClick={() => toggleStudentExpansion(student.admissionNum)}
            >
              <div className="flex justify-between items-center">
                <div className="flex flex-col sm:flex-row sm:gap-6 text-sm">
                  <p className="font-semibold text-lg">{student.firstName} {student.lastName}</p>
                  <p>Form: {student.form}</p>
                  <p>Sex: {student.gender}</p>
                  <p>DOB: {new Date(student.dateOfBirth).toLocaleDateString()}</p>
                </div>
                <span className="text-sm text-gray-500">
                  {expanded.has(student.admissionNum) ? 'Hide Attendance' : 'Show Attendance'}
                </span>
              </div>
            </div>

            {expanded.has(student.admissionNum) && (
              <div className="px-4 pb-4 space-y-2">
                {(student.subjects || []).map((subject, sIdx) => {
                  const attendance = student.attendance?.find(a => a.subject === subject);
                  const status = attendance?.attended === true ? 'Present' : 'Absent';

                  // Restrict subject view for teachers
                  if (!isAdmin && !teacherSubjects.includes(subject)) return null;

                  return (
                    <div key={sIdx} className="flex justify-between items-center">
                      <span>{subject}</span>
                      <select
                        defaultValue={status}
                        onChange={(e) =>
                          handleAttendanceChange(student.admissionNum, subject, e.target.value)
                        }
                        className="px-3 py-1 border border-gray-300 rounded-md"
                      >
                        <option value="Present">Present</option>
                        <option value="Absent">Absent</option>
                      </select>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

export default PortalAttendance;
