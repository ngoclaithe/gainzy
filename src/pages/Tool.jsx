import React, { useState } from 'react';
import { X } from 'lucide-react';

export default function BMICalculator() {
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [bmiResult, setBmiResult] = useState(null);

  const calculateBMI = () => {
    if (!weight || !height) {
      alert('Vui lòng nhập đầy đủ cân nặng và chiều cao');
      return;
    }

    const w = parseFloat(weight);
    const h = parseFloat(height) / 100; 
    const bmi = w / (h * h);
    
    let category = '';
    let categoryColor = '';
    let markerPosition = 0;
    
    if (bmi < 18.5) {
      category = 'Thiếu cân';
      categoryColor = 'text-blue-500';
      markerPosition = (bmi / 18.5) * 18;
    } else if (bmi >= 18.5 && bmi < 25) {
      category = 'Bình thường';
      categoryColor = 'text-green-500';
      markerPosition = 18 + ((bmi - 18.5) / (25 - 18.5)) * 18;
    } else if (bmi >= 25 && bmi < 30) {
      category = 'Thừa cân';
      categoryColor = 'text-yellow-500';
      markerPosition = 36 + ((bmi - 25) / (30 - 25)) * 18;
    } else if (bmi >= 30 && bmi < 35) {
      category = 'Béo phì độ I';
      categoryColor = 'text-orange-500';
      markerPosition = 54 + ((bmi - 30) / (35 - 30)) * 18;
    } else if (bmi >= 35 && bmi < 40) {
      category = 'Béo phì độ II';
      categoryColor = 'text-red-500';
      markerPosition = 72 + ((bmi - 35) / (40 - 35)) * 18;
    } else {
      category = 'Béo phì độ III';
      categoryColor = 'text-red-700';
      markerPosition = 90;
    }

    const idealWeight = 22 * (h * h);
    const minWeight = 18.5 * (h * h);
    const maxWeight = 24.9 * (h * h);

    setBmiResult({
      bmi: bmi.toFixed(1),
      category,
      categoryColor,
      markerPosition,
      idealWeight: idealWeight.toFixed(1),
      minWeight: minWeight.toFixed(1),
      maxWeight: maxWeight.toFixed(1)
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Công cụ tính BMI Online
          </h1>
          <p className="text-gray-600 text-lg">
            Tính chỉ số khối cơ thể của bạn nhanh chóng và chính xác
          </p>
        </div>

        {/* Calculator Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-12">
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-gray-700 font-semibold mb-3 text-lg">
                Cân nặng (kg)
              </label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="Nhập cân nặng..."
                className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 text-lg transition-all"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-3 text-lg">
                Chiều cao (cm)
              </label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="Nhập chiều cao..."
                className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 text-lg transition-all"
              />
            </div>
          </div>
          
          <button
            onClick={calculateBMI}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-4 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105 text-lg shadow-lg"
          >
            Tính BMI
          </button>
        </div>

        {/* Info Section */}
        <div className="bg-white rounded-3xl shadow-xl p-8 space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">BMI LÀ GÌ?</h2>
            <p className="text-gray-600 leading-relaxed">
              BMI (Chỉ số khối cơ thể) là phép tính đơn giản ước tính lượng mỡ trong cơ thể dựa trên chiều cao và cân nặng. Đây là công cụ được sử dụng rộng rãi để đánh giá xem một người có bị thiếu cân, thừa cân hay béo phì hay không.
            </p>
            <div className="mt-4 bg-blue-50 p-4 rounded-xl">
              <p className="font-semibold text-gray-700">Công thức:</p>
              <p className="text-lg text-blue-600 font-mono">BMI = Cân nặng (kg) / (Chiều cao (m))²</p>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">CHẨN ĐOÁN CÁC TÌNH TRẠNG CÂN NẶNG</h2>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <span className="font-semibold">Thiếu cân</span>
                <span className="text-blue-600 font-bold">Dưới 18,5</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="font-semibold">Bình thường</span>
                <span className="text-green-600 font-bold">18,5 - 24,9</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <span className="font-semibold">Thừa cân</span>
                <span className="text-yellow-600 font-bold">25 - 29,9</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <span className="font-semibold">Béo phì độ I</span>
                <span className="text-orange-600 font-bold">30 - 34,9</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <span className="font-semibold">Béo phì độ II</span>
                <span className="text-red-500 font-bold">35 - 39,9</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-red-100 rounded-lg">
                <span className="font-semibold">Béo phì độ III</span>
                <span className="text-red-700 font-bold">Trên 40</span>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">LỢI ÍCH CỦA VIỆC DUY TRÌ BMI KHỎE MẠNH</h2>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Giúp giảm đau khớp</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Có nhiều năng lượng hơn, năng động hơn</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Cải thiện huyết áp</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Giảm hoàn toàn gánh nặng cho tim và hệ thống tuần hoàn</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Giảm nguy cơ mắc các bệnh mãn tính như bệnh tim, ung thư</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && bmiResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-red-600">KẾT QUẢ BMI</h2>
                <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                  <X size={28} />
                </button>
              </div>

              <div className="text-center mb-8">
                <h3 className="text-xl font-semibold text-gray-700 mb-2">BMI HIỆN TẠI CỦA BẠN</h3>
                <div className="text-6xl font-bold text-red-600 mb-6">{bmiResult.bmi}</div>
                
                {/* BMI Scale */}
                <div className="relative mb-4">
                  <div className="flex h-3 rounded-full overflow-hidden">
                    <div className="bg-blue-400" style={{width: '18%'}}></div>
                    <div className="bg-green-400" style={{width: '18%'}}></div>
                    <div className="bg-blue-500" style={{width: '18%'}}></div>
                    <div className="bg-yellow-400" style={{width: '18%'}}></div>
                    <div className="bg-orange-500" style={{width: '18%'}}></div>
                    <div className="bg-red-600" style={{width: '10%'}}></div>
                  </div>
                  <div 
                    className="absolute top-0 transform -translate-x-1/2 -translate-y-1"
                    style={{left: `${bmiResult.markerPosition}%`}}
                  >
                    <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-gray-700"></div>
                  </div>
                </div>
                
                <div className={`text-xl font-bold mb-8 ${bmiResult.categoryColor}`}>
                  {bmiResult.category}
                  <div className="text-sm text-gray-600 mt-1">18.5 - 24.9</div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-gray-50 rounded-xl p-6">
                  <h4 className="text-center font-bold text-gray-700 mb-3">CÂN NẶNG LÝ TƯỞNG CỦA BẠN</h4>
                  <div className="text-5xl font-bold text-red-600 text-center">{bmiResult.idealWeight}</div>
                </div>

                <div className="bg-gray-50 rounded-xl p-6">
                  <h4 className="text-center font-bold text-gray-700 mb-3">CÂN NẶNG TỐI THIỂU CỦA BẠN</h4>
                  <div className="text-5xl font-bold text-red-600 text-center">{bmiResult.minWeight}</div>
                </div>

                <div className="bg-gray-50 rounded-xl p-6">
                  <h4 className="text-center font-bold text-gray-700 mb-3">CÂN NẶNG TỐI ĐA CỦA BẠN</h4>
                  <div className="text-5xl font-bold text-red-600 text-center">{bmiResult.maxWeight}</div>
                </div>
              </div>

              <button
                onClick={closeModal}
                className="w-full mt-8 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-4 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}