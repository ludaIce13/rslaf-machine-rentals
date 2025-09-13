import React from 'react';

const Cart = () => {
  return (
    <div className="container" style={{ padding: '2rem 0', textAlign: 'center' }}>
      <h1>Shopping Cart</h1>
      <div style={{ margin: '2rem 0' }}>
        <p>Your shopping cart is currently empty.</p>
        <p><strong>Coming Soon:</strong> Cart management, quantity updates, and checkout process.</p>
      </div>
    </div>
  );
};

export default Cart;