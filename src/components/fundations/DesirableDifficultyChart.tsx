'use client';
import { useState } from 'react';

interface MetricData {
  name: string;
  value: string;
  percent: number;
  color: string;
  description: string;
  source: string;
}

const data: MetricData[] = [
  {
    name: 'Retention',
    value: '~30%',
    percent: 75,
    color: '#2d7a5a',
    description: 'Retention increase from effortful retrieval (testing effect)',
    source: 'Bjork & Bjork, 2020'
  },
  {
    name: 'Performance',
    value: '20-25%',
    percent: 62,
    color: '#4a9a7a',
    description: 'Team performance improvement from interleaved practice',
    source: 'Bjork Lab'
  },
  {
    name: 'Autonomy',
    value: '78%',
    percent: 78,
    color: '#6bba9a',
    description: 'Socratic AI interactions showing growing student autonomy',
    source: 'Socratic Mind, 2025'
  },
];

export default function DesirableDifficultyChart() {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div style={{
      backgroundColor: '#f0fdf4',
      border: '1px solid #bbf7d0',
      borderRadius: '16px',
      padding: '32px',
      marginBottom: '24px'
    }}>
      <h4 style={{
        fontWeight: 700,
        color: '#166534',
        marginBottom: '8px',
        fontSize: '18px',
        letterSpacing: '-0.02em'
      }}>Desirable Difficulty Impact Metrics</h4>
      <p style={{
        color: '#4b5563',
        fontSize: '14px',
        marginBottom: '24px',
        lineHeight: 1.5
      }}>
        Research-backed evidence showing how productive struggle improves learning outcomes.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {data.map((item, index) => {
          const isHovered = hovered === index;
          return (
            <div
              key={item.name}
              style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '20px',
                border: isHovered ? `2px solid ${item.color}` : '2px solid transparent',
                transition: 'all 0.2s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={() => setHovered(index)}
              onMouseLeave={() => setHovered(null)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>{item.name}</span>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: item.color, marginLeft: '12px' }}>{item.value}</span>
                </div>
              </div>

              <div style={{
                backgroundColor: '#e5e7eb',
                borderRadius: '8px',
                height: '12px',
                overflow: 'hidden'
              }}>
                <div style={{
                  backgroundColor: item.color,
                  height: '100%',
                  borderRadius: '8px',
                  width: `${item.percent}%`,
                  transition: 'width 0.5s ease',
                  boxShadow: isHovered ? `0 0 12px ${item.color}66` : 'none'
                }} />
              </div>

              {isHovered && (
                <div style={{ marginTop: '12px' }}>
                  <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>{item.description}</p>
                  <p style={{ fontSize: '11px', color: '#9ca3af', fontStyle: 'italic' }}>Source: {item.source}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{
        marginTop: '24px',
        paddingTop: '20px',
        borderTop: '1px solid #bbf7d0',
        display: 'flex',
        gap: '24px',
        justifyContent: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#2d7a5a' }}></div>
          <span style={{ fontSize: '13px', color: '#4b5563' }}>Retrieval Effort</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#4a9a7a' }}></div>
          <span style={{ fontSize: '13px', color: '#4b5563' }}>Interleaved Practice</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#6bba9a' }}></div>
          <span style={{ fontSize: '13px', color: '#4b5563' }}>Socratic Method</span>
        </div>
      </div>

      <p style={{
        fontSize: '12px',
        color: '#9ca3af',
        marginTop: '16px',
        textAlign: 'center',
        fontStyle: 'italic'
      }}>
        Sources: Bjork & Bjork (2020), Bjork Lab research, Socratic Mind study (Georgia Tech/UC San Diego, 2025)
      </p>
    </div>
  );
}
