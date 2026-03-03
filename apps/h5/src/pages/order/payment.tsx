import { useParams } from 'react-router';

export default function OrderPayment() {
  const { id } = useParams();
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">支付</h1>
      <p className="text-gray-500">订单 ID: {id}</p>
    </div>
  );
}
