import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { ToastContainer } from "react-toastify";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import CreateContextPro from "./hooks/CreateContextPro.tsx";
import RealtimeProvider from "./realtime/RealtimeProvider.tsx";
import GlobalErrorBoundary from "./components/GlobalErrorBoundary.tsx";
import { HelmetProvider } from "react-helmet-async";
import "./i18n";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
    mutations: {
      retry: 0,
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <>
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <BrowserRouter>
          <GlobalErrorBoundary>
            <CreateContextPro>
              <RealtimeProvider>
                <App />
                <ToastContainer />
              </RealtimeProvider>
            </CreateContextPro>
          </GlobalErrorBoundary>
        </BrowserRouter>
      </HelmetProvider>
    </QueryClientProvider>
  </>
);
