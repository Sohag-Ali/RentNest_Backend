export declare const Role: {
    readonly TENANT: "TENANT";
    readonly LANDLORD: "LANDLORD";
    readonly ADMIN: "ADMIN";
};
export type Role = (typeof Role)[keyof typeof Role];
export declare const UserStatus: {
    readonly ACTIVE: "ACTIVE";
    readonly INACTIVE: "INACTIVE";
    readonly BANNED: "BANNED";
};
export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus];
export declare const RentalStatus: {
    readonly PENDING: "PENDING";
    readonly APPROVED: "APPROVED";
    readonly REJECTED: "REJECTED";
    readonly CANCELLED: "CANCELLED";
    readonly COMPLETED: "COMPLETED";
};
export type RentalStatus = (typeof RentalStatus)[keyof typeof RentalStatus];
export declare const PaymentProvider: {
    readonly STRIPE: "STRIPE";
    readonly PAYPAL: "PAYPAL";
    readonly SQUARE: "SQUARE";
};
export type PaymentProvider = (typeof PaymentProvider)[keyof typeof PaymentProvider];
export declare const PaymentStatus: {
    readonly PENDING: "PENDING";
    readonly PAID: "PAID";
    readonly COMPLETED: "COMPLETED";
    readonly FAILED: "FAILED";
    readonly REFUNDED: "REFUNDED";
};
export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];
//# sourceMappingURL=enums.d.ts.map