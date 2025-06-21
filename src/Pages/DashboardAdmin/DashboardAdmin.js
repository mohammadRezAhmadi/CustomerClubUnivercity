import React, { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { getDatabase, ref, get, child, set, remove } from "firebase/database";
import { useNavigate } from "react-router-dom";
import { onValue } from "firebase/database";
import { FaTrash, FaEdit } from "react-icons/fa";
import CreateChatModal from "../../components/Chat/CreateChatModal";
import { Trash2 } from "lucide-react";

const getAdminInfo = async (userId) => {
  const db = getDatabase();
  try {
    const dbRef = ref(db);
    const snapshot = await get(child(dbRef, "users/" + userId));
    if (snapshot.exists()) {
      return snapshot.val();
    } else {
      console.log("اطلاعات مدیر یافت نشد.");
      return null;
    }
  } catch (error) {
    console.error("خطا در دریافت اطلاعات:", error);
    return null;
  }
};

const DashboardAdmin = () => {
  const [festivals, setFestivals] = useState([]);
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editId, setEditId] = useState(null); // برای حالت ویرایش
  const [festivalName, setFestivalName] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [pointsRequired, setPointsRequired] = useState("");
  const navigate = useNavigate();
  const [showCreateChat, setShowCreateChat] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const adminInfo = await getAdminInfo(user.uid);
        setAdminData(adminInfo);
        setLoading(false);
      } else {
        console.log("هیچ کاربری وارد نشده است.");
        setLoading(false);
      }
    });
  }, []);
  useEffect(() => {
    const db = getDatabase();
    const festivalsRef = ref(db, "festivals");

    const unsubscribe = onValue(festivalsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const festivalList = Object.entries(data).map(([id, value]) => ({
          id,
          ...value,
        }));
        setFestivals(festivalList);
      } else {
        setFestivals([]);
      }
    });

    return () => unsubscribe(); // برای پاکسازی
  }, []);

  const handleLogout = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("خطا در خروج از حساب:", error);
    }
  };

  const handleDeleteFestival = async (id) => {
    const confirmDelete = window.confirm("آیا از حذف این جشنواره مطمئنی؟");
    if (!confirmDelete) return;

    try {
      const db = getDatabase();
      await remove(ref(db, `festivals/${id}`));
      setFestivals((prev) => prev.filter((f) => f.id !== id));
      alert("جشنواره با موفقیت حذف شد.");
    } catch (error) {
      console.error("خطا در حذف جشنواره:", error);
      alert("مشکلی در حذف جشنواره پیش آمد.");
    }
  };
  const handleEditFestival = (festival) => {
    setFestivalName(festival.festivalName);
    setDate(festival.date);
    setDescription(festival.description);
    setPointsRequired(festival.pointsRequired);
    setEditId(festival.id); // یک state جدید برای شناسایی اینکه در حالت ویرایش هستی
    setIsFormOpen(true);
  };
  const resetForm = () => {
    setFestivalName("");
    setDate("");
    setDescription("");
    setPointsRequired("");
    setEditId(null);
    setIsFormOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const db = getDatabase();
    const auth = getAuth();
    const user = auth.currentUser;

    const festivalData = {
      festivalName,
      date,
      description,
      pointsRequired,
      createdBy: user.uid,
    };

    try {
      if (editId) {
        // ✅ فقط ویرایش کن
        const updateRef = ref(db, `festivals/${editId}`);
        await set(updateRef, festivalData);
        alert("جشنواره با موفقیت ویرایش شد!");
      } else {
        // ✅ فقط اگر editId نبود، جشنواره جدید بساز
        const newRef = ref(db, "festivals/" + Date.now());
        await set(newRef, festivalData);
        alert("جشنواره با موفقیت اضافه شد!");
      }

      resetForm(); // فرم رو پاک کن و حالت ویرایش رو ببند
    } catch (error) {
      console.error("خطا در ذخیره داده‌ها:", error);
      alert("مشکلی در ذخیره داده‌ها پیش آمد.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>در حال بارگذاری...</div>;
  if (!adminData) return <div>اطلاعات مدیر یافت نشد</div>;

  return (
    <div>
      <div className="flex">
        {/* سایدبار */}
        <div
          className={`fixed top-0 right-0 h-full bg-gray-800 text-white p-4 transform transition-transform duration-300 ease-in-out ${
            isSidebarOpen ? "translate-x-0" : "translate-x-full"
          }`}
          style={{ zIndex: 1001 }}
        >
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="absolute top-4 left-4 text-white text-2xl"
          >
            ×
          </button>

          <div className="text-xl font-bold">
            {adminData.firstName} {adminData.lastName}
          </div>
          <div className="mt-2">کدپرسنلی: {adminData.personnelCode}</div>
          <div className="mt-1">نقش: {adminData.role}</div>

          {/* دکمه مدیریت دانشجویان */}
          <div className="mt-6">
            <button
              onClick={() => navigate("/manageClient")}
              className="bg-green-600 text-white py-2 px-4 rounded w-full"
            >
              مدیریت دانشجویان
            </button>
          </div>
          <div className="mt-4">
            <button
              onClick={() => setShowCreateChat(true)}
              className="bg-blue-600 w-full py-2 rounded mb-4"
            >
              ایجاد چت گروهی
            </button>
          </div>
          <div className="mt-0">
            <button
              onClick={() => navigate("/chat-requests")}
              className="bg-blue-600 w-full py-2 rounded mb-4"
            >
              درخواست های چت
            </button>
          </div>
          <div className="mt-0">
            <button
              onClick={() => navigate("/admin-chats")}
              className="bg-blue-600 w-full py-2 rounded mb-4"
            >
              چت های من
            </button>
          </div>
          <div className="mt-0">
            <button
              onClick={() => navigate("/create-contest")}
              className="bg-violet-600 w-full py-2 rounded mb-4"
            >
              برگزاری مسابقه
            </button>
          </div>
               <div className="mt-0">
            <button
              onClick={() => navigate("/CompetitionList")}
              className="bg-violet-600 w-full py-2 rounded mb-4"
            >
              مسابقات
            </button>
          </div>
          <div className="mt-4">
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white py-2 px-4 rounded w-full"
            >
              خروج از حساب
            </button>
          </div>
        </div>

        {/* محتوای اصلی */}
        {showCreateChat && (
          <CreateChatModal onClose={() => setShowCreateChat(false)} />
        )}
        <div className="w-full p-4 pl-16">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="bg-blue-600 text-white py-2 px-4 rounded mb-4"
          >
            حساب کاربری
          </button>

          <h2 className="text-2xl">لیست جشنواره‌ها</h2>

          <button
            onClick={() => setIsFormOpen(true)}
            className="mt-4 bg-blue-600 text-white py-2 px-4 rounded"
          >
            افزودن جشنواره
          </button>
        </div>
      </div>
      {isFormOpen && (
        <form
          onSubmit={handleSubmit}
          className="mt-6 p-6 bg-gray-100 rounded shadow"
        >
          <h3 className="text-xl font-bold mb-4">افزودن جشنواره جدید</h3>

          <input
            type="text"
            value={festivalName}
            onChange={(e) => setFestivalName(e.target.value)}
            placeholder="نام جشنواره"
            className="w-full p-2 border rounded mb-4"
            required
          />

          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full p-2 border rounded mb-4"
            required
          />

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="توضیحات جشنواره"
            className="w-full p-2 border rounded mb-4"
            required
          />

          <input
            type="number"
            value={pointsRequired}
            onChange={(e) => setPointsRequired(e.target.value)}
            placeholder="امتیاز لازم برای شرکت"
            className="w-full p-2 border rounded mb-4"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded"
          >
            {loading
              ? "در حال پردازش..."
              : editId
              ? "ویرایش جشنواره"
              : "افزودن جشنواره"}
          </button>
        </form>
      )}
      <div className="mt-10">
        <h3 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">
          🎉 جشنواره‌های فعال
        </h3>

        {festivals.length === 0 ? (
          <p className="text-gray-500 text-center">
            هیچ جشنواره‌ای ثبت نشده است.
          </p>
        ) : (
          <div className="flex flex-wrap gap-6 justify-center">
            {festivals.map((festival) => (
              <div
                key={festival.id}
                className="w-full sm:w-[330px] bg-white rounded-2xl shadow-md p-5 relative transition hover:shadow-lg border-r-4 border-blue-600"
              >
                {/* آیکون‌ها بالا سمت چپ */}
                <div className="absolute top-2 left-2 flex gap-3">
                  <button
                    onClick={() => handleEditFestival(festival)}
                    className="text-yellow-500 hover:text-yellow-600"
                    title="ویرایش"
                  >
                    <FaEdit size={18} />
                  </button>
                  <button
                    onClick={() => handleDeleteFestival(festival.id)}
                    className="text-red-500 hover:text-red-600"
                    title="حذف"
                  >
                    <FaTrash size={18} />
                  </button>
                </div>

                {/* امتیاز بالا سمت راست */}
                <div className="absolute top-2 right-2 bg-blue-100 text-blue-800 px-3 py-1 text-xs rounded-full font-medium">
                  امتیاز: {festival.pointsRequired}
                </div>

                <h4 className="text-lg font-bold text-gray-800 mt-6 mb-1">
                  {festival.festivalName}
                </h4>
                <p className="text-sm text-gray-600">
                  📅 تاریخ: <span className="font-medium">{festival.date}</span>
                </p>
                <p className="text-sm text-gray-700 mt-2 leading-relaxed line-clamp-3">
                  {festival.description}
                </p>

                <div className="mt-4 text-right">
                  <button className="text-sm text-blue-600 hover:underline">
                    مشاهده جزئیات
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardAdmin;
