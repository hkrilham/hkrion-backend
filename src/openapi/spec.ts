import type { OpenAPIV3_1 } from 'openapi-types'

export const openApiSpec: OpenAPIV3_1.Document = {
  openapi: '3.1.0',
  info: {
    title: 'HKRiON API',
    description: `
# HKRiON POS & Inventory Management API

Welcome to the HKRiON API documentation.

## Authentication

All API endpoints (except registration and login) require authentication using JWT tokens.

### Getting Started

1. **Register** your business at \`/api/businesses/register\`
2. **Login** to get your JWT token at \`/api/users/login\`
3. Include the token in the \`Authorization\` header as \`Bearer <token>\`

## Custom Endpoints

This API uses custom endpoints. Default Payload CMS endpoints are disabled.
    `,
    version: '1.0.0',
    contact: {
      name: 'HKRiON Support',
      email: 'support@hkrion.com',
      url: 'https://hkrion.com',
    },
    license: {
      name: 'Proprietary',
      url: 'https://hkrion.com/terms',
    },
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Development Server',
    },
    {
      url: 'https://api.hkrion.com',
      description: 'Production Server',
    },
  ],
  tags: [
    { name: 'Authentication', description: 'User authentication & authorization' },
    { name: 'Businesses', description: 'Business registration & management' },
    { name: 'Brands', description: 'Product brand management' },
    { name: 'Categories', description: 'Product category management' },
    { name: 'Units', description: 'Unit of measurement management' },
    { name: 'Unit Conversions', description: 'Unit conversion system' },
    { name: 'Warranties', description: 'Product warranty management' },
    { name: 'Price Groups', description: 'Selling price group management' },
    { name: 'Products', description: 'Product inventory management' },
    { name: 'Locations', description: 'Business location management' },
    { name: 'Stock', description: 'Stock & Price management' },
    { name: 'Contacts', description: 'Customer & Supplier management' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT token obtained from /api/users/login',
      },
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'payload-token',
        description: 'HTTP-only cookie set on login',
      },
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          errors: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                message: { type: 'string' },
                field: { type: 'string' },
              },
            },
          },
        },
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'user@example.com' },
          password: { type: 'string', format: 'password', example: 'your-password' },
        },
      },
      LoginResponse: {
        type: 'object',
        properties: {
          user: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              email: { type: 'string', format: 'email' },
              roles: { type: 'array', items: { type: 'string' } },
            },
          },
          token: { type: 'string' },
          exp: { type: 'integer', description: 'Token expiration timestamp' },
        },
      },
      BusinessRegisterRequest: {
        type: 'object',
        required: ['businessName', 'email', 'password', 'country', 'city'],
        properties: {
          businessName: { type: 'string', example: 'My Awesome Business' },
          email: { type: 'string', format: 'email', example: 'admin@business.com' },
          password: { type: 'string', format: 'password', example: 'strongpassword' },
          firstName: { type: 'string', example: 'Admin' },
          country: { type: 'string', example: 'India' },
          city: { type: 'string', example: 'Chennai' },
          state: { type: 'string', example: 'Tamil Nadu' },
          zipCode: { type: 'string', example: '600001' },
          landmark: { type: 'string' },
          currency: { type: 'string', example: 'INR' },
          timezone: { type: 'string', example: 'Asia/Kolkata' },
        },
      },
      BusinessRegisterResponse: {
        type: 'object',
        properties: {
          message: { type: 'string' },
          businessId: { type: 'string', format: 'uuid' },
          userId: { type: 'string', format: 'uuid' },
        },
      },
    },
    responses: {
      UnauthorizedError: {
        description: 'Authentication required',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                errors: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      message: {
                        type: 'string',
                        example: 'You are not allowed to perform this action.',
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      ValidationError: {
        description: 'Validation failed',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
          },
        },
      },
    },
  },
  security: [{ bearerAuth: [] }, { cookieAuth: [] }],
  paths: {
    // ==================== AUTHENTICATION ====================
    '/api/users/login': {
      post: {
        tags: ['Authentication'],
        summary: 'User login',
        description: 'Authenticate user and get JWT token',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginRequest' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Login successful',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/LoginResponse' },
              },
            },
          },
          '401': {
            description: 'Invalid credentials',
          },
        },
      },
    },
    '/api/users/logout': {
      post: {
        tags: ['Authentication'],
        summary: 'User logout',
        description: 'Invalidate current session',
        responses: {
          '200': {
            description: 'Logout successful',
          },
        },
      },
    },
    '/api/users/me': {
      get: {
        tags: ['Authentication'],
        summary: 'Get current user',
        description: 'Get the currently authenticated user',
        responses: {
          '200': {
            description: 'Current user data',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    user: { $ref: '#/components/schemas/LoginResponse/properties/user' },
                  },
                },
              },
            },
          },
          '401': { $ref: '#/components/responses/UnauthorizedError' },
        },
      },
    },

    // ==================== BUSINESSES ====================
    '/api/businesses/register': {
      post: {
        tags: ['Businesses'],
        summary: 'Register new business',
        description:
          'Register a new business, create admin user and profile. This is a public endpoint.',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/BusinessRegisterRequest' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Business registered successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/BusinessRegisterResponse' },
              },
            },
          },
          '400': { $ref: '#/components/responses/ValidationError' },
          '500': {
            description: 'Internal Server Error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
    },
    '/api/businesses/me': {
      get: {
        tags: ['Businesses'],
        summary: 'Get my business',
        description: "Get the currently authenticated user's business details",
        responses: {
          '200': {
            description: 'Business details',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: {
                      type: 'object',
                      properties: {
                        id: { type: 'string', format: 'uuid' },
                        business_name: { type: 'string' },
                        start_date: { type: 'string', format: 'date' },
                        logo_url: { type: 'string' },
                        business_contact: { type: 'string' },
                        country: { type: 'string' },
                        city: { type: 'string' },
                        state: { type: 'string' },
                        zip_code: { type: 'string' },
                        landmark: { type: 'string' },
                        currency: { type: 'string' },
                        timezone: { type: 'string' },
                        website: { type: 'string' },
                        alternate_contact: { type: 'string' },
                        tax1_name: { type: 'string' },
                        tax1_number: { type: 'string' },
                        tax2_name: { type: 'string' },
                        tax2_number: { type: 'string' },
                        financial_year_start: { type: 'string' },
                        stock_accounting_method: { type: 'string' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' },
                      },
                    },
                  },
                },
              },
            },
          },
          '401': { $ref: '#/components/responses/UnauthorizedError' },
          '404': {
            description: 'Business not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
      patch: {
        tags: ['Businesses'],
        summary: 'Update my business',
        description: "Update the currently authenticated user's business details",
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  business_name: { type: 'string' },
                  logo_url: { type: 'string' },
                  business_contact: { type: 'string' },
                  website: { type: 'string' },
                  alternate_contact: { type: 'string' },
                  tax1_name: { type: 'string' },
                  tax1_number: { type: 'string' },
                  tax2_name: { type: 'string' },
                  tax2_number: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Business updated successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    message: { type: 'string' },
                    data: { type: 'object' },
                  },
                },
              },
            },
          },
          '401': { $ref: '#/components/responses/UnauthorizedError' },
          '500': {
            description: 'Internal Server Error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
    },

    // ==================== BRANDS ====================
    '/api/brands/list': {
      get: {
        tags: ['Brands'],
        summary: 'List all brands',
        description: "Get all brands for the current user's business",
        responses: {
          '200': {
            description: 'List of brands',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id: { type: 'string', format: 'uuid' },
                          brand_name: { type: 'string' },
                          description: { type: 'string' },
                          logo_url: { type: 'string' },
                        },
                      },
                    },
                    totalDocs: { type: 'integer' },
                  },
                },
              },
            },
          },
          '401': { $ref: '#/components/responses/UnauthorizedError' },
        },
      },
    },
    '/api/brands/create': {
      post: {
        tags: ['Brands'],
        summary: 'Create a new brand',
        description: "Create a new brand for the current user's business",
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['brand_name'],
                properties: {
                  brand_name: { type: 'string', example: 'Nike' },
                  description: { type: 'string', example: 'Sports brand' },
                  logo_url: { type: 'string', example: 'https://example.com/logo.png' },
                },
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Brand created successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    message: { type: 'string' },
                    data: { type: 'object' },
                  },
                },
              },
            },
          },
          '400': { $ref: '#/components/responses/ValidationError' },
          '401': { $ref: '#/components/responses/UnauthorizedError' },
        },
      },
    },
    '/api/brands/{id}': {
      get: {
        tags: ['Brands'],
        summary: 'Get a brand',
        description: 'Get a single brand by ID',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
            description: 'Brand ID',
          },
        ],
        responses: {
          '200': {
            description: 'Brand details',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { type: 'object' },
                  },
                },
              },
            },
          },
          '401': { $ref: '#/components/responses/UnauthorizedError' },
          '404': { description: 'Brand not found' },
        },
      },
      patch: {
        tags: ['Brands'],
        summary: 'Update a brand',
        description: 'Update an existing brand',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
            description: 'Brand ID',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  brand_name: { type: 'string' },
                  description: { type: 'string' },
                  logo_url: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Brand updated successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    message: { type: 'string' },
                    data: { type: 'object' },
                  },
                },
              },
            },
          },
          '401': { $ref: '#/components/responses/UnauthorizedError' },
          '404': { description: 'Brand not found' },
        },
      },
      delete: {
        tags: ['Brands'],
        summary: 'Delete a brand',
        description: 'Delete an existing brand',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
            description: 'Brand ID',
          },
        ],
        responses: {
          '200': {
            description: 'Brand deleted successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    message: { type: 'string' },
                  },
                },
              },
            },
          },
          '401': { $ref: '#/components/responses/UnauthorizedError' },
          '404': { description: 'Brand not found' },
        },
      },
    },

    // ==================== CATEGORIES ====================
    '/api/categories/list': {
      get: {
        tags: ['Categories'],
        summary: 'List all categories',
        description: "Get all categories for the current user's business",
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10, maximum: 100 } },
          {
            name: 'search',
            in: 'query',
            schema: { type: 'string' },
            description: 'Search by name',
          },
          { name: 'sort', in: 'query', schema: { type: 'string', default: 'category_name' } },
          {
            name: 'parent',
            in: 'query',
            schema: { type: 'string' },
            description: 'Filter by parent ID or null for root',
          },
        ],
        responses: {
          '200': {
            description: 'List of categories',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { type: 'array', items: { type: 'object' } },
                    totalDocs: { type: 'integer' },
                    totalPages: { type: 'integer' },
                    page: { type: 'integer' },
                    hasNextPage: { type: 'boolean' },
                    hasPrevPage: { type: 'boolean' },
                  },
                },
              },
            },
          },
          '401': { $ref: '#/components/responses/UnauthorizedError' },
        },
      },
    },
    '/api/categories/tree': {
      get: {
        tags: ['Categories'],
        summary: 'Get category tree',
        description: 'Get hierarchical category tree for the current business',
        responses: {
          '200': {
            description: 'Category tree',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { type: 'array', items: { type: 'object' } },
                    totalCategories: { type: 'integer' },
                  },
                },
              },
            },
          },
          '401': { $ref: '#/components/responses/UnauthorizedError' },
        },
      },
    },
    '/api/categories/create': {
      post: {
        tags: ['Categories'],
        summary: 'Create a new category',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['category_name'],
                properties: {
                  category_name: { type: 'string', example: 'Electronics' },
                  category_code: { type: 'string', example: 'ELEC' },
                  description: { type: 'string' },
                  hsn_code: { type: 'string', example: '8471' },
                  parent_category: { type: 'string', format: 'uuid' },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Category created successfully' },
          '400': { $ref: '#/components/responses/ValidationError' },
          '401': { $ref: '#/components/responses/UnauthorizedError' },
          '409': { description: 'Category with this name already exists' },
        },
      },
    },
    '/api/categories/{id}': {
      get: {
        tags: ['Categories'],
        summary: 'Get a category',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Category details' },
          '401': { $ref: '#/components/responses/UnauthorizedError' },
          '404': { description: 'Category not found' },
        },
      },
      patch: {
        tags: ['Categories'],
        summary: 'Update a category',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  category_name: { type: 'string' },
                  category_code: { type: 'string' },
                  description: { type: 'string' },
                  hsn_code: { type: 'string' },
                  parent_category: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Category updated successfully' },
          '401': { $ref: '#/components/responses/UnauthorizedError' },
          '404': { description: 'Category not found' },
          '409': { description: 'Category with this name already exists' },
        },
      },
      delete: {
        tags: ['Categories'],
        summary: 'Delete a category',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Category deleted successfully' },
          '401': { $ref: '#/components/responses/UnauthorizedError' },
          '404': { description: 'Category not found' },
          '409': { description: 'Cannot delete - has children or linked products' },
        },
      },
    },

    // ==================== UNITS ====================
    '/api/units/list': {
      get: {
        tags: ['Units'],
        summary: 'List all units',
        description: "Get all units for the current user's business",
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10, maximum: 100 } },
          {
            name: 'search',
            in: 'query',
            schema: { type: 'string' },
            description: 'Search by name or short name',
          },
          { name: 'sort', in: 'query', schema: { type: 'string', default: 'name' } },
        ],
        responses: {
          '200': {
            description: 'List of units',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { type: 'array', items: { type: 'object' } },
                    totalDocs: { type: 'integer' },
                    totalPages: { type: 'integer' },
                  },
                },
              },
            },
          },
          '401': { $ref: '#/components/responses/UnauthorizedError' },
        },
      },
    },
    '/api/units/create': {
      post: {
        tags: ['Units'],
        summary: 'Create a new unit',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'short_name'],
                properties: {
                  name: { type: 'string', example: 'Kilogram' },
                  short_name: { type: 'string', example: 'kg' },
                  allow_decimal: { type: 'boolean', default: false },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Unit created successfully' },
          '400': { $ref: '#/components/responses/ValidationError' },
          '401': { $ref: '#/components/responses/UnauthorizedError' },
          '409': { description: 'Unit with this name or short name already exists' },
        },
      },
    },
    '/api/units/{id}': {
      get: {
        tags: ['Units'],
        summary: 'Get a unit',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Unit details' },
          '401': { $ref: '#/components/responses/UnauthorizedError' },
          '404': { description: 'Unit not found' },
        },
      },
      patch: {
        tags: ['Units'],
        summary: 'Update a unit',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  short_name: { type: 'string' },
                  allow_decimal: { type: 'boolean' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Unit updated successfully' },
          '401': { $ref: '#/components/responses/UnauthorizedError' },
          '404': { description: 'Unit not found' },
          '409': { description: 'Unit with this name or short name already exists' },
        },
      },
      delete: {
        tags: ['Units'],
        summary: 'Delete a unit',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Unit deleted successfully' },
          '401': { $ref: '#/components/responses/UnauthorizedError' },
          '404': { description: 'Unit not found' },
          '409': { description: 'Cannot delete - linked to products' },
        },
      },
    },

    // ==================== UNIT CONVERSIONS ====================
    '/api/units/groups': {
      get: {
        tags: ['Unit Conversions'],
        summary: 'Get all unit groups',
        description: 'Get available unit groups (MASS, LENGTH, VOLUME, etc.)',
        responses: {
          '200': {
            description: 'List of unit groups',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          value: { type: 'string', example: 'MASS' },
                          label: { type: 'string', example: 'Mass (Weight)' },
                          examples: { type: 'string', example: 'kg, g, mg' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          '401': { $ref: '#/components/responses/UnauthorizedError' },
        },
      },
    },
    '/api/units/by-group/{group}': {
      get: {
        tags: ['Unit Conversions'],
        summary: 'Get units by group',
        parameters: [
          {
            name: 'group',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
              enum: ['MASS', 'LENGTH', 'VOLUME', 'AREA', 'COUNT', 'TIME', 'OTHER'],
            },
          },
        ],
        responses: {
          '200': { description: 'Units in the specified group' },
          '401': { $ref: '#/components/responses/UnauthorizedError' },
          '400': { description: 'Invalid group' },
        },
      },
    },
    '/api/unit_conversions/list': {
      get: {
        tags: ['Unit Conversions'],
        summary: 'List all unit conversions',
        responses: {
          '200': {
            description: 'List of conversions',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { type: 'array', items: { type: 'object' } },
                  },
                },
              },
            },
          },
          '401': { $ref: '#/components/responses/UnauthorizedError' },
        },
      },
    },
    '/api/unit_conversions/create': {
      post: {
        tags: ['Unit Conversions'],
        summary: 'Create a unit conversion',
        description: 'Creates a conversion between two units. Reverse conversion is auto-created.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['from_unit', 'to_unit', 'factor'],
                properties: {
                  from_unit: { type: 'string', description: 'Unit ID', example: '1' },
                  to_unit: { type: 'string', description: 'Unit ID', example: '2' },
                  factor: { type: 'number', description: '1 from_unit = X to_unit', example: 1000 },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Conversion created successfully' },
          '400': { $ref: '#/components/responses/ValidationError' },
          '401': { $ref: '#/components/responses/UnauthorizedError' },
          '409': { description: 'Conversion already exists' },
        },
      },
    },
    '/api/unit_conversions/convert': {
      post: {
        tags: ['Unit Conversions'],
        summary: 'Convert a value between units',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['value', 'from_unit', 'to_unit'],
                properties: {
                  value: { type: 'number', example: 5 },
                  from_unit: {
                    type: 'string',
                    description: 'Unit ID or short_name',
                    example: 'kg',
                  },
                  to_unit: { type: 'string', description: 'Unit ID or short_name', example: 'g' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Conversion result',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: {
                      type: 'object',
                      properties: {
                        original_value: { type: 'number', example: 5 },
                        original_unit: { type: 'string', example: 'kg' },
                        converted_value: { type: 'number', example: 5000 },
                        converted_unit: { type: 'string', example: 'g' },
                        factor: { type: 'number', example: 1000 },
                      },
                    },
                  },
                },
              },
            },
          },
          '400': { description: 'No conversion defined' },
          '401': { $ref: '#/components/responses/UnauthorizedError' },
        },
      },
    },
    '/api/unit_conversions/{id}': {
      delete: {
        tags: ['Unit Conversions'],
        summary: 'Delete a conversion',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Conversion deleted successfully' },
          '401': { $ref: '#/components/responses/UnauthorizedError' },
          '404': { description: 'Conversion not found' },
        },
      },
    },

    // ==================== WARRANTIES ====================
    '/api/warranties/list': {
      get: {
        tags: ['Warranties'],
        summary: 'List all warranties',
        description: "Get all warranties for the current user's business",
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10, maximum: 100 } },
          {
            name: 'search',
            in: 'query',
            schema: { type: 'string' },
            description: 'Search by name',
          },
          { name: 'sort', in: 'query', schema: { type: 'string', default: 'name' } },
          {
            name: 'duration_type',
            in: 'query',
            schema: { type: 'string', enum: ['days', 'months', 'years'] },
          },
        ],
        responses: {
          '200': {
            description: 'List of warranties',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { type: 'array', items: { type: 'object' } },
                    totalDocs: { type: 'integer' },
                    totalPages: { type: 'integer' },
                  },
                },
              },
            },
          },
          '401': { $ref: '#/components/responses/UnauthorizedError' },
        },
      },
    },
    '/api/warranties/create': {
      post: {
        tags: ['Warranties'],
        summary: 'Create a new warranty',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'duration'],
                properties: {
                  name: { type: 'string', example: '1 Year Standard Warranty' },
                  description: { type: 'string', example: 'Covers manufacturing defects' },
                  duration: { type: 'integer', example: 12 },
                  duration_type: {
                    type: 'string',
                    enum: ['days', 'months', 'years'],
                    default: 'months',
                  },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Warranty created successfully' },
          '400': { $ref: '#/components/responses/ValidationError' },
          '401': { $ref: '#/components/responses/UnauthorizedError' },
          '409': { description: 'Warranty with this name already exists' },
        },
      },
    },
    '/api/warranties/{id}': {
      get: {
        tags: ['Warranties'],
        summary: 'Get a warranty',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Warranty details' },
          '401': { $ref: '#/components/responses/UnauthorizedError' },
          '404': { description: 'Warranty not found' },
        },
      },
      patch: {
        tags: ['Warranties'],
        summary: 'Update a warranty',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  description: { type: 'string' },
                  duration: { type: 'integer' },
                  duration_type: { type: 'string', enum: ['days', 'months', 'years'] },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Warranty updated successfully' },
          '401': { $ref: '#/components/responses/UnauthorizedError' },
          '404': { description: 'Warranty not found' },
          '409': { description: 'Warranty with this name already exists' },
        },
      },
      delete: {
        tags: ['Warranties'],
        summary: 'Delete a warranty',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Warranty deleted successfully' },
          '401': { $ref: '#/components/responses/UnauthorizedError' },
          '404': { description: 'Warranty not found' },
          '409': { description: 'Cannot delete - linked to products' },
        },
      },
    },

    // ==================== SELLING PRICE GROUPS ====================
    '/api/selling-price-groups/list': {
      get: {
        tags: ['Price Groups'],
        summary: 'List all price groups',
        description: "Get all selling price groups for the current user's business",
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10, maximum: 100 } },
          {
            name: 'search',
            in: 'query',
            schema: { type: 'string' },
            description: 'Search by group name',
          },
          { name: 'sort', in: 'query', schema: { type: 'string', default: 'group_name' } },
        ],
        responses: {
          '200': {
            description: 'List of price groups',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { type: 'array', items: { type: 'object' } },
                    totalDocs: { type: 'integer' },
                    totalPages: { type: 'integer' },
                  },
                },
              },
            },
          },
          '401': { $ref: '#/components/responses/UnauthorizedError' },
        },
      },
    },
    '/api/selling-price-groups/create': {
      post: {
        tags: ['Price Groups'],
        summary: 'Create a new price group',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['group_name'],
                properties: {
                  group_name: { type: 'string', example: 'Wholesale' },
                  description: { type: 'string', example: 'Bulk purchase prices' },
                  color: { type: 'string', example: '#4CAF50' },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Price group created successfully' },
          '400': { $ref: '#/components/responses/ValidationError' },
          '401': { $ref: '#/components/responses/UnauthorizedError' },
          '409': { description: 'Price group with this name already exists' },
        },
      },
    },
    '/api/selling-price-groups/{id}': {
      get: {
        tags: ['Price Groups'],
        summary: 'Get a price group',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Price group details' },
          '401': { $ref: '#/components/responses/UnauthorizedError' },
          '404': { description: 'Price group not found' },
        },
      },
      patch: {
        tags: ['Price Groups'],
        summary: 'Update a price group',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  group_name: { type: 'string' },
                  description: { type: 'string' },
                  color: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Price group updated successfully' },
          '401': { $ref: '#/components/responses/UnauthorizedError' },
          '404': { description: 'Price group not found' },
          '409': { description: 'Price group with this name already exists' },
        },
      },
      delete: {
        tags: ['Price Groups'],
        summary: 'Delete a price group',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Price group deleted successfully' },
          '401': { $ref: '#/components/responses/UnauthorizedError' },
          '404': { description: 'Price group not found' },
          '409': { description: 'Cannot delete - linked to product prices' },
        },
      },
    },

    // ==================== PRODUCTS ====================
    '/api/products/list': {
      get: {
        tags: ['Products'],
        summary: 'List all products',
        description: "Get all products for the current user's business",
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10, maximum: 100 } },
          {
            name: 'search',
            in: 'query',
            schema: { type: 'string' },
            description: 'Search by name, SKU, description',
          },
          { name: 'sort', in: 'query', schema: { type: 'string', default: 'name' } },
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['active', 'inactive'] } },
          {
            name: 'category',
            in: 'query',
            schema: { type: 'string' },
            description: 'Filter by category ID',
          },
          {
            name: 'brand',
            in: 'query',
            schema: { type: 'string' },
            description: 'Filter by brand ID',
          },
          {
            name: 'unit',
            in: 'query',
            schema: { type: 'string' },
            description: 'Filter by unit ID',
          },
        ],
        responses: {
          '200': {
            description: 'List of products',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { type: 'array', items: { type: 'object' } },
                    totalDocs: { type: 'integer' },
                    totalPages: { type: 'integer' },
                  },
                },
              },
            },
          },
          '401': { $ref: '#/components/responses/UnauthorizedError' },
        },
      },
    },
    '/api/products/create': {
      post: {
        tags: ['Products'],
        summary: 'Create a new product',
        description: 'SKU is auto-generated if not provided',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name'],
                properties: {
                  name: { type: 'string', example: 'iPhone 15 Pro' },
                  sku: {
                    type: 'string',
                    example: 'IPH15PRO-256',
                    description: 'Auto-generated if empty',
                  },
                  description: { type: 'string' },
                  status: { type: 'string', enum: ['active', 'inactive'], default: 'active' },
                  category: { type: 'string', description: 'Category ID' },
                  brand: { type: 'string', description: 'Brand ID' },
                  units: { type: 'string', description: 'Unit ID' },
                  warranties: { type: 'string', description: 'Warranty ID' },
                  manage_stock: { type: 'boolean', default: true },
                  alert_quantity: { type: 'integer', default: 0 },
                  is_serial_imei: { type: 'boolean', default: false },
                  expiry_date: { type: 'boolean', default: false },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Product created successfully' },
          '400': { $ref: '#/components/responses/ValidationError' },
          '401': { $ref: '#/components/responses/UnauthorizedError' },
          '409': { description: 'Product with this name or SKU already exists' },
        },
      },
    },
    '/api/products/{id}': {
      get: {
        tags: ['Products'],
        summary: 'Get a product',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Product details with related data' },
          '401': { $ref: '#/components/responses/UnauthorizedError' },
          '404': { description: 'Product not found' },
        },
      },
      patch: {
        tags: ['Products'],
        summary: 'Update a product',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  sku: { type: 'string' },
                  description: { type: 'string' },
                  status: { type: 'string', enum: ['active', 'inactive'] },
                  category: { type: 'string' },
                  brand: { type: 'string' },
                  units: { type: 'string' },
                  warranties: { type: 'string' },
                  manage_stock: { type: 'boolean' },
                  alert_quantity: { type: 'integer' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Product updated successfully' },
          '401': { $ref: '#/components/responses/UnauthorizedError' },
          '404': { description: 'Product not found' },
          '409': { description: 'Product with this name or SKU already exists' },
        },
      },
      delete: {
        tags: ['Products'],
        summary: 'Delete a product',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Product deleted successfully' },
          '401': { $ref: '#/components/responses/UnauthorizedError' },
          '404': { description: 'Product not found' },
          '409': { description: 'Cannot delete - has sales or purchase history' },
        },
      },
    },

    // ==================== BUSINESS LOCATIONS ====================
    '/api/business-locations/list': {
      get: {
        tags: ['Locations'],
        summary: 'List all locations',
        description: 'Get all business locations',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10, maximum: 100 } },
          {
            name: 'search',
            in: 'query',
            schema: { type: 'string' },
            description: 'Search by name, location_id, city',
          },
          { name: 'is_active', in: 'query', schema: { type: 'string', enum: ['true', 'false'] } },
          { name: 'sort', in: 'query', schema: { type: 'string', default: 'name' } },
        ],
        responses: {
          '200': { description: 'List of locations' },
          '401': { $ref: '#/components/responses/UnauthorizedError' },
        },
      },
    },
    '/api/business-locations/create': {
      post: {
        tags: ['Locations'],
        summary: 'Create a new location',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'city', 'state', 'zip_code', 'country'],
                properties: {
                  name: { type: 'string', example: 'Branch 1' },
                  location_id: { type: 'string', description: 'Auto-generated if empty' },
                  city: { type: 'string', example: 'Chennai' },
                  state: { type: 'string', example: 'Tamil Nadu' },
                  zip_code: { type: 'string', example: '600001' },
                  country: { type: 'string', example: 'India' },
                  mobile: { type: 'string' },
                  email: { type: 'string' },
                  is_active: { type: 'boolean', default: true },
                  is_default: { type: 'boolean', default: false },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Location created successfully' },
          '400': { $ref: '#/components/responses/ValidationError' },
          '401': { $ref: '#/components/responses/UnauthorizedError' },
          '409': { description: 'Location name already exists' },
        },
      },
    },
    '/api/business-locations/{id}': {
      get: {
        tags: ['Locations'],
        summary: 'Get a location',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Location details' },
          '401': { $ref: '#/components/responses/UnauthorizedError' },
          '404': { description: 'Location not found' },
        },
      },
      patch: {
        tags: ['Locations'],
        summary: 'Update a location',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  city: { type: 'string' },
                  state: { type: 'string' },
                  zip_code: { type: 'string' },
                  country: { type: 'string' },
                  is_active: { type: 'boolean' },
                  is_default: { type: 'boolean' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Location updated successfully' },
          '401': { $ref: '#/components/responses/UnauthorizedError' },
          '404': { description: 'Location not found' },
        },
      },
      delete: {
        tags: ['Locations'],
        summary: 'Delete a location',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Location deleted successfully' },
          '401': { $ref: '#/components/responses/UnauthorizedError' },
          '404': { description: 'Location not found' },
          '409': { description: 'Cannot delete default or only location' },
        },
      },
    },
    '/api/business-locations/{id}/set-default': {
      post: {
        tags: ['Locations'],
        summary: 'Set as default location',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Default location updated' },
          '401': { $ref: '#/components/responses/UnauthorizedError' },
          '404': { description: 'Location not found' },
        },
      },
    },

    // ==================== STOCK & PRICE MANAGEMENT ====================
    '/api/product-stock-price/list': {
      get: {
        tags: ['Stock'],
        summary: 'List stock entries',
        description: 'Get stock entries with filters',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10, maximum: 100 } },
          { name: 'location_id', in: 'query', schema: { type: 'string' } },
          { name: 'product_id', in: 'query', schema: { type: 'string' } },
          {
            name: 'low_stock',
            in: 'query',
            schema: { type: 'boolean' },
            description: 'Filter for low stock (<= 5)',
          },
        ],
        responses: {
          '200': { description: 'List of stock entries' },
          '401': { $ref: '#/components/responses/UnauthorizedError' },
        },
      },
    },
    '/api/product-stock-price/opening': {
      post: {
        tags: ['Stock'],
        summary: 'Add Opening Stock',
        description: 'Create a new stock batch (opening stock or purchase)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                required: ['product', 'business_location', 'stock'],
                properties: {
                  product: { type: 'string', description: 'Product ID' },
                  business_location: { type: 'string', description: 'Location ID' },
                  supplier: { type: 'string', description: 'Supplier (Contact ID)' },
                  stock: { type: 'number', example: 100 },
                  unit_price: { type: 'number', description: 'Cost Price', example: 500 },
                  default_selling_price: {
                    type: 'number',
                    description: 'Selling Price',
                    example: 700,
                  },
                  lot_number: { type: 'string', description: 'Optional: Custom Batch/Lot Number' },
                  serials: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'List of IMEI/Serial numbers (Must match stock quantity)',
                    example: ['IMEI123456789012345', 'IMEI987654321098765'],
                  },
                  manufacturing_date: { type: 'string', format: 'date' },
                  expiry_date: { type: 'string', format: 'date' },
                  group_prices: {
                    type: 'object',
                    description: 'Price Group Values',
                    example: { price_group_id_1: 680, price_group_id_2: 650 },
                  },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Stock allocated successfully' },
          '400': { $ref: '#/components/responses/ValidationError' },
          '401': { $ref: '#/components/responses/UnauthorizedError' },
        },
      },
    },
    '/api/product-stock-price/{id}/price': {
      patch: {
        tags: ['Stock'],
        summary: 'Update Stock Price & Details',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  unit_price: { type: 'number', description: 'Cost Price' },
                  default_selling_price: { type: 'number', description: 'Selling Price' },
                  group_prices: { type: 'object', description: 'Updated Group Prices' },
                  stock: { type: 'number', description: 'Adjust Stock Quantity' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Stock updated successfully' },
          '401': { $ref: '#/components/responses/UnauthorizedError' },
          '404': { description: 'Stock entry not found' },
        },
      },
    },
    '/api/product-stock-price/{id}': {
      delete: {
        tags: ['Stock'],
        summary: 'Delete Stock Entry',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Stock deleted successfully' },
          '401': { $ref: '#/components/responses/UnauthorizedError' },
          '404': { description: 'Stock not found' },
          '409': { description: 'Cannot delete stock that has been sold' },
        },
      },
    },

    // ==================== CONTACTS MANAGEMENT ====================
    '/api/contacts/list': {
      get: {
        tags: ['Contacts'],
        summary: 'List contacts',
        description: 'Get customers and suppliers with filters',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10, maximum: 100 } },
          {
            name: 'type',
            in: 'query',
            schema: { type: 'string', enum: ['customer', 'supplier', 'both'] },
          },
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['active', 'inactive'] } },
          {
            name: 'search',
            in: 'query',
            schema: { type: 'string' },
            description: 'Search by name, mobile, id',
          },
        ],
        responses: {
          '200': { description: 'List of contacts' },
          '401': { $ref: '#/components/responses/UnauthorizedError' },
        },
      },
    },
    '/api/contacts/create': {
      post: {
        tags: ['Contacts'],
        summary: 'Create Contact',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['first_name', 'contact_type'],
                properties: {
                  contact_type: {
                    type: 'string',
                    enum: ['customer', 'supplier'],
                    default: 'customer',
                  },
                  first_name: { type: 'string' },
                  last_name: { type: 'string' },
                  mobile: { type: 'string' },
                  email: { type: 'string', format: 'email' },
                  city: { type: 'string' },
                  state: { type: 'string' },
                  address_line_1: { type: 'string' },
                  credit_limit: { type: 'number' },
                  opening_balance: { type: 'number' },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Contact created successfully' },
          '400': { $ref: '#/components/responses/ValidationError' },
          '409': { description: 'Mobile number already exists' },
        },
      },
    },
    '/api/contacts/{id}': {
      get: {
        tags: ['Contacts'],
        summary: 'Get Contact Details',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Contact details' },
          '404': { description: 'Contact not found' },
        },
      },
      patch: {
        tags: ['Contacts'],
        summary: 'Update Contact',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  first_name: { type: 'string' },
                  last_name: { type: 'string' },
                  mobile: { type: 'string' },
                  email: { type: 'string' },
                  is_active: { type: 'boolean' },
                  credit_limit: { type: 'number' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Contact updated successfully' },
          '404': { description: 'Contact not found' },
        },
      },
      delete: {
        tags: ['Contacts'],
        summary: 'Delete Contact',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Contact deleted successfully' },
          '404': { description: 'Contact not found' },
        },
      },
    },
  },
}
