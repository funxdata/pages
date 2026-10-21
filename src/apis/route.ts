import { HttpClient } from "./request.ts";

export type RouteItem = {
  path: string;
  url: string;
  title: string;
};

export type RouteGroup = {
  title: string;
  child: RouteItem[];
};

const request = new HttpClient({
  baseURL: "/assets/",
  timeout: 3000,
});

export const get_router_info = () => request.get<RouteGroup[]>("router.json");
