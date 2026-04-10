import { WebsiteModerationView } from "./website-moderation-view";

export function generateStaticParams() {
  return [
    { id: "81" },
    { id: "WEB#3044171" },
    { id: "WEB#3591353" },
    { id: "WEB#2871029" },
    { id: "WEB#1982744" },
    { id: "WEB#4120588" },
    { id: "WEB#5503912" },
  ];
}

export default function WebsiteModerationPage() {
  return <WebsiteModerationView />;
}
