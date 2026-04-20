'use client';
import { useState } from 'react';

interface BarData {
  name: string;
  rate: number;
  color: string;
}

const data: BarData[] = [
  { name: 'Rooted', rate: 0, color: '#2d5a4a' },
  { name: 'Finix S1', rate: 1.8, color: '#6b8e7d' },
  { name: 'GPT-5.4', rate: 3.1, color: '#8faa9e' },
  { name: 'Gemini 2.5', rate: 3.3, color: '#a3bfb5' },
  { name: 'Phi-4', rate: 3.7, color: '#b7cdc7' },
  { name: 'Llama 3.3', rate: 4.1, color: '#c5d5ce' },
  { name: 'Perplexity', rate: 37, color: '#d4a373' },
  { name: 'ChatGPT', rate: 40, color: '#bc6c25' },
];

export default function HallucinationChart() {
  const [hovered, setHovered] = useState<number | null>(null);
  const maxRate = 45;

  return (
    <div style={{ 
      backgroundColor: '#fefcf8', 
      border: '1px solid #e8dcc8', 
      borderRadius: '16px', 
      padding: '32px', 
      marginBottom: '24px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
    }}>
      <h4 style={{ 
        fontWeight: 700, 
        color: '#2d4a5a', 
        marginBottom: '8px', 
        fontSize: '18px',
        letterSpacing: '-0.02em'
      }}>LLM Hallucination Rates Comparison</h4>
      
      <p style={{ 
        color: '#6b7280', 
        fontSize: '14px', 
        marginBottom: '24px',
        lineHeight: 1.5
      }}>
        Vectara HHEM-2.3 (March 2026) measures how often LLMs hallucinate when summarizing documents. Hover bars for details.
      </p>

      <div style={{ position: 'relative', height: '280px', width: '100%', marginLeft: '50px' }}>
        <div style={{ 
          position: 'absolute', 
          left: 0, 
          top: 0, 
          bottom: 0, 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'space-between', 
          fontSize: '13px', 
          color: '#9ca3af', 
          fontWeight: 500,
          paddingRight: '12px',
          borderRight: '2px solid #e5e7eb'
        }}>
          <span>45%</span>
          <span>33%</span>
          <span>22%</span>
          <span>11%</span>
          <span>0%</span>
        </div>

        <div style={{ 
          display: 'flex', 
          alignItems: 'flex-end', 
          justifyContent: 'space-around', 
          height: '100%', 
          paddingLeft: '20px',
          paddingBottom: '40px'
        }}>
          {data.map((item, index) => {
            const heightPercent = (item.rate / maxRate) * 100;
            const isHovered = hovered === index;
            const barHeight = item.rate === 0 ? 6 : Math.max(heightPercent * 2.2, 8);
            
            return (
              <div
                key={item.name}
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  position: 'relative'
                }}
                onMouseEnter={() => setHovered(index)}
                onMouseLeave={() => setHovered(null)}
              >
                {isHovered && (
                  <div style={{
                    position: 'absolute',
                    top: '-36px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: '#1a3a4a',
                    color: '#fefcf8',
                    fontSize: '14px',
                    fontWeight: 700,
                    padding: '6px 12px',
                    borderRadius: '8px',
                    whiteSpace: 'nowrap',
                    zIndex: 10,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                  }}>
                    {item.rate === 0 ? '< 0.1%' : `${item.rate}%`}
                  </div>
                )}
                
                <div
                  style={{
                    width: '48px',
                    height: `${barHeight}px`,
                    backgroundColor: isHovered ? item.color : `${item.color}cc`,
                    borderRadius: '8px 8px 0 0',
                    transition: 'all 0.25s ease',
                    transform: isHovered ? 'scaleY(1.08)' : 'scaleY(1)',
                    boxShadow: isHovered ? '0 4px 16px rgba(0,0,0,0.12)' : 'none'
                  }}
                />
                
                <span style={{
                  fontSize: '13px',
                  marginTop: '12px',
                  color: isHovered ? '#2d4a5a' : '#6b7280',
                  fontWeight: isHovered ? 700 : 500,
                  textAlign: 'center',
                  maxWidth: '60px'
                }}>
                  {item.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: '32px', 
        fontSize: '13px', 
        color: '#6b7280', 
        marginTop: '24px',
        paddingTop: '20px',
        borderTop: '1px solid #e8dcc8'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '14px', height: '14px', borderRadius: '4px', backgroundColor: '#2d5a4a' }}></div>
          <span style={{ fontWeight: 600 }}>Rooted</span>
          <span style={{ color: '#9ca3af' }}>(source-only)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '14px', height: '14px', borderRadius: '4px', backgroundColor: '#6b8e7d' }}></div>
          <span style={{ fontWeight: 600 }}>Benchmark</span>
          <span style={{ color: '#9ca3af' }}>Leaders</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '14px', height: '14px', borderRadius: '4px', backgroundColor: '#d4a373' }}></div>
          <span style={{ fontWeight: 600 }}>Perplexity</span>
          <span style={{ color: '#9ca3af' }}>(web search)</span>
        </div>
      </div>

      <p style={{ 
        fontSize: '12px', 
        color: '#9ca3af', 
        marginTop: '20px', 
        textAlign: 'center',
        fontStyle: 'italic'
      }}>
        Source: Vectara Hallucination Evaluation Model (HHEM-2.3), March 2026
      </p>
    </div>
  );
}
