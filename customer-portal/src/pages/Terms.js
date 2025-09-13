import React from 'react';

const Terms = () => {
  return (
    <div className="container" style={{ padding: '2rem 0', maxWidth: '900px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#2c3e50' }}>Terms of Service</h1>
      <p style={{ color: '#6c757d', marginBottom: '2rem', fontSize: '1.1rem' }}>
        Last updated: {new Date().toLocaleDateString()}
      </p>

      <div style={{ background: '#fff', border: '1px solid #e9ecef', borderRadius: '8px', padding: '2rem' }}>
        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ color: '#1b7a23', marginBottom: '1rem' }}>1. Agreement to Terms</h2>
          <p style={{ color: '#495057', lineHeight: '1.6', marginBottom: '1rem' }}>
            By accessing and using RSLAF Machine Rentals services, you agree to be bound by these Terms of Service 
            and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited 
            from using our services.
          </p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ color: '#1b7a23', marginBottom: '1rem' }}>2. Equipment Rental</h2>
          <div style={{ color: '#495057', lineHeight: '1.6' }}>
            <h3 style={{ color: '#2c3e50', fontSize: '1.1rem', marginBottom: '0.5rem' }}>2.1 Rental Agreement</h3>
            <p style={{ marginBottom: '1rem' }}>
              Each equipment rental constitutes a separate rental agreement. The renter agrees to use the equipment 
              solely for its intended purpose and in accordance with manufacturer guidelines and safety protocols.
            </p>
            
            <h3 style={{ color: '#2c3e50', fontSize: '1.1rem', marginBottom: '0.5rem' }}>2.2 Equipment Condition</h3>
            <p style={{ marginBottom: '1rem' }}>
              Equipment is rented in good working condition. The renter is responsible for inspecting equipment 
              upon delivery and reporting any issues immediately. Any damage beyond normal wear and tear will be 
              charged to the renter.
            </p>
            
            <h3 style={{ color: '#2c3e50', fontSize: '1.1rem', marginBottom: '0.5rem' }}>2.3 Authorized Use</h3>
            <p style={{ marginBottom: '1rem' }}>
              Only authorized and qualified operators may use rented equipment. The renter is responsible for 
              ensuring all operators are properly trained and licensed as required by law.
            </p>
          </div>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ color: '#1b7a23', marginBottom: '1rem' }}>3. Payment Terms</h2>
          <div style={{ color: '#495057', lineHeight: '1.6' }}>
            <p style={{ marginBottom: '1rem' }}>
              • Payment is due before equipment delivery or pickup<br/>
              • We accept Orange Money, AfriMoney, Vult, and bank transfers<br/>
              • Late returns are subject to additional charges at standard hourly rates<br/>
              • Security deposits may be required for certain equipment
            </p>
          </div>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ color: '#1b7a23', marginBottom: '1rem' }}>4. Liability and Insurance</h2>
          <div style={{ color: '#495057', lineHeight: '1.6' }}>
            <h3 style={{ color: '#2c3e50', fontSize: '1.1rem', marginBottom: '0.5rem' }}>4.1 Renter Responsibility</h3>
            <p style={{ marginBottom: '1rem' }}>
              The renter assumes full responsibility for the equipment during the rental period and is liable for 
              any damage, theft, or loss. Proof of insurance is required for all rentals.
            </p>
            
            <h3 style={{ color: '#2c3e50', fontSize: '1.1rem', marginBottom: '0.5rem' }}>4.2 Limitation of Liability</h3>
            <p style={{ marginBottom: '1rem' }}>
              RSLAF Machine Rentals shall not be liable for any indirect, incidental, or consequential damages 
              arising from equipment use. Our liability is limited to the rental value of the equipment.
            </p>
          </div>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ color: '#1b7a23', marginBottom: '1rem' }}>5. Cancellation Policy</h2>
          <div style={{ color: '#495057', lineHeight: '1.6' }}>
            <p style={{ marginBottom: '1rem' }}>
              • Cancellations 24+ hours before rental: Full refund<br/>
              • Cancellations less than 24 hours: May be subject to cancellation fee<br/>
              • No-shows: Full rental charge applies<br/>
              • Weather-related cancellations will be handled case by case
            </p>
          </div>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ color: '#1b7a23', marginBottom: '1rem' }}>6. Safety Requirements</h2>
          <div style={{ color: '#495057', lineHeight: '1.6' }}>
            <p style={{ marginBottom: '1rem' }}>
              The renter must comply with all applicable safety regulations and standards. This includes but is not 
              limited to proper use of personal protective equipment, adherence to manufacturer safety guidelines, 
              and compliance with local safety regulations.
            </p>
          </div>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ color: '#1b7a23', marginBottom: '1rem' }}>7. Modifications to Terms</h2>
          <div style={{ color: '#495057', lineHeight: '1.6' }}>
            <p style={{ marginBottom: '1rem' }}>
              RSLAF Machine Rentals reserves the right to modify these terms at any time. Changes will be effective 
              immediately upon posting on our website. Continued use of our services constitutes acceptance of 
              modified terms.
            </p>
          </div>
        </section>

        <section>
          <h2 style={{ color: '#1b7a23', marginBottom: '1rem' }}>8. Contact Information</h2>
          <div style={{ color: '#495057', lineHeight: '1.6' }}>
            <p style={{ marginBottom: '0.5rem' }}>
              For questions about these Terms of Service, contact us:
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

export default Terms;
