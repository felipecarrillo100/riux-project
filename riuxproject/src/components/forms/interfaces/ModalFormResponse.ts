export interface ModalFormResponse {
    success: boolean;
    input?: string;
    values?: any;
}

export interface ModalFormOptions {
    size?: "small" | "medium" | "large";
}
