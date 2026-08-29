import nodemailer from 'nodemailer';

let pooledTransporter = null;

const getTransporter = () => {
    if (!pooledTransporter) {
        const isCustomHost = !!process.env.SMTP_HOST && process.env.SMTP_HOST !== 'smtp.gmail.com';
        const transportConfig = isCustomHost
            ? {
                host: process.env.SMTP_HOST,
                port: Number(process.env.SMTP_PORT) || 587,
                secure: false, // Port 587 uses STARTTLS
                pool: true,
                maxConnections: 5,
                maxMessages: 100,
                connectionTimeout: 10000,
                greetingTimeout: 5000,
                socketTimeout: 15000,
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS
                }
            }
            : {
                service: 'gmail',
                pool: true,
                maxConnections: 5,
                maxMessages: 100,
                connectionTimeout: 10000,
                greetingTimeout: 5000,
                socketTimeout: 15000,
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS
                }
            };

        pooledTransporter = nodemailer.createTransport(transportConfig);
    }
    return pooledTransporter;
};

const getFromAddress = () => {
    return process.env.EMAIL_FROM || `"SkillSync" <${process.env.SMTP_USER}>`;
};

/**
 * Reusable Luxury Production Email Frame (Stripe / Linear / Vercel style)
 */
const renderEmailFrame = ({ previewText, title, badge, contentHtml, ctaText, ctaUrl, securityNote, directLink }) => {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <!--[if mso]>
    <noscript>
        <xml>
            <o:OfficeDocumentSettings>
                <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
        </xml>
    </noscript>
    <![endif]-->
    <style>
        body { margin: 0; padding: 0; background-color: #0b0f19; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f1f5f9; -webkit-font-smoothing: antialiased; }
        table { border-collapse: separate; }
        a { text-decoration: none; }
        @media only screen and (max-width: 600px) {
            .email-container { width: 100% !important; padding: 12px !important; }
            .card-inner { padding: 24px 18px !important; }
            .cta-button { width: 100% !important; text-align: center !important; }
        }
    </style>
</head>
<body style="margin: 0; padding: 32px 0; background-color: #0b0f19; background-image: radial-gradient(circle at top center, #1e1b4b 0%, #0b0f19 70%);">
    <!-- Hidden preview text for email clients -->
    <div style="display: none; font-size: 1px; color: #0b0f19; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
        ${previewText || title}
    </div>

    <center>
        <table class="email-container" width="560" border="0" cellpadding="0" cellspacing="0" style="width: 560px; max-width: 560px; margin: 0 auto;">
            <!-- Brand Logo Header -->
            <tr>
                <td align="center" style="padding-bottom: 24px;">
                    <table border="0" cellpadding="0" cellspacing="0">
                        <tr>
                            <td align="center">
                                <table border="0" cellpadding="0" cellspacing="0">
                                    <tr>
                                        <td style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); width: 44px; height: 44px; border-radius: 12px; text-align: center; vertical-align: middle; box-shadow: 0 8px 20px rgba(79, 70, 229, 0.35);">
                                            <span style="color: #ffffff; font-size: 22px; font-weight: 900; line-height: 44px; display: inline-block;">⇄</span>
                                        </td>
                                        <td style="padding-left: 12px; text-align: left;">
                                            <span style="font-size: 20px; font-weight: 900; color: #ffffff; letter-spacing: -0.5px; display: block; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">SkillSync</span>
                                            <span style="font-size: 11px; font-weight: 700; color: #818cf8; text-transform: uppercase; letter-spacing: 1px; display: block;">Peer-to-Peer Knowledge Network</span>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>

            <!-- Main Obsidian Glass Card -->
            <tr>
                <td>
                    <table class="card-inner" width="100%" border="0" cellpadding="0" cellspacing="0" style="background: #111827; border: 1px solid #1f2937; border-radius: 20px; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.45); padding: 36px 32px;">
                        <!-- Badge -->
                        ${badge ? `
                        <tr>
                            <td style="padding-bottom: 16px;">
                                <span style="display: inline-block; padding: 4px 12px; border-radius: 9999px; background: rgba(99, 102, 241, 0.15); border: 1px solid rgba(129, 140, 248, 0.3); font-size: 11px; font-weight: 700; color: #a5b4fc; text-transform: uppercase; letter-spacing: 0.5px;">
                                    ${badge}
                                </span>
                            </td>
                        </tr>
                        ` : ''}

                        <!-- Title -->
                        <tr>
                            <td style="padding-bottom: 20px;">
                                <h1 style="margin: 0; font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px; line-height: 1.3;">
                                    ${title}
                                </h1>
                            </td>
                        </tr>

                        <!-- Body Content -->
                        <tr>
                            <td style="font-size: 15px; line-height: 1.6; color: #cbd5e1; padding-bottom: 28px;">
                                ${contentHtml}
                            </td>
                        </tr>

                        <!-- CTA Button -->
                        ${ctaText && ctaUrl ? `
                        <tr>
                            <td align="center" style="padding-bottom: 28px;">
                                <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                    <tr>
                                        <td align="center">
                                            <a class="cta-button" href="${ctaUrl}" target="_blank" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%); color: #ffffff; font-size: 14px; font-weight: 800; border-radius: 12px; text-decoration: none; letter-spacing: 0.2px; box-shadow: 0 4px 18px rgba(79, 70, 229, 0.4); text-align: center;">
                                                ${ctaText} →
                                            </a>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                        ` : ''}

                        <!-- Direct Link Fallback -->
                        ${directLink ? `
                        <tr>
                            <td style="padding: 16px; background: #0b0f19; border: 1px solid #1e293b; border-radius: 12px; font-size: 12px; color: #94a3b8; word-break: break-all; margin-bottom: 20px;">
                                <span style="font-weight: 700; color: #cbd5e1; display: block; margin-bottom: 4px;">Direct link fallback:</span>
                                <a href="${directLink}" style="color: #818cf8; text-decoration: underline;">${directLink}</a>
                            </td>
                        </tr>
                        ` : ''}

                        <!-- Security Note -->
                        ${securityNote ? `
                        <tr>
                            <td style="padding-top: 24px; border-top: 1px solid #1e293b;">
                                <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                    <tr>
                                        <td style="font-size: 12px; line-height: 1.5; color: #64748b;">
                                            <strong style="color: #94a3b8;">Security Notice:</strong> ${securityNote}
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                        ` : ''}
                    </table>
                </td>
            </tr>

            <!-- Footer -->
            <tr>
                <td style="padding-top: 24px; text-align: center; font-size: 12px; color: #475569; line-height: 1.6;">
                    <p style="margin: 0 0 6px 0;">
                        SkillSync · Pure Peer-to-Peer Knowledge Exchange
                    </p>
                    <p style="margin: 0;">
                        Zero Fees · Open Education for University Students & Professors
                    </p>
                </td>
            </tr>
        </table>
    </center>
</body>
</html>
    `;
};

/**
 * 1. Verification Email
 */
export const sendVerificationEmail = async (to, name = 'there', token) => {
    const transporter = getTransporter();
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const verifyUrl = `${clientUrl}/verify-email?token=${token}`;

    const text = `Hi ${name},\n\nWelcome to SkillSync! Please verify your account by clicking the link below:\n\n${verifyUrl}\n\nThis link is valid for 24 hours.\n\nBest,\nThe SkillSync Team`;

    const html = renderEmailFrame({
        previewText: 'Verify your SkillSync account to start exchanging skills.',
        badge: 'Account Security',
        title: `Welcome to SkillSync, ${name.split(' ')[0]}!`,
        contentHtml: `
            <p style="margin-top: 0;">You're just one step away from joining an exclusive peer network of university students and professors exchanging skills without money.</p>
            <p>Please confirm your email address by clicking the button below to verify your identity and activate your account:</p>
        `,
        ctaText: 'Verify Email Address',
        ctaUrl: verifyUrl,
        directLink: verifyUrl,
        securityNote: 'This verification link is valid for 24 hours. If you did not create a SkillSync account, please disregard this email.'
    });

    return transporter.sendMail({
        from: getFromAddress(),
        to,
        replyTo: process.env.SMTP_USER,
        subject: 'Verify your SkillSync account',
        text,
        html,
        headers: {
            'X-Priority': '1',
            'Importance': 'high'
        }
    });
};

/**
 * 2. Thank You for Registering / Welcome Email
 */
export const sendWelcomeEmail = async (to, name = 'there') => {
    const transporter = getTransporter();
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

    const text = `Welcome to SkillSync, ${name}!\n\nWhere knowledge is the only currency.\nExplore matches: ${clientUrl}/discover`;

    const html = renderEmailFrame({
        previewText: 'Your SkillSync account is active. Here is how to get started.',
        badge: 'Getting Started',
        title: `You're ready to swap skills, ${name.split(' ')[0]}!`,
        contentHtml: `
            <p style="margin-top: 0;">Thank you for registering on <strong>SkillSync</strong> — where knowledge is the only currency.</p>
            <div style="background: #0b0f19; border: 1px solid #1e293b; border-radius: 12px; padding: 18px; margin: 20px 0;">
                <p style="margin: 0 0 10px 0; font-weight: 700; color: #f1f5f9;">3 Steps to your first 1-on-1 swap:</p>
                <div style="font-size: 13px; color: #94a3b8; line-height: 1.6;">
                    <p style="margin: 4px 0;">1. <strong>Declare your skills</strong>: Add skills you can teach and want to learn.</p>
                    <p style="margin: 4px 0;">2. <strong>Browse AI Matches</strong>: Find peers with complementary skills.</p>
                    <p style="margin: 4px 0;">3. <strong>Book a live video exchange</strong>: Meet, learn, and earn reputation.</p>
                </div>
            </div>
        `,
        ctaText: 'Explore Discover Matches',
        ctaUrl: `${clientUrl}/discover`,
        securityNote: 'You can update your notification preferences anytime in your Profile Settings.'
    });

    return transporter.sendMail({
        from: getFromAddress(),
        to,
        replyTo: process.env.SMTP_USER,
        subject: 'Welcome to SkillSync - Get started exchanging skills',
        text,
        html
    });
};

