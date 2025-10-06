"use client";

import { Modal, ModalFooter } from "./Modal";
import { Button } from "./Button";
import { HiExclamationTriangle, HiInformationCircle } from "react-icons/hi2";

/**
 * Modal di conferma riutilizzabile
 * @param {boolean} isOpen - Stato apertura modal
 * @param {Function} onClose - Callback chiusura
 * @param {Function} onConfirm - Callback conferma
 * @param {string} title - Titolo modal
 * @param {string} message - Messaggio principale
 * @param {string} confirmText - Testo bottone conferma
 * @param {string} cancelText - Testo bottone annulla
 * @param {string} type - Tipo: 'danger' | 'warning' | 'info'
 * @param {JSX.Element} children - Contenuto aggiuntivo
 */
export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Conferma",
  cancelText = "Annulla",
  type = "warning",
  children,
}) {
  const getIcon = () => {
    switch (type) {
      case "danger":
        return (
          <HiExclamationTriangle className="h-12 w-12 text-destructive mx-auto" />
        );
      case "warning":
        return (
          <HiExclamationTriangle className="h-12 w-12 text-warning mx-auto" />
        );
      case "info":
        return (
          <HiInformationCircle className="h-12 w-12 text-primary mx-auto" />
        );
      default:
        return null;
    }
  };

  const getConfirmVariant = () => {
    switch (type) {
      case "danger":
        return "destructive";
      case "warning":
        return "warning";
      default:
        return "primary";
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="md">
      <div className="text-center">
        {getIcon()}
        <p className="mt-4 text-foreground">{message}</p>
        {children}
      </div>

      <ModalFooter className="justify-center">
        <Button variant="outline" onClick={onClose}>
          {cancelText}
        </Button>
        <Button variant={getConfirmVariant()} onClick={onConfirm}>
          {confirmText}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
