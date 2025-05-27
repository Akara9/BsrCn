import { useState } from "react";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";
import Button from "../ui/button/Button";
import { message, ConfigProvider, Spin } from "antd";
import { useNavigate } from "react-router-dom";
import { SignInAPI, UserInfo, UserImages } from "../../services/login";

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [checked, setChecked] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate(); // Use the useNavigate hook
  // useEffect(() => {
  //     localStorage.clear(); // Clear local storage on component mount
  //     // localStorage.setItem('session', false); // Set session to empty string
  //     console.log(localStorage)
  //   }, []);

  const handleSignIn = async () => {
    if (!email || !password) {
      messageApi.open({
        type: "error",
        content: "กรุณากรอกข้อมูลให้ครบถ้วน",
        style: {
          fontFamily: "Noto Sans Thai",
        },
      });
      return;
    }
    setIsLoading(true);
    // Simulate an async operation (e.g., API call)
    console.log("Logging in with", { email, password });
    // Simulate a login delay
    // message.success(<span style={{ fontFamily: "Noto Sans Thai" }}>บันทึกข้อมูลสำเร็จ!</span>, 3);
    let response;
    try {
      response = await SignInAPI(email, password);
    } catch (err) {
      setIsLoading(false);
      messageApi.open({
        type: "error",
        content: "เกิดข้อผิดพลาดในการเชื่อมต่อ",
        style: {
          fontFamily: "Noto Sans Thai",
        },
      });
      return;
    }
    if (response.res_type === "success") {
      const res = await UserInfo(response.res_data.token);
      console.log(res);
      const sessionData = JSON.stringify(res.res_data);
      const resImg = await UserImages();
      if (checked) {
        localStorage.setItem("session", sessionData);
        localStorage.setItem(
          "userImages",
          resImg.res_data.find(
            (Item: { UserCode: string; Image?: string }) => Item.UserCode == res.res_data.UserCode
          )?.Image || ""
        );
      } else {
        localStorage.setItem("session", sessionData);
        localStorage.setItem(
          "userImages",
          resImg.res_data.find(
            (Item: { UserCode: string; Image?: string }) => Item.UserCode == res.res_data.UserCode
          )?.Image || ""
        );
      }
      navigate("/");
      window.location.reload();
    } else {
      // message.error(response.res_message, 3);
      messageApi.open({
        type: "error",
        content: response.res_message,
        style: {
          fontFamily: "Noto Sans Thai",
        },
      });
    }
    setTimeout(() => {
      setIsLoading(false);
      // Handle successful sign-in logic here
    }, 2000);
  };

  return (
    <ConfigProvider>
      {contextHolder}
      <div className="flex flex-col flex-1">
        <div className="w-full max-w-md pt-10 mx-auto">
          {/* <Link
          to="/"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon className="size-5" />
          Back to dashboard
        </Link> */}
        </div>
        <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
          <div>
            <div className="mb-5 sm:mb-8">
              <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
                เข้าสู่ระบบ
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                สร้างใบลดหนี้หรือจัดการใบลดหนี้ของคุณ
              </p>
            </div>
            <div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSignIn();
                }}
              >
                <div className="space-y-6">
                  <div>
                    <Label>
                      รหัสพนักงาน <span className="text-error-500">*</span>{" "}
                    </Label>
                    <Input
                      placeholder="01xxxx"
                      onChange={(e) => setEmail(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSignIn();
                      }}
                    />
                  </div>
                  <div>
                    <Label>
                      รหัสผ่าน <span className="text-error-500">*</span>{" "}
                    </Label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="รหัสผ่านของคุณ"
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSignIn();
                        }}
                      />
                      <span
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                      >
                        {showPassword ? (
                          <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                        ) : (
                          <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                        )}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Checkbox checked={checked} onChange={setChecked} />
                      <span className="block font-normal text-gray-700 text-theme-sm dark:text-gray-400">
                        จดจำฉันไว้เสมอ
                      </span>
                    </div>
                  </div>
                  <div>
                    <Button
                      className="w-full"
                      size="sm"
                      disabled={isLoading || email === "" || password === ""}
                      onClick={handleSignIn}
                      type="submit"
                    >
                      {isLoading && <Spin size="small"></Spin>} เข้าสู่ระบบ
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </ConfigProvider>
  );
}
