import { useParams } from 'react-router';

export default function ProductDetail() {
  const { id } = useParams();
  return (
    <div className="p-4">
      <h1 className="text-20 font-bold mb-4">商品详情</h1>
      <p className="text-gray-500">商品 ID: {id}</p>
    </div>
  );
}
