import Image from "next/image";

const PostaMobileFooter = () => {
  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-primary py-4 px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <p className="text-primary-foreground/90 text-sm ">
          © 2025 Posta. All rights reserved.
        </p>

        <div className="text-primary-foreground/90 text-sm ">
          <Image
            src="/images/posta-logo.png"
            alt="Posta logo"
            className="object-contain"
            width={60}
            height={60}
          />
        </div>
      </div>
    </footer>
  );
};

export default PostaMobileFooter;
