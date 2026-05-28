import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';

const VendorDashboard = () => {
  const { user } = useContext(AuthContext);
  const [masterMedicines, setMasterMedicines] = useState([]);
  const [formData, setFormData] = useState({ medicineId: '', price: '', stock: '' });

  useEffect(() => {
    const fetchMedicines = async () => {
      const { data } = await API.get('/medicines/master');
      setMasterMedicines(data);
    };
    fetchMedicines();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await API.post('/vendor/inventory', formData);
      alert('Updated Successfully!');
      setFormData({ medicineId: '', price: '', stock: '' });
    } catch (error) {
      alert('Failed to update inventory');
    }
  };

  if (user?.role !== 'vendor') return <h1 className="text-center py-20 text-red-500 text-2xl">Access Denied</h1>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Vendor Dashboard</h1>
      <form onSubmit={handleAdd} className="bg-white p-6 rounded-xl border space-y-4">
        <select required value={formData.medicineId} onChange={(e) => setFormData({ ...formData, medicineId: e.target.value })} className="w-full px-4 py-2 border rounded-lg">
          <option value="">Select Medicine</option>
          {masterMedicines.map(med => <option key={med._id} value={med._id}>{med.name}</option>)}
        </select>
        <input type="number" placeholder="Price (₹)" required value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} className="w-full px-4 py-2 border rounded-lg" />
        <input type="number" placeholder="Stock" required value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: e.target.value })} className="w-full px-4 py-2 border rounded-lg" />
        <button type="submit" className="w-full bg-orange-500 text-white py-3 rounded-lg font-bold">Update Inventory</button>
      </form>
    </div>
  );
};
export default VendorDashboard;