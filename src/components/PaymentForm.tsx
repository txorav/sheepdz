// src/components/PaymentForm.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Payment {
  id: string;
  amount: number;
  status: string;
}

interface PaymentFormProps {
  reservationId: string;
  amount: number;
  existingPayment?: Payment | null;
}

export default function PaymentForm({ reservationId, amount, existingPayment }: PaymentFormProps) {
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState<'CCP' | 'CASH'>('CCP');
  const [ccpNumber, setCcpNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch('/api/customer/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reservationId,
          amount,
          paymentMethod,
          ccpNumber: paymentMethod === 'CCP' ? ccpNumber : null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process payment');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push(`/customer/reservations/${reservationId}?payment=success`);
      }, 2000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <div className="text-center">
          <div className="text-4xl mb-4">✅</div>
          <h3 className="text-lg font-medium text-green-800 mb-2">Payment Recorded Successfully!</h3>
          <p className="text-green-600">
            {paymentMethod === 'CCP' 
              ? 'Your CCP payment has been recorded. Please complete the payment at your post office.'
              : 'Your cash payment option has been recorded. You can pay when picking up your sheep.'
            }
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Choose Payment Method</h2>
      
      {existingPayment && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-yellow-800">
            <strong>Existing Payment:</strong> Status - {existingPayment.status}
            {existingPayment.status === 'PENDING' && ' (Payment is pending completion)'}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {/* Payment Method Selection */}
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-3">Payment Method</label>
          <div className="space-y-3">
            <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                value="CCP"
                checked={paymentMethod === 'CCP'}
                onChange={(e) => setPaymentMethod(e.target.value as 'CCP')}
                className="mr-3"
              />
              <div>
                <div className="font-medium">💳 CCP (Postal Payment)</div>
                <div className="text-sm text-gray-600">Pay through Algérie Poste CCP account</div>
              </div>
            </label>
            
            <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                value="CASH"
                checked={paymentMethod === 'CASH'}
                onChange={(e) => setPaymentMethod(e.target.value as 'CASH')}
                className="mr-3"
              />
              <div>
                <div className="font-medium">💵 Cash on Pickup</div>
                <div className="text-sm text-gray-600">Pay cash when collecting your sheep</div>
              </div>
            </label>
          </div>
        </div>

        {/* CCP Number Field (only shown if CCP is selected) */}
        {paymentMethod === 'CCP' && (
          <div className="mb-6">
            <label htmlFor="ccpNumber" className="block text-gray-700 text-sm font-bold mb-2">
              Your CCP Account Number
            </label>
            <input
              type="text"
              id="ccpNumber"
              value={ccpNumber}
              onChange={(e) => setCcpNumber(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Enter your CCP account number"
              required={paymentMethod === 'CCP'}
            />
            <p className="text-gray-600 text-sm mt-1">
              You will need to complete the payment at any Algérie Poste office using this account.
            </p>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex items-center justify-between">
          <button
            type="submit"
            disabled={loading || (paymentMethod === 'CCP' && !ccpNumber.trim())}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:bg-gray-400"
          >
            {loading ? 'Processing...' : `Confirm ${paymentMethod} Payment`}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Cancel
          </button>
        </div>
      </form>

      {/* Payment Instructions */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-medium text-blue-900 mb-2">Payment Instructions:</h3>
        <div className="text-sm text-blue-800">
          {paymentMethod === 'CCP' ? (
            <ul className="list-disc list-inside space-y-1">
              <li>Visit any Algérie Poste office</li>
              <li>Use CCP account for payment transfer</li>
              <li>Keep your payment receipt for pickup</li>
              <li>Payment confirmation may take 24-48 hours</li>
            </ul>
          ) : (
            <ul className="list-disc list-inside space-y-1">
              <li>Bring exact cash amount on pickup day</li>
              <li>Payment must be made before sheep collection</li>
              <li>Keep your reservation code for identification</li>
              <li>No change will be provided, bring exact amount</li>
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
