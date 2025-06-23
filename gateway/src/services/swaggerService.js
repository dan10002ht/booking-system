import swaggerJsdoc from 'swagger-jsdoc';
import YAML from 'yamljs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import config from '../config/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Initialize Swagger documentation
 * @returns {Object} Swagger specification
 */
export const initializeSwagger = () => {
  // Load YAML files
  const authSwagger = YAML.load(join(__dirname, '../swagger/auth.yaml'));
  const userSwagger = YAML.load(join(__dirname, '../swagger/user.yaml'));

  const swaggerOptions = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Booking System API Gateway',
        version: '1.0.0',
        description: 'API Gateway for Booking System Microservices',
      },
      servers: [
        {
          url: `http://localhost:${config.server.port}`,
          description: 'Development server',
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
    },
    apis: ['./src/routes/*.js'],
  };

  const baseSpec = swaggerJsdoc(swaggerOptions);

  // Merge YAML documentation with JSDoc documentation
  return {
    ...baseSpec,
    paths: {
      ...baseSpec.paths,
      ...authSwagger.paths,
      ...userSwagger.paths,
    },
  };
};
