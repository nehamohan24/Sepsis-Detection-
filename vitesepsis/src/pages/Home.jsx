export default function Home() {
    return (
      <div className="text-center space-y-6">
        <h2 className="text-4xl font-bold text-blue-700">Welcome to SepsisPredict</h2>
        <p className="text-lg text-gray-600">
          Our mission is to enable early detection of sepsis using intelligent machine learning models.
        </p>
        <img
          src="/sepsis-illustration.png"
          alt="Sepsis illustration"
          className="mx-auto rounded-2xl shadow-md w-2/3"
        />
      </div>
    );
  }
  