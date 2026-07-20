import { redirect } from "next/navigation";

export default function EarningsPage() {
  redirect("/wallet?tab=earnings");
}
