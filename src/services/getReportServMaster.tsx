// import { useDataContext } from '../context'; // Update the path as needed
// import { useEffect } from 'react';

const GetReportServMaster = async () => {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", "Basic Y25xckBib29uc2lyaS5jby50aDpjbnFyQGJzciEhIQ==");

    const raw = JSON.stringify({
    "ServiceGroup": ""
    })

    const requestOptions: RequestInit = {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow"
    };

    try {
        const response = await fetch("https://203.114.108.46:6202/apicnqr/v1/getreportservmaster", requestOptions);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        return result.data;
    } catch (error) {
        console.error("Error fetching name emp process:", error);
        return [];
    }
};

export default GetReportServMaster;

