import { useEffect, useState } from 'react';

interface PatientRecordScreenProps {
  recordId: string;
  onBack: () => void;
}

export function PatientRecordScreen({ recordId, onBack }: PatientRecordScreenProps) {
    const [isMobile, setIsMobile] = useState<boolean>(false);
    

    useEffect(() => {
      const check = () => setIsMobile(window.innerWidth <= 680);
      check();
      window.addEventListener('resize', check);
      return () => window.removeEventListener('resize', check);
    }, []);

    if (isMobile) {
      return (
        <div className="record-detail-page mobile">
          <header className="mobile-topbar">
            <button className="mobile-back" onClick={onBack} aria-label="Back">←</button>
            <div className="mobile-title">Record Detail</div>
            <button className="mobile-more" aria-label="More">⋮</button>
          </header>

          <main className="mobile-main">
            <div className="mobile-banner">
              <div className="mobile-banner-icon">🔒</div>
              <div className="mobile-banner-text">
                <div className="mobile-banner-title">Access Granted</div>
                <div className="mobile-banner-copy">Your physician role has been verified. Secure connection established.</div>
              </div>
            </div>

            <section className="mobile-document-header">
              <h1>Echocardiogram Report</h1>
              <div className="mobile-doc-meta">Patient: #8472-A | Sep 24, 2023</div>
            </section>

            <section className="mobile-metadata">
              <div className="meta-row">
                <div className="meta-card">
                  <div className="meta-label">Department</div>
                  <div className="meta-value">Cardiology</div>
                </div>
                <div className="meta-card">
                  <div className="meta-label">Version</div>
                  <div className="meta-value">v2.1 (Final)</div>
                </div>
              </div>

              <div className="meta-full">
                <div className="meta-label">Security Status</div>
                <div className="meta-value">AES-256 Encrypted <span className="meta-check">✔</span></div>
              </div>
            </section>

            <section className="mobile-report">
              <div className="report-header">
                <div className="report-title">Clinical Findings</div>
                <button className="report-pdf">PDF</button>
              </div>
              <div className="report-body">
                <p>Left ventricular size and systolic function are normal. Estimated ejection fraction is 60-65%.</p>
                <p>Right ventricular size and systolic function are normal.</p>
                <p>Normal left atrial size. Normal right atrial size.</p>

                <div className="impression">IMPRESSION<br/>Structurally normal echocardiogram. No significant valvular regurgitation or stenosis.</div>
              </div>
            </section>
          </main>

          <footer className="mobile-footer">
            <button className="mobile-update">Update Record</button>
          </footer>
        </div>
      );
    }

    return (
      <div className="record-detail-page">
        <header className="detail-topbar">
          <div className="detail-topbar-left" onClick={onBack} role="button" tabIndex={0}>
            <div className="detail-topbar-back">
              <span className="detail-topbar-back-icon">←</span>
            </div>
            <div className="detail-topbar-title">Record {recordId}</div>
          </div>

          <div className="detail-topbar-actions">
            <button className="action-button" type="button" aria-label="Notifications">
              <span className="action-icon" />
            </button>
            <button className="action-button" type="button" aria-label="Verified user">
              <span className="action-icon" />
            </button>
            <button className="action-button action-button--account" type="button" aria-label="Account">
              <span className="action-icon action-icon--account" />
            </button>
          </div>
        </header>

        <div className="record-detail-body">
          <aside className="record-detail-sidebar">
            <div className="record-detail-heading">
              <div>
                <h2>Record Metadata</h2>
              </div>
              <p>System generated properties and access controls.</p>
            </div>

            <div className="record-status-row">
              <span className="status-pill status-pill--success">Encrypted</span>
              <span className="status-pill status-pill--success">AES-GCM Verified</span>
            </div>

            <section className="record-card record-card--details">
              <div className="record-card-header">Core Details</div>
              <div className="record-card-row">
                <span className="record-card-label">Department</span>
                <span className="record-card-value">Cardiology</span>
              </div>
              <div className="record-card-row">
                <span className="record-card-label">Version</span>
                <span className="record-card-pill">v4 (Current)</span>
              </div>
              <div className="record-card-row">
                <span className="record-card-label">Created</span>
                <span className="record-card-value">2023-10-27 14:32 UTC</span>
              </div>
              <div className="record-card-row">
                <span className="record-card-label">Author</span>
                <span className="record-card-value">Dr. A. Chen (UID: 8821)</span>
              </div>
            </section>

            <section className="record-card record-card--policy">
              <div className="policy-header">
                <span>Access Policy (ABAC)</span>
                <button className="policy-edit-button" type="button" aria-label="Edit policy">
                  <span className="policy-edit-icon" />
                </button>
              </div>
              <pre className="policy-code">Allow: Role = 'physician'\nAND Dept = 'Cardiology'\nAND Status = 'Active'</pre>
            </section>

            <div className="record-sidebar-footer">
              <button className="primary-button" type="button">Update Record (Create v5)</button>
            </div>
          </aside>

          <main className="record-detail-content">
            

            <section className="detail-banner">
              <div className="banner-icon">✔</div>
              <div className="banner-copy">
                <h3>Success: ABAC Policy Permit</h3>
                <p>Your current role and context attributes satisfy the required policy. Record decrypted for viewing.</p>
              </div>
            </section>

            <section className="record-canvas">
              <div className="canvas-header">
                <div className="canvas-title">
                  <h1>Echocardiogram Report</h1>
                  <p>Patient ID: PT-992-XYZ</p>
                </div>
                <div className="canvas-logo" />
              </div>

              <div className="canvas-section">
                <h4>INDICATIONS</h4>
                <p>Evaluation of left ventricular systolic function. Patient presents with mild dyspnea on exertion and atypical chest pain.</p>
              </div>

              <div className="canvas-section">
                <h4>MEASUREMENTS</h4>
                <div className="metric-grid">
                  <div className="metric-card">
                    <span className="metric-label">LVIDd</span>
                    <span className="metric-value">4.8 cm</span>
                  </div>
                  <div className="metric-card">
                    <span className="metric-label">LVIDs</span>
                    <span className="metric-value">3.2 cm</span>
                  </div>
                  <div className="metric-card">
                    <span className="metric-label">EF (Est)</span>
                    <span className="metric-value">62%</span>
                  </div>
                  <div className="metric-card">
                    <span className="metric-label">LA Vol Idx</span>
                    <span className="metric-value">24 ml/m²</span>
                  </div>
                </div>
              </div>

              <div className="canvas-section">
                <h4>CONCLUSIONS</h4>
                <ul className="conclusions-list">
                  <li>Normal left ventricular size and systolic function. Estimated ejection fraction is &gt;60%.</li>
                  <li>Normal right ventricular size and systolic function.</li>
                  <li>Structurally normal mitral valve with trace regurgitation.</li>
                  <li>No pericardial effusion.</li>
                </ul>
              </div>

              <div className="canvas-note">
                Electronically signed by Dr. A. Chen on 2023-10-27 14:32 UTC. Document integrity verified via cryptographic hash.
              </div>
            </section>
          </main>
        </div>
      </div>
    );
  }
