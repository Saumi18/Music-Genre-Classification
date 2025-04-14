#  Music Genre Classification

##  How to use Web Demo
1. Clone the GitHub repository to your local machine.
2. Run: python -m venv venv to create a virtual environment.
3. Run: Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process to allow script execution in PowerShell.
4. Activate the virtual environment: .\venv\Scripts\activate
5. Once activated, you will see the environment name on your terminal prompt.
6. Install dependencies: pip install -r requirements.txt
7. Run the web app using: python Web_Demo/app.py
8. Open the server address displayed in the terminal (default: http://127.0.0.1:5000).

This project classifies music tracks into genres using machine learning techniques. It uses the GTZAN dataset and extracts meaningful audio features to train classifiers like SVM, Random Forest, KNN, and Neural Networks.

##  Dataset

We use the [GTZAN dataset](http://marsyas.info/downloads/datasets.html), which contains:
- 1000 audio tracks (30 seconds each)
- 10 genres: Blues, Classical, Country, Disco, Hip-hop, Jazz, Metal, Pop, Reggae, Rock

##  Feature Extraction

Using the `librosa` library, we extract:
- **MFCC (Mel Frequency Cepstral Coefficients)**
- **Chroma Frequencies**
- **Spectral Contrast**
- **Tonnetz**

These features capture timbre, harmony, and rhythmic properties of audio.

##  Models Used

We experiment with multiple models:
- Support Vector Machine (SVM)
- Random Forest
- K-Nearest Neighbors (KNN)
- Neural Networks

Model performance is evaluated using accuracy scores and confusion matrices.

##  How to Run

### 1. Install Dependencies

```bash
pip install numpy pandas matplotlib seaborn librosa scikit-learn
```

### 2. Clone the Repository
```bash
git clone https://github.com/Saumi18/Music-Genre-Classification.git
cd Music-Genre-Classification
```

### 3. Run the Notebook
```bash
jupyter notebook Music_Genre_Classification.ipynb
```
Run all cells step-by-step to see feature extraction, model training, and evaluation.

## Output:
The notebook includes:

Feature visualizations

Confusion matrices

Accuracy scores

Classification reports

## Future Work:
Add deep learning models (CNN on spectrograms)

Web interface for genre prediction

Real-time genre classification
