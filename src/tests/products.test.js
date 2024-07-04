const chai = require('chai');
const supertest = require('supertest');

const expect = chai.expect;
const requester = supertest('http://localhost:8080');

describe('Testing Products API', () => {
  it('Actualizar Producto', async () => {
    const productId = "665931022475fa29caf68c06";
  
    const updatedProduct = {
      name: 'Producto Actualizado 4',
      description: 'Descripción actualizada del producto',
      price: 300,
      stock: 50
    };
  
    const { statusCode, text } = await requester.put(`/api/products/${productId}`).send(updatedProduct);
  
    expect(statusCode).to.equal(200);
    expect(text).to.equal("Producto actualizado correctamente");
  });

  it('Obtener Productos', async () => {
    const { statusCode, body } = await requester.get('/api/products');

    expect(statusCode).to.equal(200);
    expect(body).to.be.an('object');
  });

  it('Obtener Producto por ID', async () => {
    const productId = '665931022475fa29caf68c06';
    const { statusCode, body } = await requester.get(`/api/products/${productId}`);

    expect(statusCode).to.equal(200);
    expect(body).to.be.an('object').and.to.have.property('_id', productId);
  });

  it('Obtener Producto con ID incorrecta', async () => {
    const productId = '665931022475fa29caf68c07';
    const { statusCode, body } = await requester.get(`/api/products/${productId}`);

    expect(statusCode).to.equal(404);
    expect(body).is.ok.and.to.have.property('error');
  });
});
