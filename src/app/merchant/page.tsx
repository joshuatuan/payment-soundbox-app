'use client'

import { useState, useEffect } from 'react'
import { QRCodeCanvas } from 'qrcode.react'
import QRCodeLib from 'qrcode'

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

  const downloadQR = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount')
      return
    }

    try {
      const qrData = JSON.stringify({
        merchantId: merchant?.id,
        amount: parseFloat(amount),
        timestamp: new Date().toISOString()
      })

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
      <div className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-8 gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{merchant.name}</h1>
              <p className="text-gray-600 font-medium">Merchant Dashboard</p>
            </div>
            <div className="text-center sm:text-right">
              <p className="text-sm text-gray-500 font-medium mb-1">Total Balance</p>
              <p className="text-3xl font-bold text-blue-600">{formatCurrency(merchant.balance)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* QR Code Generation */}
          <div className="gkash-card p-8">
            <div className="flex items-center mb-8">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-4">
                <span className="text-2xl">📱</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Generate Payment QR</h2>
            </div>
            
            <div className="space-y-6">
              <div>
                <label htmlFor="amount" className="block text-sm font-semibold text-gray-700 mb-3">
                  Amount (₱)
                </label>
                <input
                  type="number"
                  id="amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="gkash-input w-full px-4 py-3 text-gray-700"
                  min="0.01"
                  step="0.01"
                />
              </div>

              {amount && parseFloat(amount) > 0 && (
                <div className="text-center">
                  <div className="bg-white p-6 rounded-2xl border-2 border-dashed border-blue-200 inline-block shadow-sm">
                    <QRCodeCanvas
                      id="qr-code"
                      value={JSON.stringify({
                        merchantId: merchant.id,
                        amount: parseFloat(amount),
                        timestamp: new Date().toISOString()
                      })}
                      size={200}
                      level="M"
                      includeMargin={true}
                    />
                  </div>
                  <p className="mt-4 text-sm font-semibold text-gray-600">
                    Amount: {formatCurrency(parseFloat(amount))}
                  </p>
                </div>
              )}

              <button
                onClick={downloadQR}
                disabled={!amount || parseFloat(amount) <= 0}
                className="gkash-button w-full py-3 px-6 text-lg font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Download QR Code
              </button>
            </div>
          </div>

          {/* Transaction History */}
          <div className="gkash-card p-8">
            <div className="flex items-center mb-8">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mr-4">
                <span className="text-2xl">📊</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Transaction History</h2>
            </div>
            
            {transactions.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-4xl text-gray-400">📱</span>
                </div>
                <p className="text-gray-500 font-medium text-lg mb-2">No transactions yet</p>
                <p className="text-sm text-gray-400">Generate a QR code to start receiving payments</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {transactions.map((transaction) => (
                  <div key={transaction.id} className="bg-white rounded-xl p-5 border border-gray-100 hover:shadow-md transition-all duration-300 hover:border-blue-200">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-gray-900 text-lg">{transaction.payer.name}</p>
                        <p className="text-sm text-gray-500 font-medium">{formatDate(transaction.timestamp)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600 text-xl">+{formatCurrency(transaction.amount)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
