import { createContext } from "react";


export const AppContext = createContext();

const AppContextProvider = ({ children }) => {

  const month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const calculateAge = (dob) => {
    const today = new Date();
    const birthDate = new Date(dob);

    let age = today.getFullYear() - birthDate.getFullYear();
    return age;
  }

  const slotDateFormat = (slotDate) => {
    const dateArr = slotDate.split('_');
    return dateArr[0] + " " + month[Number(dateArr[1]) - 1] + " " + dateArr[2];
  }

  const value = {
    calculateAge,
    slotDateFormat
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export default AppContextProvider;