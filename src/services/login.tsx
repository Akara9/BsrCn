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

export async function SignInAPI(
  email: string,
  password: string
): Promise<any> {
  try {
    const myHeaders = new Headers();
    myHeaders.append("accept-language", "EN");
    myHeaders.append("x-platform", "ANDROID");
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append(
      "Authorization",
      "Basic Qm9Pbl9TaVJpX0wwZ0luX1ByMGQ6Qm9Pbl9TaVJpLUwwZ0luX3hQcjBkR0d3UDAwQDIwMjI="
    );
    const raw = JSON.stringify({
      email,
      password,
    });

    const requestOptions: RequestInit = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };
    const response = await fetchWithRetry(
      `https://203.114.108.46:14119/api/v1/login`,
      requestOptions
    );
    console.log(response);
    return response;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function UserInfo(token: string): Promise<any> {
  try {
    const myHeaders = new Headers();
    myHeaders.append("accept-language", "EN");
    myHeaders.append("x-platform", "ANDROID");
    myHeaders.append("x-access-token", token);
    myHeaders.append(
      "Authorization",
      "Basic Qm9Pbl9TaVJpX0wwZ0luX1ByMGQ6Qm9Pbl9TaVJpLUwwZ0luX3hQcjBkR0d3UDAwQDIwMjI="
    );

    const requestOptions: RequestInit = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow",
    };
    const response = await fetchWithRetry(
      `https://203.114.108.46:14119/api/v1/user/info`,
      requestOptions
    );
    console.log(response);
    return response;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function UserImages(): Promise<any> {
  try {
    const myHeaders = new Headers();
    myHeaders.append("accept-language", "EN");
    myHeaders.append("x-platform", "ANDROID");
    myHeaders.append(
      "Authorization",
      "Basic Qm9Pbl9TaVJpX0wwZ0luX1ByMGQ6Qm9Pbl9TaVJpLUwwZ0luX3hQcjBkR0d3UDAwQDIwMjI="
    );

    const requestOptions: RequestInit = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow",
    };
    const response = await fetchWithRetry(
      `https://203.114.108.46:14119/api/v1/user/all/images`,
      requestOptions
    );
    console.log(response);
    return response;
  } catch (error) {
    console.log(error);
    return null;
  }
}

