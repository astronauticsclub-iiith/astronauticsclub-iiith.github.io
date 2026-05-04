"use client";

import { useState, useCallback } from "react";

interface AlertState {
    isOpen: boolean;
    message: string;
    type: "success" | "error" | "warning" | "info";
}

interface ConfirmState {
    isOpen: boolean;
    title: string;
    message: string;
    type?: "danger" | "warning" | "info";
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
}

export function useAlert() {
    const [alertState, setAlertState] = useState<AlertState>({
        isOpen: false,
        message: "",
        type: "info",
    });

    const [confirmState, setConfirmState] = useState<ConfirmState>({
        isOpen: false,
        title: "",
        message: "",
        onConfirm: () => {},
    });

    const showAlert = useCallback(
        (message: string, type: "success" | "error" | "warning" | "info" = "info") => {
            setAlertState({
                isOpen: true,
                message,
                type,
            });
        },
        []
    );

    const showSuccess = useCallback(
        (message: string) => {
            showAlert(message, "success");
        },
        [showAlert]
    );

    const showError = useCallback(
        (message: string) => {
            showAlert(message, "error");
        },
        [showAlert]
    );

    const showWarning = useCallback(
        (message: string) => {
            showAlert(message, "warning");
        },
        [showAlert]
    );

    const showInfo = useCallback(
        (message: string) => {
            showAlert(message, "info");
        },
        [showAlert]
    );

    const closeAlert = useCallback(() => {
        setAlertState((prev) => ({ ...prev, isOpen: false }));
    }, []);

    const showConfirm = useCallback(
        (
            title: string,
            message: string,
            onConfirm: () => void,
            options?: {
                type?: "danger" | "warning" | "info";
                confirmText?: string;
                cancelText?: string;
            }
        ) => {
            setConfirmState({
                isOpen: true,
                title,
                message,
                onConfirm,
                type: options?.type || "warning",
                confirmText: options?.confirmText,
                cancelText: options?.cancelText,
            });
        },
        []
    );

    const closeConfirm = useCallback(() => {
        setConfirmState((prev) => ({ ...prev, isOpen: false }));
    }, []);

    const handleConfirm = useCallback(() => {
        confirmState.onConfirm();
        closeConfirm();
    }, [confirmState, closeConfirm]);

    return {
        // Alert methods
        showAlert,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        closeAlert,
        alertState,

        // Confirm methods
        showConfirm,
        closeConfirm,
        handleConfirm,
        confirmState,
    };
}
