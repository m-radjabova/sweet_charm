import { useEffect, useState } from "react";

function useLoading() {
    const [loading, setLoading] = useState(true);
            
        useEffect(() => {
            const timer = setTimeout(() => {
                setLoading(false);
            }, 1600); 
            
            return () => clearTimeout(timer);
        }, []);
  return {
      loading  
  }
}

export default useLoading;
