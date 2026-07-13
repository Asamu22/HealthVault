import { useMemo, useState } from 'react';
import { Button } from '../ui/Button';
import { TextField } from '../ui/TextField';
import type { StaffMember } from '../../types';

const INITIAL_STAFF_MEMBERS: StaffMember[] = [
  {
    id: '1',
    initials: 'JS',
    name: 'Dr. James Smith',
    email: 'jsmith@hospital.edu',
    role: 'Doctor',
    status: 'Active',
    lastActive: '2 mins ago',
  },
  {
    id: '2',
    initials: 'AL',
    name: 'Amanda Lewis',
    email: 'alewis@hospital.edu',
    role: 'Nurse',
    status: 'Active',
    lastActive: '1 hour ago',
  },
  {
    id: '3',
    initials: 'RP',
    name: 'Dr. Robert Patel',
    email: 'rpatel@hospital.edu',
    role: 'Fellow',
    status: 'Pending',
    lastActive: 'Never',
  },
];

const ROLE_OPTIONS = ['Doctor', 'physician', 'Nurse', 'Fellow', 'Resident', 'Pharmasist', 'Reserchers'];
const DEPARTMENT_OPTIONS = ['Cardiology', 'Radiology', 'Oncology', 'Pharmacy'];

function BackIcon() {
  return (
    <svg width="6" height="9" viewBox="0 0 6 9" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M3.45 4.5L0 1.05L1.05 0L5.55 4.5L1.05 9L0 7.95L3.45 4.5Z" fill="currentColor" />
    </svg>
  );
}

function ForwardIcon() {
  return (
    <svg width="6" height="9" viewBox="0 0 6 9" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M4.5 9L0 4.5L4.5 0L5.55 1.05L2.1 4.5L5.55 7.95L4.5 9Z" fill="currentColor" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg width="6" height="9" viewBox="0 0 6 9" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M4.5 9L0 4.5L4.5 0L5.55 1.05L2.1 4.5L5.55 7.95L4.5 9Z" fill="currentColor" />
    </svg>
  );
}

