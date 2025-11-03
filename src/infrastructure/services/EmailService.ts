import { IEmailService } from '@application/use-cases/RegisterClientUseCase';

export class MockEmailService implements IEmailService {
  private sentEmails: Array<{
    email: string;
    token: string;
    clientName: string;
    sentAt: Date;
  }> = [];

  async sendConfirmationEmail(email: string, token: string, clientName: string): Promise<void> {
    console.log(`
=====================================
Email Confirmation
=====================================
To: ${email}
Subject: Confirm your email address

Hello ${clientName},

Thank you for registering! Please confirm your email address by clicking the link below:

http://localhost:3001/api/clients/confirm-email?token=${token}

This link will expire in 24 hours.

If you did not create an account, please ignore this email.

Best regards,
Banque Avenir Team
=====================================
    `);

    this.sentEmails.push({
      email,
      token,
      clientName,
      sentAt: new Date(),
    });
  }

  getSentEmails() {
    return this.sentEmails;
  }

  clear() {
    this.sentEmails = [];
  }
}
