import { toast, type Id, type ToastType } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';

const DEFAULT_AUTOCLOSE_TIME = 3000;

export default function useToast() {
  function showLoading(message: string) {
    return toast.loading(message);
  }

  function updateToast(
    id: Id,
    type: ToastType,
    message: string,
    autoClose: number = DEFAULT_AUTOCLOSE_TIME
  ) {
    toast.update(id, {
      render: message,
      type,
      isLoading: false,
      autoClose,
      closeOnClick: true,
    });
  }

  function showToast(
    message: string,
    type: ToastType,
    options?: { onClick?: () => void; autoClose?: number }
  ) {
    toast(message, {
      type,
      autoClose: options?.autoClose ?? DEFAULT_AUTOCLOSE_TIME,
      onClick: options?.onClick,
    });
  }

  return { showLoading, updateToast, showToast };
}