export function UsersManagementScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>(INITIAL_STAFF_MEMBERS);
  const [fullName, setFullName] = useState('');
  const [institutionalEmail, setInstitutionalEmail] = useState('');
  const [roleAssignment, setRoleAssignment] = useState('physician');
  const [departmentAssignment, setDepartmentAssignment] = useState('Cardiology');
  const [isAdmin, setIsAdmin] = useState('false');

  const filteredStaff = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return staffMembers;
    return staffMembers.filter((member) =>
      [member.name, member.email, member.role, member.department ?? '', member.status].some((value) => value.toLowerCase().includes(query)),
    );
  }, [searchQuery, staffMembers]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!fullName.trim() || !institutionalEmail.trim()) return;

    const initials = fullName
      .split(' ')
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('');

    const newMember: StaffMember = {
      id: `${Date.now()}`,
      initials,
      name: fullName.trim(),
      email: institutionalEmail.trim(),
      role: roleAssignment,
      department: departmentAssignment,
      status: 'Pending',
      lastActive: 'Just invited',
      isAdmin: isAdmin === 'true',
    };

    setStaffMembers((current) => [newMember, ...current]);
    setFullName('');
    setInstitutionalEmail('');
    setRoleAssignment('physician');
    setDepartmentAssignment('Cardiology');
    setIsAdmin('false');
  };

  return (
    <div className="users-page">
      <div className="users-topbar">
        <div className="users-topbar-title">
          <h1>Users Management</h1>
        </div>
      </div>

      <div className="users-grid">
        <section className="users-directory-card panel-card">
          <div className="users-directory-header">
            <div>
              <h2>Staff Directory</h2>
              <p>Manage personnel and assignments</p>
            </div>
            <div className="users-search-group">
              <div className="users-search-wrapper">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                  <path d="M16.6 18L10.3 11.7C9.8 12.1 9.225 12.4167 8.575 12.65C7.925 12.8833 7.23333 13 6.5 13C4.68333 13 3.14583 12.3708 1.8875 11.1125C0.629167 9.85417 0 8.31667 0 6.5C0 4.68333 0.629167 3.14583 1.8875 1.8875C3.14583 0.629167 4.68333 0 6.5 0C8.31667 0 9.85417 0.629167 11.1125 1.8875C12.3708 3.14583 13 4.68333 13 6.5C13 7.23333 12.8833 7.925 12.65 8.575C12.4167 9.225 12.1 9.8 11.7 10.3L18 16.6L16.6 18ZM6.5 11C7.75 11 8.8125 10.5625 9.6875 9.6875C10.5625 8.8125 11 7.75 11 6.5C11 5.25 10.5625 4.1875 9.6875 3.3125C8.8125 2.4375 7.75 2 6.5 2C5.25 2 4.1875 2.4375 3.3125 3.3125C2.4375 4.1875 2 5.25 2 6.5C2 7.75 2.4375 8.8125 3.3125 9.6875C4.1875 10.5625 5.25 11 6.5 11Z" fill="#667085" />
                </svg>
                <input
                  className="users-search-input"
                  type="text"
                  placeholder="Search staff..."
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                />
              </div>
              <button type="button" className="users-filter-button" aria-label="Filter staff">
                <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                  <path d="M3 4h12M6 9h6M8 14h2" stroke="#1f2937" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </div>

          <div className="users-table-wrap">
            <table className="users-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Last Active</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStaff.map((member) => (
                  <tr key={member.id}>
                    <td>
                      <div className="user-cell">
                        <div className="user-avatar">{member.initials}</div>
                        <div>
                          <div className="user-name">{member.name}</div>
                          <div className="user-email">{member.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>{member.role}</td>
                    <td>
                      <span className={`status-pill status-pill--${member.status.toLowerCase()}`}>
                        {member.status}
                      </span>
                    </td>
                    <td>{member.lastActive}</td>
                    <td>
                      <button type="button" className="icon-button users-action-button" aria-label="Row actions">
                        <svg width="4" height="16" viewBox="0 0 4 16" fill="none" aria-hidden="true">
                          <circle cx="2" cy="2" r="1.5" fill="#475569" />
                          <circle cx="2" cy="8" r="1.5" fill="#475569" />
                          <circle cx="2" cy="14" r="1.5" fill="#475569" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="users-table-footer">
            <span>Showing {filteredStaff.length}-3 of 42 staff members</span>
            <div className="pagination-controls">
              <button type="button" className="pagination-button" aria-label="Previous page">
                <BackIcon />
              </button>
              <button type="button" className="pagination-button" aria-label="Next page">
                <ForwardIcon />
              </button>
            </div>
          </div>
        </section>

        <aside className="users-provision-card panel-card">
          <div className="users-provision-header">
            <div className="users-provision-title-row">
              <div className="users-provision-icon">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                  <path d="M9 2.25C10.7949 2.25 12.25 3.70507 12.25 5.5C12.25 7.29493 10.7949 8.75 9 8.75C7.20507 8.75 5.75 7.29493 5.75 5.5C5.75 3.70507 7.20507 2.25 9 2.25Z" stroke="#0f4fff" strokeWidth="1.5" />
                  <path d="M3.75 14.25C3.75 11.8995 5.64951 10 8 10H10C12.3505 10 14.25 11.8995 14.25 14.25V15.75H3.75V14.25Z" stroke="#0f4fff" strokeWidth="1.5" />
                  <path d="M12.75 2.25H14.25V3.75" stroke="#0f4fff" strokeWidth="1.5" strokeLinecap="round" />
                  <path d="M5.25 2.25H3.75V3.75" stroke="#0f4fff" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <h2>Provision Staff</h2>
            </div>
          </div>

          <form className="users-provision-form" onSubmit={handleSubmit}>
            <TextField
              label="Full Name"
              placeholder="e.g., Dr. Alice Chen"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
            />

            <TextField
              label="Institutional Email"
              placeholder="achen@hospital.edu"
              value={institutionalEmail}
              onChange={(event) => setInstitutionalEmail(event.target.value)}
            />

            <label className="field-label">
              Department
              <select
                className="access-select"
                value={departmentAssignment}
                onChange={(event) => setDepartmentAssignment(event.target.value)}
              >
                {DEPARTMENT_OPTIONS.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </label>

            <label className="field-label">
              Clinical Role Assignment
              <select
                className="access-select"
                value={roleAssignment}
                onChange={(event) => setRoleAssignment(event.target.value)}
              >
                {ROLE_OPTIONS.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </label>

            <label className="field-label">
              Administrator
              <select
                className="access-select"
                value={isAdmin}
                onChange={(event) => setIsAdmin(event.target.value)}
              >
                <option value="true">True</option>
                <option value="false">False</option>
              </select>
            </label>

            <Button type="submit" variant="primary" size="md" icon={<SendIcon />}>Send Invitation</Button>
          </form>
        </aside>
      </div>
    </div>
  );
}
