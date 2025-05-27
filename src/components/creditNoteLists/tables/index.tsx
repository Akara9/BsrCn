import {
  // Table,
  // TableBody,
  // TableCell,
  // TableHeader,
  // TableRow,
} from "../../ui/table";

import Badge from "../../ui/badge/Badge";
import { useState, useEffect, useRef } from "react";
import { Spin, Pagination } from "antd";
import { CreditNote } from "../index";
import { StatusFromPOS } from "../variables";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import CreditNoteDrawer from "./CreditNoteDrawer";
import { useDataContext } from "../../../context";

interface TableProps {
  creditNoteList: CreditNote[];
  loading: boolean;
  fetchData: () => void;
}


export default function CreditNoteTable(
  { creditNoteList, loading, fetchData}: TableProps
) {
  const { data } = useDataContext();
  
  // console.log(creditNoteList)
  // Pagination state
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Calculate paginated data
  const paginatedData = creditNoteList?.slice(
    (current - 1) * pageSize,
    current * pageSize
  );



  // Reset to first page if data changes and current page is out of range
  useEffect(() => {
    if ((current - 1) * pageSize >= creditNoteList?.length) {
      setCurrent(1);
    }
  }, [creditNoteList, pageSize]);

  // Offcanvas state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedCreditNote, setSelectedCreditNote] = useState<CreditNote | null>(null);

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

 
 
  return (
    <>
      <div className="overflow-hidden w-[100%] rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <Spin
          spinning={loading}
          size="large"
          tip={
            <span style={{ fontFamily: "Noto Sans Thai" }}>
              กำลังโหลดข้อมูล<span className="animate-ping">...</span>
            </span>
          }
        >
          <div
            className="max-w-full overflow-x-auto"
            style={{
              minHeight: "500px",
              fontFamily: "Noto Sans Thai",
            }}
          >
            <TableContainer component={Paper} sx={{ boxShadow: 'none', background: 'transparent',scrollbarWidth: 'thin',scrollbarColor: '#cbd5e1 #f3f4f6' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap"
                    >
                      เลขที่ใบลดหนี้
                    </TableCell>
                    <TableCell
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap"
                    >
                      เลขที่ใบแจ้งหนี้
                    </TableCell>
                    <TableCell
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap"
                    >
                      เหตุผล
                    </TableCell>
                    <TableCell
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap"
                    >
                      จำนวนเงิน
                    </TableCell>
                    <TableCell
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap"
                    >
                      สถานะใบลดหนี้
                    </TableCell>
                    <TableCell
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap"
                    >
                      ชื่อลูกค้า
                    </TableCell>
                    <TableCell
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap"
                    >
                      วันที่สร้างใบลดหนี้
                    </TableCell>
                    <TableCell
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap"
                    >
                      ชื่อผู้สร้างใบลดหนี้
                    </TableCell>
                    <TableCell
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap"
                    >
                      ผู้ดำเนินการ ( QC )
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedData?.map((order: CreditNote) => (
                    <TableRow
                      key={order.creditNoteId}
                      hover
                      sx={{ cursor: 'pointer' }}
                      onClick={() => {
                        setSelectedCreditNote(order);
                        setDrawerOpen(true);
                      }}
                    >
                      <TableCell className="px-5 py-4 sm:px-6 text-start whitespace-nowrap">
                        <span className="text-theme-sm font-medium text-gray-700 dark:text-gray-400">
                          {order.creditNoteNo}
                        </span>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400 whitespace-nowrap">
                        {order.invoiceNo}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400 whitespace-nowrap">
                        {order.reason1}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400 whitespace-nowrap">
                        <b className="text-[20px]">
                          {typeof order.discount === "number"
                            ? order.discount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                            : order.discount}
                        </b>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400 whitespace-nowrap">
                        <Badge
                          size="sm"
                          color={
                            order.creditNoteStatus === "DRAFT"
                              ? "info"
                              : order.creditNoteStatus === "APPROVED"
                              ? "success"
                              : order.creditNoteStatus === "CANCELED" 
                              ? "error"
                              : order.creditNoteStatus === "INVUPDATE"
                              ? "warning"
                              : order.creditNoteStatus === "RECEIVED"
                              ? "primary" 
                              : order.creditNoteStatus === "WAITINGCN"
                              ? "dark"
                              : order.creditNoteStatus === "NEW"
                              ? "info"
                              : "light"
                          }
                        >
                          {StatusFromPOS[order.creditNoteStatus as keyof typeof StatusFromPOS]}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400 whitespace-nowrap">
                        {order.customerName}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400 whitespace-nowrap">
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleDateString("th-TH", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })
                          : "-"}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400 whitespace-nowrap">
                        {order.createdBy}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400 whitespace-nowrap">
                        {data.CNQR_NameEmProcess?.find((item: any) => item?.creditNoteId == order?.creditNoteId )?.name ?? "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            {/* Pagination */}
           
          </div>
           <div className="flex justify-end py-4 pr-4">
              <Pagination
                current={current}
                pageSize={pageSize}
                total={creditNoteList?.length}
                showSizeChanger
                pageSizeOptions={['10', '20', '50', '100']}
                onChange={(page, size) => {
                  setCurrent(page);
                  setPageSize(size);
                }}
                showTotal={(total, range) =>
                  `${range[0]}-${range[1]} จากทั้งหมด ${total} รายการ`
                }
                 style={{ fontFamily: "Noto Sans Thai" }}
              />
            </div>
        </Spin>
      </div>
      {/* Offcanvas Drawer (ย้ายออกมานอก Spin/div หลัก) */}
      <CreditNoteDrawer
        open={drawerOpen}
        showDrawer={showDrawer}
        onClose={() => setDrawerOpen(false)}
        selectedCreditNote={selectedCreditNote}
        setSelectedCreditNote={setSelectedCreditNote}
        fetchData={fetchData}
      />
    </>
  );
}
