'use client'

import Link from 'next/link'

interface FeatureCardProps {
  icon: string
  title: string
  description: string
  bgColor: string
}

function FeatureCard({ icon, title, description, bgColor }: FeatureCardProps) {
  return (
    <div className="text-center">
      <div className={`w-12 h-12 ${bgColor} rounded-full flex items-center justify-center mx-auto mb-4`}>
        <span className="text-xl">{icon}</span>
      </div>
      <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  )
}

export default function HomePage() {
  const features = [
    {
      icon: '📱',
      title: 'QR Code Payments',
      description: 'Generate and scan QR codes for instant payments',
      bgColor: 'bg-purple-100'
    },
    {
      icon: '🎤',
      title: 'Voice Confirmation',
      description: 'Hear payment confirmations using Web Speech API',
      bgColor: 'bg-yellow-100'
    },
    {
      icon: '💾',
      title: 'Transaction History',
      description: 'Track all payments and deposits with Prisma + SQLite',
      bgColor: 'bg-red-100'
    },
    {
      icon: '💰',
      title: 'Balance Management',
      description: 'Deposit funds and manage account balances',
      bgColor: 'bg-indigo-100'
    },
    {
      icon: '📊',
      title: 'Real-time Updates',
      description: 'Live balance and transaction updates',
      bgColor: 'bg-pink-100'
    },
    {
      icon: '🎨',
      title: 'PayPal-style UI',
      description: 'Beautiful, responsive design with TailwindCSS',
      bgColor: 'bg-teal-100'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            GKash
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            A payment app prototype with QR code payments and TTS voice confirmation
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
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                bgColor={feature.bgColor}
              />
            ))}
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