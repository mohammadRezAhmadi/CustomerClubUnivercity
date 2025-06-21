import React, { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { getDatabase, ref, onValue, remove } from "firebase/database";
import { useNavigate } from "react-router-dom";

const AdminChatGroups = () => {
  const [chatGroups, setChatGroups] = useState([]);
  const auth = getAuth();
  const db = getDatabase();
  const navigate = useNavigate();
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) return;

    const chatsRef = ref(db, "chats");
    onValue(chatsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const groups = Object.entries(data)
          .filter(([_, group]) => group.users?.includes(user.uid))
          .map(([key, group]) => ({
            id: key,
            ...group,
          }));
        setChatGroups(groups);
      }
    });
  }, [user]);

  const handleDeleteGroup = async (groupId) => {
    if (!window.confirm("آیا از حذف این گروه مطمئن هستید؟")) return;

    try {
      await remove(ref(db, `chats/${groupId}`));
      alert("گروه با موفقیت حذف شد.");
    } catch (err) {
      console.error("خطا در حذف گروه:", err);
      alert("مشکلی در حذف گروه وجود دارد.");
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">گروه‌های چت من (مدیر)</h1>

      {chatGroups.length === 0 ? (
        <p className="text-gray-600">هیچ گروهی پیدا نشد.</p>
      ) : (
        <div className="grid gap-4">
          {chatGroups.map((group) => (
            <div
              key={group.id}
              className="bg-white shadow rounded-lg p-4 flex justify-between items-center"
            >
              <div>
                <h2 className="text-lg font-semibold">{group.groupName}</h2>
                <p className="text-sm text-gray-500">
                  اعضا: {group.users?.length || 0}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => navigate(`/group-chat/${group.id}`)}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  ورود به چت
                </button>
                <button
                  onClick={() => handleDeleteGroup(group.id)}
                  className="bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600"
                >
                  حذف گروه
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminChatGroups;
