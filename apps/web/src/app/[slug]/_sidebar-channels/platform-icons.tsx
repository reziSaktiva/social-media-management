import {
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaPinterest,
  FaThreads,
  FaTiktok,
  FaXTwitter,
  FaYoutube,
} from "react-icons/fa6";
import type { IconType } from "react-icons";

import { SocialPlatform } from "@social/shared";

/**
 * Mapping platform -> ikon brand (react-icons/fa6) + warna brand asli.
 *
 * ADR-058 poin 6: `react-icons` (fa6) dipilih karena Lucide sengaja tidak
 * menyediakan logo bermerek dagang. Warna di sini adalah warna brand resmi
 * tiap platform (bukan token Astryx) — pengecualian yang disengaja per
 * ADR-058 poin 10 ("warna brand tidak berubah"), sama seperti alasan
 * kenapa react-icons dipakai sama sekali.
 */
export const PLATFORM_ICON: Record<
  SocialPlatform,
  { Icon: IconType; color: string; label: string }
> = {
  [SocialPlatform.Instagram]: {
    Icon: FaInstagram,
    color: "#E4405F",
    label: "Instagram",
  },
  [SocialPlatform.Facebook]: {
    Icon: FaFacebook,
    color: "#1877F2",
    label: "Facebook",
  },
  [SocialPlatform.Twitter]: {
    Icon: FaXTwitter,
    color: "#000000",
    label: "X (Twitter)",
  },
  [SocialPlatform.LinkedIn]: {
    Icon: FaLinkedin,
    color: "#0A66C2",
    label: "LinkedIn",
  },
  [SocialPlatform.TikTok]: {
    Icon: FaTiktok,
    color: "#000000",
    label: "TikTok",
  },
  [SocialPlatform.YouTube]: {
    Icon: FaYoutube,
    color: "#FF0000",
    label: "YouTube",
  },
  [SocialPlatform.Threads]: {
    Icon: FaThreads,
    color: "#000000",
    label: "Threads",
  },
  [SocialPlatform.Pinterest]: {
    Icon: FaPinterest,
    color: "#E60023",
    label: "Pinterest",
  },
};
