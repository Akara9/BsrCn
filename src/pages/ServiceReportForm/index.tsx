
import PageMeta from "../../components/common/PageMeta";
import ServiceReportForm from "../../components/ServiceReportForm";
export default function serviceReport() {
  return (
    <>
      <PageMeta
        title="React.js Ecommerce Dashboard | TailAdmin - React.js Admin Dashboard Template"
        description="This is React.js Ecommerce Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 lg:col-span-12">
          <ServiceReportForm />
        </div>
      </div>
    </>
  );
}
