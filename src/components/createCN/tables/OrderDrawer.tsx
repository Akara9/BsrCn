import { Drawer, Button, Spin, Select, Input, Upload } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import Badge from "../../ui/badge/Badge";
import { FaCircleCheck } from "react-icons/fa6";
import type { InvList } from "../index";
import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { Reason, companyName } from "../variables";
import { useDataContext } from "../../../context";
import {
  getInvoiceForCreateById,
  getSalePersonCode,
  createCreditNote,
  createCreditNoteByItem,
  createCreditNoteByFile,
  getCreditNoteItemsForCheck
} from "../services";

interface OrderDrawerProps {
  open: boolean;
  onClose: () => void;
  selectedOrder: InvList | null;
  selectedCNType: "return" | "credit" | null;
  setSelectedCNType: Dispatch<SetStateAction<"return" | "credit" | null>>;
  setSelectedOrder: Dispatch<SetStateAction<InvList | null>>;
  fetchInvoices?: () => void;
}

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

export default function OrderDrawer({
  open,
  onClose,
  selectedOrder,
  selectedCNType,
  setSelectedCNType,
  setSelectedOrder,
  fetchInvoices,
}: OrderDrawerProps) {
  if (!open) return null;
  const { setData } = useDataContext();
  const [loading, setLoading] = useState(false);

  const [itemQuantities, setItemQuantities] = useState<{
    [itemId: number]: number;
  }>({});

  const [reason, setReason] = useState<string | null>(null);
  const [reason2, setReason2] = useState<string | null>(null);
  const [isReturn,setIsReturn] = useState(false);
  const [isCNDiscount , setIsCNDiscount] = useState(false);
  const [isItemForCheckCredit ,setIsItemForCheckCredit] = useState<isItemForCheckCredit[]>([]);

  // State for Sale Person Code
  const [salePersonCode, setSalePersonCode] = useState<number | null>(null);

  useEffect(() => {
    setSelectedCNType(null);
  }, []);
  useEffect(() => {
    const fetchSalePersonCode = async () => {
      const session = JSON.parse(localStorage.getItem("session") || "{}");
      if (
        session?.UserName &&
        typeof session?.UserCode === "string" &&
        typeof selectedOrder?.companyCode === "string"
      ) {
        const response = await getSalePersonCode(
          session.UserCode,
          selectedOrder.companyCode
        );
        if (response) {
          setSalePersonCode(response[0].salePersonCode);
        }
      }
    };
    fetchSalePersonCode();
  }, [selectedOrder]);

  // State for uploaded files
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);

  //   console.log(uploadedFiles);

  // Sync itemQuantities with selectedOrder items

  // Handler to change quantity
  const handleQuantityChange = (itemId: number, delta: number) => {
    setItemQuantities((prev) => {
      const newQty = Math.max(0, (prev[itemId] ?? 0) + delta);
      return { ...prev, [itemId]: newQty };
    });
  };
  // console.log(itemQuantities)

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
          setIsItemForCheckCredit(itemsForCheck.data);
          setIsCNDiscount(itemsForCheck.data?.some((item: isItemForCheckCredit) => item.isReturn == 0));
          setIsReturn(itemsForCheck.data?.some((item: isItemForCheckCredit) => item.isReturn == 1));
        }
      setLoading(false);
    }
  };
  console.log(isItemForCheckCredit)
  useEffect(() => {
    if (selectedOrder && selectedOrder?.items == undefined) {
      fetchInvoice(selectedOrder.invoiceId);
    }
  }, [selectedOrder]);

  // Calculate total amount
  const totalAmount =
    selectedOrder?.items?.reduce((sum: number, item: any) => {
      if (item.weightBaseFlag == 1) {
        return (
          sum +
          (itemQuantities[item.id] ?? 0) *
            (item.weight ?? 0) *
            (item.price ?? 0)
        );
      }
      return sum + (itemQuantities[item.id] ?? 0) * (item.price ?? 0);
    }, 0) ?? 0;

  const handleToCreateCreditNote = async () => {
    // Handle the submit action here
    const session = JSON.parse(localStorage.getItem("session") || "{}");
    if(salePersonCode == null) {
      setData((prev) => ({
        ...prev,
        message: "ไม่สามารถทำรายการได้เนื่องจากท่านไม่มี salePersonCode -error",
      }));
      return;
    }
    const isPayLoad = {
      Q1: 0,
      Q2: 0,
      Q3: 0,
      amount: 0,
      branchId: selectedOrder?.branchId,
      branchName: selectedOrder?.whGrpName,
      companyCode: selectedOrder?.companyCode,
      companyName:
        companyName[selectedOrder?.companyCode as keyof typeof companyName],
      createdBy: session?.UserName,
      creditNoteStatus: "DRAFT",
      customerCode: selectedOrder?.customerCode,
      customerName: selectedOrder?.customerName,
      discount: totalAmount,
      invenName: "-",
      invoiceId: selectedOrder?.invoiceId,
      invoiceNo: selectedOrder?.invoiceNo,
      reason1: reason,
      reason2: reason2,
      reasonCode1: Reason.find((row: any) => row.reasonName == reason)
        ?.reasonCode,
      saleName: selectedOrder?.userResponsible,
      salePersonCode: 88,
      temperature: "0",
      weight: selectedOrder?.items?.reduce((sum: number, item: any) => {
        if (
          itemQuantities[item.id] == 0 ||
          itemQuantities[item.id] == undefined
        ) {
          return sum;
        }
        return (
          sum + (itemQuantities[item.id] ?? item.qty ?? 1) * (item.weight ?? 0)
        );
      }, 0),
      whGrpCode: selectedOrder?.whGrpCode,
      whGrpName: selectedOrder?.whGrpName,
    };

    const payloadItem = selectedOrder?.items
      ?.map((item: any) => {
        if (
          itemQuantities[item.id] == 0 ||
          itemQuantities[item.id] == undefined
        ) {
          return null;
        }
        setLoading(true);
        const priceCN =
          (itemQuantities[item.id] ?? item.qty ?? 1) * (item.price ?? 0);
        return {
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
          companyName:
            companyName[item.companyCode as keyof typeof companyName],
          taxNo: item.taxNo,
          vatGroup: item.vatGroup,
          binLocation: "",
          qtyCN: Number(itemQuantities[item.id] ?? item.qty ?? 1),
          priceCN: Number(priceCN),
          isReturn: selectedCNType === "return" ? true : false,
          weightBaseFlag: item.weightBaseFlag == 1 ? true : false,
          childBinLocation: "",
        };
      })
      ?.filter((item) => item !== null);

    const filePayLoad = new FormData();
    uploadedFiles.forEach((file) => {
      filePayLoad.append("files", file.originFileObj);
    });
    filePayLoad.append("whGrpCode", selectedOrder?.whGrpCode ?? "");
    console.log(isPayLoad);
    const response = await createCreditNote(isPayLoad);
    if (response) {
      console.log(response);
      const creditNoteId = response;
      console.log(payloadItem);
      if (payloadItem) {
        payloadItem.forEach(async (item: any) => {
          if (item == null) return;
          await createCreditNoteByItem(item, creditNoteId);
        });
      }

      await createCreditNoteByFile(filePayLoad, creditNoteId);
       setData((prev) => ({
        ...prev,
        message:
          "สร้างใบลดหนี้สำเร็จ:" + creditNoteId + "-success",
      }));
    } else {
      setData((prev) => ({
        ...prev,
        message:
          "ไม่สามารถสร้างใบลดหนี้ได้id:" + selectedOrder?.invoiceNo + "-error",
      }));
      setLoading(false);
      return;
    }
    fetchInvoices && fetchInvoices();
  
    setLoading(false);
    onClose();
    setSelectedOrder(null);
    setSelectedCNType(null);

    //  setLoading(true);
    // setTimeout(() => {

    // }, 2000);
  };

  return (
    <Drawer
      placement="right"
      open={open}
      onClose={onClose}
      width={480}
      rootStyle={{
        right: 32,
        top: 32,
        bottom: 32,
        zIndex: 99999,
        background: "none",
      }}
      bodyStyle={{
        paddingBottom: 24,
        borderRadius: 28,
        background: "none",
      }}
      mask
      maskStyle={{
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        right: -32,
        top: -32,
        bottom: -32,
      }}
      headerStyle={{
        padding: "16px 24px",
        display: "flex",
        alignItems: "center",
      }}
      className="ant-drawer-content ant-drawer ant-drawer-mask"
      title={
        <div style={{ display: "flex", alignItems: "left", width: "100%" }}>
          <span
            style={{
              fontWeight: 600,
              fontSize: 18,
              flex: 1,
              textAlign: "left",
              marginLeft: "-30px",
            }}
          >
            {selectedOrder?.invoiceNo}{" "}
            {selectedOrder?.shippingType == "1" ? (
              <Badge variant="light" color="primary">
                สายส่ง
              </Badge>
            ) : (
              <Badge variant="light" color="success">
                หน้าร้าน
              </Badge>
            )}
          </span>
        </div>
      }
      closeIcon={
        <CloseOutlined
          style={{ fontSize: 20, right: 16, position: "absolute", top: 20 }}
        />
      }
    >
      {selectedOrder ? (
        <Spin spinning={loading} size="large">
          <div className="flex flex-col gap-2">
            <div>
              <b className="text-gray-500">ใบสั่งขาย</b> <br />
              <b className=" text-[20px]">{selectedOrder?.orderNo}</b>
            </div>
            <div>
              <b className="text-gray-500">ชื่อลูกค้า</b> <br />
              <b className=" text-[20px]">{selectedOrder?.customerName}</b>
            </div>
            <div>
              <b className="text-gray-500">ผู้สร้างใบแจ้งหนี้</b> <br />
              <b className=" text-[20px]">{selectedOrder?.userResponsible}</b>
            </div>
            <div>
              <b className="text-gray-500">สร้างเมื่อ</b> <br />
              <b className=" text-[20px]">
                {selectedOrder.createdAt
                  ? new Date(selectedOrder.createdAt).toLocaleString("th-TH", {
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
                  className={
                    selectedCNType === "credit" ? "text-green-500" : ""
                  }
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
            </div>
            {selectedCNType != null && (
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
                {selectedOrder?.items?.map((item: any) => (
                  <div
                    className="flex items-center gap-3 py-2 border-b border-gray-100"
                    key={item.id}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">
                        {item.productName}
                      </div>
                      {item.weightBaseFlag == 1 ? (
                        <>
                          <div className="text-gray-400 text-xs">
                            {itemQuantities[item.id] ?? 0} กล่อง (
                            {item.weight * (itemQuantities[item.id] ?? 0)} กก.)x
                            ราคาต่อกิโล {item.price ?? 0} บาท &nbsp;รวม{" "}
                            <b>
                              {(
                                item.weight *
                                (itemQuantities[item.id] ?? 0) *
                                (item.price ?? 0)
                              ).toLocaleString()}
                            </b>{" "}
                            บาท
                          </div>
                        </>
                      ) : (
                        <div className="text-gray-400 text-xs">
                          {itemQuantities[item.id] ?? 0}x {item.price ?? 0} บาท
                          รวม&nbsp;
                          <b>
                            {(
                              (itemQuantities[item.id] ?? 0) * (item.price ?? 0)
                            ).toLocaleString()}
                          </b>{" "}
                          บาท
                        </div>
                      )}
                      {isItemForCheckCredit?.some(
                                (row: isItemForCheckCredit) =>
                                  row.productCode == item.productCode
                              ) && (<span className="text-red-300">มีการทำรายการไปแล้ว {(
                              (isItemForCheckCredit?.find(
                                (row: isItemForCheckCredit) =>
                                  row.productCode == item.productCode
                              )?.qtyCN ?? 0)
                            )} {item.UOMCode}</span>)}
                    </div>
                    {/* Quantity controls */}
                    <div className="flex items-center gap-2">
                      <button
                        className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center text-lg font-bold text-gray-500 hover:bg-gray-200"
                        onClick={() => handleQuantityChange(item.id, -1)}
                        type="button"
                      >
                        –
                      </button>
                      <span className="w-6 text-center">
                        {itemQuantities[item.id] ?? 0}
                      </span>
                      <button
                        className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center text-lg font-bold text-gray-500 hover:bg-gray-200"
                        onClick={() => handleQuantityChange(item.id, 1)}
                        type="button"
                        disabled={
                          (itemQuantities[item.id] ?? 0) >= (
                            ((item.qty ?? 0) -
                              (isItemForCheckCredit?.find(
                                (row: isItemForCheckCredit) =>
                                  row.productCode == item.productCode
                              )?.qtyCN ?? 0)
                            )
                          )
                        }
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
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
                    value={reason}
                    onChange={(value) => {
                      setReason(value);
                    }}
                    placeholder="กรุณาเลือกเหตุผล"
                    showSearch
                    getPopupContainer={(triggerNode) => triggerNode.parentNode}
                    options={Reason.map((reason) => ({
                      label: reason.reasonName,
                      value: reason.reasonName,
                    }))}
                  />
                </div>
                <div>
                  <b>เหตุผล 2</b>
                  <Input.TextArea
                    onChange={(e) => {
                      setReason2(e.target.value);
                    }}
                    value={reason2 ?? ""}
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
                      } else if (info.file.status === "error") {
                        // setData((prev) => ({
                        //   ...prev,
                        //   message:
                        //     "อัปโหลดล้มเหลว:" +
                        //     info.file.name +
                        //     "-error",
                        // }));
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
                      uploadedFiles.length === 0 ||
                      salePersonCode === null
                    }
                    onClick={handleToCreateCreditNote}
                  >
                    {salePersonCode == null ? (
                      <span className="text-red-500">
                        ไม่สามารถทำรายการได้เนื่องจากท่านไม่มี salePersonCode
                      </span>
                    ) : (
                      "สร้างใบลดหนี้"
                    )}
                  </Button>
                </div>
              </div>
            )}
            {/* เพิ่มรายละเอียดอื่นๆ ตามต้องการ */}
          </div>
        </Spin>
      ) : null}
    </Drawer>
  );
}
