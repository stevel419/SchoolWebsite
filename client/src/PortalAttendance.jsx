import React, { useEffect, useState } from 'react';

function PortalAttendance() {
  const [roster, setRoster] = useState([]);
  const [rosterLoading, setRosterLoading] = useState(false);
  const [rosterError, setRosterError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filtered, setFiltered] = useState([]);
  const [expanded, setExpanded] = useState(new Set());
  const [filterForm, setFilterForm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [isAdmin, setIsAdmin] = useState(false);
  const [teacherSubjects, setTeacherSubjects] = useState([]);
  const [pendingAttendance, setPendingAttendance] = useState([]);
  const [finalizeSuccess, setFinalizeSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [finalizeError, setFinalizeError] = useState('');
  const token = sessionStorage.getItem('token');

  useEffect(() => {
    if (!token) return;
    const payload = JSON.parse(atob(token.split('.')[1]));
    setIsAdmin(payload.isAdmin || false);
    if (!payload.isAdmin && payload.subject) setTeacherSubjects([payload.subject]);

    setRosterLoading(true);
    setRosterError('');
    const baseURL = import.meta.env.VITE_API_BASE_URL
    fetch(`${baseURL}/get-students`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        const activeStudents = data.filter(student => student.isActive);
        setRoster(activeStudents);
        setFiltered(activeStudents);
      })
      .catch(err => setRosterError('Failed to retrieve roster. Reload the page to try again.' || err))
      .finally(setRosterLoading(false));
  }, []);

  const toggleStudentExpansion = admissionNum => {
    setExpanded(prev => {
      const newSet = new Set(prev);
      newSet.has(admissionNum) ? newSet.delete(admissionNum) : newSet.add(admissionNum);
      return newSet;
    });
  };

  const handleSearch = async () => {
    try {
      const baseURL = import.meta.env.VITE_API_BASE_URL
      const res = await fetch(
        `${baseURL}/search-students?name=${encodeURIComponent(searchTerm)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      if (res.ok) setFiltered(data);
      else console.error(data.error || 'Search failed.');
    } catch (err) {
      console.error('Error searching students:', err);
    }
  };

  const [alreadyFinalized, setAlreadyFinalized] = useState(false);

  useEffect(() => {
    const baseURL = import.meta.env.VITE_API_BASE_URL
    if (!token) return;
    fetch(`${baseURL}/attendance-finalized-status`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setAlreadyFinalized(data.finalized))
      .catch(err => console.error('Error checking attendance status:', err));
    }, 
  []);


  const handleAttendanceChange = (admissionNum, subject, status) => {
    setPendingAttendance(prev => {
      const withoutCurrent = prev.filter(
        p => !(p.admissionNum === admissionNum && p.subject === subject)
      );

      return [
        ...withoutCurrent,
        {
          admissionNum,
          subject,
          attended: status === 'Present'
        }
      ];
    });
  };

  const allSelected = filtered.every(student =>
    student.subjects.every(subject => {
      if (!isAdmin && !teacherSubjects.includes(subject)) return true;

      const record = pendingAttendance.find(
        p => p.admissionNum === student.admissionNum && p.subject === subject
      );

      return record !== undefined;
    })
  );

  const handleFinalizeAttendance = async () => {
    setFinalizeSuccess('');
    setFinalizeError('');
    setLoading(true);

    try {
      const baseURL = import.meta.env.VITE_API_BASE_URL
      const res = await fetch(`${baseURL}/finalize-attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ records: pendingAttendance })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error finalizing attendance');

      setFinalizeSuccess('Attendance finalized successfully');
      setPendingAttendance([]);
    } catch (error) {
      setFinalizeError(`Error finalizing attendance: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredSortedRoster = () => {
    let result = filtered;
    if (filterForm) result = result.filter(s => s.form === Number(filterForm));
    return result.sort((a, b) => {
      switch (sortBy) {
        case 'form':
          return a.form - b.form;
        case 'dateOfBirth':
          return new Date(a.dateOfBirth) - new Date(b.dateOfBirth);
        case 'name':
        default:
          return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
      }
    });
  };

  const uniqueForms = [...new Set(roster.map(s => s.form))].sort((a, b) => a - b);
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
            onChange={e => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button
            onClick={handleSearch}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-md transition"
          >
            Search
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
          <h2 className="text-2xl font-semibold text-gray-800">Roster ({displayRoster.length} students)</h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={filterForm}
              onChange={e => setFilterForm(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">All Forms</option>
              {uniqueForms.map(f => (
                <option key={f} value={f}>Form {f}</option>
              ))}
            </select>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500"
            >
              <option value="name">Sort by Name</option>
              <option value="form">Sort by Form</option>
              <option value="dateOfBirth">Sort by DOB</option>
            </select>
          </div>
        </div>

        {displayRoster.map((student, idx) => (
          <div key={idx} className="border rounded-lg shadow-sm mb-4">
            <div
              className="p-4 cursor-pointer hover:bg-gray-50 hover:rounded-lg"
              onClick={() => toggleStudentExpansion(student.admissionNum)}
            >
              <div className="flex items-center justify-between">
                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-6">
                  <p className="font-semibold text-lg">{student.firstName} {student.lastName}</p>
                  <div className="flex flex-col sm:flex-row sm:gap-6 text-sm text-gray-600">
                    <span>Form: {student.form}</span>
                    <span>Gender: {student.gender}</span>
                    <span>DOB: {new Date(student.dateOfBirth).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">
                    {expanded.has(student.admissionNum) ? 'Hide' : 'View'}
                  </span>
                  <svg
                    className={`w-5 h-5 transition-transform ${expanded.has(student.admissionNum) ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {expanded.has(student.admissionNum) && (
              <div className="px-4 pb-4 space-y-2">
                {student.subjects.map((subject, sIdx) => {
                  if (!isAdmin && !teacherSubjects.includes(subject)) return null;

                  const record = pendingAttendance.find(
                    p => p.admissionNum === student.admissionNum && p.subject === subject
                  );

                  return (
                    <div key={sIdx} className="flex justify-between items-center">
                      <span>{subject}</span>
                      <select
                        value={record ? (record.attended ? 'Present' : 'Absent') : ''}
                        onChange={e => handleAttendanceChange(student.admissionNum, subject, e.target.value)}
                        className="px-3 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="" disabled>Select</option>
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

        {rosterLoading && (
            <div className="flex items-center justify-center py-12">
                <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-lg font-medium text-emerald-600">Loading roster...</span>
                </div>
            </div>
        )}
        {rosterError && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
                <div className="flex items-center">
                    <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <p className="text-red-600 text-sm font-medium">{rosterError}</p>
                </div>
            </div>
        )}

        {/* Finalize Attendance */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleFinalizeAttendance}
            disabled={!allSelected || alreadyFinalized}
            className={`px-6 py-3 font-medium rounded-md transition ${
              !allSelected || alreadyFinalized
                ? 'bg-gray-400 cursor-not-allowed text-white'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            {alreadyFinalized ? 'Attendance Already Finalized' : loading ? 'Finalizing Attendance...' : 'Finalize Attendance'}
          </button>
          {/* Status Messages */}
          {finalizeSuccess && (
            <div className='text-sm px-2 py-2 rounded max-w-md text-green-600'>
              {finalizeSuccess}
            </div>
          )}
          {finalizeError && (
            <div className='text-sm px-2 py-2 rounded max-w-md text-red-500'>
              {finalizeError}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default PortalAttendance;
