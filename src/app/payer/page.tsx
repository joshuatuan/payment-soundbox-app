'use client'

import { useState, useEffect, useRef } from 'react'
import jsQR from 'jsqr'
import VoiceAssistant from '@/components/VoiceAssistant'

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

interface QRData {
  merchantId: number
  amount: number
  timestamp: string
}

export default function PayerPage() {
  const [payer, setPayer] = useState<User | null>(null)
  const [merchant, setMerchant] = useState<User | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [depositAmount, setDepositAmount] = useState('')
  const [qrData, setQrData] = useState<QRData | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchPayerData()
    fetchMerchantData()
    fetchTransactions()
  }, [])

  const fetchPayerData = async () => {
    try {
      const response = await fetch('/api/users')
      const users = await response.json()
      const payerUser = users.find((user: User) => user.type === 'payer')
      setPayer(payerUser)
    } catch (error) {
      console.error('Error fetching payer data:', error)
    }
  }

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
      const response = await fetch('/api/transactions?userId=2&userType=payer')
      const data = await response.json()
      setTransactions(data)
    } catch (error) {
      console.error('Error fetching transactions:', error)
    }
  }

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'en-US'
      utterance.rate = 0.9
      speechSynthesis.speak(utterance)
    }
  }

  const handleDeposit = async () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      alert('Please enter a valid amount')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/deposit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: payer?.id,
          amount: parseFloat(depositAmount)
        })
      })

      if (response.ok) {
        const updatedPayer = await response.json()
        setPayer(updatedPayer)
        setDepositAmount('')
        setMessage(`₱${depositAmount} deposited successfully!`)
        
        // TTS for deposit
        speak(`₱${depositAmount} deposited successfully. Your new balance is ₱${updatedPayer.balance}.`)
        
        setTimeout(() => setMessage(''), 3000)
      } else {
        const error = await response.json()
        alert(error.error || 'Deposit failed')
      }
    } catch (error) {
      console.error('Error processing deposit:', error)
      alert('Deposit failed')
    } finally {
      setLoading(false)
    }
  }

  const handleQRUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        canvas.width = img.width
        canvas.height = img.height
        ctx.drawImage(img, 0, 0)

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const code = jsQR(imageData.data, imageData.width, imageData.height)

        if (code) {
          try {
            const qrData = JSON.parse(code.data) as QRData
            setQrData(qrData)
            setMessage('QR code scanned successfully!')
            setTimeout(() => setMessage(''), 3000)
          } catch (error) {
            alert('Invalid QR code format')
          }
        } else {
          alert('No QR code found in the image')
        }
      }
      img.src = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }

  const handlePayment = async () => {
    if (!qrData || !payer) {
      alert('Please scan a QR code first')
      return
    }

    if (payer.balance < qrData.amount) {
      alert('Insufficient balance')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payerId: payer.id,
          merchantId: qrData.merchantId,
          amount: qrData.amount
        })
      })

      if (response.ok) {
        const transaction = await response.json()
        
        // Update payer balance
        setPayer(prev => prev ? { ...prev, balance: prev.balance - qrData.amount } : null)
        
        // Refresh transactions
        fetchTransactions()
        
        // Clear QR data
        setQrData(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
        
        setMessage(`Payment successful! Sent ₱${qrData.amount} to ${merchant?.name}`)
        
        // TTS for payment
        speak(`Payment successful. You have sent ₱${qrData.amount} to ${merchant?.name}.`)
        
        setTimeout(() => setMessage(''), 3000)
      } else {
        const error = await response.json()
        alert(error.error || 'Payment failed')
      }
    } catch (error) {
      console.error('Error processing payment:', error)
      alert('Payment failed')
    } finally {
      setLoading(false)
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

  if (!payer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading payer data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-blue-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-8 gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{payer.name}</h1>
              <p className="text-gray-600 font-medium">Payer Dashboard</p>
            </div>
            <div className="text-center sm:text-right">
              <p className="text-sm text-gray-500 font-medium mb-1">Current Balance</p>
              <p className="text-3xl font-bold text-blue-600">{formatCurrency(payer.balance)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-6 py-4 mx-4 mt-6 rounded-xl font-medium shadow-sm">
          {message}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* QR Code Payment - Main Feature */}
          <div className="xl:col-span-2 gkash-card p-8">
            <div className="flex items-center mb-8">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-4">
                <span className="text-2xl">📱</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Pay with QR Code</h2>
            </div>
            
            <div className="space-y-6">
              <div>
                <label htmlFor="qrUpload" className="block text-sm font-semibold text-gray-700 mb-3">
                  Upload QR Code Image
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  id="qrUpload"
                  accept="image/*"
                  onChange={handleQRUpload}
                  className="gkash-input w-full px-4 py-3 text-gray-700"
                />
              </div>

              {qrData && (
                <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6">
                  <h3 className="font-bold text-blue-900 mb-4 text-lg">Payment Details</h3>
                  <div className="space-y-2 mb-6">
                    <p className="text-blue-800 font-semibold">Amount: {formatCurrency(qrData.amount)}</p>
                    <p className="text-blue-800 font-semibold">Merchant: {merchant?.name}</p>
                  </div>
                  
                  <button
                    onClick={handlePayment}
                    disabled={loading || payer.balance < qrData.amount}
                    className="gkash-button w-full py-3 px-6 text-lg font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Processing...' : 'Confirm Payment'}
                  </button>
                  
                  {payer.balance < qrData.amount && (
                    <p className="text-red-600 text-sm mt-3 font-medium">Insufficient balance</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Deposit Funds - Side Feature */}
          <div className="gkash-card p-6">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center mr-3">
                <span className="text-xl">💰</span>
              </div>
              <h2 className="text-xl font-bold text-gray-900">Add Funds</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="depositAmount" className="block text-sm font-semibold text-gray-700 mb-2">
                  Amount (₱)
                </label>
                <input
                  type="number"
                  id="depositAmount"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="gkash-input w-full px-3 py-2 text-gray-700"
                  min="0.01"
                  step="0.01"
                />
              </div>

              <button
                onClick={handleDeposit}
                disabled={!depositAmount || parseFloat(depositAmount) <= 0 || loading}
                className="gkash-success-button w-full py-2 px-4 text-sm font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : 'Add Funds'}
              </button>
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <div className="mt-12 gkash-card p-8">
          <div className="flex items-center mb-8">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mr-4">
              <span className="text-2xl">💳</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Payment History</h2>
          </div>
          
          {transactions.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl text-gray-400">💳</span>
              </div>
              <p className="text-gray-500 font-medium text-lg mb-2">No payments made yet</p>
              <p className="text-sm text-gray-400">Upload a QR code to make your first payment</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="bg-white rounded-xl p-5 border border-gray-100 hover:shadow-md transition-all duration-300 hover:border-red-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-gray-900 text-lg">Paid to {transaction.merchant.name}</p>
                      <p className="text-sm text-gray-500 font-medium">{formatDate(transaction.timestamp)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-red-600 text-xl">-{formatCurrency(transaction.amount)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <VoiceAssistant userId={2} userType="payer" />
    </div>
  )
}