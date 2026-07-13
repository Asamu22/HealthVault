import React from 'react';

interface FiltersBarProps {
  onFilter?: (filters: any) => void;
}

export function FiltersBar({ onFilter }: FiltersBarProps) {
  return (
    <div className="filters-bar">
      <div className="filters-container">
        <div className="filter-group">
          <label className="text-field-label">Date Range</label>
          <div className="text-field-control">
            <input className="filter-input" type="text" placeholder="10/24/2023" aria-label="date" />
          </div>
        </div>

        <div className="filter-group">
          <label className="text-field-label">Identity / Role</label>
          <div className="text-field-control">
            <select className="filter-input">
              <option value="">All Identities</option>
              <option value="doctor">Doctor</option>
              <option value="physician">physician</option>
              <option value="nurse">Nurse</option>
              <option value="fellow">Fellow</option>
              <option value="resident">Resident</option>
              <option value="pharmasist">Pharmasist</option>
              <option value="reserchers">Reserchers</option>
            </select>
          </div>
        </div>

        <div className="filter-group">
          <label className="text-field-label">Action Type</label>
          <div className="text-field-control">
            <select className="filter-input">
              <option value="">All Actions</option>
              <option value="access">Access</option>
              <option value="update">Update</option>
            </select>
          </div>
        </div>

        <div className="filter-actions">
          <button type="button" className="btn-filter" onClick={() => onFilter?.({})}>Filter</button>
        </div>
      </div>
    </div>
  );
}

export default FiltersBar;
