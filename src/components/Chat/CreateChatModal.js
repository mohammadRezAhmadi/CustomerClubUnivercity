import React, { useEffect, useState } from "react";
import { getDatabase, ref, push, onValue } from "firebase/database";
import { useNavigate } from "react-router-dom";

const CreateChatModal = ({ onClose }) => {
  const [groupName, setGroupName] = useState("");
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const db = getDatabase();
    const usersRef = ref(db, "users");
    onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const userList = Object.keys(data).map((key) => ({
          uid: key,
          ...data[key],
        }));
        setUsers(userList);
      }
    });
  }, []);

  const handleToggleUser = (uid) => {
    setSelectedUsers((prev) =>
      prev.includes(uid) ? prev.filter((id) => id !== uid) : [...prev, uid]
    );
  };

  const handleCreateChat = async () => {
    if (!groupName || selectedUsers.length < 1) {
      alert("نام گروه را وارد کرده و حداقل یک عضو انتخاب کنید.");
      return;
    }

    const db = getDatabase();
    const newChatRef = await push(ref(db, "chats"), {
      groupName,
      users: selectedUsers,
      messages: [],
      createdAt: Date.now(),
    });

    onClose(); // بستن مودال
    navigate(`/group-chat/${newChatRef.key}`); // رفتن به صفحه چت گروهی
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded p-6 w-[90%] max-w-md shadow-xl">
        <h2 className="text-xl font-bold mb-4">ایجاد چت گروهی</h2>

        <input
          type="text"
          className="border p-2 w-full rounded mb-4"
          placeholder="نام گروه را وارد کنید"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
        />

        <div className="max-h-48 overflow-y-auto mb-4 border rounded p-2">
          {users.map((user) => (
            <label key={user.uid} className="block">
              <input
                type="checkbox"
                checked={selectedUsers.includes(user.uid)}
                onChange={() => handleToggleUser(user.uid)}
                className="mr-2"
              />
              {user.firstName} {user.lastName} ({user.role})
            </label>
          ))}
        </div>

        <div className="flex justify-between">
          <button
            onClick={handleCreateChat}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            ایجاد چت
          </button>
          <button
            onClick={onClose}
            className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
          >
            انصراف
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateChatModal;
