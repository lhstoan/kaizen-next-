import ErrorScreen from "@/components/error-screen";

export const metadata = {
  title: "404 | KAIZEN BADMINTON",
};

export default function NotFound() {
  return (
    <ErrorScreen
      code="404"
      title="Page not found"
      jp="ページが見つかりません"
      description="The page you are looking for has been moved, renamed, or never existed."
    />
  );
}