/**
 * 3. Match Request Alert Email
 */
export const sendMatchRequestEmail = async (to, recipientName, senderName, teachSkill, learnSkill) => {
    const transporter = getTransporter();
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

    const text = `Hi ${recipientName},\n\n${senderName} wants to exchange skills with you on SkillSync!\nThey teach: ${teachSkill}\nThey want to learn: ${learnSkill}\n\nView request: ${clientUrl}/matches`;

    const html = renderEmailFrame({
        previewText: `${senderName} wants to exchange skills with you on SkillSync.`,
        badge: 'New Match Request',
        title: `Skill Swap Invitation from ${senderName}`,
        contentHtml: `
            <p style="margin-top: 0;"><strong>${senderName}</strong> wants to connect and exchange knowledge with you on SkillSync.</p>
            <div style="background: #0b0f19; border: 1px solid #1e293b; border-radius: 12px; padding: 16px; margin: 18px 0;">
                <table width="100%" border="0" cellpadding="0" cellspacing="0" style="font-size: 13px;">
                    <tr>
                        <td style="color: #94a3b8; padding-bottom: 6px;">They can teach:</td>
                        <td style="color: #818cf8; font-weight: 700; text-align: right; padding-bottom: 6px;">${teachSkill || 'Skills'}</td>
                    </tr>
                    <tr>
                        <td style="color: #94a3b8;">They want to learn:</td>
                        <td style="color: #34d399; font-weight: 700; text-align: right;">${learnSkill || 'Skills'}</td>
                    </tr>
                </table>
            </div>
            <p>Review their profile and accept the invitation to start chatting and book a session.</p>
        `,
        ctaText: 'View Swap Request',
        ctaUrl: `${clientUrl}/matches`
    });

    return transporter.sendMail({
        from: getFromAddress(),
        to,
        replyTo: process.env.SMTP_USER,
        subject: `New Skill Swap request from ${senderName}`,
        text,
        html
    });
};

