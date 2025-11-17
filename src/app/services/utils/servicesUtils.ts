import { Service } from "@/app/services/types/services";

export const getCategories = (services: Service) => {
  return [
    { id: 1, title: "Services", items: services },
    // { id: 2, title: "Classes", items: classes },
  ];
};
