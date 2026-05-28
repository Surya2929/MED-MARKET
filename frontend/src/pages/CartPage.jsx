import { useContext, useState } from 'react';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { Trash2 } from 'lucide-react';

const CartPage = () => {
  const { cart, removeFromCart, clearCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const totalAmount = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handleCheckout = async () => {
    if (!user) return navigate('/login');
    const storeId = cart[0]?.storeId;
    const items = cart.map(item => ({ medicineId: item.medicineId, quantity: item.quantity, price: item.price }));

    setLoading(true);
    try {
      await API.post('/orders', { storeId, items, totalAmount });
      alert('Order placed successfully!');
      clearCart();
      navigate('/search');
    } catch (error) {
      alert('Error placing order');
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) return <div className="text-center py-20 text-2xl font-bold">Your Cart is Empty</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
      <div className="bg-white rounded-xl border p-6">
        {cart.map((item) => (
          <div key={item.inventoryId} className="flex justify-between items-center border-b py-4">
            <div>
              <h3 className="text-lg font-bold">{item.medicineName}</h3>
              <p>Sold by: {item.storeName}</p>
            </div>
            <div className="flex gap-4 items-center">
              <span className="font-bold text-xl">₹{item.price * item.quantity}</span>
              <button onClick={() => removeFromCart(item.inventoryId)} className="text-red-500"><Trash2/></button>
            </div>
          </div>
        ))}
        <div className="flex justify-between mt-6 items-center">
          <p className="text-3xl font-bold text-green-600">Total: ₹{totalAmount}</p>
          <button onClick={handleCheckout} disabled={loading} className="bg-green-600 text-white px-8 py-3 rounded-lg font-bold">{loading ? 'Processing...' : 'Place Order'}</button>
        </div>
      </div>
    </div>
  );
};
export default CartPage;