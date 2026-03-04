import { useParams } from 'react-router';

export default function OrderDetail() {
  const { id } = useParams();
  return (
    <div>
      <h1 className="text-20 font-bold mb-4">订单详情</h1>
      <p className="text-gray-500">订单 ID: {id}</p>
    </div>
  );
}
