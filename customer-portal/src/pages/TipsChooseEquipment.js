import React from 'react';
import { Link } from 'react-router-dom';

const TipsChooseEquipment = () => {
  return (
    <div className="container" style={{ padding: '2rem 1rem' }}>
      <nav style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>
        <Link to="/">Home</Link> / <Link to="/products">Products</Link> / Choose the Right Equipment
      </nav>
      <h1 style={{ marginBottom: '0.5rem' }}>How to Choose the Right Construction Equipment for Your Project</h1>
      <p style={{ color: '#666', marginBottom: '1.5rem' }}>A practical guide to matching tools and machines to your job.</p>

      <article className="prose prose-invert" style={{ lineHeight: 1.7 }}>
        <h2>1. Define the job clearly</h2>
        <p>List the main tasks, site conditions, materials, production rate and timeframe. These inputs determine capacity, size and attachments.</p>

        <h2>2. Select the category first</h2>
        <ul>
          <li>Earthmoving: excavators, bulldozers, skid steers</li>
          <li>Compaction: rollers, plate compactors, rammers</li>
          <li>Lifting: forklifts, telehandlers</li>
          <li>Concrete: mixers, vibrators, cutters</li>
        </ul>

        <h2>3. Size it correctly</h2>
        <p>Right‑sizing saves money. Oversized machines cost more to rent and transport; undersized machines slow the job. Compare bucket/blade widths and operating weight to site access.</p>

        <h2>4. Consider attachments</h2>
        <p>Quick‑couplers, buckets, rippers, breakers and augers can replace multiple machines. Ask our team about availability.</p>

        <h2>5. Availability and support</h2>
        <p>Confirm delivery timing, backup units and on‑site service. Our fleet is maintained to OEM standards with 24/7 support.</p>

        <div style={{ marginTop: '2rem' }}>
          <Link to="/products" className="btn btn-primary">Browse Equipment</Link>
        </div>
      </article>
    </div>
  );
};

export default TipsChooseEquipment;
