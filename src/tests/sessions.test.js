const chai = require('chai');
const supertest = require('supertest');

const expect = chai.expect;
const requester = supertest('http://localhost:8080');

describe('Testing Sessions API', () => {

  it('Iniciar sesión', async () => {
    const credentials = {
      email: 'felipetomaslopezrios@gmail.com',
      password: 'test'
    };
  
    const { statusCode } = await requester.post('/auth/login').send(credentials);
  
    expect(statusCode).to.equal(302);
  });

  it('Iniciar sesión con usuario no existente', async () => {
    const credentials = {
      email: 'testlogin@gmail.com',
      password: 'contra1234'
    };
  
    const { statusCode, body } = await requester.post('/auth/login').send(credentials);
  
    expect(statusCode).to.equal(404);
    expect(body).is.ok.and.to.have.property('error');
  });

  it('Registro de usuario', async () => {
    const newUser = {
      first_name: 'Prueba',
      last_name: 'Test',
      email: 'test@gmail.com',
      age: 30,
      password: 'contra123'
    };
  
    const { statusCode } = await requester.post('/auth/register').send(newUser);
  
    expect(statusCode).to.equal(302);
  });

  it('Solicitar restablecimiento de contraseña', async () => {
    const email = 'felipetomaslopezrios@gmail.com';
  
    const { statusCode, body } = await requester.post('/auth//password/reset/request').send({ email });
  
    expect(statusCode).to.equal(200);
    expect(body).to.have.property('message', 'Email para restablecer la contraseña enviado');
  });
  
});
