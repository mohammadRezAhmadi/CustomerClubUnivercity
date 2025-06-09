import React, { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { getDatabase, ref, onValue, update, remove } from "firebase/database";
import { useNavigate } from "react-router-dom";

const JoinFestivales = () => {
  const [studentData, setStudentData] = useState(null);
  const [festivals, setFestivals] = useState([]);
  const [message, setMessage] = useState("");
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

  const handleDeleteFestival = async (festivalId) => {
    const db = getDatabase();
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user || !studentData) return;

    // حذف جشنواره از سبد دانشجو
    const updatedFestivals = studentData.joinedFestivals.filter(
      (id) => id !== festivalId
    );

    // به‌روزرسانی دیتابیس
    const userRef = ref(db, `users/${user.uid}`);
    await update(userRef, {
      joinedFestivals: updatedFestivals,
    });

    setStudentData((prev) => ({
      ...prev,
      joinedFestivals: updatedFestivals,
    }));

    setMessage("جشنواره با موفقیت از سبد شما حذف شد.");
  };

  return (
    <div className="flex h-screen">

      <div className="flex-1 p-6 overflow-y-auto">
        <h1 className="text-2xl font-bold mb-4">جشنواره‌های من</h1>
        {message && <p className="text-green-600 mb-4">{message}</p>}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {studentData?.joinedFestivals?.map((festivalId) => {
            const festival = festivals.find((f) => f.id === festivalId);
            if (!festival) return null;

            return (
              <div
                key={festival.id}
                className="border border-gray-300 rounded-lg p-4 shadow-md flex flex-col justify-between hover:shadow-lg transition-shadow"
              >
                <div>
                  <h3 className="text-lg font-bold mb-2">
                    {festival.festivalName}
                  </h3>
                  <p className="text-sm mb-1">امتیاز لازم: {festival.pointsRequired}</p>
                  <p className="text-sm text-gray-600">
                    {festival.description || "توضیحی ثبت نشده."}
                  </p>
                </div>
                <button
                  className="bg-red-500 text-white py-2 mt-4 rounded hover:bg-red-600"
                  onClick={() => handleDeleteFestival(festival.id)}
                >
                  حذف از سبد
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default JoinFestivales;
