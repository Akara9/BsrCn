import React, { useEffect } from "react";
import { CreditNote, InvList } from "../index";
import { Button, Spin, Upload, Input, Select, Popover, Modal } from "antd";
import { Reason, companyName } from "../variables";
import { FaCircleCheck } from "react-icons/fa6";
import {
  getInvoiceForCreateById,
  detroyCreditNoteFile,
  detroyCreditNoteItem,
  detroyCreditNote,
  updateCreditNote,
  //   updateCreditNoteItemById,
  createCreditNoteByItem,
  updateCreditNoteByItems,
  createCreditNoteByFile,
  getCreditNoteItemsForCheck,
} from "../services";
import { useDataContext } from "../../../context";
interface isItemForCheckCredit {
  id: number;
  creditNoteId: number;
  productCode: string;
  productName: string;
  qty: number | string;
  price: number | string;
  isReturn: number;
  qtyCN: number;
  priceCN: number;
  createdAt: string;
  UOMCode: string;
  UOMName: string;
  UOMEntry: string | number;
  taxNo: string;
  vatGroup: string;
  binLocation: string;
  weight: number | string;
  whGrpCode: string;
  whGrpName: string;
  weightBaseFlag: number;
  childBinLocation: string;
}

interface FormEditCreditNoteProps {
  selectedCreditNote: CreditNote;
  setSelectedCreditNote: (note: any) => void;
  fetchDataInsite: () => void;
  fetchData: () => void;
  setIsForEdit: (isEdit: boolean) => void;
  // Add more props if needed
}

