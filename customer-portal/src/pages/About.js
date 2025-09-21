import React from 'react';

const About = () => {
  return (
    <div className="container" style={{ padding: '2rem 0' }}>
      <section style={{ maxWidth: 900, margin: '0 auto' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', color: '#ffffff', fontWeight: 'bold', textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>About RSLAF Rentals</h1>
        <p style={{ color: '#ffffff', marginBottom: '1.5rem', fontSize: '1.1rem', lineHeight: '1.6', textShadow: '1px 1px 2px rgba(0,0,0,0.3)' }}>
          We provide high‑quality construction equipment for rent — from excavators and backhoe loaders to power tools —
          helping your projects run smoothly and on schedule. Our fleet is maintained to strict standards and supported
          by a professional team.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ background: '#fff', border: '1px solid #e9ecef', borderRadius: 12, padding: '1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 0.5rem', color: '#2c3e50', fontWeight: 'bold' }}>Quality Fleet</h3>
            <p style={{ margin: 0, color: '#2c3e50', fontSize: '0.95rem' }}>Regularly inspected machinery to ensure reliability on site.</p>
          </div>
          <div style={{ background: '#fff', border: '1px solid #e9ecef', borderRadius: 12, padding: '1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 0.5rem', color: '#2c3e50', fontWeight: 'bold' }}>Flexible Rentals</h3>
            <p style={{ margin: 0, color: '#2c3e50', fontSize: '0.95rem' }}>Day, week, or month — choose periods that match your needs.</p>
          </div>
          <div style={{ background: '#fff', border: '1px solid #e9ecef', borderRadius: 12, padding: '1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 0.5rem', color: '#2c3e50', fontWeight: 'bold' }}>24/7 Support</h3>
            <p style={{ margin: 0, color: '#2c3e50', fontSize: '0.95rem' }}>We're available around the clock to support your operations.</p>
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '2px solid #1b7a23', borderRadius: 12, padding: '2rem', marginTop: '2rem', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#2c3e50', fontWeight: 'bold' }}>Contact Information</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            <div>
              <h3 style={{ margin: '0 0 0.75rem', color: '#1b7a23', fontSize: '1.1rem', fontWeight: 'bold' }}>Address</h3>
              <p style={{ margin: 0, color: '#2c3e50', lineHeight: '1.5', fontSize: '1rem' }}>
                Cockerill Barracks, Wilkinson road,<br />
                FREETOWN
              </p>
            </div>
            
            <div>
              <h3 style={{ margin: '0 0 0.75rem', color: '#1b7a23', fontSize: '1.1rem', fontWeight: 'bold' }}>Contact</h3>
              <div style={{ color: '#2c3e50', lineHeight: '1.8' }}>
                <p style={{ margin: '0 0 0.5rem' }}>
                  <strong style={{ color: '#2c3e50' }}>Email:</strong><br />
                  <a href="mailto:rslafierentalservice@gmail.com" style={{ color: '#1b7a23', textDecoration: 'none', fontWeight: '500' }}>
                    rslafierentalservice@gmail.com
                  </a>
                </p>
                <p style={{ margin: 0 }}>
                  <strong style={{ color: '#2c3e50' }}>Phone:</strong><br />
                  <a href="tel:+23278839095" style={{ color: '#1b7a23', textDecoration: 'none', fontWeight: '500' }}>+232 78 839095</a> / 
                  <a href="tel:+23279650500" style={{ color: '#1b7a23', textDecoration: 'none', fontWeight: '500' }}>+232 79 650500</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
