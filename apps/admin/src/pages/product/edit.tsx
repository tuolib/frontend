import { useParams } from 'react-router';

export default function ProductEdit() {
  const { id } = useParams();
  return (
    <div>
      <h1 className="text-20 font-bold mb-4">编辑商品</h1>
      <p className="text-gray-500">商品 ID: {id}</p>
    </div>
  );
}
