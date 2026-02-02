import React, { createContext, useState, useContext } from "react";
import Alertbox from "./Alertbox";

const AlertContext = createContext();

const useAlert = () => useContext(AlertContext);

const AlertProvider = ({ children }) => {
  const [alert, setAlert] = useState({ message: "", type: "" });

  const showAlert = (message, type = "info", duration = 3000) => {
    setAlert({ message, type, duration });
  };

  const closeAlert = () => setAlert({ message: "", type: "" });

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      <Alertbox
        message={alert.message}
        type={alert.type}
        duration={alert.duration}
        onClose={closeAlert}
      />
    </AlertContext.Provider>
  );
};

export { AlertContext, useAlert, AlertProvider };
