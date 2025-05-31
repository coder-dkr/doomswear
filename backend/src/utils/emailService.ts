import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.MAILTRAP_HOST || 'sandbox.smtp.mailtrap.io',
  port: parseInt(process.env.MAILTRAP_PORT || '2525'),
  auth: {
    user: process.env.MAILTRAP_USER || 'api',
    pass: process.env.MAILTRAP_PASS 
  }
});

export const sendOrderConfirmationEmail = async (
  email: string, 
  order: any
) => {
  const mailOptions = {
    from: '"DoomsWear Shop" <noreply@demomailtrap.co>',
    to: "dhruvroykumart@gmail.com",
    subject: `Order Confirmation - #${order.orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #e91e63; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">Order Confirmation</h1>
          <p style="margin: 5px 0 0;">Order #${order.orderNumber}</p>
        </div>
        
        <div style="padding: 20px; border: 1px solid #e0e0e0; border-top: none;">
          <p>Dear ${order.customerInfo.fullName},</p>
          
          <p>Thank you for your purchase! We're processing your order and will ship it soon.</p>
          
          <div style="background-color: #f9f9f9; padding: 15px; margin: 20px 0;">
            <h2 style="margin-top: 0; color: #333; font-size: 18px;">Order Summary</h2>
            
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee; width: 70%;">
                  <div style="font-weight: bold;">${order.product.name}</div>
                  <div style="color: #666; font-size: 14px;">
                    Color: ${order.product.color}, Size: ${order.product.size}
                  </div>
                </td>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: right;">
                  <div>${order.product.quantity} × ₹${order.product.price}</div>
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 0; text-align: right; font-weight: bold;">Subtotal:</td>
                <td style="padding: 8px 0; text-align: right;">₹${order.product.price * order.product.quantity}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; text-align: right; font-weight: bold;">Shipping:</td>
                <td style="padding: 8px 0; text-align: right; color: #4caf50;">Free</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; text-align: right; font-weight: bold; font-size: 16px;">Total:</td>
                <td style="padding: 8px 0; text-align: right; font-weight: bold; font-size: 16px;">₹${order.totalAmount}</td>
              </tr>
            </table>
          </div>
          
          <div style="margin: 20px 0;">
            <h2 style="margin-top: 0; color: #333; font-size: 18px;">Shipping Address</h2>
            <p style="margin: 5px 0;">
              ${order.customerInfo.address}<br>
              ${order.customerInfo.city}, ${order.customerInfo.state} ${order.customerInfo.zipCode}
            </p>
          </div>
          
          <p>If you have any questions about your order, please contact our customer service team at support@doomswear.com.</p>
          
          <p>Thank you for shopping with us!</p>
          
          <p>Sincerely,<br>The DoomsWear Team</p>
        </div>
        
        <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; color: #666;">
          <p>© ${new Date().getFullYear()} DoomsWear. All rights reserved.</p>
          <p>This is an automated message, please do not reply to this email.</p>
        </div>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Order confirmation email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    throw error;
  }
};

export const sendOrderFailureEmail = async (
  email: string, 
  order: any
) => {
  const mailOptions = {
    from: '"DoomsWear Shop" <noreply@demomailtrap.co>',
    to: "dhruvroykumart@gmail.com",
    subject: `Payment Failed - Order #${order.orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f44336; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">Payment Failed</h1>
          <p style="margin: 5px 0 0;">Order #${order.orderNumber}</p>
        </div>
        
        <div style="padding: 20px; border: 1px solid #e0e0e0; border-top: none;">
          <p>Dear ${order.customerInfo.fullName},</p>
          
          <p>We're sorry, but we were unable to process your payment for the following order:</p>
          
          <div style="background-color: #f9f9f9; padding: 15px; margin: 20px 0;">
            <h2 style="margin-top: 0; color: #333; font-size: 18px;">Order Summary</h2>
            
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee; width: 70%;">
                  <div style="font-weight: bold;">${order.product.name}</div>
                  <div style="color: #666; font-size: 14px;">
                    Color: ${order.product.color}, Size: ${order.product.size}
                  </div>
                </td>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: right;">
                  <div>${order.product.quantity} × ₹${order.product.price}</div>
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 0; text-align: right; font-weight: bold; font-size: 16px;">Total:</td>
                <td style="padding: 8px 0; text-align: right; font-weight: bold; font-size: 16px;">₹${order.totalAmount}</td>
              </tr>
            </table>
          </div>
          
          <p><strong>Reason for failure:</strong> ${order.status === 'declined' ? 'Your payment was declined by your bank or card issuer.' : 'We encountered a technical issue while processing your payment.'}</p>
          
          <p>You can try again with a different payment method by visiting our website and completing your purchase.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="http://localhost:3000/" style="background-color: #e91e63; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">Try Again</a>
          </div>
          
          <p>If you continue to experience issues or have any questions, please contact our customer service team at support@doomswear.com.</p>
          
          <p>Thank you for your patience and understanding.</p>
          
          <p>Sincerely,<br>The DoomsWear Team</p>
        </div>
        
        <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; color: #666;">
          <p>© ${new Date().getFullYear()} DoomsWear. All rights reserved.</p>
          <p>This is an automated message, please do not reply to this email.</p>
        </div>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Order failure email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending order failure email:', error);
    throw error;
  }
};