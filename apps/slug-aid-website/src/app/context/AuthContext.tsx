import { createContext, ReactNode, useContext } from "react";

const AuthContext = createContext();

interface Props {
	children: ReactNode;
}

export const AuthContextProvider = ({ children }: Props) => {
	return <AuthContext.Provider>{children}</AuthContext.Provider>;
};

export const UserAuth = () => {
	return useContext(AuthContext);
};
