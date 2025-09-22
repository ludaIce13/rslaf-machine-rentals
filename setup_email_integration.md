# 📧 EmailJS Setup - Step by Step

## 🚀 Quick Setup (5 minutes)

### Step 1: EmailJS Account
1. Go to: https://www.emailjs.com/
2. Click "Sign Up" (free account)
3. Verify your email

### Step 2: Add Email Service
1. In dashboard, click "Add New Service"
2. Choose "Gmail" (recommended)
3. Connect your Gmail account
4. **COPY YOUR SERVICE ID** (e.g., `service_abc123`)

### Step 3: Create Template
1. Click "Email Templates" → "Create New Template"
2. **Template Name**: `RSLAF Order Notification`
3. **Subject**: `New Order: {{equipment_name}} - {{customer_name}}`
4. **Content**:
```
🎉 New Equipment Rental Order!

Customer: {{customer_name}}
Email: {{customer_email}}
Phone: {{customer_phone}}
Company: {{customer_company}}

Equipment: {{equipment_name}}
Duration: {{total_hours}} hours
Amount: ${{total_price}}
Payment: {{payment_method}}
Order ID: {{order_id}}

📋 Quick Add to Admin:
Customer: {{customer_name}}
Equipment: {{equipment_name}}
Price: {{total_price}}
Hours: {{total_hours}}
```
5. **Save** and **COPY TEMPLATE ID** (e.g., `template_xyz789`)

### Step 4: Get Public Key
1. Go to "Account" → "General"
2. **COPY YOUR PUBLIC KEY** (e.g., `user_abc123xyz`)

### Step 5: Update Code
Replace these values in `customer-portal/src/pages/Payment.js`:

```javascript
service_id: 'YOUR_SERVICE_ID_HERE',    // Replace with your Service ID
template_id: 'YOUR_TEMPLATE_ID_HERE',  // Replace with your Template ID  
user_id: 'YOUR_PUBLIC_KEY_HERE',       // Replace with your Public Key
```

### Step 6: Deploy
1. Git add, commit, push
2. Deploy customer portal on Render
3. Test with a booking!

## 📧 What You'll Receive

When a customer completes payment, you'll get an email like:

```
Subject: New Order: Bob Cat - Agyeman Taqi

🎉 New Equipment Rental Order!

Customer: Agyeman Taqi
Email: agyeman.taqi@example.com
Phone: +232 78 999888
Company: Taqi Construction

Equipment: Bob Cat
Duration: 729 hours
Amount: $40095.00
Payment: credit_debit_card
Order ID: 1727014598000

📋 Quick Add to Admin:
Customer: Agyeman Taqi
Equipment: Bob Cat
Price: 40095.00
Hours: 729
```

Then just copy the details and use "Add Manual Order" in admin portal!

## 🎯 Ready to Set Up?

1. **Go to EmailJS now**: https://www.emailjs.com/
2. **Follow steps 1-4** above
3. **Tell me your 3 IDs** and I'll update the code
4. **Deploy and test!**

This gives you instant email notifications for every order! 📧✅
