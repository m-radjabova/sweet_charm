import { toast } from "react-toastify";
import { HiMiniMapPin } from "react-icons/hi2";

export function showLocationErrorToast(message: string) {
  toast.error(message, {
    icon: (
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-md">
        <HiMiniMapPin className="h-5 w-5" />
      </div>
    ),
  });
}
