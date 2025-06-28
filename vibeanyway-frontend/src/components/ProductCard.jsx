import { useNavigate } from "react-router-dom";

export default function ProductCard({ product }) {
  const navigate = useNavigate();

  const handleBuyNow = () => {
    navigate(`/buy/${product._id}`);
  };

  return (
    <div className="border p-4 rounded shadow">
      <img src={product.imageUrl} alt={product.name} className="w-full h-40 object-cover mb-2" />
      <h3 className="font-bold">{product.name}</h3>
      <p>{product.description}</p>
      <p className="text-sm text-gray-500">Size: {product.size} | Stock: {product.stock}</p>
      <div className="flex gap-2 mt-2">
        <button className="bg-blue-600 text-white px-2 py-1 rounded">Add to Cart</button>
        <button className="bg-yellow-500 text-white px-2 py-1 rounded">Wishlist</button>
        <button onClick={handleBuyNow} className="bg-green-600 text-white px-2 py-1 rounded">Buy Now</button>
        <button onClick={() => {
  console.log("📝 Saving product:", copy);
  onSave(copy);
}}>
  💾 Save Changes
</button>

      </div>
    </div>
  );
}
