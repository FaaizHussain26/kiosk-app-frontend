export default function FullscreenLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        <p className="text-base font-medium text-muted-foreground">
          Loading, please wait...
        </p>
      </div>
    </div>
  );
}


