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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">PayWave Café</h1>
              <p className="text-gray-600">Merchant Dashboard</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Total Balance</p>
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(merchant.balance)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* QR Code Generation */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Generate Payment QR</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                  Amount (₱)
                </label>
                <input
                  type="number"
                  id="amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0.01"
                  step="0.01"
                />
              </div>

              {amount && parseFloat(amount) > 0 && (
                <div className="text-center">
                  <div className="bg-white p-4 rounded-lg border-2 border-dashed border-gray-300 inline-block">
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
                  <p className="mt-2 text-sm text-gray-600">
                    Amount: {formatCurrency(parseFloat(amount))}
                  </p>
                </div>
              )}

              <button
                onClick={downloadQR}
                disabled={!amount || parseFloat(amount) <= 0}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Download QR Code
              </button>
            </div>
          </div>

          {/* Transaction History */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Transaction History</h2>
            
            {transactions.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 text-6xl mb-4">📱</div>
                <p className="text-gray-500">No transactions yet</p>
                <p className="text-sm text-gray-400">Generate a QR code to start receiving payments</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {transactions.map((transaction) => (
                  <div key={transaction.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">{transaction.payer.name}</p>
                        <p className="text-sm text-gray-500">{formatDate(transaction.timestamp)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">+{formatCurrency(transaction.amount)}</p>
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
