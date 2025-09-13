import React from 'react';

const Privacy = () => {
  return (
    <div className="container" style={{ padding: '2rem 0', maxWidth: '900px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#2c3e50' }}>Privacy Policy</h1>
      <p style={{ color: '#6c757d', marginBottom: '2rem', fontSize: '1.1rem' }}>
        Last updated: {new Date().toLocaleDateString()}
      </p>

      <div style={{ background: '#fff', border: '1px solid #e9ecef', borderRadius: '8px', padding: '2rem' }}>
        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ color: '#1b7a23', marginBottom: '1rem' }}>1. Information We Collect</h2>
          <div style={{ color: '#495057', lineHeight: '1.6' }}>
            <h3 style={{ color: '#2c3e50', fontSize: '1.1rem', marginBottom: '0.5rem' }}>1.1 Personal Information</h3>
            <p style={{ marginBottom: '1rem' }}>
              We collect personal information you provide when using our services, including:
            </p>
            <ul style={{ marginBottom: '1rem', paddingLeft: '1.5rem' }}>
              <li>Name and contact information (email, phone number, address)</li>
              <li>Business information and project details</li>
              <li>Payment information for rental transactions</li>
              <li>Equipment usage and rental history</li>
            </ul>
            
            <h3 style={{ color: '#2c3e50', fontSize: '1.1rem', marginBottom: '0.5rem' }}>1.2 Automatically Collected Information</h3>
            <p style={{ marginBottom: '1rem' }}>
              We may automatically collect certain information when you visit our website, including:
            </p>
            <ul style={{ marginBottom: '1rem', paddingLeft: '1.5rem' }}>
              <li>IP address and browser information</li>
              <li>Website usage patterns and preferences</li>
              <li>Device information and operating system</li>
            </ul>
          </div>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ color: '#1b7a23', marginBottom: '1rem' }}>2. How We Use Your Information</h2>
          <div style={{ color: '#495057', lineHeight: '1.6' }}>
            <p style={{ marginBottom: '1rem' }}>We use your information to:</p>
            <ul style={{ marginBottom: '1rem', paddingLeft: '1.5rem' }}>
              <li>Process equipment rental requests and manage bookings</li>
              <li>Communicate with you about your rentals and our services</li>
              <li>Process payments and maintain financial records</li>
              <li>Improve our services and customer experience</li>
              <li>Comply with legal and regulatory requirements</li>
              <li>Send important updates about your rentals or our services</li>
            </ul>
          </div>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ color: '#1b7a23', marginBottom: '1rem' }}>3. Information Sharing</h2>
          <div style={{ color: '#495057', lineHeight: '1.6' }}>
            <p style={{ marginBottom: '1rem' }}>
              We do not sell, trade, or rent your personal information to third parties. We may share your 
              information only in the following circumstances:
            </p>
            <ul style={{ marginBottom: '1rem', paddingLeft: '1.5rem' }}>
              <li>With your explicit consent</li>
              <li>To comply with legal obligations or court orders</li>
              <li>With trusted service providers who assist in our operations (under strict confidentiality agreements)</li>
              <li>To protect our rights, property, or safety, or that of our customers</li>
            </ul>
          </div>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ color: '#1b7a23', marginBottom: '1rem' }}>4. Data Security</h2>
          <div style={{ color: '#495057', lineHeight: '1.6' }}>
            <p style={{ marginBottom: '1rem' }}>
              We implement appropriate technical and organizational measures to protect your personal information 
              against unauthorized access, alteration, disclosure, or destruction. These measures include:
            </p>
            <ul style={{ marginBottom: '1rem', paddingLeft: '1.5rem' }}>
              <li>Secure data transmission and storage</li>
              <li>Access controls and authentication procedures</li>
              <li>Regular security assessments and updates</li>
              <li>Employee training on data protection practices</li>
            </ul>
          </div>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ color: '#1b7a23', marginBottom: '1rem' }}>5. Data Retention</h2>
          <div style={{ color: '#495057', lineHeight: '1.6' }}>
            <p style={{ marginBottom: '1rem' }}>
              We retain your personal information only as long as necessary to fulfill the purposes for which it 
              was collected, comply with legal obligations, resolve disputes, and enforce our agreements. 
              Rental records are typically maintained for 7 years for business and tax purposes.
            </p>
          </div>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ color: '#1b7a23', marginBottom: '1rem' }}>6. Your Rights</h2>
          <div style={{ color: '#495057', lineHeight: '1.6' }}>
            <p style={{ marginBottom: '1rem' }}>You have the right to:</p>
            <ul style={{ marginBottom: '1rem', paddingLeft: '1.5rem' }}>
              <li>Access and review your personal information</li>
              <li>Request corrections to inaccurate information</li>
              <li>Request deletion of your personal information (subject to legal requirements)</li>
              <li>Opt out of marketing communications</li>
              <li>File a complaint with relevant data protection authorities</li>
            </ul>
          </div>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ color: '#1b7a23', marginBottom: '1rem' }}>7. Cookies and Tracking</h2>
          <div style={{ color: '#495057', lineHeight: '1.6' }}>
            <p style={{ marginBottom: '1rem' }}>
              Our website may use cookies and similar tracking technologies to enhance your browsing experience 
              and analyze website usage. You can control cookie settings through your browser preferences.
            </p>
          </div>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ color: '#1b7a23', marginBottom: '1rem' }}>8. Changes to This Policy</h2>
          <div style={{ color: '#495057', lineHeight: '1.6' }}>
            <p style={{ marginBottom: '1rem' }}>
              We may update this Privacy Policy from time to time. We will notify you of any material changes 
              by posting the new policy on our website and updating the "Last updated" date. Your continued 
              use of our services constitutes acceptance of the updated policy.
            </p>
          </div>
        </section>

        <section>
          <h2 style={{ color: '#1b7a23', marginBottom: '1rem' }}>9. Contact Us</h2>
          <div style={{ color: '#495057', lineHeight: '1.6' }}>
            <p style={{ marginBottom: '0.5rem' }}>
              If you have questions about this Privacy Policy or how we handle your personal information, contact us:
            </p>
            <p style={{ marginBottom: '0.5rem' }}>
              <strong>Email:</strong> rslafierentalservice@gmail.com
            </p>
            <p style={{ marginBottom: '0.5rem' }}>
              <strong>Phone:</strong> +232 78 839095 / +232 79 650500
            </p>
            <p>
              <strong>Address:</strong> Cockerill Barracks, Wilkinson road, FREETOWN
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Privacy;
