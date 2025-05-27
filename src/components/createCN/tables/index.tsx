import { useState, useEffect } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Badge from "../../ui/badge/Badge";
// import Button from "../../ui/button/Button";
import { branchs } from "../variables";
import { Select, Spin, Pagination, Input } from "antd";
import "./index.css";
import { InvList } from "../index";
import OrderDrawer from "./OrderDrawer";

import type { Dispatch, SetStateAction } from "react";
// import { FaCircleCheck } from "react-icons/fa6";
// import { ButtonGroupContext } from "@mui/material";
// import { FaOptinMonster } from "react-icons/fa";
interface TablesProps {
  setBrandSearch: Dispatch<SetStateAction<number | null>>;
  fetchInvoices?: () => void;
  invLists?: InvList[];
  loading?: boolean;
  options?: { value: string; label: string }[];
  brandSearch?: number | null;
  
}
export default function index({
  setBrandSearch,
  brandSearch,
  invLists,
  loading,
  options,
  fetchInvoices,
  
}: TablesProps) {
  // Search state
  const [search, setSearch] = useState("");

  // Filtered data by search
  const filteredData = invLists
    ? invLists.filter((order) =>
        Object.values(order)
          .join(" ")
          .toLowerCase()
          .includes(search.toLowerCase())
      )
    : [];

  // Pagination state
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Calculate paginated data
  const paginatedData = filteredData.slice(
    (current - 1) * pageSize,
    current * pageSize
  );

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<InvList | null>(null);

  // Add state for selected button
  const [selectedCNType, setSelectedCNType] = useState<"return" | "credit" | null>(null);
  
  useEffect(() => {
    if (drawerOpen) {
      const interval = setInterval(() => {
        const el = document.querySelector(".ant-drawer-content") as HTMLElement;
        if (el) {
          el.classList.add("rounded-[28px]", "overflow-hidden", "shadow-xl");
          clearInterval(interval); // หยุดหลังเจอแล้ว
        }
      }, 10); // รอให้ DOM สร้างเสร็จ
      return () => clearInterval(interval);
    }
  }, [drawerOpen]);

  return (
    <div className="flex flex-col  gap-2">
      <div className="flex flex-col md:flex-row md:justify-between gap-4">
        <div>
          <Select
            style={{ minWidth: 200 }}
            options={options}
            showSearch
            placeholder="เลือกสาขา"
            value={branchs?.find((row: any) => row.BranchId == brandSearch)?.WhsGrpName || undefined}
            onChange={(value) => {
              setBrandSearch(
                branchs?.find((row: any) => row.WhsGrpName == value)
                  ?.BranchId ?? null
              );
            }}
          />
        </div>
        <div>
          <Input
            placeholder="ค้นหา..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrent(1); // reset to first page on search
            }}
          />
        </div>
      </div>
      <div>
        <Spin spinning={loading} size="large" tip="กำลังโหลดข้อมูล...">
          <TableContainer
            component={Paper}
            sx={{ borderRadius: 2, boxShadow: "0",scrollbarWidth: 'thin',scrollbarColor: '#cbd5e1 #f3f4f6' }}
            className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-900 min-h-[400px] whitespace-nowrap"
          >
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <b>เลขที่ใบแจ้งหนี้</b>
                  </TableCell>
                  <TableCell>
                    <b>เลขที่ใบสั่งขาย</b>
                  </TableCell>
                  <TableCell>
                    <b>ชื่อลูกค้า</b>
                  </TableCell>
                  <TableCell>
                    <b>จำนวนเงิน</b>
                  </TableCell>
                  <TableCell>
                    <b>นํ้าหนัก</b>
                  </TableCell>
                  <TableCell>
                    <b>หน้าร้าน/สายส่ง</b>
                  </TableCell>
                  <TableCell>
                    <b>ผู้สร้างใบแจ้งหนี้</b>
                  </TableCell>
                  <TableCell>
                    <b>สร้างเมื่อ</b>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedData?.map((order) => (
                  <TableRow
                    key={order.invoiceId}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                    onClick={() => {
                      setSelectedOrder(order);
                      setDrawerOpen(true);
                    }}
                  >
                    <TableCell>{order?.invoiceNo}</TableCell>
                    <TableCell>{order?.orderNo}</TableCell>
                    <TableCell>{order?.customerName}</TableCell>
                    <TableCell>
                      <b className="text-[20px]">
                        {!isNaN(Number(order.amount))
                          ? Number(order.amount).toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })
                          : order.amount}
                      </b>
                    </TableCell>
                    <TableCell>
                      <b className="text-[20px]">
                        {!isNaN(Number(order.weight))
                          ? Number(order.weight).toLocaleString("en-US", {
                              minimumFractionDigits: 1,
                              maximumFractionDigits: 1,
                            })
                          : order.weight}
                      </b>
                    </TableCell>
                    <TableCell>
                      {order?.shippingType == "1" ? (
                        <Badge variant="light" color="primary">
                          สายส่ง
                        </Badge>
                      ) : (
                        <Badge variant="light" color="success">
                          หน้าร้าน
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>{order?.userResponsible}</TableCell>
                    <TableCell>
                      {order?.createdAt
                        ? new Date(order.createdAt).toLocaleDateString("th-TH", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                        : ""}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {/* Pagination */}
          <div className="flex justify-end mt-2">
            <Pagination
              current={current}
              pageSize={pageSize}
              total={invLists?.length || 0}
              showSizeChanger
              pageSizeOptions={["10", "20", "50", "100"]}
              onChange={(page, size) => {
                setCurrent(page);
                setPageSize(size || 10);
              }}
              showTotal={(total, range) =>
                `${range[0]}-${range[1]} จาก ${total} รายการ`
              }
            />
          </div>
        </Spin>
        {/* Drawer for order details */}
        <OrderDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          selectedOrder={selectedOrder}
          selectedCNType={selectedCNType}
          setSelectedCNType={setSelectedCNType}
          setSelectedOrder={setSelectedOrder}
          fetchInvoices={fetchInvoices}
        />
      </div>
    </div>
  );
}
