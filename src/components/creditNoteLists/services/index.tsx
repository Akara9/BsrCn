// import GetNameEmpProcess from "../../../services/getNameEmpProcess";
async function fetchWithRetry(url: string, options: RequestInit): Promise<any> {
  let result;
  for (let i = 0; i < 3; i++) {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    result = await response.json();
    if (result.status !== false) {
      return result;
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  return result;
}
// const linkPOS = "https://bsr-api.devmaewmaew.io/api";
const linkPOS = "https://203.114.108.46:8088/api";
const linkApiBsr = "https://203.114.108.46:6202/apicnqr/v1";
const bearerBsr = "Basic Y25xckBib29uc2lyaS5jby50aDpjbnFyQGJzciEhIQ==";
// const bearer = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXkiOiJhYVlYNEx6dFNRYjRNeXpnOWdMNiIsIlVzZXJDb2RlIjoiMDEyNTE2IiwiRW1haWwiOiJBa2FyYXBvbHBAYm9vbnNpcmltYWlsLmNvbSIsIlBlcnNvbmFsRW1haWwiOiIiLCJVc2VyTmFtZSI6IuC4reC4seC4hOC4o-C4nuC4pSDguJ7guKfguIfguYHguIHguYnguKciLCJsb2dpbl90eXBlIjoiTk9STUFMIiwidG9rZW5fdHlwZSI6IkFORFJPSUQiLCJpYXQiOjE3MTY1MTk0MzAsImV4cCI6MTcxNzEyNDIzMH0.nsbkYheRMvhyFNMfV-fR62-zjcVaII9hnKCDoMQSLFo";
const bearer =
  "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXkiOiJ4ajZCT3pMI0cmRkFrMTZjVFZlRCIsIlVzZXJDb2RlIjoiMDEyNTE2IiwiRW1haWwiOiJBa2FyYXBvbHBAYm9vbnNpcmltYWlsLmNvbSIsIlBlcnNvbmFsRW1haWwiOiIiLCJVc2VyTmFtZSI6IuC4reC4seC4hOC4o-C4nuC4pSDguJ7guKfguIfguYHguIHguYnguKciLCJsb2dpbl90eXBlIjoiTk9STUFMIiwidG9rZW5fdHlwZSI6IkFORFJPSUQiLCJpYXQiOjE3MDczNzg3NzEsImV4cCI6MTcwNzk4MzU3MX0.69PfvC21w_nR1DIjK_jV06v_U2yPLxTZw7O-muM1YJ0";

export async function getCreditNote(
  dateFrom: string,
  dateTo: string,
  branchId: number,
  searchValue: string,
  searchStatus: string
): Promise<any> {
  try {
    const myHeaders = new Headers();
    myHeaders.append("Authorization", bearer);

    const requestOptions: RequestInit = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow",
    };
    const response = await fetchWithRetry(
      `${linkPOS}/credit-notes?page=1&pageLimit=1000&sort=DESC&sortBy=CreatedAt&search=${searchValue}&dateFrom=${dateFrom}&dateTo=${dateTo}&branchId=${branchId}&status=${searchStatus}`,
      requestOptions
    );
    console.log(response);
    return response;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function getCreditNoteById(id: number): Promise<any> {
  try {
    const myHeaders = new Headers();
    myHeaders.append("Authorization", bearer);

    const requestOptions: RequestInit = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow",
    };
    const response = await fetchWithRetry(
      `${linkPOS}/credit-notes/${id}`,
      requestOptions
    );
    console.log(response);
    return response;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function updateCreditNoteItemById(IsData: any): Promise<any> {
  try {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", bearer);

    const raw = JSON.stringify({
      productCode: IsData.productCode,
      qtyCN: IsData.qtyCN,
      priceCN: IsData.priceCN,
      isReturn: IsData.isReturn,
      binLocation: IsData.binLocation,
      weightBaseFlag: IsData.weightBaseFlag,
    });

    const requestOptions: RequestInit = {
      method: "PATCH",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    const response = await fetchWithRetry(
      `${linkPOS}/credit-notes/${IsData.creditNoteId}/items/${IsData.id}`,
      requestOptions
    );
    console.log(response);
    return response;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function addCalDiscount(
  payload: string,
  priceLastcange: number,
  creditNoteItemId: number,
  creditNoteId: number
): Promise<any> {
  try {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", bearerBsr);
    const raw = JSON.stringify({
      payload: payload,
      priceLastcange: priceLastcange,
      creditNoteItemId: creditNoteItemId,
      creditNoteId: creditNoteId,
    });
    console.log("payload", raw);

    const requestOptions: RequestInit = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    const response = await fetchWithRetry(
      `${linkApiBsr}/addcaldiscount`,
      requestOptions
    );
    console.log(response);
    return response;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function updateCreditNote(
  id: number,
  payload: {
    Q1: any;
    Q2?: any;
    Q3?: any;
    amount?: any;
    branchId?: any;
    branchName?: any;
    companyCode?: any;
    companyName?: any;
    createdBy?: any;
    creditNoteStatus?: any;
    customerCode?: any;
    customerName?: any;
    discount?: any;
    invenName?: any;
    invoiceId?: any;
    invoiceNo?: any;
    reason1?: any;
    reason2?: any;
    reasonCode1?: any;
    saleName?: any;
    salePersonCode?: any;
    temperature?: any;
    weight?: any;
    whGrpCode?: any;
    whGrpName?: any;
  }
): Promise<any> {
  try {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", bearer);

    const raw = JSON.stringify({
      Q1: payload.Q1,
      Q2: payload.Q2,
      Q3: payload.Q3,
      amount: payload.amount,
      branchId: payload.branchId,
      branchName: payload.branchName,
      companyCode: payload.companyCode,
      companyName: payload.companyName,
      createdBy: payload.createdBy,
      creditNoteStatus: payload.creditNoteStatus,
      customerCode: payload.customerCode,
      customerName: payload.customerName,
      discount: payload.discount,
      invenName: payload.invenName,
      invoiceId: payload.invoiceId,
      invoiceNo: payload.invoiceNo,
      reason1: payload.reason1,
      reason2: payload.reason2,
      reasonCode1: payload.reasonCode1,
      saleName: payload.saleName,
      salePersonCode: payload.salePersonCode,
      temperature: payload.temperature,
      weight: payload.weight,
      whGrpCode: payload.whGrpCode,
      whGrpName: payload.whGrpName,
    });

    const requestOptions: RequestInit = {
      method: "PATCH",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    const response = await fetchWithRetry(
      `${linkPOS}/credit-notes/${id}`,
      requestOptions
    );
    console.log(response);
    return response;
  } catch (error) {
    console.log(error);
    return null;
  }
}
export async function updateCreditNoteByItems(
  id: number,
  creditNoteId: number,
  payload: any
): Promise<any> {
  try {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", bearer);

    const raw = JSON.stringify({
      productCode: payload.productCode,
      qtyCN: payload.qtyCN,
      priceCN: payload.priceCN,
      isReturn: payload.isReturn,
      binLocation: "",
      weightBaseFlag: payload.weightBaseFlag,
    });
    console.log("payload", raw);

    const requestOptions: RequestInit = {
      method: "PATCH",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    const response = await fetchWithRetry(
      `${linkPOS}/credit-notes/${creditNoteId}/items/${id}`,
      requestOptions
    );
    console.log(response);
    return response;
  } catch (error) {
    console.log(error);
    return null;
  }
  
}
export async function createCreditNoteByItem(
  data: any,
  creditNoteId: number
): Promise<any> {
  try {
    const myHeaders = new Headers();
    myHeaders.append("Authorization", bearer);
    myHeaders.append("Content-Type", "application/json");

    const requestOptions: RequestInit = {
      method: "POST",
      headers: myHeaders,
      body: JSON.stringify(data),
      redirect: "follow",
    };
    const response = await fetchWithRetry(
      `${linkPOS}/credit-notes/${creditNoteId}/items`,
      requestOptions
    );
    console.log(response);
    return response;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function createCreditNoteByFile(
  formdata: FormData,
  creditNoteId: number
): Promise<any> {
  try {
    const myHeaders = new Headers();
    myHeaders.append("Authorization", bearer);
    // Do not set Content-Type for FormData, browser will set it

    const requestOptions: RequestInit = {
      method: "POST",
      headers: myHeaders,
      body: formdata,
      redirect: "follow",
    };

    const response = await fetchWithRetry(
      `${linkPOS}/credit-notes/${creditNoteId}/files`,
      requestOptions
    );
    console.log(response);
    return response;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function detroyCreditNote(creditNoteId: number): Promise<any> {
  try {
    const myHeaders = new Headers();
    myHeaders.append("Authorization", bearer);

    const requestOptions: RequestInit = {
      method: "DELETE",
      headers: myHeaders,
      redirect: "follow",
    };

    const response = await fetchWithRetry(
      `${linkPOS}/credit-notes/${creditNoteId}`,
      requestOptions
    );
    console.log(response);
    return response;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function detroyCreditNoteItem(
  creditNoteId: number,
  creditNoteItemId: number
): Promise<any> {
  try {
    const myHeaders = new Headers();
    myHeaders.append("Authorization", bearer);

    const requestOptions: RequestInit = {
      method: "DELETE",
      headers: myHeaders,
      redirect: "follow",
    };

    const response = await fetchWithRetry(
      `${linkPOS}/credit-notes/${creditNoteId}/items/${creditNoteItemId}`,
      requestOptions
    );
    console.log(response);
    return response;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function detroyCreditNoteFile(
  creditNoteId: number,
  fileId: number
): Promise<any> {
  try {
    const myHeaders = new Headers();
    myHeaders.append("Authorization", bearer);

    const requestOptions: RequestInit = {
      method: "DELETE",
      headers: myHeaders,
      redirect: "follow",
    };

    const response = await fetchWithRetry(
      `${linkPOS}/credit-notes/${creditNoteId}/files/${fileId}`,
      requestOptions
    );
    console.log(response);
    return response;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function getInvoiceForCreateById(invoiceId: number): Promise<any> {
  try {
    const myHeaders = new Headers();
    myHeaders.append("Authorization", bearer);

    const requestOptions: RequestInit = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow",
    };
    const response = await fetchWithRetry(
      `${linkPOS}/invoices/${invoiceId}`,
      requestOptions
    );
    console.log(response);
    return response;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function creditNoteToB1(creditNoteId: number): Promise<any> {
  try {
    const myHeaders = new Headers();
    myHeaders.append("Authorization", bearer);
    myHeaders.append("Content-Type", "application/json");

    const requestOptions: RequestInit = {
      method: "POST",
      headers: myHeaders,
      redirect: "follow",
    };

    const response = await fetchWithRetry(
      `${linkPOS}/credit-notes/${creditNoteId}/to-b1`,
      requestOptions
    );
    console.log(response);
    return response;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function updateNameEmpQC(
  creditNoteId: number,
  empName: string,
) : Promise<any> {
  try {
    const myHeaders = new Headers();
    myHeaders.append("Authorization", bearerBsr);
    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify({
      createBy: empName,
      creditNoteId: creditNoteId,
    });

    const requestOptions: RequestInit = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    const response = await fetchWithRetry(
      `${linkApiBsr}/updatecreatecn`,
      requestOptions
    );
    console.log(response);
    return response;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function getCreditNoteItemsForCheck(
  invoiceNo: string,
) : Promise<any> {
  try {
    const myHeaders = new Headers();
    myHeaders.append("Authorization", bearer);

    const requestOptions: RequestInit = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow",
    };

    const response = await fetchWithRetry(
      `${linkPOS}/credit-notes/items?invoiceNo=${invoiceNo}`,
      requestOptions
    );
    console.log(response);
    return response;
  } catch (error) {
    console.log(error);
    return null;
  }
}