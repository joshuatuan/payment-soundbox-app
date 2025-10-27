'use client'

import { useState, useEffect } from 'react'
import { QRCodeCanvas } from 'qrcode.react'
import QRCodeLib from 'qrcode'
import VoiceAssistant from '@/components/VoiceAssistant'
import { Smartphone, TrendingUp, Download, DollarSign, ArrowLeft, PhilippinePeso } from 'lucide-react'
import Link from 'next/link'

interface User {
  id: number
  name: string
  type: string
  balance: number
}

interface Transaction {
  id: number
  amount: number
  timestamp: string
  payer: User
  merchant: User
}

export default function MerchantPage() {
  const [merchant, setMerchant] = useState<User | null>(null)
  const [amount, setAmount] = useState('')
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(false)
  const [showQR, setShowQR] = useState(false)
  
  const presetAmounts = [50, 100, 150, 200, 500]

  useEffect(() => {
    fetchMerchantData()
    fetchTransactions()
  }, [])

  const fetchMerchantData = async () => {
    try {
      const response = await fetch('/api/users')
      const users = await response.json()
      const merchantUser = users.find((user: User) => user.type === 'merchant')
      setMerchant(merchantUser)
    } catch (error) {
      console.error('Error fetching merchant data:', error)
    }
  }

  const fetchTransactions = async () => {
    try {
      const response = await fetch('/api/transactions?userId=1&userType=merchant')
      const data = await response.json()
      setTransactions(data)
    } catch (error) {
      console.error('Error fetching transactions:', error)
    }
  }

  const generateQR = () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount')
      return
    }
    setShowQR(true)
  }

  const downloadQR = async () => {
    try {
      const canvas = document.getElementById('qr-code') as HTMLCanvasElement
      if (canvas) {
        const url = canvas.toDataURL('image/png')
        const link = document.createElement('a')
        link.download = `payment-qr-${amount}.png`
        link.href = url
        link.click()
      }
    } catch (error) {
      console.error('Error downloading QR:', error)
    }
  }

  const handlePresetAmount = (preset: number) => {
    setAmount(preset.toString())
    setShowQR(false)
  }

  const handleAmountChange = (value: string) => {
    setAmount(value)
    setShowQR(false)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-PH')
  }

  if (!merchant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading merchant data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-gray-200/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="py-4 sm:py-6 md:py-8">
            {/* Back Button Row (Mobile Only) */}
            <div className="mb-3 sm:hidden">
              <Link href="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors active:scale-95">
                <ArrowLeft className="w-5 h-5" />
                <span className="text-sm font-medium">Back</span>
              </Link>
            </div>
            
            {/* Main Header Content */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
              <div className="w-full sm:w-auto">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-1">{merchant.name}</h1>
                <p className="text-sm sm:text-base text-gray-600 font-medium">Merchant Dashboard</p>
              </div>
              <div className="text-left sm:text-right w-full sm:w-auto bg-blue-50 sm:bg-transparent p-3 sm:p-0 rounded-xl sm:rounded-none">
                <p className="text-xs sm:text-sm text-gray-500 font-medium mb-1">Total Balance</p>
                <p className="text-2xl sm:text-2xl md:text-3xl font-bold text-blue-600">{formatCurrency(merchant.balance)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 md:py-12 pb-24">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
          {/* QR Code Generation */}
          <div className="gkash-card p-4 sm:p-6 md:p-8">
            <div className="flex items-center mb-4 sm:mb-6 md:mb-8">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-3 sm:mr-4">
                <Smartphone className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">Generate Payment QR</h2>
            </div>
            
            <div className="space-y-4 sm:space-y-5 md:space-y-6">
              {/* Preset Amount Buttons */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
                  Quick Select Amount
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3">
                  {presetAmounts.map((preset) => (
                    <button
                      key={preset}
                      onClick={() => handlePresetAmount(preset)}
                      className={`py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg sm:rounded-xl font-semibold text-xs sm:text-sm transition-all duration-200 cursor-pointer active:scale-95 ${
                        amount === preset.toString()
                          ? 'bg-blue-600 text-white shadow-lg scale-105'
                          : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
                      }`}
                    >
                      ₱{preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Amount Input */}
              <div>
                <label htmlFor="amount" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
                  Or Enter Custom Amount (₱)
                </label>
                <div className="relative">
                <PhilippinePeso className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    id="amount"
                    value={amount}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    placeholder="Enter custom amount"
                    className="gkash-input w-full pl-10 pr-4 py-3 text-gray-700 text-base"
                    min="0.01"
                    step="0.01"
                  />
                </div>
              </div>

              {/* Generate QR Button */}
              <button
                onClick={generateQR}
                disabled={!amount || parseFloat(amount) <= 0}
                className="gkash-button w-full py-3 sm:py-4 px-6 text-base sm:text-lg font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed active:scale-95"
              >
                Generate QR Code
              </button>

              {/* QR Code Display (only after generation) */}
              {showQR && amount && parseFloat(amount) > 0 && (
                <div className="text-center animate-fadeIn">
                  <div className="bg-white p-4 sm:p-6 rounded-2xl border-2 border-dashed border-blue-200 inline-block shadow-lg">
                    <QRCodeCanvas
                      id="qr-code"
                      value={JSON.stringify({
                        merchantId: merchant.id,
                        amount: parseFloat(amount),
                        timestamp: new Date().toISOString()
                      })}
                      size={window.innerWidth < 640 ? 240 : 300}
                      level="H"
                      includeMargin={true}
                    />
                  </div>
                  <p className="mt-3 sm:mt-4 text-base sm:text-lg font-bold text-gray-800">
                    {formatCurrency(parseFloat(amount))}
                  </p>
                  
                  {/* Download Button */}
                  <button
                    onClick={downloadQR}
                    className="mt-3 sm:mt-4 inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors cursor-pointer active:scale-95"
                  >
                    <Download className="w-4 h-4" />
                    Download QR Code
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Transaction History */}
          <div className="gkash-card p-4 sm:p-6 md:p-8">
            <div className="flex items-center mb-4 sm:mb-6 md:mb-8">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-xl flex items-center justify-center mr-3 sm:mr-4">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
              </div>
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">Transaction History</h2>
            </div>
            
            {transactions.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <TrendingUp className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium text-base sm:text-lg mb-2">No transactions yet</p>
                <p className="text-xs sm:text-sm text-gray-400 px-4">Generate a QR code to start receiving payments</p>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4 max-h-[400px] sm:max-h-96 overflow-y-auto">
                {transactions.map((transaction) => (
                  <div key={transaction.id} className="bg-white rounded-xl p-4 sm:p-5 border border-gray-100 hover:shadow-md transition-all duration-300 hover:border-blue-200 active:scale-[0.98]">
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm sm:text-base md:text-lg truncate">{transaction.payer.name}</p>
                        <p className="text-xs sm:text-sm text-gray-500 font-medium">{formatDate(transaction.timestamp)}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-bold text-green-600 text-base sm:text-lg md:text-xl">+{formatCurrency(transaction.amount)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <VoiceAssistant userId={1} userType="merchant" />
    </div>
  )
}
