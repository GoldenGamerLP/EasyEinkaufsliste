import type { FrontEndUser } from "~/types/User";

export const useMembers = () => {
    const members = useState<FrontEndUser[] | null>("members", () => null);
    return members;
};