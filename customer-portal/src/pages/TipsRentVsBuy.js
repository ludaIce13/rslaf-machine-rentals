import React from 'react';
import { Link } from 'react-router-dom';

const TipsRentVsBuy = () => {
  return (
    <div className="container" style={{ padding: '2rem 1rem' }}>
      <nav style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>
        <Link to="/">Home</Link> / <Link to="/products">Products</Link> / Rent vs. Buy
      </nav>
      <h1 style={{ marginBottom: '0.5rem' }}>Rent vs. Buy: Why Renting Equipment Makes Sense</h1>
      <p style={{ color: '#666', marginBottom: '1.5rem' }}>A quick framework to decide when to rent and when to buy.</p>

      <article className="prose prose-invert" style={{ lineHeight: 1.7 }}>
        <h2>Total cost of ownership vs. utilization</h2>
        <p>Owning adds fixed costs: finance, insurance, storage, preventative maintenance, and operator training. If your utilization is below 60–70%, renting is often cheaper and more flexible.</p>

        <h2>Project variability</h2>
        <p>For short-term spikes, specialized tasks, or uncertain backlogs, rentals avoid tying up capital and let you scale up or down quickly.</p>

        <h2>Equipment age and technology</h2>
        <p>Rentals give access to newer, efficient models without depreciation risk. You always get a well-maintained unit ready for work.</p>

        <h2>Cash flow and risk</h2>
        <p>Renting preserves cash for core operations and reduces downtime risk—replacements are available if a unit fails.</p>

        <div style={{ marginTop: '2rem' }}>
          <Link to="/products" className="btn btn-primary">See Rental Options</Link>
        </div>
      </article>
    </div>
  );
};

export default TipsRentVsBuy;
