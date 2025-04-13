import numpy as np
import pandas as pd

class CustomKNN:
    def __init__(self, k=3):
        self.k = k
        self.X_train = None
        self.y_train = None

    def fit(self, X_train, y_train):
        self.X_train = X_train
        self.y_train = y_train

    def _euclidean_distance(self, point1, point2):
        """Calculates the Euclidean distance between two points."""
        return np.sqrt(np.sum((point1 - point2) ** 2))

    def _get_k_nearest_neighbors(self, test_point):
        """Finds the k-nearest neighbors of a test point in the training data."""
        distances = [self._euclidean_distance(train_point, test_point) for train_point in self.X_train]
        k_nearest_indices = np.argsort(distances)[:self.k]
        k_nearest_labels = self.y_train.iloc[k_nearest_indices]  # Preserving .iloc from your original code
        return k_nearest_labels

    def _predict_label(self, neighbors):
        """Predicts the label of a test point based on its k-nearest neighbors."""
        labels, counts = np.unique(neighbors, return_counts=True)
        return labels[np.argmax(counts)]

    def predict(self, X_test):
        """Predicts labels for all test points in X_test using KNN."""
        return [self._predict_label(self._get_k_nearest_neighbors(test_point)) for test_point in X_test]