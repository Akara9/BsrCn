import React, { useState, useEffect } from "react";
import { CreditNote } from "../index";
import { StatusFromPOS } from "../variables";
import Badge from "../../ui/badge/Badge";
import {
  getCreditNoteById,
  updateCreditNote,
  updateNameEmpQC,
  creditNoteToB1,
} from "../services";
import GetNameEmpProcess from "../../../services/getNameEmpProcess";
import { useDataContext } from "../../../context";
import FormEditCreditNote from "./formEditCreditNote";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
} from "@mui/material";

import Paper from "@mui/material/Paper";
import { Spin } from "antd";
import Button from "../../ui/button/Button";
import DiscountOffcanvas from "./DiscountOffcanvas";

interface CreditNoteDrawerProps {
  open: boolean;
  showDrawer: boolean;
  onClose: () => void;
  fetchData: () => void;
  selectedCreditNote: CreditNote | null;
  setSelectedCreditNote: React.Dispatch<
    React.SetStateAction<CreditNote | null>
  >;
}

const CreditNoteDrawer: React.FC<CreditNoteDrawerProps> = ({
  open,
  showDrawer,
  onClose,
  selectedCreditNote,
  setSelectedCreditNote,
  fetchData,
}) => {
  if (!open && !showDrawer) return null;
  const { data, setData } = useDataContext();
  // const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(true);
  const [loadingToChangeStatus, setLoadingToChangeStatus] = useState(false);
  const [isForEdit, setIsForEdit] = useState(false);
  const fetchDataInsite = async () => {
    if (selectedCreditNote?.creditNoteId !== undefined) {
      setLoading(true);
      const response = await getCreditNoteById(
        Number(selectedCreditNote.creditNoteId)
      );
      console.log(response);

      if (response?.creditNoteId !== undefined) {
        setSelectedCreditNote(response);
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchDataInsite();
  }, [isForEdit]);

  // Add state for image popup
  const [popupImage, setPopupImage] = useState<string | null>(null);
  const [showDiscountOffcanvas, setShowDiscountOffcanvas] = useState(false);
  const [selectedItemForDiscount, setSelectedItemForDiscount] =
    useState<any>(null);
  const session = JSON.parse(localStorage.getItem("session") || "{}");
  const isCanEditDraft =
    session?.DeptCode == 8 ||
    session?.DeptCode == 39 ||
    session?.DeptCode == 38 ||
    session?.DeptCode == 7;

  const handleCreateDocument = async () => {
    if (!selectedCreditNote) return;
    setLoadingToChangeStatus(true);
    const companyName = {
      BFP_DB: "BOONSIRI FROZEN PRODUCTS CO., Ltd",
      NFF_DB: "Naive Foods Co., Ltd",
      PCC_DB: "บริษัท เพอร์ซี่คูล จำกัด",
      BFPDB: "BOONSIRI FROZEN PRODUCTS CO., Ltd",
      NFFDB: "Naive Foods Co., Ltd",
      PCCDB: "บริษัท เพอร์ซี่คูล จำกัด",
    };
    const isReturn = selectedCreditNote?.items?.some(
      (item) => item?.isReturn == 1
    );
    const res = await updateCreditNote(selectedCreditNote.creditNoteId, {
      Q1: selectedCreditNote?.Q1,
      Q2: selectedCreditNote.Q2,
      Q3: selectedCreditNote.Q3,
      amount: selectedCreditNote.amount,
      branchId: selectedCreditNote.branchId,
      branchName: selectedCreditNote.branchName,
      companyCode: selectedCreditNote.companyCode,
      companyName:
        companyName[selectedCreditNote.companyCode as keyof typeof companyName],
      createdBy: selectedCreditNote.createdBy,
      creditNoteStatus: isReturn ? "WAITINGCN" : "NEW",
      customerCode: selectedCreditNote.customerCode,
      customerName: selectedCreditNote.customerName,
      discount: selectedCreditNote.discount,
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

    if (res?.statusCode == 400) {
      // messageApi.open({
      //   type: "error",
      //   content: res?.message,
      //   style: {
      //     fontFamily: "Noto Sans Thai",
      //   },
      // });
      setData((prevData) => ({
        ...prevData,
        message: res?.message + "-error",
      }));
    }
    await updateNameEmpQC(selectedCreditNote?.creditNoteId, session?.UserName);
    const resGetNameEmp = await GetNameEmpProcess();
    setData((prevData) => ({
      ...prevData,
      CNQR_NameEmProcess: resGetNameEmp,
      message: "สร้างเอกสารสำเร็จ-success",
    }));

    fetchData();
    fetchDataInsite();
    setLoadingToChangeStatus(false);
  };
  const [loadingToB1, setLoadingToB1] = useState(false);
  const handleToB1 = async () => {
    if (!selectedCreditNote) return;
    setLoadingToB1(true);
    const response = await creditNoteToB1(selectedCreditNote.creditNoteId);
    if (response) {
      setData((prev: any) => ({
        ...prev,
        message: "ส่ง B1 สำเร็จ-success",
      }));
      fetchData();
      fetchDataInsite();
      setLoadingToB1(false);
    }
  };
  const handleRollBackDocument = async () => {
    if (!selectedCreditNote) return;
    setLoadingToChangeStatus(true);
    const companyName = {
      BFP_DB: "BOONSIRI FROZEN PRODUCTS CO., Ltd",
      NFF_DB: "Naive Foods Co., Ltd",
      PCC_DB: "บริษัท เพอร์ซี่คูล จำกัด",
      BFPDB: "BOONSIRI FROZEN PRODUCTS CO., Ltd",
      NFFDB: "Naive Foods Co., Ltd",
      PCCDB: "บริษัท เพอร์ซี่คูล จำกัด",
    };

    const res = await updateCreditNote(selectedCreditNote.creditNoteId, {
      Q1: selectedCreditNote?.Q1,
      Q2: selectedCreditNote.Q2,
      Q3: selectedCreditNote.Q3,
      amount: selectedCreditNote.amount,
      branchId: selectedCreditNote.branchId,
      branchName: selectedCreditNote.branchName,
      companyCode: selectedCreditNote.companyCode,
      companyName:
        companyName[selectedCreditNote.companyCode as keyof typeof companyName],
      createdBy: selectedCreditNote.createdBy,
      creditNoteStatus: "DRAFT",
      customerCode: selectedCreditNote.customerCode,
      customerName: selectedCreditNote.customerName,
      discount: selectedCreditNote.discount,
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
    setData((prevData) => ({
      ...prevData,
      message: "ย้อนกลับสถานะสำเร็จ-success",
    }));
    if (res?.statusCode == 400) {
      // messageApi.open({
      //   type: "error",
      //   content: res?.message,
      //   style: {
      //     fontFamily: "Noto Sans Thai",
      //   },
      // });
      setData((prevData) => ({
        ...prevData,
        message: res?.message + "-error",
      }));
    }
    fetchData();
    fetchDataInsite();
    setLoadingToChangeStatus(false);
  };

  const isCanToB1 =
    selectedCreditNote?.reason1 != "แต้มแลกส่วนลด"
      ? selectedCreditNote?.items?.some(
          (item) =>
            !data?.CNQR_calcurateDiscount?.some(
              (row: any) =>
                row?.creditNoteId == selectedCreditNote?.creditNoteId &&
                row?.creditNoteItemId == item?.id
            )
        )
      : false;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          background: "rgba(0,0,0,0.3)",
          zIndex: 999999,
          transition: "opacity 0.4s",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
        }}
      />
      {/* {contextHolder} */}
      {/* Drawer */}
      <div
        style={
          {
            position: "fixed",
            top: 0,
            right: 0,
            width: "auto",
            height: "90vh",
            background: "#fff",
            boxShadow: "-2px 0 8px rgba(0,0,0,0.15)",
            zIndex: showDiscountOffcanvas ? 99999 : 1000000,
            padding: 24,
            margin: 44,
            borderRadius: "18px",
            overflowY: "auto",
            fontFamily: "Noto Sans Thai",
            transform: open ? "translateX(0)" : "translateX(100%)",
            transition: open
              ? "transform 0.7s cubic-bezier(.4,0,.2,1)"
              : "transform 0.4s cubic-bezier(.4,0,.2,1)",
            /* Custom scrollbar */
            scrollbarWidth: "thin",
            scrollbarColor: "#d1d5db #f3f4f6",
          } as React.CSSProperties
        }
        // Add custom scrollbar via inline style and global CSS
        className="credit-note-drawer-scrollbar"
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <span style={{ fontWeight: "bold", fontSize: 18 }}>
            {selectedCreditNote ? selectedCreditNote.creditNoteNo : ""}{" "}
            <Badge
              size="sm"
              color={
                selectedCreditNote?.creditNoteStatus === "DRAFT"
                  ? "info"
                  : selectedCreditNote?.creditNoteStatus === "APPROVED"
                  ? "success"
                  : selectedCreditNote?.creditNoteStatus === "CANCELED"
                  ? "error"
                  : selectedCreditNote?.creditNoteStatus === "INVUPDATE"
                  ? "warning"
                  : selectedCreditNote?.creditNoteStatus === "RECEIVED"
                  ? "primary"
                  : selectedCreditNote?.creditNoteStatus === "WAITINGCN"
                  ? "dark"
                  : selectedCreditNote?.creditNoteStatus === "NEW"
                  ? "info"
                  : "light"
              }
            >
              {
                StatusFromPOS[
                  selectedCreditNote?.creditNoteStatus as keyof typeof StatusFromPOS
                ]
              }
            </Badge>
          </span>
          <div className="flex gap-2">
            {selectedCreditNote?.creditNoteStatus === "DRAFT" && !isForEdit && (
              <>
                {isCanEditDraft && (
                  <>
                    <Button
                      onClick={handleCreateDocument}
                      size="sm"
                      variant="outline"
                      aria-label="close"
                    >
                      {loadingToChangeStatus && <Spin />} สร้างเอกสาร
                    </Button>
                  </>
                )}
              </>
            )}
            {selectedCreditNote?.creditNoteStatus == "NEW" &&
              isCanEditDraft && (
                <>
                  {isCanEditDraft && (
                    <>
                      <Button
                        onClick={handleToB1}
                        size="sm"
                        variant="outline"
                        aria-label="close"
                        disabled={loadingToChangeStatus || isCanToB1}
                      >
                        {loadingToB1 && <Spin />} ส่ง B1
                      </Button>
                    </>
                  )}
                </>
              )}
            {selectedCreditNote?.creditNoteStatus != "DRAFT" &&
              selectedCreditNote?.creditNoteStatus != "RECEIVED" &&
              selectedCreditNote?.creditNoteStatus != "APPROVED" && (
                <>
                  {isCanEditDraft && (
                    <>
                      <Button
                        onClick={handleRollBackDocument}
                        size="sm"
                        variant="outline"
                        aria-label="close"
                      >
                        {loadingToChangeStatus && <Spin />} ย้อนกลับสถานะ
                      </Button>
                    </>
                  )}
                </>
              )}

            {(session?.UserName == selectedCreditNote?.createdBy ||
              isCanEditDraft) &&
              selectedCreditNote?.creditNoteStatus == "DRAFT" && (
                <Button
                  size="sm"
                  variant="outline"
                  aria-label="close"
                  onClick={() => setIsForEdit(!isForEdit)}
                >
                  {isForEdit ? "ยกเลิกการแก้ไขข้อมูล" : "แก้ไขข้อมูล"}
                </Button>
              )}
            <Button
              onClick={onClose}
              size="sm"
              variant="outline"
              aria-label="close"
            >
              ปิด
            </Button>
          </div>
        </div>
        {selectedCreditNote && !isForEdit ? (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-100 p-3 rounded-lg">
                <b>เลขที่ใบแจ้งหนี้</b> <br></br>
                {selectedCreditNote.invoiceNo}
              </div>
              <div className="bg-gray-100 p-3 rounded-lg">
                <b>ชื่อลูกค้า</b> <br></br>
                {selectedCreditNote.customerName} (
                {selectedCreditNote.whGrpName})
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-100 p-3 rounded-lg">
                <b>ผู้สร้างใบลดหนี้</b> <br></br>
                {selectedCreditNote.createdBy}
              </div>
              <div className="bg-gray-100 p-3 rounded-lg">
                <b>สร้างเมื่อ</b> <br></br>
                {selectedCreditNote.createdAt
                  ? new Date(selectedCreditNote.createdAt).toLocaleString(
                      "th-TH",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      }
                    )
                  : ""}
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-gray-100 p-3 rounded-lg">
                <b>จำนวนเงินขอลดหนี้</b> <br></br>
                <b className="text-[20px]">
                  {typeof selectedCreditNote.discount === "number"
                    ? selectedCreditNote.discount.toLocaleString("en-US", {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      })
                    : selectedCreditNote.discount}
                </b>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-100 p-3 rounded-lg">
                <b>เหตุผล 1</b> <br></br>
                {selectedCreditNote.reason1}
              </div>
              <div className="bg-gray-100 p-3 rounded-lg">
                <b>เหตุผล 2</b> <br></br>
                {selectedCreditNote.reason2}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-100 p-3 rounded-lg">
                <b>รูปแบบ</b> <br></br>
                {selectedCreditNote?.items?.some((item) => item?.isReturn == 1)
                  ? "คืนสินค้าพร้อมลดหนี้"
                  : "ลดหนี้อย่างเดียว"}
              </div>
              <div className="bg-gray-100 p-3 rounded-lg">
                <b>ส่ง B1</b> <br></br>
                {selectedCreditNote.datetimeToB1
                  ? new Date(selectedCreditNote.datetimeToB1).toLocaleString(
                      "th-TH",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      }
                    )
                  : "ยังไม่ส่ง B1"}
              </div>
            </div>
            <div className="grid grid-cols-1 gap-1 ">
              <b>รายการสินค้า</b>
              <Spin spinning={loading} size="large">
                <div className=" border-2 border-gray-200 rounded-lg ">
                  <TableContainer
                    component={Paper}
                    sx={{ boxShadow: "none", background: "transparent" }}
                  >
                    <Table className="w-full border-collapse">
                      <TableHead>
                        <TableRow>
                          <TableCell className=" px-4 py-2 whitespace-nowrap">
                            ชื่อสินค้า
                          </TableCell>
                          <TableCell className=" px-4 py-2 whitespace-nowrap">
                            จำนวนเต็ม
                          </TableCell>
                          <TableCell className=" px-4 py-2 whitespace-nowrap">
                            ราคาเต็ม
                          </TableCell>

                          <TableCell className=" px-4 py-2 whitespace-nowrap">
                            จำนวนที่ทำรายการ
                          </TableCell>
                          <TableCell className=" px-4 py-2 whitespace-nowrap">
                            ราคาที่ทำรายการ
                          </TableCell>
                          {isCanEditDraft && (
                            <TableCell className=" px-4 py-2 whitespace-nowrap">
                              ผ่านการคำนวณส่วนลด
                            </TableCell>
                          )}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {/* Only allow row click if isReturn == false for all items */}
                        {selectedCreditNote?.items?.map((item, index) => (
                          <TableRow
                            key={index}
                            style={{
                              cursor: selectedCreditNote?.items?.some(
                                (i) => i?.isReturn == 1
                              )
                                ? "default"
                                : "pointer",
                            }}
                            onClick={() => {
                              if (
                                selectedCreditNote?.items?.some(
                                  (i) => i?.isReturn == 1
                                ) === false &&
                                isCanEditDraft
                              ) {
                                setSelectedItemForDiscount(item);
                                setShowDiscountOffcanvas(true);
                              }
                            }}
                          >
                            <TableCell className=" px-4 py-2 whitespace-nowrap">
                              {item.productName}
                            </TableCell>
                            <TableCell
                              className=" px-4 py-2 text-right whitespace-nowrap"
                              style={{
                                textAlign: "right",
                              }}
                            >
                              <b>
                                {typeof item.qty === "number"
                                  ? item.qty.toLocaleString("en-US", {
                                      minimumFractionDigits: 0,
                                      maximumFractionDigits: 0,
                                    })
                                  : item.qty}
                              </b>
                            </TableCell>
                            <TableCell
                              className=" px-4 py-2 text-right whitespace-nowrap"
                              style={{
                                textAlign: "right",
                              }}
                            >
                              <b>
                                {typeof item.price === "number"
                                  ? item.price.toLocaleString("en-US", {
                                      minimumFractionDigits: 0,
                                      maximumFractionDigits: 0,
                                    })
                                  : item.price}
                              </b>
                            </TableCell>
                            {item?.weightBaseFlag == 1 ? (
                              <TableCell
                                className=" px-4 py-2 text-right whitespace-nowrap"
                                style={{
                                  textAlign: "right",
                                }}
                              >
                                <b>
                                  {typeof Number(item.qtyCN) === "number"
                                    ? Number(item.qtyCN).toLocaleString(
                                        "en-US",
                                        {
                                          minimumFractionDigits: 0,
                                          maximumFractionDigits: 0,
                                        }
                                      )
                                    : Number(item.qtyCN)}{" "}
                                  (
                                  {typeof Number(item?.weight) === "number" &&
                                  typeof Number(item.qtyCN) === "number"
                                    ? Number(item.weight) * Number(item.qtyCN)
                                    : 0}{" "}
                                  กก.)
                                </b>
                              </TableCell>
                            ) : (
                              <TableCell
                                className=" px-4 py-2 text-right whitespace-nowrap"
                                style={{
                                  textAlign: "right",
                                }}
                              >
                                <b>
                                  {typeof Number(item.qtyCN) === "number"
                                    ? Number(item.qtyCN).toLocaleString(
                                        "en-US",
                                        {
                                          minimumFractionDigits: 0,
                                          maximumFractionDigits: 0,
                                        }
                                      )
                                    : Number(item.qtyCN)}
                                </b>
                              </TableCell>
                            )}
                            {item?.weightBaseFlag == 1 ? (
                              <TableCell
                                className=" px-4 py-2 text-right whitespace-nowrap"
                                style={{
                                  textAlign: "right",
                                }}
                              >
                                <b>
                                  ราคา/กก.{" "}
                                  {typeof Number(item.priceCN) === "number"
                                    ? Number(item.priceCN).toLocaleString(
                                        "en-US",
                                        {
                                          minimumFractionDigits: 0,
                                          maximumFractionDigits: 0,
                                        }
                                      )
                                    : Number(item.priceCN)}{" "}
                                  บาท รวม{" "}
                                  {typeof Number(item?.weight) === "number" &&
                                  typeof item.qtyCN === "number"
                                    ? (
                                        Number(item.weight) *
                                        Number(item.qtyCN) *
                                        Number(item.priceCN)
                                      ).toLocaleString()
                                    : 0}{" "}
                                </b>
                              </TableCell>
                            ) : (
                              <TableCell
                                className=" px-4 py-2 text-right whitespace-nowrap"
                                style={{
                                  textAlign: "right",
                                }}
                              >
                                <b>
                                  {typeof item.priceCN === "number"
                                    ? item.priceCN.toLocaleString("en-US", {
                                        minimumFractionDigits: 0,
                                        maximumFractionDigits: 0,
                                      })
                                    : item.priceCN}
                                </b>
                              </TableCell>
                            )}

                            {isCanEditDraft && (
                              <TableCell className=" px-4 py-2 whitespace-nowrap">
                                {/* Show check or waiting icon based on discount calculation */}
                                {data?.CNQR_calcurateDiscount?.some(
                                  (row: any) =>
                                    row?.creditNoteId ==
                                      selectedCreditNote?.creditNoteId &&
                                    row?.creditNoteItemId == item?.id
                                ) ? (
                                  <span
                                    title="ผ่านการคำนวณส่วนลด"
                                    style={{ color: "green", fontSize: 20 }}
                                  >
                                    ✅
                                  </span>
                                ) : (
                                  <span
                                    title="รอคำนวณส่วนลด"
                                    style={{ color: "orange", fontSize: 20 }}
                                  >
                                    ⏳
                                  </span>
                                )}
                              </TableCell>
                            )}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </div>
              </Spin>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div className=" p-3 rounded-lg">
                <b>รูปภาพ</b> <br></br>
                <br></br>
                <Spin spinning={loading} size="large">
                  {(selectedCreditNote?.files?.length ?? 0) > 0 ? (
                    <div className="grid grid-cols-5 gap-1">
                      {selectedCreditNote?.files?.map((image, index) => (
                        <img
                          key={index}
                          src={String(image?.filePath)}
                          alt={`Image ${index + 1}`}
                          className=" rounded-lg shadow-lg cursor-pointer"
                          width={100}
                          height={100}
                          style={{
                            maxHeight: 100,
                          }}
                          onClick={() => setPopupImage(String(image?.filePath))}
                        />
                      ))}
                    </div>
                  ) : (
                    <span>ไม่มีรูปภาพ</span>
                  )}
                </Spin>
              </div>
            </div>
          </div>
        ) : null}

        {isForEdit && selectedCreditNote ? (
          <FormEditCreditNote
            selectedCreditNote={selectedCreditNote}
            setSelectedCreditNote={setSelectedCreditNote}
            fetchDataInsite={fetchDataInsite}
            setIsForEdit={setIsForEdit}
            fetchData={fetchData}
          />
        ) : null}
      </div>
      {/* Popup for large image */}
      {popupImage && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.7)",
            zIndex: 10000000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={() => setPopupImage(null)}
        >
          <div
            style={{
              position: "relative",
              background: "#fff",
              padding: 16,
              borderRadius: 12,
              boxShadow: "0 4px 24px rgba(0,0,0,0.2)",
              maxWidth: "90vw",
              maxHeight: "90vh",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPopupImage(null)}
              style={{
                position: "absolute",
                top: 8,
                right: 12,
                background: "none",
                border: "none",
                fontSize: 28,
                cursor: "pointer",
                color: "#333",
                zIndex: 1,
              }}
              aria-label="close"
            >
              ×
            </button>
            <img
              src={popupImage}
              alt="Large preview"
              style={{
                maxWidth: "80vw",
                maxHeight: "80vh",
                borderRadius: 8,
                boxShadow: "0 2px 12px rgba(0,0,0,0.2)",
              }}
            />
          </div>
        </div>
      )}
      {/* Discount Calculation Offcanvas */}
      <div key={selectedItemForDiscount}>
        {showDiscountOffcanvas && (
          <DiscountOffcanvas
            open={showDiscountOffcanvas}
            onClose={() => setShowDiscountOffcanvas(false)}
            item={selectedItemForDiscount}
            selectedCreditNote={selectedCreditNote}
            fetchData={fetchData}
            fetchDataInsite={fetchDataInsite}
          />
        )}
      </div>
    </>
  );
};

export default CreditNoteDrawer;
