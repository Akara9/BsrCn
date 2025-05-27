import React, { useState, useEffect } from "react";
import Button from "../../ui/button/Button";
import { Input } from "antd";
// import Select from "react-select";
import AsyncSelect from "react-select/async";
import { Spin } from "antd";
import { product } from "../variables";
import { useDataContext } from "../../../context";
import GetCalcurateDiscount from "../../../services/getCalcurateDiscount";
import {
  updateCreditNoteItemById,
  addCalDiscount,
  updateCreditNote,
} from "../services";
// import { useDataContext } from "../../../context";
interface DiscountOffcanvasProps {
  open: boolean;
  onClose: () => void;
  fetchData: () => void;
  fetchDataInsite: () => void;
  item: any;
  selectedCreditNote: any;
}

const DiscountOffcanvas: React.FC<DiscountOffcanvasProps> = ({
  open,
  onClose,
  item,
  fetchData,
  fetchDataInsite,
  selectedCreditNote,
}) => {
  // Add state for active discount index
  //   const { data } = useDataContext();

  const { data,setData } = useDataContext();
  const isDiscounted = data?.CNQR_calcurateDiscount?.some((row: any) => row.creditNoteItemId == item?.id);
  const isPayload = isDiscounted ? JSON.parse(data?.CNQR_calcurateDiscount?.find((row: any) => row.creditNoteItemId == item?.id).payload) :[0,1,2,3,4]
  console.log(isPayload)
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  // เพิ่ม state สำหรับ input
  const isPrice = () => {
    if (item?.weightBaseFlag == 1){
      return item?.weight == 0 ? item?.price : item?.price
    }else{
      return item?.weight == 0 ? item?.price : item?.price / item?.weight
    }
  };
  const [price, setPrice] = useState<number>(isPrice || 0);
  const [qtyProblem, setQtyProblem] = useState<number>(item?.qtyCN || 0);
  const [totalWeightProblem, setTotalWeightProblem] = useState<number>(
    (item?.weight * item.qtyCN) || 0
  );
  const [weightProblem, setWeightProblem] = useState<number>(item?.weight || 0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  // State to store values for each card
  const [cardValues, setCardValues] = useState<
    Record<
      number,
      {
        price: number;
        qtyProblem: number;
        totalWeightProblem: number;
        weightProblem: number;
        transactionPrice: number;
        itemToGet?: string;
        displayProblemPercent?: number;
      }
    >
  >(
    Array.isArray(isPayload) && Array.isArray(isPayload[0])
      ? [0, 1, 2, 3, 4].reduce((acc, idx) => {
          const payload = isPayload[idx]?.[0];
          if (payload && payload.discountLastChange !== "") {
            acc[idx] = {
              price: payload.priceByKilo,
              qtyProblem: payload.manyBoxProblem,
              totalWeightProblem: payload.weightBoxProblemAll,
              weightProblem: payload.weightBoxfountProblem,
              transactionPrice: payload.discountLastChange,
              itemToGet: payload.productmanage,
              displayProblemPercent: payload.percentIsfoundProblem,
            };
          }
          return acc;
        }, {} as Record<number, any>)
      : {}
  );
  console.log(cardValues)
  const [loadingOptions, setLoadingOptions] = useState(false);

  // ฟังก์ชันคำนวณ percent สำหรับแต่ละ card
  const calcDisplayProblemPercent = (
    weightProblem: number,
    itemWeight: number,
    idx: number
  ) => {
    let problemPercent =
      itemWeight && itemWeight > 0 ? (weightProblem / itemWeight) * 100 : 0;
    if (idx !== 0 && idx !== 1 && idx !== 4) {
      if (problemPercent <= 30) {
        return 15;
      } else if (problemPercent > 30 && problemPercent <= 50) {
        return 40;
      } else {
        return 60;
      }
    }
    return problemPercent;
  };

  // ปรับสูตร transactionPrice ให้คิดตาม percent ของแต่ละ card
  const transactionPrice =
    price *
    item.weight *
    (activeIndex !== null
      ? calcDisplayProblemPercent(weightProblem, item.weight, activeIndex) / 100
      : 0);
  const UOM = item?.weight == 0 ? item?.UOMName : "กก.";

  // สร้าง state สำหรับ formattedValue
  const [formattedValue, setFormattedValue] = useState<Record<number, string>>({
    0: "0",
    1: "0",
    2: "0",
    3: "0",
    4: "0",
  });

  // อัปเดต formattedValue เมื่อ activeIndex หรือ discountDetails เปลี่ยน
  useEffect(() => {
    // Update formattedValue from cardValues
    const formatted: Record<number, string> = {};
    for (let idx = 0; idx < 5; idx++) {
      formatted[idx] = cardValues[idx]?.transactionPrice
        ? cardValues[idx].transactionPrice.toLocaleString("th-TH", {
            style: "currency",
            currency: "THB",
          })
        : "0";
    }
    setFormattedValue(formatted);
  }, [cardValues]);
  // Restore values when activeIndex changes
  useEffect(() => {
    if (activeIndex !== null && cardValues[activeIndex]) {
      if(activeIndex == 4){
      setPrice(cardValues[activeIndex].price);
      setQtyProblem(cardValues[activeIndex].qtyProblem);
      setTotalWeightProblem(cardValues[activeIndex].totalWeightProblem);
      setWeightProblem(cardValues[activeIndex].weightProblem/item.qtyCN);
      }else{
      setPrice(cardValues[activeIndex].price);
      setQtyProblem(cardValues[activeIndex].qtyProblem);
      setTotalWeightProblem(cardValues[activeIndex].totalWeightProblem);
      setWeightProblem(cardValues[activeIndex].weightProblem);
      }
    
    } else if (activeIndex !== null) {
      if(activeIndex == 4){
      setPrice(Number((isPrice() * item.weight).toFixed(2)) || 0);
      setQtyProblem(item?.qtyCN || 0);
      setTotalWeightProblem((item?.weight*item?.qtyCN) || 0);
      setWeightProblem((item?.qtyCN) || 0);
      }else{
      setPrice(isPrice || 0);
      setQtyProblem(item?.qtyCN || 0);
      setTotalWeightProblem((item?.weight*item?.qtyCN) || 0);
      setWeightProblem((item?.weight*item?.qtyCN) || 0);
      }
    }
    // eslint-disable-next-line
  }, [activeIndex]);

  const handleRecord = async () => {
    setIsLoading(true);
    const IsData = [0, 1, 2, 3, 4].map((idx) => [
      {
        productmanage: idx === 1 ? cardValues[idx]?.itemToGet ?? null : null,
        priceonproduct: cardValues[idx]?.price ?? "",
        weightonproduct: item?.weight ?? "",
        detailProblem: "",
        priceByKilo: cardValues[idx]?.price ?? "",
        manyBoxProblem: cardValues[idx]?.qtyProblem ?? "",
        weightBoxProblemAll: cardValues[idx]?.totalWeightProblem ?? "",
        weightBoxfountProblem: cardValues[idx]?.weightProblem ?? "",
        percentIsfoundProblem: cardValues[idx]?.displayProblemPercent ?? "",
        discountLastChange: cardValues[idx]?.transactionPrice ?? "",
      },
    ]);

    await addCalDiscount(
      JSON.stringify(IsData),
      Object.values(formattedValue)
        .map((v) => Number(String(v).replace(/[^0-9.-]+/g, "")))
        .reduce((acc, curr) => acc + (isNaN(curr) ? 0 : curr), 0),
      item?.id,
      item?.creditNoteId
    );
    const isNewData = await GetCalcurateDiscount();
    setData((prev: any) => {
       return { 
        ...prev,
        CNQR_calcurateDiscount: isNewData,
    }
    });
    const priceCN = item.weightBaseFlag == 1 ? 
      Object.values(formattedValue)
        .map((v) => Number(String(v).replace(/[^0-9.-]+/g, "")))
        .reduce((acc, curr) => acc + (isNaN(curr) ? 0 : curr), 0) / (item?.weight * item?.qtyCN) 
      : Object.values(formattedValue)
        .map((v) => Number(String(v).replace(/[^0-9.-]+/g, "")))
        .reduce((acc, curr) => acc + (isNaN(curr) ? 0 : curr), 0);
    await updateCreditNoteItemById({
      productCode: item?.productCode,
      qtyCN: item?.qtyCN,
      priceCN: priceCN,
      isReturn: item?.isReturn == 1 ? true : false,
      binLocation: item?.binLocation,
      id: item?.id,
      creditNoteId: item?.creditNoteId,
      weightBaseFlag: item?.weightBaseFlag,
    });
    const isNewPriceCN =
      selectedCreditNote?.items
        ?.filter((row: any) => row?.id !== item?.id)
        ?.reduce((acc: number, curr: any) => acc + (curr.priceCN || 0), 0) +
      Object.values(formattedValue)
        .map((v) => Number(String(v).replace(/[^0-9.-]+/g, "")))
        .reduce((acc, curr) => acc + (isNaN(curr) ? 0 : curr), 0);
    const companyName = {
      BFP_DB: "BOONSIRI FROZEN PRODUCTS CO., Ltd",
      NFF_DB: "Naive Foods Co., Ltd",
      PCC_DB: "บริษัท เพอร์ซี่คูล จำกัด",
      BFPDB: "BOONSIRI FROZEN PRODUCTS CO., Ltd",
      NFFDB: "Naive Foods Co., Ltd",
      PCCDB: "บริษัท เพอร์ซี่คูล จำกัด",
    };
    await updateCreditNote(item?.creditNoteId, {
      Q1: selectedCreditNote.Q1,
      Q2: selectedCreditNote.Q2,
      Q3: selectedCreditNote.Q3,
      amount: selectedCreditNote.amount,
      branchId: selectedCreditNote.branchId,
      branchName: selectedCreditNote.branchName,
      companyCode: selectedCreditNote.companyCode,
      companyName:
        companyName[selectedCreditNote.companyCode as keyof typeof companyName],
      createdBy: selectedCreditNote.createdBy,
      creditNoteStatus: selectedCreditNote.creditNoteStatus,
      customerCode: selectedCreditNote.customerCode,
      customerName: selectedCreditNote.customerName,
      discount: isNewPriceCN,
      invenName: selectedCreditNote.invenName,
      invoiceId: selectedCreditNote.invoiceId,
      invoiceNo: selectedCreditNote.invoiceNo,
      reason1: selectedCreditNote.reason1,
      reason2: selectedCreditNote.reason2,
      reasonCode1: selectedCreditNote.reasonCode1,
      saleName: selectedCreditNote.saleName,
      salePersonCode: selectedCreditNote.salePersonCode,
      temperature: selectedCreditNote.temperature,
      weight: selectedCreditNote.weight,
      whGrpCode: selectedCreditNote.whGrpCode,
      whGrpName: selectedCreditNote.whGrpName,
    });
     setData((prev: any) => ({
      ...prev,
      message: "ปรับปรุงราคาส่วนลดสำเร็จ-success",
    }));
    fetchData();
    fetchDataInsite();
    onClose();
    setIsLoading(false);
  };
  const checkPrice = item.weightBaseFlag == 1 ? Object.values(formattedValue)
                  .map((v) => Number(String(v).replace(/[^0-9.-]+/g, "")))
                  .reduce((acc, curr) => acc + (isNaN(curr) ? 0 : curr), 0) / (item?.qtyCN * item?.weight) : Object.values(formattedValue)
                  .map((v) => Number(String(v).replace(/[^0-9.-]+/g, "")))
                  .reduce((acc, curr) => acc + (isNaN(curr) ? 0 : curr), 0)
  if (!open) return null;

  return (
    <>
      {/* Backdrop for Offcanvas */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          width: "auto",
          height: "90vh",
          margin: 44,
          borderRadius: "18px",
          background: "rgba(0,0,0,0.3)",
          zIndex: 1000000006,
          transition: "opacity 0.4s",
          opacity: 1,
        }}
      />
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          width: "auto",
          height: "90vh",
          background: "#fff",
          boxShadow: "-2px 0 8px rgba(0,0,0,0.15)",
          zIndex: 1000000007,
          padding: 24,
          margin: 44,
          borderRadius: "18px",
          overflowY: "auto",
          fontFamily: "Noto Sans Thai",
          display: "flex",
          flexDirection: "column",
          scrollbarWidth: "thin",
          scrollbarColor: "#d1d5db #f3f4f6",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontWeight: "bold", fontSize: 18 }}>คำนวณส่วนลด</span>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: 28,
              cursor: "pointer",
              color: "#333",
            }}
            aria-label="close"
          >
            ×
          </button>
        </div>
        <div style={{ marginTop: 24 }}>
          <span className="text-gray-500">สินค้า</span>
          <br></br>
          <h1 className=" font-bold text-gray-800">{item?.productName}</h1>
          <div className="grid grid-cols-2  gap-2">
            <div>
              <span className="text-gray-500">ราคาส่วนลดปัจจุบัน</span>
              <br></br>
              <h1 className="text-2xl font-bold text-gray-800">
                {item?.weightBaseFlag == 1 ? <>
                {Number(Number(item?.priceCN) * (Number(item?.qtyCN)*Number(item?.weight)))?.toLocaleString("th-TH", {
                  style: "currency",
                  currency: "THB",
                })}
                </> : <>
                 {item?.priceCN?.toLocaleString("th-TH", {
                  style: "currency",
                  currency: "THB",
                })}
                </>}
                
              </h1>
            </div>
            <div>
              <span className="text-gray-500">จำนวนที่ทำรายการ</span>
              <br></br>
              <h1 className="text-2xl font-bold text-gray-800">
                {item?.qtyCN} {item?.UOMName} ({totalWeightProblem} กก.)
              </h1>
            </div>
          </div>
          <div className="grid grid-cols-2  gap-2">
           
            <div>
              <span className="text-gray-500">ราคาส่วนลดที่ทำรายการ</span>
              <br></br>
              <h1 className="text-2xl font-bold text-gray-800">
                {Object.values(formattedValue)
                  .map((v) => Number(String(v).replace(/[^0-9.-]+/g, "")))
                  .reduce((acc, curr) => acc + (isNaN(curr) ? 0 : curr), 0)
                  .toLocaleString("th-TH", {
                    style: "currency",
                    currency: "THB",
                  })}
              </h1>
            </div>
             {item?.weightBaseFlag == 1 && (
              <div>
              <span className="text-gray-500">ราคาส่วนลดที่ทำรายการ/กก.</span>
              <br></br>
              <h1 className="text-2xl font-bold text-gray-800">
                {Number(Object.values(formattedValue)
                  .map((v) => Number(String(v).replace(/[^0-9.-]+/g, "")))
                  .reduce((acc, curr) => acc + (isNaN(curr) ? 0 : curr), 0) / (item?.qtyCN * item?.weight))
                  .toLocaleString("th-TH", {
                    style: "currency",
                    currency: "THB",
                  })}
              </h1>
            </div>
            )}
          </div>
          <Button
            size="sm"
            variant="outline"
            className="w-full mt-4"
            disabled={
              Object.values(formattedValue)
                .map((v) => Number(String(v).replace(/[^0-9.-]+/g, "")))
                .reduce((acc, curr) => acc + (isNaN(curr) ? 0 : curr), 0)
                .toLocaleString("th-TH", {
                  style: "currency",
                  currency: "THB",
                }) == "฿0.00"
                || selectedCreditNote?.creditNoteStatus != "NEW" || checkPrice > (item?.price*item.qtyCN)
            }
            onClick={handleRecord}
            
          >
            {isLoading && <Spin size="small"></Spin>}  {checkPrice > (item?.price*item.qtyCN) ? <span className="text-red-500">ราคาส่วนลดเกินราคาเต็ม</span> : "บันทึกข้อมูล"}
          </Button>
          {/*
            Define discount details as an array for mapping.
            Each object contains label and value.
          */}
          {(() => {
            const discountDetails = [
              { label: "บรรจุภัณฑ์", value: 0 },
              { label: "ปนชนิด/ปนไซส์/ตกไซส์", value: 0 },
              { label: "นํ้าหนักไม่เต็ม", value: 0 },
              { label: "คุณภาพ", value: 0 },
              { label: "ส่วนลดแต้ม", value: 0 },
            ];
            return (
              <>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {discountDetails.slice(0, 2).map((detail, idx) => (
                    <div
                      key={detail.label}
                      className="p-4 rounded-lg border hover:bg-gray-100"
                      style={{
                        borderColor:
                          activeIndex === idx ? "#2563eb" : "#e5e7eb",
                        borderWidth: "2px",
                        cursor: "pointer",
                        transition: "border-color 0.2s",
                      }}
                      onClick={() => {
                        setActiveIndex(idx);
                        setPrice(isPrice || 0);
                        setQtyProblem(item?.qtyCN || 0);
                        setTotalWeightProblem(item?.weight || 0);
                        setWeightProblem(item?.weight || 0);
                      }}
                    >
                      <b>{detail.label}</b>
                      <br />
                      <h1 className="text-2xl font-bold text-gray-800">
                        {formattedValue[idx]}
                      </h1>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {discountDetails.slice(2, 4).map((detail, idx) => (
                    <div
                      key={detail.label}
                      className="p-4 rounded-lg border hover:bg-gray-100"
                      style={{
                        borderColor:
                          activeIndex === idx + 2 ? "#2563eb" : "#e5e7eb",
                        borderWidth: "2px",
                        cursor: "pointer",
                        transition: "border-color 0.2s",
                      }}
                      onClick={() => {
                        setActiveIndex(idx + 2);
                        setPrice(isPrice || 0);
                        setQtyProblem(item?.qtyCN || 0);
                        setTotalWeightProblem(item?.weight || 0);
                        setWeightProblem(item?.weight || 0);
                      }}
                    >
                      <b>{detail.label}</b>
                      <br />
                      <h1 className="text-2xl font-bold text-gray-800">
                        {formattedValue[idx + 2]}
                      </h1>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {discountDetails.slice(4, 5).map((detail, idx) => (
                    <div
                      key={detail.label}
                      className="p-4 rounded-lg border hover:bg-gray-100"
                      style={{
                        borderColor:
                          activeIndex === idx + 4 ? "#2563eb" : "#e5e7eb",
                        borderWidth: "2px",
                        cursor: "pointer",
                        transition: "border-color 0.2s",
                      }}
                      onClick={() => {
                        setActiveIndex(idx + 4);
                      }}
                    >
                      <b>{detail.label} </b>
                      <br />
                      <h1 className="text-2xl font-bold text-gray-800">
                        {formattedValue[idx + 4]}
                      </h1>
                    </div>
                  ))}
                </div>
              </>
            );
          })()}

          {activeIndex !== null && activeIndex != 1 && activeIndex != 4 && (
            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="">
                <span className="text-gray-500">ราคา / {UOM}</span>
                <br></br>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={price}
                  
                  onChange={(e) => setPrice(Number(e.target.value))}
                />
              </div>
              <div>
                <span className="text-gray-500">จำนวนกล่องที่พบปัญหา</span>
                <br></br>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={qtyProblem}
                  min={0}
                  disabled
                  max={item?.qtyCN || 0}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setQtyProblem(
                      val > (item?.qtyCN || 0)
                        ? item?.qtyCN || 0
                        : val < 0
                        ? 0
                        : val
                    );
                  }}
                />
              </div>
              <div>
                <span className="text-gray-500">
                  รวมนํ้าหนักกล่องที่พบปัญหา
                </span>
                <br></br>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={totalWeightProblem}
                  disabled
                  min={0}
                  max={(item?.qtyCN || 0) * (item?.weight || 0)}
                  onChange={(e) => {
                    const maxWeight = (item?.qtyCN || 0) * (item?.weight || 0);
                    const val = Number(e.target.value);
                    setTotalWeightProblem(
                      val > maxWeight ? maxWeight : val < 0 ? 0 : val
                    );
                  }}
                />
              </div>
              <div>
                <span className="text-gray-500">นํ้าหนักที่พบปัญหา</span>
                <br></br>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={weightProblem}
                  min={0}
                  max={(item?.qtyCN || 0) * (item?.weight || 0)}
                  onChange={(e) => {
                    const maxWeight = (item?.qtyCN || 0) * (item?.weight || 0);
                    const val = Number(e.target.value);
                    setWeightProblem(
                      val > maxWeight ? maxWeight : val < 0 ? 0 : val
                    );
                  }}
                />
              </div>
              <div>
                <span className="text-gray-500">ปริมาณที่พบปัญหา(%)</span>
                <br></br>
                <h1 className="text-2xl font-bold text-gray-800">
                  {activeIndex !== null &&
                  cardValues[activeIndex]?.displayProblemPercent !== undefined
                    ? Number(calcDisplayProblemPercent(
                        weightProblem,
                        item.weight,
                        activeIndex ?? 0
                      )/item.qtyCN)?.toFixed(2)
                    : Number(calcDisplayProblemPercent(
                        weightProblem,
                        item.weight,
                        activeIndex ?? 0
                      )/item.qtyCN)?.toFixed(2)}{" "}
                  %
                </h1>
              </div>
              <div>
                <span className="text-gray-500">ราคาที่ทำรายการ</span>
                <br></br>
                <h1 className="text-2xl font-bold text-gray-800">
                  {transactionPrice.toLocaleString("th-TH", {
                    style: "currency",
                    currency: "THB",
                  })}
                </h1>
              </div>
              <div className="col-span-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-4 w-full"
                  onClick={() => {
                    if (activeIndex !== null) {
                      setCardValues((prev) => ({
                        ...prev,
                        [activeIndex]: {
                          price,
                          qtyProblem,
                          totalWeightProblem,
                          weightProblem,
                          transactionPrice,
                          displayProblemPercent: calcDisplayProblemPercent(
                            weightProblem,
                            item.weight,
                            activeIndex
                          ),
                          // ...prev[activeIndex]?.itemToGet ? เพิ่มไว้กรณี card 1
                          ...(activeIndex === 1 && prev[activeIndex]?.itemToGet
                            ? { itemToGet: prev[activeIndex].itemToGet }
                            : {}),
                        },
                      }));
                    }
                    // ตัวอย่าง: log หรือส่งข้อมูล
                    console.log("บันทึกยอดเงินที่ทำรายการ:", transactionPrice);
                    setActiveIndex(null);
                  }}
                  disabled={selectedCreditNote?.creditNoteStatus != "NEW"}
                >
                  บันทึกข้อมูล
                </Button>
              </div>
            </div>
          )}
          {activeIndex !== null && activeIndex == 4 && (
            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="">
                <span className="text-gray-500">ราคาส่วนลด</span>
                <br></br>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={price}
                  
                  onChange={(e) => setPrice(Number(e.target.value))}
                />
              </div>
              <div>
                <span className="text-gray-500">จำนวนกล่องที่พบปัญหา</span>
                <br></br>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={qtyProblem}
                  min={0}
                  disabled
                  max={item?.qtyCN || 0}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setQtyProblem(
                      val > (item?.qtyCN || 0)
                        ? item?.qtyCN || 0
                        : val < 0
                        ? 0
                        : val
                    );
                  }}
                />
              </div>
              <div>
                <span className="text-gray-500">
                  รวมนํ้าหนักกล่องที่พบปัญหา
                </span>
                <br></br>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={totalWeightProblem}
                  disabled
                  min={0}
                  max={(item?.qtyCN || 0) * (item?.weight || 0)}
                  onChange={(e) => {
                    const maxWeight = (item?.qtyCN || 0) * (item?.weight || 0);
                    const val = Number(e.target.value);
                    setTotalWeightProblem(
                      val > maxWeight ? maxWeight : val < 0 ? 0 : val
                    );
                  }}
                />
              </div>
              <div>
                <span className="text-gray-500">นํ้าหนักที่พบปัญหา</span>
                <br></br>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={item.weight}
                  min={0}
                  disabled
                  max={(item?.qtyCN || 0) * (item?.weight || 0)}
                  onChange={(e) => {
                    const maxWeight = (item?.qtyCN || 0) * (item?.weight || 0);
                    const val = Number(e.target.value);
                    setWeightProblem(
                      val > maxWeight ? maxWeight : val < 0 ? 0 : val
                    );
                  }}
                />
              </div>
              <div>
                <span className="text-gray-500">ปริมาณที่พบปัญหา(%)</span>
                <br></br>
                <h1 className="text-2xl font-bold text-gray-800">
                  {activeIndex !== null &&
                  cardValues[activeIndex]?.displayProblemPercent !== undefined
                    ? Number(calcDisplayProblemPercent(
                        weightProblem,
                        item.weight,
                        activeIndex ?? 0
                      )/item.qtyCN)?.toFixed(2)
                    : Number(calcDisplayProblemPercent(
                        weightProblem,
                        item.weight,
                        activeIndex ?? 0
                      )/item.qtyCN)?.toFixed(2)}{" "}
                  %
                </h1>
              </div>
              <div>
                <span className="text-gray-500">ราคาที่ทำรายการ</span>
                <br></br>
                <h1 className="text-2xl font-bold text-gray-800">
                  {transactionPrice.toLocaleString("th-TH", {
                    style: "currency",
                    currency: "THB",
                  })}
                </h1>
              </div>
              <div className="col-span-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-4 w-full"
                  onClick={() => {
                    if (activeIndex !== null) {
                      setCardValues((prev) => ({
                        ...prev,
                        [activeIndex]: {
                          price,
                          qtyProblem,
                          totalWeightProblem,
                          weightProblem,
                          transactionPrice,
                          displayProblemPercent: calcDisplayProblemPercent(
                            weightProblem,
                            item.weight,
                            activeIndex
                          ),
                          // ...prev[activeIndex]?.itemToGet ? เพิ่มไว้กรณี card 1
                          ...(activeIndex === 4 && prev[activeIndex]?.itemToGet
                            ? { itemToGet: prev[activeIndex].itemToGet }
                            : {}),
                        },
                      }));
                    }
                    // ตัวอย่าง: log หรือส่งข้อมูล
                    console.log("บันทึกยอดเงินที่ทำรายการ:", transactionPrice);
                    setActiveIndex(null);
                  }}
                  disabled={selectedCreditNote?.creditNoteStatus != "NEW"}
                >
                  บันทึกข้อมูล
                </Button>
              </div>
            </div>
          )}
          {activeIndex !== null && activeIndex == 1 && (
            <div className="mt-4 grid grid-cols-2 gap-2">
              <b className="text-gray-500">ค้นหาสินค้าที่ปน</b>
              <div className="col-span-2">
                <Spin spinning={loadingOptions}>
                  <AsyncSelect<{ value: string; label: string }>
                    className="w-full"
                    styles={{
                      control: (base) => ({
                        ...base,
                        fontFamily: "Noto Sans Thai",
                      }),
                      menu: (base) => ({
                        ...base,
                        fontFamily: "Noto Sans Thai",
                      }),
                    }}
                    placeholder="ค้นหาสินค้าที่ปน"
                    cacheOptions
                    defaultOptions={product.slice(0, 50).map((item) => ({
                      value: item.ItemName,
                      label: item.ItemName,
                    }))}
                    value={
                      cardValues[activeIndex]?.itemToGet
                        ? {
                            value: cardValues[activeIndex]?.itemToGet,
                            label: cardValues[activeIndex]?.itemToGet,
                          }
                        : undefined
                    }
                    loadOptions={(inputValue, callback) => {
                      setLoadingOptions(true);
                      setTimeout(() => {
                        const filtered = product
                          .filter((item) =>
                            item.ItemName.toLowerCase().includes(
                              inputValue.toLowerCase()
                            )
                          )
                          .slice(0, 100) // limit results for performance
                          .map((item) => ({
                            value: item.ItemName,
                            label: item.ItemName,
                          }));
                        callback(filtered);
                        setLoadingOptions(false);
                      }, 200); // simulate async, can be 0 if not needed
                    }}
                    isSearchable={true}
                    onChange={(option) => {
                      // option is { value, label }
                      console.log("Selected value:", option?.value);
                      const selectedPrice =
                        product?.find((item) => item.ItemName === option?.value)
                          ?.LstEvlPric || 0;
                      setCardValues((prev) => ({
                        ...prev,
                        [activeIndex]: {
                          ...prev[activeIndex],
                          itemToGet: option?.value,
                          price: selectedPrice,
                        },
                      }));
                      setPrice(Number(selectedPrice.toFixed(2))); // กำหนดราคาใหม่ในการคำนวณด้วย
                    }}
                  />
                </Spin>
              </div>
              <div className="">
                <span className="text-gray-500">ราคา / {UOM}</span>
                <br></br>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                />
              </div>
              <div>
                <span className="text-gray-500">จำนวนกล่องที่พบปัญหา</span>
                <br></br>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={qtyProblem}
                  min={0}
                  disabled
                  max={item?.qtyCN || 0}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setQtyProblem(
                      val > (item?.qtyCN || 0)
                        ? item?.qtyCN || 0
                        : val < 0
                        ? 0
                        : val
                    );
                  }}
                />
              </div>
              <div>
                <span className="text-gray-500">
                  รวมนํ้าหนักกล่องที่พบปัญหา
                </span>
                <br></br>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={totalWeightProblem}
                  disabled
                  min={0}
                  max={(item?.qtyCN || 0) * (item?.weight || 0)}
                  onChange={(e) => {
                    const maxWeight = (item?.qtyCN || 0) * (item?.weight || 0);
                    const val = Number(e.target.value);
                    setTotalWeightProblem(
                      val > maxWeight ? maxWeight : val < 0 ? 0 : val
                    );
                  }}
                />
              </div>
              <div>
                <span className="text-gray-500">นํ้าหนักที่พบปัญหา</span>
                <br></br>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={weightProblem}
                  min={0}
                  max={(item?.qtyCN || 0) * (item?.weight || 0)}
                  onChange={(e) => {
                    const maxWeight = (item?.qtyCN || 0) * (item?.weight || 0);
                    const val = Number(e.target.value);
                    setWeightProblem(
                      val > maxWeight ? maxWeight : val < 0 ? 0 : val
                    );
                  }}
                />
              </div>
              <div>
                <span className="text-gray-500">ปริมาณที่พบปัญหา(%)</span>
                <br></br>
                <h1 className="text-2xl font-bold text-gray-800">
                  {activeIndex !== null &&
                  cardValues[activeIndex]?.displayProblemPercent !== undefined
                    ? (calcDisplayProblemPercent(
                        weightProblem,
                        item.weight,
                        activeIndex ?? 0
                      )/item.qtyCN)?.toFixed(2)
                    : (calcDisplayProblemPercent(
                        weightProblem,
                        item.weight,
                        activeIndex ?? 0
                      )/item.qtyCN)?.toFixed(2)}
                  %
                </h1>
              </div>
              <div>
                <span className="text-gray-500">ราคาที่ทำรายการ</span>
                <br></br>
                <h1 className="text-2xl font-bold text-gray-800">
                  {transactionPrice.toLocaleString("th-TH", {
                    style: "currency",
                    currency: "THB",
                  })}
                </h1>
              </div>
              <div className="col-span-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-4 w-full"
                  onClick={() => {
                    if (activeIndex !== null) {
                      setCardValues((prev) => ({
                        ...prev,
                        [activeIndex]: {
                          price,
                          qtyProblem,
                          totalWeightProblem,
                          weightProblem,
                          transactionPrice,
                          displayProblemPercent: calcDisplayProblemPercent(
                            weightProblem,
                            item.weight,
                            activeIndex
                          ),
                          // ...prev[activeIndex]?.itemToGet ? เพิ่มไว้กรณี card 1
                          ...(activeIndex === 1 && prev[activeIndex]?.itemToGet
                            ? { itemToGet: prev[activeIndex].itemToGet }
                            : {}),
                        },
                      }));
                    }
                    // ตัวอย่าง: log หรือส่งข้อมูล
                    console.log("บันทึกยอดเงินที่ทำรายการ:", transactionPrice);
                    setActiveIndex(null);
                  }}
                   disabled={selectedCreditNote?.creditNoteStatus != "NEW"}
                >
                  บันทึกข้อมูล
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default DiscountOffcanvas;
