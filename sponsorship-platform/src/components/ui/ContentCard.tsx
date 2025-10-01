interface ContentCardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  headerAction?: React.ReactNode;
}

export default function ContentCard({ 
  title, 
  children, 
  className = "", 
  headerAction 
}: ContentCardProps) {
  return (
    <div className={`dashboard-card ${className}`}>
      {title && (
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
          {headerAction}
        </div>
      )}
      {children}
    </div>
  );
}