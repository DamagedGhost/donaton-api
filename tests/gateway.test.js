import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app.js';

describe('API Gateway - Autenticación y Seguridad', () => {

  it('Debe responder 404 para una ruta que no existe', async () => {
    // Simulamos una petición GET a una ruta falsa
    const response = await request(app).get('/ruta-inventada-hacker');
    
    // El Gateway debe bloquearla o decir que no existe
    expect(response.status).toBe(404);
  });

  describe('Endpoint: POST /api/auth/login', () => {

    it('Debe rechazar el login si faltan credenciales (Status 400)', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ usuario: 'admin' }); // Falta el password intencionalmente

      expect(response.status).toBeGreaterThanOrEqual(400); // 400 o 401
    });

    it('Debe rechazar credenciales incorrectas', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ usuario: 'admin', password: 'clave-equivocada' });

      // Verificamos que no deje pasar a un usuario falso
      expect(response.status).not.toBe(200); 
      expect(response.body).toHaveProperty('error'); // O 'message', dependiendo de tu backend
    });

    it('Debe generar un Token JWT válido para el usuario correcto', async () => {
      // Basado en las credenciales que usaste en tu NavBar de React
      const response = await request(app)
        .post('/api/auth/login')
        .send({ usuario: 'admin', password: 'admin123' });

      // 1. Debe ser un éxito (200 OK)
      expect(response.status).toBe(200);
      
      // 2. El cuerpo debe incluir el token
      expect(response.body).toHaveProperty('token');
      
      // 3. El token debe ser un string no vacío
      expect(typeof response.body.token).toBe('string');
      expect(response.body.token.length).toBeGreaterThan(20);
    });

  });
});

describe('Middleware: verifyToken.js', () => {

  it('Debe denegar el acceso (401/403) si no se proporciona el token', async () => {
    // Intentamos entrar a un endpoint protegido sin cabeceras
    const response = await request(app)
      .get('/api/logistica'); 

    // Simplemente verificamos que el backend rechace la petición con 401 o 403
    expect([401, 403]).toContain(response.status);
  });

  it('Debe denegar el acceso si el token tiene un formato inválido', async () => {
    const response = await request(app)
      .get('/api/logistica')
      .set('Authorization', 'Bearer token-corrupto-y-falso');

    expect([401, 403]).toContain(response.status);
  });

  it('Debe permitir el acceso si el token es completamente válido', async () => {
    // 1. Generamos un token real temporal para la prueba
    // Usamos un texto cualquiera como secreto, ya que solo queremos ver si el middleware procesa la estructura
    const jwt = require('jsonwebtoken');
    const tokenValido = jwt.sign({ id: 1, usuario: 'admin' }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });

    const response = await request(app)
      .get('/api/logistica')
      .set('Authorization', `Bearer ${tokenValido}`);

    // Al pasar el middleware con éxito, el Gateway intentará redirigir la petición al microservicio.
    // No importa si el microservicio responde 200, 404 o 500; lo crucial es que YA NO responderá 401 ni 403,
    // lo que demuestra que el middleware aprobó el token y lo dejó pasar.
    expect(response.status).not.toBe(401);
    expect(response.status).not.toBe(403);
  });
});