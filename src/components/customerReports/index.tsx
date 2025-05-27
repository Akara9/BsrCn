import { useState,useEffect } from "react";
import ComponentCard from "../common/ComponentCard";
import Tables from "./tables";
import { getReportLists } from "./services";

export interface ReportList {
  ReportListId: number;
  OrderNo: string;
  Namecustomer: string;
  ReportListEmail: string;
  ReportListLineID: string;
  ReportListAddress: string;
  ReportListStatusPending: number;
  ReportListStatusSuccess: number;
  TimeUpdReport: string;
  invoiceNo: string;
  InvioceId: number;
  appqc: string;
  success: any; // or specify type if known
  name: string;
  createdBy: string;
  discount: number;
  StatusFormPOS: string;
  PhoneFormPOS: string;
  creditNoteId: number;
  reason1: string;
}
export default function index() {
  const [reportLists, setReportLists] = useState<ReportList[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
   const fetchData = async () => {
      setLoading(true);
      const response = await getReportLists();
      if (response) {
        setReportLists(response.data || []);
        setLoading(false);
      } else {
        console.error("Failed to fetch report lists");
      }
    };
  useEffect(() => {
    fetchData();
  }, []);
  return (
    <ComponentCard title="รายการลูกค้าแจ้งปัญหาคุณภาพ">
      <div className="flex items-center gap-4">
        <div className="w-full">
          <Tables 
          reportLists={reportLists}
          loading={loading}
          setLoading={setLoading}
          fetchData={fetchData}
          />
        </div>
      </div>
    </ComponentCard>
  );
}
