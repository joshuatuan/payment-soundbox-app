'use client'

import { useState, useEffect, useRef } from 'react'
import jsQR from 'jsqr'

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading payer data...</p>
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
              <h1 className="text-3xl font-bold text-gray-900">{payer.name}</h1>
              <p className="text-gray-600">Payer Dashboard</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Current Balance</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(payer.balance)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 mx-4 mt-4 rounded">
          {message}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Deposit Funds */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Deposit Funds</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="depositAmount" className="block text-sm font-medium text-gray-700 mb-2">
                  Amount (₱)
                </label>
                <input
                  type="number"
                  id="depositAmount"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="Enter amount to deposit"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0.01"
                  step="0.01"
                />
              </div>

              <button
                onClick={handleDeposit}
                disabled={!depositAmount || parseFloat(depositAmount) <= 0 || loading}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Processing...' : 'Deposit Funds'}
              </button>
            </div>
          </div>

          {/* QR Code Payment */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Pay with QR Code</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="qrUpload" className="block text-sm font-medium text-gray-700 mb-2">
                  Upload QR Code Image
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  id="qrUpload"
                  accept="image/*"
                  onChange={handleQRUpload}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {qrData && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-medium text-blue-900 mb-2">Payment Details</h3>
                  <p className="text-blue-800">Amount: {formatCurrency(qrData.amount)}</p>
                  <p className="text-blue-800">Merchant: {merchant?.name}</p>
                  
                  <button
                    onClick={handlePayment}
                    disabled={loading || payer.balance < qrData.amount}
                    className="w-full mt-4 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? 'Processing...' : 'Confirm Payment'}
                  </button>
                  
                  {payer.balance < qrData.amount && (
                    <p className="text-red-600 text-sm mt-2">Insufficient balance</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Payment History</h2>
          
          {transactions.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 text-6xl mb-4">💳</div>
              <p className="text-gray-500">No payments made yet</p>
              <p className="text-sm text-gray-400">Upload a QR code to make your first payment</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">Paid to {transaction.merchant.name}</p>
                      <p className="text-sm text-gray-500">{formatDate(transaction.timestamp)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-red-600">-{formatCurrency(transaction.amount)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
