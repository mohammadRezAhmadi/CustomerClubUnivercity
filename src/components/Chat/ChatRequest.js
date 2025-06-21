import React, { useEffect, useState } from "react";
import {
  getDatabase,
  ref,
  onValue,
  remove,
  get,
  child,
} from "firebase/database";

const ChatRequest = () => {
  const [requests, setRequests] = useState([]);
  const [students, setStudents] = useState({});

  const db = getDatabase();

  // دریافت لیست کاربران
  useEffect(() => {
    const usersRef = ref(db, "users");
    get(usersRef).then((snapshot) => {
      if (snapshot.exists()) {
        setStudents(snapshot.val());
      }
    });
  }, []);

  // دریافت درخواست‌های چت
  useEffect(() => {
    const requestRef = ref(db, "chatRequests");
    onValue(requestRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.entries(data).map(([id, req]) => ({
          id,
          ...req,
        }));
        setRequests(list);
      } else {
        setRequests([]);
      }
    });
  }, []);

  const handleMarkAsRead = (id) => {
    const reqRef = ref(db, `chatRequests/${id}`);
    remove(reqRef);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">درخواست‌های چت دانشجویان</h1>

      {requests.length === 0 ? (
        <p>درخواستی وجود ندارد.</p>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => {
            const student = students[req.from];
            const fullName = student
              ? `${student.firstName} ${student.lastName}`
              : "دانشجوی ناشناس";

            return (
              <div
                key={req.id}
                className="border p-4 rounded shadow flex justify-between items-center"
              >
                <div>
                  <h2 className="font-semibold">{fullName}</h2>
                  <p className="text-gray-700 mt-1">{req.description}</p>
                </div>
                <button
                  onClick={() => handleMarkAsRead(req.id)}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  خوانده شد
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ChatRequest;
