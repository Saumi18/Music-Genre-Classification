from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from models import CustomKNN, ImprovedANN
import os
import librosa
import numpy as np
import pandas as pd
import joblib
import torch

app = Flask(__name__)
CORS(app)
app.config['UPLOAD_FOLDER'] = 'uploads'

# Ensure upload folder exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Load KNN model
bundle = joblib.load('models/knn_model.pkl')
knn_model = bundle['model']
scaler = bundle['scaler']
label_encoder = bundle['label_encoder']

# Load ANN model
ann_checkpoint = torch.load("models/ann_model.pth", map_location=torch.device('cpu'))
input_dim = ann_checkpoint['input_dim']
output_dim = ann_checkpoint['output_dim']
ann_model = ImprovedANN(input_dim, output_dim)
ann_model.load_state_dict(ann_checkpoint['model_state_dict'])
ann_model.eval()

def extract_features(file_path):
    y, sr = librosa.load(file_path, mono=True, duration=30)
    features = []

    chroma_stft = librosa.feature.chroma_stft(y=y, sr=sr)
    features.append(np.mean(chroma_stft))
    features.append(np.var(chroma_stft))

    rms = librosa.feature.rms(y=y)
    features.append(np.mean(rms))
    features.append(np.var(rms))

    spec_centroid = librosa.feature.spectral_centroid(y=y, sr=sr)
    features.append(np.mean(spec_centroid))
    features.append(np.var(spec_centroid))

    spec_bw = librosa.feature.spectral_bandwidth(y=y, sr=sr)
    features.append(np.mean(spec_bw))
    features.append(np.var(spec_bw))

    rolloff = librosa.feature.spectral_rolloff(y=y, sr=sr)
    features.append(np.mean(rolloff))
    features.append(np.var(rolloff))

    zcr = librosa.feature.zero_crossing_rate(y)
    features.append(np.mean(zcr))
    features.append(np.var(zcr))

    harm, perc = librosa.effects.hpss(y)
    features.append(np.mean(harm))
    features.append(np.var(harm))
    features.append(np.mean(perc))
    features.append(np.var(perc))

    onset_env = librosa.onset.onset_strength(y=y, sr=sr)
    tempo, _ = librosa.beat.beat_track(onset_envelope=onset_env, sr=sr)
    features.append(tempo)

    mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=20)
    for coeff in mfcc:
        features.append(np.mean(coeff))
        features.append(np.var(coeff))

    features_flattened = [np.mean(f) if isinstance(f, np.ndarray) else f for f in features]
    features_array = np.array(features_flattened).reshape(1, -1)
    return features_array

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    if 'musicFile' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['musicFile']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    model_type = 'ann'      #request.form.get('model_type', 'knn')  'knn' or 'ann'

    file_path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
    file.save(file_path)

    try:
        features = extract_features(file_path)

        feature_names = [
            'chroma_stft_mean', 'chroma_stft_var', 'rms_mean', 'rms_var',
            'spectral_centroid_mean', 'spectral_centroid_var', 'spectral_bandwidth_mean', 'spectral_bandwidth_var',
            'rolloff_mean', 'rolloff_var', 'zero_crossing_rate_mean', 'zero_crossing_rate_var',
            'harmony_mean', 'harmony_var', 'perceptr_mean', 'perceptr_var', 'tempo'
        ]
        for i in range(1, 21):
            feature_names.append(f'mfcc{i}_mean')
            feature_names.append(f'mfcc{i}_var')

        features_df = pd.DataFrame(features, columns=feature_names)
        features_scaled = scaler.transform(features_df)

        if model_type == 'ann':
            # ANN expects tensor input
            with torch.no_grad():
                x_tensor = torch.tensor(features_scaled, dtype=torch.float32)
                output = ann_model(x_tensor)
                prediction_numeric = torch.argmax(output, dim=1).item()
        else:
            # Default to KNN
            prediction_numeric = knn_model.predict(features_scaled)[0]

        prediction_label = label_encoder.inverse_transform([prediction_numeric])[0]
        print("Predicted genre:", prediction_label)

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        os.remove(file_path)

    return jsonify({'genre': prediction_label})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080)