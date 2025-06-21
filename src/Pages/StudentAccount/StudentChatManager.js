import React, { useEffect, useState } from "react";
import {
  getDatabase,
  ref,
  onValue,
  push,
  get,
  remove,
  update,
} from "firebase/database";
import { getAuth } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const StudentChatManager = () => {
  const [chatGroups, setChatGroups] = useState([]);
  const [managers, setManagers] = useState([]);
  const [selectedManager, setSelectedManager] = useState("");
  const [description, setDescription] = useState("");
  const [showModal, setShowModal] = useState(false);

  const navigate = useNavigate();
  const auth = getAuth();
  const db = getDatabase();
  const user = auth.currentUser;

  // لیست چت‌هایی که دانشجو عضو آن‌هاست
  useEffect(() => {
    if (user) {
      const userChatsRef = ref(db, "chats");
      onValue(userChatsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const userGroups = Object.entries(data)
            .filter(([_, group]) => group.users?.includes(user.uid))
            .map(([key, group]) => ({
              id: key,
              ...group,
            }));
          setChatGroups(userGroups);
        }
      });
    }
  }, [user]);

  // گرفتن لیست مدیران
  useEffect(() => {
    const usersRef = ref(db, "users");
    get(usersRef).then((snapshot) => {
      const data = snapshot.val();
      if (data) {
        const managersList = Object.entries(data)
          .filter(([_, user]) => user.role === "admin")
          .map(([uid, user]) => ({
            uid,
            fullName: `${user.firstName} ${user.lastName}`,
          }));
        setManagers(managersList);
      }
    });
  }, []);

  const sendChatRequest = () => {
    if (!selectedManager || !description) return;

    const requestRef = ref(db, "chatRequests");
    push(requestRef, {
      from: user.uid,
      to: selectedManager,
      description,
      status: "pending",
      timestamp: Date.now(),
    });

    setShowModal(false);
    setSelectedManager("");
    setDescription("");
    alert("درخواست شما ارسال شد.");
  };

  const handleLeaveGroup = async (chatId) => {
    if (!window.confirm("آیا مطمئن هستید که می‌خواهید این گروه را ترک کنید؟"))
      return;

    const chatRef = ref(db, `chats/${chatId}`);
    const snapshot = await get(chatRef);

    if (snapshot.exists()) {
      const chatData = snapshot.val();
      const updatedMembers = (chatData.users || []).filter(
        (uid) => uid !== user.uid
      );

      // اگر اعضا خالی شد، کل گروه حذف شود
      if (updatedMembers.length === 0) {
        await remove(chatRef);
      } else {
        await update(chatRef, { users: updatedMembers });
      }
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">مدیریت چت‌های من</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          درخواست چت
        </button>
      </div>

      {/* لیست چت‌ها */}
      {chatGroups.length === 0 ? (
        <p>هنوز در هیچ چتی عضو نیستید.</p>
      ) : (
        <div className="grid gap-4">
          {chatGroups.map((chat) => (
            <div
              key={chat.id}
              className="border rounded-lg p-4 flex justify-between items-center shadow hover:shadow-md transition"
            >
              <div>
                <h2 className="font-semibold text-lg">{chat.groupName}</h2>
                <p className="text-sm text-gray-600">
                  مدیر گروه: {chat.adminName || "نامشخص"}
                </p>
              </div>
              <div className="flex gap-3">
              <button
                onClick={() => navigate(`/group-chat/${chat.id}`)}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                ورود به چت
              </button>
              <button
                onClick={() => handleLeaveGroup(chat.id)}
                className="bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600"
              >
                ترک گروه
              </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* مودال درخواست چت */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg relative">
            <h2 className="text-xl font-bold mb-4">درخواست چت جدید</h2>

            <label className="block mb-2 font-medium">توضیح/عنوان</label>
            <textarea
              className="w-full border p-2 rounded mb-4"
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="مثلاً: سوال درباره جشنواره‌ها"
            />

            <label className="block mb-2 font-medium">انتخاب مدیر</label>
            <select
              className="w-full border p-2 rounded mb-4"
              value={selectedManager}
              onChange={(e) => setSelectedManager(e.target.value)}
            >
              <option value="">-- انتخاب کنید --</option>
              {managers.map((manager) => (
                <option key={manager.uid} value={manager.uid}>
                  {manager.fullName}
                </option>
              ))}
            </select>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border rounded"
              >
                انصراف
              </button>
              <button
                onClick={sendChatRequest}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                ارسال درخواست
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentChatManager;
