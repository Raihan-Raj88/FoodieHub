import { useSearchParams, Link } from 'react-router-dom';
import { FaTimesCircle } from 'react-icons/fa';
import './PaymentResultPage.css';

const PaymentCancelPage = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order_id');

  return (
    <div className="payment-result-page">
      <div className="payment-result-card cancel">
        <FaTimesCircle className="result-icon cancel" />
        <h2>Payment Cancelled</h2>
        <p>
          You cancelled the payment. Your order has been saved but not confirmed.
          You can pay later from your orders page or place a new order.
        </p>
        {orderId && (
          <p className="order-ref">
            Order Reference: <strong>#{orderId.slice(-8).toUpperCase()}</strong>
          </p>
        )}
        <div className="result-actions">
          <Link to="/orders" className="btn btn-outline">View My Orders</Link>
          <Link to="/menu" className="btn btn-primary">Back to Menu</Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentCancelPage;
