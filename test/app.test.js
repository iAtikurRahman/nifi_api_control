const request = require('supertest');
const app = require('../app');
const axios = require('axios');

// Mock the getCsrfToken and axios to avoid real HTTP calls
jest.mock('axios');

beforeAll(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
    console.log.mockRestore();
    console.error.mockRestore();
});

beforeEach(() => {
    axios.post.mockResolvedValue({ data: 'mocked-token' }); // Mock token response
    axios.get.mockResolvedValue({
        data: {
            processorStatus: {
                runStatus: 'RUNNING',
            },
        },
    });
    axios.put.mockResolvedValue({ data: {} }); // Mock put response
});

describe('NiFi Processor API tests', () => {
    it('should return processor status for /status', async () => {
        const response = await request(app).get('/status');
        expect(response.statusCode).toBe(200);
        expect(response.text).toContain('RUNNING');
    });

    it('should return processor status for /statusv2', async () => {
      const response = await request(app).get('/statusv2');
      expect(response.statusCode).toBe(200);
      // Optionally check response body
  });  

    it('should start the processor on /start', async () => {
        const response = await request(app).get('/start');
        expect(response.statusCode).toBe(200);
    });

    it('should stop the processor on /stop', async () => {
        const response = await request(app).get('/stop');
        expect(response.statusCode).toBe(200);
    });

    it('should return 500 error for failed /status', async () => {
        axios.get.mockRejectedValue(new Error('Failed to fetch status'));
        const response = await request(app).get('/status');
        expect(response.statusCode).toBe(500);
    });
});
