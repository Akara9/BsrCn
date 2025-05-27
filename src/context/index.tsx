import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import GetCalcurateDiscount from "../services/getCalcurateDiscount";
import GetNameEmpProcess from "../services/getNameEmpProcess";
import GetReportServMaster from "../services/getReportServMaster";

export interface DataContextType {
  data: {
    CNQR_NameEmProcess: any[];
    CNQR_calcurateDiscount: any[];
    reportServMasterData: any[];
    message?: string | null;
  };
  setData: React.Dispatch<
    React.SetStateAction<{
      CNQR_NameEmProcess: any[];
      CNQR_calcurateDiscount: any[];
      reportServMasterData: any[];
      message?: string | null;
    }>
  >;
}

export const DataContext = createContext<DataContextType | undefined>(
  undefined
);

export const useDataContext = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useDataContext must be used within a DataContextProvider");
  }
  return context;
};

// Exported fetchData function
export const fetchData = async (
  setData: React.Dispatch<
    React.SetStateAction<{
      CNQR_NameEmProcess: any[];
      CNQR_calcurateDiscount: any[];
      reportServMasterData: any[];
      message?: string | null;
    }>
  >
) => {
  const discountData = (await GetCalcurateDiscount()) ?? [];
  const nameProcessData = (await GetNameEmpProcess()) ?? [];
  const reportServMasterData = (await GetReportServMaster()) ?? [];

  setData({
    CNQR_calcurateDiscount: discountData,
    CNQR_NameEmProcess: nameProcessData,
    reportServMasterData: reportServMasterData,
    message: null
  });
};

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<{
    CNQR_NameEmProcess: any[];
    CNQR_calcurateDiscount: any[];
    reportServMasterData: any[];
    message?: string | null;
  }>({
    CNQR_NameEmProcess: [],
    CNQR_calcurateDiscount: [],
    reportServMasterData: [],
    message: null,
  });

  useEffect(() => {
    fetchData(setData);
  }, []);
  useEffect(() => {
    console.log("🚀 ~ DataProvider ~ data:", data);
  }, [data]);
  return (
    <DataContext.Provider value={{ data, setData }}>
      {children}
    </DataContext.Provider>
  );
};
