import { redirect } from "next/navigation";
import facultyData from "@/data/faculty.json";

export default async function FacultyPage({
  params,
}: {
  params: Promise<{ initial: string }>;
}) {
  const { initial } = await params;

  // Find the faculty member by initial
  const faculty = facultyData.find(
    (f) =>
      f.initial.toLowerCase() === initial.toLowerCase() &&
      f.initial &&
      f.position !== "Room"
  );

  if (faculty) {
    redirect(`/desk/${faculty.deskId}?initial=${faculty.initial}`);
  }

  // If not found, redirect to home
  redirect("/");
}
