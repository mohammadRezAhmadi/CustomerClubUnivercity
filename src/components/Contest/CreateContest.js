import React, { useState } from "react";
import { getDatabase, push, ref } from "firebase/database";
import { getAuth } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const CreateContest = () => {
  const [question, setQuestion] = useState("");
  const [answers, setAnswers] = useState([""]);
  const [correctIndex, setCorrectIndex] = useState(null);
  const [points, setPoints] = useState(1);
  const [winnerLimitType, setWinnerLimitType] = useState("unlimited");
  const [maxWinners, setMaxWinners] = useState("");

  const auth = getAuth();
  const db = getDatabase();
  const navigate = useNavigate();

  const handleAddAnswer = () => {
    setAnswers([...answers, ""]);
  };

  const handleRemoveAnswer = (index) => {
    const newAnswers = answers.filter((_, i) => i !== index);
    setAnswers(newAnswers);
    if (correctIndex === index) setCorrectIndex(null);
    else if (correctIndex > index) setCorrectIndex(correctIndex - 1);
  };

  const handleAnswerChange = (value, index) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  const handleSubmit = async () => {
    const user = auth.currentUser;
    if (!user) return;

    if (!question || answers.length < 2 || correctIndex === null) {
      alert("لطفاً تمام فیلدها را پر کنید و یک پاسخ درست انتخاب کنید.");
      return;
    }

    const contestRef = ref(db, "contests");
    await push(contestRef, {
      type: "چیستان",
      question,
      answers,
      correctIndex,
      points: Number(points),
      winnerLimitType,
      maxWinners: winnerLimitType === "limited" ? Number(maxWinners) : null,
      createdAt: Date.now(),
      createdBy: user.uid,
    });

    alert("مسابقه با موفقیت ثبت شد");
    navigate("/DashboardAdmin");
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow rounded-lg mt-10">
      <h1 className="text-xl font-bold mb-4">ایجاد مسابقه (چیستان)</h1>

      <label className="block font-medium mb-2">سوال چیستان</label>
      <textarea
        className="w-full border p-2 rounded mb-4"
        rows="3"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
      />

      <div className="mb-4">
        <label className="block font-medium mb-2">پاسخ‌ها:</label>
        {answers.map((ans, index) => (
          <div key={index} className="flex items-center gap-2 mb-2">
            <input
              type="radio"
              name="correctAnswer"
              checked={correctIndex === index}
              onChange={() => setCorrectIndex(index)}
            />
            <input
              className="flex-1 border px-3 py-1 rounded"
              value={ans}
              onChange={(e) => handleAnswerChange(e.target.value, index)}
              placeholder={`پاسخ ${index + 1}`}
            />
            {answers.length > 1 && (
              <button
                onClick={() => handleRemoveAnswer(index)}
                className="text-red-600 text-sm"
              >
                حذف
              </button>
            )}
          </div>
        ))}
        <button
          onClick={handleAddAnswer}
          className="text-blue-600 text-sm mt-2"
        >
          + افزودن پاسخ جدید
        </button>
      </div>

      <div className="mb-4">
        <label className="block font-medium mb-2">امتیاز پاسخ درست</label>
        <input
          type="number"
          className="w-full border p-2 rounded"
          value={points}
          onChange={(e) => setPoints(e.target.value)}
        />
      </div>

      <div className="mb-4">
        <label className="block font-medium mb-2">نوع برنده‌ها</label>
        <select
          className="w-full border p-2 rounded"
          value={winnerLimitType}
          onChange={(e) => setWinnerLimitType(e.target.value)}
        >
          <option value="unlimited">نامحدود</option>
          <option value="limited">محدود</option>
        </select>
      </div>

      {winnerLimitType === "limited" && (
        <div className="mb-4">
          <label className="block font-medium mb-2">تعداد برندگان</label>
          <input
            type="number"
            className="w-full border p-2 rounded"
            value={maxWinners}
            onChange={(e) => setMaxWinners(e.target.value)}
          />
        </div>
      )}

      <button
        onClick={handleSubmit}
        className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
      >
        ذخیره مسابقه
      </button>
    </div>
  );
};

export default CreateContest;
