import { createContext, ReactNode, useContext } from "react";

const AuthContext = createContext(null);

interface Props {
	children: ReactNode;
}

export const AuthContextProvider = ({ children }: Props) => {
	return <AuthContext.Provider>{children}</AuthContext.Provider>;
};

export const UserAuth = () => {
	return useContext(AuthContext);
};
