import { useEffect, useState } from 'react';
import type { PatientRecordItem } from '../../types';
import { getRecordPdfUrl } from '../../lib/supabase';

// PdfSection: fetches the proxy URL (now async — it includes an auth token
// query param, see lib/supabase.ts getRecordPdfUrl) and renders it in an iframe


interface PatientRecordScreenProps {
  record: PatientRecordItem;
  onBack: () => void;
}

function PdfViewer({ pdfUrl, fileName, mobile }: { pdfUrl: string; fileName: string; mobile?: boolean }) {
  return (
    <div className="pdf-viewer-wrapper">
      <div className="pdf-viewer-toolbar">
        <span className="pdf-viewer-filename">📄 {fileName}</span>
        <div className="pdf-viewer-actions">
          <a
            className="pdf-viewer-btn pdf-viewer-btn--download"
            href={pdfUrl}
            download={fileName}
          >
            ↓ Download
          </a>
          <a
            className="pdf-viewer-btn pdf-viewer-btn--open"
            href={pdfUrl}
            target="_blank"
            rel="noreferrer"
          >
            ↗ Open
          </a>
        </div>
      </div>
      <iframe
        src={pdfUrl}
        title={fileName}
        className={mobile ? 'mobile-pdf-reader' : 'pdf-reader-frame'}
      />
    </div>
  );
}

function PdfSection({ filePath, fileName, mobile }: { filePath: string; fileName: string; mobile?: boolean }) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!filePath) return;
    getRecordPdfUrl(filePath)
      .then((url) => { if (!cancelled) setPdfUrl(url); })
      .catch((err) => { if (!cancelled) setError(err instanceof Error ? err.message : 'Unable to load PDF.'); });
    return () => { cancelled = true; };
  }, [filePath]);

  if (!filePath) {
    return <div className="pdf-viewer-empty">No PDF available for this record.</div>;
  }

  if (error) {
    return <div className="pdf-viewer-empty">{error}</div>;
  }

  if (!pdfUrl) {
    return <div className="pdf-viewer-empty">Loading secure viewer…</div>;
  }

  return <PdfViewer pdfUrl={pdfUrl} fileName={fileName} mobile={mobile} />;
}

export function PatientRecordScreen({ record, onBack }: PatientRecordScreenProps) {
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
              <div className="mobile-banner-copy">Your role has been verified. Secure connection established.</div>
            </div>
          </div>

          <section className="mobile-document-header">
            <h1>{record.fileName}</h1>
            <div className="mobile-doc-meta">Patient: {record.patient.name} | {record.date}</div>
          </section>

          <section className="mobile-metadata">
            <div className="meta-row">
              <div className="meta-card">
                <div className="meta-label">Department</div>
                <div className="meta-value">{record.department}</div>
              </div>
              <div className="meta-card">
                <div className="meta-label">Uploaded</div>
                <div className="meta-value">{new Date(record.createdAt).toLocaleString()}</div>
              </div>
            </div>
            <div className="meta-full">
              <div className="meta-label">Security Status</div>
              <div className="meta-value">AES-GCM Encrypted <span className="meta-check">✔</span></div>
            </div>
          </section>

          <section className="mobile-report">
            <div className="report-header">
              <div className="report-title">Secure PDF Viewer</div>
            </div>
            <div className="report-body">
              <PdfSection filePath={record.filePath} fileName={record.fileName} mobile />
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
          <div className="detail-topbar-title">Record {record.id}</div>
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
            <span className="status-pill status-pill--success">{record.status}</span>
            <span className="status-pill status-pill--success">{record.encryption}</span>
          </div>

          <section className="record-card record-card--details">
            <div className="record-card-header">Core Details</div>
            <div className="record-card-row">
              <span className="record-card-label">Patient</span>
              <span className="record-card-value">{record.patient.name}</span>
            </div>
            <div className="record-card-row">
              <span className="record-card-label">Department</span>
              <span className="record-card-value">{record.department}</span>
            </div>
            <div className="record-card-row">
              <span className="record-card-label">Sensitivity</span>
              <span className="record-card-value">{record.sensitivity}</span>
            </div>
            <div className="record-card-row">
              <span className="record-card-label">Version</span>
              <span className="record-card-pill">v1</span>
            </div>
            <div className="record-card-row">
              <span className="record-card-label">Created</span>
              <span className="record-card-value">{new Date(record.createdAt).toLocaleString()}</span>
            </div>
            <div className="record-card-row">
              <span className="record-card-label">Author</span>
              <span className="record-card-value">{record.author}</span>
            </div>
          </section>

          <section className="record-card record-card--policy">
            <div className="policy-header">
              <span>Access Policy (ABAC)</span>
              <button className="policy-edit-button" type="button" aria-label="Edit policy">
                <span className="policy-edit-icon" />
              </button>
            </div>
            <pre className="policy-code">{`Allow: Role = 'physician'\nAND Dept = '${record.department}'\nAND Status = 'Active'`}</pre>
          </section>

          <div className="record-sidebar-footer">
            <button className="primary-button" type="button">Update Record (Create v2)</button>
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
                <h1>{record.fileName}</h1>
                <p>Patient: {record.patient.name}</p>
              </div>
              <div className="canvas-logo" />
            </div>

            <div className="canvas-section">
              <h4>Secure PDF Viewer</h4>
              <PdfSection filePath={record.filePath} fileName={record.fileName} />
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
