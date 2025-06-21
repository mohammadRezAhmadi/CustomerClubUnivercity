import Home from "./Pages/Home/Home"
import Login from "./Pages/Login/Login"
import Sign from "./Pages/Sign/Sign"
import DashboardAdmin from "./Pages/DashboardAdmin/DashboardAdmin"
import ManageClient from "./Pages/manageClient/ManageClient"; 
import StudentAccount from './Pages/StudentAccount/StudentAccount'
import JoinFestivales from './Pages/StudentAccount/JoinFestivales'
import GroupChat from "./components/Chat/GroupChat";
import StudentChatManager from "./Pages/StudentAccount/StudentChatManager";
import ChatRequest from "./components/Chat/ChatRequest";
import CreateContest from "./components/Contest/CreateContest";
import CompetitionList from "./components/Contest/CompetitionList";
import StudentCompetitionList from "./components/Contest/Student/StudentCompetitionList";
import EnterCompetition from "./components/Contest/Student/EnterCompetition";
import AdminChatGroups from "./components/Chat/AdminChatGroups";

let routes = [
    {path: '/' , element: <Home />},
    {path: '/login' , element: <Login />},
    {path: '/sign' , element: <Sign />},
    {path: '/DashboardAdmin' , element: <DashboardAdmin />},
    {path:"/manageClient" , element: <ManageClient />},
    {path:"/DashboardStudent" , element: <StudentAccount />},
    {path:"/myFestivales" , element: <JoinFestivales />},
    {path:"group-chat/:groupId"  , element: <GroupChat/>},
    {path:"/chatManager"  , element: <StudentChatManager/>},
    {path:"/chat-requests"  , element: <ChatRequest/>},
    {path:"/create-contest"  , element: <CreateContest/>},
    {path:"/CompetitionList"  , element: <CompetitionList/>},
    {path:"/StudentCompetitionList"  , element: <StudentCompetitionList/>},
    {path:"/competition/:id"  , element: <EnterCompetition/>},
    {path:"/admin-chats"  , element: <AdminChatGroups/>},

]

export default routes