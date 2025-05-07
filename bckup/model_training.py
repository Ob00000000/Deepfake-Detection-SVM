from sklearn.model_selection import train_test_split
from sklearn.svm import SVC
from sklearn.metrics import classification_report
import joblib

def train_model(X, y):
    """
    Trains an SVM model on the extracted features.

    Parameters:
        X (numpy.ndarray): Feature matrix.
        y (numpy.ndarray): Labels.

    Returns:
        sklearn.svm.SVC: Trained SVM model.
    """
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    model = SVC(kernel='linear', probability=True)
    model.fit(X_train, y_train)

    # Evaluate the model
    y_pred = model.predict(X_test)
    print("Classification Report:\n", classification_report(y_test, y_pred))

    return model
