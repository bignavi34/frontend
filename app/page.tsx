// app/page.tsx
"use client";
import { useState, ChangeEvent, FormEvent } from 'react';

interface PredictionResult {
  prediction: number | object;
  probability?: number;
  details?: object;
}

export default function Home() {
  const [inputValues, setInputValues] = useState<string[]>(Array(30).fill(''));
  const [predictionResult, setPredictionResult] = useState<PredictionResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (index: number, value: string) => {
    const newInputValues = [...inputValues];
    newInputValues[index] = value;
    setInputValues(newInputValues);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const numericValues = inputValues.map(val => parseFloat(val));

    if (numericValues.some(isNaN)) {
      setError("All fields must contain valid numbers");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('https://cancer-web-production.up.railway.app/predict/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input_data: numericValues
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data: PredictionResult = await response.json();
      setPredictionResult(data);
    } catch (err) {
      setError((err as Error).message || 'An error occurred while making the prediction');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setInputValues(Array(30).fill(''));
    setPredictionResult(null);
    setError(null);
  };

  const handleFillSample = () => {
    setInputValues([
      13.54,14.36,87.46,566.3,0.09779,0.08129,0.06664,0.04781,0.1885,0.05766,0.2699,0.7886,2.058,23.56,0.008462,0.0146,0.02387,0.01315,0.0198,0.0023,
      15.11,19.26,99.7,711.2,0.144,0.1773,0.239,0.1288,0.2977,0.07259
    ]);
  };

  interface InputFieldProps {
    label: string;
    value: string;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  }

  const InputField = ({ label, value, onChange }: InputFieldProps) => {
    return (
      <div className="mb-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
        <input
          type="text"
          value={value}
          onChange={onChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter value"
        />
      </div>
    );
  };

  interface ResultDisplayProps {
    result: PredictionResult;
  }

  const ResultDisplay = ({ result }: ResultDisplayProps) => {
    // For debugging - log the raw result
    console.log("Raw prediction result:", result);

    return (
      <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-green-500">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Prediction Results</h2>

        {/* Add this section to show raw response data */}
        <div className="mb-4 p-3 bg-gray-100 rounded-lg">
          <pre className="text-sm overflow-x-auto whitespace-pre-wrap break-words">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>

       

        {result.details && (
          <div className="mt-4">
            <h3 className="text-lg font-medium mb-2 text-gray-700">Additional Details</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <pre className="text-sm overflow-x-auto">
                {JSON.stringify(result.details, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <main className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-blue-600 mb-2">Prediction Model Interface</h1>
          <p className="text-gray-600">Enter your data points to get a prediction</p>
        </header>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700">
            <p>{error}</p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <form onSubmit={handleSubmit}>
            <div className="mb-4 flex justify-end space-x-4">
              <button
                type="button"
                onClick={handleFillSample}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
              >
                Fill Sample Data
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
              >
                Reset
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {inputValues.map((value, index) => (
                <InputField
                  key={index}
                  label={`Feature ${index + 1}`}
                  value={value}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                />
              ))}
            </div>

            <div className="mt-6 flex justify-center">
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50"
              >
                {isLoading ? 'Processing...' : 'Get Prediction'}
              </button>
            </div>
          </form>
        </div>

        {predictionResult && (
          <ResultDisplay result={predictionResult} />
        )}
      </div>
    </main>
  );
}
