import { toast, type Id, type ToastType } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';

export default function useToast() {
  function showLoading(message: string) {
    return toast.loading(message);
  }

  function updateToast(
    id: Id,
    type: ToastType,
    message: string,
    autoClose: number = 3000
  ) {
    toast.update(id, {
      render: message,
      type,
      isLoading: false,
      autoClose,
      closeOnClick: true,
    });
  }

  return { showLoading, updateToast };
}
