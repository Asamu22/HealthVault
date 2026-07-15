import { useState } from 'react';
import { Button } from '../ui/Button';
import { TextField } from '../ui/TextField';
import {
  savePolicy,
  evaluateAccess,
  type EvaluateResult,
} from '../../lib/supabase';

function LockIcon() {
  return (
    <svg width="14" height="18" viewBox="0 0 14 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M1.66667 17.5C1.20833 17.5 0.815972 17.3368 0.489583 17.0104C0.163194 16.684 0 16.2917 0 15.8333V7.5C0 7.04167 0.163194 6.64931 0.489583 6.32292C0.815972 5.99653 1.20833 5.83333 1.66667 5.83333H2.5V4.16667C2.5 3.01389 2.90625 2.03125 3.71875 1.21875C4.53125 0.40625 5.51389 0 6.66667 0C7.81944 0 8.80208 0.40625 9.61458 1.21875C10.4271 2.03125 10.8333 3.01389 10.8333 4.16667V5.83333H11.6667C12.125 5.83333 12.5174 5.99653 12.8438 6.32292C13.1701 6.64931 13.3333 7.04167 13.3333 7.5V15.8333C13.3333 16.2917 13.1701 16.684 12.8438 17.0104C12.5174 17.3368 12.125 17.5 11.6667 17.5H1.66667ZM1.66667 15.8333H11.6667V7.5H1.66667V15.8333ZM6.66667 13.3333C7.125 13.3333 7.51736 13.1701 7.84375 12.8438C8.17014 12.5174 8.33333 12.125 8.33333 11.6667C8.33333 11.2083 8.17014 10.816 7.84375 10.4896C7.51736 10.1632 7.125 10 6.66667 10C6.20833 10 5.81597 10.1632 5.48958 10.4896C5.16319 10.816 5 11.2083 5 11.6667C5 12.125 5.16319 12.5174 5.48958 12.8438C5.81597 13.1701 6.20833 13.3333 6.66667 13.3333ZM4.16667 5.83333H9.16667V4.16667C9.16667 3.47222 8.92361 2.88194 8.4375 2.39583C7.95139 1.90972 7.36111 1.66667 6.66667 1.66667C5.97222 1.66667 5.38194 1.90972 4.89583 2.39583C4.40972 2.88194 4.16667 3.47222 4.16667 4.16667V5.83333ZM1.66667 15.8333V7.5V15.8333Z" fill="#737685"/>
    </svg>
  );
}

const ROLE_OPTIONS = ['Doctor', 'Physician', 'Nurse', 'Fellow', 'Resident', 'Pharmacist', 'Researcher'];
const DEPARTMENT_OPTIONS = ['Any', 'Cardiology', 'Radiology', 'Oncology', 'Pharmacy', 'Emergency'];
const ACTION_OPTIONS = ['Read (View Only)', 'Write (Modify)', 'Delete', 'Administer'];
const SENSITIVITY_OPTIONS = ['Critical (PHI)', 'Confidential', 'Restricted', 'Public'];
const ENVIRONMENT_OPTIONS = ['Any', 'During Active Shift Hours', 'Within Network', 'Outside Business Hours', 'Emergency Override'];
const CONDITION_FIELD_OPTIONS = ['Subject Role', 'Action', 'Resource Sensitivity', 'Environment'] as const;

type ConditionField = (typeof CONDITION_FIELD_OPTIONS)[number];

interface Condition {
  id: string;
  field: ConditionField;
  value: string;
}

const CONDITION_VALUE_OPTIONS: Record<ConditionField, readonly string[]> = {
  'Subject Role': ROLE_OPTIONS,
  Action: ACTION_OPTIONS,
  'Resource Sensitivity': SENSITIVITY_OPTIONS,
  Environment: ENVIRONMENT_OPTIONS,
};

