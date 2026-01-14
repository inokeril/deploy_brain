import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SchulteGame from "@/components/SchulteGame";

function App() {
  return (
    <div className="min-h-screen bg-background">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<SchulteGame />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
