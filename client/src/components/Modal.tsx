import type { ReactNode } from "react";

type ModalProps = {
  title: string;
  children: ReactNode;
};

function Modal({ title, children }: ModalProps) {
  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <h3 className="text-lg font-bold">{title}</h3>
        <div className="py-4">{children}</div>
      </div>
    </div>
  );
}

export default Modal;
