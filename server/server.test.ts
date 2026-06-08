import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from './index';
import { pool } from './prisma';

describe('POMS Backend REST API Integration Tests', () => {
  let authToken: string;
  const testCaseId = `PAT-TEST-${Math.floor(1000 + Math.random() * 9000)}`;

  // Clean up database pool connection after all tests complete
  afterAll(async () => {
    await pool.end();
  });

  // 1. Authentication System
  describe('Authentication APIs', () => {
    it('should authenticate a seeded user and return a JWT token', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin.poms@ipindia.gov.in',
          password: 'password123'
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toHaveProperty('email', 'admin.poms@ipindia.gov.in');
      expect(res.body.user).toHaveProperty('role', 'Admin');
      
      authToken = res.body.token;
    });

    it('should fail authentication with incorrect password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin.poms@ipindia.gov.in',
          password: 'wrong_password'
        });

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error');
    });
  });

  // 2. Patent Case Management APIs
  describe('Patent Case APIs', () => {
    it('should list patent cases with seeded items', async () => {
      const res = await request(app).get('/api/cases');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it('should successfully register a new patent case', async () => {
      const res = await request(app)
        .post('/api/cases')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          id: testCaseId,
          title: 'Quantum Entangled Cryptography Transmission Protocol',
          description: 'A method for securely transmitting encrypted keys using quantum entanglement and real-time state check logic gates.',
          applicantName: 'Sarah Miller',
          applicantOrganization: 'Neural-Q Systems International Ltd.',
          category: 'Quantum Processing',
          priority: 'High',
          assignedOfficer: 'Dr. Helena Vance'
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id', testCaseId);
      expect(res.body).toHaveProperty('status', 'Submitted');
    });

    it('should update the patent case fields and status', async () => {
      const res = await request(app)
        .put(`/api/cases/${testCaseId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: 'Under Examination',
          priority: 'Medium'
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('status', 'Under Examination');
      expect(res.body).toHaveProperty('priority', 'Medium');
    });
  });

  // 3. Opposition Management APIs
  describe('Pre-Grant Opposition APIs', () => {
    it('should file an opposition dispute against our newly created case', async () => {
      const res = await request(app)
        .post('/api/oppositions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          caseId: testCaseId,
          opponentName: 'Stellar Computing Corp.',
          reason: 'Lack of Novelty',
          detailedStatement: 'This transmission protocol relies on standard quantum distribution techniques widely described in 2021 literature. There is no innovative step in the gate layouts.',
          evidenceFiles: JSON.stringify(['Stellar_Quantum_Anticipation_2021.pdf'])
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('caseId', testCaseId);
      expect(res.body).toHaveProperty('opponentName', 'Stellar Computing Corp.');
      expect(res.body).toHaveProperty('status', 'Pending');
    });

    it('should verify that the patent case status updated to Opposition Filed', async () => {
      const res = await request(app).get(`/api/cases/${testCaseId}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('status', 'Opposition Filed');
    });
  });

  // 4. Notifications APIs
  describe('System Notifications APIs', () => {
    it('should fetch system notifications, including our newly generated alerts', async () => {
      const res = await request(app).get('/api/notifications');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });
  });
});
