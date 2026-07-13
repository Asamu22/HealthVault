import { useState } from 'react';
import { Button } from '../ui/Button';
import { TextField } from '../ui/TextField';

function LockIcon() {
  return (
    <svg width="14" height="18" viewBox="0 0 14 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M1.66667 17.5C1.20833 17.5 0.815972 17.3368 0.489583 17.0104C0.163194 16.684 0 16.2917 0 15.8333V7.5C0 7.04167 0.163194 6.64931 0.489583 6.32292C0.815972 5.99653 1.20833 5.83333 1.66667 5.83333H2.5V4.16667C2.5 3.01389 2.90625 2.03125 3.71875 1.21875C4.53125 0.40625 5.51389 0 6.66667 0C7.81944 0 8.80208 0.40625 9.61458 1.21875C10.4271 2.03125 10.8333 3.01389 10.8333 4.16667V5.83333H11.6667C12.125 5.83333 12.5174 5.99653 12.8438 6.32292C13.1701 6.64931 13.3333 7.04167 13.3333 7.5V15.8333C13.3333 16.2917 13.1701 16.684 12.8438 17.0104C12.5174 17.3368 12.125 17.5 11.6667 17.5H1.66667ZM1.66667 15.8333H11.6667V7.5H1.66667V15.8333ZM6.66667 13.3333C7.125 13.3333 7.51736 13.1701 7.84375 12.8438C8.17014 12.5174 8.33333 12.125 8.33333 11.6667C8.33333 11.2083 8.17014 10.816 7.84375 10.4896C7.51736 10.1632 7.125 10 6.66667 10C6.20833 10 5.81597 10.1632 5.48958 10.4896C5.16319 10.816 5 11.2083 5 11.6667C5 12.125 5.16319 12.5174 5.48958 12.8438C5.81597 13.1701 6.20833 13.3333 6.66667 13.3333ZM4.16667 5.83333H9.16667V4.16667C9.16667 3.47222 8.92361 2.88194 8.4375 2.39583C7.95139 1.90972 7.36111 1.66667 6.66667 1.66667C5.97222 1.66667 5.38194 1.90972 4.89583 2.39583C4.40972 2.88194 4.16667 3.47222 4.16667 4.16667V5.83333ZM1.66667 15.8333V7.5V15.8333Z" fill="#737685"/>
    </svg>
  );
}

