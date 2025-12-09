# Wallet Service - HNG Stage 8 Task

A robust backend wallet service built with Node.js, Express, TypeScript, and MongoDB. It supports both JWT authentication (via Google) and API Key access for service-to-service communication.

## Features

- **Authentication**:
  - Google Sign-In (JWT generation).
  - API Key Management (Create, Roll, Revoke).
  - Strict Permission Scopes (`read`, `deposit`, `transfer`).
  - Limits: Max 5 active keys per user.

- **Wallet Operations**:
  - **Account Numbers**: 10-digit unique NUBAN-style account numbers.
  - **Deposits**: Integrated with Paystack (Standard Flow + Webhook).
  - **Transfers**: ACID-compliant atomic transactions between wallets.
  - **History**: Full transaction logs.

- **Security**:
  - **Strict Mode**: Requires MongoDB Replica Set for ACID transactions.
  - **Webhook Security**: Cryptographic signature verification using raw request body.
  - **Helmet & CORS**: Standard security headers.

## Tech Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Auth**: Passport.js (Google Strategy), JSON Web Tokens (JWT)
- **Payments**: Paystack API

## Setup & Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/Abdulbaasiterinkitola/HNG13-stage8-backend.git
    cd HNG13-stage8-backend
    ```

2.  **Install Dependencies**:
    ```bash
    npm install
    ```

3.  **Environment Variables**:
    Copy `.env.example` to `.env` and fill in your keys:
    ```env
    MONGO_URI=mongodb://localhost:27017/wallet_db
    JWT_SECRET=your_jwt_secret
    GOOGLE_CLIENT_ID=your_google_id
    GOOGLE_CLIENT_SECRET=your_google_secret
    PAYSTACK_SECRET_KEY=your_paystack_key
    ```
    *Note: For local development, use `ngrok` to tunnel webhooks.*

4.  **Run the Server**:
    ```bash
    # Development
    npm run dev
    
    # Build & Start
    npm run build
    npm start
    ```

## API Documentation

### Auth
- `GET /auth/google`: Login with Google.

### Wallet
- `GET /wallet/balance`: Check balance & account number.
- `POST /wallet/deposit`: Initialize Paystack deposit.
- `POST /wallet/transfer`: Transfer funds to another account number.
- `GET /wallet/transactions`: View history.

### API Keys
- `POST /keys/create`: Generate a new key with permissions.
- `POST /keys/rollover`: Replace an expired key.

## Webhooks
The service exposes `POST /wallet/paystack/webhook` to receive payment notifications.
**Requirement**: Ensure your Paystack dashboard is configured with your public URL (or ngrok URL).

## License
MIT
