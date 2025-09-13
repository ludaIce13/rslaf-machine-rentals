import React, { useState } from 'react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // For now, just show an alert. In production, this would send to backend
    alert('Thank you for your message! We will get back to you soon.');
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: ''
    });
  };

  return (
    <div className="container" style={{ padding: '2rem 0', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'start' }}>
        {/* Contact Information */}
        <div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#2c3e50' }}>Contact Us</h1>
          <p style={{ color: '#6c757d', marginBottom: '2rem', fontSize: '1.1rem' }}>
            Get in touch with RSLAF Machine Rentals for all your equipment rental needs. 
            We're here to help you find the right machinery for your project.
          </p>

          <div style={{ background: '#f8f9fa', border: '1px solid #e9ecef', borderRadius: '12px', padding: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: '#1b7a23' }}>Get In Touch</h2>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ margin: '0 0 0.5rem', color: '#2c3e50', fontSize: '1.1rem', display: 'flex', alignItems: 'center' }}>
                📍 Address
              </h3>
              <p style={{ margin: 0, color: '#495057', lineHeight: '1.6' }}>
                Cockerill Barracks, Wilkinson road<br />
                FREETOWN, Sierra Leone
              </p>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ margin: '0 0 0.5rem', color: '#2c3e50', fontSize: '1.1rem', display: 'flex', alignItems: 'center' }}>
                📧 Email
              </h3>
              <p style={{ margin: 0 }}>
                <a href="mailto:rslafierentalservice@gmail.com" 
                   style={{ color: '#1b7a23', textDecoration: 'none', fontSize: '1.1rem' }}>
                  rslafierentalservice@gmail.com
                </a>
              </p>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ margin: '0 0 0.5rem', color: '#2c3e50', fontSize: '1.1rem', display: 'flex', alignItems: 'center' }}>
                📞 Phone
              </h3>
              <div style={{ color: '#495057' }}>
                <p style={{ margin: '0 0 0.25rem' }}>
                  <a href="tel:+23278839095" style={{ color: '#1b7a23', textDecoration: 'none' }}>
                    +232 78 839095
                  </a>
                </p>
                <p style={{ margin: 0 }}>
                  <a href="tel:+23279650500" style={{ color: '#1b7a23', textDecoration: 'none' }}>
                    +232 79 650500
                  </a>
                </p>
              </div>
            </div>

            <div>
              <h3 style={{ margin: '0 0 0.5rem', color: '#2c3e50', fontSize: '1.1rem', display: 'flex', alignItems: 'center' }}>
                🕒 Business Hours
              </h3>
              <div style={{ color: '#495057', lineHeight: '1.6' }}>
                <p style={{ margin: '0 0 0.25rem' }}>Monday - Friday: 8:00 AM - 6:00 PM</p>
                <p style={{ margin: '0 0 0.25rem' }}>Saturday: 8:00 AM - 4:00 PM</p>
                <p style={{ margin: 0 }}>Sunday: Closed</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div>
          <div style={{ background: '#fff', border: '1px solid #e9ecef', borderRadius: '12px', padding: '2rem', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#2c3e50' }}>Send us a Message</h2>
            <p style={{ color: '#6c757d', marginBottom: '1.5rem' }}>
              Have a question about our equipment or need a custom quote? Fill out the form below and we'll get back to you promptly.
            </p>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#2c3e50', fontWeight: '500' }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '1rem',
                    boxSizing: 'border-box'
                  }}
                  placeholder="Enter your full name"
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#2c3e50', fontWeight: '500' }}>
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '1rem',
                    boxSizing: 'border-box'
                  }}
                  placeholder="Enter your email address"
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#2c3e50', fontWeight: '500' }}>
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '1rem',
                    boxSizing: 'border-box'
                  }}
                  placeholder="Enter your phone number"
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#2c3e50', fontWeight: '500' }}>
                  Subject *
                </label>
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '1rem',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="">Select a subject</option>
                  <option value="equipment-inquiry">Equipment Inquiry</option>
                  <option value="rental-quote">Rental Quote Request</option>
                  <option value="booking-support">Booking Support</option>
                  <option value="technical-support">Technical Support</option>
                  <option value="general-inquiry">General Inquiry</option>
                </select>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#2c3e50', fontWeight: '500' }}>
                  Message *
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="5"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '1rem',
                    resize: 'vertical',
                    boxSizing: 'border-box'
                  }}
                  placeholder="Tell us about your equipment needs or ask any questions..."
                />
              </div>

              <button
                type="submit"
                style={{
                  background: '#1b7a23',
                  color: 'white',
                  padding: '0.75rem 2rem',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  width: '100%',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => e.target.style.background = '#155a1b'}
                onMouseOut={(e) => e.target.style.background = '#1b7a23'}
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
