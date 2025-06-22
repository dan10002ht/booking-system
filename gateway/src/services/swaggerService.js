import swaggerJsdoc from 'swagger-jsdoc';
import config from '../config/index.js';

/**
 * Initialize Swagger documentation
 * @returns {Object} Swagger specification
 */
export const initializeSwagger = () => {
  const swaggerOptions = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Booking System API Gateway',
        version: '1.0.0',
        description: 'API Gateway for Booking System Microservices'
      },
      servers: [
        {
          url: `http://localhost:${config.server.port}`,
          description: 'Development server'
        }
      ]
    },
    apis: ['./src/routes/*.js']
  };

  return swaggerJsdoc(swaggerOptions);
}; 