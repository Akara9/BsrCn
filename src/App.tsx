import { BrowserRouter as Router, Routes, Route } from "react-router";
import SignIn from "./pages/AuthPages/SignIn.js";
// import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound.js";
// import UserProfiles from "./pages/UserProfiles.js";
// import Videos from "./pages/UiElements/Videos.js";
// import Images from "./pages/UiElements/Images.js";
// import Alerts from "./pages/UiElements/Alerts.js";
// import Badges from "./pages/UiElements/Badges.js";
// import Avatars from "./pages/UiElements/Avatars.js";
// import Buttons from "./pages/UiElements/Buttons.js";
// import LineChart from "./pages/Charts/LineChart.js";
// import BarChart from "./pages/Charts/BarChart.js";
// import Calendar from "./pages/Calendar.js";
// import BasicTables from "./pages/Tables/BasicTables.js";
// import FormElements from "./pages/Forms/FormElements.js";
// import Blank from "./pages/Blank.js";
import AppLayout from "./layout/AppLayout.js";
import { ScrollToTop } from "./components/common/ScrollToTop.js";
// import Home from "./pages/Dashboard/Home.js";
import CreditNoteLists from "./pages/creditNoteLists/index.js";
import CustomerReports from "./pages/customerReports/index.js";
import CreaiteCN from "./pages/creaiteCN/index.js";
import ToB1DisCountMarketing from "./pages/toB1DisCountMarketing/index.js";
import ServiceReport from "./pages/serviceReport/index.js";
import ServiceReportForm from "./pages/ServiceReportForm/index.js";

import { HelmetProvider } from "react-helmet-async";
import { useEffect, useState } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { ConfigProvider } from "antd";
// Add React-Toastify imports
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {  useDataContext } from "./context/index.js";



const theme = createTheme({
  typography: {
    fontFamily: [
      "Noto Sans Thai",
      "Roboto",
      "Arial",
      "sans-serif"
    ].join(","),
  },
  // ...สามารถเพิ่มการปรับแต่ง theme อื่นๆ ได้...
});

export default function App() {
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { data } = useDataContext();

  useEffect(() => {
    // Show toast notification using React-Toastify
    if (data.message) {
      const [content, type] = data.message.split("-");
      switch ((type || "info").trim()) {
        case "success":
          toast.success(content || "ยินดีต้อนรับสู่ระบบ", { autoClose: 5000 });
          break;
        case "error":
          toast.error(content || "ยินดีต้อนรับสู่ระบบ", { autoClose: 5000 });
          break;
        case "warning":
          toast.warn(content || "ยินดีต้อนรับสู่ระบบ", { autoClose: 5000 });
          break;
        default:
          toast.info(content || "ยินดีต้อนรับสู่ระบบ", { autoClose: 5000 });
      }
    }
 
  }, [data.message]); // Removed useEffect with undefined dependency 'data'
    // Removed useEffect with undefined dependency 'data'
//  console.log("Message:", data.message);
  useEffect(() => {
    // ตรวจจับ event loading
    const handleStart = () => setLoading(true);
    const handleEnd = () => setLoading(false);

    window.addEventListener("fetchStart", handleStart);
    window.addEventListener("fetchEnd", handleEnd);

    // ตรวจสอบ session ครั้งแรก
    const session = localStorage.getItem("session");
    console.log(localStorage.getItem("session"))
    setIsLoggedIn(!!session);

    return () => {
      window.removeEventListener("fetchStart", handleStart);
      window.removeEventListener("fetchEnd", handleEnd);
    };
  }, []);

  if (loading) {
    return (
      <div style={{display: "flex", justifyContent: "center", alignItems: "center", height: "100vh"}}>
        <div style={{
          border: "8px solid #f3f3f3",
          borderTop: "8px solid #3498db",
          borderRadius: "50%",
          width: "60px",
          height: "60px",
          animation: "spin 1s linear infinite"
        }} />
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    );
  }

  return (
    <>
      {/* ToastContainer with higher zIndex to appear above Drawer */}
     
      <HelmetProvider>
        <ConfigProvider
          theme={{
            token: {
              fontFamily: "Noto Sans Thai, Roboto, Arial, sans-serif"
            }
          }}
        >
          <ThemeProvider theme={theme}>
             <ToastContainer toastStyle={{ zIndex: 2000000,fontFamily:"Noto Sans Thai" }} className="custom-toast-body" />
            
            <CssBaseline />
            <Router basename={"/v2/"}>
              <ScrollToTop />
              <Routes>
                {/* Dashboard Layout */}
                <Route element={isLoggedIn ? <AppLayout /> : <SignIn />}>
                  {/* Dashboard Page */}
                  <Route index path="/" element={isLoggedIn ? <CreditNoteLists /> : <SignIn />} />
                  <Route index path="/customer-report" element={isLoggedIn ? <CustomerReports /> : <SignIn />} />
                  <Route index path="/create-cn" element={isLoggedIn ? <CreaiteCN /> : <SignIn />} />
                  <Route index path="/to-b1-discount-marketing" element={isLoggedIn ? <ToB1DisCountMarketing /> : <SignIn />} />
                  <Route index path="/service-report" element={isLoggedIn ? <ServiceReport /> : <SignIn />} />

                  {/* Others Page */}
                  {/* <Route path="/profile" element={isLoggedIn ? <UserProfiles /> : <SignIn />} />
                  <Route path="/calendar" element={isLoggedIn ? <Calendar /> : <SignIn />} />
                  <Route path="/blank" element={isLoggedIn ? <Blank /> : <SignIn />} /> */}

                  {/* Forms */}
                  {/* <Route path="/form-elements" element={isLoggedIn ? <FormElements /> : <SignIn />} /> */}

                  {/* Tables */}
                  {/* <Route path="/basic-tables" element={isLoggedIn ? <BasicTables /> : <SignIn />} /> */}

                  {/* Ui Elements */}
                  {/* <Route path="/alerts" element={isLoggedIn ? <Alerts /> : <SignIn />} />
                  <Route path="/avatars" element={isLoggedIn ? <Avatars /> : <SignIn />} />
                  <Route path="/badge" element={isLoggedIn ? <Badges /> : <SignIn />} />
                  <Route path="/buttons" element={isLoggedIn ? <Buttons /> : <SignIn />} />
                  <Route path="/images" element={isLoggedIn ? <Images /> : <SignIn />} />
                  <Route path="/videos" element={isLoggedIn ? <Videos /> : <SignIn />} /> */}

                  {/* Charts */}
                  {/* <Route path="/line-chart" element={isLoggedIn ? <LineChart /> : <SignIn />} />
                  <Route path="/bar-chart" element={isLoggedIn ? <BarChart /> : <SignIn />} /> */}
                </Route>

                {/* Auth Layout */}
                <Route path="/signin" element={<SignIn />} />
                {/* <Route path="/signup" element={<SignUp />} /> */}

                {/* Fallback Route */}
                {/* This route will match /service-report/ and any sub-path, e.g., /service-report/71 */}
                <Route path="/service-report/*" element={<ServiceReportForm />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Router>
          </ThemeProvider>
        </ConfigProvider>
      </HelmetProvider>
    </>
  );
}