/**
 * 4. Match Accepted Notification Email
 */
export const sendMatchAcceptedEmail = async (to, name, partnerName, teachSkill, learnSkill) => {
    const transporter = getTransporter();
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

    const text = `Hi ${name},\n\nGreat news! ${partnerName} accepted your swap invitation on SkillSync!\nStart chatting: ${clientUrl}/chat`;

    const html = renderEmailFrame({
        previewText: `${partnerName} accepted your swap invitation!`,
        badge: 'Match Confirmed',
        title: `You and ${partnerName} are connected!`,
        contentHtml: `
            <p style="margin-top: 0;">Great news! <strong>${partnerName}</strong> has accepted your skill swap invitation.</p>
            <p>Your direct chat channel is now unlocked. You can message each other and schedule your first 1-on-1 video exchange.</p>
        `,
        ctaText: 'Open Chat & Schedule',
        ctaUrl: `${clientUrl}/chat`
    });

    return transporter.sendMail({
        from: getFromAddress(),
        to,
        replyTo: process.env.SMTP_USER,
        subject: `Match Accepted: You and ${partnerName} are now connected`,
        text,
        html
    });
};

/**
 * 5. Session Scheduled Confirmation Email
 */
export const sendSessionScheduledEmail = async (to, name, partnerName, sessionDetails) => {
    const transporter = getTransporter();
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const dateFormatted = new Date(sessionDetails.scheduled_at).toLocaleString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
    });

    const text = `Hi ${name},\n\nYour 1-on-1 session for ${sessionDetails.skill} with ${partnerName} is confirmed for ${dateFormatted}.\nView details: ${clientUrl}/sessions/${sessionDetails._id || ''}`;

    const html = renderEmailFrame({
        previewText: `Your session for ${sessionDetails.skill} is scheduled for ${dateFormatted}.`,
        badge: 'Session Confirmed',
        title: `1-on-1 Session Confirmed: ${sessionDetails.title || sessionDetails.skill}`,
        contentHtml: `
            <p style="margin-top: 0;">Your live skill swap session with <strong>${partnerName}</strong> has been successfully booked.</p>
            <div style="background: #0b0f19; border: 1px solid #1e293b; border-radius: 12px; padding: 18px; margin: 18px 0;">
                <table width="100%" border="0" cellpadding="0" cellspacing="0" style="font-size: 13px; color: #cbd5e1;">
                    <tr>
                        <td style="color: #94a3b8; padding-bottom: 8px;">Skill:</td>
                        <td style="color: #818cf8; font-weight: 700; text-align: right; padding-bottom: 8px;">${sessionDetails.skill}</td>
                    </tr>
                    <tr>
                        <td style="color: #94a3b8; padding-bottom: 8px;">Scheduled Date & Time:</td>
                        <td style="color: #ffffff; font-weight: 700; text-align: right; padding-bottom: 8px;">${dateFormatted}</td>
                    </tr>
                    <tr>
                        <td style="color: #94a3b8;">Duration:</td>
                        <td style="color: #ffffff; font-weight: 700; text-align: right;">${sessionDetails.duration_minutes || 60} Minutes</td>
                    </tr>
                </table>
            </div>
            <p>You can join the built-in video room 5 minutes before start time from your Sessions dashboard.</p>
        `,
        ctaText: 'View Session Details',
        ctaUrl: `${clientUrl}/sessions/${sessionDetails._id || ''}`
    });

    return transporter.sendMail({
        from: getFromAddress(),
        to,
        replyTo: process.env.SMTP_USER,
        subject: `Confirmed: ${sessionDetails.skill} session with ${partnerName}`,
        text,
        html
    });
};

