import React, { useState } from 'react';

const FAQ = () => {
  const [openItems, setOpenItems] = useState({});

  const toggleItem = (index) => {
    setOpenItems(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const faqData = [
    {
      category: "Equipment Rental",
      questions: [
        {
          question: "What types of construction equipment do you rent?",
          answer: "We offer a comprehensive range of construction equipment including excavators, backhoe loaders, bulldozers, compactors, generators, concrete mixers, asphalt spreaders, and various power tools. Our fleet is regularly maintained and inspected for optimal performance."
        },
        {
          question: "How do I know which equipment is right for my project?",
          answer: "Our experienced team can help you select the right equipment based on your project requirements. Contact us at +232 78 839095 or email rslafierentalservice@gmail.com with details about your project, and we'll recommend the most suitable machinery."
        },
        {
          question: "Is delivery and pickup included in the rental price?",
          answer: "Delivery and pickup services are available for an additional fee, which varies based on location and equipment size. We serve the Freetown area and surrounding regions. Contact us for a delivery quote."
        }
      ]
    },
    {
      category: "Booking & Pricing",
      questions: [
        {
          question: "How do I book equipment?",
          answer: "You can book equipment through our online portal by browsing our equipment catalog and selecting your desired rental period. Alternatively, call us at +232 78 839095 or +232 79 650500 to speak with our rental specialists."
        },
        {
          question: "What are your rental rates?",
          answer: "Our rental rates vary by equipment type and rental duration. We offer competitive hourly, daily, weekly, and monthly rates. Visit our equipment catalog for current pricing or contact us for a custom quote."
        },
        {
          question: "Do you offer discounts for long-term rentals?",
          answer: "Yes, we provide attractive discounts for weekly and monthly rentals. The longer your rental period, the better the rate. Contact our team to discuss long-term rental packages tailored to your project needs."
        },
        {
          question: "What payment methods do you accept?",
          answer: "We accept various payment methods including Orange Money, AfriMoney, Vult, and bank transfers. Payment is typically required before equipment delivery or pickup."
        }
      ]
    },
    {
      category: "Equipment Condition & Safety",
      questions: [
        {
          question: "How do you ensure equipment quality and safety?",
          answer: "All our equipment undergoes regular maintenance and safety inspections. Each machine is thoroughly checked before rental to ensure it meets our high standards for performance and safety."
        },
        {
          question: "What if equipment breaks down during my rental period?",
          answer: "If equipment experiences mechanical failure due to normal wear and tear, we'll provide a replacement at no additional cost. Contact us immediately at +232 78 839095 for emergency support."
        },
        {
          question: "Do you provide operator training?",
          answer: "We can arrange operator training for specific equipment upon request. Our certified technicians can provide basic operation and safety training to ensure proper equipment use."
        }
      ]
    },
    {
      category: "Policies & Terms",
      questions: [
        {
          question: "What are your operating hours?",
          answer: "We're open Monday to Friday from 8:00 AM to 6:00 PM, and Saturday from 8:00 AM to 4:00 PM. We're closed on Sundays. Emergency support is available 24/7 for critical issues."
        },
        {
          question: "What is your cancellation policy?",
          answer: "Cancellations made 24 hours before the scheduled rental start time are eligible for a full refund. Cancellations made less than 24 hours in advance may be subject to a cancellation fee."
        },
        {
          question: "Do I need insurance to rent equipment?",
          answer: "Yes, proof of insurance is required for all equipment rentals. We can also provide insurance options if needed. Contact us to discuss insurance requirements and options."
        },
        {
          question: "What happens if I return equipment late?",
          answer: "Late returns are subject to additional charges based on our standard hourly rates. Please contact us if you need to extend your rental period to avoid late fees."
        }
      ]
    }
  ];

  return (
    <div className="container" style={{ padding: '2rem 0', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#2c3e50' }}>
          Frequently Asked Questions
        </h1>
        <p style={{ color: '#6c757d', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
          Find answers to common questions about RSLAF Machine Rentals. 
          Can't find what you're looking for? <a href="/contact" style={{ color: '#1b7a23' }}>Contact us</a> directly.
        </p>
      </div>

      {faqData.map((category, categoryIndex) => (
        <div key={categoryIndex} style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ 
            fontSize: '1.5rem', 
            marginBottom: '1.5rem', 
            color: '#1b7a23',
            borderBottom: '2px solid #1b7a23',
            paddingBottom: '0.5rem'
          }}>
            {category.category}
          </h2>
          
          <div style={{ background: '#fff', border: '1px solid #e9ecef', borderRadius: '8px', overflow: 'hidden' }}>
            {category.questions.map((item, questionIndex) => {
              const itemKey = `${categoryIndex}-${questionIndex}`;
              const isOpen = openItems[itemKey];
              
              return (
                <div key={questionIndex} style={{ borderBottom: questionIndex < category.questions.length - 1 ? '1px solid #e9ecef' : 'none' }}>
                  <button
                    onClick={() => toggleItem(itemKey)}
                    style={{
                      width: '100%',
                      padding: '1.25rem',
                      background: 'none',
                      border: 'none',
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '1.1rem',
                      fontWeight: '500',
                      color: '#2c3e50',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                    onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                  >
                    <span>{item.question}</span>
                    <span style={{ 
                      fontSize: '1.2rem', 
                      color: '#1b7a23',
                      transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s'
                    }}>
                      +
                    </span>
                  </button>
                  
                  {isOpen && (
                    <div style={{ 
                      padding: '0 1.25rem 1.25rem 1.25rem',
                      color: '#495057',
                      lineHeight: '1.6',
                      backgroundColor: '#f8f9fa'
                    }}>
                      {item.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <div style={{ 
        background: '#f8f9fa', 
        border: '1px solid #e9ecef', 
        borderRadius: '8px', 
        padding: '2rem', 
        textAlign: 'center',
        marginTop: '3rem'
      }}>
        <h3 style={{ color: '#2c3e50', marginBottom: '1rem' }}>Still have questions?</h3>
        <p style={{ color: '#6c757d', marginBottom: '1.5rem' }}>
          Our team is here to help! Get in touch with us for personalized assistance.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a 
            href="tel:+23278839095"
            style={{
              background: '#1b7a23',
              color: 'white',
              padding: '0.75rem 1.5rem',
              borderRadius: '6px',
              textDecoration: 'none',
              fontWeight: '500',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.target.style.background = '#155a1b'}
            onMouseOut={(e) => e.target.style.background = '#1b7a23'}
          >
            📞 Call Us
          </a>
          <a 
            href="mailto:rslafierentalservice@gmail.com"
            style={{
              background: 'transparent',
              color: '#1b7a23',
              padding: '0.75rem 1.5rem',
              border: '2px solid #1b7a23',
              borderRadius: '6px',
              textDecoration: 'none',
              fontWeight: '500',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.target.style.background = '#1b7a23';
              e.target.style.color = 'white';
            }}
            onMouseOut={(e) => {
              e.target.style.background = 'transparent';
              e.target.style.color = '#1b7a23';
            }}
          >
            📧 Email Us
          </a>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
