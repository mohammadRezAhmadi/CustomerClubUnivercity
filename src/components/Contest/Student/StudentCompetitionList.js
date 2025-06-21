import React, { useEffect, useState } from "react";
import { getDatabase, ref, onValue } from "firebase/database";
import { getAuth } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const StudentCompetitionList = () => {
  const [competitions, setCompetitions] = useState([]);
  const [joinedIds, setJoinedIds] = useState([]);
  const auth = getAuth();
  const user = auth.currentUser;
  const db = getDatabase();
  const navigate = useNavigate();

  useEffect(() => {
    const compRef = ref(db, "contests");
    onValue(compRef, (snapshot) => {
      const data = snapshot.val() || {};
      const list = Object.entries(data).map(([id, comp]) => ({
        id,
        ...comp,
      }));
      setCompetitions(list);
    });

    // لیست مسابقاتی که دانشجو شرکت کرده
    const joinedRef = ref(db, `competitionResults/${user.uid}`);
    onValue(joinedRef, (snapshot) => {
      const data = snapshot.val() || {};
      setJoinedIds(Object.keys(data));
    });
  }, [user]);

  const formatDate = (ts) => {
    return new Date(ts).toLocaleDateString("fa-IR") + " - " + new Date(ts).toLocaleTimeString("fa-IR");
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">مسابقات فعال</h1>

      <div className="grid gap-6">
        {competitions.length === 0 ? (
          <p>هیچ مسابقه‌ای یافت نشد.</p>
        ) : (
          competitions.map((comp) => {
            const joined = joinedIds.includes(comp.id);
            return (
              <div
                key={comp.id}
                className="border rounded-xl shadow-md p-5 bg-white hover:shadow-lg transition"
              >
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-xl font-semibold text-blue-700">
                    {comp.type || "بدون عنوان"}
                  </h2>
                  <span className="text-sm text-gray-500">
                    تاریخ برگزاری: {formatDate(comp.createdAt)}
                  </span>
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  پاداش: <strong>{comp.points} امتیاز</strong>
                </div>

                <div className="text-sm text-gray-600 mb-2">
                  حداکثر برنده:{" "}
                  {comp.winnerLimitType === "unlimited"
                    ? "نامحدود"
                    : `${comp.maxWinners} نفر`}{" "}
                  | برنده‌شدگان فعلی: <strong>{comp.winners?.length || 0}</strong>
                </div>

                <div className="mt-4">
                  <button
                    disabled={joined}
                    onClick={() => navigate(`/competition/${comp.id}`)}
                    className={`px-5 py-2 rounded ${
                      joined
                        ? "bg-gray-400 text-white cursor-not-allowed"
                        : "bg-green-600 text-white hover:bg-green-700"
                    }`}
                  >
                    {joined ? "شما قبلاً شرکت کرده‌اید" : "شرکت در مسابقه"}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default StudentCompetitionList;
