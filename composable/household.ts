import type { HouseHold } from "~/types/HouseHold";

export const useHousehold = () => {
    const household = useState<HouseHold | null>("household", () => null);
    return household;
};