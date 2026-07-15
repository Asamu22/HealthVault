import { useState, useEffect, useRef } from 'react';
import {
  fetchPolicies,
  deletePolicy,
  updatePolicy,
  type AccessPolicy,
  type PolicyCondition,
} from '../../lib/supabase';

// ─── Constants ───────────────────────────────────────────────────────────────
const ROLE_OPTIONS = ['Doctor', 'Physician', 'Nurse', 'Fellow', 'Resident', 'Pharmacist', 'Researcher'];
const DEPARTMENT_OPTIONS = ['Any', 'Cardiology', 'Radiology', 'Oncology', 'Pharmacy', 'Emergency'];
const ACTION_OPTIONS = ['Read (View Only)', 'Write (Modify)', 'Delete', 'Administer'];
const SENSITIVITY_OPTIONS = ['Critical (PHI)', 'Confidential', 'Restricted', 'Public'];
const ENVIRONMENT_OPTIONS = ['Any', 'During Active Shift Hours', 'Within Network', 'Outside Business Hours', 'Emergency Override'];
const CONDITION_FIELD_OPTIONS = ['Subject Role', 'Action', 'Resource Sensitivity', 'Environment'] as const;
type ConditionField = (typeof CONDITION_FIELD_OPTIONS)[number];
const CONDITION_VALUE_OPTIONS: Record<ConditionField, readonly string[]> = {
  'Subject Role': ROLE_OPTIONS,
  Action: ACTION_OPTIONS,
  'Resource Sensitivity': SENSITIVITY_OPTIONS,
  Environment: ENVIRONMENT_OPTIONS,
};

// ─── Sub-components ──────────────────────────────────────────────────────────
function EffectBadge({ effect }: { effect: 'allow' | 'deny' }) {
  const allow = effect === 'allow';
  return (
    <span className={`policy-effect-badge ${allow ? 'policy-effect-badge--allow' : 'policy-effect-badge--deny'}`}>
      {allow ? '✓ Allow' : '✕ Deny'}
    </span>
  );
}

function DryRunBadge() {
  return <span className="policy-dryrun-badge">Dry-run</span>;
}

// ─── Edit Modal ───────────────────────────────────────────────────────────────
interface EditModalProps {
  policy: AccessPolicy;
  onClose: () => void;
  onSaved: (updated: AccessPolicy) => void;
}

