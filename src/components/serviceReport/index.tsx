import { useState,useEffect } from "react";
import ComponentCard from "../common/ComponentCard";
import NumberOfReports from "./NumberOfReports";
import { getcomplainall } from "./services";
import {
  Spin
} from "antd";

import Tables from "./tables";

export interface ComplainData {
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
  files: any[]; 
}

export default function index() {
  const [loading, setLoading] = useState<boolean>(true);
  const [complainData, setComplainData] = useState<ComplainData[]>([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await getcomplainall();
      if (response) {
        setComplainData(response.data || []);
      } else {
        console.error("Failed to fetch complain data");
      }
    } catch (error) {
      console.error("Error fetching complain data:", error);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { 
    fetchData();
  }, []);

  return (
   <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      
        <div className="md:col-span-3 ">
          <Spin spinning={loading} tip="กำลังโหลดข้อมูล...">
          <ComponentCard title="รายงานการแจ้งปัญหาคุณภาพสินค้า">
            <Tables 
            complainData={complainData}
            fetchData={fetchData}
            loading={loading}
            />
          </ComponentCard>
          </Spin>
       
        </div>
        <div className="col-span-1">
          <Spin spinning={loading} tip="กำลังโหลดข้อมูล...">
          <ComponentCard title="หัวข้อการร้องเรียน">
            <NumberOfReports 
            complainData={complainData}
            />
          </ComponentCard>
          </Spin>
        </div>
    
   </div>
  );
}
