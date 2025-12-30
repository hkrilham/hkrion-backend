import type { OpenAPIV3_1 } from 'openapi-types'

export const openApiSpec: OpenAPIV3_1.Document = {
  openapi: '3.1.0',
  info: {
    title: 'HKRiON API',
    description: `
# HKRiON POS & Inventory Management API

Welcome to the HKRiON API documentation. This API provides complete functionality for:

- 🛒 **Point of Sale (POS)** - Sales, payments, and receipts
- 📦 **Inventory Management** - Products, stock, and warehouses
- 👥 **Customer Management** - Contacts, groups, and credit
- 💰 **Purchase Management** - Suppliers and purchase orders
- 📊 **Reports & Analytics** - Sales reports, stock value, profit/loss
- 🏢 **Multi-Business Support** - Complete multi-tenant architecture

## Authentication

All API endpoints (except login) require authentication using JWT tokens.

### Getting Started

1. **Login** to get your JWT token
2. Include the token in the \`Authorization\` header as \`Bearer <token>\`
3. Or use the HTTP-only cookie set automatically on login

## Rate Limits

- **Standard**: 1000 requests/minute
- **Reports**: 100 requests/minute
- **Bulk Operations**: 50 requests/minute
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
    { name: 'Users', description: 'User management' },
    { name: 'Businesses', description: 'Business account management' },
    { name: 'Products', description: 'Product catalog management' },
    { name: 'Categories', description: 'Product categories' },
    { name: 'Brands', description: 'Product brands' },
    { name: 'Stock', description: 'Stock & inventory management' },
    { name: 'Sales', description: 'Sales & POS operations' },
    { name: 'Purchases', description: 'Purchase order management' },
    { name: 'Contacts', description: 'Customer & supplier management' },
    { name: 'Expenses', description: 'Expense tracking' },
    { name: 'Payments', description: 'Payment methods & transactions' },
    { name: 'Reports', description: 'Analytics & reports' },
    { name: 'Settings', description: 'Business settings & configuration' },
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
      // Common schemas
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
      PaginatedResponse: {
        type: 'object',
        properties: {
          docs: { type: 'array', items: {} },
          totalDocs: { type: 'integer' },
          limit: { type: 'integer' },
          totalPages: { type: 'integer' },
          page: { type: 'integer' },
          pagingCounter: { type: 'integer' },
          hasPrevPage: { type: 'boolean' },
          hasNextPage: { type: 'boolean' },
          prevPage: { type: ['integer', 'null'] },
          nextPage: { type: ['integer', 'null'] },
        },
      },

      // User schemas
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          email: { type: 'string', format: 'email' },
          roles: {
            type: 'array',
            items: {
              type: 'string',
              enum: ['super_admin', 'business_owner', 'manager', 'cashier', 'accountant', 'viewer'],
            },
          },
          business: { $ref: '#/components/schemas/BusinessRef' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
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
          user: { $ref: '#/components/schemas/User' },
          token: { type: 'string' },
          exp: { type: 'integer', description: 'Token expiration timestamp' },
        },
      },

      // Business schemas
      Business: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          business_name: { type: 'string', example: 'My Shop' },
          business_contact: { type: 'string' },
          country: { type: 'string' },
          city: { type: 'string' },
          state: { type: 'string' },
          zip_code: { type: 'string' },
          currency: { type: 'string', example: 'USD' },
          timezone: { type: 'string', example: 'Asia/Kolkata' },
          logo_url: { type: 'string', format: 'uri' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      BusinessRef: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          business_name: { type: 'string' },
        },
      },

      // Product schemas
      Product: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string', example: 'iPhone 15 Pro' },
          sku: { type: 'string', example: 'IP15P-256-BLK' },
          barcode_type: { type: 'string', enum: ['CODE128', 'CODE39', 'EAN13', 'UPC'] },
          status: { type: 'string', enum: ['active', 'inactive'] },
          description: { type: 'string' },
          image_url: { type: 'string', format: 'uri' },
          is_serial_imei: { type: 'boolean' },
          manage_stock: { type: 'boolean' },
          alert_quantity: { type: 'integer' },
          expiry_date: { type: 'boolean' },
          business: { $ref: '#/components/schemas/BusinessRef' },
          category: { $ref: '#/components/schemas/CategoryRef' },
          brand: { $ref: '#/components/schemas/BrandRef' },
          units: { $ref: '#/components/schemas/UnitRef' },
          warranties: { $ref: '#/components/schemas/WarrantyRef' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      ProductCreate: {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string', example: 'iPhone 15 Pro' },
          sku: { type: 'string' },
          barcode_type: { type: 'string' },
          status: { type: 'string', enum: ['active', 'inactive'] },
          description: { type: 'string' },
          is_serial_imei: { type: 'boolean' },
          manage_stock: { type: 'boolean' },
          alert_quantity: { type: 'integer' },
          category: { type: 'string', format: 'uuid' },
          brand: { type: 'string', format: 'uuid' },
          units: { type: 'string', format: 'uuid' },
        },
      },

      // Category, Brand, Unit refs
      CategoryRef: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          category_name: { type: 'string' },
        },
      },
      BrandRef: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          brand_name: { type: 'string' },
        },
      },
      UnitRef: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
        },
      },
      WarrantyRef: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
        },
      },

      // Sale schemas
      Sale: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          sale_number: { type: 'string', example: 'INV-2024-00001' },
          transaction_date: { type: 'string', format: 'date-time' },
          subtotal: { type: 'number', format: 'decimal' },
          discount: { type: 'number', format: 'decimal' },
          tax: { type: 'number', format: 'decimal' },
          shipping: { type: 'number', format: 'decimal' },
          total: { type: 'number', format: 'decimal' },
          total_paid: { type: 'number', format: 'decimal' },
          due_amount: { type: 'number', format: 'decimal' },
          status: { type: 'string', enum: ['completed', 'pending', 'draft', 'cancelled'] },
          payment_method: { type: 'string' },
          is_credit_sale: { type: 'boolean' },
          business: { $ref: '#/components/schemas/BusinessRef' },
          customer: { $ref: '#/components/schemas/ContactRef' },
          business_location: { $ref: '#/components/schemas/LocationRef' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      SaleCreate: {
        type: 'object',
        required: ['transaction_date', 'subtotal', 'total', 'items'],
        properties: {
          transaction_date: { type: 'string', format: 'date-time' },
          customer: { type: 'string', format: 'uuid' },
          business_location: { type: 'string', format: 'uuid' },
          subtotal: { type: 'number' },
          discount: { type: 'number' },
          tax: { type: 'number' },
          total: { type: 'number' },
          payment_method: { type: 'string' },
          items: {
            type: 'array',
            items: { $ref: '#/components/schemas/SaleItemCreate' },
          },
        },
      },
      SaleItemCreate: {
        type: 'object',
        required: ['product', 'quantity', 'unit_price', 'total'],
        properties: {
          product: { type: 'string', format: 'uuid' },
          quantity: { type: 'number' },
          unit_price: { type: 'number' },
          discount: { type: 'number' },
          tax: { type: 'number' },
          total: { type: 'number' },
        },
      },

      // Contact schemas
      Contact: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          contact_id: { type: 'string', example: 'CUST-001' },
          contact_type: { type: 'string', enum: ['customer', 'supplier', 'both'] },
          customer_type: { type: 'string', enum: ['individual', 'business'] },
          first_name: { type: 'string' },
          last_name: { type: 'string' },
          business_name: { type: 'string' },
          email: { type: 'string', format: 'email' },
          mobile: { type: 'string' },
          credit_limit: { type: 'number' },
          opening_balance: { type: 'number' },
          total_due_amount: { type: 'number' },
          is_active: { type: 'boolean' },
          business: { $ref: '#/components/schemas/BusinessRef' },
        },
      },
      ContactRef: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          first_name: { type: 'string' },
          last_name: { type: 'string' },
          mobile: { type: 'string' },
        },
      },

      // Location ref
      LocationRef: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
        },
      },

      // Stock schemas
      ProductStockPrice: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          product: { $ref: '#/components/schemas/Product' },
          unit_price: { type: 'number' },
          default_selling_price: { type: 'number' },
          stock: { type: 'number' },
          sold: { type: 'integer' },
          status: { type: 'string', enum: ['active', 'inactive'] },
          business_location: { $ref: '#/components/schemas/LocationRef' },
          manufacturing_date: { type: 'string', format: 'date' },
          expiry_date: { type: 'string', format: 'date' },
        },
      },
      StockAdjustment: {
        type: 'object',
        required: ['location_id', 'adjustment_type', 'quantity'],
        properties: {
          location_id: { type: 'string', format: 'uuid' },
          adjustment_type: { type: 'string', enum: ['add', 'subtract', 'set'] },
          quantity: { type: 'number' },
          reason: { type: 'string' },
          reference_no: { type: 'string' },
        },
      },
    },
    parameters: {
      idParam: {
        name: 'id',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
        description: 'Record ID',
      },
      pageParam: {
        name: 'page',
        in: 'query',
        schema: { type: 'integer', default: 1 },
        description: 'Page number',
      },
      limitParam: {
        name: 'limit',
        in: 'query',
        schema: { type: 'integer', default: 10, maximum: 100 },
        description: 'Items per page',
      },
      sortParam: {
        name: 'sort',
        in: 'query',
        schema: { type: 'string' },
        description: 'Sort field (prefix with - for descending)',
        example: '-createdAt',
      },
      depthParam: {
        name: 'depth',
        in: 'query',
        schema: { type: 'integer', default: 1, maximum: 5 },
        description: 'Relationship depth to populate',
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
      NotFoundError: {
        description: 'Resource not found',
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
                      message: { type: 'string', example: 'Not Found' },
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
                    user: { $ref: '#/components/schemas/User' },
                  },
                },
              },
            },
          },
          '401': { $ref: '#/components/responses/UnauthorizedError' },
        },
      },
    },

    // ==================== USERS ====================
    '/api/users': {
      get: {
        tags: ['Users'],
        summary: 'List users',
        description: 'Get paginated list of users',
        parameters: [
          { $ref: '#/components/parameters/pageParam' },
          { $ref: '#/components/parameters/limitParam' },
          { $ref: '#/components/parameters/sortParam' },
        ],
        responses: {
          '200': {
            description: 'List of users',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/PaginatedResponse' },
              },
            },
          },
          '401': { $ref: '#/components/responses/UnauthorizedError' },
        },
      },
      post: {
        tags: ['Users'],
        summary: 'Create user',
        description: 'Create a new user account',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', format: 'password' },
                  roles: { type: 'array', items: { type: 'string' } },
                  business: { type: 'string', format: 'uuid' },
                },
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'User created',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/User' },
              },
            },
          },
          '400': { $ref: '#/components/responses/ValidationError' },
        },
      },
    },

    // ==================== PRODUCTS ====================
    '/api/products': {
      get: {
        tags: ['Products'],
        summary: 'List products',
        description: 'Get paginated list of products for the current business',
        parameters: [
          { $ref: '#/components/parameters/pageParam' },
          { $ref: '#/components/parameters/limitParam' },
          { $ref: '#/components/parameters/sortParam' },
          { $ref: '#/components/parameters/depthParam' },
          {
            name: 'where[status][equals]',
            in: 'query',
            schema: { type: 'string', enum: ['active', 'inactive'] },
            description: 'Filter by status',
          },
          {
            name: 'where[category][equals]',
            in: 'query',
            schema: { type: 'string', format: 'uuid' },
            description: 'Filter by category ID',
          },
          {
            name: 'where[brand][equals]',
            in: 'query',
            schema: { type: 'string', format: 'uuid' },
            description: 'Filter by brand ID',
          },
        ],
        responses: {
          '200': {
            description: 'List of products',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/PaginatedResponse' },
              },
            },
          },
          '401': { $ref: '#/components/responses/UnauthorizedError' },
        },
      },
      post: {
        tags: ['Products'],
        summary: 'Create product',
        description: 'Create a new product',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ProductCreate' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Product created',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Product' },
              },
            },
          },
          '400': { $ref: '#/components/responses/ValidationError' },
          '401': { $ref: '#/components/responses/UnauthorizedError' },
        },
      },
    },
    '/api/products/{id}': {
      get: {
        tags: ['Products'],
        summary: 'Get product',
        description: 'Get a single product by ID',
        parameters: [
          { $ref: '#/components/parameters/idParam' },
          { $ref: '#/components/parameters/depthParam' },
        ],
        responses: {
          '200': {
            description: 'Product details',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Product' },
              },
            },
          },
          '404': { $ref: '#/components/responses/NotFoundError' },
        },
      },
      patch: {
        tags: ['Products'],
        summary: 'Update product',
        description: 'Update an existing product',
        parameters: [{ $ref: '#/components/parameters/idParam' }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ProductCreate' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Product updated',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Product' },
              },
            },
          },
          '404': { $ref: '#/components/responses/NotFoundError' },
        },
      },
      delete: {
        tags: ['Products'],
        summary: 'Delete product',
        description: 'Delete a product',
        parameters: [{ $ref: '#/components/parameters/idParam' }],
        responses: {
          '200': {
            description: 'Product deleted',
          },
          '404': { $ref: '#/components/responses/NotFoundError' },
        },
      },
    },

    // ==================== SALES ====================
    '/api/sales': {
      get: {
        tags: ['Sales'],
        summary: 'List sales',
        description: 'Get paginated list of sales',
        parameters: [
          { $ref: '#/components/parameters/pageParam' },
          { $ref: '#/components/parameters/limitParam' },
          { $ref: '#/components/parameters/sortParam' },
          {
            name: 'where[status][equals]',
            in: 'query',
            schema: { type: 'string', enum: ['completed', 'pending', 'draft', 'cancelled'] },
          },
          {
            name: 'where[transaction_date][greater_than_equal]',
            in: 'query',
            schema: { type: 'string', format: 'date' },
            description: 'Filter from date',
          },
          {
            name: 'where[transaction_date][less_than_equal]',
            in: 'query',
            schema: { type: 'string', format: 'date' },
            description: 'Filter to date',
          },
        ],
        responses: {
          '200': {
            description: 'List of sales',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/PaginatedResponse' },
              },
            },
          },
        },
      },
      post: {
        tags: ['Sales'],
        summary: 'Create sale',
        description: 'Create a new sale/invoice',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/SaleCreate' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Sale created',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Sale' },
              },
            },
          },
          '400': { $ref: '#/components/responses/ValidationError' },
        },
      },
    },
    '/api/sales/{id}': {
      get: {
        tags: ['Sales'],
        summary: 'Get sale',
        description: 'Get a single sale with items',
        parameters: [
          { $ref: '#/components/parameters/idParam' },
          { $ref: '#/components/parameters/depthParam' },
        ],
        responses: {
          '200': {
            description: 'Sale details',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Sale' },
              },
            },
          },
          '404': { $ref: '#/components/responses/NotFoundError' },
        },
      },
    },

    // ==================== CONTACTS ====================
    '/api/contacts': {
      get: {
        tags: ['Contacts'],
        summary: 'List contacts',
        description: 'Get paginated list of customers/suppliers',
        parameters: [
          { $ref: '#/components/parameters/pageParam' },
          { $ref: '#/components/parameters/limitParam' },
          {
            name: 'where[contact_type][equals]',
            in: 'query',
            schema: { type: 'string', enum: ['customer', 'supplier', 'both'] },
          },
        ],
        responses: {
          '200': {
            description: 'List of contacts',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/PaginatedResponse' },
              },
            },
          },
        },
      },
      post: {
        tags: ['Contacts'],
        summary: 'Create contact',
        description: 'Create a new customer or supplier',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Contact' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Contact created',
          },
        },
      },
    },

    // ==================== STOCK ====================
    '/api/product-stock-price': {
      get: {
        tags: ['Stock'],
        summary: 'List stock entries',
        description: 'Get stock and pricing for products',
        parameters: [
          { $ref: '#/components/parameters/pageParam' },
          { $ref: '#/components/parameters/limitParam' },
          {
            name: 'where[product][equals]',
            in: 'query',
            schema: { type: 'string', format: 'uuid' },
            description: 'Filter by product ID',
          },
        ],
        responses: {
          '200': {
            description: 'Stock entries',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/PaginatedResponse' },
              },
            },
          },
        },
      },
    },

    // ==================== CATEGORIES ====================
    '/api/categories': {
      get: {
        tags: ['Categories'],
        summary: 'List categories',
        description: 'Get all product categories',
        parameters: [
          { $ref: '#/components/parameters/pageParam' },
          { $ref: '#/components/parameters/limitParam' },
        ],
        responses: {
          '200': {
            description: 'List of categories',
          },
        },
      },
      post: {
        tags: ['Categories'],
        summary: 'Create category',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['category_name'],
                properties: {
                  category_name: { type: 'string' },
                  category_code: { type: 'string' },
                  description: { type: 'string' },
                  parent_category_id: { type: 'string', format: 'uuid' },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Category created' },
        },
      },
    },

    // ==================== BRANDS ====================
    '/api/brands': {
      get: {
        tags: ['Brands'],
        summary: 'List brands',
        description: 'Get all product brands',
        responses: {
          '200': { description: 'List of brands' },
        },
      },
      post: {
        tags: ['Brands'],
        summary: 'Create brand',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['brand_name'],
                properties: {
                  brand_name: { type: 'string' },
                  description: { type: 'string' },
                  logo_url: { type: 'string', format: 'uri' },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Brand created' },
        },
      },
    },

    // ==================== PURCHASES ====================
    '/api/purchases': {
      get: {
        tags: ['Purchases'],
        summary: 'List purchases',
        description: 'Get paginated list of purchase orders',
        parameters: [
          { $ref: '#/components/parameters/pageParam' },
          { $ref: '#/components/parameters/limitParam' },
        ],
        responses: {
          '200': { description: 'List of purchases' },
        },
      },
      post: {
        tags: ['Purchases'],
        summary: 'Create purchase',
        description: 'Create a new purchase order',
        responses: {
          '201': { description: 'Purchase created' },
        },
      },
    },

    // ==================== EXPENSES ====================
    '/api/expenses': {
      get: {
        tags: ['Expenses'],
        summary: 'List expenses',
        description: 'Get paginated list of expenses',
        responses: {
          '200': { description: 'List of expenses' },
        },
      },
      post: {
        tags: ['Expenses'],
        summary: 'Create expense',
        description: 'Record a new expense',
        responses: {
          '201': { description: 'Expense created' },
        },
      },
    },

    // ==================== BUSINESS LOCATIONS ====================
    '/api/business-locations': {
      get: {
        tags: ['Settings'],
        summary: 'List locations',
        description: 'Get all business locations/branches',
        responses: {
          '200': { description: 'List of locations' },
        },
      },
      post: {
        tags: ['Settings'],
        summary: 'Create location',
        description: 'Add a new business location',
        responses: {
          '201': { description: 'Location created' },
        },
      },
    },
  },
}