/**
 * 6. Session Reminder (24h / 30m) Email
 */
export const sendSessionReminderEmail = async (to, sessionDetails) => {
    const transporter = getTransporter();
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const dateFormatted = new Date(sessionDetails.scheduled_at).toLocaleString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
    });

    const text = `Reminder: Upcoming session on ${sessionDetails.skill} at ${dateFormatted}.\nJoin: ${clientUrl}/sessions/${sessionDetails._id || ''}`;

    const html = renderEmailFrame({
        previewText: `Upcoming session on ${sessionDetails.skill} at ${dateFormatted}.`,
        badge: 'Session Reminder',
        title: `Upcoming Session: ${sessionDetails.skill}`,
        contentHtml: `
            <p style="margin-top: 0;">This is a friendly reminder that your scheduled session for <strong>${sessionDetails.skill}</strong> is coming up at <strong>${dateFormatted}</strong>.</p>
            <p>Please make sure your camera and microphone are ready before joining the live video exchange.</p>
        `,
        ctaText: 'Go to Live Session',
        ctaUrl: `${clientUrl}/sessions/${sessionDetails._id || ''}`
    });

    return transporter.sendMail({
        from: getFromAddress(),
        to,
        replyTo: process.env.SMTP_USER,
        subject: `Reminder: Upcoming session on ${sessionDetails.skill}`,
        text,
        html
    });
};

