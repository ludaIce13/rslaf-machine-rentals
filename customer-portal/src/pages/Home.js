import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';
import logo from '../assets/logo.jpg';

const Home = () => {
  // Static content for Tips & Tricks (can be made dynamic later)
  const tips = [
    {
      title: 'How to Choose the Right Construction Equipment for Your Project',
      image: 'https://images.pexels.com/photos/1108101/pexels-photo-1108101.jpeg?auto=compress&cs=tinysrgb&w=1200',
      excerpt: 'Not sure what equipment you need? This guide breaks down the must-have machinery for different project types and how to pick the right tools for the job.',
      linkText: 'Read Guide',
      to: '/products'
    },
    {
      title: 'Rent vs. Buy: Why Renting Equipment Makes Sense',
      image: 'https://images.pexels.com/photos/162553/keys-workshop-mechanic-tools-162553.jpeg?auto=compress&cs=tinysrgb&w=1200',
      excerpt: 'Explore the cost benefits of renting versus purchasing equipment and how it can save you money while keeping your projects flexible.',
      linkText: 'Learn More',
      to: '/products'
    },
    {
      title: 'Tips for Operating Heavy Construction Equipment',
      image: 'https://images.pexels.com/photos/1108572/pexels-photo-1108572.jpeg?auto=compress&cs=tinysrgb&w=1200',
      excerpt: 'Safety is key on any job site. Learn essential tips for operating construction equipment safely and efficiently to prevent accidents and downtime.',
      linkText: 'Safety Tips',
      to: '/products'
    }
  ];

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero hero--dark">
        <div className="hero-content">
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
            <img 
              src={logo} 
              alt="RSLAF Company Logo" 
              style={{ 
                width: '100px', 
                height: '100px', 
                borderRadius: '50%', 
                marginRight: '2rem', 
                border: '4px solid #FFD700',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                objectFit: 'cover'
              }}
              onError={(e) => {
                console.log('Logo failed to load from imported asset');
                e.target.style.display = 'none';
              }}
            />
            <div>
              <h1 style={{ color: '#FFD700', marginBottom: '0.5rem', textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>Get The Job Done. Rent it</h1>
            </div>
          </div>
          <p>From excavators to power tools, we provide high-quality rental equipment to keep your projects running smoothly and on schedule.</p>
          <div className="hero-actions">
            <Link to="/products" className="btn btn-primary">
              Browse Equipment
            </Link>
          </div>
        </div>
        <div className="hero-image">
          <img 
src="/road-roller-2-new.jpg" 
            alt="RSLAF Road Roller Equipment" 
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'cover', 
              borderRadius: '12px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.3)'
            }}
            onError={(e) => {
              console.log('Road roller image failed to load');
              e.target.style.display = 'none';
              e.target.parentNode.innerHTML = '<div class="hero-placeholder" style="display: flex; align-items: center; justify-content: center; height: 100%; background: rgba(255,255,255,0.1); border-radius: 12px; color: white; font-size: 1.2rem;">RSLAF Construction Equipment</div>';
            }}
          />
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <h2>Why Choose RSLAF Rentals?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">✅</div>
              <h3>Quality Equipment</h3>
              <p>All our machinery is regularly maintained and inspected to ensure optimal performance.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📅</div>
              <h3>Flexible Booking</h3>
              <p>Easy online booking system with flexible rental periods to match your project needs.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📞</div>
              <h3>24/7 Support</h3>
              <p>Professional support team available around the clock for any assistance you need.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Tips & Tricks Section */}
      <section className="tips">
        <div className="container">
          <h2>Tips & tricks</h2>
          <div className="tips-grid">
            {tips.map((t, idx) => (
              <article key={idx} className="tip-card">
                <div className="tip-image">
                  <img src={t.image} alt={t.title} />
                </div>
                <h3>{t.title}</h3>
                <p>{t.excerpt}</p>
                <Link to={t.to} className="btn btn-secondary" style={{ borderColor: '#1b7a23', color: '#1b7a23' }}>
                  {t.linkText}
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="container">
          <h2>Ready to Get Started?</h2>
          <p>Join contractors who trust RSLAF Rentals for reliable equipment and service.</p>
          <div className="cta-actions">
            <Link to="/products" className="btn btn-primary">
              Browse Equipment
            </Link>
            <Link to="/about" className="btn btn-outline">
              Learn More
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;