function EditModal({ policy, onClose, onSaved }: EditModalProps) {
  const [name, setName] = useState(policy.name);
  const [department, setDepartment] = useState(policy.department);
  const [subjectRole, setSubjectRole] = useState(policy.subject_role);
  const [actionType, setActionType] = useState(policy.action);
  const [sensitivity, setSensitivity] = useState(policy.resource_sensitivity);
  const [environment, setEnvironment] = useState(policy.environment);
  const [effect, setEffect] = useState<'allow' | 'deny'>(policy.effect);
  const [isDryRun, setIsDryRun] = useState(policy.is_dry_run);
  const [conditions, setConditions] = useState<(PolicyCondition & { id: string })[]>(
    (policy.extra_conditions ?? []).map((c, i) => ({ ...c, id: `ec-${i}` })),
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const addCondition = () =>
    setConditions((c) => [...c, { id: `ec-${Date.now()}`, field: 'Subject Role', value: ROLE_OPTIONS[0] }]);

  const updateCondField = (id: string, field: string) =>
    setConditions((c) =>
      c.map((x) => x.id === id ? { ...x, field, value: CONDITION_VALUE_OPTIONS[field as ConditionField][0] } : x),
    );

  const updateCondValue = (id: string, value: string) =>
    setConditions((c) => c.map((x) => x.id === id ? { ...x, value } : x));

  const removeCond = (id: string) =>
    setConditions((c) => c.filter((x) => x.id !== id));

  const handleSave = async () => {
    if (!name.trim()) { setError('Policy name is required.'); return; }
    setSaving(true); setError(null);
    try {
      const updated = await updatePolicy(policy.id, {
        name: name.trim(), department, subject_role: subjectRole,
        action: actionType, resource_sensitivity: sensitivity,
        environment, extra_conditions: conditions.map(({ field, value }) => ({ field, value })),
        effect, is_dry_run: isDryRun,
      });
      onSaved(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" ref={overlayRef} onClick={(e) => e.target === overlayRef.current && onClose()}>
      <div className="modal-panel">
        {/* Header */}
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Edit Policy</h2>
            <p className="modal-subtitle">ID: {policy.id.slice(0, 8)}…</p>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="modal-body">
          {/* Basic fields */}
          <div className="modal-form-grid">
            <label className="field-label">
              Policy Name
              <input className="modal-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Policy name" />
            </label>
            <label className="field-label">
              Department Scope
              <select className="access-select" value={department} onChange={(e) => setDepartment(e.target.value)}>
                {DEPARTMENT_OPTIONS.map((o) => <option key={o}>{o}</option>)}
              </select>
            </label>
            <label className="field-label">
              Subject Role
              <select className="access-select" value={subjectRole} onChange={(e) => setSubjectRole(e.target.value)}>
                {ROLE_OPTIONS.map((o) => <option key={o}>{o}</option>)}
              </select>
            </label>
            <label className="field-label">
              Action
              <select className="access-select" value={actionType} onChange={(e) => setActionType(e.target.value)}>
                {ACTION_OPTIONS.map((o) => <option key={o}>{o}</option>)}
              </select>
            </label>
            <label className="field-label">
              Resource Sensitivity
              <select className="access-select" value={sensitivity} onChange={(e) => setSensitivity(e.target.value)}>
                {SENSITIVITY_OPTIONS.map((o) => <option key={o}>{o}</option>)}
              </select>
            </label>
            <label className="field-label">
              Environment
              <select className="access-select" value={environment} onChange={(e) => setEnvironment(e.target.value)}>
                {ENVIRONMENT_OPTIONS.map((o) => <option key={o}>{o}</option>)}
              </select>
            </label>
          </div>

          {/* Extra conditions */}
          <div className="modal-section-label">Extra Conditions</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {conditions.map((c) => (
              <div key={c.id} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <select className="access-select" style={{ flex: 1 }} value={c.field} onChange={(e) => updateCondField(c.id, e.target.value)}>
                  {CONDITION_FIELD_OPTIONS.map((f) => <option key={f}>{f}</option>)}
                </select>
                <select className="access-select" style={{ flex: 1 }} value={c.value} onChange={(e) => updateCondValue(c.id, e.target.value)}>
                  {CONDITION_VALUE_OPTIONS[c.field as ConditionField]?.map((o) => <option key={o}>{o}</option>)}
                </select>
                <button type="button" onClick={() => removeCond(c.id)} style={{ border: 'none', background: 'transparent', color: '#BA1A1A', cursor: 'pointer', fontSize: 16, padding: '0 4px' }}>✕</button>
              </div>
            ))}
            <button type="button" className="condition-add-button" onClick={addCondition}>+ Add condition</button>
          </div>

          {/* Effect + Dry-run */}
          <div className="modal-section-label" style={{ marginTop: 16 }}>Effect</div>
          <div style={{ display: 'flex', gap: 12 }}>
            {(['allow', 'deny'] as const).map((e) => (
              <button key={e} type="button"
                className={`effect-card effect-card--${e} ${effect === e ? 'effect-card--selected' : ''}`}
                style={{ flex: 1 }}
                onClick={() => setEffect(e)}
              >
                <div className="effect-card-icon">{e === 'allow' ? '✓' : '✕'}</div>
                <div>
                  <p className="effect-card-title">{e === 'allow' ? 'Allow Access' : 'Deny Access'}</p>
                </div>
              </button>
            ))}
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 16, cursor: 'pointer' }}>
            <input type="checkbox" checked={isDryRun} onChange={(e) => setIsDryRun(e.target.checked)} />
            <span style={{ fontSize: 14, color: '#434654' }}>Dry-run mode (excluded from live evaluation)</span>
          </label>

          {error && <p style={{ color: '#BA1A1A', fontSize: 13, marginTop: 10 }}>⚠ {error}</p>}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button type="button" className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────
export function PoliciesScreen() {
  const [policies, setPolicies] = useState<AccessPolicy[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterEffect, setFilterEffect] = useState<'all' | 'allow' | 'deny'>('all');
  const [filterDryRun, setFilterDryRun] = useState<'all' | 'live' | 'dry'>('all');
  const [editingPolicy, setEditingPolicy] = useState<AccessPolicy | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchPolicies().then((data) => { setPolicies(data); setLoading(false); });
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this policy? This cannot be undone.')) return;
    setDeletingId(id);
    try {
      await deletePolicy(id);
      setPolicies((p) => p.filter((x) => x.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Delete failed.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleSaved = (updated: AccessPolicy) => {
    setPolicies((p) => p.map((x) => x.id === updated.id ? updated : x));
    setEditingPolicy(null);
  };

  const filtered = policies.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch = !q || p.name.toLowerCase().includes(q) || p.subject_role.toLowerCase().includes(q) || p.department.toLowerCase().includes(q);
    const matchEffect = filterEffect === 'all' || p.effect === filterEffect;
    const matchDryRun = filterDryRun === 'all' || (filterDryRun === 'live' && !p.is_dry_run) || (filterDryRun === 'dry' && p.is_dry_run);
    return matchSearch && matchEffect && matchDryRun;
  });

  return (
    <div className="policies-screen">
      {/* Header */}
      <div className="policies-header">
        <div>
          <h1 className="policies-title">Access Policies</h1>
          <p className="policies-subtitle">{policies.length} total · {policies.filter(p => !p.is_dry_run).length} live · {policies.filter(p => p.is_dry_run).length} dry-run</p>
        </div>
      </div>

      {/* Filters */}
      <div className="policies-filters panel-card">
        <input
          className="policies-search"
          type="search"
          placeholder="Search by name, role, department…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <label className="field-label" style={{ marginBottom: 0 }}>
          Effect
          <select className="access-select" value={filterEffect} onChange={(e) => setFilterEffect(e.target.value as typeof filterEffect)}>
            <option value="all">All</option>
            <option value="allow">Allow</option>
            <option value="deny">Deny</option>
          </select>
        </label>
        <label className="field-label" style={{ marginBottom: 0 }}>
          Mode
          <select className="access-select" value={filterDryRun} onChange={(e) => setFilterDryRun(e.target.value as typeof filterDryRun)}>
            <option value="all">All</option>
            <option value="live">Live only</option>
            <option value="dry">Dry-run only</option>
          </select>
        </label>
        <span className="policies-count">{filtered.length} showing</span>
      </div>

      {/* Table */}
      <div className="policies-table-wrap panel-card">
        {loading ? (
          <div className="policies-empty">
            <div className="pdf-spinner" style={{ margin: '0 auto 12px' }} />
            <p>Loading policies…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="policies-empty">
            <span style={{ fontSize: 32 }}>🔐</span>
            <p>{policies.length === 0 ? 'No policies created yet. Use Access Control to add one.' : 'No policies match your filters.'}</p>
          </div>
        ) : (
          <table className="policies-table">
            <thead>
              <tr>
                <th>Policy Name</th>
                <th>Role</th>
                <th>Action</th>
                <th>Department</th>
                <th>Sensitivity</th>
                <th>Environment</th>
                <th>Effect</th>
                <th>Mode</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((policy) => (
                <tr key={policy.id} className="policies-row">
                  <td className="policies-cell--name">
                    <span className="policy-name">{policy.name}</span>
                    {(policy.extra_conditions?.length ?? 0) > 0 && (
                      <span className="policy-extra-badge">+{policy.extra_conditions.length} cond.</span>
                    )}
                  </td>
                  <td>{policy.subject_role}</td>
                  <td>{policy.action}</td>
                  <td>{policy.department}</td>
                  <td>{policy.resource_sensitivity}</td>
                  <td>{policy.environment}</td>
                  <td><EffectBadge effect={policy.effect} /></td>
                  <td>{policy.is_dry_run ? <DryRunBadge /> : <span className="policy-live-badge">Live</span>}</td>
                  <td style={{ whiteSpace: 'nowrap', color: '#737685', fontSize: 12 }}>
                    {new Date(policy.created_at).toLocaleDateString()}
                  </td>
                  <td>
                    <div className="policy-actions">
                      <button
                        type="button"
                        className="policy-action-btn policy-action-btn--edit"
                        onClick={() => setEditingPolicy(policy)}
                        title="Edit policy"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        type="button"
                        className="policy-action-btn policy-action-btn--delete"
                        onClick={() => handleDelete(policy.id)}
                        disabled={deletingId === policy.id}
                        title="Delete policy"
                      >
                        {deletingId === policy.id ? '…' : '🗑'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Edit Modal */}
      {editingPolicy && (
        <EditModal
          policy={editingPolicy}
          onClose={() => setEditingPolicy(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
