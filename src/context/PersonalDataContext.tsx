import React, { createContext, useContext } from "react";

export type HeroTitleProps = {
  name: string;
  title: string;
  location?: string;
  company: string;
  aboutP1: string;
  aboutP2: string;
};

export type FooterProps = {
  footerNote: string;
  tagline: string;
};
export type LoaderProps = {
  loadingText: string;
};
export type MainNavbarProps = {
  navItems: Array<{
    number: string;
    label: string;
  }>;
};
export type TopBarProps = {
  topBarNickname: string;
  topBarFolioVersion: string;
};
export type PersonalData = {
  heroTitle: HeroTitleProps;
  footerData: FooterProps;
  LoaderData: LoaderProps;
  MainNavbarData: MainNavbarProps;
  TopBarData?: TopBarProps; 
};

const defaultData: PersonalData = {
  heroTitle: {
    name: "Ketan Raj",
    title: "SWE",
    company: "Google",
    location: "India",
    aboutP1:
      "Ketan Raj (He/Him) AKA Raaz is a Software Engineer from Gaya, Bihar, India.",
    aboutP2:
      "Passionate about building innovative solutions and solving complex problems.",
  },
  footerData: {
    tagline: "Just an ordinary Developer",
    footerNote: "From India with pride",
  },
  LoaderData: {
    loadingText: "Loading",
  },
  MainNavbarData: {
    navItems: [  
      { number: "01", label: "About" },
      { number: "02", label: "Experience" },
      { number: "03", label: "Playground" },
      { number: "04", label: "Contact" },
      { number: "", label: "© 2025" },
    ],
  },
  TopBarData: {
    topBarNickname: "Raaz",
    topBarFolioVersion: "Folio v.5",
  },
};

const PersonalDataContext = createContext<PersonalData>(defaultData);
export const usePersonalData = () => useContext(PersonalDataContext);

export const PersonalDataProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <PersonalDataContext.Provider value={defaultData}>
      {children}
    </PersonalDataContext.Provider>
  );
};
