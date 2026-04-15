import { WebsiteModerationView } from "./website-moderation-view";

export function generateStaticParams() {
  return [
    { id: "81" },
    { id: "3044171" },
    { id: "3591353" },
    { id: "2871029" },
    { id: "1982744" },
    { id: "4120588" },
    { id: "5503912" },
  ];
}

export default function WebsiteModerationPage() {
  return <WebsiteModerationView />;
}
