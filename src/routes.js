import Home from "./Pages/Home/Home"
import Login from "./Pages/Login/Login"
import Sign from "./Pages/Sign/Sign"
import DashboardAdmin from "./Pages/DashboardAdmin/DashboardAdmin"
import ManageClient from "./Pages/manageClient/ManageClient"; 
import StudentAccount from './Pages/StudentAccount/StudentAccount'
import JoinFestivales from './Pages/StudentAccount/JoinFestivales'

let routes = [
    {path: '/' , element: <Home />},
    {path: '/login' , element: <Login />},
    {path: '/sign' , element: <Sign />},
    {path: '/DashboardAdmin' , element: <DashboardAdmin />},
    {path:"/manageClient" , element: <ManageClient />},
    {path:"/DashboardStudent" , element: <StudentAccount />},
    {path:"/myFestivales" , element: <JoinFestivales />}
]

export default routes