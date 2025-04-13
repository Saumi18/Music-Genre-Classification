from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from models import CustomKNN, ImprovedANN
import os
import librosa
import numpy as np
import pandas as pd
import joblib

app = Flask(__name__)
CORS(app)
app.config['UPLOAD_FOLDER'] = 'uploads'

# Ensure upload folder exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Load model, scaler, and label encoder
bundle = joblib.load('Web_Demo/models/ann_model.pkl')
model = bundle['model']
scaler = bundle['scaler']
label_encoder = bundle['label_encoder']

def extract_features(file_path):
    y, sr = librosa.load(file_path, mono=True, duration=30)
    features = []

    # Chroma Short-Time Fourier Transform
    chroma_stft = librosa.feature.chroma_stft(y=y, sr=sr)
    features.append(np.mean(chroma_stft))  # Mean over time frames
    features.append(np.var(chroma_stft))   # Variance over time frames

    # Root Mean Square (RMS)
    rms = librosa.feature.rms(y=y)
    features.append(np.mean(rms))  # Mean over time frames
    features.append(np.var(rms))   # Variance over time frames

    # Spectral Centroid
    spec_centroid = librosa.feature.spectral_centroid(y=y, sr=sr)
    features.append(np.mean(spec_centroid))  # Mean over time frames
    features.append(np.var(spec_centroid))   # Variance over time frames

    # Spectral Bandwidth
    spec_bw = librosa.feature.spectral_bandwidth(y=y, sr=sr)
    features.append(np.mean(spec_bw))  # Mean over time frames
    features.append(np.var(spec_bw))   # Variance over time frames

    # Spectral Roll-off
    rolloff = librosa.feature.spectral_rolloff(y=y, sr=sr)
    features.append(np.mean(rolloff))  # Mean over time frames
    features.append(np.var(rolloff))   # Variance over time frames

    # Zero Crossing Rate
    zcr = librosa.feature.zero_crossing_rate(y)
    features.append(np.mean(zcr))  # Mean over time frames
    features.append(np.var(zcr))   # Variance over time frames

    # Harmonic and Percussive sources
    harm, perc = librosa.effects.hpss(y)
    features.append(np.mean(harm))  # Mean of the harmonic component
    features.append(np.var(harm))   # Variance of the harmonic component
    features.append(np.mean(perc))  # Mean of the percussive component
    features.append(np.var(perc))   # Variance of the percussive component

    # Tempo (beats per minute)
    onset_env = librosa.onset.onset_strength(y=y, sr=sr)
    tempo, _ = librosa.beat.beat_track(onset_envelope=onset_env, sr=sr)
    features.append(tempo)

    # MFCC (Mel-frequency Cepstral Coefficients)
    mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=20)
    for coeff in mfcc:
        features.append(np.mean(coeff))  # Mean over time frames
        features.append(np.var(coeff))   # Variance over time frames

    # Flatten features to ensure all are scalar values
    features_flattened = [np.mean(f) if isinstance(f, np.ndarray) else f for f in features]

    # Convert the features list into a 2D array
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

        prediction_numeric = model.predict(features_scaled)[0]
        prediction_label = label_encoder.inverse_transform([prediction_numeric])[0]
        print("Predicted genre:", prediction_label)

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        os.remove(file_path)

    return jsonify({'genre': prediction_label})

if __name__ == '__main__':
    app.run(debug=True)