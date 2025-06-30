import type { FrontEndUser, User } from "~/types/User";

export const useUser = () => {
	const user = useState<FrontEndUser | null>("user", () => null);
	return user;
};