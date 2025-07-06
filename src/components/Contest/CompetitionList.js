import React, { useEffect, useState } from "react";
import { getDatabase, ref, onValue, remove } from "firebase/database";

const CompetitionList = () => {
  const [competitions, setCompetitions] = useState([]);
  const [users, setUsers] = useState({});

  useEffect(() => {
    const db = getDatabase();

    // دریافت اطلاعات مسابقه‌ها
    const competitionsRef = ref(db, "contests");
    onValue(competitionsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.entries(data).map(([id, comp]) => ({
          id,
          ...comp,
        }));
        setCompetitions(list);
      } else {
        setCompetitions([]);
      }
    });

    // دریافت لیست کاربران برای نمایش نام ایجادکننده‌ها
    const usersRef = ref(db, "users");
    onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) setUsers(data);
    });
  }, []);

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("fa-IR") + " - " + date.toLocaleTimeString("fa-IR");
  };

  const handleDelete = (id) => {
    if (window.confirm("آیا از حذف این مسابقه مطمئن هستید؟")) {
      const db = getDatabase();
      remove(ref(db, `contests/${id}`));
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">لیست مسابقه‌ها</h1>

      {competitions.length === 0 ? (
        <p>هنوز هیچ مسابقه‌ای برگزار نشده است.</p>
      ) : (
        <div className="grid gap-4">
          {competitions.map((comp) => {
            const creator = users[comp.createdBy];
            return (
              <div
                key={comp.id}
                className="border p-4 rounded-lg shadow hover:shadow-md transition relative"
              >
                <h2 className="text-lg font-bold mb-1">نوع مسابقه: {comp.type}</h2>
                <p className="text-gray-700 mb-1">سؤال: {comp.question}</p>
                <p className="text-gray-700 mb-1">
                  ایجادکننده:{" "}
                  {creator
                    ? `${creator.firstName} ${creator.lastName}`
                    : "نامشخص"}
                </p>
                <p className="text-gray-700 mb-1">
                  تعداد برنده‌ها تا حالا: {Object.keys(comp.winners || {}).length}
                </p>
                <p className="text-gray-600 text-sm mb-3">
                  تاریخ برگزاری: {formatDate(comp.createdAt)}
                </p>
                <button
                  onClick={() => handleDelete(comp.id)}
                  className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm"
                >
                  حذف
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CompetitionList;
