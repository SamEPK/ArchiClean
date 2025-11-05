import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import { IEmailService } from '@application/use-cases/RegisterClientUseCase';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export class EmailService {
  private transporter: Transporter;
  private emailFrom: string;

  constructor(
    host: string = process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: number = parseInt(process.env.EMAIL_PORT || '587'),
    user: string = process.env.EMAIL_USER || '',
    password: string = process.env.EMAIL_PASSWORD || '',
    from: string = process.env.EMAIL_FROM || 'ArchiClean <noreply@archiclean.com>'
  ) {
    this.emailFrom = from;
    
    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // true for 465, false for other ports
      auth: {
        user,
        pass: password,
      },
    });
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: this.emailFrom,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      });
      console.log(`Email sent to ${options.to}`);
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error(`Failed to send email: ${error}`);
    }
  }

  async sendUserConfirmationEmail(email: string, token: string, firstName: string): Promise<void> {
    const appUrl = process.env.APP_URL || 'http://localhost:3000';
    const confirmationUrl = `${appUrl}/auth/confirm-email?token=${token}`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
            .content { background-color: #f9f9f9; padding: 20px; }
            .button { 
              display: inline-block; 
              padding: 12px 24px; 
              background-color: #4CAF50; 
              color: white; 
              text-decoration: none; 
              border-radius: 4px; 
              margin: 20px 0;
            }
            .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Bienvenue sur ArchiClean !</h1>
            </div>
            <div class="content">
              <p>Bonjour ${firstName},</p>
              <p>Merci de vous être inscrit sur ArchiClean. Pour activer votre compte, veuillez confirmer votre adresse email en cliquant sur le bouton ci-dessous :</p>
              <center>
                <a href="${confirmationUrl}" class="button">Confirmer mon email</a>
              </center>
              <p>Ou copiez ce lien dans votre navigateur :</p>
              <p><a href="${confirmationUrl}">${confirmationUrl}</a></p>
              <p>Ce lien est valide pendant 24 heures.</p>
              <p>Si vous n'avez pas créé de compte, vous pouvez ignorer cet email.</p>
            </div>
            <div class="footer">
              <p>&copy; 2025 ArchiClean. Tous droits réservés.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const text = `
      Bonjour ${firstName},
      
      Merci de vous être inscrit sur ArchiClean. Pour activer votre compte, veuillez confirmer votre adresse email en visitant ce lien :
      
      ${confirmationUrl}
      
      Ce lien est valide pendant 24 heures.
      
      Si vous n'avez pas créé de compte, vous pouvez ignorer cet email.
      
      © 2025 ArchiClean. Tous droits réservés.
    `;

    await this.sendEmail({
      to: email,
      subject: 'Confirmez votre adresse email - ArchiClean',
      html,
      text,
    });
  }

  async sendPasswordResetEmail(email: string, token: string, firstName: string): Promise<void> {
    const appUrl = process.env.APP_URL || 'http://localhost:3000';
    const resetUrl = `${appUrl}/auth/reset-password?token=${token}`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #FF5722; color: white; padding: 20px; text-align: center; }
            .content { background-color: #f9f9f9; padding: 20px; }
            .button { 
              display: inline-block; 
              padding: 12px 24px; 
              background-color: #FF5722; 
              color: white; 
              text-decoration: none; 
              border-radius: 4px; 
              margin: 20px 0;
            }
            .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Réinitialisation de mot de passe</h1>
            </div>
            <div class="content">
              <p>Bonjour ${firstName},</p>
              <p>Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le bouton ci-dessous pour continuer :</p>
              <center>
                <a href="${resetUrl}" class="button">Réinitialiser mon mot de passe</a>
              </center>
              <p>Ou copiez ce lien dans votre navigateur :</p>
              <p><a href="${resetUrl}">${resetUrl}</a></p>
              <p>Ce lien est valide pendant 1 heure.</p>
              <p>Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email.</p>
            </div>
            <div class="footer">
              <p>&copy; 2025 ArchiClean. Tous droits réservés.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const text = `
      Bonjour ${firstName},
      
      Vous avez demandé à réinitialiser votre mot de passe. Visitez ce lien pour continuer :
      
      ${resetUrl}
      
      Ce lien est valide pendant 1 heure.
      
      Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email.
      
      © 2025 ArchiClean. Tous droits réservés.
    `;

    await this.sendEmail({
      to: email,
      subject: 'Réinitialisation de mot de passe - ArchiClean',
      html,
      text,
    });
  }

  async sendWelcomeEmail(email: string, firstName: string): Promise<void> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #2196F3; color: white; padding: 20px; text-align: center; }
            .content { background-color: #f9f9f9; padding: 20px; }
            .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Compte activé avec succès !</h1>
            </div>
            <div class="content">
              <p>Bonjour ${firstName},</p>
              <p>Votre compte ArchiClean a été activé avec succès !</p>
              <p>Vous pouvez maintenant vous connecter et profiter de toutes nos fonctionnalités :</p>
              <ul>
                <li>Gestion de vos comptes bancaires</li>
                <li>Épargne et investissements</li>
                <li>Messagerie sécurisée</li>
                <li>Et bien plus encore...</li>
              </ul>
              <p>Merci de nous faire confiance !</p>
            </div>
            <div class="footer">
              <p>&copy; 2025 ArchiClean. Tous droits réservés.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const text = `
      Bonjour ${firstName},
      
      Votre compte ArchiClean a été activé avec succès !
      
      Vous pouvez maintenant vous connecter et profiter de toutes nos fonctionnalités.
      
      Merci de nous faire confiance !
      
      © 2025 ArchiClean. Tous droits réservés.
    `;

    await this.sendEmail({
      to: email,
      subject: 'Bienvenue sur ArchiClean !',
      html,
      text,
    });
  }
}

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
