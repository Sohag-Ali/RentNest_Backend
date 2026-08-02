export interface ICreateReview {
    rentalRequestId: string;
    rating: number;
    comment: string;
}

export interface IUpdateReview {
    rating?: number;
    comment?: string;
}
