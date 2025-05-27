import ComponentCard from "../common/ComponentCard";
import Logo from "../../assets/img/logo.png";
import { useEffect, useState } from "react";
import { Spin,Input } from "antd";
import { getcomplainall } from "../serviceReport/services";
import { updateNameEmService } from "./services"
import { useDataContext } from "../../context";
import Badge from "../ui/badge/Badge";
import Button from "../ui/button/Button";

interface ComplainData {
    ReportServicesId: number;
    InvoiceNo: string;
    OrderNo: string;
    ServiceIdMulti: string;
    ReportServicesTimeUPD: string;
    ServiceMore: string;
    nameEmployee: string;
    ServiceDetail: string;
    nameEmPending: string;
    solutionEdit: string;
    resultDowork: string;
    feedback: string;
    ReportServiceStatus: string;
    Namecustomer: string;

}
const Form = () => {
    const { data } = useDataContext();
  const [loading, setLoading] = useState<boolean>(true);
  const [complainData, setComplainData] = useState<ComplainData>({} as ComplainData);
  const [solutionEdit, setSolutionEdit] = useState<string>("");
  const [resultDowork, setResultDowork] = useState<string>("");
  const pathName = window.location.pathname.split("/").pop();
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await getcomplainall();
      if (response) {
        setComplainData(
          response.data?.find(
            (item: any) => item.ReportServicesId == pathName
          ) || {}
        );
        setSolutionEdit(response.data?.find(
          (item: any) => item.ReportServicesId == pathName
        )?.solutionEdit || "");
        setResultDowork(response.data?.find(
          (item: any) => item.ReportServicesId == pathName
        )?.resultDowork || "");
      } else {
        console.error("Failed to fetch complain data");
      }
    } catch (error) {
      console.error("Error fetching complain data:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateNameEmService = async () => {
    if (complainData.ReportServicesId && complainData.nameEmPending) {
      try {
        setLoading(true);
        const response = await updateNameEmService({
            ReportServicesId: complainData.ReportServicesId,
            solutionEdit: solutionEdit,
        });
        const response1 = await updateNameEmService({
            ReportServicesId: complainData.ReportServicesId,
            resultDowork: resultDowork,
        });
        if (response && response1) {
            fetchData(); // Refresh data after update
          console.log("Update successful:", response);
        } else {
          console.error("Failed to update name employee service");
        }
      } catch (error) {
        console.error("Error updating name employee service:", error);
      }
    } else {
      console.warn("ReportServicesId or nameEmPending is missing");
    }
  }
  // Safely parse ServiceIdMulti
  let ServiceIdMulti: any[] = [];
  try {
    if (complainData?.ServiceIdMulti) {
      ServiceIdMulti = JSON.parse(complainData.ServiceIdMulti);
    }
  } catch (e) {
    ServiceIdMulti = [];
  }
  return (
    <div className="p-10">
      <div>
        <img src={Logo} alt="Logo" className="w-50 mx-auto mb-4" />
      </div>
      <Spin spinning={loading} tip="กำลังโหลดข้อมูล...">
        <ComponentCard title="โปรดอ่านรายละเอียดและกรอกข้อมูล">
          <div className="p-4">
            {/* Your form components go here */}
            <p className="mb-2 text-gray-400">
              ชื่อลูกค้า
            </p>
            <p className="mb-2">
              <b>{complainData.Namecustomer}</b>
            </p>
            <p className="mb-2 text-gray-400">
              รายละเอียดคำร้องเรียน
            </p>
            <p className="mb-2">
              <b>{complainData.ServiceDetail}</b>
            </p>
            <p className="mb-2 text-gray-400">
              แจ้งเมื่อ
            </p>
            <p className="mb-2">
              <b>{complainData.ReportServicesTimeUPD}</b>
            </p>
            <p className="mb-2 text-gray-400">
              หัวข้อการร้องเรียน
            </p>
            <p className="flex flex-wrap gap-2 mb-2">
                {ServiceIdMulti?.map((item: any) => (
                    <Badge
                      key={item}
                      variant="light"
                      >
                        {data?.reportServMasterData?.find(
                            (service: any) => service.ServicesId == item
                        )?.ServiceName || "ไม่พบหัวข้อ"}
                      </Badge>
                ))}
              <b></b>
            </p>
             <p className="mb-2 text-gray-400">
              พนักงานผู้รับผิดชอบ
            </p>
             <p className="mb-2">
              <b>{complainData.nameEmPending}</b>
            </p>
            <p className="mb-2 text-gray-400">
              แนวทางการแก้ไข
            </p>
            <p className="mb-2 text-gray-400">
              <Input.TextArea
              placeholder="กรุณากรอกแนวทางการแก้ไข"
                value={solutionEdit}
                onChange={(e) => setSolutionEdit(e.target.value)}
              >
              </Input.TextArea>
            </p>
            <p className="mb-2 text-gray-400">
              ผลลัพธ์การดำเนินการ
            </p>
            <p className="mb-2 text-gray-400">
              <Input.TextArea
              placeholder="กรุณากรอกแนวทางการแก้ไข"
                value={resultDowork}
                onChange={(e) => setResultDowork(e.target.value)}
              >
              </Input.TextArea>
            </p>

            <Button variant="outline"
            onClick={handleUpdateNameEmService}
            >
                บันทึก
            </Button>
          </div>
        </ComponentCard>
      </Spin>
    </div>
  );
};
export default Form;
