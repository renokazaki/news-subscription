import { useEffect, useState } from "react";

function App() {
  const [status, setStatus] = useState("loading...");

  useEffect(() => {
    fetch("http://localhost:3000/api/v1/health")
      .then((res) => res.json())
      .then((data) => setStatus(data.status))
      .catch(() => setStatus("error - CORS?"));
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">API Status: {status}</h1>
    </div>
  );
}
export default App;
