import Image from "next/image";

const PostaFooter = () => {
  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-primary py-4 px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <p className="text-primary-foreground/90 text-sm">
          © 2025 Posta. All rights reserved.
        </p>

        <div className="flex items-center gap-2">
          <Image
            src="/images/posta-logo.png"
            alt="header logo"
            className="w-full h-full object-cover rounded-lg"
            width={60}
            height={60}
          />
        </div>

        <p className="text-primary-foreground/90 text-sm">
          Need help? Ask a staff member
        </p>
      </div>
    </footer>
  );
};

export default PostaFooter;
