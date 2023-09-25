const swaggerJSDoc = require('swagger-jsdoc');
const swaggerDefinition = {
  openapi: '3.0.3',
  info: {
    title: 'API Doc',
    version: '1.0.0',
  },
  servers: [{ url: 'https://api.obud.site' }, { url: 'http://localhost:5100' }],
  // host: 'localhost:5100',
  // basePath: '/',
  // components: {
  //   securitySchemes: {
  //     bearerAuth: {
  //       type: 'http',
  //       scheme: 'bearer',
  //       bearerFormat: 'JWT',
  //     },
  //   },
  // },
  definitions: {},
};

const options = {
  swaggerDefinition: swaggerDefinition,
  apis: ['./*/*/*.ts'],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
