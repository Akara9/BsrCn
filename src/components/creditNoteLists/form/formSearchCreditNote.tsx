// import {useState, useEffect} from "react";
import {
    Input,
    Select,
    DatePicker,
    ConfigProvider,
} from "antd";
import Button from "../../ui/button/Button"
import { FaSearch } from "react-icons/fa";
import dayjs from "dayjs";
import "dayjs/locale/th"; // Import Thai locale for dayjs
import locale from "antd/locale/th_TH"; // Import Thai locale for Ant Design
import { Dispatch, SetStateAction } from "react";
// import { CreditNote } from "../index";
import { branchs,StatusFromPOS } from "../variables";
// import Item from "antd/es/list/Item";

dayjs?.locale("th"); // Set locale to Thai

interface FormSearchCreditNoteProps {
  loading: boolean;
  setDateFrom: Dispatch<SetStateAction<string>>;
  setDateTo: Dispatch<SetStateAction<string>>;
  setSearchParams: Dispatch<SetStateAction<string>>;
  dateFrom: string;
  dateTo: string;
  searchParams: any;
  fetchData: () => void;
  searchValue: string;
  setSearchValue: Dispatch<SetStateAction<string>>;
  setSearchStatus: Dispatch<SetStateAction<string>>;
}

const FormSearchCreditNote: React.FC<FormSearchCreditNoteProps> = ({
 
  loading,
  setDateFrom,
  setDateTo,
setSearchParams,
dateFrom,
dateTo,
fetchData,
searchParams,
searchValue,
setSearchValue,
setSearchStatus

}) => {
    const session = JSON.parse(localStorage.getItem("session") || "{}");
   console.log(dateFrom,dateTo,searchParams)
    return (
        <div>
           
            <div className="flex flex-col md:flex-row md:items-center gap-3">
                <div>
                    {/* <b>เลือกสาขา</b> */}
                    <Select
                    className="w-full"
                    style={{
                    fontFamily: "Noto Sans Thai",
                    minWidth: "200px",
                    }}
                      dropdownStyle={{
                    fontFamily: "Noto Sans Thai",
                    }}
                    value={branchs?.find((Item: any) => searchParams == Item.BranchId)?.WhsGrpName || undefined} // Use undefined if no value is selected
                    placeholder="เลือกสาขา"
                    // defaultValue={session?.warehouse?.[0]} // Set the first warehouse as default, or undefined
                    options={branchs?.filter((item: any) => session?.warehouse?.includes(item?.WhsGrpCode))?.map((item: any) => ({
                        value: item?.WhsGrpName,
                        label: item?.WhsGrpName
                    }))}
                    onChange={(value) => {
                        setSearchParams(
                            String(branchs?.find((item: any) => item?.WhsGrpName == value)?.BranchId ?? "")
                        );
                    }}

                    showSearch={true}
                    ></Select>
                </div>
                <div>
                    {/* <b>ค้นหาระหว่างวันที่</b> */}
                    <ConfigProvider locale={locale}>
                    <DatePicker.RangePicker
                    className="w-full"
                    style={{
                    fontFamily: "Noto Sans Thai",
                    }}
                    format={(value) =>
                    value.format("DD MMMM ") + (value.year() + 543)
                    }
                    popupStyle={{
                    fontFamily: "Noto Sans Thai",
                    }}
                    value={[
                        dateFrom ? dayjs(dateFrom, "YYYY-MM-DD") : null,
                        dateTo ? dayjs(dateTo, "YYYY-MM-DD") : null
                    ]}
                    onChange={(dates) => {
                        if (dates && dates[0] && dates[1]) {
                            const [start, end] = dates;
                            setDateFrom(start.format("YYYY-MM-DD"));
                            setDateTo(end.format("YYYY-MM-DD"));
                        } else {
                            setDateFrom("");
                            setDateTo("");
                        }
                    }}
                    
                    ></DatePicker.RangePicker>
                    </ConfigProvider>
                   
                </div>
                <div>
                    {/* <b>เลขที่เอกสาร</b> */}
                    <Input
                     style={{
                    fontFamily: "Noto Sans Thai",
                    }}
                    className="w-full"
                    placeholder="เลขที่เอกสาร"
                    onChange={(e) => {
                        setSearchValue(e.target.value);
                    }}
                    ></Input>
                </div>
                <div>
                    <Select
                    className="w-full"
                    style={{
                    fontFamily: "Noto Sans Thai",
                    minWidth: "200px",
                    }}
                      dropdownStyle={{
                    fontFamily: "Noto Sans Thai",
                    }}
                    placeholder="เลือกสถานะใบลดหนี้"
                    defaultValue={"ทั้งหมด"}
                    options={[
                        {
                            value: "",
                            label: "ทั้งหมด",
                        },
                        ...Object.entries(StatusFromPOS).map(([key, label]) => ({
                            value: key,
                            label: label
                        }))
                    ]}
                    onChange={(value) => {
                        setSearchStatus(value);
                    }}

                    showSearch={true}
                    ></Select>
                </div>
                <div>
                   
                </div>
            </div>
              <Button
              size="sm"
              variant="outline"
              className="mt-4  "
              startIcon={<FaSearch className="size-3" />}
              disabled={loading || !searchParams || !dateFrom || !dateTo}
              onClick={() => {
                console.log("searchParams", searchParams);
                console.log("dateFrom", dateFrom);
                console.log("dateTo", dateTo);
                console.log("searchValue", searchValue);
                fetchData();
              }}
            >
              ค้นหาข้อมูล
            </Button>
        </div>
    )
}

export default FormSearchCreditNote;