'use client';
import { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const SEVERITY_COLORS: Record<string, string> = {
  critical: '#EF4444',
  high: '#F97316',
  medium: '#EAB308',
  low: '#22C55E',
  resolved: '#22C55E',
};

interface Issue {
  id: string;
  lat: number;
  lng: number;
  severity: string;
  category: string;
  status: string;
  priorityScore: number;
}

interface LeafletMapProps {
  issues: Issue[];
  onIssueSelect: (issue: Issue | null) => void;
}

export default function LeafletMap({ issues, onIssueSelect }: LeafletMapProps) {
  const color = (issue: Issue) =>
    issue.status === 'resolved' ? SEVERITY_COLORS.resolved : (SEVERITY_COLORS[issue.severity] || '#3B82F6');

  return (
    <MapContainer
      center={[26.2389, 73.0243]}
      zoom={13}
      style={{ width: '100%', height: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
      />
      {issues.map(issue => (
        <CircleMarker
          key={issue.id}
          center={[issue.lat, issue.lng]}
          radius={issue.status === 'resolved' ? 6 : 8 + (issue.priorityScore || 0) / 20}
          fillColor={color(issue)}
          color={color(issue)}
          weight={2}
          opacity={0.9}
          fillOpacity={issue.status === 'resolved' ? 0.5 : 0.75}
          eventHandlers={{ 
            click: () => onIssueSelect(issue),
            mouseover: (e) => {
              e.target.openPopup();
            },
            mouseout: (e) => {
              e.target.closePopup();
            }
          }}
        >
          <Popup>
            <div style={{ fontFamily: 'var(--font-outfit), sans-serif', minWidth: 160 }}>
              <p style={{ fontWeight: 700, marginBottom: 4, textTransform: 'capitalize' }}>
                {(issue.category || 'Issue').replace('_', ' ')}
              </p>
              <p style={{ fontSize: 12, color: '#666', marginBottom: 6 }}>Severity: {issue.severity}</p>
              <p style={{ fontSize: 12, color: '#666' }}>Priority: {issue.priorityScore}</p>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
