'use client'

import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            PayWave Soundbox
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            A PayPal-style payment prototype with QR code payments and voice confirmation
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {/* Merchant Card */}
          <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">🏪</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Merchant Dashboard</h2>
              <p className="text-gray-600 mb-6">
                Generate QR codes for payments, track transactions, and manage your business payments.
              </p>
              <Link
                href="/merchant"
                className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Open Merchant Dashboard
              </Link>
            </div>
          </div>

          {/* Payer Card */}
          <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">👤</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Payer Dashboard</h2>
              <p className="text-gray-600 mb-6">
                Upload QR codes to make payments, deposit funds, and hear voice confirmations.
              </p>
              <Link
                href="/payer"
                className="inline-block bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                Open Payer Dashboard
              </Link>
            </div>
          </div>
        </div>

        {/* Features List */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl">📱</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">QR Code Payments</h3>
              <p className="text-sm text-gray-600">Generate and scan QR codes for instant payments</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl">🎤</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Voice Confirmation</h3>
              <p className="text-sm text-gray-600">Hear payment confirmations using Web Speech API</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl">💾</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Transaction History</h3>
              <p className="text-sm text-gray-600">Track all payments and deposits with Prisma + SQLite</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl">💰</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Balance Management</h3>
              <p className="text-sm text-gray-600">Deposit funds and manage account balances</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl">📊</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Real-time Updates</h3>
              <p className="text-sm text-gray-600">Live balance and transaction updates</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl">🎨</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">PayPal-style UI</h3>
              <p className="text-sm text-gray-600">Beautiful, responsive design with TailwindCSS</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500">
          <p>Built with Next.js, TypeScript, Prisma, and TailwindCSS</p>
        </div>
      </div>
    </div>
  )
}