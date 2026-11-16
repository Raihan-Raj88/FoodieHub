import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { FaCheckCircle, FaTimesCircle, FaSpinner } from 'react-icons/fa';
import api from '../services/api';
import './PaymentResultPage.css';

const PaymentSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const orderId = searchParams.get('order_id');

  const [status, setStatus] = useState('verifying'); // verifying | success | error
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!sessionId || !orderId) {
      setStatus('error');
      setMessage('Missing payment information. Please contact support.');
      return;
    }

    const verify = async () => {
      try {
        const res = await api.post('/payments/verify-session', { sessionId, orderId });
        if (res.data.success) {
          setStatus('success');
        } else {
          setStatus('error');
          setMessage(res.data.message || 'Payment verification failed.');
        }
      } catch (err) {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Could not verify payment. Please contact support.');
      }
    };

    verify();
  }, [sessionId, orderId]);

  if (status === 'verifying') {
    return (
      <div className="payment-result-page">
        <div className="payment-result-card">
          <FaSpinner className="result-icon spinning" />
          <h2>Verifying Payment...</h2>
          <p>Please wait while we confirm your payment.</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="payment-result-page">
        <div className="payment-result-card error">
          <FaTimesCircle className="result-icon error" />
          <h2>Verification Failed</h2>
          <p>{message}</p>
          <div className="result-actions">
            <Link to="/orders" className="btn btn-outline">View My Orders</Link>
            <Link to="/menu" className="btn btn-primary">Back to Menu</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-result-page">
      <div className="payment-result-card success">
        <FaCheckCircle className="result-icon success" />
        <h2>Payment Successful!</h2>
        <p>Your order has been confirmed and payment received. We're preparing your food!</p>
        {orderId && (
          <p className="order-ref">
            Order Reference: <strong>#{orderId.slice(-8).toUpperCase()}</strong>
          </p>
        )}
        <div className="result-actions">
          <Link to="/orders" className="btn btn-primary">Track My Order</Link>
          <Link to="/menu" className="btn btn-outline">Order More</Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
