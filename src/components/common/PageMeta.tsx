import { HelmetProvider, Helmet } from "react-helmet-async";

const PageMeta = ({
  
}: {
  title: string;
  description: string;
}) => (
  <Helmet>
    <title>{"BSR-CN"}</title>
     <meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0" />
  </Helmet>
);

export const AppWrapper = ({ children }: { children: React.ReactNode }) => (
  <HelmetProvider>{children}</HelmetProvider>
);

export default PageMeta;
