import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import {
  getDatabase,
  ref,
  onValue,
  set,
  get,
  update,
} from "firebase/database";

const EnterCompetition = () => {
  const { id } = useParams();
  const auth = getAuth();
  const user = auth.currentUser;
  const db = getDatabase();
  const navigate = useNavigate();

  const [competition, setCompetition] = useState(null);
  const [selected, setSelected] = useState(null);
  const [status, setStatus] = useState(""); // success / fail / already

  useEffect(() => {
    const compRef = ref(db, `contests/${id}`);
    onValue(compRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setCompetition(data);
      }
    });

    const resultRef = ref(db, `competitionResults/${user.uid}/${id}`);
    onValue(resultRef, (snapshot) => {
      if (snapshot.exists()) {
        setStatus("already");
      }
    });
  }, [id, user.uid]);

  const handleSubmit = async () => {
    if (selected === null || status === "already") return;

    const isCorrect = selected === competition.correctIndex;
    console.log( selected , competition.answers[selected] , competition.correctIndex)
    await set(ref(db, `competitionResults/${user.uid}/${id}`), {
      selected,
      isCorrect,
      timestamp: Date.now(),
    });

    if (isCorrect) {
      // ثبت کاربر در لیست برنده‌ها
      const winnersRef = ref(db, `competitions/${id}/winners`);
      const snapshot = await get(winnersRef);
      const currentWinners = snapshot.val() || {};
      const currentCount = Object.keys(currentWinners).length;

      const maxWinners = competition.winnerLimitType || Infinity;

      if (currentCount < maxWinners) {
        await set(ref(db, `competitions/${id}/winners/${user.uid}`), {
          uid: user.uid,
        });

        // گرفتن امتیاز فعلی دانشجو
        const userRef = ref(db, `users/${user.uid}`);
        console.log(userRef)
        const userSnap = await get(userRef);
        const userData = userSnap.val() || {};

        const currentScore = userData.score || 0;
        const reward = competition.points || 0;

        // اضافه کردن پاداش به امتیاز
        await update(userRef, {
          score: currentScore + reward,
        });
      }
    }

    setStatus(isCorrect ? "success" : "fail");
  };

  if (!competition) return <p className="p-6">در حال بارگذاری مسابقه...</p>;

  return (
    <div className="max-w-2xl mx-auto mt-10 bg-white p-6 rounded-xl shadow-lg">
      <h1 className="text-2xl font-bold mb-4 text-center">🎯 چیستان</h1>
      <p className="mb-4 text-gray-700 text-center">سؤال: {competition.question}</p>

      <div className="grid gap-3">
        {competition.answers.map((ans, idx) => (
          <button
            key={idx}
            className={`border p-3 rounded text-right transition ${
              selected === idx ? "bg-blue-600 text-white" : "hover:bg-blue-100"
            }`}
            onClick={() => setSelected(idx)}
            disabled={status === "already" || status === "success" || status === "fail"}
          >
            {ans}
          </button>
        ))}
      </div>

      <div className="mt-6 text-center">
        <button
          onClick={handleSubmit}
          disabled={selected === null || status === "already"}
          className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:bg-gray-400"
        >
          ارسال پاسخ
        </button>
      </div>

      <div className="mt-4 text-center">
        {status === "success" && (
          <p className="text-green-600 font-semibold">
            ✅ پاسخ درست بود! امتیاز {competition.reward} به شما افزوده شد.
          </p>
        )}
        {status === "fail" && (
          <p className="text-red-600 font-semibold">❌ متأسفانه پاسخ اشتباه بود.</p>
        )}
        {status === "already" && (
          <p className="text-yellow-600 font-semibold">⚠️ شما قبلاً در این مسابقه شرکت کرده‌اید.</p>
        )}
      </div>
    </div>
  );
};

export default EnterCompetition;
