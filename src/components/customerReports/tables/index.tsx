// import React from "react";
import React, { useState, useEffect, useRef } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { ReportList } from "../index";
import { Spin, Pagination, Input } from "antd";
import Badge from "../../ui/badge/Badge";
import { StatusFromPOS } from "../variables";
import CreditNoteDrawer from "./CreditNoteDrawer";
import { useDataContext } from "../../../context";

interface Props {
  reportLists: ReportList[];
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  fetchData: () => void;
}

const Index: React.FC<Props> = ({
  reportLists,
  loading,
  fetchData,
  // setLoading,
}) => {
  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { data } = useDataContext();
  // Search state
  const [searchText, setSearchText] = useState("");

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedCreditNote, setSelectedCreditNote] = useState<number | null>(
    null
  );
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  const [appqc, setAppqc] = useState<string>("");
  const [ReportListId, setReportListId] = useState<number | null>(null);
  // Animation state for drawer
  const [showDrawer, setShowDrawer] = useState(false);
  const drawerTimeout = useRef<number | null>(null);

  // Handle open/close animation
  useEffect(() => {
    if (drawerOpen) {
      setShowDrawer(true);
    } else if (showDrawer) {
      // Delay unmount for animation
      drawerTimeout.current = setTimeout(() => setShowDrawer(false), 250);
    }
    return () => {
      if (drawerTimeout.current) clearTimeout(drawerTimeout.current);
    };
  }, [drawerOpen]);
  // Filtered data based on search
  const filteredData = (Array.isArray(reportLists) ? reportLists : []).filter(
    (order) => {
      const search = searchText.trim().toLowerCase();
      if (!search) return true;
      return (
        (order.OrderNo || "").toLowerCase().includes(search) ||
        (order.invoiceNo || "").toLowerCase().includes(search) ||
        (order.Namecustomer || "").toLowerCase().includes(search) ||
        (order.StatusFormPOS || "").toLowerCase().includes(search) ||
        (order.ReportListEmail || "").toLowerCase().includes(search) ||
        (order.ReportListLineID || "").toLowerCase().includes(search) ||
        (order.TimeUpdReport || "").toLowerCase().includes(search)
      );
    }
  );

  // Paginated data
  const paginatedData = filteredData.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  return (
    <Spin spinning={loading} tip="กำลังโหลดข้อมูล...">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <div className="col-span-3"></div>
        <div>
          <Input.Search
            placeholder="ค้นหาชื่อลูกค้า หรือข้อมูลอื่นๆ"
            allowClear
            size="large"
            value={searchText}
            onChange={(e) => {
              setSearchText(e.target.value);
              setPage(1); // Reset to first page on search
            }}
            onSearch={(value) => {
              setSearchText(value);
              setPage(1); // Reset to first page on search
            }}
          />
        </div>
      </div>
      <TableContainer
        component={Paper}
        sx={{
          borderRadius: 2,
          boxShadow: "none",
          minHeight: 500,
          overflow: "auto",
          scrollbarWidth: "thin",
          scrollbarColor: "#cbd5e1 #f3f4f6",
        }}
        className="border border-gray-200 whitespace-nowrap"
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ใบสั่่งขาย</TableCell>
              <TableCell>ใบแจ้งหนี้</TableCell>
              <TableCell>ชื่อลูกค้า</TableCell>
              <TableCell>สถานะ</TableCell>
              <TableCell>ช่องทางการติดต่อ</TableCell>
              <TableCell>เวลาแจ้ง</TableCell>
              <TableCell>ผู้ดำเนินการ ( QC )</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.map((order) => (
              <TableRow
                key={order.ReportListId}
                className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 cursor-pointer"
                onClick={() => {
                  setSelectedCreditNote(order.creditNoteId);
                  setAppqc(order.appqc);
                  setReportListId(order.ReportListId);
                  setSelectedEmail(order.ReportListEmail);
                  if (order.creditNoteId != null) {
                    setDrawerOpen(true);
                  }
                }}
              >
                <TableCell>
                  <b className="text-gray-400">{order.OrderNo}</b>
                </TableCell>
                <TableCell>
                  <span className="text-gray-400">{order.invoiceNo}</span>
                </TableCell>
                <TableCell>
                  <b>{order.Namecustomer}</b>
                </TableCell>
                <TableCell>
                  <Badge
                    size="sm"
                    color={
                      order.StatusFormPOS === "DRAFT"
                        ? "info"
                        : order.StatusFormPOS === "APPROVED"
                        ? "success"
                        : order.StatusFormPOS === "CANCELED"
                        ? "error"
                        : order.StatusFormPOS === "INVUPDATE"
                        ? "warning"
                        : order.StatusFormPOS === "RECEIVED"
                        ? "primary"
                        : order.StatusFormPOS === "WAITINGCN"
                        ? "dark"
                        : order.StatusFormPOS === "NEW"
                        ? "info"
                        : "light"
                    }
                  >
                    {
                      StatusFromPOS[
                        order.StatusFormPOS as keyof typeof StatusFromPOS
                      ]
                    }
                  </Badge>
                </TableCell>
                <TableCell>
                  {order.ReportListEmail}
                  {order.ReportListLineID != "" && (
                    <>
                      <br></br> <span>Line ID : {order.ReportListLineID}</span>
                    </>
                  )}
                </TableCell>
                <TableCell>{order.TimeUpdReport}</TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400 whitespace-nowrap">
                  {data.CNQR_NameEmProcess?.find(
                    (item: any) => item?.creditNoteId == order?.creditNoteId
                  )?.name ?? "-"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <div
        style={{ marginTop: 16, display: "flex", justifyContent: "flex-end" }}
      >
        <Pagination
          current={page}
          pageSize={pageSize}
          total={filteredData.length}
          showSizeChanger
          pageSizeOptions={["10", "20", "50", "100"]}
          onChange={(p, ps) => {
            setPage(p);
            setPageSize(ps);
          }}
          showTotal={(total, range) =>
            `${range[0]}-${range[1]} จาก ${total} รายการ`
          }
        />
      </div>
      <CreditNoteDrawer
        open={drawerOpen}
        showDrawer={showDrawer}
        onClose={() => setDrawerOpen(false)}
        selectedCreditNote={selectedCreditNote}
        setSelectedCreditNote={setSelectedCreditNote}
        fetchData={fetchData}
        appqc={appqc}
        setAppqc={setAppqc}
        ReportListId={ReportListId}
        selectedEmail={selectedEmail}
      />
    </Spin>
  );
};

export default Index;
