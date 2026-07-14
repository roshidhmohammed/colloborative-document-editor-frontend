import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useFetchProfile } from "../hooks/useFetchProfile";
import Button from "@/components/ui/Button";
import axiosInstance from "@/lib/axios";
import { API_ENDPOINTS } from "@/constants/api";
import { ROUTES } from "@/constants/routes";
import { AppToast } from "@/lib/toast";
import { clearAuthToken } from "@/features/auth/actions/authCookies";

const ProfileModal = () => {
  const data = useFetchProfile();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await axiosInstance.post(API_ENDPOINTS.LOGOUT, {}, { withCredentials: true });
      await clearAuthToken();
      router.replace(ROUTES.LOGIN);
    } catch (error) {
      AppToast.error({
        title: "Logout Failed",
        description: "An error occurred while logging out. Please try again.",
      });
    }
  };

  return (
    <div className=" absolute right-0 mt-3 w-72 rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-2xl shadow-black/30 ">
      <div className="border-b border-slate-800 pb-3">
        <p className="text-sm font-semibold text-white">
          {data?.fullName}
        </p>
        <p className="mt-1 text-sm text-slate-400">
          {data?.email}
        </p>
      </div>

      <Button
        type="button"
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2.5 text-sm font-medium text-rose-300 transition hover:bg-rose-500/20"
        onClick={handleLogout}
      >
        <LogOut className="h-4 w-4" />
        Logout
      </Button>
    </div>
  );
};

export default ProfileModal;
