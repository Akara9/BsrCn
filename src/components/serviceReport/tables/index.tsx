// import React from "react";
// Define the complainData type here or import from the correct file if it exists elsewhere
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
  files: any[]; // Assuming files is an array, adjust type as necessary
}
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import { useEffect, useState } from "react";
import {
  Pagination,
  Drawer,
  Popconfirm,
  Button as AntdButton,
  Spin,
  Modal, // <-- add Modal from antd
  Input
} from "antd";
import Button from "../../ui/button/Button"; // Adjust the import path as necessary
import { updateNameEmService, checkservicereport } from "../services"; // Adjust the import path as necessary
import { CheckOutlined, LinkOutlined } from "@ant-design/icons";
import { useDataContext } from "../../../context"; // Adjust the import path as necessary
import Badge from "../../ui/badge/Badge"; // Adjust the import path as necessary

interface Props {
  complainData: ComplainData[];
  fetchData: () => void;
  loading: boolean;
}

export default function index({ complainData, fetchData, loading }: Props) {
  // Add state for pagination
  const { data } = useDataContext();
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [searchText, setSearchText] = useState(""); // เพิ่ม state สำหรับค้นหา

  // ฟังก์ชันกรองข้อมูลตาม searchText
  const filteredData = complainData.filter((item) => {
    const text = searchText.toLowerCase();
    return (
      item.Namecustomer?.toLowerCase().includes(text) ||
      item.InvoiceNo?.toLowerCase().includes(text) ||
      item.OrderNo?.toLowerCase().includes(text) ||
      item.ServiceDetail?.toLowerCase().includes(text) ||
      item.nameEmployee?.toLowerCase().includes(text) ||
      item.nameEmPending?.toLowerCase().includes(text) ||
      item.solutionEdit?.toLowerCase().includes(text) ||
      item.resultDowork?.toLowerCase().includes(text) ||
      item.feedback?.toLowerCase().includes(text) ||
      item.ReportServiceStatus?.toLowerCase().includes(text)
    );
  });

  // Calculate paginated data
  const paginatedData = filteredData.slice(
    (current - 1) * pageSize,
    current * pageSize
  );

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<ComplainData | null>(null);
  const [sigleRow, setSigleRow] = useState<ComplainData | null>(null);
  const [loadingButton, setLoadingButton] = useState(false);
  const [copied, setCopied] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalFile, setModalFile] = useState<{
    url: string;
    type: string;
    name: string;
  } | null>(null);
  const session = JSON.parse(localStorage.getItem("session") || "{}");
  const [feedback, setFeedback] = useState<string>(""); 

  useEffect(() => {
    setSelectedRow(
      complainData?.find(
        (item) => item.ReportServicesId == selectedRow?.ReportServicesId
      ) || null
    );
  }, [complainData]);

  useEffect(() => {
    if (selectedRow) {
      const checkService = async () => {
        try {
          setLoadingButton(true);
          const response = await checkservicereport(
            selectedRow.OrderNo,
            selectedRow.InvoiceNo
          );
          if (response) {
            setSigleRow(response.data[0]);
            setFeedback(response.data[0].feedback || "");
            setLoadingButton(false);
          }
        } catch (error) {
          console.error("Error checking service report:", error);
        }
      };
      checkService();
    }
  }, [selectedRow]);
  const handleConfirm = async (ReportServicesId: number) => {
    try {
      setLoadingButton(true);
      const response = await updateNameEmService({
        ReportServicesId: ReportServicesId,
        nameEmPending: session.UserName,
      });
      const responseStatus = await updateNameEmService({
        ReportServicesId: ReportServicesId,
        ReportServiceStatus: "รับเรื่อง",
      });
      if (response && responseStatus) {
        fetchData(); // Refresh data after updating
        setLoadingButton(false);
      } else {
        console.error("Failed to update name employee service");
      }
    } catch (error) {
      console.error("Error updating name employee service:", error);
    }
  };

  const handleStatus = async (ReportServicesId: number, status: string) => {
    try {
      setLoadingButton(true);
      const response = await updateNameEmService({
        ReportServicesId: ReportServicesId,
        ReportServiceStatus: status,
      });
      if (response) {
        fetchData(); // Refresh data after updating
        setLoadingButton(false);
      } else {
        console.error("Failed to update service status");
      }
    } catch (error) {
      console.error("Error updating service status:", error);
      setLoadingButton(false);
    }
  };

  const handleFeedBack = async () => {
    if (sigleRow && feedback) {
      try {
        setLoadingButton(true);
        const response = await updateNameEmService({
          ReportServicesId: sigleRow.ReportServicesId,
          feedback: feedback,
        });
        if (response) {
         
          fetchData(); // Refresh data after updating
          setLoadingButton(false);
          setFeedback(""); // Clear feedback input after submission
        } else {
          console.error("Failed to update feedback");
        }
      } catch (error) {
        console.error("Error updating feedback:", error);
      }
    } else {
      console.warn("No selected row or feedback is empty");
    }
  }
  return (
    <>
      <div className="grid grid-cols-4 gap-4 mb-4">
        <div className="col-span-1">
          <Input 
          placeholder="ค้นหา..."
          value={searchText}
          onChange={e => {
            setSearchText(e.target.value);
            setCurrent(1); // reset หน้าเมื่อค้นหาใหม่
          }}
        />
        </div>
         <div className="col-span-2"></div>
          
        <Button variant="outline" onClick={fetchData}>
          โหลดข้อมูลใหม่
        </Button>
      </div>
      <TableContainer
        component={Paper}
        className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]"
        style={{
          minHeight: "500px",
          scrollbarWidth: "thin",
          scrollbarColor: "#cbd5e1 #f3f4f6",
          boxShadow: "none",
        }}
      >
        <Table>
          <TableHead className="whitespace-nowrap">
            <TableRow>
              <TableCell className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                ชื่อลูกค้า
              </TableCell>
              <TableCell className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                หัวข้อการร้องเรียน
              </TableCell>
              <TableCell className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                รายละเอียดคำร้อง
              </TableCell>
              <TableCell className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                พนักงานที่โดนร้องเรียน
              </TableCell>
              <TableCell className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                ร้องเรียนเมื่อ
              </TableCell>
              <TableCell className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                สถานะ
              </TableCell>
              <TableCell className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                ผู้รับผิดชอบตรวจสอบ
              </TableCell>
              <TableCell className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                แนวทางการแก้ไข
              </TableCell>
              <TableCell className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                ผลลัพธ์
              </TableCell>
              <TableCell className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                การตอบกลับหาลูกค้า
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData?.map((order) => (
              <TableRow
                key={order.ReportServicesId}
                style={{ cursor: "pointer" }}
                onClick={() => {
                  setSelectedRow(order);
                  setDrawerOpen(true);
                }}
              >
                <TableCell className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap">
                  {order.Namecustomer}
                </TableCell>
                <TableCell className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap">
                  {order.ServiceIdMulti &&
                    JSON.parse(order.ServiceIdMulti)?.map((item: any) => (
                      <Badge key={item} variant="light" className="m-1">
                        {data?.reportServMasterData?.find(
                          (service: any) => service.ServicesId == item
                        )?.ServiceName || "ไม่พบหัวข้อ"}
                      </Badge>
                    ))}{" "}
                </TableCell>
                <TableCell className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  <div
                    style={{
                      maxHeight: "200px",
                      overflowY: "auto",
                      minWidth: "200px",
                    }}
                  >
                    {order.ServiceDetail}
                  </div>
                </TableCell>
                <TableCell className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap">
                  {order.nameEmployee}
                </TableCell>
                <TableCell className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap">
                  {order.ReportServicesTimeUPD}
                </TableCell>
                <TableCell className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap">
                  {order.ReportServiceStatus == null ? (
                    <Badge variant="light" color="primary">
                      ยังไม่มีผู้รับเรื่อง
                    </Badge>
                  ) : order.ReportServiceStatus == "รับเรื่อง" ? (
                    <Badge variant="light" color="info">
                      รับเรื่องแล้ว
                    </Badge>
                  ) : order.ReportServiceStatus == "กำลังดำเนินการ" ? (
                    <Badge variant="light" color="warning">
                      กำลังดำเนินการ
                    </Badge>
                  ) : order.ReportServiceStatus == "ดำเนินการเสร็จสิ้น" ? (
                    <Badge variant="light" color="success">
                      ดำเนินการเสร็จสิ้น
                    </Badge>
                  ) : null}
                </TableCell>
                <TableCell className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap">
                  {order.nameEmPending}
                </TableCell>
                <TableCell className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  <div
                    style={{
                      maxHeight: "200px",
                      overflowY: "auto",
                      minWidth: "200px",
                    }}
                  >
                    {order.solutionEdit}
                  </div>
                </TableCell>
                <TableCell className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  <div
                    style={{
                      maxHeight: "200px",
                      overflowY: "auto",
                      minWidth: "200px",
                    }}
                  >
                    {order.resultDowork}
                  </div>
                </TableCell>
                <TableCell className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  <div
                    style={{
                      maxHeight: "200px",
                      overflowY: "auto",
                      minWidth: "200px",
                    }}
                  >
                    {order.feedback}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {/* Add Ant Design Pagination below the table */}
      </TableContainer>
      <div
        style={{ padding: "16px", display: "flex", justifyContent: "flex-end" }}
      >
        <Pagination
          current={current}
          pageSize={pageSize}
          total={filteredData.length}
          showSizeChanger
          pageSizeOptions={["5","10", "20", "50", "100"]}
          onChange={(page, size) => {
            setCurrent(page);
            setPageSize(size || 10);
          }}
          showTotal={(total, range) =>
            `${range[0]}-${range[1]} จาก ${total} รายการ`
          }
        />
      </div>

      <Drawer
        title="รายละเอียดคำร้อง"
        placement="right"
        width={400}
        zIndex={999999}
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
      >
        <Spin spinning={loadingButton} tip="กำลังโหลดข้อมูล...">
          {sigleRow && (
            <div>
              <p>
                <span className="text-gray-400">ชื่อลูกค้า</span>
              </p>
              <p>
                <b>{sigleRow.Namecustomer}</b>
              </p>
              <p>
                <span className="text-gray-400">พนักงานที่โดนร้องเรียน:</span>{" "}
              </p>
              <p>
                <b>{sigleRow.nameEmployee}</b>{" "}
              </p>
              <p>
                <span className="text-gray-400">รายละเอียดคำร้อง:</span>{" "}
              </p>
              <p>
                <b>{sigleRow.ServiceDetail}</b>{" "}
              </p>
              <p>
                <span className="text-gray-400">ร้องเรียนเมื่อ</span>{" "}
              </p>
              <p>
                <b>{sigleRow.ReportServicesTimeUPD}</b>{" "}
              </p>
              <p>
                <span className="text-gray-400">หัวข้อการร้องเรียน</span>{" "}
              </p>
              <p className="mb-5">
                {" "}
                {sigleRow.ServiceIdMulti &&
                  JSON.parse(sigleRow.ServiceIdMulti)?.map((item: any) => (
                    <Badge key={item} variant="light">
                      {data?.reportServMasterData?.find(
                        (service: any) => service.ServicesId == item
                      )?.ServiceName || "ไม่พบหัวข้อ"}
                    </Badge>
                  ))}{" "}
              </p>
              {sigleRow.nameEmPending == null && (
                <Popconfirm
                  title="ยืนยันการรับผิดชอบคำร้องนี้?"
                  okText="ยืนยัน"
                  cancelText="ยกเลิก"
                  className="mt-2"
                  onConfirm={() => handleConfirm(sigleRow.ReportServicesId)}
                  getPopupContainer={() => document.body}
                >
                  <AntdButton type="default" className="mt-5">
                    <Spin spinning={loading} size="small" />{" "}
                    คุณต้องการรับผิดชอบคำร้องนี้หรือไม่?
                  </AntdButton>
                </Popconfirm>
              )}
              {sigleRow.nameEmPending && (
                <>
                  <div className="">
                    <Button
                      variant={copied ? "successoutline" : "outline"}
                      size="md"
                      onClick={() => {
                        const link = `${window.location.origin}/v2/service-report/${sigleRow.ReportServicesId}`;
                        navigator.clipboard.writeText(link);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 1500);
                      }}
                      startIcon={copied ? <CheckOutlined /> : <LinkOutlined />}
                    >
                      คัดลอกลิ้งค์
                    </Button>
                  </div>
                  <div className="mt-2 mb-4">
                    <p>
                      <span className="text-gray-400">สถานะ</span>{" "}
                    </p>
                    <Spin spinning={loadingButton || loading} tip="กำลังอัพเดตสถานะ...">
                    <Button
                      variant={
                        sigleRow.ReportServiceStatus == "รับเรื่อง"
                          ? "successoutline"
                          : "outline"
                      }
                      size="sm"
                      className="m-1"
                      onClick={() =>
                        handleStatus(sigleRow.ReportServicesId, "รับเรื่อง")
                      }
                    >
                      รับเรื่อง
                    </Button>
                    <Button
                      variant={
                        sigleRow.ReportServiceStatus == "กำลังดำเนินการ"
                          ? "successoutline"
                          : "outline"
                      }
                      size="sm"
                      className="m-1"
                      onClick={() =>
                        handleStatus(
                          sigleRow.ReportServicesId,
                          "กำลังดำเนินการ"
                        )
                      }
                    >
                      กำลังดำเนินการ
                    </Button>
                    <Button
                      variant={
                        sigleRow.ReportServiceStatus == "ดำเนินการเสร็จสิ้น"
                          ? "successoutline"
                          : "outline"
                      }
                      size="sm"
                      className="m-1"
                      onClick={() =>
                        handleStatus(
                          sigleRow.ReportServicesId,
                          "ดำเนินการเสร็จสิ้น"
                        )
                      }
                    >
                      ดำเนินการเสร็จสิ้น
                    </Button>
                    </Spin>
                  </div>
                  {sigleRow.solutionEdit && (
                    <>
                      <br></br>
                      <p>
                        <span className="text-gray-400">แนวทางการแก้ไข</span>{" "}
                      </p>
                      <p>
                        <b>{sigleRow.solutionEdit}</b>{" "}
                      </p>
                    </>
                  )}
                  {sigleRow.resultDowork && (
                    <>
                      <p>
                        <span className="text-gray-400">ผลลัพธ์</span>{" "}
                      </p>
                      <p>
                        <b>{sigleRow.resultDowork}</b>{" "}
                      </p>
                    </>
                  )}
                   <>
                      <p>
                        <span className="text-gray-400">
                          การตอบกลับหาลูกค้า
                        </span>{" "}
                      </p>
                      <p>
                        <Input.TextArea
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        >

                        </Input.TextArea>
                      </p>
                    <div className="mt-2">
                          <Button
                      size="sm"
                      variant="outline"
                      startIcon={loadingButton || loading ? <Spin size="small" /> : null}
                      onClick={handleFeedBack}

                      >ตอบกลับลูกค้า</Button>
                    </div>
                    </>
                  {sigleRow.files && sigleRow.files.length > 0 && (
                    <>
                      <p className="mt-4">
                        <span className="text-gray-400">ไฟล์แนบ</span>{" "}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {sigleRow.files.map((file, index) => {
                          const fileUrl =
                            "https://cn.boonsiri.co.th/form-cn/uploads/" +
                            file.files;
                          const fileName = file.files || "";
                          const ext = fileName.split(".").pop()?.toLowerCase();
                          const isImage = [
                            "jpg",
                            "jpeg",
                            "png",
                            "gif",
                            "webp",
                          ].includes(ext || "");
                          const isVideo = ext === "mp4";
                          return (
                            <div
                              key={index}
                              className="flex flex-col items-center"
                            >
                              {isImage ? (
                                <div
                                  style={{ cursor: "pointer" }}
                                  onClick={() => {
                                    setModalFile({
                                      url: fileUrl,
                                      type: "image",
                                      name: fileName,
                                    });
                                    setModalOpen(true);
                                  }}
                                  title="ดูรูปภาพ"
                                >
                                  <img
                                    src={fileUrl}
                                    alt={fileName}
                                    style={{
                                      width: 80,
                                      height: 80,
                                      objectFit: "cover",
                                      borderRadius: 8,
                                      border: "1px solid #e5e7eb",
                                    }}
                                  />
                                  <div className="text-xs mt-1 text-blue-500">
                                    {fileName}
                                  </div>
                                </div>
                              ) : isVideo ? (
                                <div
                                  style={{ cursor: "pointer" }}
                                  onClick={() => {
                                    setModalFile({
                                      url: fileUrl,
                                      type: "video",
                                      name: fileName,
                                    });
                                    setModalOpen(true);
                                  }}
                                  title="ดูวิดีโอ"
                                >
                                  <video
                                    src={fileUrl}
                                    controls
                                    style={{
                                      width: 120,
                                      height: 80,
                                      borderRadius: 8,
                                      border: "1px solid #e5e7eb",
                                    }}
                                    onClick={(e) => e.preventDefault()}
                                  />
                                  <div className="text-xs mt-1 text-blue-500">
                                    {fileName}
                                  </div>
                                </div>
                              ) : (
                                <a
                                  href={fileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-500 hover:underline"
                                >
                                  {fileName}
                                </a>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      <Modal
                        open={modalOpen}
                        onCancel={() => setModalOpen(false)}
                        footer={null}
                        width={600}
                        centered
                        destroyOnClose
                        title={modalFile?.name}
                        bodyStyle={{ textAlign: "center", padding: 0 }}
                      >
                        {modalFile?.type === "image" && (
                          <img
                            src={modalFile.url}
                            alt={modalFile.name}
                            style={{
                              maxWidth: "100%",
                              maxHeight: "70vh",
                              margin: "auto",
                            }}
                          />
                        )}
                        {modalFile?.type === "video" && (
                          <video
                            src={modalFile.url}
                            controls
                            autoPlay
                            style={{
                              maxWidth: "100%",
                              maxHeight: "70vh",
                              margin: "auto",
                            }}
                          />
                        )}
                      </Modal>
                    </>
                  )}
                </>
              )}
            </div>
          )}
        </Spin>
      </Drawer>
    </>
  );
}
