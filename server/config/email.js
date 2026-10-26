import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

// HTML Email Wrapper Layout
const getEmailHtml = (title, bodyContent) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #f8fafc;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      background-color: #f8fafc;
      width: 100%;
      padding: 40px 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
      border: 1px solid #e2e8f0;
    }
    .header {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      padding: 36px 24px;
      text-align: center;
    }
    .logo-container {
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }
    .logo-icon {
      background-color: rgba(255, 255, 255, 0.2);
      border-radius: 10px;
      padding: 8px;
      display: inline-block;
      vertical-align: middle;
    }
    .logo-text {
      color: #ffffff;
      font-size: 26px;
      font-weight: 900;
      letter-spacing: -0.5px;
      margin: 0;
      display: inline-block;
      vertical-align: middle;
      font-family: 'Poppins', sans-serif;
    }
    .content {
      padding: 40px 32px;
      color: #334155;
      line-height: 1.6;
    }
    .greeting {
      font-size: 20px;
      font-weight: 700;
      color: #0f172a;
      margin-top: 0;
      margin-bottom: 16px;
    }
    .text {
      font-size: 15px;
      margin-bottom: 24px;
      color: #475569;
    }
    .features-card {
      background-color: #f8fafc;
      border: 1px solid #f1f5f9;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 24px;
    }
    .features-title {
      font-size: 13px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #64748b;
      margin-top: 0;
      margin-bottom: 12px;
    }
    .feature-item {
      font-size: 14px;
      color: #475569;
      margin: 8px 0;
      display: flex;
      align-items: center;
      font-weight: 500;
    }
    .btn {
      display: inline-block;
      background-color: #10b981;
      color: #ffffff !important;
      padding: 12px 28px;
      border-radius: 8px;
      font-weight: 700;
      font-size: 14px;
      text-decoration: none;
      text-align: center;
      box-shadow: 0 4px 10px rgba(16, 185, 129, 0.25);
      margin-top: 8px;
      margin-bottom: 24px;
    }
    .footer {
      background-color: #f1f5f9;
      padding: 24px;
      text-align: center;
      border-top: 1px solid #e2e8f0;
    }
    .footer-text {
      font-size: 12px;
      color: #64748b;
      margin: 4px 0;
    }
    .link-alt {
      font-size: 13px;
      color: #10b981;
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <div class="logo-container">
          <div style="display: inline-block; vertical-align: middle; margin-right: 10px; background-color: rgba(255, 255, 255, 0.18); padding: 8px; border-radius: 8px;">
            <table cellpadding="0" cellspacing="0" style="border: 2px solid #ffffff; width: 14px; height: 18px; border-radius: 3px; border-collapse: collapse;">
              <tr>
                <td style="padding: 2px 2px 0 2px; vertical-align: top;">
                  <div style="height: 2px; background-color: #ffffff; width: 7px; margin-bottom: 2px; font-size: 1px; line-height: 1px;"></div>
                  <div style="height: 2px; background-color: #ffffff; width: 7px; margin-bottom: 2px; font-size: 1px; line-height: 1px;"></div>
                  <div style="height: 2px; background-color: #ffffff; width: 5px; font-size: 1px; line-height: 1px;"></div>
                </td>
              </tr>
            </table>
          </div>
          <span class="logo-text">Resumify<span style="color:#a7f3d0">.</span></span>
        </div>
      </div>
      
      <div class="content">
        ${bodyContent}
      </div>

      <div class="footer">
        <p class="footer-text"><strong>Resumify Resume Builder & Optimizer</strong></p>
        <p class="footer-text">Helping you land your dream career with professional templates and AI guidance.</p>
        <p class="footer-text">&copy; ${new Date().getFullYear()} Resumify. All rights reserved.</p>
      </div>

    </div>
  </div>
</body>
</html>
`;

// 1. Send Welcome Email
export const sendWelcomeEmail = async (email, name) => {
  const subject = 'Welcome to Resumify - Build Your Dream Career! 🚀';
  
  const bodyContent = `
    <h2 class="greeting">Hi ${name},</h2>
    <p class="text">
      Thank you for joining <strong>Resumify</strong>! We are thrilled to help you build outstanding, recruiter-approved resumes optimized to pass Applicant Tracking Systems.
    </p>
    
    <div class="features-card">
      <h4 class="features-title">What you get with your free account:</h4>
      <div class="feature-item">✓ Create up to 3 Resumes</div>
      <div class="feature-item">✓ Standard high-quality PDF Exports</div>
      <div class="feature-item">✓ Modern & Classic layouts</div>
      <div class="feature-item">✓ Interactive live-preview editor</div>
    </div>
    
    <p class="text">Ready to get started? Log in to your workspace and create your first CV now:</p>
    
    <a href="${frontendUrl}/app" class="btn" target="_blank">Go to Dashboard</a>
    
    <p class="text" style="margin-top: 16px; font-size: 13px; color: #94a3b8;">
      If the button above does not work, visit: <a href="${frontendUrl}/app" class="link-alt">${frontendUrl}/app</a>
    </p>
  `;

  try {
    await transporter.sendMail({
      from: `"Resumify" <${process.env.EMAIL_USER}>`,
      to: email,
      subject,
      html: getEmailHtml(subject, bodyContent),
    });
    console.log(`Welcome email successfully sent to ${email}`);
  } catch (error) {
    console.error('Failed to send welcome email:', error);
  }
};

// 2. Send Subscription Success (Pro Activation) Email
export const sendSubscriptionEmail = async (email, name) => {
  const subject = 'Welcome to Resumify Pro! Your Subscription is Active 💎';
  
  const bodyContent = `
    <h2 class="greeting">Hi ${name},</h2>
    <p class="text">
      Thank you for upgrading to <strong>Resumify Pro</strong>! Your subscription is active, and you now have full access to our premium suite of tools.
    </p>
    
    <div class="features-card">
      <h4 class="features-title">Premium Features Unlocked:</h4>
      <div class="feature-item">✓ Create Unlimited Resumes</div>
      <div class="feature-item">✓ Detailed AI ATS Audit Score scanner</div>
      <div class="feature-item">✓ Actionable suggestions to fix resume defects</div>
      <div class="feature-item">✓ Microsoft Word (.docx) Exports</div>
      <div class="feature-item">✓ Custom vanity preview URLs</div>
      <div class="feature-item">✓ Priority 24/7 support access</div>
    </div>
    
    <p class="text">Open your dashboard to optimize and scan your resume against ATS tracking algorithms now:</p>
    
    <a href="${frontendUrl}/app" class="btn" target="_blank">Explore Pro Dashboard</a>
    
    <p class="text" style="margin-top: 16px; font-size: 13px; color: #94a3b8;">
      If the button above does not work, visit: <a href="${frontendUrl}/app" class="link-alt">${frontendUrl}/app</a>
    </p>
  `;

  try {
    await transporter.sendMail({
      from: `"Resumify" <${process.env.EMAIL_USER}>`,
      to: email,
      subject,
      html: getEmailHtml(subject, bodyContent),
    });
    console.log(`Pro subscription email successfully sent to ${email}`);
  } catch (error) {
    console.error('Failed to send subscription email:', error);
  }
};

// 3. Send Resume Ready / Preview Link Email
export const sendResumeReadyEmail = async (email, name, resumeTitle, resumeId, isPublic) => {
  const subject = `Your Resume "${resumeTitle}" is Saved & Ready! 📄`;
  
  const builderUrl = `${frontendUrl}/app/builder/${resumeId}`;
  const publicPreviewUrl = `${frontendUrl}/preview/${resumeId}`;
  
  let linkSection = '';
  if (isPublic) {
    linkSection = `
      <p class="text">
        Since this resume is set to <strong>Public</strong>, anyone can view your online profile. Here is your sharing preview link:
      </p>
      <div style="margin: 16px 0;">
        <a href="${publicPreviewUrl}" class="link-alt" style="font-size: 16px; font-weight: 700;" target="_blank">${publicPreviewUrl}</a>
      </div>
      <p class="text">
        You can also continue editing the layout, choosing colors, or downloading templates via the link below:
      </p>
    `;
  } else {
    linkSection = `
      <p class="text">
        Your resume is currently set to <strong>Private</strong>. You can edit, customize, or download it as PDF/Word using the editor link below:
      </p>
    `;
  }

  const bodyContent = `
    <h2 class="greeting">Hi ${name},</h2>
    <p class="text">
      Congratulations! Your resume <strong>"${resumeTitle}"</strong> has been successfully saved and optimized on Resumify.
    </p>
    
    ${linkSection}
    
    <a href="${builderUrl}" class="btn" target="_blank">Open in Editor</a>
    
    <p class="text" style="margin-top: 16px; font-size: 13px; color: #94a3b8;">
      If the button above does not work, copy and paste this link: <br>
      <a href="${builderUrl}" class="link-alt">${builderUrl}</a>
    </p>
  `;

  try {
    await transporter.sendMail({
      from: `"Resumify" <${process.env.EMAIL_USER}>`,
      to: email,
      subject,
      html: getEmailHtml(subject, bodyContent),
    });
    console.log(`Resume ready email successfully sent to ${email}`);
  } catch (error) {
    console.error('Failed to send resume ready email:', error);
  }
};