export function AccessControlScreen() {
  // ── Form state ──────────────────────────────────────────────────────────
  const [dryRunMode, setDryRunMode] = useState(true);
  const [policyName, setPolicyName] = useState('');
  const [department, setDepartment] = useState('Cardiology');
  const [subjectRole, setSubjectRole] = useState('Doctor');
  const [actionType, setActionType] = useState('Read (View Only)');
  const [resourceSensitivity, setResourceSensitivity] = useState('Critical (PHI)');
  const [environment, setEnvironment] = useState('During Active Shift Hours');
  const [extraConditions, setExtraConditions] = useState<Condition[]>([]);
  const [effect, setEffect] = useState<'allow' | 'deny'>('allow');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // ── Evaluate state ───────────────────────────────────────────────────────
  const [evalRole, setEvalRole] = useState('Doctor');
  const [evalAction, setEvalAction] = useState('Read (View Only)');
  const [evalSensitivity, setEvalSensitivity] = useState('Critical (PHI)');
  const [evalDept, setEvalDept] = useState('Cardiology');
  const [evalEnv, setEvalEnv] = useState('During Active Shift Hours');
  const [evaluating, setEvaluating] = useState(false);
  const [evalResult, setEvalResult] = useState<EvaluateResult | null>(null);
  const [evalError, setEvalError] = useState<string | null>(null);

  const addCondition = () => {
    setExtraConditions((c) => [
      ...c,
      { id: `cond-${Date.now()}`, field: 'Subject Role', value: ROLE_OPTIONS[0] },
    ]);
  };

  const updateConditionField = (id: string, field: ConditionField) => {
    setExtraConditions((c) =>
      c.map((x) => (x.id === id ? { ...x, field, value: CONDITION_VALUE_OPTIONS[field][0] } : x)),
    );
  };

  const updateConditionValue = (id: string, value: string) => {
    setExtraConditions((c) => c.map((x) => (x.id === id ? { ...x, value } : x)));
  };

  const removeCondition = (id: string) => {
    setExtraConditions((c) => c.filter((x) => x.id !== id));
  };

  const handleSave = async () => {
    if (!policyName.trim()) { setSaveError('Policy name is required.'); return; }
    setSaving(true); setSaveError(null); setSaveSuccess(false);
    try {
      await savePolicy({
        name: policyName.trim(),
        department, subject_role: subjectRole, action: actionType,
        resource_sensitivity: resourceSensitivity, environment,
        extra_conditions: extraConditions.map(({ field, value }) => ({ field, value })),
        effect, is_dry_run: dryRunMode,
      });
      setSaveSuccess(true);
      setPolicyName('');
      setExtraConditions([]);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  const handleEvaluate = async () => {
    setEvaluating(true); setEvalError(null); setEvalResult(null);
    try {
      const result = await evaluateAccess({
        subject_role: evalRole, action: evalAction,
        resource_sensitivity: evalSensitivity, department: evalDept, environment: evalEnv,
      });
      setEvalResult(result);
    } catch (err) {
      setEvalError(err instanceof Error ? err.message : 'Evaluation failed.');
    } finally {
      setEvaluating(false);
    }
  };

  return (
    <div className="access-control-screen">

      {/* ── Policy Builder ── */}
      <div className="access-card panel-card">
        <div className="access-card-header">
          <h1 className="access-card-title">New Access Policy</h1>
          <button
            type="button"
            className={`dry-run-toggle ${dryRunMode ? 'dry-run-toggle--active' : ''}`}
            onClick={() => setDryRunMode((v) => !v)}
          >
            <span className="dry-run-switch" aria-hidden="true" />
            <span className="dry-run-label">Dry-run mode {dryRunMode ? '(on)' : '(off)'}</span>
          </button>
        </div>

        <div className="policy-form-grid">
          <div className="policy-form-field">
            <TextField
              label="Policy Name"
              placeholder="e.g., Cardiologist Emergency Read"
              value={policyName}
              onChange={(e) => setPolicyName(e.target.value)}
            />
          </div>
          <label className="field-label policy-form-field">
            Department Scope
            <select className="access-select" value={department} onChange={(e) => setDepartment(e.target.value)}>
              {DEPARTMENT_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </label>
        </div>

        <div className="section-divider" />
        <div className="section-label">Policy Conditions (IF)</div>

        <div className="policy-conditions-panel">
          <div className="condition-row">
            <span className="condition-label">Subject Role</span>
            <select className="condition-select" value={subjectRole} onChange={(e) => setSubjectRole(e.target.value)}>
              {ROLE_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
            <span className="condition-text">is requesting</span>
          </div>

          <div className="condition-row">
            <span className="condition-label">Action</span>
            <select className="condition-select" value={actionType} onChange={(e) => setActionType(e.target.value)}>
              {ACTION_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
            <span className="condition-text">access to</span>
          </div>

          <div className="condition-row condition-row--with-icon">
            <span className="condition-label">Resource Sensitivity</span>
            <select className="condition-select" value={resourceSensitivity} onChange={(e) => setResourceSensitivity(e.target.value)}>
              {SENSITIVITY_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
            <span className="condition-icon" aria-hidden="true"><LockIcon /></span>
          </div>

          <div className="condition-row">
            <span className="condition-label">Environment (AND)</span>
            <select className="condition-select" value={environment} onChange={(e) => setEnvironment(e.target.value)}>
              {ENVIRONMENT_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>

          {extraConditions.map((cond) => (
            <div key={cond.id} className="condition-row">
              <span className="condition-label">
                <select className="condition-select" value={cond.field} onChange={(e) => updateConditionField(cond.id, e.target.value as ConditionField)}>
                  {CONDITION_FIELD_OPTIONS.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </span>
              <select className="condition-select" value={cond.value} onChange={(e) => updateConditionValue(cond.id, e.target.value)}>
                {CONDITION_VALUE_OPTIONS[cond.field].map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
              <button type="button" className="condition-delete-button" aria-label="Remove" onClick={() => removeCondition(cond.id)}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                  <path d="M1 1L11 11M11 1L1 11" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <span className="condition-text">AND</span>
            </div>
          ))}

          <button type="button" className="condition-add-button" onClick={addCondition}>+ Add condition</button>
        </div>

        <div className="section-label">Effect (THEN)</div>

        <div className="effect-grid">
          <button type="button" className={`effect-card effect-card--allow ${effect === 'allow' ? 'effect-card--selected' : ''}`} onClick={() => setEffect('allow')}>
            <div className="effect-card-icon">✓</div>
            <div>
              <p className="effect-card-title">Allow Access</p>
              <p className="effect-card-copy">Grant requested permissions.</p>
            </div>
          </button>
          <button type="button" className={`effect-card effect-card--deny ${effect === 'deny' ? 'effect-card--selected' : ''}`} onClick={() => setEffect('deny')}>
            <div className="effect-card-icon">✕</div>
            <div>
              <p className="effect-card-title">Deny Access</p>
              <p className="effect-card-copy">Block request and log event.</p>
            </div>
          </button>
        </div>

        {saveError && <p style={{ color: '#BA1A1A', fontSize: 13, margin: '8px 0 0' }}>⚠ {saveError}</p>}
        {saveSuccess && (
          <p style={{ color: '#004e32', fontSize: 13, margin: '8px 0 0' }}>
            ✓ Policy saved{dryRunMode ? ' (dry-run)' : ''}. View it in the <strong>Policies</strong> page.
          </p>
        )}

        <div className="form-actions-row">
          <button type="button" className="btn btn-ghost" onClick={() => { setPolicyName(''); setSaveError(null); setExtraConditions([]); }}>Reset</button>
          <Button variant="primary" size="md" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save policy'}
          </Button>
        </div>
      </div>

      {/* ── Evaluate Panel ── */}
      <div className="panel-card" style={{ marginTop: 8 }}>
        <h2 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 700 }}>🔍 Test Access Request</h2>
        <p style={{ margin: '0 0 16px', fontSize: 13, color: '#737685' }}>
          Simulate a request against your live (non-dry-run) policies.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12, marginBottom: 16 }}>
          {([
            ['Role', evalRole, setEvalRole, ROLE_OPTIONS],
            ['Action', evalAction, setEvalAction, ACTION_OPTIONS],
            ['Sensitivity', evalSensitivity, setEvalSensitivity, SENSITIVITY_OPTIONS],
            ['Department', evalDept, setEvalDept, DEPARTMENT_OPTIONS.filter(d => d !== 'Any')],
            ['Environment', evalEnv, setEvalEnv, ENVIRONMENT_OPTIONS.filter(e => e !== 'Any')],
          ] as [string, string, (v: string) => void, string[]][]).map(([label, val, setter, opts]) => (
            <label key={label} className="field-label">
              {label}
              <select className="access-select" value={val} onChange={(e) => setter(e.target.value)}>
                {opts.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </label>
          ))}
        </div>

        <Button variant="primary" size="md" onClick={handleEvaluate} disabled={evaluating}>
          {evaluating ? 'Evaluating…' : 'Evaluate Request'}
        </Button>

        {evalError && <p style={{ color: '#BA1A1A', marginTop: 12, fontSize: 13 }}>⚠ {evalError}</p>}

        {evalResult && (
          <div style={{
            marginTop: 16, padding: '16px 20px', borderRadius: 10,
            border: `1.5px solid ${evalResult.decision === 'allow' ? 'rgba(0,104,68,0.3)' : 'rgba(186,26,26,0.3)'}`,
            background: evalResult.decision === 'allow' ? 'rgba(0,104,68,0.05)' : 'rgba(186,26,26,0.05)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <span style={{ fontSize: 22 }}>{evalResult.decision === 'allow' ? '✅' : '🚫'}</span>
              <strong style={{ fontSize: 16, color: evalResult.decision === 'allow' ? '#004e32' : '#BA1A1A' }}>
                {evalResult.decision === 'allow' ? 'ACCESS PERMITTED' : 'ACCESS DENIED'}
              </strong>
            </div>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#434654' }}>{evalResult.reason}</p>
            {evalResult.matched_policy && (
              <p style={{ margin: '4px 0 0', fontSize: 12, color: '#737685' }}>
                Matched policy: <strong>{evalResult.matched_policy}</strong>
              </p>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
