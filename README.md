# Gkash

An application that simulates a payment flow between merchants and payers using QR codes and Text-to-Speech (TTS) confirmation.

## 🎯 Features

- **QR Code Generation**: Merchants can generate QR codes for payment amounts
- **QR Code Scanning**: Payers can upload QR images to make payments
- **Voice Confirmation**: TTS announcements for successful payments and deposits
- **Transaction History**: Complete transaction tracking for both merchants and payers
- **Balance Management**: Deposit funds and track balances in real-time
- **PayPal-style UI**: Beautiful, responsive design with TailwindCSS

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 with TypeScript and TailwindCSS
- **Backend**: Next.js API Routes
- **Database**: Prisma ORM with SQLite
- **QR Codes**: qrcode.react for generation, jsqr for scanning
- **TTS**: Web Speech API

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

3. Set up the database:
   ```bash
   npx prisma generate
   npx prisma db push
   npx tsx prisma/seed.ts
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📱 Usage

### Merchant Dashboard (`/merchant`)
- Enter an amount to generate a QR code
- Download the QR code as PNG
- View transaction history and total balance
- See incoming payments from payers

### Payer Dashboard (`/payer`)
- Deposit funds to your account
- Upload QR code images to make payments
- Hear voice confirmations for payments and deposits
- View payment history

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

- `GET /api/users` - Fetch all users with transaction data
- `POST /api/deposit` - Add funds to a user's balance
- `GET /api/transactions` - Fetch transaction history (supports filtering by userId and userType)
- `POST /api/transactions` - Process a payment transaction

## 🎤 Text-to-Speech Features

The application uses the Web Speech API to provide voice confirmations:

- **Deposit**: "₱[amount] deposited successfully. Your new balance is ₱[newBalance]."
- **Payment**: "Payment successful. You have sent ₱[amount] to [merchant name]."

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
│   │   └── transactions/route.ts
│   ├── merchant/page.tsx
│   ├── payer/page.tsx
│   └── page.tsx
├── lib/
│   └── prisma.ts
prisma/
├── schema.prisma
└── seed.ts
```

## 🎨 UI/UX Features

- **Responsive Design**: Works on desktop and mobile devices
- **PayPal-style Colors**: Blue and white theme with green accents
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