import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'GKash – Welcome',
  description: 'A modern payment app prototype with QR code payments and voice confirmation',
}

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
      title: 'Modern and responsive UI',
      description: 'Beautiful, responsive design with TailwindCSS',
      bgColor: 'bg-teal-100'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="flex items-center justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
              <span className="text-3xl font-bold text-white">GK</span>
            </div>
            <h1 className="text-6xl font-bold text-gray-900">
              GKash
            </h1>
          </div>
          <p className="text-2xl text-gray-600 max-w-3xl mx-auto font-medium">
            A modern payment app prototype with QR code payments and voice confirmation
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-20">
          {/* Merchant Card */}
          <div className="gkash-card p-10">
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-8">
                <span className="text-3xl">🏪</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Merchant Dashboard</h2>
              <p className="text-gray-600 mb-8 text-lg font-medium">
                Generate QR codes for payments, track transactions, and manage your business payments.
              </p>
              <Link
                href="/merchant"
                className="gkash-button inline-block px-10 py-4 text-lg font-semibold rounded-xl"
              >
                Open Merchant Dashboard
              </Link>
            </div>
          </div>

          {/* Payer Card */}
          <div className="gkash-card p-10">
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-8">
                <span className="text-3xl">👤</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Payer Dashboard</h2>
              <p className="text-gray-600 mb-13 text-lg font-medium">
                Upload QR codes to make payments, deposit funds, and hear voice confirmations.
              </p>
              <Link
                href="/payer"
                className="gkash-success-button inline-block px-10 py-4 text-lg font-semibold rounded-xl"
              >
                Open Payer Dashboard
              </Link>
            </div>
          </div>
        </div>

        {/* Features List */}
        <div className="gkash-card p-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-10 text-center">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
        <div className="text-center mt-16 text-gray-500 font-medium">
          <p className="text-lg">Built with Next.js, TypeScript, Prisma, and TailwindCSS</p>
        </div>
      </div>
    </div>
  )
}