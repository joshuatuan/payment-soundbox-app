'use client'

import { useState, useEffect, useRef } from 'react'
import jsQR from 'jsqr'
import VoiceAssistant from '@/components/VoiceAssistant'
import { Camera, Upload, Wallet, CreditCard, X, Check, ArrowLeft, Scan, QrCode, ScanLine } from 'lucide-react'
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
  const [showModal, setShowModal] = useState(false)
  const [confirmChecked, setConfirmChecked] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const isScanningRef = useRef(false)

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
            const parsedData = JSON.parse(code.data) as QRData
            setQrData(parsedData)
            setShowModal(true)
            setConfirmChecked(false)
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

  const startCameraScan = async () => {
    try {
      setIsScanning(true)
      isScanningRef.current = true
      console.log('Starting camera scan...')
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
        console.log('Video playing, starting QR scan loop...')
        
        // Start scanning after a short delay to ensure video is ready
        setTimeout(() => {
          console.log('Initiating scan loop...')
          scanQRFromVideo()
        }, 1000)
      }
    } catch (error) {
      console.error('Error accessing camera:', error)
      alert('Unable to access camera. Please use file upload instead.')
      setIsScanning(false)
      isScanningRef.current = false
    }
  }

  const stopCameraScan = () => {
    isScanningRef.current = false
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach(track => track.stop())
      videoRef.current.srcObject = null
    }
    setIsScanning(false)
  }

  const scanQRFromVideo = () => {
    if (!videoRef.current || !canvasRef.current) {
      return
    }
    
    if (!isScanningRef.current) {
      return
    }

    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    
    if (!ctx || video.readyState !== video.HAVE_ENOUGH_DATA) {
      if (isScanningRef.current) {
        requestAnimationFrame(scanQRFromVideo)
      }
      return
    }

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    
    // Try scanning with more aggressive options
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'dontInvert',
    })

    if (code) {
      console.log('QR Code detected!', code.data)
      try {
        const parsedData = JSON.parse(code.data) as QRData
        console.log('Parsed QR data:', parsedData)
        setQrData(parsedData)
        setShowModal(true)
        setConfirmChecked(false)
        stopCameraScan()
        return // Stop scanning after successful detection
      } catch (error) {
        console.error('Invalid QR code format:', error)
        console.log('Raw QR data:', code.data)
      }
    }

    if (isScanningRef.current) {
      requestAnimationFrame(scanQRFromVideo)
    }
  }

  const handlePayment = async () => {
    if (!qrData || !payer || !confirmChecked) {
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
        
        // Close modal
        setShowModal(false)
        setQrData(null)
        setConfirmChecked(false)
        
        // Clear file input
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
        
        setMessage(`Payment successful! Sent ${formatCurrency(qrData.amount)} to ${merchant?.name}`)
        
        // Enhanced TTS for payment confirmation
        const newBalance = payer.balance - qrData.amount
        speak(`Payment confirmed. You have successfully sent ${qrData.amount} pesos to ${merchant?.name}. Your new balance is ${newBalance} pesos.`)
        
        setTimeout(() => setMessage(''), 5000)
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

  const closeModal = () => {
    setShowModal(false)
    setConfirmChecked(false)
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
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-1">{payer.name}</h1>
                <p className="text-sm sm:text-base text-gray-600 font-medium">Payer Dashboard</p>
              </div>
              <div className="text-left sm:text-right w-full sm:w-auto bg-blue-50 sm:bg-transparent p-3 sm:p-0 rounded-xl sm:rounded-none">
                <p className="text-xs sm:text-sm text-gray-500 font-medium mb-1">Current Balance</p>
                <p className="text-2xl sm:text-2xl md:text-3xl font-bold text-blue-600">{formatCurrency(payer.balance)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 mx-3 mt-4 rounded-xl font-medium shadow-sm text-sm sm:text-base animate-fadeIn">
          {message}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 md:py-12 pb-24">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {/* QR Code Payment - Main Feature */}
          <div className="xl:col-span-2 gkash-card p-4 sm:p-6 md:p-8">
            <div className="flex items-center mb-4 sm:mb-6 md:mb-8">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-3 sm:mr-4">
                <QrCode className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600"  />
              </div>
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">Pay with QR Code</h2>
            </div>
            
            <div className="space-y-4 sm:space-y-5 md:space-y-6">
              {/* Scan Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {/* Camera Scan Button */}
                <button
                  onClick={isScanning ? stopCameraScan : startCameraScan}
                  className={`py-3 sm:py-4 px-4 sm:px-6 rounded-xl font-semibold text-sm sm:text-base md:text-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer active:scale-95 ${
                    isScanning
                      ? 'bg-red-500 text-white hover:bg-red-600'
                      : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg'
                  }`}
                >
                  {isScanning ? (
                    <>
                      <X className="w-5 h-5" />
                      Stop Scanning
                    </>
                  ) : (
                    <>
                      <ScanLine className="w-5 h-5"/>
                      Scan QR Code
                    </>
                  )}
                </button>

                {/* File Upload Button */}
                <label
                  htmlFor="qrUpload"
                  className="py-3 sm:py-4 px-4 sm:px-6 rounded-xl font-semibold text-sm sm:text-base md:text-lg bg-blue-100 text-blue-700 hover:bg-blue-200 border-2 border-blue-300 cursor-pointer text-center transition-all duration-200 flex items-center justify-center gap-2 active:scale-95"
                >
                  <Upload className="w-5 h-5" />
                  Upload QR Image
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  id="qrUpload"
                  accept="image/*"
                  onChange={handleQRUpload}
                  className="hidden"
                />
              </div>

              {/* Hidden canvas for QR processing */}
              <canvas ref={canvasRef} className="hidden" />
            </div>
          </div>

          {/* Deposit Funds - Side Feature */}
          <div className="gkash-card p-4 sm:p-5 md:p-6">
            <div className="flex items-center mb-4 sm:mb-5 md:mb-6">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mr-3">
                <Wallet className="w-5 h-5 text-green-600" />
              </div>
              <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-900">Add Funds</h2>
            </div>
            
            <div className="space-y-3 sm:space-y-4">
              <div>
                <label htmlFor="depositAmount" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                  Amount (₱)
                </label>
                <input
                  type="number"
                  id="depositAmount"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="gkash-input w-full px-3 py-2.5 text-gray-700 text-base"
                  min="0.01"
                  step="0.01"
                />
              </div>

              <button
                onClick={handleDeposit}
                disabled={!depositAmount || parseFloat(depositAmount) <= 0 || loading}
                className="gkash-success-button w-full py-2.5 sm:py-3 px-4 text-sm sm:text-base font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed active:scale-95 flex items-center justify-center gap-2"
              >
                {loading ? (
                  'Processing...'
                ) : (
                  <>
                    <Wallet className="w-4 h-4" />
                    Add Funds
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <div className="mt-6 sm:mt-8 md:mt-12 gkash-card p-4 sm:p-6 md:p-8">
          <div className="flex items-center mb-4 sm:mb-6 md:mb-8">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-xl flex items-center justify-center mr-3 sm:mr-4">
              <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
            </div>
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">Payment History</h2>
          </div>
          
          {transactions.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <CreditCard className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium text-base sm:text-lg mb-2">No payments made yet</p>
              <p className="text-xs sm:text-sm text-gray-400 px-4">Upload a QR code to make your first payment</p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4 max-h-[400px] sm:max-h-96 overflow-y-auto">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="bg-white rounded-xl p-4 sm:p-5 border border-gray-100 hover:shadow-md transition-all duration-300 hover:border-red-200 active:scale-[0.98]">
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm sm:text-base md:text-lg truncate">Paid to {transaction.merchant.name}</p>
                      <p className="text-xs sm:text-sm text-gray-500 font-medium">{formatDate(transaction.timestamp)}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-red-600 text-base sm:text-lg md:text-xl">-{formatCurrency(transaction.amount)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <VoiceAssistant userId={2} userType="payer" />

      {/* Full-Screen QR Scanner Modal */}
      {isScanning && (
        <div className="fixed inset-0 z-50 bg-black animate-fadeIn">
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent p-4 sm:p-6">
            <div className="space-y-3">
              {/* Back Button */}
              <button
                onClick={stopCameraScan}
                className="inline-flex items-center gap-2 text-white hover:text-blue-300 transition-colors active:scale-95"
                aria-label="Go back"
              >
                <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                <span className="text-sm sm:text-base font-medium">Back</span>
              </button>
              
              {/* Title */}
              <div>
                <h2 className="text-white font-bold text-lg sm:text-xl mb-1">Scan QR Code</h2>
                <p className="text-white/80 text-xs sm:text-sm">Position the QR code within the frame</p>
              </div>
            </div>
          </div>

          {/* Video Feed */}
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover"
            playsInline
            autoPlay
          />

          {/* Scanning Frame Overlay */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {/* Dark overlay with cutout */}
            <div className="absolute inset-0 bg-black/50" />
            
            {/* Scanning frame */}
            <div className="relative z-10">
              <div className="w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 border-4 border-white rounded-3xl animate-pulse shadow-2xl">
                {/* Corner accents */}
                <div className="absolute top-0 left-0 w-12 h-12 border-t-8 border-l-8 border-blue-400 rounded-tl-3xl"></div>
                <div className="absolute top-0 right-0 w-12 h-12 border-t-8 border-r-8 border-blue-400 rounded-tr-3xl"></div>
                <div className="absolute bottom-0 left-0 w-12 h-12 border-b-8 border-l-8 border-blue-400 rounded-bl-3xl"></div>
                <div className="absolute bottom-0 right-0 w-12 h-12 border-b-8 border-r-8 border-blue-400 rounded-br-3xl"></div>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 sm:p-8">
            <div className="text-center space-y-3">
              <div className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-full text-sm sm:text-base font-semibold">
                <ScanLine className="w-5 h-5 animate-pulse" />
                Scanning...
              </div>
              <p className="text-white font-medium text-sm sm:text-base">
                Hold your phone steady and keep the QR code within the frame
              </p>
              <p className="text-white/70 text-xs sm:text-sm">
                Keep 6-12 inches away for best results
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Payment Confirmation Modal */}
      {showModal && qrData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-md w-full p-5 sm:p-6 md:p-8 transform animate-scaleIn max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-4 sm:mb-5 md:mb-6">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Confirm Payment</h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors active:scale-95"
                aria-label="Close"
              >
                <X className="w-6 h-6 sm:w-7 sm:h-7" />
              </button>
            </div>

            {/* Payment Details */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 mb-4 sm:mb-5 md:mb-6 border-2 border-blue-100">
              <div className="space-y-3 sm:space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm sm:text-base text-gray-600 font-medium">Amount</span>
                  <span className="text-2xl sm:text-3xl font-bold text-blue-600">
                    {formatCurrency(qrData.amount)}
                  </span>
                </div>
                <div className="h-px bg-blue-200"></div>
                <div className="flex justify-between items-center">
                  <span className="text-sm sm:text-base text-gray-600 font-medium">Pay to</span>
                  <span className="text-base sm:text-lg font-bold text-gray-900">{merchant?.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm sm:text-base text-gray-600 font-medium">Your Balance</span>
                  <span className="text-base sm:text-lg font-semibold text-gray-700">
                    {formatCurrency(payer?.balance || 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm sm:text-base text-gray-600 font-medium">New Balance</span>
                  <span className="text-base sm:text-lg font-semibold text-green-600">
                    {formatCurrency((payer?.balance || 0) - qrData.amount)}
                  </span>
                </div>
              </div>
            </div>

            {/* Insufficient Balance Warning */}
            {payer && payer.balance < qrData.amount && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-3 sm:p-4 mb-4 sm:mb-5 md:mb-6 animate-fadeIn">
                <p className="text-red-700 font-semibold text-center text-sm sm:text-base">
                  ⚠️ Insufficient balance
                </p>
              </div>
            )}

            {/* Confirmation Checkbox */}
            <label className="flex items-start space-x-3 mb-4 sm:mb-5 md:mb-6 cursor-pointer group">
              <input
                type="checkbox"
                checked={confirmChecked}
                onChange={(e) => setConfirmChecked(e.target.checked)}
                className="mt-0.5 sm:mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer flex-shrink-0"
              />
              <span className="text-xs sm:text-sm text-gray-700 font-medium group-hover:text-gray-900">
                I confirm that I want to send {formatCurrency(qrData.amount)} to {merchant?.name}. This action cannot be undone.
              </span>
            </label>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button
                onClick={closeModal}
                className="flex-1 py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors active:scale-95 text-sm sm:text-base"
              >
                Cancel
              </button>
              <button
                onClick={handlePayment}
                disabled={!confirmChecked || loading || (payer && payer.balance < qrData.amount)}
                className="flex-1 py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl active:scale-95 text-sm sm:text-base flex items-center justify-center gap-2"
              >
                {loading ? (
                  'Processing...'
                ) : (
                    "Confirm Payment"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}