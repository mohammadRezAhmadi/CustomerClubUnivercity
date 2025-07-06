import { useState } from "react";
import { ref, set , get } from "firebase/database"; 
import { auth, db } from "../../firebaseConfig";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [role, setRole] = useState("student");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "", // اضافه‌شده
    personnelCode: "",
    studentCode: "",
    major: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  if (formData.password !== formData.confirmPassword) {
    alert("رمز عبور و تکرار آن یکسان نیستند!");
    setLoading(false);
    return;
  }

  // اگر نقش دانشجو بود، بررسی کد دانشجویی
  if (role === "student") {
    const studentCode = formData.studentCode.trim();

    // بررسی طول ۱۳ رقمی
    if (!/^\d{13}$/.test(studentCode)) {
      alert("کد دانشجویی باید دقیقاً ۱۳ رقم باشد.");
      setLoading(false);
      return;
    }

    // بررسی تکراری نبودن در دیتابیس
    const studentsRef = ref(db, "users");
    const snapshot = await get(studentsRef);
    const users = snapshot.val();

    const isDuplicate = Object.values(users || {}).some(
      (u) => u.role === "student" && u.studentCode === studentCode
    );

    if (isDuplicate) {
      alert("این کد دانشجویی قبلاً ثبت شده است.");
      setLoading(false);
      return;
    }
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      formData.email,
      formData.password
    );
    const user = userCredential.user;

    await set(ref(db, "users/" + user.uid), {
      uid: user.uid,
      role,
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      score: 0,
      ...(role === "admin"
        ? { personnelCode: formData.personnelCode }
        : {
            studentCode: formData.studentCode,
            major: formData.major,
          }),
      createdAt: new Date().toISOString(),
    });

    alert("ثبت‌نام با موفقیت انجام شد ✅");
    navigate("/");
  } catch (error) {
    console.error("خطا در ثبت‌نام:", error);
    alert(error.message);
  } finally {
    setLoading(false);
  }
};


  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 max-w-md mx-auto bg-white shadow-lg p-8 rounded-lg shadow-white"
    >
      <h2 className="text-2xl font-semibold text-center text-gray-800">ثبت‌نام</h2>

      <label className="block">
        <span className="text-gray-700">نقش:</span>
        <select
          name="role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="block w-full mt-2 p-2 rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-400"
        >
          <option value="student">دانشجو</option>
          <option value="admin">مدیر</option>
        </select>
      </label>

      <input
        type="text"
        name="firstName"
        placeholder="نام"
        value={formData.firstName}
        onChange={handleChange}
        className="w-full p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400"
        required
      />

      <input
        type="text"
        name="lastName"
        placeholder="نام خانوادگی"
        value={formData.lastName}
        onChange={handleChange}
        className="w-full p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400"
        required
      />

      <input
        type="email"
        name="email"
        placeholder="ایمیل"
        value={formData.email}
        onChange={handleChange}
        className="w-full p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400"
        required
      />

      <input
        type="password"
        name="password"
        placeholder="رمز عبور"
        value={formData.password}
        onChange={handleChange}
        className="w-full p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400"
        required
      />

      <input
        type="password"
        name="confirmPassword"
        placeholder="تکرار رمز عبور"
        value={formData.confirmPassword}
        onChange={handleChange}
        className="w-full p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400"
        required
      />

      {role === "admin" && (
        <input
          type="text"
          name="personnelCode"
          placeholder="کد پرسنلی"
          value={formData.personnelCode}
          onChange={handleChange}
          className="w-full p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400"
          required
        />
      )}

      {role === "student" && (
        <>
          <input
            type="text"
            name="studentCode"
            placeholder="کد دانشجویی"
            value={formData.studentCode}
            onChange={handleChange}
            className="w-full p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400"
            required
          />
          <input
            type="text"
            name="major"
            placeholder="رشته تحصیلی"
            value={formData.major}
            onChange={handleChange}
            className="w-full p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400"
            required
          />
        </>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-400"
      >
        {loading ? "در حال ثبت‌نام..." : "ثبت‌نام"}
      </button>
    </form>
  );
}
