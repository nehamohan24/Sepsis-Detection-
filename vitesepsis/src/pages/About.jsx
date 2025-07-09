export default function About() {
    return (
      <div className="space-y-4">
        <h2 className="text-3xl font-bold text-blue-700">About Us</h2>
        <p className="text-gray-700">
          SepsisPredict is built by a team of AI and healthcare enthusiasts dedicated to saving lives through
          early detection. We use cutting-edge LSTM and GRU-D models trained on the PhysioNet 2019 dataset to
          detect signs of sepsis in ICU patients.
        </p>
        <p className="text-gray-700">
          This project was developed by Neha Mohanasundarm, a B.Tech student passionate about AI in healthcare.
        </p>
      </div>
    );
  }
  