export interface PaystackTransactionInitializeResponse {
    status: boolean;
    message: string;
    data: {
        authorization_url: string;
        access_code: string;
        reference: string;
    };
}

export interface PaystackTransactionVerifyResponse {
    status: boolean;
    message: string;
    data: {
        id: number;
        status: string; // 'success', 'failed', 'abandoned'
        reference: string;
        amount: number;
        gateway_response: string;
        channel: string;
        currency: string;
        metadata?: any;
        plan?: string;
        customer: {
            email: string;
            customer_code: string;
        };
        authorization: {
            authorization_code: string;
            bin: string;
            last4: string;
            exp_month: string;
            exp_year: string;
            card_type: string;
            bank: string;
            country_code: string;
            brand: string;
            reusable: boolean;
            signature: string;
        };
    };
}

export interface PaystackSubscription {
    customer: number;
    plan: number;
    integration: number;
    domain: string;
    start: number;
    status: string;
    quantity: number;
    amount: number;
    subscription_code: string;
    email_token: string;
    authorization: any;
    easy_cron_id: string;
    cron_expression: string;
    next_payment_date: string;
    open_invoice: string;
    id: number;
    createdAt: string;
    updatedAt: string;
}

export interface SubscriptionPlan {
    id: string; // internal UUID
    name: string;
    slug: string;
    paystack_plan_code?: string;
    price: number;
    currency: string;
    interval: 'monthly' | 'yearly';
    features: string[]; // or JSON
}
