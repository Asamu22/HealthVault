import { useEffect, useMemo, useState } from 'react';
import { Button } from '../ui/Button';
import { TextField } from '../ui/TextField';
import type { StaffMember } from '../../types';
import { createStaffMember, fetchStaffMembers } from '../../lib/supabase';

const ROLE_OPTIONS = ['Doctor', 'Physician', 'Nurse', 'Fellow', 'Resident', 'Pharmacist', 'Researcher'];
const DEPARTMENT_OPTIONS = ['Cardiology', 'Radiology', 'Oncology', 'Pharmacy'];

function BackIcon() {
  return (
    <svg width="6" height="9" viewBox="0 0 6 9" fill="none" aria-hidden="true">
      <path d="M4.5 9L0 4.5L4.5 0L5.55 1.05L2.1 4.5L5.55 7.95L4.5 9Z" fill="currentColor" />
    </svg>
  );
}

function ForwardIcon() {
  return (
    <svg width="6" height="9" viewBox="0 0 6 9" fill="none" aria-hidden="true">
      <path d="M3.45 4.5L0 1.05L1.05 0L5.55 4.5L1.05 9L0 7.95L3.45 4.5Z" fill="currentColor" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function EyeIcon({ show }: { show: boolean }) {
  return show ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" stroke="#667085" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="3" stroke="#667085" strokeWidth="1.5" />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19M1 1l22 22" stroke="#667085" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

const PAGE_SIZE = 8;

export function UsersManagementScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [isLoadingStaff, setIsLoadingStaff] = useState(true);
  const [page, setPage] = useState(1);

  // Form state
  const [fullName, setFullName] = useState('');
  const [institutionalEmail, setInstitutionalEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [roleAssignment, setRoleAssignment] = useState('Physician');
  const [departmentAssignment, setDepartmentAssignment] = useState('Cardiology');
  const [isAdmin, setIsAdmin] = useState('false');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState(false);

  // Load staff from Supabase on mount
  useEffect(() => {
    setIsLoadingStaff(true);
    fetchStaffMembers()
      .then((members) => setStaffMembers(members))
      .finally(() => setIsLoadingStaff(false));
  }, []);

  const filteredStaff = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return staffMembers;
    return staffMembers.filter((member) =>
      [member.name, member.email, member.role, member.department ?? '', member.status].some((v) =>
        v.toLowerCase().includes(query),
      ),
    );
  }, [searchQuery, staffMembers]);

  const totalPages = Math.max(1, Math.ceil(filteredStaff.length / PAGE_SIZE));
  const pagedStaff = filteredStaff.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    setFormSuccess(false);

    if (!fullName.trim() || !institutionalEmail.trim() || !password.trim()) {
      setFormError('Full name, email, and password are required.');
      return;
    }
    if (password.length < 8) {
      setFormError('Password must be at least 8 characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      const newMember = await createStaffMember({
        fullName: fullName.trim(),
        email: institutionalEmail.trim(),
        password,
        role: roleAssignment,
        department: departmentAssignment,
        isAdmin: isAdmin === 'true',
      });

      setStaffMembers((prev) => [newMember, ...prev]);
      setFullName('');
      setInstitutionalEmail('');
      setPassword('');
      setRoleAssignment('Physician');
      setDepartmentAssignment('Cardiology');
      setIsAdmin('false');
      setFormSuccess(true);
      setTimeout(() => setFormSuccess(false), 4000);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="users-page">
      <div className="users-topbar">
        <div className="users-topbar-title">
          <h1>Users Management</h1>
        </div>
      </div>

      <div className="users-grid">
        {/* ── Staff Directory ── */}
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
                  onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
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
                {isLoadingStaff ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: '#667085' }}>
                      Loading staff directory…
                    </td>
                  </tr>
                ) : pagedStaff.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: '#667085' }}>
                      {searchQuery ? 'No staff match your search.' : 'No staff members yet. Use the form to add one.'}
                    </td>
                  </tr>
                ) : (
                  pagedStaff.map((member) => (
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
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="users-table-footer">
            <span>
              {isLoadingStaff
                ? 'Loading…'
                : `Showing ${pagedStaff.length} of ${filteredStaff.length} staff member${filteredStaff.length !== 1 ? 's' : ''}`}
            </span>
            <div className="pagination-controls">
              <button
                type="button"
                className="pagination-button"
                aria-label="Previous page"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <BackIcon />
              </button>
              <span style={{ fontSize: '0.8rem', color: '#667085', padding: '0 4px' }}>{page} / {totalPages}</span>
              <button
                type="button"
                className="pagination-button"
                aria-label="Next page"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                <ForwardIcon />
              </button>
            </div>
          </div>
        </section>

        {/* ── Provision Staff Form ── */}
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

          <form className="users-provision-form" onSubmit={handleSubmit} noValidate>
            <TextField
              label="Full Name"
              placeholder="e.g., Dr. Alice Chen"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />

            <TextField
              label="Institutional Email"
              type="email"
              placeholder="achen@hospital.edu"
              value={institutionalEmail}
              onChange={(e) => setInstitutionalEmail(e.target.value)}
              required
            />

            {/* Password field with show/hide toggle */}
            <div className="text-field">
              <label htmlFor="provision-password" className="text-field-label">
                Password
              </label>
              <div className="text-field-control" style={{ position: 'relative' }}>
                <input
                  id="provision-password"
                  className="text-field-input"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                  style={{ paddingRight: '2.5rem' }}
                />
                <button
                  type="button"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword((v) => !v)}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    padding: 0,
                  }}
                >
                  <EyeIcon show={showPassword} />
                </button>
              </div>
            </div>

            <label className="field-label">
              Department
              <select
                className="access-select"
                value={departmentAssignment}
                onChange={(e) => setDepartmentAssignment(e.target.value)}
              >
                {DEPARTMENT_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </label>

            <label className="field-label">
              Clinical Role Assignment
              <select
                className="access-select"
                value={roleAssignment}
                onChange={(e) => setRoleAssignment(e.target.value)}
              >
                {ROLE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </label>

            <label className="field-label">
              Administrator
              <select
                className="access-select"
                value={isAdmin}
                onChange={(e) => setIsAdmin(e.target.value)}
              >
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </label>

            {formError && (
              <p style={{ color: '#BA1A1A', fontSize: '0.825rem', margin: '0.25rem 0' }}>
                ⚠ {formError}
              </p>
            )}

            {formSuccess && (
              <p style={{ color: '#004E32', fontSize: '0.825rem', margin: '0.25rem 0' }}>
                ✓ User created successfully.
              </p>
            )}

            <Button
              type="submit"
              variant="primary"
              size="md"
              icon={<SendIcon />}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating…' : 'Create User'}
            </Button>
          </form>
        </aside>
      </div>
    </div>
  );
}
