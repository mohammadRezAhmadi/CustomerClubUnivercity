import React, { useEffect, useState } from "react";
import { getDatabase, ref, onValue, push } from "firebase/database";
import { getAuth } from "firebase/auth";
import { useParams } from "react-router-dom";

const GroupChat = () => {
  const { groupId } = useParams();
  const auth = getAuth();
  const [groupData, setGroupData] = useState(null);
  const [members, setMembers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    const db = getDatabase();
    const chatRef = ref(db, `chats/${groupId}`);
    const messagesRef = ref(db, `chats/${groupId}/messages`);

    // دریافت اطلاعات گروه
    onValue(chatRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setGroupData(data);
        const userRefs = data.users || [];
        const usersRef = ref(db, "users");
        onValue(usersRef, (usersSnap) => {
          const allUsers = usersSnap.val() || {};
          const selectedUsers = userRefs.map((uid) => ({
            uid,
            ...allUsers[uid],
          }));
          setMembers(selectedUsers);
        });
      }
    });

    // دریافت پیام‌ها به صورت real-time
    onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const msgs = Object.values(data);
        setMessages(msgs);
      } else {
        setMessages([]);
      }
    });
  }, [groupId]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const db = getDatabase();
    const user = auth.currentUser;

    if (!user) return;

    await push(ref(db, `chats/${groupId}/messages`), {
      uid: user.uid,
      text: newMessage,
      createdAt: Date.now(),
    });

    setNewMessage("");
  };
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const faDate = date.toLocaleDateString("fa-IR");
    const faTime = date.toLocaleTimeString("fa-IR", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return `${faDate} - ${faTime}`;
  };
  
  return (
    <div className="flex h-screen">
      {/* سایدبار اعضا */}
      <div className="w-64 bg-gray-100 border-l p-4 overflow-y-auto">
        <h2 className="font-bold text-lg mb-2">اعضای گروه</h2>
        <p className="text-sm text-gray-600 mb-3">
          تعداد اعضا: {members.length}
        </p>

        {members.map((member) => (
          <div key={member.uid} className="mb-2 p-2 bg-white rounded shadow-sm">
            <p className="font-medium">
              {member.firstName} {member.lastName}
            </p>
            <p className="text-sm text-gray-500">{member.role}</p>
          </div>
        ))}
      </div>

      {/* صفحه چت */}
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold">
            {groupData?.groupName || "چت گروهی"}
          </h1>
        </div>

        <div className="flex-1 p-4 overflow-y-auto space-y-3">
          {messages.map((msg, index) => {
            const sender = members.find((m) => m.uid === msg.uid);
            return (
              <div key={index} className="bg-gray-200 p-3 rounded">
                <div className="text-sm font-semibold mb-1">
                  {sender
                    ? `${sender.firstName} ${sender.lastName}`
                    : "کاربر ناشناس"}
                </div>
                <div>{msg.text}</div>
                <div className="text-xs text-gray-600 mt-1 text-left">
                  {formatTimestamp(msg.createdAt)}
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-4 border-t flex gap-2">
          <input
            type="text"
            placeholder="پیام خود را بنویسید..."
            className="flex-1 border rounded px-4 py-2"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
          />
          <button
            onClick={handleSendMessage}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            ارسال
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupChat;
