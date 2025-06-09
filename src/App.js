import Footer from "./components/Footer/Footer";
import Header from "./components/Header/Header";
import { useRoutes } from "react-router-dom";
import Routes from "./routes";
import "./tailwindcss.css";
import Main from "./Pages/Main/Main";
function App() {
  let routes = useRoutes(Routes)

  return (
    <>
      <Header />
      <main>
        {routes}
      </main>
      {/* <Main/> */}
      <Footer />


    </>
  );
}

export default App;
