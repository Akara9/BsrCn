
import PageMeta from "../../components/common/PageMeta";
import ToB1DisCountMarketingElement from "../../components/toB1DisCountMarketing";
export default function toB1DisCountMarketing() {
  return (
    <>
      <PageMeta
        title="React.js Ecommerce Dashboard | TailAdmin - React.js Admin Dashboard Template"
        description="This is React.js Ecommerce Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 lg:col-span-12">
          <ToB1DisCountMarketingElement />
        </div>
      </div>
    </>
  );
}
