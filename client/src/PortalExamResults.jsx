import { useState, useEffect } from "react";

function PortalExamResults() {
    const [results, setResults] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = sessionStorage.getItem('token');
        if (!token) {
            window.location.href = '/login';
            return;
        }

        const fetchResults = async () => {
            try {
                const baseURL = import.meta.env.VITE_API_BASE_URL

                const res = await fetch(`${baseURL}/exam-results`, {
                    method: "GET",
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });

                const data = await res.json();
                if (res.ok) {
                    setResults(data);
                } else {
                    setError(data.error || 'Failed to fetch exam results');
                }
            } catch (err) {
                setError('Failed to fetch exam results. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, []);

    if (loading) {
        return <p className="pt-40 px-4 text-center">Loading exam results...</p>;
    }

    if (error) {
        return <p className="pt-40 px-4 text-center text-red-600">{error}</p>;
    }

    // Group by form for rendering
    const groupedByForm = results.reduce((acc, entry) => {
        const form = entry.form;
        if (!acc[form]) acc[form] = [];
        acc[form].push(entry);
        return acc;
    }, {});

    return (
        <section className="pt-40 pb-20 px-4 max-w-6xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Exam Results Overview</h1>
                <p className="text-gray-600">Aggregated performance metrics by subject and form</p>
            </div>

            {Object.keys(groupedByForm).map((form) => (
                <div key={form} className="mb-6 bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold text-emerald-700 mb-4">Form {form}</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left border">
                            <thead className="bg-emerald-100 text-emerald-800">
                                <tr>
                                    <th className="p-2 border">Subject</th>
                                    <th className="p-2 border">Average</th>
                                    <th className="p-2 border">Median</th>
                                    <th className="p-2 border">Top 5</th>
                                    <th className="p-2 border">25th %</th>
                                    <th className="p-2 border">75th %</th>
                                </tr>
                            </thead>
                            <tbody>
                                {groupedByForm[form].map((entry, i) => (
                                    <tr key={i} className="border-t">
                                        <td className="p-2 border font-medium">{entry.subject}</td>
                                        <td className="p-2 border">{Number(entry.average).toFixed(2)}</td>
                                        <td className="p-2 border">{entry.percentiles?.p50 != null ? Number(entry.percentiles.p50).toFixed(2) : 'N/A'}</td>
                                        <td className="p-2 border">
                                            {entry.top5?.map(s => `${s.name} (${Number(s.average).toFixed(1)})`).join(', ') || 'N/A'}
                                        </td>
                                        <td className="p-2 border">{entry.percentiles?.p25 != null ? Number(entry.percentiles.p25).toFixed(2) : 'N/A'}</td>
                                        <td className="p-2 border">{entry.percentiles?.p75 != null ? Number(entry.percentiles.p75).toFixed(2) : 'N/A'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ))}
        </section>
    );
}

export default PortalExamResults;
