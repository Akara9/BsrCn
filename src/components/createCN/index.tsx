import React, { useState, useEffect, useMemo } from "react";
import ComponentCard from "../common/ComponentCard";
import Tables from "./tables";
import { getInvoiceForCreate } from "./services";
import { branchs } from "./variables";
export interface InvItem {
  id: number;
  invoiceId: number;
  productCode: string;
  productName: string;
  qty: string;
  price: string;
  amount: string;
  weight: string;
  UOMCode: string;
  UOMName: string;
  UOMEntry: string;
  whGrpCode: string;
  whGrpName: string;
  companyCode: string;
  companyName: string;
  taxNo: string;
  vatGroup: string;
  weightBaseFlag: number;
  stepPriceFlag: number;
  binLocation: string;
}

export interface InvList {
  invoiceId: number;
  orderNo: string;
  branchId: number;
  customerCode: string;
  customerName: string;
  phone1: string;
  phone2: string;
  weight: string;
  amount: string;
  shippingType: string;
  routeCode: string;
  routeName: string;
  billAddress: string;
  shippingAddress: string;
  remark: string;
  whGrpCode: string;
  whGrpName: string;
  userCode: string;
  userResponsible: string;
  createdAt: string;
  invoiceNo: string;
  invoiceDate: string
  companyCode: string;
  paymentId: number | null;
  invoiceStatus: string;
  docEntry: number;
  docNum: number;
  refKey: string;
  U_ISS_RefKey: string;
  finishedAt: string;
  toB1: number;
  U_BFP_Latitude: string;
  U_BFP_Longitude: string;
  salePersonCode: number;
  finishedBy: string;
  canceledBy: string | null;
  canceledAt: string | null;
  apprCanceledBy: string | null;
  apprCanceledAt: string | null;
  canceledNote: string | null;
  incommingDocNum: number;
  incommingDocEntry: number;
  incommingRefKey: string;
  acceptedBy: string | null;
  acceptedAt: string | null;
  ErrorMessage: string | null;
  rejectCanceledBy: string | null;
  rejectCanceledAt: string | null;
  orderStatus: string;
  acceptedByName: string;
  deliveryNo: string;
  paymentChannel: string;
  shipPaymentType: string | null;
  shipNote: string | null;
  hasDelivery: number | string;
  isCNReturn: number;
  isCNDiscount: number;
  incommingErrorMessage?: string | null;
  deliveryId?: number;
  transportId?: number;
  notes?: string;
  items?: InvItem[];
}
const createCN: React.FC = () => {
  
  const session = JSON.parse(localStorage.getItem("session") || "{}");
  const [brandSearch, setBrandSearch] = useState<number | null>(
    branchs?.find((row: any) => row.WhsGrpCode == session?.other.other_id)
      ? Number(branchs.find((row: any) => row.WhsGrpCode == session?.other.other_id)?.BranchId)
      : null
  );
  const today = new Date();
  const fiveDaysAgo = new Date();
  fiveDaysAgo.setDate(today.getDate() - 5);
  const [dateStart, dateEnd] = [fiveDaysAgo, today];
  const [invLists, setInvLists] = React.useState<InvList[]>([]);
  const [loading, setLoading] = React.useState(false);
  const fetchInvoices = async () => {
    if (brandSearch != null) {
      setLoading(true);
      // Replace 'branchId' with the actual branch ID value you want to use
      const response = await getInvoiceForCreate(
        dateStart.toISOString()?.split("T")[0],
        dateEnd.toISOString()?.split("T")[0],
        brandSearch
      );
      if (response) {
        // กรอง invoiceId ซ้ำ
        const unique = Array.isArray(response)
          ? response.filter(
              (item: any, idx: number, arr: any[]) =>
                arr.findIndex((el) => el.invoiceId === item.invoiceId) === idx
            )
          : response;
        setInvLists(
          unique?.filter((item: any) => {
            const invoiceDate = new Date(item.invoiceDate);
            const now = new Date();
            const diffTime = now.getTime() - invoiceDate.getTime();
            const diffDays = diffTime / (1000 * 60 * 60 * 24);
            const weight = Number(item.weight);
            if (weight <= 4000) {
              return diffDays <= 3;
            } else {
              return diffDays <= 5;
            }
          })
        );
        setLoading(false);
      } 
    }
  };
  useEffect(() => {
    fetchInvoices();
  }, [brandSearch]);

  console.log(brandSearch);

  const options = useMemo(() => {
    return session?.warehouse.map((item: string) => {
      return {
        value: branchs?.find((row: any) => row.WhsGrpCode == item)?.WhsGrpName ?? "",
        label: branchs?.find((row: any) => row.WhsGrpCode == item)?.WhsGrpName ?? "",
      };
    });
  }, [session]);
  return (
    <>
     
      <ComponentCard title="สร้างเอกสารใบลดหนี้">
        <div className="flex items-center gap-4">
          <div className="w-full"> 
            <small className="mb-5">

              <b>หมายเหตุ : </b> <span>หากนํ้าหนักรวมในบิลตํ่ากว่า 4,000 กก. สามารถสร้างใบลดหนี้ได้ไม่เกิน 3 วันหลังจากวันที่เปิดใบแจ้งหนี้ และนํ้าหนักรวมาก 4,000 กก. ขึ้นไปสามารถสร้างใบแจ้งหนี้ได้ไม่เกิน 5 วันหลังจากวันที่เปิดใบแจ้งหนี้</span>
            </small>
            <br></br>
            <Tables
              setBrandSearch={setBrandSearch}
              brandSearch={brandSearch}
              invLists={invLists}
              loading={loading}
              options={options}
              fetchInvoices={fetchInvoices}
            /> 
          </div>
        </div>
      </ComponentCard>
    </>
  );
}
export default createCN;
