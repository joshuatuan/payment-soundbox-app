import Link from 'next/link'
import type { Metadata } from 'next'
import { QrCode, Mic, Database, Wallet, TrendingUp, Smartphone, Store, User } from 'lucide-react'

export const metadata: Metadata = {
  title: 'GKash – Welcome',
  description: 'A modern payment app prototype with QR code payments and voice confirmation',
}

interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
  bgColor: string
}

function FeatureCard({ icon, title, description, bgColor }: FeatureCardProps) {
  return (
    <div className="text-center p-4">
      <div className={`w-14 h-14 ${bgColor} rounded-2xl flex items-center justify-center mx-auto mb-3`}>
        {icon}
      </div>
      <h3 className="font-semibold text-gray-900 mb-2 text-sm md:text-base">{title}</h3>
      <p className="text-xs md:text-sm text-gray-600 leading-relaxed">{description}</p>
    </div>
  )
}

export default function HomePage() {
  const features = [
    {
      icon: <QrCode className="w-7 h-7 text-purple-600" />,
      title: 'QR Code Payments',
      description: 'Generate and scan QR codes for instant payments',
      bgColor: 'bg-purple-100'
    },
    {
      icon: <Mic className="w-7 h-7 text-yellow-600" />,
      title: 'Voice Confirmation',
      description: 'Hear payment confirmations using Web Speech API',
      bgColor: 'bg-yellow-100'
    },
    {
      icon: <Database className="w-7 h-7 text-red-600" />,
      title: 'Transaction History',
      description: 'Track all payments and deposits with Prisma + SQLite',
      bgColor: 'bg-red-100'
    },
    {
      icon: <Wallet className="w-7 h-7 text-indigo-600" />,
      title: 'Balance Management',
      description: 'Deposit funds and manage account balances',
      bgColor: 'bg-indigo-100'
    },
    {
      icon: <TrendingUp className="w-7 h-7 text-pink-600" />,
      title: 'Real-time Updates',
      description: 'Live balance and transaction updates',
      bgColor: 'bg-pink-100'
    },
    {
      icon: <Smartphone className="w-7 h-7 text-teal-600" />,
      title: 'Mobile Optimized',
      description: 'Beautiful, responsive design with TailwindCSS',
      bgColor: 'bg-teal-100'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-20">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12 md:mb-20">
          <div className="flex items-center justify-center mb-4 sm:mb-6">
            <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl sm:rounded-2xl flex items-center justify-center mr-2 sm:mr-4 shadow-lg">
              <span className="text-2xl sm:text-2xl md:text-3xl font-bold text-white">GK</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900">
              GKash
            </h1>
          </div>
          <p className="text-base sm:text-lg md:text-2xl text-gray-600 max-w-3xl mx-auto font-medium px-4">
            A modern payment app prototype with QR code payments and voice confirmation
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-10 mb-8 sm:mb-12 md:mb-20">
          {/* Merchant Card */}
          <div className="gkash-card p-6 sm:p-8 md:p-10">
            <div className="text-center">
              <div className="w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 md:mb-8">
                <Store className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-blue-600" />
              </div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-3 sm:mb-4 md:mb-6">Merchant Dashboard</h2>
              <p className="text-sm sm:text-base md:text-lg text-gray-600 mb-6 sm:mb-7 md:mb-8 font-medium">
                Generate QR codes for payments, track transactions, and manage your business payments.
              </p>
              <Link
                href="/merchant"
                className="gkash-button inline-block px-6 py-3 sm:px-8 sm:py-3.5 md:px-10 md:py-4 text-base sm:text-lg font-semibold rounded-xl w-full sm:w-auto"
              >
                Open Merchant Dashboard
              </Link>
            </div>
          </div>

          {/* Payer Card */}
          <div className="gkash-card p-6 sm:p-8 md:p-10">
            <div className="text-center">
              <div className="w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 md:mb-8">
                <User className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-green-600" />
              </div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-3 sm:mb-4 md:mb-6">Payer Dashboard</h2>
              <p className="text-sm sm:text-base md:text-lg text-gray-600 mb-6 sm:mb-7 md:mb-8 font-medium">
                Upload QR codes to make payments, deposit funds, and hear voice confirmations.
              </p>
              <Link
                href="/payer"
                className="gkash-success-button inline-block px-6 py-3 sm:px-8 sm:py-3.5 md:px-10 md:py-4 text-base sm:text-lg font-semibold rounded-xl w-full sm:w-auto"
              >
                Open Payer Dashboard
              </Link>
            </div>
          </div>
        </div>

        {/* Features List */}
        <div className="gkash-card p-6 sm:p-8 md:p-10">
          <h2 className="text-2xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-6 sm:mb-8 md:mb-10 text-center">Key Features</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
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
        <div className="text-center mt-8 sm:mt-12 md:mt-16 text-gray-500 font-medium">
          <p className="text-xs sm:text-sm md:text-lg px-4">Built with Next.js, TypeScript, Prisma, and TailwindCSS</p>
        </div>
      </div>
    </div>
  )
}