import { sendPasswordResetEmail } from '../services/emailService';

async function testEmail() {
  try {
    await sendPasswordResetEmail('rdsgilmar81@gmail.com', 'token-de-teste');
    console.log('Email enviado com sucesso!');
  } catch (error) {
    console.error('Erro ao enviar email:', error);
  }
}

testEmail();
