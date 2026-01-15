import { PaystackTransactionInitializeResponse, PaystackTransactionVerifyResponse } from "./types"

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY
const PAYSTACK_BASE_URL = "https://api.paystack.co"

if (!PAYSTACK_SECRET_KEY) {
    console.warn("PAYSTACK_SECRET_KEY is not set in environment variables.")
} else {
    console.log("PAYSTACK_SECRET_KEY loaded:", PAYSTACK_SECRET_KEY?.substring(0, 10) + "...")
}

export const paystackService = {
    async initializeTransaction(
        email: string,
        amount: number, // in kobo/cents
        callbackUrl: string,
        plan?: string, // paystack plan code
        metadata?: any
    ): Promise<PaystackTransactionInitializeResponse> {
        const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email,
                amount: amount * 100, // convert to smallest currency unit (kobo)
                plan,
                callback_url: callbackUrl,
                metadata
            }),
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.message || "Failed to initialize transaction")
        }

        return response.json()
    },

    async verifyTransaction(reference: string): Promise<PaystackTransactionVerifyResponse> {
        const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/verify/${reference}`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
            },
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.message || "Failed to verify transaction")
        }

        return response.json()
    },

    async listPlans() {
        const response = await fetch(`${PAYSTACK_BASE_URL}/plan`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
            },
        })
        return response.json()
    }
}
