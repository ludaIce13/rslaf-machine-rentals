import React from 'react';

const About = () => {
  return (
    <div className="container" style={{ padding: '2rem 0' }}>
      <section style={{ maxWidth: 900, margin: '0 auto' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', color: '#2c3e50' }}>About RSLAF Rentals</h1>
        <p style={{ color: '#6c757d', marginBottom: '1.5rem' }}>
          We provide high‑quality construction equipment for rent — from excavators and backhoe loaders to power tools —
          helping your projects run smoothly and on schedule. Our fleet is maintained to strict standards and supported
          by a professional team.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ background: '#fff', border: '1px solid #e9ecef', borderRadius: 12, padding: '1.25rem' }}>
            <h3 style={{ margin: '0 0 0.5rem', color: '#2c3e50' }}>Quality Fleet</h3>
            <p style={{ margin: 0, color: '#6c757d' }}>Regularly inspected machinery to ensure reliability on site.</p>
          </div>
          <div style={{ background: '#fff', border: '1px solid #e9ecef', borderRadius: 12, padding: '1.25rem' }}>
            <h3 style={{ margin: '0 0 0.5rem', color: '#2c3e50' }}>Flexible Rentals</h3>
            <p style={{ margin: 0, color: '#6c757d' }}>Day, week, or month — choose periods that match your needs.</p>
          </div>
          <div style={{ background: '#fff', border: '1px solid #e9ecef', borderRadius: 12, padding: '1.25rem' }}>
            <h3 style={{ margin: '0 0 0.5rem', color: '#2c3e50' }}>24/7 Support</h3>
            <p style={{ margin: 0, color: '#6c757d' }}>We're available around the clock to support your operations.</p>
          </div>
        </div>

        <div style={{ background: '#f8f9fa', border: '1px solid #e9ecef', borderRadius: 12, padding: '2rem', marginTop: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#2c3e50' }}>Contact Information</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            <div>
              <h3 style={{ margin: '0 0 0.75rem', color: '#1b7a23', fontSize: '1.1rem' }}>Address</h3>
              <p style={{ margin: 0, color: '#495057', lineHeight: '1.5' }}>
                Cockerill Barracks, Wilkinson road,<br />
                FREETOWN
              </p>
            </div>
            
            <div>
              <h3 style={{ margin: '0 0 0.75rem', color: '#1b7a23', fontSize: '1.1rem' }}>Contact</h3>
              <div style={{ color: '#495057', lineHeight: '1.8' }}>
                <p style={{ margin: '0 0 0.5rem' }}>
                  <strong>Email:</strong><br />
                  <a href="mailto:rslafierentalservice@gmail.com" style={{ color: '#1b7a23', textDecoration: 'none' }}>
                    rslafierentalservice@gmail.com
                  </a>
                </p>
                <p style={{ margin: 0 }}>
                  <strong>Phone:</strong><br />
                  <a href="tel:+23278839095" style={{ color: '#1b7a23', textDecoration: 'none' }}>+232 78 839095</a> / 
                  <a href="tel:+23279650500" style={{ color: '#1b7a23', textDecoration: 'none' }}>+232 79 650500</a>
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
