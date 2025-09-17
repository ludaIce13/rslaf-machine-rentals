import React from 'react';
import { Link } from 'react-router-dom';

const TipsSafety = () => {
  return (
    <div className="container" style={{ padding: '2rem 1rem' }}>
      <nav style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>
        <Link to="/">Home</Link> / <Link to="/products">Products</Link> / Safety Tips
      </nav>
      <h1 style={{ marginBottom: '0.5rem' }}>Tips for Operating Heavy Construction Equipment</h1>
      <p style={{ color: '#666', marginBottom: '1.5rem' }}>Key practices to keep your crew and site safe.</p>

      <article className="prose prose-invert" style={{ lineHeight: 1.7 }}>
        <h2>Pre‑operation checks</h2>
        <ul>
          <li>Walk‑around inspection: leaks, tires/tracks, lights, guards.</li>
          <li>Verify fluids and clean cab windows and mirrors.</li>
          <li>Test horn, alarms, lights and emergency stop.</li>
        </ul>

        <h2>On‑site best practices</h2>
        <ul>
          <li>Use seat belts and maintain three points of contact.</li>
          <li>Respect exclusion zones and spotters; communicate with hand signals/radios.</li>
          <li>Operate at safe speeds; avoid side‑slope instability and overhead hazards.</li>
        </ul>

        <h2>Shutdown and security</h2>
        <p>Park on level ground, lower attachments, apply parking brake, remove keys, and secure the site after hours.</p>

        <div style={{ marginTop: '2rem' }}>
          <Link to="/products" className="btn btn-primary">View Available Equipment</Link>
        </div>
      </article>
    </div>
  );
};

export default TipsSafety;