const ROLE_OPTIONS = ['Doctor', 'Physician', 'Nurse', 'Fellow', 'Resident', 'Pharmasist', 'Reserchers'];
const DEPARTMENT_OPTIONS = ['Cardiology', 'Radiology', 'Oncology', 'Pharmacy'];
const ACTION_OPTIONS = ['Read (View Only)', 'Write (Modify)', 'Delete', 'Administer'];
const SENSITIVITY_OPTIONS = ['Critical (PHI)', 'Confidential', 'Restricted', 'Public'];
const ENVIRONMENT_OPTIONS = ['During Active Shift Hours', 'Within Network', 'Outside Business Hours', 'Emergency Override'];
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
  const [dryRunMode, setDryRunMode] = useState(true);
  const [policyName, setPolicyName] = useState('Cardiologist Emergency Read');
  const [department, setDepartment] = useState('Cardiology');
  const [subjectRole, setSubjectRole] = useState('Doctor');
  const [actionType, setActionType] = useState('Read (View Only)');
  const [resourceSensitivity, setResourceSensitivity] = useState('Critical (PHI)');
  const [environment, setEnvironment] = useState('During Active Shift Hours');
  const [extraConditions, setExtraConditions] = useState<Condition[]>([]);
  const [effect, setEffect] = useState<'allow' | 'deny'>('allow');

  const addCondition = () => {
    setExtraConditions((current) => [
      ...current,
      {
        id: `cond-${Date.now()}-${current.length}`,
        field: 'Subject Role',
        value: ROLE_OPTIONS[0],
      },
    ]);
  };

  const updateConditionField = (id: string, field: ConditionField) => {
    setExtraConditions((current) =>
      current.map((condition) =>
        condition.id === id
          ? { ...condition, field, value: CONDITION_VALUE_OPTIONS[field][0] }
          : condition,
      ),
    );
  };

  const updateConditionValue = (id: string, value: string) => {
    setExtraConditions((current) =>
      current.map((condition) =>
        condition.id === id ? { ...condition, value } : condition,
      ),
    );
  };
  const removeCondition = (id: string) => {
    setExtraConditions((current) => current.filter((c) => c.id !== id));
  };

  return (
    <div className="access-control-screen">
      <div className="access-card panel-card">
        <div className="access-card-header">
          <h1 className="access-card-title">New Access Policy</h1>
          <button
            type="button"
            className={`dry-run-toggle ${dryRunMode ? 'dry-run-toggle--active' : ''}`}
            onClick={() => setDryRunMode((value) => !value)}
          >
            <span className="dry-run-switch" aria-hidden="true" />
            <span className="dry-run-label">Dry-run mode</span>
          </button>
        </div>

        <div className="policy-form-grid">
          <div className="policy-form-field">
            <TextField
              label="Policy Name"
              placeholder="e.g., Cardiologist Emergency Read"
              value={policyName}
              onChange={(event) => setPolicyName(event.target.value)}
            />
          </div>

          <label className="field-label policy-form-field">
            Department Scope
            <select
              className="access-select"
              value={department}
              onChange={(event) => setDepartment(event.target.value)}
            >
              {DEPARTMENT_OPTIONS.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="section-divider" />

        <div className="section-label">Policy Conditions (IF)</div>

        <div className="policy-conditions-panel">
          <div className="condition-row">
            <span className="condition-label">Subject Role</span>
            <select
              className="condition-select"
              value={subjectRole}
              onChange={(event) => setSubjectRole(event.target.value)}
            >
              {ROLE_OPTIONS.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            <span className="condition-text">is requesting</span>
          </div>

          <div className="condition-row">
            <span className="condition-label">Action</span>
            <select
              className="condition-select"
              value={actionType}
              onChange={(event) => setActionType(event.target.value)}
            >
              {ACTION_OPTIONS.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            <span className="condition-text">access to</span>
          </div>

          <div className="condition-row condition-row--with-icon">
            <span className="condition-label">Resource Sensitivity</span>
            <select
              className="condition-select"
              value={resourceSensitivity}
              onChange={(event) => setResourceSensitivity(event.target.value)}
            >
              {SENSITIVITY_OPTIONS.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            <span className="condition-icon" aria-hidden="true"><LockIcon /></span>
          </div>

          <div className="condition-row">
            <span className="condition-label">Environment (AND)</span>
            <select
              className="condition-select"
              value={environment}
              onChange={(event) => setEnvironment(event.target.value)}
            >
              {ENVIRONMENT_OPTIONS.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          {extraConditions.map((condition) => (
            <div key={condition.id} className="condition-row">
              <span className="condition-label">
                <select
                  className="condition-select"
                  value={condition.field}
                  onChange={(event) => updateConditionField(condition.id, event.target.value as ConditionField)}
                >
                  {CONDITION_FIELD_OPTIONS.map((field) => (
                    <option key={field} value={field}>{field}</option>
                  ))}
                </select>
              </span>

              <select
                className="condition-select"
                value={condition.value}
                onChange={(event) => updateConditionValue(condition.id, event.target.value)}
              >
                {CONDITION_VALUE_OPTIONS[condition.field].map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              <button
                type="button"
                className="condition-delete-button"
                aria-label="Remove condition"
                onClick={() => removeCondition(condition.id)}
              >
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
          <button
            type="button"
            className={`effect-card effect-card--allow ${effect === 'allow' ? 'effect-card--selected' : ''}`}
            onClick={() => setEffect('allow')}
          >
            <div className="effect-card-icon">✓</div>
            <div>
              <p className="effect-card-title">Allow Access</p>
              <p className="effect-card-copy">Grant requested permissions.</p>
            </div>
          </button>

          <button
            type="button"
            className={`effect-card effect-card--deny ${effect === 'deny' ? 'effect-card--selected' : ''}`}
            onClick={() => setEffect('deny')}
          >
            <div className="effect-card-icon">✕</div>
            <div>
              <p className="effect-card-title">Deny Access</p>
              <p className="effect-card-copy">Block request and log event.</p>
            </div>
          </button>
        </div>

        <div className="form-actions-row">
          <button type="button" className="btn btn-ghost">Cancel</button>
          <Button variant="primary" size="md">Save policy</Button>
        </div>
      </div>
    </div>
  );
}
