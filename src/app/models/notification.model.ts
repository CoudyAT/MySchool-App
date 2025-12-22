export interface Notification {
    id: string;
    body: string;
    data: Data;
    createdAt?: any;
    failureCount?: number;
    userId: string;
    sentAt?: any;
    successCount?: number;
    title: string;
    token: string[];
    type: string;
}

export interface Data {
    isTest: boolean;
    screen: string;
}

export interface Token {
    userId: string;
    token: string;
    plateform: string;
    deviceId: string;
    deviceName: string;
}