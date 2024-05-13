import React, { useState } from "react";
import logo from "../img/bread-2389247_1280.png";
import "../App.css";

export default function NavBar({ onSearch }) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSearch(searchQuery);
  };

  const clearSearch = () => {
    setSearchQuery("");
    onSearch("");
  };

  return (
    <>
      <nav
        className="navbar navbar-expand-lg "
        style={{ backgroundColor: "#E4D8C9", borderRadius: "5px" }}
      >
        <div className="container-fluid">
          <a className="navbar-brand" href="#">
            <img
              src={logo}
              alt="Logo"
              style={{ height: "50px", borderRadius: "5px" }}
            />
          </a>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarSupportedContent"
            aria-controls="navbarSupportedContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <a className="nav-link active" aria-current="page" href="#">
                  Home
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#">
                  Club
                </a>
              </li>
              <li className="nav-item dropdown">
                <a
                  className="nav-link dropdown-toggle"
                  href="#"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  Categories
                </a>
                <ul className="dropdown-menu">
                  <li>
                    <a className="dropdown-item" href="#">
                      Action
                    </a>
                  </li>
                  <li>
                    <a className="dropdown-item" href="#">
                      Another action
                    </a>
                  </li>
                  <li>
                    <hr className="dropdown-divider" />
                  </li>
                  <li>
                    <a className="dropdown-item" href="#">
                      Something else here
                    </a>
                  </li>
                </ul>
              </li>
            </ul>
            <form className="d-flex" role="search" onSubmit={handleSubmit}>
              <div className="search-wrapper">
                <div className="search-input">
                  <input
                    className="form-control me-2 search-input"
                    type="search"
                    placeholder="Search"
                    aria-label="Search"
                    value={searchQuery}
                    onChange={handleSearchChange}
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      className="clear-button"
                      onClick={clearSearch}
                    ></button>
                  )}
                </div>
                <button
                  className="btn btn-outline-success"
                  style={{ color: "#43766C", border: "1px solid #43766C" }}
                  type="submit"
                >
                  Search
                </button>
              </div>
            </form>
          </div>
        </div>
      </nav>
    </>
  );
}
