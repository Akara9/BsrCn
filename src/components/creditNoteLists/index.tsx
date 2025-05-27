import { useState,useEffect } from "react";
import ComponentCard from "../common/ComponentCard";
import Table from "./tables"
import FormSearchCreditNote from "./form/formSearchCreditNote";
import { getCreditNote } from "./services"
import { branchs } from "./variables";

export interface CreditNoteItem {
  id: number;
  creditNoteId: number;
  productCode: string;
  productName: string;
  qty: number | string;
  price: number | string;
  isReturn: number;
  qtyCN: number | string;
  priceCN: number | string;
  createdAt: string;
  UOMCode: string;
  UOMName: string;
  UOMEntry: number | string;
  taxNo: string;
  vatGroup: string;
  binLocation: string; // JSON string, can be parsed to object if needed
  weight: number | string;
  whGrpCode: string;
  whGrpName: string;
  weightBaseFlag: any; // null or other type if known
  childBinLocation: any; // null or other type if known
  // add other fields if needed
}
export interface CreditNoteFile {
  id: string;
  creditNoteId: number;
  filePath: string;
  createdAt: string;
  // add other fields if needed
}

export interface CreditNote {
  creditNoteId: number;
  creditNoteNo: string;
  creditNoteStatus: string;
  invoiceNo: string;
  branchCode: string | null;
  customerCode: string;
  customerName: string;
  reasonCode1: string | null;
  reason1: string;
  accountCode: string | null;
  reason2: string;
  whGrpCode: string;
  whGrpName: string;
  discount: number;
  amount: number;
  weight: number;
  Q1: number;
  Q2: number;
  Q3: number;
  temperature: string;
  saleName: string;
  invenName: string;
  createdBy: string;
  createdAt: string;
  invoiceId: number;
  toB1: number;
  branchId: number;
  companyCode: string;
  branchName: string;
  docEntryDelivery: number;
  docEntryInvoice: number;
  userCode: string;
  salePersonCode: number;
  DocEntry: number;
  DocNum: number;
  RefKey: string;
  datetimeToB1: string;
  qtyCNTotal: number;
  priceCNTotal: number;
  items?: CreditNoteItem[];
  files?: CreditNoteFile[];
  qcOperator?: string;
  // ...other properties
}

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
  invoiceDate: string;
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

const CreditNoteList: React.FC = () => {
  const session = JSON.parse(localStorage.getItem('session') || '{}');
  const [creditNoteList, setCreditNoteList] = useState<CreditNote[]>([]);
  const [loading, setLoading] = useState(true);
  // Helper to format date as YYYY-MM-DD
  const formatDate = (date: Date) => date.toISOString().slice(0, 10);

  const today = new Date();
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(today.getDate() - 3);

  const [dateFrom, setDateFrom] = useState<string>(formatDate(threeDaysAgo));
  const [dateTo, setDateTo] = useState<string>(formatDate(today));
  const [searchParams, setSearchParams] = useState<any>(branchs?.find((Item:any) => session?.other?.other_name == Item.WhsGrpName)?.BranchId || ''); // Default to session value or empty string
  const [searchValue, setSearchValue] = useState<string>('');
  const [searchStatus, setSearchStatus] = useState<string>(''); // New state for search status

  const fetchData = async () => {
    setLoading(true);
    if (!dateFrom || !dateTo || !searchParams) {
      setLoading(false);
      return;
    };
    try {
      const response = await getCreditNote(dateFrom, dateTo, searchParams, searchValue, searchStatus);
      setCreditNoteList(response);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);
  return (
    <ComponentCard title="รายการใบลดหนี้">
      <div className="flex flex-col  gap-4">
         <FormSearchCreditNote 
           loading={loading} 
           setDateFrom={setDateFrom}
           setDateTo={setDateTo}
           setSearchParams={setSearchParams}
           dateFrom={dateFrom}
            dateTo={dateTo}
            searchParams={searchParams}
            fetchData={fetchData}
            searchValue={searchValue}
            setSearchValue={setSearchValue}
            setSearchStatus={setSearchStatus} // Pass the new state setter
            
         />
         <Table 
         creditNoteList={creditNoteList}
         loading={loading}
         fetchData={fetchData}
         />
      </div>
    </ComponentCard>
  );
  
};



export default CreditNoteList;
