import { useState } from "react";
import "./App.css";
import FetchedRecipes from "./components/FetchedRecipes";
import "bootstrap/dist/css/bootstrap.min.css";
import { ToastContainer } from "react-toastify";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";

function App() {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  return (
    <>
      <div className="App">
        <NavBar onSearch={handleSearch} />
        <FetchedRecipes searchQuery={searchQuery} />
        <ToastContainer />
        <Footer />
      </div>
    </>
  );
}

export default App;