const formEditCreditNote = ({
  selectedCreditNote,
  fetchDataInsite,
  fetchData,
  setIsForEdit,
}: // setSelectedCreditNote,
// fetchDataInsite,
// setIsForEdit,
FormEditCreditNoteProps) => {
  // ...existing code...
  const [selectedCNType, setSelectedCNType] = React.useState<
    "return" | "credit"
  >(
    selectedCreditNote?.items?.some((item) => item.isReturn == 0)
      ? "credit"
      : "return"
  );
  const { setData } = useDataContext();
  const [itemQuantities, setItemQuantities] = React.useState<{
    [key: string]: number;
  }>({});
  const [reason, setReason] = React.useState<string | null>(
    selectedCreditNote?.reason1 ?? null
  );
  const [reason2, setReason2] = React.useState<string | null>(
    selectedCreditNote?.reason2 ?? null
  );
  const [uploadedFiles, setUploadedFiles] = React.useState<any[]>([]);

  const [selectedOrder, setSelectedOrder] = React.useState<InvList | null>(
    null
  );
  const [loading, setLoading] = React.useState(false);
  const [isItemForCheckCredit, setIsItemForCheckCredit] = React.useState<
    isItemForCheckCredit[]
  >([]);

  // State for Popover visibility per file id
  const [visiblePopovers, setVisiblePopovers] = React.useState<{
    [key: string]: boolean;
  }>({});

  // Modal state for cancel credit note
  const [cancelModalOpen, setCancelModalOpen] = React.useState(false);

  // Handler to show/hide popover
  const handlePopoverVisibleChange = (
    fileId: string | number,
    visible: boolean
  ) => {
    setVisiblePopovers((prev) => ({ ...prev, [fileId]: visible }));
  };

  // Sync itemQuantities with selectedOrder items
  useEffect(() => {
    if (selectedCreditNote?.items) {
      const initialQuantities: { [key: string]: number } = {};
      selectedCreditNote.items.forEach((item) => {
        const ItemId = item.id;
        const qty = item.qtyCN || 0;
        initialQuantities[ItemId] = Number(qty);
      });
      setItemQuantities(initialQuantities);
    }
  }, [selectedOrder]);
  // Handler to change quantity
  const handleQuantityChange = (itemId: number, delta: number) => {
    setItemQuantities((prev) => {
      const newQty = Math.max(0, (prev[itemId] ?? 0) + delta);
      return { ...prev, [itemId]: newQty };
    });
  };
  console.log(itemQuantities);
  const [isCNDiscount, setIsCNDiscount] = React.useState<boolean>(false);
  const [isReturn, setIsReturn] = React.useState<boolean>(false);
  const fetchInvoice = async (invoiceId: number) => {
    setLoading(true);
    const response = await getInvoiceForCreateById(invoiceId);
    console.log(response);
    if (response) {
      setSelectedOrder(response);
      const itemsForCheck = selectedOrder
        ? await getCreditNoteItemsForCheck(selectedOrder.invoiceNo)
        : null;
      if (itemsForCheck) {
        setIsItemForCheckCredit(
          itemsForCheck.data?.filter(
            (item: isItemForCheckCredit) =>
              item.creditNoteId != selectedCreditNote?.creditNoteId
          )
        );
        setIsCNDiscount(
          itemsForCheck.data
            ?.filter(
              (item: isItemForCheckCredit) =>
                item.creditNoteId != selectedCreditNote?.creditNoteId
            )
            ?.some((item: isItemForCheckCredit) => item.isReturn == 0)
        );
        setIsReturn(
          itemsForCheck.data
            ?.filter(
              (item: isItemForCheckCredit) =>
                item.creditNoteId != selectedCreditNote?.creditNoteId
            )
            ?.some((item: isItemForCheckCredit) => item.isReturn == 0)
        );
      }
      setLoading(false);
    }
  };
  useEffect(() => {
    if (selectedCreditNote) {
      fetchInvoice(selectedCreditNote.invoiceId);
    }
  }, []);

  // Calculate total amount
  const totalAmount =
    selectedOrder?.items?.reduce((sum: number, item: any) => {
      const ItemId =
        selectedCreditNote?.items?.find(
          (i) => i.productCode == item.productCode
        )?.id || item.id;
      if (item.weightBaseFlag == 1) {
        return (
          sum +
          (itemQuantities[ItemId] ?? 0) * (item.weight ?? 0) * (item.price ?? 0)
        );
      }
      return sum + (itemQuantities[ItemId] ?? 0) * (item.price ?? 0);
    }, 0) ?? 0;

  // Placeholder for "for recev"
  // You can replace this with actual logic as needed

  const handleToUpdateCreditNote = async () => {
    setLoading(true);
    const creditNoteData = {
      Q1: selectedCreditNote?.Q1 ?? 0,
      Q2: selectedCreditNote?.Q2 ?? 0,
      Q3: selectedCreditNote?.Q3 ?? 0,
      amount: selectedCreditNote?.amount ?? 0,
      branchId: selectedCreditNote?.branchId ?? 0,
      branchName: selectedCreditNote?.branchName ?? "",
      companyCode: selectedCreditNote?.companyCode ?? "",
      companyName:
        companyName[
          selectedCreditNote?.companyCode as keyof typeof companyName
        ] ?? "",
      createdBy: selectedCreditNote?.createdBy ?? "",
      creditNoteStatus: "DRAFT",
      customerCode: selectedCreditNote?.customerCode ?? "",
      customerName: selectedCreditNote?.customerName ?? "",
      discount: totalAmount,
      invenName: selectedCreditNote?.invenName ?? "",
      invoiceId: selectedCreditNote?.invoiceId ?? 0,
      invoiceNo: selectedCreditNote?.invoiceNo ?? "",
      reason1: reason ?? "",
      reason2: reason2 ?? "",
      reasonCode1: Reason.find((row: any) => row.reasonName == reason)
        ?.reasonCode,
      saleName: selectedCreditNote?.saleName ?? "",
      salePersonCode: selectedCreditNote?.salePersonCode ?? 0,
      temperature: selectedCreditNote?.temperature ?? "",
      weight: selectedOrder?.items?.reduce((sum: number, item: any) => {
        const ItemId =
          selectedCreditNote?.items?.find(
            (row: any) => row.productCode == item.productCode
          )?.id || item.id;
        if (
          itemQuantities[ItemId] == 0 ||
          itemQuantities[ItemId] == undefined
        ) {
          return sum;
        }
        return sum + (itemQuantities[ItemId] ?? 0) * (item.weight ?? 0);
      }, 0),
      whGrpCode: selectedCreditNote?.whGrpCode ?? "",
      whGrpName: selectedCreditNote?.whGrpName ?? "",
    };
    const items = selectedOrder?.items
      ?.map((item: any) => {
        let isToDelete = false;
        let isToEdit = false;
        const ItemId =
          selectedCreditNote?.items?.find(
            (i) => i.productCode == item.productCode
          )?.id || item.id;
        if (
          itemQuantities[ItemId] == 0 &&
          selectedCreditNote?.items?.find(
            (i) => i.productCode == item.productCode
          )?.id != undefined
        ) {
          isToDelete = true;
        }
        if (
          itemQuantities[ItemId] > 0 &&
          selectedCreditNote?.items?.find(
            (i) => i.productCode == item.productCode
          )?.id != undefined
        ) {
          isToEdit = true;
        }
        return {
          id: ItemId,
          productCode: item.productCode,
          qtyCN: itemQuantities[ItemId] ?? 0,
          priceCN: item.price * (itemQuantities[ItemId] ?? 0),
          isReturn: selectedCNType == "return" ? true : false,
          binLocation: "",
          isToDelete: isToDelete,
          isToEdit: isToEdit,
          productName: item.productName,
          qty: item.qty,
          price: item.price,
          amount: item.amount,
          weight: item.weight,
          UOMCode: item.UOMCode,
          UOMName: item.UOMName,
          UOMEntry: item.UOMEntry,
          whGrpCode: item.whGrpCode,
          whGrpName: item.whGrpName,
          companyCode: item.companyCode,
          companyName: item.companyName,
          taxNo: item.taxNo,
          vatGroup: item.vatGroup,
          weightBaseFlag: item.weightBaseFlag,
          childBinLocation: item.childBinLocation ?? "",
        };
      })
      ?.filter((item: any) => item.qtyCN > 0 || item.isToDelete == true);
    const filePayLoad = new FormData();
    uploadedFiles.forEach((file) => {
      filePayLoad.append("files", file.originFileObj);
    });
    filePayLoad.append("whGrpCode", selectedOrder?.whGrpCode ?? "");
    console.log(items);
    console.log(creditNoteData);
    console.log(uploadedFiles);

    await updateCreditNote(selectedCreditNote?.creditNoteId, creditNoteData);

    if (items) {
      items.forEach(async (item: any) => {
        const ItemId = item.id;
        if (item.isToDelete) {
          await detroyCreditNoteItem(selectedCreditNote?.creditNoteId, item.id);
        } else if (item.isToEdit) {
          await updateCreditNoteByItems(
            item.id,
            selectedCreditNote?.creditNoteId,

            {
              productCode: item.productCode,
              qtyCN: itemQuantities[ItemId] ?? 0,
              priceCN: (itemQuantities[ItemId] ?? 0) * (item.price ?? 0),
              isReturn: selectedCNType == "return" ? true : false,
              binLocation: "",
              id: item.id,
              creditNoteId: selectedCreditNote?.creditNoteId,
              weightBaseFlag: item.weightBaseFlag,
            }
          );
        } else {
          await createCreditNoteByItem(
            {
              productCode: item.productCode,
              productName: item.productName,
              qty: Number(item.qty),
              price: Number(item.price),
              amount: Number(item.amount),
              weight: Number(item.weight),
              UOMCode: item.UOMCode,
              UOMName: item.UOMName,
              UOMEntry: item.UOMEntry,
              whGrpCode: item.whGrpCode,
              whGrpName: item.whGrpName,
              companyCode: item.companyCode,
              companyName: item.companyName,
              taxNo: item.taxNo,
              vatGroup: item.vatGroup,
              binLocation: "",
              qtyCN: Number(itemQuantities[ItemId] ?? 0),
              priceCN: Number(
                (itemQuantities[ItemId] ?? 0) * (item.price ?? 0)
              ),
              isReturn: selectedCNType == "return" ? true : false,
              weightBaseFlag: item.weightBaseFlag,
              childBinLocation: "",
            },
            selectedCreditNote?.creditNoteId
          );
        }
      });
    }
    if (uploadedFiles.length > 0) {
      await createCreditNoteByFile(
        filePayLoad,
        selectedCreditNote?.creditNoteId
      );
    }
    setData((prev: any) => ({
      ...prev,
      message: "แก้ไขใบลดหนี้สำเร็จ-success",
    }));
    setTimeout(() => {
      setIsForEdit(false);
      setLoading(false);
    }, 1000);
  };
  console.log(selectedCNType);
  return (
    <Spin spinning={loading}>
      <div className="flex flex-col gap-2">
        <div>
          <b className="text-gray-500">ใบสั่งขาย</b> <br />
          <b className=" text-[20px]">{selectedCreditNote?.invoiceNo}</b>
        </div>
        <div>
          <b className="text-gray-500">ชื่อลูกค้า</b> <br />
          <b className=" text-[20px]">{selectedCreditNote?.customerName}</b>
        </div>
        <div>
          <b className="text-gray-500">ผู้สร้างใบแจ้งหนี้</b> <br />
          <b className=" text-[20px]">{selectedCreditNote?.saleName}</b>
        </div>
        <div>
          <b className="text-gray-500">สร้างเมื่อ</b> <br />
          <b className=" text-[20px]">
            {selectedCreditNote.createdAt
              ? new Date(selectedCreditNote.createdAt).toLocaleString("th-TH", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })
              : ""}
          </b>
        </div>
        <div>
          <b className="text-gray-500">คุณต้องการสร้างใบลดหนี้รูปแบบใด ?</b>{" "}
          <br />
          <div className="flex gap-2 mt-2">
            <Button
              style={
                selectedCNType === "return"
                  ? { borderColor: "green", borderWidth: 2, color: "green" }
                  : {}
              }
              onClick={() => setSelectedCNType("return")}
              icon={
                selectedCNType === "return" ? (
                  <FaCircleCheck className="text-green-500" />
                ) : undefined
              }
              disabled={isReturn}
            >
              คืนสินค้าพร้อมลดหนี้
            </Button>
            <Button
              style={
                selectedCNType === "credit"
                  ? { borderColor: "green", borderWidth: 2, color: "green" }
                  : {}
              }
              onClick={() => setSelectedCNType("credit")}
              className={selectedCNType === "credit" ? "text-green-500" : ""}
              disabled={isCNDiscount}
              icon={
                selectedCNType === "credit" ? (
                  <FaCircleCheck className="text-green-500" />
                ) : undefined
              }
            >
              ลดหนี้อย่างเดียว
            </Button>
          </div>
          {selectedCNType != null && (
            <>
              <div className="flex flex-col gap-2 mt-2">
                {/* Cart summary */}
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-semibold text-lg">
                      ต้องการทำรายการใดบ้าง ?
                    </span>
                    <br></br>
                    <small>หากไม่ต้องการทำรายการนั้นๆ ให้ปรับยอดเป็น 0</small>
                  </div>
                  <span className="text-gray-400 text-sm">
                    {selectedOrder?.items?.length ?? 0} รายการ
                  </span>
                </div>
                {/* Cart items */}
                {selectedOrder?.items?.map((item: any) => {
                  const ItemId =
                    selectedCreditNote?.items?.find(
                      (i) => i.productCode == item.productCode
                    )?.id || item.id;
                  return (
                    <div
                      className="flex items-center gap-3 py-2 border-b border-gray-100"
                      key={ItemId}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">
                          {item.productName}
                        </div>
                        {item.weightBaseFlag == 1 ? (
                          <>
                            <div className="text-gray-400 text-xs">
                              {itemQuantities[ItemId] ?? 0} กล่อง (
                              {item.weight * (itemQuantities[ItemId] ?? 0)}{" "}
                              กก.)x ราคาต่อกิโล {item.price ?? 0} บาท &nbsp;รวม{" "}
                              <b>
                                {(
                                  item.weight *
                                  (itemQuantities[ItemId] ?? 0) *
                                  (item.price ?? 0)
                                ).toLocaleString()}
                              </b>{" "}
                              บาท
                            </div>
                          </>
                        ) : (
                          <div className="text-gray-400 text-xs">
                            {itemQuantities[ItemId] ?? 0}x {item.price ?? 0} บาท
                            รวม&nbsp;
                            <b>
                              {(
                                (itemQuantities[ItemId] ?? 0) *
                                (item.price ?? 0)
                              ).toLocaleString()}
                            </b>{" "}
                            บาท
                          </div>
                        )}
                        {isItemForCheckCredit?.some(
                          (row: isItemForCheckCredit) =>
                            row.productCode == item.productCode
                        ) && (
                          <span className="text-red-300">
                            มีการทำรายการไปแล้ว{" "}
                            {isItemForCheckCredit?.find(
                              (row: isItemForCheckCredit) =>
                                row.productCode == item.productCode
                            )?.qtyCN ?? 0}{" "}
                            {item.UOMCode}
                          </span>
                        )}
                      </div>
                      {/* Quantity controls */}
                      <div className="flex items-center gap-2">
                        <button
                          className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center text-lg font-bold text-gray-500 hover:bg-gray-200"
                          onClick={() => handleQuantityChange(ItemId, -1)}
                          type="button"
                        >
                          –
                        </button>
                        <span className="w-6 text-center">
                          {itemQuantities[ItemId] ?? 0}
                        </span>
                        <button
                          className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center text-lg font-bold text-gray-500 hover:bg-gray-200"
                          onClick={() => handleQuantityChange(ItemId, 1)}
                          type="button"
                          disabled={
                            (itemQuantities[ItemId] ?? 0) >=
                            (item.qty ?? 0) -
                              (isItemForCheckCredit?.find(
                                (row: isItemForCheckCredit) =>
                                  row.productCode == item.productCode
                              )?.qtyCN ?? 0)
                          }
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                })}
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-semibold text-lg">ยอดรวม</span>
                    <br></br>
                  </div>
                  <span className="text-gray-400 text-sm">
                    {totalAmount.toLocaleString()} บาท
                  </span>
                </div>
                <br></br>
                <div>
                  <b>เหตุผล 1</b>
                  <Select
                    className="w-full"
                    value={selectedCreditNote?.reason1 ?? reason ?? null}
                    onChange={(value) => {
                      setReason(value);
                    }}
                    placeholder="กรุณาเลือกเหตุผล"
                    showSearch
                    getPopupContainer={(triggerNode) =>
                      triggerNode.parentElement as HTMLElement
                    }
                    options={Reason.map((reason) => ({
                      label: reason.reasonName,
                      value: reason.reasonName,
                    }))}
                  />
                </div>
                <div>
                  <b>เหตุผล 2</b>
                  <Input.TextArea
                    value={selectedCreditNote.reason2 ?? reason2 ?? ""}
                    onChange={(e) => {
                      setReason2(e.target.value);
                    }}
                    defaultValue={selectedCreditNote?.reason2}
                    placeholder="กรุณาใส่เหตุผล"
                  />
                </div>
                <div>
                  {/* Drag and Drop file upload */}
                  <b>แนบไฟล์ (ถ้ามี)</b>
                  <Upload.Dragger
                    multiple
                    name="files"
                    onChange={(info) => {
                      setUploadedFiles(info.fileList);
                      if (info.file.status !== "uploading") {
                        // You can handle file list here if needed
                      }
                      if (info.file.status === "done") {
                        // message.success(`${info.file.name} อัปโหลดสำเร็จ`);
                      } else if (info.file.status === "error") {
                        // message.error(`${info.file.name} อัปโหลดล้มเหลว`);
                      }
                    }}
                    showUploadList={false}
                  >
                    <p className="ant-upload-drag-icon">
                      <svg
                        width="32"
                        height="32"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M19.35 10.04A7.49 7.49 0 0 0 5.3 6.16 5.994 5.994 0 0 0 6 20h13a5 5 0 0 0 .35-9.96zM16 13h-3v3h-2v-3H8l4-4 4 4z"></path>
                      </svg>
                    </p>
                    <p className="ant-upload-text">
                      ลากไฟล์มาวางที่นี่ หรือคลิกเพื่อเลือกไฟล์
                    </p>
                    <p className="ant-upload-hint">รองรับการเลือกหลายไฟล์</p>
                  </Upload.Dragger>
                  {/* Image preview with remove button */}
                  <div className="flex flex-start gap-1 mt-2 overflow-x-auto w-full">
                    {selectedCreditNote?.files?.map((file, idx) => (
                      <div
                        key={file.id || idx}
                        style={{
                          position: "relative",
                          width: 150,
                          height: 150,
                          display: "inline-block",
                        }}
                      >
                        <img
                          src={file?.filePath}
                          alt={file.filePath}
                          width={150}
                          style={{
                            objectFit: "cover",
                            borderRadius: 8,
                            border: "1px solid #eee",
                            maxHeight: 150,
                          }}
                        />
                        <Popover
                          content={
                            <div>
                              <div>ยืนยันลบรูปภาพนี้?</div>
                              <div className="flex gap-2 mt-2">
                                <Button
                                  size="small"
                                  danger
                                  onClick={async () => {
                                    await detroyCreditNoteFile(
                                      selectedCreditNote?.creditNoteId,
                                      Number(file.id)
                                    );
                                    await fetchDataInsite();
                                  }}
                                >
                                  ลบ
                                </Button>
                                <Button
                                  size="small"
                                  onClick={() =>
                                    handlePopoverVisibleChange(
                                      file.id || idx,
                                      false
                                    )
                                  }
                                >
                                  ยกเลิก
                                </Button>
                              </div>
                            </div>
                          }
                          title={null}
                          getPopupContainer={(triggerNode) =>
                            triggerNode.parentNode as HTMLElement
                          }
                          trigger="click"
                          open={!!visiblePopovers[file.id || idx]}
                          onOpenChange={(visible) =>
                            handlePopoverVisibleChange(file.id || idx, visible)
                          }
                        >
                          <button
                            type="button"
                            style={{
                              position: "absolute",
                              top: 4,
                              right: 4,
                              background: "rgba(0,0,0,0.6)",
                              color: "#fff",
                              border: "none",
                              borderRadius: "50%",
                              width: 24,
                              height: 24,
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontWeight: "bold",
                              fontSize: 16,
                              lineHeight: 1,
                            }}
                            aria-label="ลบรูป"
                          >
                            ×
                          </button>
                        </Popover>
                      </div>
                    ))}
                    {uploadedFiles
                      .filter(
                        (f) => f.originFileObj && f.type?.startsWith("image/")
                      )
                      .map((file, idx) => (
                        <div
                          key={file.uid || idx}
                          style={{
                            position: "relative",
                            width: 150,
                            height: 150,
                            display: "inline-block",
                          }}
                        >
                          <img
                            src={URL.createObjectURL(file.originFileObj)}
                            alt={file.name}
                            width={150}
                            style={{
                              objectFit: "cover",
                              borderRadius: 8,
                              border: "1px solid #eee",
                              maxHeight: 150,
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setUploadedFiles((prev) =>
                                prev.filter(
                                  (f) =>
                                    (f.uid || f.name) !==
                                    (file.uid || file.name)
                                )
                              );
                            }}
                            style={{
                              position: "absolute",
                              top: 4,
                              right: 4,
                              background: "rgba(0,0,0,0.6)",
                              color: "#fff",
                              border: "none",
                              borderRadius: "50%",
                              width: 24,
                              height: 24,
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontWeight: "bold",
                              fontSize: 16,
                              lineHeight: 1,
                            }}
                            aria-label="ลบรูป"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
                <div>
                  <Button
                    type="default"
                    size="large"
                    className="w-full mt-4 py-[20px]"
                    disabled={
                      !reason ||
                      !reason2 ||
                      totalAmount <= 0 ||
                      (uploadedFiles.length == 0 &&
                        selectedCreditNote?.files?.length == 0)
                    }
                    onClick={handleToUpdateCreditNote}
                  >
                    บันทึกข้อมูล
                  </Button>
                  <Button
                    type="default"
                    danger
                    size="large"
                    className="w-full mt-4 py-[20px]"
                    onClick={() => setCancelModalOpen(true)}
                  >
                    ยกเลิกใบลดหนี้
                  </Button>
                  <Modal
                    open={cancelModalOpen}
                    title="ยืนยันการยกเลิกใบลดหนี้"
                    zIndex={9999999}
                    onOk={async () => {
                      //   setCancelModalOpen(false);
                      await detroyCreditNote(selectedCreditNote?.creditNoteId);
                      fetchDataInsite();
                      fetchData();
                      setCancelModalOpen(false);
                      setIsForEdit(false);
                      // TODO: Add actual cancel logic here
                    }}
                    onCancel={() => setCancelModalOpen(false)}
                    okText="ยืนยัน"
                    cancelText="ยกเลิก"
                    okButtonProps={{ danger: true }}
                  >
                    <p>คุณต้องการยกเลิกใบลดหนี้นี้ใช่หรือไม่?</p>
                  </Modal>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </Spin>
  );
};

export default formEditCreditNote;
