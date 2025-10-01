import Image from 'next/image';

interface PageHeaderProps {
  title: string;
  description: string;
  showLogo?: boolean;
}

export default function PageHeader({ title, description, showLogo = false }: PageHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-4">
        {showLogo && (
          <Image
            src="/nsbe_logo.png"
            alt="Logo"
            width={60}
            height={60}
          />
        )}
        <h1 className="text-3xl font-bold text-gray-800">
          {title}
        </h1>
      </div>
      <p className="text-gray-600 mt-2">
        {description}
      </p>
    </div>
  );
}