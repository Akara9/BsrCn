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


export async function getInvoiceForCreate(
    dateFrom: string,
    dateTo: string,
    branchId: number,
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
        `${linkPOS}/invoices?page=1&sort=DESC&toB1=1&dateFrom=${dateFrom} 00:00:00&dateTo=${dateTo} 23:59:59&inStock=1&withOutCN=1&sortBy=invoiceId&pageLimit=2500&branchId=${branchId}`,
        requestOptions
        );
        console.log(response);
        return response;
    } catch (error) {
        console.log(error);
        return null;
    }
}

export async function getInvoiceForCreateById(
    invoiceId: number,
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

export async function createCreditNote(
    data: any,
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
        `${linkPOS}/credit-notes`,
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
    creditNoteId: number,
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
  creditNoteId: number,
): Promise<any> {
  try {
    const myHeaders = new Headers();
    myHeaders.append("Authorization", bearer);
    // Do not set Content-Type for FormData, browser will set it

   

    const requestOptions: RequestInit = {
      method: "POST",
      headers: myHeaders,
      body: formdata,
      redirect: "follow"
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
export async function getSalePersonCode(
  userCode:string,
  companyCode:string,
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
        `${linkPOS}/sale-person?userCode=${userCode}&companyCode=${companyCode}`,
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
    myHeaders.append("Authorization", bearerBsr);

    const requestOptions: RequestInit = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow",
    };

    const response = await fetchWithRetry(
      `${linkApiBsr}/getCreditNoteItemsForCheck?invoiceNo=${invoiceNo}`,
      requestOptions
    );
    console.log(response);
    return response;
  } catch (error) {
    console.log(error);
    return null;
  }
}
