import TwoFactorForm from "./_components/two-factor-form";

const TwoFactorPage = () => {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md">
        <TwoFactorForm />
      </div>
    </div>
  );
};

export default TwoFactorPage;
