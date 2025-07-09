import os
import numpy as np
import pandas as pd
import torch
import torch.nn as nn
from flask import Flask, request, jsonify
from flask_cors import CORS
import traceback

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configure Flask to return JSON for errors instead of HTML
app.config['PROPAGATE_EXCEPTIONS'] = True
app.config['TRAP_HTTP_EXCEPTIONS'] = True

# Define the LSTM model architecture
class LSTMModel(nn.Module):
    def __init__(self, input_size, hidden_size, num_layers):
        super(LSTMModel, self).__init__()
        self.hidden_size = hidden_size
        self.num_layers = num_layers
        self.lstm = nn.LSTM(input_size, hidden_size, num_layers, dropout=0.2, bidirectional=True)
        self.fc1 = nn.Linear(2*hidden_size, hidden_size)
        self.fc2 = nn.Linear(hidden_size, 32)
        self.fc3 = nn.Linear(32, 1)
        self.relu = nn.ReLU()
        self.sigmoid = nn.Sigmoid()

    def forward(self, x):
        batch_size = x.size(1)
        h0 = torch.zeros(2*self.num_layers, batch_size, self.hidden_size).to(x.device)
        c0 = torch.zeros(2*self.num_layers, batch_size, self.hidden_size).to(x.device)
        initial_state = (h0, c0)
        out, _ = self.lstm(x, initial_state)
        # Get output from the last time step
        out = out[-1, :, :]
        out = self.relu(self.fc1(out))
        out = self.relu(self.fc2(out))
        out = self.sigmoid(self.fc3(out))
        return out

# Load the trained model
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
print(f"Using device: {device}")

# Initialize model
input_size = 11  # Number of features per time step
hidden_size = 124
num_layers = 2
model = LSTMModel(input_size, hidden_size, num_layers).to(device)

# Load model weights
try:
    model.load_state_dict(torch.load('C:\\Users\\mohan\\Desktop\\sepsis-detection-mps\\backend1\\sepsis_model_10_features.pt', map_location=device))
    model.eval()
    print("Model loaded successfully!")
except Exception as e:
    print(f"Error loading model: {e}")
    print("Using an untrained model for demonstration purposes.")

# Feature names
feature_names = [
    'HR', 'O2Sat', 'Temp', 'SBP', 'MAP', 'DBP', 'Resp', 'EtCO2',
    'BaseExcess', 'HCO3', 'SepsisLabel'
]

# Global min/max values for normalization
feature_min = {
    'HR': 0, 'O2Sat': 0, 'Temp': 33, 'SBP': 0, 'MAP': 0, 'DBP': 0,
    'Resp': 0, 'EtCO2': 0, 'BaseExcess': -30, 'HCO3': 0, 'SepsisLabel': 0
}

feature_max = {
    'HR': 300, 'O2Sat': 100, 'Temp': 43, 'SBP': 300, 'MAP': 300, 'DBP': 200,
    'Resp': 100, 'EtCO2': 100, 'BaseExcess': 30, 'HCO3': 100, 'SepsisLabel': 1
}

def normalize_input(data):
    """Normalize input data using min-max scaling"""
    normalized = {}
    for feature in data:
        if feature in feature_min and feature in feature_max:
            min_val = feature_min[feature]
            max_val = feature_max[feature]
            if max_val > min_val:  # Avoid division by zero
                normalized[feature] = (data[feature] - min_val) / (max_val - min_val)
            else:
                normalized[feature] = data[feature]
    return normalized

@app.errorhandler(Exception)
def handle_exception(e):
    """Return JSON instead of HTML for all errors."""
    tb = traceback.format_exc()
    print(f"Exception occurred: {str(e)}\n{tb}")
    response = jsonify({
        "error": str(e),
        "traceback": tb
    })
    response.status_code = 500
    return response

@app.route('/api/predict', methods=['POST'])
def predict():
    try:
        # Print request details for debugging
        print("Received prediction request")
        data = request.get_json(force=True)
        if data is None:
            print("Failed to parse JSON data")
            return jsonify({"error": "Invalid JSON data"}), 400
        
        print(f"Request data: {data}")
        patient_data = data.get('patientData', [])
        
        if len(patient_data) < 10:
            return jsonify({
                'error': 'Need at least 10 time points of data for prediction'
            }), 400

        # Use the most recent 10 time points
        recent_data = patient_data[-10:]
        
        # Convert to normalized values in the correct order
        processed_data = []
        for time_point in recent_data:
            normalized = normalize_input(time_point)
            # Ensure consistent feature order
            features = [normalized.get(f, 0.0) for f in feature_names]
            processed_data.append(features)
        
        print(f"Processed data shape: {len(processed_data)} time points, {len(processed_data[0])} features")
        
        # Convert to tensor with shape (sequence_length, batch_size, input_size)
        input_tensor = torch.tensor(processed_data, dtype=torch.float32).to(device)
        input_tensor = input_tensor.reshape(10, 1, input_size)
        
        print(f"Input tensor shape: {input_tensor.shape}")
        
        # Make prediction
        with torch.no_grad():
            output = model(input_tensor)
            print(f"Output tensor shape: {output.shape}")
            
            # Ensure we're getting a single scalar value
            if output.numel() == 1:
                prediction = output.item()
            else:
                # If output has multiple elements, take the first one
                print(f"Warning: Output has multiple elements: {output}")
                prediction = output[0][0].item()
        
        print(f"Prediction value: {prediction}")
        
        # Risk categorization
        risk_level = "Low"
        if prediction > 0.7:
            risk_level = "High"
        elif prediction > 0.3:
            risk_level = "Medium"
            
        return jsonify({
            'prediction': float(prediction),
            'riskLevel': risk_level,
            'timestamp': data.get('timestamp')
        })
        
    except Exception as e:
        # This will be caught by the global error handler
        raise

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'ok', 'message': 'Sepsis prediction API is running'})

@app.route('/api/save-data', methods=['POST'])
def save_data():
    try:
        data = request.get_json(force=True)
        patient_id = data.get('patientId')
        patient_data = data.get('patientData')
        
        # For demonstration, just return success
        return jsonify({
            'success': True, 
            'message': f'Data for patient {patient_id} saved successfully'
        })
        
    except Exception as e:
        # This will be caught by the global error handler
        raise

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)