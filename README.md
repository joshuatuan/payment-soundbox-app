# Gkash

An application that simulates a payment flow between merchants and payers using QR codes and AI-powered voice assistance.

## 🎯 Features

- **QR Code Generation**: Merchants can generate QR codes for payment amounts
- **QR Code Scanning**: Payers can upload QR images to make payments
- **AI Voice Assistant**: Ask questions about your balance, transactions, and revenue using voice commands
- **Voice Confirmation**: TTS announcements for successful payments and deposits
- **Transaction History**: Complete transaction tracking for both merchants and payers
- **Balance Management**: Deposit funds and track balances in real-time

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 with TypeScript and TailwindCSS
- **Backend**: Next.js API Routes
- **Database**: Prisma ORM with SQLite
- **QR Codes**: qrcode.react for generation, jsqr for scanning
- **AI**: Google Cloud Vertex AI (Gemini, Speech-to-Text, Text-to-Speech)
- **TTS**: Web Speech API (fallback)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory:
   ```env
   GOOGLE_CLOUD_API_KEY=your_api_key_here
   GOOGLE_CLOUD_PROJECT_ID=your_project_id
   GOOGLE_CLOUD_REGION=us-central1
   ```
   
   **Note**: You need a Google Cloud account with the following APIs enabled:
   - Speech-to-Text API
   - Text-to-Speech API
   - Vertex AI API (for Gemini)

4. Set up the database:
   ```bash
   npx prisma generate
   npx prisma db push
   npx tsx prisma/seed.ts
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📱 Usage

### Merchant Dashboard (`/merchant`)
- Enter an amount to generate a QR code
- Download the QR code as PNG
- View transaction history and total balance
- See incoming payments from payers
- **Ask AI**: "What's my total revenue?", "How many transactions today?", "What's my balance?"

### Payer Dashboard (`/payer`)
- Deposit funds to your account
- Upload QR code images to make payments
- Hear voice confirmations for payments and deposits
- View payment history
- **Ask AI**: "What's my balance?", "How many payments have I made?", "What was my last payment?"

## 🗄️ Database Schema

```prisma
model User {
  id        Int           @id @default(autoincrement())
  name      String
  type      String         // "merchant" or "payer"
  balance   Float          @default(0)
  payerTransactions     Transaction[] @relation("payerTransactions")
  merchantTransactions  Transaction[] @relation("merchantTransactions")
}

model Transaction {
  id           Int      @id @default(autoincrement())
  payerId      Int
  merchantId   Int
  amount       Float
  timestamp    DateTime @default(now())
  payer        User     @relation("payerTransactions", fields: [payerId], references: [id])
  merchant     User     @relation("merchantTransactions", fields: [merchantId], references: [id])
}
```

## 🔌 API Endpoints

### Core APIs
- `GET /api/users` - Fetch all users with transaction data
- `POST /api/deposit` - Add funds to a user's balance
- `GET /api/transactions` - Fetch transaction history (supports filtering by userId and userType)
- `POST /api/transactions` - Process a payment transaction

### Voice AI APIs
- `GET /api/voice/context` - Fetch user-specific context for AI (balance, transactions, revenue)
- `POST /api/voice/transcribe` - Convert speech to text using Vertex AI Speech-to-Text
- `POST /api/voice/chat` - Process queries with Gemini AI and return context-aware responses
- `POST /api/voice/speak` - Convert text to speech using Vertex AI Text-to-Speech

## 🎤 Voice AI Features

### Voice Assistant
Click the floating mic button (bottom-right) to ask questions:

**For Merchants:**
- "How many transactions have I made today?"
- "What's my total revenue?"
- "What's my current balance?"

**For Payers:**
- "What's my balance?"
- "How many payments have I made?"
- "What was my last payment?"

### Voice Confirmations
The application provides TTS confirmations for:
- **Deposit**: "₱[amount] deposited successfully. Your new balance is ₱[newBalance]."
- **Payment**: "Payment successful. You have sent ₱[amount] to [merchant name]."

### Technology Stack
- **Primary**: Google Cloud Vertex AI (Speech-to-Text, Gemini, Text-to-Speech)
- **Fallback**: Browser Web Speech API for unsupported environments

## 🧪 Seed Data

The application comes pre-seeded with:
- **Merchant**: PayWave Café (Balance: ₱0)
- **Payer**: Alex Santos (Balance: ₱500)

## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── users/route.ts
│   │   ├── deposit/route.ts
│   │   ├── transactions/route.ts
│   │   └── voice/
│   │       ├── context/route.ts      # Fetch user context for AI
│   │       ├── transcribe/route.ts   # Speech-to-Text
│   │       ├── chat/route.ts         # Gemini AI responses
│   │       └── speak/route.ts        # Text-to-Speech
│   ├── merchant/page.tsx
│   ├── payer/page.tsx
│   └── page.tsx
├── components/
│   └── VoiceAssistant.tsx            # Floating mic button
├── lib/
│   └── prisma.ts
├── types/
│   └── voice.ts                      # Voice AI type definitions
prisma/
├── schema.prisma
└── seed.ts
```

## 🎨 UI/UX Features

- **Responsive Design**: Works on desktop and mobile devices
- **Smooth Animations**: Hover effects and transitions
- **Loading States**: Visual feedback during API calls
- **Error Handling**: User-friendly error messages
- **Success Notifications**: Confirmation messages for actions

## 🔒 Security Notes

This is a **prototype application** for demonstration purposes. It does not include:
- Real authentication system
- Actual payment processing
- Production-level security measures

## 📝 License

This project is for educational and demonstration purposes.