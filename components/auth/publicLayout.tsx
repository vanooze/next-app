interface Props {
  children: React.ReactNode;
}

export const PublicLayoutWrapper = ({ children }: Props) => {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-xl mx-auto bg-white rounded-xl shadow p-6">
        <h1 className="text-2xl font-bold mb-4">Upload File</h1>
        {children}
      </div>
    </div>
  );
};
