import React, { useEffect, useState } from "react";
import { getDatabase, ref, onValue, remove, update } from "firebase/database";

const ManageClient = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [scoreInput, setScoreInput] = useState("");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const db = getDatabase();
    const usersRef = ref(db, "users");

    const unsubscribe = onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const studentList = Object.entries(data)
          .filter(([_, user]) => user.role === "student")
          .map(([id, user]) => ({
            id,
            ...user,
            avatarUrl: `./images/Profile_avatar_placeholder_large.png`,
          }));
        setStudents(studentList);
      } else {
        setStudents([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleDeleteStudent = async (studentId) => {
    const confirmDelete = window.confirm("آیا از حذف این دانشجو مطمئن هستید؟");
    if (!confirmDelete) return;

    try {
      const db = getDatabase();
      await remove(ref(db, `users/${studentId}`));
      alert("دانشجو با موفقیت حذف شد.");
    } catch (error) {
      console.error("خطا در حذف دانشجو:", error);
      alert("مشکلی در حذف دانشجو پیش آمد.");
    }
  };

  const openScoreModal = (student) => {
    setSelectedStudent(student);
    setScoreInput("");
    setShowModal(true);
  };

  const handleScoreSubmit = async () => {
    if (!scoreInput || isNaN(scoreInput)) {
      alert("لطفاً یک عدد معتبر وارد کنید.");
      return;
    }

    try {
      const db = getDatabase();
      const newScore = parseInt(scoreInput);
      await update(ref(db, `users/${selectedStudent.id}`), {
        score: newScore,
      });
      setShowModal(false);
      alert("امتیاز با موفقیت ثبت شد.");
    } catch (error) {
      console.error("خطا در ثبت امتیاز:", error);
      alert("مشکلی در ثبت امتیاز پیش آمد.");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">📚 مدیریت دانشجویان</h2>

      {students.length === 0 ? (
        <p className="text-gray-500">هیچ دانشجویی یافت نشد.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {students.map((student) => (
            <div
              key={student.id}
              className="bg-white rounded-2xl shadow-md p-5 relative transition hover:shadow-xl border border-gray-200"
            >
              {/* آواتار و اطلاعات */}
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={student.avatarUrl}
                  alt="avatar"
                  className="w-14 h-14 rounded-full border-2 border-blue-500 shadow"
                />
                <div>
                  <h4 className="text-lg font-bold text-gray-800">
                    {student.firstName} {student.lastName}
                  </h4>
                  <p className="text-sm text-gray-500">نقش: {student.role}</p>
                  <p className="text-sm text-green-600 mt-1">امتیاز: {student.score || 0}</p>
                </div>
              </div>

              {/* دکمه‌ها */}
              <div className="flex justify-between items-center mt-3">
                <button
                  onClick={() => handleDeleteStudent(student.id)}
                  className="text-red-600 hover:text-red-800 text-sm font-semibold hover:underline"
                >
                  حذف دانشجو ✖
                </button>
                <button
                  onClick={() => openScoreModal(student)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-semibold hover:underline"
                >
                  افزودن امتیاز ➕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* مودال افزودن امتیاز */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl w-80">
            <h3 className="text-lg font-bold mb-4 text-center">
              افزودن امتیاز برای {selectedStudent.firstName} {selectedStudent.lastName}
            </h3>
            <input
              type="number"
              value={scoreInput}
              onChange={(e) => setScoreInput(e.target.value)}
              placeholder="مقدار امتیاز جدید..."
              className="w-full border border-gray-300 rounded px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <div className="flex justify-between">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
              >
                انصراف
              </button>
              <button
                onClick={handleScoreSubmit}
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
              >
                ثبت امتیاز
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageClient;
