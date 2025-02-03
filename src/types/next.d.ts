import { NextApiRequest } from "next";
import { SteamProfile } from "@/";

declare module "next" {
  interface NextApiRequest {
    user?: SteamProfile;
  }
}
