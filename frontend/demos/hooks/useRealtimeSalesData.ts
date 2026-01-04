"use client";

import { useState, useEffect, useCallback } from 'react';

export interface SaleDataPoint {
    time: string;
    sales: number;
}

export interface LatestPayment {
    id: string;
    amount: number;
    product: string;
    customer: string;
    time: string;
}

interface UseRealtimeSalesDataReturn {
    totalRevenue: number;
    cumulativeRevenueData: SaleDataPoint[];
    salesCount: number;
    averageSale: number;
    salesChartData: SaleDataPoint[];
    latestPayments: LatestPayment[];
}

// Generate random customer names
const customerNames = [
    'Alex Johnson', 'Sam Wilson', 'Jordan Lee', 'Casey Brown',
    'Morgan Davis', 'Taylor Smith', 'Jamie Garcia', 'Riley Martinez'
];

// Generate random product names
const productNames = [
    'Voice License - Pro', 'Voice Clone - Basic', 'AI Voice Pack',
    'Studio Access', 'Premium Subscription', 'Voice NFT Mint'
];

const getRandomElement = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const formatTime = (date: Date): string => {
    return date.toTimeString().split(' ')[0]; // HH:MM:SS format
};

export const useRealtimeSalesData = (): UseRealtimeSalesDataReturn => {
    const [totalRevenue, setTotalRevenue] = useState(1250.00);
    const [salesCount, setSalesCount] = useState(47);
    const [salesChartData, setSalesChartData] = useState<SaleDataPoint[]>([]);
    const [cumulativeRevenueData, setCumulativeRevenueData] = useState<SaleDataPoint[]>([]);
    const [latestPayments, setLatestPayments] = useState<LatestPayment[]>([]);

    // Initialize data on mount
    useEffect(() => {
        const now = new Date();
        const initialData: SaleDataPoint[] = [];
        const initialCumulative: SaleDataPoint[] = [];
        let cumulativeTotal = totalRevenue - 200; // Start a bit lower

        // Generate initial data points for the last 2 minutes
        for (let i = 120; i >= 0; i -= 10) {
            const time = new Date(now.getTime() - i * 1000);
            const sale = Math.random() * 50 + 10;
            cumulativeTotal += sale / 10;

            initialData.push({
                time: formatTime(time),
                sales: parseFloat(sale.toFixed(2))
            });

            initialCumulative.push({
                time: formatTime(time),
                sales: parseFloat(cumulativeTotal.toFixed(2))
            });
        }

        setSalesChartData(initialData);
        setCumulativeRevenueData(initialCumulative);

        // Generate initial payments
        const initialPayments: LatestPayment[] = [];
        for (let i = 0; i < 5; i++) {
            const paymentTime = new Date(now.getTime() - i * 30000); // 30 seconds apart
            initialPayments.push({
                id: `payment-${Date.now()}-${i}`,
                amount: parseFloat((Math.random() * 100 + 20).toFixed(2)),
                product: getRandomElement(productNames),
                customer: getRandomElement(customerNames),
                time: formatTime(paymentTime)
            });
        }
        setLatestPayments(initialPayments);
    }, []);

    // Simulate real-time updates
    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();
            const timeStr = formatTime(now);

            // Random sale amount between $10 and $80
            const saleAmount = parseFloat((Math.random() * 70 + 10).toFixed(2));

            // Update sales chart data
            setSalesChartData(prev => {
                const newData = [...prev, { time: timeStr, sales: saleAmount }];
                // Keep last 120 data points (2 minutes at 1 second intervals)
                return newData.slice(-120);
            });

            // Update cumulative revenue
            setTotalRevenue(prev => {
                const newTotal = prev + saleAmount / 10;

                setCumulativeRevenueData(prevCum => {
                    const newCumData = [...prevCum, { time: timeStr, sales: parseFloat(newTotal.toFixed(2)) }];
                    return newCumData.slice(-120);
                });

                return parseFloat(newTotal.toFixed(2));
            });

            // Occasionally add a new payment (30% chance)
            if (Math.random() > 0.7) {
                setSalesCount(prev => prev + 1);

                setLatestPayments(prev => {
                    const newPayment: LatestPayment = {
                        id: `payment-${Date.now()}`,
                        amount: saleAmount,
                        product: getRandomElement(productNames),
                        customer: getRandomElement(customerNames),
                        time: timeStr
                    };
                    return [newPayment, ...prev].slice(0, 10);
                });
            }
        }, 1000); // Update every second

        return () => clearInterval(interval);
    }, []);

    const averageSale = salesCount > 0 ? totalRevenue / salesCount : 0;

    return {
        totalRevenue,
        cumulativeRevenueData,
        salesCount,
        averageSale: parseFloat(averageSale.toFixed(2)),
        salesChartData,
        latestPayments
    };
};
