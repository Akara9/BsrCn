// import { useDataContext } from '../context'; // Update the path as needed
// import { useEffect } from 'react';

const GetCalcurateDiscount = async () => {
    const myHeaders = new Headers();
    myHeaders.append("Authorization", "Basic Y25xckBib29uc2lyaS5jby50aDpjbnFyQGJzciEhIQ==");

    const requestOptions: RequestInit = {
        method: "GET",
        headers: myHeaders,
        redirect: "follow"
    };

    try {
        const response = await fetch("https://203.114.108.46:6202/apicnqr/v1/calcurateDiscountAll", requestOptions);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        return result.data;
    } catch (error) {
        console.error("Error fetching calcurate discount:", error);
        return [];
    }
};

export default GetCalcurateDiscount;

