const chai = require('chai');
const supertest = require('supertest');

const expect = chai.expect;
const requester = supertest('http://localhost:8080');

describe('Testing Cart API', () => {
  it('Agregar Carrito', async () => {
    const { statusCode, body } = await requester.post('/api/carts');
  
    expect(statusCode).to.equal(201);
    expect(body).to.be.an('object').and.to.have.property('data');
  });
  

  it('Obtener Carrito', async () => {
    const cartId = "6625799fc9e9bdf4572ba13f";
    const { statusCode, body } = await requester.get(`/api/carts/${cartId}`);

    expect(statusCode).to.equal(200);
    expect(body).to.be.an('array');
  });

  it('Eliminar todos los productos del carrito', async () => {
    const cartId = "6625799fc9e9bdf4572ba13f";
  
    const { statusCode, body } = await requester.delete(`/api/carts/${cartId}`);

    expect(statusCode).to.equal(200);
    expect(body).to.be.an('object').and.to.have.property('success', true);
  });  
});
