import { SMTPClient, Message } from 'emailjs';

class EmailService {
  private readonly emailClient: SMTPClient = new SMTPClient({
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_USER_PASS,
    host: process.env.EMAIL_HOST,
    ssl: true
  });

  public sendConfirmToken(token: string, email: string): Promise<Message> {
    return new Promise((res, rej) => {
      this.emailClient.send(
        {
          from: process.env.EMAIL_USER,
          to: email,
          subject: 'Confirm your account in intrade.bar',
          text: `To confirm an account go by this link - ${process.env.FRONT_URL}/confirm/${token}`
        } as any,
        (err, msg) => {
          if (err) {
            console.error(err);
            rej(new Error('An error occurred while sending a letter to email'));
          }
          res(msg);
        }
      );
    });
  }
  public sendResetToken(token: string, email: string): Promise<Message> {
    return new Promise((res, rej) => {
      this.emailClient.send(
        {
          from: process.env.EMAIL_USER,
          to: email,
          subject: 'Reset password for your account in intrade.bar',
          text: `To reset a password go by this link - ${process.env.FRONT_URL}/reset/${token}`
        } as any,
        (err, msg) => {
          if (err) {
            console.error(err);
            rej(new Error('An error occure to while sending a letter to email'));
          }
          res(msg);
        }
      );
    });
  }
}

export const emailService = new EmailService();
