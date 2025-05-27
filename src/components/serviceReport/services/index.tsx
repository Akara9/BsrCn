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
// const linkPOS = "https://203.114.108.46:8088/api";
const linkApiBsr = "https://203.114.108.46:6202/apicnqr/v1";
const bearerBsr = "Basic Y25xckBib29uc2lyaS5jby50aDpjbnFyQGJzciEhIQ==";
// const bearer = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXkiOiJhYVlYNEx6dFNRYjRNeXpnOWdMNiIsIlVzZXJDb2RlIjoiMDEyNTE2IiwiRW1haWwiOiJBa2FyYXBvbHBAYm9vbnNpcmltYWlsLmNvbSIsIlBlcnNvbmFsRW1haWwiOiIiLCJVc2VyTmFtZSI6IuC4reC4seC4hOC4o-C4nuC4pSDguJ7guKfguIfguYHguIHguYnguKciLCJsb2dpbl90eXBlIjoiTk9STUFMIiwidG9rZW5fdHlwZSI6IkFORFJPSUQiLCJpYXQiOjE3MTY1MTk0MzAsImV4cCI6MTcxNzEyNDIzMH0.nsbkYheRMvhyFNMfV-fR62-zjcVaII9hnKCDoMQSLFo";
// const bearer =
//   "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXkiOiJ4ajZCT3pMI0cmRkFrMTZjVFZlRCIsIlVzZXJDb2RlIjoiMDEyNTE2IiwiRW1haWwiOiJBa2FyYXBvbHBAYm9vbnNpcmltYWlsLmNvbSIsIlBlcnNvbmFsRW1haWwiOiIiLCJVc2VyTmFtZSI6IuC4reC4seC4hOC4o-C4nuC4pSDguJ7guKfguIfguYHguIHguYnguKciLCJsb2dpbl90eXBlIjoiTk9STUFMIiwidG9rZW5fdHlwZSI6IkFORFJPSUQiLCJpYXQiOjE3MDczNzg3NzEsImV4cCI6MTcwNzk4MzU3MX0.69PfvC21w_nR1DIjK_jV06v_U2yPLxTZw7O-muM1YJ0";

export async function getcomplainall(): Promise<any> {
    try {
        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        myHeaders.append("Authorization", bearerBsr);
        const raw = JSON.stringify({
            Year: "",
            Month: "",
        });

        const requestOptions: RequestInit = {
            method: "POST",
            headers: myHeaders,
            body: raw,
            redirect: "follow",
        };

        const response = await fetchWithRetry(
            `${linkApiBsr}/getcomplainall`,
            requestOptions
        );
        console.log(response);
        return response;
    } catch (error) {
        console.error("Error fetching complain all:", error);
        return [];
    }
}

export async function updateNameEmService(
  data:any
) : Promise<any> {
  try {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", bearerBsr);
    const raw = JSON.stringify(data);

    const requestOptions: RequestInit = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    const response = await fetchWithRetry(
      `${linkApiBsr}/updateNameEmService`,
      requestOptions
    );
    return response;
  } catch (error) {
    console.error("Error updating name employee service:", error);
    return null;
  }
}

export async function checkservicereport(
  OrderNo: string,
  InvoiceNo: string
): Promise<any> {
  try {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", bearerBsr);
    const raw = JSON.stringify({
      OrderNo,
      InvoiceNo,
    });

    const requestOptions: RequestInit = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    const response = await fetchWithRetry(
      `${linkApiBsr}/checkservicereport`,
      requestOptions
    );
    return response;
  } catch (error) {
    console.error("Error checking service report:", error);
    return null;
  }
}

export async function sendMail(
  email: string,
  date: string,
  body: string,
): Promise<any> {
  try {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", bearerBsr);
    const raw = JSON.stringify({
            "to": email,
            "cc": "",
            "subject": "บุญศิริ แจ้งเคลมสินค้า/การบริการ (แจ้งเตือน) "+date+"",
            "body": body,
            "replyto": ""
          });

    const requestOptions: RequestInit = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    const response = await fetchWithRetry(
      `${linkApiBsr}/sendMail`,
      requestOptions
    );
    console.log(response);
    return response;
  } catch (error) {
    console.log(error);
    return null;
  }
}