/**
 * 7. Session Completed / Review Reminder Email
 */
export const sendSessionCompletedEmail = async (to, name, partnerName, sessionDetails) => {
    const transporter = getTransporter();
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

    const text = `Hi ${name},\n\nGreat job on completing your ${sessionDetails.skill} session with ${partnerName}!\nView summary & leave review: ${clientUrl}/sessions/${sessionDetails._id || ''}`;

    const html = renderEmailFrame({
        previewText: `Your ${sessionDetails.skill} session with ${partnerName} is complete.`,
        badge: 'Session Completed',
        title: `Great job on completing your session!`,
        contentHtml: `
            <p style="margin-top: 0;">Congratulations on finishing your <strong>${sessionDetails.skill}</strong> session with <strong>${partnerName}</strong>.</p>
            <p>Our AI has generated your session summary, key takeaways, and recommended next steps. Don't forget to submit a peer review to help build your reputation score!</p>
        `,
        ctaText: 'View AI Summary & Review',
        ctaUrl: `${clientUrl}/sessions/${sessionDetails._id || ''}`
    });

    return transporter.sendMail({
        from: getFromAddress(),
        to,
        replyTo: process.env.SMTP_USER,
        subject: `Session Completed: ${sessionDetails.skill} with ${partnerName}`,
        text,
        html
    });
};

/**
 * 8. Password Reset Email
 */
export const sendPasswordResetEmail = async (to, name = 'there', token) => {
    const transporter = getTransporter();
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const resetUrl = `${clientUrl}/reset-password?token=${token}`;

    const text = `Hi ${name},\n\nReset your SkillSync password by clicking the link below:\n\n${resetUrl}\n\nThis link is valid for 1 hour only.\n\nBest,\nThe SkillSync Team`;

    const html = renderEmailFrame({
        previewText: 'Reset your SkillSync password.',
        badge: 'Password Reset',
        title: 'Reset your password',
        contentHtml: `
            <p style="margin-top: 0;">We received a request to reset the password for your SkillSync account associated with <strong>${to}</strong>.</p>
            <p>Click the button below to choose a new secure password:</p>
        `,
        ctaText: 'Reset Password',
        ctaUrl: resetUrl,
        directLink: resetUrl,
        securityNote: 'This password reset link is valid for 1 hour only. If you did not request a password reset, you can safely ignore this email.'
    });

    return transporter.sendMail({
        from: getFromAddress(),
        to,
        replyTo: process.env.SMTP_USER,
        subject: 'Reset your SkillSync password',
        text,
        html,
        headers: {
            'X-Priority': '1',
            'Importance': 'high'
        }
    });
};
