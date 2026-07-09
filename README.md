# 🏠 RentNest API

**A production-ready Rental House Management System REST API** built with modern backend technologies.
RentNest enables landlords to list and manage rental properties, tenants to submit rental requests and complete payments online, and both parties to interact through a secure, role-based system. The project follows feature-based MVC architecture with clean separation of concerns throughout.

<p align="left">
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white" />
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white" />
  <img src="https://img.shields.io/badge/Stripe-635BFF?style=for-the-badge&logo=stripe&logoColor=white" />
  <img src="https://img.shields.io/badge/Zod-3E67B1?style=for-the-badge&logo=zod&logoColor=white" />
</p>

---

## 🌐 Live API

| Resource        | URL                                      |
| --------------- | ---------------------------------------- |
| 🚀 Server       | `<https://rentnest-backend-ezd1.onrender.com>`                           |
| 🔗 API Base URL | `<https://rentnest-backend-ezd1.onrender.com>api/properties`                       |

---

## 🗄️ Postman Design

🔗 **Postman Database:** [`<Postman_LINK_HERE>`](<https://sohag2879-8553138.postman.co/workspace/a92f7fbc-5501-4be6-8626-bef17a63d48c/collection/54817904-51f11064-5cfa-4345-bf08-3731efdce620?action=share&source=copy-link&creator=54817904>)

## 🗄️ Database Design

🔗 **DrawSQL Diagram:** [`<PUT_DRAWSQL_LINK_HERE>`](<https://drawsql.app/teams/mdsohag-ali/diagrams/rentrest>)

The database is designed around six core models: **User**, **Property**, **Category**, **RentalRequest**, **Payment**, and **Review**. Relations are optimized with foreign key constraints and cascade rules. A `RentalRequest` links a `Tenant` to a `Property`, progressing through statuses (`PENDING → APPROVED → COMPLETED`). `Payment` and `Review` each have a one-to-one relationship with a `RentalRequest`, enforcing business rules at the data layer.

---

## 📖 Project Overview

RentNest is a comprehensive backend system for managing rental housing operations. The platform serves three distinct user roles — **Admin**, **Landlord**, and **Tenant** — each with scoped permissions enforced through JWT-based role authorization.

Landlords can create, update, and delete property listings, then review and approve or reject incoming rental requests from tenants. Once a request is approved, the tenant initiates a secure **Stripe Checkout** payment session. Upon successful payment confirmation, the rental status automatically transitions to `COMPLETED`, unlocking the ability for the tenant to leave a **rating and review** for the property.

Admins have a dedicated dashboard to oversee all users, properties, and rentals — with the ability to ban or unban accounts. The public property listing endpoint supports **search, filtering, sorting, pagination, and category-based filtering** to provide a rich browsing experience without requiring authentication.

The project is built following **production-level REST API architecture** with feature-based MVC, global error handling, Zod request validation, Prisma transactions, and environment-based configuration.

---

## ✨ Key Features

### 🔐 Authentication & Authorization
- ✅ JWT Access & Refresh Token system
- ✅ Role-based authorization (`ADMIN`, `LANDLORD`, `TENANT`)
- ✅ Secure password hashing with bcrypt
- ✅ Register, Login, Current User profile
- ✅ Cookie-based token storage

### 🏘️ Landlord Module
- ✅ Create, Update, Delete property listings
- ✅ View all incoming rental requests
- ✅ Approve or Reject rental requests

### 🏠 Property Module
- ✅ Public property listing (no auth required)
- ✅ Search by title or location
- ✅ Filter by category, price, and availability
- ✅ Sorting and pagination
- ✅ Property detail by ID

### 📋 Rental Module
- ✅ Submit rental request for a property
- ✅ View own rental request history
- ✅ Rental request detail

### 💳 Payment Module
- ✅ Stripe Checkout session creation
- ✅ Secure payment confirmation via session ID
- ✅ Payment history for authenticated tenant
- ✅ Rental status auto-transitions to `COMPLETED` on payment

### ⭐ Review Module
- ✅ Submit a review only after rental completion
- ✅ Rating system (1–5 stars)
- ✅ One review enforced per rental request

### 🛡️ Admin Module
- ✅ View and paginate all users
- ✅ Ban / Unban user accounts
- ✅ View all properties across the platform
- ✅ View all rental requests

### 🔍 Validation & Error Handling
- ✅ Zod schema validation on all inputs
- ✅ Global error handler with Prisma error mapping
- ✅ Consistent JSON error responses
- ✅ `AppError` for domain-level errors

---

## 🛠️ Tech Stack

| Layer            | Technology                     |
| ---------------- | ------------------------------ |
| **Runtime**      | Node.js                        |
| **Framework**    | Express.js v5                  |
| **Language**     | TypeScript                     |
| **ORM**          | Prisma ORM                     |
| **Database**     | PostgreSQL                     |
| **Auth**         | JSON Web Tokens (JWT)          |
| **Payments**     | Stripe Checkout                |
| **Validation**   | Zod                            |
| **Hashing**      | bcrypt / bcryptjs              |
| **Cookies**      | cookie-parser                  |
| **CORS**         | cors                           |
| **Build**        | tsc / tsx                      |

---

## 📡 API Endpoints

### 🔐 Authentication — `/api/auth`

| Method | Endpoint            | Auth     | Description              |
| ------ | ------------------- | -------- | ------------------------ |
| `POST` | `/register`         | Public   | Register a new user      |
| `POST` | `/login`            | Public   | Login and receive tokens |
| `GET`  | `/me`               | Any role | Get current user profile |

### 🏘️ Landlord — `/api/landlord`

| Method   | Endpoint             | Auth       | Description                      |
| -------- | -------------------- | ---------- | -------------------------------- |
| `POST`   | `/properties`        | LANDLORD   | Create a new property listing    |
| `PUT`    | `/properties/:id`    | LANDLORD   | Update a property listing        |
| `DELETE` | `/properties/:id`    | LANDLORD   | Delete a property listing        |
| `GET`    | `/requests`          | LANDLORD   | View all incoming rental requests |
| `PATCH`  | `/requests/:id`      | LANDLORD   | Approve or reject a request      |

### 🏠 Property — `/api/properties`

| Method | Endpoint   | Auth   | Description                                    |
| ------ | ---------- | ------ | ---------------------------------------------- |
| `GET`  | `/`        | Public | List all properties (search, filter, paginate) |
| `GET`  | `/:id`     | Public | Get a single property by ID                    |

### 📂 Category — `/api/categories`

| Method | Endpoint | Auth   | Description            |
| ------ | -------- | ------ | ---------------------- |
| `GET`  | `/`      | Public | List all categories    |

### 📋 Rental — `/api/rentals`

| Method | Endpoint | Auth   | Description                    |
| ------ | -------- | ------ | ------------------------------ |
| `POST` | `/`      | TENANT | Submit a new rental request    |
| `GET`  | `/`      | TENANT | View own rental request history |
| `GET`  | `/:id`   | TENANT | Get a rental request by ID     |

### 💳 Payment — `/api/payments`

| Method | Endpoint    | Auth   | Description                                  |
| ------ | ----------- | ------ | -------------------------------------------- |
| `POST` | `/create`   | TENANT | Create a Stripe Checkout session             |
| `POST` | `/confirm`  | TENANT | Confirm payment and mark rental as completed |
| `GET`  | `/`         | TENANT | Get own payment history                      |
| `GET`  | `/:id`      | TENANT | Get a single payment by ID                   |
| `GET`  | `/success`  | Public | Stripe redirect — payment success page       |
| `GET`  | `/cancel`   | Public | Stripe redirect — payment cancelled page     |

### ⭐ Review — `/api/reviews`

| Method | Endpoint | Auth   | Description                           |
| ------ | -------- | ------ | ------------------------------------- |
| `POST` | `/`      | TENANT | Submit a review for a completed rental |

### 🛡️ Admin — `/api/admin`

| Method  | Endpoint        | Auth  | Description                        |
| ------- | --------------- | ----- | ---------------------------------- |
| `GET`   | `/users`        | ADMIN | List all users (with pagination)   |
| `PATCH` | `/users/:id`    | ADMIN | Ban or unban a user account        |
| `GET`   | `/properties`   | ADMIN | View all properties                |
| `GET`   | `/rentals`      | ADMIN | View all rental requests           |

---

## 📁 Folder Structure

```
rentnest/
├── prisma/
│   ├── schema/
│   │   ├── schema.prisma         # Datasource & generator config
│   │   ├── user.prisma
│   │   ├── category.prisma
│   │   ├── enums.prisma
│   │   ├── payment.prisma
│   │   ├── rentalRequest.prisma
│   │   └── review.prisma
│   └── migrations/
├── src/
│   ├── config/
│   │   └── index.ts              # Environment configuration
│   ├── lib/
│   │   └── prisma.ts             # Prisma client singleton
│   ├── middlewares/
│   │   ├── authenticateUser.ts   # JWT auth + role guard
│   │   ├── validateRequest.ts    # Zod validation middleware
│   │   ├── globalErrorHandler.ts # Centralized error handler
│   │   └── notFound.ts           # 404 handler
│   ├── modules/
│   │   ├── auth/                 # Login, refresh token
│   │   ├── user/                 # Register, profile
│   │   ├── landlord/             # Property & request management
│   │   ├── property/             # Public property listing
│   │   ├── category/             # Category listing
│   │   ├── rental/               # Rental request lifecycle
│   │   ├── payment/              # Stripe payment flow
│   │   ├── review/               # Review submission
│   │   └── admin/                # Admin dashboard
│   ├── utils/
│   │   ├── AppError.ts           # Custom error class
│   │   ├── catchAsync.ts         # Async error wrapper
│   │   ├── sendResponse.ts       # Consistent JSON response helper
│   │   └── jwt.ts                # JWT utilities
│   ├── app.ts                    # Express app setup
│   └── server.ts                 # HTTP server entry point
├── .env
├── .env.example
├── package.json
├── prisma.config.ts
└── tsconfig.json
```

---

## 🔄 Business Flow

```
                         ┌─────────────────────────┐
                         │   User Registration /    │
                         │        Login             │
                         └────────────┬────────────┘
                                      │ JWT Token
                    ┌─────────────────┴──────────────────┐
                    │                                     │
             ┌──────▼──────┐                    ┌────────▼───────┐
             │   LANDLORD   │                    │    TENANT      │
             │ Creates      │                    │ Browses        │
             │ Property     │                    │ Properties     │
             └──────┬───────┘                    └───────┬────────┘
                    │                                    │
                    │                         ┌──────────▼────────┐
                    │                         │  Submits Rental   │
                    │                         │  Request (PENDING)│
                    │                         └──────────┬────────┘
                    │                                    │
             ┌──────▼────────────────────────────────────▼──────┐
             │           Landlord Reviews Request               │
             │         APPROVE  ──────────────  REJECT          │
             └──────────────────────┬───────────────────────────┘
                                    │ APPROVED
                         ┌──────────▼──────────┐
                         │   Tenant Initiates  │
                         │  Stripe Checkout    │
                         └──────────┬──────────┘
                                    │ Payment Confirmed
                         ┌──────────▼──────────┐
                         │  Rental → COMPLETED │
                         │  Payment recorded   │
                         └──────────┬──────────┘
                                    │
                         ┌──────────▼──────────┐
                         │  Tenant Submits      │
                         │  Review + Rating     │
                         └─────────────────────┘
```

---

## 🔒 Security Features

| Feature                    | Implementation                              |
| -------------------------- | ------------------------------------------- |
| 🔑 Authentication          | JWT Access & Refresh tokens via cookies     |
| 🔐 Password Security       | bcrypt hashing with configurable salt rounds |
| 👥 Role-Based Access       | Middleware guards per endpoint              |
| 🛡️ Input Validation        | Zod schemas on every request body/query     |
| ⚠️ Error Handling          | Centralized global handler with Prisma mapping |
| 💾 Atomic Operations       | Prisma `$transaction` for payment + status update |
| 🚫 Account Management      | Admin can ban/unban users, blocking access  |

---

## ⚙️ Environment Variables

Create a `.env` file in the project root based on the example below:

```env
# .env.example

# Database
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"

# JWT
JWT_ACCESS_SECRET="your_access_token_secret"
JWT_REFRESH_SECRET="your_refresh_token_secret"
JWT_ACCESS_EXPIRES_IN="1d"
JWT_REFRESH_EXPIRES_IN="7d"

# Bcrypt
BCRYPT_SALT_ROUNDS=12

# Stripe
STRIPE_SECRET_KEY="sk_test_your_stripe_secret_key"

# Server
PORT=5000
CLIENT_URL="http://localhost:3000"
```

---

## 🚀 Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/your-username/rentnest-api.git
cd rentnest-api
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env
# Fill in your values in .env
```

### 4. Generate Prisma Client

```bash
npx prisma generate
```

### 5. Run database migrations

```bash
npx prisma migrate deploy
```

### 6. Seed the database *(optional)*

```bash
npx prisma db seed
```

### 7. Start the development server

```bash
npm run dev
```

The API will be running at `http://localhost:5000`.

---

## 🧪 API Testing

All endpoints can be tested using **[Postman](https://www.postman.com/)** — no frontend is required.

**Recommended flow:**
1. Register a user via `POST /api/auth/register`
2. Login via `POST /api/auth/login` to obtain tokens
3. Use the `accessToken` as a `Bearer` token in the `Authorization` header (or rely on cookie auto-send)
4. For Stripe payments, use `POST /api/payments/create` to get a Checkout URL, complete the payment in the browser, then confirm with `POST /api/payments/confirm` using the returned `sessionId`

> 💡 Import the collection into Postman and set `{{base_url}}` to `http://localhost:5000/api` as an environment variable for convenience.

---

## 🔮 Future Improvements

| Status | Feature                  | Description                                       |
| ------ | ------------------------ | ------------------------------------------------- |
| 🔲     | Notification System      | Real-time alerts for request approval & payments  |
| 🔲     | Image Upload             | Cloudinary integration for property photos        |
| 🔲     | Chat System              | In-app messaging between landlords and tenants    |
| 🔲     | Analytics Dashboard      | Revenue and occupancy stats for landlords         |
| 🔲     | Advanced Search          | Full-text search with geolocation filtering       |
| 🔲     | Email Verification       | SendGrid/Nodemailer on registration               |
| 🔲     | Password Reset           | Secure reset flow via email token                 |

---

## 🤝 Contributing

Contributions are welcome and appreciated. To contribute:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request with a clear description of your changes

Please follow the existing code style and ensure no TypeScript errors before submitting.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 👤 Author

**Sohag Ali**

<p align="left">
  <a href="https://github.com/Sohag-Ali">
    <img src="https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white" />
  </a>
  <a href="https://www.linkedin.com/in/sohag-ali-bd/">
    <img src="https://img.shields.io/badge/LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white" />
  </a>
  <a href="https://portfolio-sohag-ali.vercel.app/">
    <img src="https://img.shields.io/badge/Portfolio-FF5722?style=for-the-badge&logo=firefox&logoColor=white" />
  </a>
  <a href="mailto:sohag2879@gmail.com">
    <img src="https://img.shields.io/badge/Email-D14836?style=for-the-badge&logo=gmail&logoColor=white" />
  </a>
</p>

---

<p align="center">Made with ❤️ using Node.js, Express, TypeScript & Prisma</p>
