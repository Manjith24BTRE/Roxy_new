import React from 'react';

// Top Navigation Placeholder
export function TopNavigation() {
  return (
    <div style={styles.box}>
      <span>Top Navigation (Placeholder)</span>
    </div>
  );
}

// Left Sidebar Placeholder
export function LeftSidebar() {
  return (
    <div style={{ ...styles.box, width: '220px', height: '100%' }}>
      <span>Left Sidebar (Placeholder)</span>
    </div>
  );
}

// Preview Player Placeholder
export function PreviewPlayer() {
  return (
    <div style={{ ...styles.box, flex: 1, minHeight: '300px' }}>
      <span>Preview Player (Placeholder)</span>
    </div>
  );
}

// Timeline Placeholder
export function Timeline() {
  return (
    <div style={{ ...styles.box, height: '180px' }}>
      <span>Timeline (Placeholder)</span>
    </div>
  );
}

// Editing Toolbar Placeholder
export function EditingToolbar() {
  return (
    <div style={styles.box}>
      <span>Editing Toolbar (Placeholder)</span>
    </div>
  );
}

// Properties Panel Placeholder
export function PropertiesPanel() {
  return (
    <div style={{ ...styles.box, width: '240px', height: '100%' }}>
      <span>Properties Panel (Placeholder)</span>
    </div>
  );
}

// Asset Library Placeholder
export function AssetLibrary() {
  return (
    <div style={styles.box}>
      <span>Asset Library (Placeholder)</span>
    </div>
  );
}

// Export Center Placeholder
export function ExportCenter() {
  return (
    <div style={styles.box}>
      <span>Export Center (Placeholder)</span>
    </div>
  );
}

// Project Settings Placeholder
export function ProjectSettings() {
  return (
    <div style={styles.box}>
      <span>Project Settings (Placeholder)</span>
    </div>
  );
}

/**
 * AI Command Engine Placeholder
 * Reserved for future implementation.
 */
export function AICommandEngine() {
  return (
    <div style={{ ...styles.box, borderColor: '#a855f7', color: '#c084fc' }}>
      <span>AI Command Engine (Reserved for future implementation.)</span>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  box: {
    border: '1px dashed #334155',
    backgroundColor: '#0f172a',
    borderRadius: '6px',
    padding: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '13px',
    color: '#94a3b8',
  },
};
