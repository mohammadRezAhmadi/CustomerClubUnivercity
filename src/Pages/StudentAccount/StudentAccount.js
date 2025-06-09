import React, { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { getDatabase, ref, onValue, update } from "firebase/database";
import { useNavigate } from "react-router-dom";

const StudentAccounts = () => {
  const [studentData, setStudentData] = useState(null);
  const [festivals, setFestivals] = useState([]);
  const [message, setMessage] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth();
    const db = getDatabase();
    const user = auth.currentUser;

    if (user) {
      const userRef = ref(db, `users/${user.uid}`);
      onValue(userRef, (snapshot) => {
        setStudentData(snapshot.val());
      });

      const festivalsRef = ref(db, "festivals");
      onValue(festivalsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const festivalList = Object.keys(data).map((key) => ({
            id: key,
            ...data[key],
          }));
          setFestivals(festivalList);
        }
      });
    }
  }, []);

  const handleLogout = () => {
    const auth = getAuth();
    auth.signOut();
    navigate("/sign");
  };

  const handleJoinFestival = async (festival) => {
    const db = getDatabase();
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user || !studentData) return;

    const currentPoints = studentData.score || 0;
    const alreadyJoined = studentData.joinedFestivals?.includes(festival.id);

    if (alreadyJoined) {
      setMessage("شما قبلاً در این جشنواره ثبت‌نام کرده‌اید.");
      return;
    }

    if (currentPoints < festival.pointsRequired) {
      setMessage("امتیاز شما برای ثبت‌نام در این جشنواره کافی نیست.");
      return;
    }

    const updatedPoints = currentPoints - festival.pointsRequired;
    const updatedFestivals = studentData.joinedFestivals
      ? [...studentData.joinedFestivals, festival.id]
      : [festival.id];

    const userRef = ref(db, `users/${user.uid}`);
    await update(userRef, {
      score: updatedPoints,
      joinedFestivals: updatedFestivals,
    });

    setStudentData((prev) => ({
      ...prev,
      score: updatedPoints,
      joinedFestivals: updatedFestivals,
    }));

    setMessage(`جشنواره "${festival.festivalName}" با موفقیت به سبد شما اضافه شد.`);
  };

  return (
    <div className="flex h-screen relative">
      {/* سایدبار با انیمیشن و ارتفاع کامل */}
      <div
        className={`fixed top-0 right-0 h-full bg-gray-800 text-white p-4 z-20 transition-all duration-300 ease-in-out ${
          sidebarOpen ? "w-64" : "w-0 -right-20 overflow-hidden"
        }`}
      >
        <div className="flex flex-col h-full justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold whitespace-nowrap">
                {studentData?.firstName} {studentData?.lastName}
              </h2>
              <button
                onClick={() => setSidebarOpen(false)}
                className="text-white text-2xl"
              >
                ×
              </button>
            </div>
            <p className="mb-2">نقش: دانشجو</p>
            <p className="mb-4">امتیاز: {studentData?.score || 0}</p>
            <button
              onClick={() => navigate("/myFestivales")}
              className="bg-blue-600 w-full py-2 rounded mb-4"
            >
              جشنواره‌های من
            </button>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-600 py-2 rounded w-full"
          >
            خروج از حساب
          </button>
        </div>
      </div>

      {/* محتوای اصلی با فاصله از سایدبار */}
      <div
        className={`flex-1 p-6 transition-all duration-300 ease-in-out ${
          sidebarOpen ? "mr-64" : "mr-0"
        }`}
      >
        {/* دکمه تاگل سایدبار */}
        <button
          className="bg-gray-700 text-white px-4 py-2 rounded mb-6"
          onClick={() => setSidebarOpen((prev) => !prev)}
        >
          حساب کاربری من
        </button>

        <h1 className="text-2xl font-bold mb-4">لیست جشنواره‌ها</h1>
        {message && <p className="text-green-600 mb-4">{message}</p>}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {festivals.map((festival) => (
            <div
              key={festival.id}
              className="border border-gray-300 rounded-lg p-4 shadow-md flex flex-col justify-between hover:shadow-lg transition-shadow"
            >
              <div>
                <h3 className="text-lg font-bold mb-2">
                  {festival.festivalName}
                </h3>
                <p className="text-sm mb-1">
                  امتیاز لازم: {festival.pointsRequired}
                </p>
                <p className="text-sm text-gray-600">
                  {festival.description || "توضیحی ثبت نشده."}
                </p>
              </div>
              <button
                className="bg-green-500 text-white py-2 mt-4 rounded hover:bg-green-600"
                onClick={() => handleJoinFestival(festival)}
              >
                افزودن به سبد
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudentAccounts;
