import React, { useState, useEffect } from 'react';
import styles from '../styles/admin.module.css';

const Admin = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        verifiedUsers: 0,
        activeUsers: 0,
        onboardedUsers: 0,
        snoozedUsers: 0,
    });
    const [users, setUsers] = useState([]);
    const [reports, setReports] = useState([]);
    const [userPage, setUserPage] = useState(1);
    const [reportPage, setReportPage] = useState(1);
    const [userTotal, setUserTotal] = useState(0);
    const [reportTotal, setReportTotal] = useState(0);
    const [limit] = useState(10); // Items per page
    const [error, setError] = useState(null);

    // Fetch stats
    const fetchStats = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/admin/stats', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to fetch stats');
            setStats(data.stats);
        } catch (err) {
            setError(err.message);
        }
    };

    // Fetch users
    const fetchUsers = async (page) => {
        try {
            const response = await fetch(`http://localhost:5000/api/admin/users?page=${page}&limit=${limit}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to fetch users');
            setUsers(data.users);
            setUserTotal(data.total);
        } catch (err) {
            setError(err.message);
        }
    };

    // Fetch reports
    const fetchReports = async (page) => {
        try {
            const response = await fetch(`http://localhost:5000/api/admin/reports?page=${page}&limit=${limit}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to fetch reports');
            setReports(data.reports);
            setReportTotal(data.total);
        } catch (err) {
            setError(err.message);
        }
    };

    // Update report status
    const updateReportStatus = async (reportId, status) => {
        try {
            const response = await fetch('http://localhost:5000/api/admin/reports/status', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({ reportId, status }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to update report status');
            setReports((prev) =>
                prev.map((report) =>
                    report.reportId === reportId ? { ...report, status } : report
                )
            );
        } catch (err) {
            setError(err.message);
        }
    };

    // Suspend user
    const suspendUser = async (userId) => {
        try {
            const response = await fetch('http://localhost:5000/api/admin/users/suspend', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({ userId }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to suspend user');
            setUsers((prev) =>
                prev.map((user) =>
                    user._id === userId ? { ...user, snoozeMode: true } : user
                )
            );
        } catch (err) {
            setError(err.message);
        }
    };

    // Fetch data on component mount and page change
    useEffect(() => {
        fetchStats();
        fetchUsers(userPage);
        fetchReports(reportPage);
    }, [userPage, reportPage]);

    // Pagination handlers
    const handleUserPageChange = (newPage) => {
        if (newPage >= 1 && newPage <= Math.ceil(userTotal / limit)) {
            setUserPage(newPage);
        }
    };

    const handleReportPageChange = (newPage) => {
        if (newPage >= 1 && newPage <= Math.ceil(reportTotal / limit)) {
            setReportPage(newPage);
        }
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.headerTitle}>Admin Dashboard</h1>
                <p className={styles.headerSubtitle}>User Management and Statistics</p>
                {error && <p className={styles.error}>{error}</p>}
            </header>

            {/* Stats Overview */}
            <section className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <h2 className={styles.statTitle}>Total Users</h2>
                    <p className={styles.statValueBlue}>{stats.totalUsers}</p>
                </div>
                <div className={styles.statCard}>
                    <h2 className={styles.statTitle}>Verified Users</h2>
                    <p className={styles.statValueGreen}>{stats.verifiedUsers}</p>
                </div>
                <div className={styles.statCard}>
                    <h2 className={styles.statTitle}>Active Users</h2>
                    <p className={styles.statValuePurple}>{stats.activeUsers}</p>
                </div>
                <div className={styles.statCard}>
                    <h2 className={styles.statTitle}>Onboarded Users</h2>
                    <p className={styles.statValueYellow}>{stats.onboardedUsers}</p>
                </div>
                <div className={styles.statCard}>
                    <h2 className={styles.statTitle}>Snoozed Accounts</h2>
                    <p className={styles.statValueRed}>{stats.snoozedUsers}</p>
                </div>
            </section>

            {/* User List */}
            <section className={styles.userListSection}>
                <h2 className={styles.sectionTitle}>User List</h2>
                <div className={styles.tableContainer}>
                    <table className={styles.userTable}>
                        <thead>
                            <tr className={styles.tableHeader}>
                                <th className={styles.tableHeaderCell}>Name</th>
                                <th className={styles.tableHeaderCell}>Email</th>
                                <th className={styles.tableHeaderCell}>Age</th>
                                <th className={styles.tableHeaderCell}>Gender</th>
                                <th className={styles.tableHeaderCell}>Location</th>
                                <th className={styles.tableHeaderCell}>Verified</th>
                                <th className={styles.tableHeaderCell}>Last Active</th>
                                <th className={styles.tableHeaderCell}>Matches</th>
                                <th className={styles.tableHeaderCell}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user._id} className={styles.tableRow}>
                                    <td className={styles.tableCell}>{user.name}</td>
                                    <td className={styles.tableCell}>{user.email}</td>
                                    <td className={styles.tableCell}>{user.age}</td>
                                    <td className={styles.tableCell}>{user.gender}</td>
                                    <td className={styles.tableCell}>{`${user.location.city}, ${user.location.country}`}</td>
                                    <td className={styles.tableCell}>
                                        {user.isVerified ? (
                                            <span className={styles.verified}>Yes</span>
                                        ) : (
                                            <span className={styles.notVerified}>No</span>
                                        )}
                                    </td>
                                    <td className={styles.tableCell}>
                                        {new Date(user.lastActive).toLocaleDateString()}
                                    </td>
                                    <td className={styles.tableCell}>{user.matches.length || 0}</td>
                                    <td className={styles.tableCell}>
                                        <button
                                            className={styles.suspendButton}
                                            onClick={() => suspendUser(user._id)}
                                            disabled={user.snoozeMode}
                                        >
                                            {user.snoozeMode ? 'Suspended' : 'Suspend'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className={styles.pagination}>
                    <button
                        onClick={() => handleUserPageChange(userPage - 1)}
                        disabled={userPage === 1}
                    >
                        Previous
                    </button>
                    <span>Page {userPage} of {Math.ceil(userTotal / limit)}</span>
                    <button
                        onClick={() => handleUserPageChange(userPage + 1)}
                        disabled={userPage === Math.ceil(userTotal / limit)}
                    >
                        Next
                    </button>
                </div>
            </section>

            {/* Reports and Spam Section */}
            <section className={styles.reportSection}>
                <h2 className={styles.sectionTitle}>Reports and Spam</h2>
                <div className={styles.tableContainer}>
                    <table className={styles.userTable}>
                        <thead>
                            <tr className={styles.tableHeader}>
                                <th className={styles.tableHeaderCell}>Report ID</th>
                                <th className={styles.tableHeaderCell}>Reported User</th>
                                <th className={styles.tableHeaderCell}>Reported By</th>
                                <th className={styles.tableHeaderCell}>Severity</th>
                                <th className={styles.tableHeaderCell}>Issue</th>
                                <th className={styles.tableHeaderCell}>Status</th>
                                <th className={styles.tableHeaderCell}>Reported At</th>
                                <th className={styles.tableHeaderCell}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reports.map((report) => (
                                <tr key={report.reportId} className={styles.tableRow}>
                                    <td className={styles.tableCell}>{report.reportId}</td>
                                    <td className={styles.tableCell}>{report.reportedUser}</td>
                                    <td className={styles.tableCell}>{report.reportedBy}</td>
                                    <td className={styles.tableCell}>
                                        <span
                                            className={
                                                report.severity === 'Critical'
                                                    ? styles.critical
                                                    : report.severity === 'Mild'
                                                        ? styles.mild
                                                        : styles.normal
                                            }
                                        >
                                            {report.severity}
                                        </span>
                                    </td>
                                    <td className={styles.tableCell}>{report.issue}</td>
                                    <td className={styles.tableCell}>{report.status}</td>
                                    <td className={styles.tableCell}>
                                        {new Date(report.reportedAt).toLocaleDateString()}
                                    </td>
                                    <td className={styles.tableCell}>
                                        <select
                                            value={report.status}
                                            onChange={(e) => updateReportStatus(report.reportId, e.target.value)}
                                            className={styles.statusSelect}
                                        >
                                            <option value="Pending">Pending</option>
                                            <option value="Under Review">Under Review</option>
                                            <option value="Resolved">Resolved</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className={styles.pagination}>
                    <button
                        onClick={() => handleReportPageChange(reportPage - 1)}
                        disabled={reportPage === 1}
                    >
                        Previous
                    </button>
                    <span>Page {reportPage} of {Math.ceil(reportTotal / limit)}</span>
                    <button
                        onClick={() => handleReportPageChange(reportPage + 1)}
                        disabled={reportPage === Math.ceil(reportTotal / limit)}
                    >
                        Next
                    </button>
                </div>
            </section>
        </div>
    );
};

export default Admin;