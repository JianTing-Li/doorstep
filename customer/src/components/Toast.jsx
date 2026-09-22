import { useEffect } from "react";
import Icon from "./Icon.jsx";
import { useApp } from "../AppContext.jsx";

export default function Toast() {
  const { toast } = useApp();

  if (!toast) return null;
  return <ToastInner key={toast.key} message={toast.message} icon={toast.icon} />;
}

function ToastInner({ message, icon }) {
  return (
    <div className="toast ds-toast" role="status">
      <Icon name={icon} size={16} />
      <span>{message}</span>
    </div>
  );
}
