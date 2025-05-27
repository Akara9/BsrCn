import { useState } from "react";
import Button from "../../ui/button/Button";
import { useDataContext } from "../../../context";
interface props {
  complainData: any[];
}
const index = (
  {complainData}: props
) => {
  const { data } = useDataContext();
  const [active, setActive] = useState("ทั้งหมด");

  const buttons = [
    "ทั้งหมด",
    "ฝ่ายขาย",
    "ขนส่ง",
    "คลัง",
    "สำนักงานใหญ่",
    "ธุรการขาย",
    "ควบคุมคุณภาพสินค้า",
  ];

  // Filter data based on active ServiceGroup
  const filteredData =
    active === "ทั้งหมด"
      ? data?.reportServMasterData
      : data?.reportServMasterData?.filter(
          (item) => item?.ServiceGroup === active
        );

  return (
    <>
      <div className="">
        {buttons.map((label) => (
          <Button
            key={label}
            className="m-1"
            variant={active === label ? "primary" : "outline"}
            onClick={() => setActive(label)}
          >
            {label}
          </Button>
        ))}
      </div>
      <hr></hr>
      {filteredData?.length > 0 &&
        filteredData.map((item, index) => (
          <div key={index} className="">
            <div className="border-b pb-5">
              <b className="text-sm text-gray-600">{item?.ServiceName}</b>
              <p className="text-sm text-gray-500">{item?.ServiceGroup}</p>
              <b>
                {
                  complainData?.filter(items => {
                    try {
                      const arr = JSON.parse(items.ServiceIdMulti);
                      return Array.isArray(arr) && arr.includes(item.ServicesId);
                    } catch {
                      return false;
                    }
                  })?.length
                }
              </b>
            </div>
          </div>
        ))}
    </>
  );
};

export default index;
