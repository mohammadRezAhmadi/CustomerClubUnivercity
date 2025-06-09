import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { ref, get } from "firebase/database"; // چون از realtime استفاده می‌کنی
import { auth, db } from "../../firebaseConfig";

export default function Sign() {
  const [formData, setFormData] = useState({ email: "", password: "", role: "student" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { email, password, role } = formData;

      // ورود
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // گرفتن نقش واقعی از دیتابیس
      const userRef = ref(db, `users/${user.uid}`);
      const snapshot = await get(userRef);
      const userData = snapshot.val();

      if (!userData) throw new Error("کاربر در دیتابیس پیدا نشد.");

      if (userData.role !== role) {
        alert("نقش انتخاب‌شده اشتباه است!");
        return;
      }

      // ریدایرکت بر اساس نقش
      if (userData.role === "admin") {
        navigate("/DashboardAdmin");
      } else {
        navigate("/DashboardStudent");
      }
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
  <form
  onSubmit={handleSubmit}
  className="max-w-md mx-auto bg-white/80 backdrop-blur-md border border-gray-200 shadow-2xl p-8 rounded-3xl space-y-6 animate-fade-in"
>
  <h2 className="text-3xl font-bold text-center text-indigo-700">ورود به حساب</h2>

  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      نقش خود را انتخاب کنید:
    </label>
    <select
      name="role"
      value={formData.role}
      onChange={handleChange}
      className="block w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
    >
      <option value="student">دانشجو</option>
      <option value="admin">مدیر</option>
    </select>
  </div>

  <div>
    <input
      type="email"
      name="email"
      placeholder="ایمیل"
      value={formData.email}
      onChange={handleChange}
      required
      className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
    />
  </div>

  <div>
    <input
      type="password"
      name="password"
      placeholder="رمز عبور"
      value={formData.password}
      onChange={handleChange}
      required
      className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
    />
  </div>

  <button
    type="submit"
    disabled={loading}
    className="w-full bg-blue-600 hover:bg-indigo-700 text-white py-2 rounded-xl font-semibold transition duration-300 shadow-md"
  >
    {loading ? "در حال ورود..." : "ورود"}
  </button>
</form>

  );
}
