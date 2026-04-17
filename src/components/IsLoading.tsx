import { FourSquare } from "react-loading-indicators";

function IsLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      <div className="relative flex h-32 w-32 items-center justify-center rounded-[28px] border border-white/60 bg-white/75 shadow-[0_20px_60px_rgba(49,92,204,0.12)] backdrop-blur-xl">
        <div className="absolute inset-0 rounded-[28px] bg-gradient-to-br from-blue-100/40 to-indigo-100/20" />
        <div className="relative">
          <FourSquare color="#315ccc" size="large" text="" textColor="" />
        </div>
      </div>
    </div>
  );
}

export default IsLoading;